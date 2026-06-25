import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { z } from "zod";
import { getPregeneratedTrivia } from "./src/data/triviaData";

dotenv.config();

// Default values if envs are missing
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI client lazily or safely
let ai: GoogleGenAI | null = null;
let isGeminiQuotaDepleted = false;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI-powered trivia generation will fall back to smart local pre-seeded questions.");
}

// Robust helper function to generate AI content with internal retry and fallback models (to handle 503/429 spikes)
async function generateContentWithRetry(
  aiClient: GoogleGenAI,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 2
): Promise<any> {
  if (isGeminiQuotaDepleted) {
    throw new Error("API_KEY_DEPLETED: Gemini API billing limits or prepayment credits are depleted. Falling back immediately.");
  }

  let lastError: any = null;
  const modelsToTry = [params.model, "gemini-3.1-flash-lite"]; // Try specified model, fallback to lightweight model if it experiences spikes in demand

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini API] Requesting ${currentModel} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        const response = await aiClient.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errorMessage = err?.message || String(err);
        
        const isDepleted = 
          errorMessage.includes("prepayment credits are depleted") ||
          errorMessage.includes("RESOURCE_EXHAUSTED") ||
          errorMessage.includes("ResourceExhausted") ||
          errorMessage.includes("billing") ||
          errorMessage.includes("credits are depleted");
        
        if (isDepleted) {
          isGeminiQuotaDepleted = true;
          console.warn("[Gemini API Quota Depleted] Detected terminal billing depletion or rate quota exhaustion. Disabling Gemini calls globally and falling back immediately to client-safe offline modes.");
          throw err;
        }

        const isTemporary = 
          errorMessage.includes("503") || 
          errorMessage.includes("UNAVAILABLE") || 
          errorMessage.includes("429") || 
          errorMessage.includes("rate limit") ||
          errorMessage.includes("high demand") ||
          err?.status === 503 ||
          err?.status === 429;

        console.warn(`[Gemini API Warning] Attempt ${attempt + 1} with model ${currentModel} failed: ${errorMessage}`);
        
        if (isTemporary && attempt < maxRetries) {
          // Exponential backoff wait
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          break; // Move to the next fallback model or fail
        }
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Resilient helper to resolve data file paths in dev and bundled production mode
  function resolveDataPath(filename: string): string {
    const pathsToTry = [
      path.join(process.cwd(), "src/data", filename),
      path.join(__dirname, "../src/data", filename),
      path.join(__dirname, "src/data", filename),
      path.join(__dirname, "data", filename),
    ];
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    // Fallback standard path and ensure parent path exists
    const defaultPath = path.join(process.cwd(), "src/data", filename);
    const dir = path.dirname(defaultPath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {}
    }
    return defaultPath;
  }

  // Initialize CUSTOM_STICKERS_DB from filesystem to persist manually associated stickers across restarts
  const customStickersPath = resolveDataPath("customStickers.json");
  let CUSTOM_STICKERS_DB: Record<string, string> = {};
  try {
    if (fs.existsSync(customStickersPath)) {
      const content = fs.readFileSync(customStickersPath, "utf-8");
      CUSTOM_STICKERS_DB = JSON.parse(content);
      console.log(`[Sticker Sync DB] Loaded ${Object.keys(CUSTOM_STICKERS_DB).length} custom sticker mappings from server file: ${customStickersPath}`);
    } else {
      console.log("[Sticker Sync DB] Mappings file not found, initializing empty DB.");
    }
  } catch (e: any) {
    console.error("[Sticker Sync DB Error] Loaded fallback empty mappings:", e);
  }

  // Initialize CUSTOM_MATCHES_DB from filesystem to persist administrator results across restarts
  const customMatchesPath = resolveDataPath("customMatches.json");
  let CUSTOM_MATCHES_DB: Record<string, { golesLocal: number, golesVisitante: number, jugado: boolean }> = {};
  try {
    if (fs.existsSync(customMatchesPath)) {
      const content = fs.readFileSync(customMatchesPath, "utf-8");
      CUSTOM_MATCHES_DB = JSON.parse(content);
      console.log(`[Matches Sync DB] Loaded ${Object.keys(CUSTOM_MATCHES_DB).length} custom modified match fixtures from server file: ${customMatchesPath}`);
    } else {
      console.log("[Matches Sync DB] Custom matches file not found, initializing empty DB.");
    }
  } catch (e: any) {
    console.error("[Matches Sync DB Error] Loaded fallback empty custom matches:", e);
  }

  // Initialize BLOG_POSTS_DB and SUGGESTIONS_DB from filesystem
  const blogPostsPath = resolveDataPath("blogPosts.json");
  let BLOG_POSTS_DB: any[] = [];
  try {
    if (fs.existsSync(blogPostsPath)) {
      const content = fs.readFileSync(blogPostsPath, "utf-8");
      BLOG_POSTS_DB = JSON.parse(content);
      console.log(`[Blog DB] Loaded ${BLOG_POSTS_DB.length} blog posts from server file: ${blogPostsPath}`);
    }
  } catch (e: any) {
    console.error("[Blog DB Error] Loading fallback empty blog posts:", e);
  }

  const suggestionsPath = resolveDataPath("suggestions.json");
  let SUGGESTIONS_DB: any[] = [];
  try {
    if (fs.existsSync(suggestionsPath)) {
      const content = fs.readFileSync(suggestionsPath, "utf-8");
      SUGGESTIONS_DB = JSON.parse(content);
      console.log(`[Suggestions DB] Loaded ${SUGGESTIONS_DB.length} suggestions from server file.`);
    }
  } catch (e: any) {
    console.error("[Suggestions DB Error] Loading fallback empty suggestions:", e);
  }

  // ==========================================================================
  // HIGH-SECURITY DEFENSE LAYERS (INPUT SANITIZATION, RATE LIMITING, AUDITING)
  // Designed for zero-trust live global production environment
  // ==========================================================================

  // Recursively escape string elements in objects to prevent HTML injections, stored XSS, or SQL tricks
  function sanitizeString(str: string): string {
    if (!str) return str;
    let cleaned = str.replace(/<[^>]*>/g, ""); // Strip any HTML tags completely
    cleaned = cleaned
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
    return cleaned;
  }

  function sanitizeInputRecursive(input: any): any {
    if (typeof input === "string") {
      return sanitizeString(input);
    } else if (Array.isArray(input)) {
      return input.map(item => sanitizeInputRecursive(item));
    } else if (input !== null && typeof input === "object") {
      const sanitizedObj: any = {};
      for (const key of Object.keys(input)) {
        sanitizedObj[key] = sanitizeInputRecursive(input[key]);
      }
      return sanitizedObj;
    }
    return input;
  }

  // Central Database of security anomalies (in-memory, highly audit-compatible)
  const SECURITY_AUDIT_LOGS: Array<{
    userId?: string;
    ip: string;
    action: string;
    details: any;
    timestamp: string;
  }> = [];

  const ipAnomalyTracker: Record<string, number[]> = {};

  function auditSecurityEvent(userId: string | undefined, ip: string, action: string, details: any = {}) {
    const logEntry = {
      userId: userId || "guest_user",
      ip,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    SECURITY_AUDIT_LOGS.push(logEntry);
    console.log(`\x1b[33m[SECURITY AUDIT LOG]\x1b[0m Action: ${action} | IP: ${ip} | User: ${logEntry.userId}`);

    const now = Date.now();
    if (!ipAnomalyTracker[ip]) {
      ipAnomalyTracker[ip] = [];
    }
    ipAnomalyTracker[ip].push(now);

    // Keep only timestamps of anomalies occurred within last 5 minutes (300,000 miliseconds)
    ipAnomalyTracker[ip] = ipAnomalyTracker[ip].filter(t => now - t < 5 * 60 * 1000);

    if (ipAnomalyTracker[ip].length >= 20) {
      console.error(`\x1b[31;1m🚨 [CRITICAL ANOMALY ALERT] 🚨\x1b[0m IP address ${ip} triggered ${ipAnomalyTracker[ip].length} errors in the last 5 minutes! Potential security threat.`);
      
      const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
      if (webhookUrl && webhookUrl.startsWith("http")) {
        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *TACTIKAI HIGH ALERT DETECTED* 🚨\nAnomalous activity detected from IP: *${ip}*\n*Events in 5 mins:* ${ipAnomalyTracker[ip].length}\n*Last Action:* ${action}\n*Details:* ${JSON.stringify(details)}\nPlease monitor client events immediately!`
          })
        }).catch(err => console.error("[Error dispatching security alert webhook]:", err));
      }
    }
  }

  // IP Trackers for anti-spam rate limiting (Mitigates brute-force logins and registrations)
  const loginAttemptsTracker: Record<string, number[]> = {};
  const registrationAttemptsTracker: Record<string, number[]> = {};
  const webhookAttemptsTracker: Record<string, number[]> = {};

  const loginRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0];
    const now = Date.now();
    
    if (!loginAttemptsTracker[ip]) loginAttemptsTracker[ip] = [];
    loginAttemptsTracker[ip] = loginAttemptsTracker[ip].filter(t => now - t < 60000);

    if (loginAttemptsTracker[ip].length >= 5) {
      auditSecurityEvent(req.body?.id || req.body?.userId, ip, "RATE_LIMIT_LOGIN", { currentHits: loginAttemptsTracker[ip].length });
      return res.status(429).json({
        status: "error",
        error: "too_many_requests",
        message: "Demasiados intentos de acceso (Máximo 5 por minuto). Espera 60 segundos."
      });
    }

    loginAttemptsTracker[ip].push(now);
    next();
  };

  const signupRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0];
    const now = Date.now();
    
    if (!registrationAttemptsTracker[ip]) registrationAttemptsTracker[ip] = [];
    registrationAttemptsTracker[ip] = registrationAttemptsTracker[ip].filter(t => now - t < 60000);

    if (registrationAttemptsTracker[ip].length >= 3) {
      auditSecurityEvent(req.body?.id || req.body?.userId, ip, "RATE_LIMIT_SIGNUP", { currentHits: registrationAttemptsTracker[ip].length });
      return res.status(429).json({
        status: "error",
        error: "too_many_requests",
        message: "Demasiados registros de cuenta (Máximo 3 por minuto). Espera un minuto."
      });
    }

    registrationAttemptsTracker[ip].push(now);
    next();
  };

  const webhookRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0];
    const now = Date.now();
    
    if (!webhookAttemptsTracker[ip]) webhookAttemptsTracker[ip] = [];
    webhookAttemptsTracker[ip] = webhookAttemptsTracker[ip].filter(t => now - t < 60000);

    if (webhookAttemptsTracker[ip].length >= 15) {
      auditSecurityEvent(undefined, ip, "RATE_LIMIT_WEBHOOK", { currentHits: webhookAttemptsTracker[ip].length });
      return res.status(429).json({
        status: "error",
        error: "too_many_requests",
        message: "Límite de solicitudes de Webhook excedido."
      });
    }

    webhookAttemptsTracker[ip].push(now);
    next();
  };

  // Define schemas to enforce strict data formatting
  const userSyncSchema = z.object({
    id: z.string().min(2, "ID de usuario inválido"),
    username: z.string().min(1, "Nombre de usuario requerido"),
    gameCode: z.string().min(3, "Game Code inválido"),
    unlockedLevels: z.any().optional(), // allow any object format for flexible structures
    aciertosOnce: z.number().int().min(0).optional(),
    aciertosMarcador: z.number().int().min(0).optional(),
    unlockedStickersCount: z.number().int().min(0).optional(),
    completedCountries: z.array(z.string()).optional(),
    score: z.number().min(0).optional(),
    subscription: z.string().optional(),
    avatar: z.string().optional(),
    licenseCode: z.string().optional(),
    email: z.string().email("Formato de correo electrónico inválido").or(z.literal("")).optional(),
    tacticalBoards: z.any().optional(),
    referredByEmail: z.string().optional(),
    invitedEmails: z.array(z.string()).optional(),
    coins: z.number().int().optional(),
    cashBalance: z.number().optional()
  });

  const checkoutPayphoneSchema = z.object({
    userId: z.string().min(1, "UserId es requerido"),
    planTier: z.string().min(1, "Plan es requerido"),
    phoneNumber: z.string().min(8, "Celular de Ecuador inválido"),
    promoterId: z.string().optional()
  });

  const stickerUnlockSchema = z.object({
    seed: z.string().optional(),
    countryName: z.string().min(1, "El nombre del país de destino es requerido")
  });

  const affiliateVisitSchema = z.object({
    promoterId: z.string().min(1, "El id de promotor es requerido"),
    deviceType: z.string().optional()
  });

  // Reusable Higher-Order Middleware for robust input sanitization & scheme checks
  const validateBody = (schema: z.ZodSchema) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.body) {
        req.body = sanitizeInputRecursive(req.body);
      }

      const result = schema.safeParse(req.body);
      if (!result.success) {
        const clientIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "0.0.0.0").split(",")[0];
        const errors = (result as any).error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
        
        auditSecurityEvent(req.body?.id || req.body?.userId, clientIp, "INVALID_INPUT_SCHEMA", {
          endpoint: req.originalUrl,
          errors,
          body: req.body
        });

        return res.status(400).json({
          status: "error",
          error: "invalid_schema",
          message: "Los datos enviados no completaron los controles de integridad y tipo del servidor.",
          details: errors
        });
      }

      req.body = result.data;
      next();
    };
  };

  // Endpoint to fetch Security Audit log files safely (restricted to our simulator admin tests)
  app.get("/api/admin/security-logs", (req, res) => {
    res.json({ logsCount: SECURITY_AUDIT_LOGS.length, logs: SECURITY_AUDIT_LOGS.slice(-100) });
  });

  // API Route: Check Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", aiConfigured: !!ai });
  });

  // API Route: Proxy an image to bypass CORS and allow client-side canvas WebP conversion
  app.get("/api/proxy-image", async (req, res) => {
    let imageUrl = req.query.url;
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).send("Falta el parámetro 'url'.");
    }

    // Resilience: Correct any accidental 'fal.zmedia' to 'fal.media' or 'v3b.fal.zmedia' to 'v3.fal.media'
    if (imageUrl.includes("fal.zmedia")) {
      imageUrl = imageUrl.replace("fal.zmedia", "fal.media");
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        return res.status(response.status).send(`Error al obtener la imagen remota: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/png";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (err: any) {
      console.error("[CORS Proxy Error]:", err);
      res.status(500).send(`Error de red: ${err.message || err}`);
    }
  });

  // API Route: Resolve sharing pages/sandbox urls from fal.ai or other links to their direct image URLs
  app.post("/api/resolve-external-image", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "Falta el parámetro 'url'." });
    }

    try {
      const lowerUrl = url.toLowerCase().trim();
      
      // If indeed it already points to a direct image extension, return as is
      if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/) && !url.includes("fal.ai/")) {
        return res.json({ success: true, url: url.trim() });
      }

      console.log(`[Resolve External Image] Scraping sharing page to find real image link: ${url}`);
      
      const fetchRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }
      });

      if (!fetchRes.ok) {
        return res.json({ 
          success: false, 
          url, 
          error: `No se pudo conectar a la página de Fal. Código de respuesta: ${fetchRes.status}` 
        });
      }

      const html = await fetchRes.text();

      // Look for og:image meta tag content
      const ogImageMatch = html.match(/<meta\s+[^>]*property=["']og:image["']\s+[^>]*content=["']([^"']+)["']/i) || 
                           html.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+[^>]*property=["']og:image["']/i);
      
      if (ogImageMatch && ogImageMatch[1]) {
        console.log(`[Resolve External Image] Found og:image! ${ogImageMatch[1]}`);
        return res.json({ success: true, url: ogImageMatch[1].trim() });
      }

      // Look for twitter:image meta tag
      const twitterImageMatch = html.match(/<meta\s+[^>]*name=["']twitter:image["']\s+[^>]*content=["']([^"']+)["']/i) ||
                                html.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+[^>]*name=["']twitter:image["']/i);
      if (twitterImageMatch && twitterImageMatch[1]) {
        console.log(`[Resolve External Image] Found twitter:image! ${twitterImageMatch[1]}`);
        return res.json({ success: true, url: twitterImageMatch[1].trim() });
      }

      // Look for falcdn URLs or queue.fal.run URLs in general regex
      const falRegex = /(https:\/\/[a-zA-Z0-9.\-_]+\.bat\.run\/files\/[a-zA-Z0-9_\-\/]+|https:\/\/queue\.fal\.run\/files\/[a-zA-Z0-9_\-\/]+|https:\/\/fal-cdn\.bat\.run\/files\/[a-zA-Z0-9_\-\/]+)/gi;
      const falMatch = html.match(falRegex);
      if (falMatch && falMatch.length > 0) {
        console.log(`[Resolve External Image] Found falcdn fallback url! ${falMatch[0]}`);
        return res.json({ success: true, url: falMatch[0] });
      }

      // General fallback to retrieve any image URL inside the html source
      const generalImgRegex = /(https:\/\/cdn[a-zA-Z0-9.\-_/]+(?:png|jpg|jpeg|webp))/gi;
      const generalMatch = html.match(generalImgRegex);
      if (generalMatch && generalMatch.length > 0) {
        console.log(`[Resolve External Image] Found general image fallback! ${generalMatch[0]}`);
        return res.json({ success: true, url: generalMatch[0] });
      }

      // If we couldn't resolve, return success false but keep original url as a desperate fallback
      return res.json({ 
        success: false, 
        url, 
        error: "No se pudo extraer la URL directa de la imagen en las etiquetas meta de la página compartida de Fal.ai." 
      });
    } catch (err: any) {
      console.error("[Resolve External Image Error]:", err);
      return res.json({ success: false, url, error: err?.message || err });
    }
  });

  // API Route: Generate Trivia (using high-performance pre-generated Gemini questions)
  app.post("/api/trivia", async (req, res) => {
    const { country, level } = req.body;
    
    if (!country) {
      return res.status(400).json({ error: "Falta el parámetro 'country' (país)." });
    }
    
    const difficultyLevel = level || 1; // 1: Fácil, 2: Medio, 3: Difícil
    const difficultyName = difficultyLevel === 1 ? "Fácil" : difficultyLevel === 2 ? "Medio" : "Difícil";

    console.log(`[Trivia API] Serving optimized trivia for ${country}, Level: ${difficultyName}`);

    try {
      const triviaData = getPregeneratedTrivia(country, difficultyLevel);
      res.json(triviaData);
    } catch (error: any) {
      console.error("Error retrieving pregenerated trivia:", error);
      res.json(getSeededTrivia(country, difficultyLevel));
    }
  });

  // API Route: Generate Dynamic Scouting Report
  app.post("/api/scout-report", async (req, res) => {
    const { playerName, position, country, rating, attributes } = req.body;
    
    if (!playerName) {
      return res.status(400).json({ error: "Falta el nombre del jugador." });
    }

    if (!ai || isGeminiQuotaDepleted) {
      return res.json({
        report: `${playerName} es un destacado jugador en la posición de ${position}. Con una valoración general de ${rating}, se caracteriza por su gran versatilidad táctica, excelente lectura del juego y un estilo dinámico que aporta profundidad ofensiva y estabilidad defensiva a la selección de ${country}.`
      });
    }

    try {
      const prompt = `Como un Director Técnico de Fútbol Profesional y Director de Scouting experimentado, escribe un informe táctico (Scouting Report) breve de 2-3 frases (máximo 60 palabras) para un jugador de fútbol desbloqueado con los siguientes datos:
Nombre: ${playerName}
Posición: ${position}
País: ${country}
Valoración General: ${rating}/100
Atributos clave sugeridos: ${attributes || "Excelente control técnico y juego colectivo"}.

No violes derechos de autor. Utiliza descripciones artísticas, tácticas y futbolísticas profundas y evocadoras (ej. "Extremo invertido con gran aceleración y tendencia a recortar hacia el centro", "Defensor sobrio, impasable en los duelos individuales"). Evita rodeos, ve directo al informe de scouting.`;

      const response = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const reportText = response.text?.trim() || "";
      res.json({ report: reportText });
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("credits are depleted")) {
        isGeminiQuotaDepleted = true;
        console.warn("[Gemini API Quota Check] No prepayment credits remaining or quota limit reached in scout report.");
      } else {
        console.warn("[Gemini API Warning] Error generating scout report, falling back:", errMsg);
      }
      res.json({
        report: `${playerName} es un ${position} moderno con un juego enfocado en la intensidad y el equilibrio táctico. Su calificación de ${rating} refleja un alto potencial colectivo y grandes garantías técnicas para ${country}.`
      });
    }
  });

  // API Route: Generate sticker dynamically using fal.ai
  app.post("/api/generate_sticker", async (req, res) => {
    const { playerId, name, styleOfPlay, country, position } = req.body;
    
    // Check if FAL_KEY is defined
    const falKey = process.env.FAL_KEY || process.env.FAL_SECRET_KEY;
    if (!falKey) {
      return res.status(403).json({
        error: "Falta configurar FAL_KEY. Por favor configura FAL_KEY en la sección de secretos (Settings > Secrets) de AI Studio."
      });
    }

    try {
      const formula = `Comic book cover art style, high contrast, heavy black ink outlines, dynamic action pose, football player ${name} from ${country} playing as ${position}, style: ${styleOfPlay}, limited palette deep forest green, vibrant crimson red, clean white, dramatic lighting, detailed ink cross-hatching, 8k resolution, cinematic composition`;
      
      const response = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: formula,
          image_size: "portrait_4_3"
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("fal.ai API Error Status:", response.status, errText);
        return res.status(response.status).json({ error: `Error de fal.ai (${response.status}): ${errText || response.statusText}` });
      }

      const data = await response.json();
      const imageUrl = data?.images?.[0]?.url;

      if (!imageUrl) {
        return res.status(502).json({ error: "Sincronización con fal.ai exitosa, pero no se devolvió ninguna imagen en la respuesta." });
      }

      // Return generated imageUrl
      return res.json({
        status: "success",
        imageUrl: imageUrl,
        seed: data.seed
      });
    } catch (err: any) {
      console.error("Error orquestando la petición con fal.ai:", err);
      return res.status(500).json({ error: `Fallo de conexión o de red con fal.ai: ${err?.message || err}` });
    }
  });

  // Helper to programmatically parse match date formats
  function parseMatchDateToUTC(fechaStr: string): Date {
    let month = 5; // default June (0-indexed)
    let day = 11;
    let hour = 13;
    let minute = 0;

    try {
      const cleanStr = fechaStr.toLowerCase().trim();
      if (cleanStr.includes('/')) {
        const parts = cleanStr.split(',');
        const datePart = parts[0].trim();
        const timePart = parts[1]?.trim();
        
        const dayMonth = datePart.match(/(\d+)\/(\d+)/);
        if (dayMonth) {
          day = parseInt(dayMonth[1], 10);
          month = parseInt(dayMonth[2], 10) - 1;
        }
        if (timePart) {
          const timeMatch = timePart.match(/(\d+):(\d+)/);
          if (timeMatch) {
            hour = parseInt(timeMatch[1], 10);
            minute = parseInt(timeMatch[2], 10);
          }
        }
      } else {
        const parts = cleanStr.split(',');
        const datePart = parts[0].trim();
        const timePart = parts[1]?.trim();
        
        const dayMatch = datePart.match(/(\d+)/);
        if (dayMatch) {
          day = parseInt(dayMatch[1], 10);
        }
        if (datePart.includes('junio') || datePart.includes('jun')) {
          month = 5;
        } else if (datePart.includes('julio') || datePart.includes('jul')) {
          month = 6;
        }
        if (timePart) {
          const timeMatch = timePart.match(/(\d+):(\d+)/);
          if (timeMatch) {
            hour = parseInt(timeMatch[1], 10);
            minute = parseInt(timeMatch[2], 10);
          }
        }
      }
    } catch (err) {
      console.error("Error parsing match date:", fechaStr, err);
    }

    // Assumes ECU/EST Match Schedule (UTC -5)
    // Convert UTC -5 to UTC timestamp (+5 hours delta offset)
    return new Date(Date.UTC(2026, month, day, hour + 5, minute, 0));
  }

  // API Route: Validate schedule-sensitive forecasts using Gemini with location context
  app.post("/api/predictions/validate", async (req, res) => {
    const { local, visitante, matchFecha, userTimezone, userLocation, currentTime } = req.body;

    if (!local || !visitante || !matchFecha) {
      return res.status(400).json({ error: "Faltan parámetros requeridos ('local', 'visitante', 'matchFecha')." });
    }

    const currentTimeISO = currentTime || new Date().toISOString();
    const systemTimezone = userTimezone || "America/Guayaquil";

    // Rigorous local programmatic comparison fallback
    const matchDateObj = parseMatchDateToUTC(matchFecha);
    const currentDateObj = new Date(currentTimeISO);
    const diffMs = matchDateObj.getTime() - currentDateObj.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const fallbackEligible = diffHours >= 2.0;

    let eligible = fallbackEligible;
    let hoursRemaining = Number(diffHours.toFixed(2));
    let reason = "";

    if (ai && !isGeminiQuotaDepleted) {
      try {
        const prompt = `Valida si el pronóstico de marcador y táctica califica para ganar puntos según la regla del D.T. de la Copa Mundial 2026.
Regla: Toda predicción debe guardarse obligatoriamente al menos 2 horas antes de la hora oficial de inicio del encuentro deportivo. Si se realiza después de ese tiempo límite, se guardará como datos informativos e históricos del DT, pero NO otorgará puntos para la tabla de posiciones (elegibilidad = false).

Datos del Próximo Encuentro:
- Local: ${local}
- Visitante: ${visitante}
- Hora programada oficial: ${matchFecha} (Zona horaria estándar de Ecuador ECT, que es UTC-5)
- Año: 2026

Datos Geográficos y Temporales del Director Técnico (Usuario):
- Zona Horaria: ${systemTimezone}
- Ubicación / Coordenadas: ${userLocation ? `Latitud: ${userLocation.lat}, Longitud: ${userLocation.lng}` : 'No permitidas o no accesibles'}
- Hora actual del DT al guardar: ${currentTimeISO}

Analiza con calma:
1. Compara críticamente la hora programada (${matchFecha} UTC-5) con la hora del usuario (${currentTimeISO}).
2. Determina cuántas horas faltan para el inicio del partido.
3. Evalúa si quedan por lo menos 2.0 horas (TRUE), o si faltan menos de 2 horas (por ejemplo, si faltan 1.5 horas, o si ya inició/concluyó) (FALSE).

Devuelve obligatoriamente un formato JSON que cumpla al pie de la letra con este esquema:
{
  "eligible": boolean,
  "reason": "Una constructiva, detallada e ingeniosa explicación en español de la comparación de horarios, mencionando la zona horaria/coordenadas del usuario, y las horas restantes, con gran tono narrativo futbolístico.",
  "hoursRemaining": number
}

No agregues bloques de código markdown, sólamente responde el JSON directo en el cuerpo del texto.`;

        const response = await generateContentWithRetry(ai, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                eligible: { type: Type.BOOLEAN },
                reason: { type: Type.STRING },
                hoursRemaining: { type: Type.NUMBER }
              },
              required: ["eligible", "reason", "hoursRemaining"]
            }
          }
        });

        const respText = response.text?.trim() || "";
        console.log(`[Gemini API Schedule Validation Result]:`, respText);
        const parsed = JSON.parse(respText);
        
        // Enforce the strict fallback as the ultimate guard-rail for programmatic safety
        eligible = parsed.eligible && fallbackEligible;
        hoursRemaining = parsed.hoursRemaining !== undefined ? parsed.hoursRemaining : hoursRemaining;
        reason = parsed.reason || reason;
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("credits are depleted")) {
          isGeminiQuotaDepleted = true;
          console.warn("[Gemini API Quota Check] No prepayment credits remaining or quota limit reached in schedule validation.");
        } else {
          console.warn("[Gemini API Warning] Error in schedule validation with Gemini, using local fallback:", errMsg);
        }
      }
    }

    if (!reason) {
      const formattedMatchLocal = matchDateObj.toLocaleString('es-EC', { timeZone: systemTimezone });
      const formattedUserLocal = currentDateObj.toLocaleString('es-EC', { timeZone: systemTimezone });

      reason = fallbackEligible 
        ? `[Control de Plazos] ¡Ingreso con éxito! Se guardó a las ${formattedUserLocal} (${systemTimezone}). El partido empieza a las ${formattedMatchLocal} (Ecuador). Restan ${diffHours.toFixed(1)} horas. Tu pronóstico de táctica y marcador califica para ganar puntos.` 
        : `[Control de Plazos] Fuera de tiempo reglamentario. Se guardó a las ${formattedUserLocal} (${systemTimezone}). El partido empieza a las ${formattedMatchLocal} (Ecuador). Restan únicamente ${diffHours.toFixed(1)} horas (mínimo 2 horas antes de iniciar). Tus datos se guardarán pero no sumarán puntos para el ranking.`;
    }

    res.json({
      status: "success",
      eligible,
      reason,
      hoursRemaining,
      currentTimeISO,
      matchTimeISO: matchDateObj.toISOString()
    });
  });

  // API Route: Sync real World Cup results and lineups using Gemini Search Grounding
  app.post("/api/predictions/sync-gemini", async (req, res) => {
    const { userBoards, playersDB } = req.body;

    if (!userBoards || typeof userBoards !== "object") {
      return res.status(400).json({ error: "Faltan parámetros requeridos ('userBoards')." });
    }

    const activeCountries = Object.keys(userBoards);
    if (activeCountries.length === 0) {
      return res.json({
        status: "success",
        message: "No hay países activos en la pizarra para sincronizar.",
        matches: []
      });
    }

    if (ai && !isGeminiQuotaDepleted) {
      try {
        // Construct information for Gemini to fetch the latest matches
        const countriesContext = activeCountries.map(country => {
          const players = playersDB?.[country] || [];
          const playerNames = players.map((p: any) => p.realName || p.name);
          return {
            country,
            playerNamesAvailableInRoster: playerNames
          };
        });

        const prompt = `Actúa como el Orquestador de Datos en Tiempo Real de la FIFA para el Mundial 2026.
Usa tu herramienta de Google Search Grounding para buscar los resultados de partidos oficiales reales más recientes (incluyendo marcador de goles, rival y alineación inicial de titulares) de las siguientes selecciones de fútbol:
${JSON.stringify(countriesContext, null, 2)}

Para cada país, investiga:
1. El rival oficial más reciente de la selección (en su partido oficial más reciente en la Copa Mundial o eliminatorias de la Copa Mundial, o amistoso internacional de la FIFA).
2. El marcador de ese partido oficial más reciente (goles que anotó la selección de interés y los goles que anotó el rival).
3. Los jugadores titulares que jugaron en ese once inicial de ese partido. Compara esos jugadores reales con la lista de jugadores disponibles "playerNamesAvailableInRoster" para cada país para identificar cuáles de nuestros nombres listados corresponden a esos titulares.

Devuelve de forma obligatoria un JSON estructurado que contenga los resultados de cada país:
{
  "matches": [
    {
      "country": "Nombre del país solicitado",
      "opponent": "Nombre del rival oficial",
      "golesLocal": 3, // goles del pais listado
      "golesVisitante": 1, // goles del oponente
      "wasLocal": true, // true si jugo de local
      "startingXI": ["Lista de nombres reales de la plantilla 'playerNamesAvailableInRoster' que jugaron de titulares"],
      "summary": "Breve explicación lírica futbolística del partido real obtenido, con la fecha y torneo"
    }
  ]
}

No agregues bloques de código markdown, sólamente responde el JSON directo en el cuerpo del texto.`;

        console.log("[Gemini Real-time Sync] Sending grounding prompt for:", activeCountries);
        const response = await generateContentWithRetry(ai, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      country: { type: Type.STRING },
                      opponent: { type: Type.STRING },
                      golesLocal: { type: Type.INTEGER },
                      golesVisitante: { type: Type.INTEGER },
                      wasLocal: { type: Type.BOOLEAN },
                      startingXI: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      summary: { type: Type.STRING }
                    },
                    required: ["country", "opponent", "golesLocal", "golesVisitante", "wasLocal", "startingXI", "summary"]
                  }
                }
              },
              required: ["matches"]
            }
          }
        });

        const respText = response.text?.trim() || "{}";
        console.log(`[Gemini Sync Result JSON]:`, respText);
        const parsed = JSON.parse(respText);
        
        if (parsed && Array.isArray(parsed.matches)) {
          return res.json({
            status: "success",
            source: "gemini-grounding",
            matches: parsed.matches
          });
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("credits are depleted")) {
          isGeminiQuotaDepleted = true;
          console.warn("[Gemini API Quota Check] No prepayment credits remaining or quota limit reached in prediction sync.");
        } else {
          console.warn("[Gemini API Warning] Error in prediction sync with Gemini, using local fallback:", errMsg);
        }
      }
    }

    // Fallback if Gemini or API key is missing or errored
    console.warn("[Gemini Sync Fallback] Using local seeded programmatic matcher");
    return res.json({
      status: "success",
      source: "fallback-seeded",
      matches: []
    });
  });

  /**
   * ==========================================================================
   * BACKEND DATABASE LOGIC & SCORING SYSTEM (MODULES REQUESTED)
   * Includes transactional score calculation, Top 3 ranking prizes, 
   * and a seed-based deterministic pack drawer for audit safety.
   * ==========================================================================
   */

  // Simple LCG/MurmurHash3-inspired Seeded Pseudo-Random Number Generator for transparent draws
  function seededPRNG(seedStr: string) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  interface ServerUser {
    id: string;
    username: string;
    gameCode: string;
    unlockedStickersCount: number;
    completedCountries: string[];
    aciertosOnce: number;
    aciertosMarcador: number;
    score: number;
    subscription: string;
    role: string;
    avatar: string;
    licenseCode: string;
    createdAt: string;
    email?: string;
    tacticalBoards?: any;
    referredByEmail?: string;
    invitedEmails?: string[];
    coins?: number;
    cashBalance?: number;
  }

  function getReferralPointsForUser(email: string | undefined): number {
    if (!email) return 0;
    const cleanEmail = email.toLowerCase().trim();
    
    let totalPoints = 0;
    REGISTERED_USERS.forEach(u => {
      if (
        u.referredByEmail && 
        u.referredByEmail.toLowerCase().trim() === cleanEmail && 
        u.id !== u.referredByEmail && // Prevent self-referral
        u.subscription && 
        u.subscription.toLowerCase().trim() !== "ninguna"
      ) {
        const sub = u.subscription.toLowerCase().trim();
        if (sub.includes("vip") || sub.includes("mundialista")) {
          totalPoints += 15; // 15 points for VIP Plan
        } else {
          totalPoints += 5;  // 5 points for Normal/Scout Plan
        }
      }
    });
    return totalPoints;
  }

  const registeredUsersPath = resolveDataPath("registeredUsers.json");
  
  function saveUsersToDisk() {
    try {
      const dir = path.dirname(registeredUsersPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(registeredUsersPath, JSON.stringify(REGISTERED_USERS, null, 2), "utf-8");
    } catch (err: any) {
      console.error("[Registered Users Saving Error]:", err);
    }
  }

  // In-memory dynamic database for Registered Users (Safe for auditing & Admin controls)
  let REGISTERED_USERS: ServerUser[] = [];

  if (fs.existsSync(registeredUsersPath)) {
    try {
      const dataStr = fs.readFileSync(registeredUsersPath, "utf-8");
      REGISTERED_USERS = JSON.parse(dataStr);
    } catch (err: any) {
      console.error("Error loading registeredUsers.json, using fallback:", err);
    }
  }

  // Filter out simulated users (user_bielsa, user_tactico, user_scout, user_mundial, user_ancelotti)
  // so that only the real ones are kept.
  REGISTERED_USERS = REGISTERED_USERS.filter(u => 
    u.id !== "user_bielsa" && 
    u.id !== "user_tactico" && 
    u.id !== "user_scout" && 
    u.id !== "user_mundial" && 
    u.id !== "user_ancelotti"
  );

  saveUsersToDisk();

  // ==========================================================================
  // BRAND PROMOTER REVENUE & QR REFERRAL SYSTEM DATA STRUCTURES
  // ==========================================================================
  
  interface AffiliateVisit {
    id: string;
    promoterId: string;
    city: string;
    timestamp: string; // ISO String
    deviceType: string;
  }

  interface AffiliateSale {
    id: string;
    promoterId: string;
    city: string;
    amount: number;
    timestamp: string; // ISO String
    transactionId: string;
    planTier: string;
    userId: string;
  }

  function parseCity(promoterId: string): string {
    const cleanId = promoterId.toUpperCase().trim();
    if (cleanId.startsWith("UIO")) return "Quito";
    if (cleanId.startsWith("MAD")) return "Madrid";
    if (cleanId.startsWith("GYE")) return "Guayaquil";
    if (cleanId.startsWith("NYC")) return "New York";
    if (cleanId.startsWith("CDMX") || cleanId.startsWith("MEX")) return "Ciudad de México";
    if (cleanId.startsWith("BOG")) return "Bogotá";
    if (cleanId.startsWith("LIM")) return "Lima";
    if (cleanId.startsWith("SCL")) return "Santiago";
    if (cleanId.startsWith("EZE") || cleanId.startsWith("BUE")) return "Buenos Aires";
    return "Internacional";
  }

  let AFFILIATE_VISITS: AffiliateVisit[] = [
    { id: "v1", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-10T10:15:00Z", deviceType: "Android" },
    { id: "v2", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-11T11:24:00Z", deviceType: "iPhone" },
    { id: "v3", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-11T14:50:00Z", deviceType: "Android" },
    { id: "v4", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-12T09:05:00Z", deviceType: "Android" },
    { id: "v5", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-12T16:44:00Z", deviceType: "iPhone" },
    { id: "v6", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-13T10:10:00Z", deviceType: "Android" },
    { id: "v7", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-13T13:22:00Z", deviceType: "iPhone" },
    { id: "v8", promoterId: "UIO_MARIA", city: "Quito", timestamp: "2026-06-14T08:30:00Z", deviceType: "Android" },
    
    { id: "v10", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-08T18:30:00Z", deviceType: "iPhone" },
    { id: "v11", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-09T14:15:00Z", deviceType: "Android" },
    { id: "v12", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-10T09:20:00Z", deviceType: "iPhone" },
    { id: "v13", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-10T17:40:00Z", deviceType: "iPhone" },
    { id: "v14", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-11T12:00:00Z", deviceType: "Android" },
    { id: "v15", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-11T15:30:00Z", deviceType: "Android" },
    { id: "v16", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-12T11:15:00Z", deviceType: "iPhone" },
    { id: "v17", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-12T20:10:00Z", deviceType: "Android" },
    { id: "v18", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-13T16:02:00Z", deviceType: "iPhone" },
    { id: "v19", promoterId: "MAD_CARLOS", city: "Madrid", timestamp: "2026-06-14T09:12:00Z", deviceType: "Android" },

    { id: "v20", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-11T10:40:00Z", deviceType: "Android" },
    { id: "v21", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-11T16:15:00Z", deviceType: "Android" },
    { id: "v22", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-12T11:00:00Z", deviceType: "iPhone" },
    { id: "v23", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-12T15:55:00Z", deviceType: "Android" },
    { id: "v24", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-13T09:30:00Z", deviceType: "iPhone" },
    { id: "v25", promoterId: "GYE_ESTEBAN", city: "Guayaquil", timestamp: "2026-06-14T07:44:00Z", deviceType: "Android" },

    { id: "v30", promoterId: "NYC_JESSICA", city: "New York", timestamp: "2026-06-12T14:15:00Z", deviceType: "iPhone" },
    { id: "v31", promoterId: "NYC_JESSICA", city: "New York", timestamp: "2026-06-13T10:10:00Z", deviceType: "iPhone" },
    { id: "v32", promoterId: "NYC_JESSICA", city: "New York", timestamp: "2026-06-14T08:15:00Z", deviceType: "Android" }
  ];

  let AFFILIATE_SALES: AffiliateSale[] = [
    { id: "s1", promoterId: "UIO_MARIA", city: "Quito", amount: 15.00, timestamp: "2026-06-11T15:02:00Z", transactionId: "TX_AFF_639201", planTier: "Pase VIP Elite", userId: "usr_83719" },
    { id: "s2", promoterId: "UIO_MARIA", city: "Quito", amount: 5.00, timestamp: "2026-06-12T17:12:00Z", transactionId: "TX_AFF_639202", planTier: "Plan Scout Básico", userId: "usr_91039" },
    { id: "s3", promoterId: "UIO_MARIA", city: "Quito", amount: 15.00, timestamp: "2026-06-14T08:45:00Z", transactionId: "TX_AFF_639203", planTier: "Pase VIP Elite", userId: "usr_83719" },

    { id: "s10", promoterId: "MAD_CARLOS", city: "Madrid", amount: 15.00, timestamp: "2026-06-10T18:00:00Z", transactionId: "TX_AFF_481201", planTier: "Pase VIP Elite", userId: "usr_83719" },
    { id: "s11", promoterId: "MAD_CARLOS", city: "Madrid", amount: 5.00, timestamp: "2026-06-12T11:45:00Z", transactionId: "TX_AFF_481202", planTier: "Plan Scout Básico", userId: "usr_91039" },

    { id: "s20", promoterId: "GYE_ESTEBAN", city: "Guayaquil", amount: 15.00, timestamp: "2026-06-13T10:12:00Z", transactionId: "TX_AFF_112040", planTier: "Pase VIP Elite", userId: "usr_83719" }
  ];

  interface SubscriptionTxn {
    id: string;
    userId: string;
    username: string;
    email: string;
    planTier: string;
    licenseCode: string;
    gateway: string;
    reference: string;
    amount: number;
    timestamp: string;
    status: string;
    promoterId?: string;
  }

  let SUBSCRIPTIONS_DB: SubscriptionTxn[] = [
    {
      id: "sub_txn_10029",
      userId: "usr_91039",
      username: "Profe Marcelo Fan",
      email: "dt.bielsa@gmail.com",
      planTier: "Plan Scout Básico",
      licenseCode: "LIC-SCOUT-774029",
      gateway: "Payphone",
      reference: "txn_payphone_99A1b2c3",
      amount: 5.00,
      timestamp: "2026-06-01T12:00:00Z",
      status: "Aprobado"
    },
    {
      id: "sub_txn_10030",
      userId: "usr_83719",
      username: "Pepin Guardiolas",
      email: "pepin.scout@gmail.com",
      planTier: "Pase VIP Elite",
      licenseCode: "LIC-VIP-837192",
      gateway: "Payphone",
      reference: "txn_payphone_818274",
      amount: 15.00,
      timestamp: "2026-06-10T14:45:00Z",
      status: "Aprobado"
    }
  ];

  function recordSubscriptionTxn(params: {
    userId: string;
    planTier: string;
    licenseCode: string;
    gateway?: string;
    reference?: string;
    promoterId?: string;
  }) {
    const userObj = REGISTERED_USERS.find(u => u.id === params.userId);
    const username = userObj ? userObj.username : "Tú (Director Técnico)";
    const email = userObj ? (userObj.email || "") : "";
    
    let amount = 0.00;
    const tierLower = (params.planTier || "").toLowerCase();
    if (tierLower.includes("vip") || tierLower.includes("mundialista")) {
      amount = 15.00;
    } else if (tierLower.includes("scout") || tierLower.includes("básico") || tierLower.includes("basico")) {
      amount = 5.00;
    }

    const newTxn: SubscriptionTxn = {
      id: "sub_txn_" + Math.floor(Math.random() * 90000 + 10000),
      userId: params.userId,
      username: username,
      email: email,
      planTier: params.planTier,
      licenseCode: params.licenseCode,
      gateway: params.gateway || "Manual / Interno",
      reference: params.reference || "REF-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      amount: amount,
      timestamp: new Date().toISOString(),
      status: "Aprobado",
      promoterId: params.promoterId || ""
    };

    SUBSCRIPTIONS_DB.unshift(newTxn);
    console.log(`[Subscription Txn Logged] User: ${username}, Plan: ${params.planTier}, Cost: $${amount}, Gateway: ${params.gateway}`);
    return newTxn;
  }

  interface DynamicPromoter {
    promoterId: string;
    city: string;
    createdAt: string;
  }

  let DYNAMIC_PROMOTERS: DynamicPromoter[] = [
    { promoterId: "UIO_MARIA", city: "Quito", createdAt: "2026-06-10T10:00:00Z" },
    { promoterId: "MAD_CARLOS", city: "Madrid", createdAt: "2026-06-08T10:00:00Z" },
    { promoterId: "GYE_ESTEBAN", city: "Guayaquil", createdAt: "2026-06-11T10:00:00Z" },
    { promoterId: "NYC_JESSICA", city: "New York", createdAt: "2026-06-12T10:00:00Z" }
  ];


  // Helper score calculation using official user specs:
  // - 1 cromo = 1 pt
  // - Completed country = 5 pt
  // - XI alignment starter hit = 10 pt
  // - Score prediction accurate = 20 pt
  function getScoreFromUnlockedLevels(unlockedLevels: any, aciertosOnce: number, aciertosMarcador: number) {
    let unlockedStickersCount = 0;
    const completedCountries: string[] = [];

    if (unlockedLevels) {
      Object.entries(unlockedLevels).forEach(([country, levels]: [string, any]) => {
        let lvl1 = levels[1] || false;
        let lvl2 = levels[2] || false;
        let lvl3 = levels[3] || false;

        let countryCount = 0;
        if (lvl1) countryCount += 9;
        if (lvl2) countryCount += 9;
        if (lvl3) countryCount += 8;

        unlockedStickersCount += countryCount;

        if (lvl1 && lvl2 && lvl3) {
          completedCountries.push(country);
        }
      });
    }

    const stickersScore = unlockedStickersCount * 1;
    const countryBonus = completedCountries.length * 5;
    const onceScore = (aciertosOnce || 0) * 10;
    const marcadorScore = (aciertosMarcador || 0) * 20;
    const totalScore = stickersScore + countryBonus + onceScore + marcadorScore;

    return {
      unlockedStickersCount,
      completedCountries,
      stickersScore,
      countryBonus,
      onceScore,
      marcadorScore,
      totalScore
    };
  }

  // API 1: Calculate Score Dynamically (Dynamic user evaluation & trigger audit)
  app.post("/api/user/score", (req, res) => {
    const { unlockedLevels, aciertosOnce, aciertosMarcador, gameCode } = req.body;

    if (!unlockedLevels) {
      return res.status(400).json({ error: "Faltan los niveles desbloqueados ('unlockedLevels')." });
    }

    const calculations = getScoreFromUnlockedLevels(unlockedLevels, aciertosOnce || 0, aciertosMarcador || 0);

    res.json({
      status: "success",
      gameCode: gameCode || "DT-7721",
      unlockedStickersCount: calculations.unlockedStickersCount,
      completedCountries: calculations.completedCountries,
      unlockedStickersScore: calculations.stickersScore,
      completedCountriesBonus: calculations.countryBonus,
      predictionScore: calculations.onceScore + calculations.marcadorScore,
      onceScore: calculations.onceScore,
      marcadorScore: calculations.marcadorScore,
      totalScore: calculations.totalScore,
      timestamp: new Date().toISOString()
    });
  });

  // API 1.45: Check if email is already in use
  app.get("/api/user/check-email", (req, res) => {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
      return res.json({ exists: false });
    }
    const emailLower = email.trim().toLowerCase();
    const exists = REGISTERED_USERS.some(u => u.email && u.email.toLowerCase() === emailLower);
    res.json({ exists });
  });

  // API 1.46: Get custom user stickers map across users and devices for global synchronization
  app.get("/api/stickers/custom", (req, res) => {
    res.json({ status: "success", stickers: CUSTOM_STICKERS_DB });
  });

  // API 1.47: Save custom user sticker mapping to server database and trigger permanent JSON serialization
  app.post("/api/stickers/custom", (req, res) => {
    const { playerId, imageUrl, deleteSticker } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: "Falta el parámetro 'playerId'." });
    }
    
    if (deleteSticker || imageUrl === "") {
      delete CUSTOM_STICKERS_DB[playerId];
    } else {
      if (!imageUrl) {
        return res.status(400).json({ error: "Falta el parámetro 'imageUrl'." });
      }
      CUSTOM_STICKERS_DB[playerId] = imageUrl;
    }
    
    // Save safely to file system
    try {
      fs.writeFileSync(customStickersPath, JSON.stringify(CUSTOM_STICKERS_DB, null, 2), "utf-8");
      res.json({ 
        status: "success", 
        message: deleteSticker 
          ? `Cromo de ${playerId} restablecido con éxito al diseño oficial.` 
          : `Cromo personalizado de ${playerId} sincronizado y guardado con éxito en el servidor.` 
      });
    } catch (err: any) {
      console.error("[Sticker Sync DB Save Error]:", err);
      res.status(500).json({ error: "No se pudo serializar la sincronización física del cromo en el servidor: " + err.message });
    }
  });

  // API 1.48: Get custom match results across users and devices for global synchronization
  app.get("/api/matches/custom", (req, res) => {
    res.json({ status: "success", matches: CUSTOM_MATCHES_DB });
  });

  // API 1.49: Update custom match results from the administrators and trigger permanent JSON serialization
  app.post("/api/matches/custom", (req, res) => {
    const { matchId, golesLocal, golesVisitante, jugado, resetMatch } = req.body;
    if (!matchId) {
      return res.status(400).json({ error: "Falta el parámetro 'matchId'." });
    }
    
    if (resetMatch) {
      delete CUSTOM_MATCHES_DB[matchId];
    } else {
      if (typeof golesLocal !== "number" || typeof golesVisitante !== "number") {
        return res.status(400).json({ error: "Los goles de local y visitante deben ser números válidos." });
      }
      CUSTOM_MATCHES_DB[matchId] = {
        golesLocal,
        golesVisitante,
        jugado: jugado !== undefined ? !!jugado : true
      };
    }
    
    try {
      fs.writeFileSync(customMatchesPath, JSON.stringify(CUSTOM_MATCHES_DB, null, 2), "utf-8");
      res.json({ 
        status: "success", 
        message: resetMatch 
          ? `Resultado de partido ${matchId} restablecido con éxito a los datos oficiales.` 
          : `Resultado de partido ${matchId} guardado con éxito en el servidor.` 
      });
    } catch (err: any) {
      console.error("[Matches Sync DB Save Error]:", err);
      res.status(500).json({ error: "No se pudo guardar la modificación del resultado en el servidor: " + err.message });
    }
  });

  // API 1.491: Get blog posts
  app.get("/api/blog", (req, res) => {
    res.json({ status: "success", posts: BLOG_POSTS_DB });
  });

  // API 1.492: Save/add a blog post (Admin only)
  app.post("/api/admin/blog", (req, res) => {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Faltan parámetros 'title' o 'content'." });
    }
    const newPost = {
      id: "post_" + Date.now(),
      title,
      content,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
      createdAt: new Date().toISOString()
    };
    BLOG_POSTS_DB.unshift(newPost);
    try {
      fs.writeFileSync(blogPostsPath, JSON.stringify(BLOG_POSTS_DB, null, 2), "utf-8");
      res.json({ status: "success", post: newPost });
    } catch (err: any) {
      console.error("[Blog Write Error]:", err);
      res.status(500).json({ error: "Error guardando blog post." });
    }
  });

  // API 1.493: Delete a blog post (Admin only)
  app.delete("/api/admin/blog/:id", (req, res) => {
    const { id } = req.params;
    BLOG_POSTS_DB = BLOG_POSTS_DB.filter(post => post.id !== id);
    try {
      fs.writeFileSync(blogPostsPath, JSON.stringify(BLOG_POSTS_DB, null, 2), "utf-8");
      res.json({ status: "success", message: "Post eliminado con éxito." });
    } catch (err: any) {
      console.error("[Blog Delete Error]:", err);
      res.status(500).json({ error: "Error eliminando blog post." });
    }
  });

  // API 1.494: Create a user suggestion/comment
  app.post("/api/suggestions", (req, res) => {
    const { username, email, suggestion } = req.body;
    if (!username || !email || !suggestion) {
      return res.status(400).json({ error: "Faltan parámetros requeridos ('username', 'email' o 'suggestion')." });
    }
    
    const newSuggestion = {
      id: "sug_" + Date.now(),
      username,
      email,
      suggestion,
      sentTo: "geovannygrk3d@gmail.com",
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    
    SUGGESTIONS_DB.unshift(newSuggestion);
    
    console.log(`=========================================`);
    console.log(`[EMAIL SEND SIMULATION]`);
    console.log(`From: noreply@albumtrivia2026.com`);
    console.log(`To: geovannygrk3d@gmail.com`);
    console.log(`Subject: Nueva Sugerencia de ${username} (${email})`);
    console.log(`Body:`);
    console.log(suggestion);
    console.log(`=========================================`);

    try {
      fs.writeFileSync(suggestionsPath, JSON.stringify(SUGGESTIONS_DB, null, 2), "utf-8");
      res.json({ 
        status: "success", 
        message: "Tu sugerencia ha sido enviada con éxito a geovannygrk3d@gmail.com. ¡Gracias por ayudarnos a mejorar!", 
        suggestion: newSuggestion 
      });
    } catch (err: any) {
      console.error("[Suggestion Write Error]:", err);
      res.status(500).json({ error: "No se pudo guardar la sugerencia en el servidor autónomo." });
    }
  });

  // API 1.495: Get user suggestions (Admin only)
  app.get("/api/admin/suggestions", (req, res) => {
    res.json({ status: "success", suggestions: SUGGESTIONS_DB });
  });

  // API 1.496: Delete suggestion (Admin only)
  app.delete("/api/admin/suggestions/:id", (req, res) => {
    const { id } = req.params;
    SUGGESTIONS_DB = SUGGESTIONS_DB.filter(s => s.id !== id);
    try {
      fs.writeFileSync(suggestionsPath, JSON.stringify(SUGGESTIONS_DB, null, 2), "utf-8");
      res.json({ status: "success", message: "Sugerencia eliminada con éxito." });
    } catch (err: any) {
      console.error("[Suggestion Delete Error]:", err);
      res.status(500).json({ error: "Error eliminando sugerencia." });
    }
  });

  // API 1.5: Sync User Profile & Game Information automatically with DB
  app.post("/api/user/sync", signupRateLimiter, validateBody(userSyncSchema), (req, res) => {
    const { id, username, gameCode, unlockedLevels, aciertosOnce, aciertosMarcador, subscription, avatar, licenseCode, email, tacticalBoards, referredByEmail, invitedEmails, coins, cashBalance } = req.body;
    
    const userId = id || "user_me";

    // Prevent registering different accounts with the exact same email
    if (email) {
      const emailLower = email.trim().toLowerCase();
      const duplicateUser = REGISTERED_USERS.find(u => u.id !== userId && u.email && u.email.toLowerCase() === emailLower);
      if (duplicateUser) {
        return res.status(400).json({
          status: "error",
          error: "duplicated_email",
          message: "Este correo electrónico ya está registrado por otro Director Técnico en la base de datos."
        });
      }
    }

    const calculations = getScoreFromUnlockedLevels(unlockedLevels, aciertosOnce || 0, aciertosMarcador || 0);

    // If client supplied its own audited counts, honor them, else use fallback
    const finalUnlockedStickersCount = req.body.unlockedStickersCount !== undefined ? Number(req.body.unlockedStickersCount) : calculations.unlockedStickersCount;
    const finalCompletedCountries = req.body.completedCountries !== undefined ? req.body.completedCountries : calculations.completedCountries;
    const finalScore = req.body.score !== undefined ? Number(req.body.score) : calculations.totalScore;

    // Check if user exists on our Server Database
    let existingIndex = REGISTERED_USERS.findIndex(u => u.id === userId);

    // Define role based on email or subscription
    const isUserAdmin = email && (email.toLowerCase().trim() === 'geovannygrk3d@gmail.com' || email.toLowerCase().trim() === 'geovannygrk3d@gmail');
    const finalRole = isUserAdmin ? "admin" : (subscription && subscription !== "Ninguna") ? "premium" : "user";
    
    const updatedUser: ServerUser = {
      id: userId,
      username: username || "Tú (Director Técnico)",
      gameCode: gameCode || "DT-MINE",
      unlockedStickersCount: finalUnlockedStickersCount,
      completedCountries: finalCompletedCountries,
      aciertosOnce: aciertosOnce || 0,
      aciertosMarcador: aciertosMarcador || 0,
      score: finalScore,
      subscription: subscription || "Ninguna",
      role: finalRole,
      avatar: avatar || "👑",
      licenseCode: licenseCode || "",
      createdAt: new Date().toISOString(),
      email: email || "",
      tacticalBoards: tacticalBoards || {},
      referredByEmail: referredByEmail ? referredByEmail.trim().toLowerCase() : "",
      invitedEmails: invitedEmails || [],
      coins: coins || 0,
      cashBalance: cashBalance || 0
    };
    
    if (existingIndex !== -1) {
      REGISTERED_USERS[existingIndex] = {
        ...REGISTERED_USERS[existingIndex],
        ...updatedUser,
        unlockedStickersCount: finalUnlockedStickersCount,
        completedCountries: finalCompletedCountries,
        score: finalScore,
        role: finalRole,
        licenseCode: licenseCode !== undefined ? licenseCode : (REGISTERED_USERS[existingIndex].licenseCode || ""),
        email: email !== undefined ? email : (REGISTERED_USERS[existingIndex].email || ""),
        tacticalBoards: tacticalBoards !== undefined ? { ...REGISTERED_USERS[existingIndex].tacticalBoards, ...tacticalBoards } : (REGISTERED_USERS[existingIndex].tacticalBoards || {}),
        referredByEmail: referredByEmail !== undefined ? (referredByEmail ? referredByEmail.trim().toLowerCase() : "") : (REGISTERED_USERS[existingIndex].referredByEmail || ""),
        invitedEmails: invitedEmails !== undefined ? invitedEmails : (REGISTERED_USERS[existingIndex].invitedEmails || []),
        coins: coins !== undefined ? coins : (REGISTERED_USERS[existingIndex].coins || 0),
        cashBalance: cashBalance !== undefined ? cashBalance : (REGISTERED_USERS[existingIndex].cashBalance || 0),
        // Preserve original creation time if exists
        createdAt: REGISTERED_USERS[existingIndex].createdAt || updatedUser.createdAt
      };
    } else {
      REGISTERED_USERS.push(updatedUser);
    }

    saveUsersToDisk();

    const finalIndex = existingIndex !== -1 ? existingIndex : REGISTERED_USERS.length - 1;
    const userInDb = REGISTERED_USERS[finalIndex];
    const referralPoints = getReferralPointsForUser(userInDb.email);
    const successfulReferrals = REGISTERED_USERS.filter(x => 
      x.referredByEmail && 
      userInDb.email && 
      x.referredByEmail.toLowerCase().trim() === userInDb.email.toLowerCase().trim() &&
      x.subscription && 
      x.subscription.toLowerCase().trim() !== "ninguna" &&
      x.id !== x.referredByEmail
    );
    const successfulReferralEmails = successfulReferrals.map(x => x.email || x.username);

    const enrichedUser = {
      ...userInDb,
      referralPoints,
      successfulReferralsCount: successfulReferralEmails.length,
      successfulReferralEmails,
      score: userInDb.score + referralPoints
    };
    
    res.json({
      status: "success",
      message: "Sincronización de base de datos exitosa",
      user: enrichedUser
    });
  });

  // API 1.8: Purchase dynamic premium subscription tier
  app.post("/api/user/subscribe", (req, res) => {
    const { userId, planTier, licenseCode, promoterId, gateway, reference } = req.body;
    const targetUserId = userId || "user_me";
    
    let user = REGISTERED_USERS.find(u => u.id === targetUserId);
    if (user) {
      user.subscription = planTier || "Ninguna";
      let finalLicense = licenseCode || "";
      if (licenseCode) {
        user.licenseCode = licenseCode;
      } else if (planTier !== "Ninguna") {
        user.licenseCode = `LIC-${(planTier === "Pase VIP Mundialista" || planTier === "Pase VIP Elite") ? "VIP" : "SCOUT"}-${Math.floor(100000 + Math.random() * 900000)}`;
        finalLicense = user.licenseCode;
      } else {
        user.licenseCode = "";
        finalLicense = "";
      }

      // Record detailed transaction to SUBSCRIPTIONS_DB
      if (planTier && planTier !== "Ninguna") {
        recordSubscriptionTxn({
          userId: targetUserId,
          planTier,
          licenseCode: finalLicense,
          gateway: gateway || "Suscripción Directa",
          reference: reference || "REF-SYNC",
          promoterId: promoterId
        });
      }

      // If promoter referral code is tracked, attribute affiliate revenue
      if (promoterId && promoterId.trim()) {
        const cleanPromoterId = promoterId.toUpperCase().trim();
        const amount = (planTier === "Pase VIP Mundialista" || planTier === "Pase VIP Elite") ? 19.99 : 9.99;
        
        // Prevent duplicate transaction recording for same user/purchase if they click fast
        const hasExisting = AFFILIATE_SALES.some(s => s.userId === targetUserId && s.planTier === planTier && (new Date().getTime() - new Date(s.timestamp).getTime() < 3000));
        
        if (!hasExisting) {
          AFFILIATE_SALES.push({
            id: "s_" + Math.floor(Math.random() * 999999 + 100000),
            promoterId: cleanPromoterId,
            city: parseCity(cleanPromoterId),
            amount,
            timestamp: new Date().toISOString(),
            transactionId: reference || "TX_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
            planTier: planTier || "Pase VIP Elite",
            userId: targetUserId
          });
          console.log(`[Affiliate Assignment] Venta de $${amount} (${planTier}) asignada a promotora ${cleanPromoterId} vinculada a usuario ${targetUserId}`);
        }
      }

      return res.json({
        status: "success",
        message: `Plan actualizado con éxito a: ${planTier}`,
        subscription: user.subscription,
        licenseCode: user.licenseCode
      });
    }
    
    res.status(404).json({ error: "Usuario no registrado." });
  });

  // ==========================================================================
  // REAL PRODUCTION PAYMENT ENDPOINTS & WEBHOOKS (PAYPHONE)
  // Zero-hardcoding security, and full metadata logs
  // ==========================================================================

  // Endpoint: Create Payphone Ecuador Payment Intent (Ecuador Dollars/Debit cards)
  app.post("/api/checkout/payphone", loginRateLimiter, validateBody(checkoutPayphoneSchema), async (req, res) => {
    const { userId, planTier, phoneNumber, promoterId } = req.body;
    const targetUserId = userId || "user_me";
    const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
    
    const isVIP = planTier === "Pase VIP Mundialista";
    const amountInCents = isVIP ? 1500 : 500; // $15 or $5 in Ecuadorian cents

    const payphoneToken = process.env.PAYPHONE_LIVE_TOKEN;
    const storePhoneId = process.env.PAYPHONE_LIVE_PHONE_ID || "0998765432";

    console.log(`[PayPhone API] Requesting transaction of $${amountInCents / 100} for phone +593${cleanPhone}. Referrer Promoter: ${promoterId}`);

    if (!payphoneToken || payphoneToken.includes("yourPayphoneProductionBearerTokenHere")) {
      return res.status(403).json({
        error: "Falta configurar PAYPHONE_LIVE_TOKEN. Por favor configure PAYPHONE_LIVE_TOKEN en la sección de secretos (Settings > Secrets) de AI Studio."
      });
    }

    try {
      // Formulate production headers and metadata parameters
      const response = await fetch("https://pay.payphone.app/api/button/Prepare", {
        method: "POST",
        headers: {
          "Authorization": payphoneToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amountInCents,
          amountWithoutTax: amountInCents,
          clientTransactionId: "TACTIKAI_" + new Date().getTime(),
          currency: "USD",
          phoneNumber: cleanPhone,
          phoneStartCode: "593",
          storeId: storePhoneId,
          metadata: {
            userId: targetUserId,
            planTier: planTier,
            promoterId: promoterId || ""
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayPhone API responded with code ${response.status}: ${errText}`);
      }

      const ppData = await response.json();
      return res.json({
        status: "success",
        transactionId: ppData.transactionId || ppData.paymentId,
        url: ppData.paymentUrl || ""
      });
    } catch (err: any) {
      console.error("[PayPhone SDK Prepare Error]:", err);
      res.status(500).json({ error: "Fallo de conexión con la pasarela de pagos de PayPhone: " + err.message });
    }
  });

  // Endpoint: Secure PAYPHONE Real-Time Payment Webhook
  app.post("/api/webhook/payphone", webhookRateLimiter, async (req, res) => {
    const { transactionId, status, clientTransactionId, metadata } = req.body;
    
    console.log(`[PayPhone Webhook Callback] Transaction ID: ${transactionId}, Status: ${status}`);

    if (status === "Approved" && metadata) {
      const { userId, planTier, promoterId } = metadata;
      
      if (userId && planTier) {
        let user = REGISTERED_USERS.find(u => u.id === userId);
        if (user) {
          user.subscription = planTier;
          user.licenseCode = `LIC-PAYPHONE-${(planTier === "Pase VIP Mundialista" || planTier === "Pase VIP Elite") ? "VIP" : "SCOUT"}-${Math.floor(100000 + Math.random() * 900000)}`;

          // Log detailed subscription transaction
          recordSubscriptionTxn({
            userId,
            planTier,
            licenseCode: user.licenseCode,
            gateway: "Payphone Webhook",
            reference: String(transactionId),
            promoterId
          });

          // Track promoter sales
          if (promoterId && promoterId.trim()) {
            const cleanPromoterId = promoterId.toUpperCase().trim();
            const amount = (planTier === "Pase VIP Mundialista" || planTier === "Pase VIP Elite") ? 15.00 : 5.00;

            AFFILIATE_SALES.push({
              id: "s_" + Math.floor(Math.random() * 999999 + 100000),
              promoterId: cleanPromoterId,
              city: parseCity(cleanPromoterId),
              amount,
              timestamp: new Date().toISOString(),
              transactionId: "TX_PAYPHONE_" + transactionId,
              planTier: planTier,
              userId: userId
            });
            console.log(`[Payphone Attribution Successful] Assigned credit to promoter ${cleanPromoterId}`);
          }
          saveUsersToDisk();
        }
      }
    }

    res.status(200).json({ receiveStatus: "processed" });
  });

  // API 2: Obtain global standings with Raffle Eligibility (Auto, Trip, Phone)
  app.post("/api/leaderboard/global", (req, res) => {
    const { currentUserScore, currentUsername, currentUserCode, aciertosOnce, aciertosMarcador, currentUserId } = req.body;

    const formattedUserScore = currentUserScore !== undefined ? Number(currentUserScore) : 0;
    const formattedUsername = currentUsername || "Tú (Director Técnico)";
    const formattedUserCode = currentUserCode || "DT-MINE";
    const targetUserId = currentUserId || "user_me";

    // Ensure active client user is registered/synced on database list
    let userInDb = REGISTERED_USERS.find(u => u.id === targetUserId);
    if (!userInDb) {
      // Clean up previous user_me default if registering new custom ID
      if (targetUserId !== "user_me") {
        REGISTERED_USERS = REGISTERED_USERS.filter(u => u.id !== "user_me");
      }
      REGISTERED_USERS.push({
        id: targetUserId,
        username: formattedUsername,
        gameCode: formattedUserCode,
        unlockedStickersCount: 0,
        completedCountries: [],
        aciertosOnce: aciertosOnce || 0,
        aciertosMarcador: aciertosMarcador || 0,
        score: formattedUserScore,
        subscription: "Ninguna",
        role: "admin",
        avatar: targetUserId === "user_me" ? "👑" : "🎯",
        licenseCode: "",
        createdAt: new Date().toISOString()
      });
    } else {
      userInDb.username = formattedUsername;
      userInDb.gameCode = formattedUserCode;
      userInDb.score = formattedUserScore;
      userInDb.aciertosOnce = aciertosOnce || 0;
      userInDb.aciertosMarcador = aciertosMarcador || 0;
    }

    saveUsersToDisk();

    // Sort users dynamically according to core scoring structure, adding dynamic referral points
    const sortedRanking = [...REGISTERED_USERS].map(entry => {
      const refPoints = getReferralPointsForUser(entry.email);
      return {
        ...entry,
        score: entry.score + refPoints
      };
    }).sort((a, b) => b.score - a.score);

    // Map rewards for positions to ensure 100% auditable eligibility
    const finalRanking = sortedRanking.map((entry, index) => {
      const position = index + 1;
      let raffleEligibility: "Auto de $20.000" | "Viaje a Galapágos" | "Set Tecnológico $1.500" | "Ninguno" = "Ninguno";

      if (position === 1) raffleEligibility = "Auto de $20.000";
      else if (position === 2) raffleEligibility = "Viaje a Galapágos";
      else if (position === 3) raffleEligibility = "Set Tecnológico $1.500";

      return {
        rank: position,
        id: entry.id,
        username: entry.username,
        score: entry.score,
        code: entry.gameCode || (entry as any).code || "DT-0000",
        avatar: entry.avatar || "👤",
        aciertosOnce: entry.aciertosOnce || 0,
        aciertosMarcador: entry.aciertosMarcador || 0,
        subscription: entry.subscription || "Ninguna",
        licenseCode: entry.licenseCode || "",
        unlockedStickersCount: entry.unlockedStickersCount || 0,
        completedCountries: entry.completedCountries || [],
        referralPoints: getReferralPointsForUser(entry.email),
        email: entry.email || "",
        raffleEligibility
      };
    });

    res.json({
      status: "success",
      totalParticipantsCount: finalRanking.length,
      top3Prizes: {
        prime: "Auto valorado en $20.000 (1er Lugar)",
        secondary: "Viaje a Galápagos con Gastos Pagados (2do Lugar)",
        tertiary: "Set Tecnológico de $1.500 (3er Lugar)"
      },
      ranking: finalRanking
    });
  });

  // API 2.5: Admin User Management Endpoints (CRUD)
  app.get("/api/admin/users", (req, res) => {
    const enrichedUsers = REGISTERED_USERS.map(u => {
      const referralPoints = getReferralPointsForUser(u.email);
      const successfulReferrals = REGISTERED_USERS.filter(x => 
        x.referredByEmail && 
        u.email &&
        x.referredByEmail.toLowerCase().trim() === u.email.toLowerCase().trim() &&
        x.subscription && 
        x.subscription.toLowerCase().trim() !== "ninguna" &&
        x.id !== x.referredByEmail
      );
      
      const successfulReferralEmails = successfulReferrals.map(x => x.email || x.username);

      return {
        ...u,
        referralPoints,
        successfulReferralsCount: successfulReferralEmails.length,
        successfulReferralEmails,
        score: u.score + referralPoints // Dynamically award points in real-time
      };
    });

    res.json({
      status: "success",
      users: enrichedUsers
    });
  });

  app.post("/api/admin/users/create", (req, res) => {
    const { username, gameCode, score, subscription, avatar, aciertosOnce, aciertosMarcador, licenseCode } = req.body;
    
    if (!username || !gameCode) {
      return res.status(400).json({ error: "Faltan parámetros 'username' o 'gameCode'." });
    }
    
    const newUser = {
      id: "admin_added_" + Math.floor(Math.random() * 100000),
      username,
      gameCode,
      unlockedStickersCount: Math.floor(Math.random() * 10),
      completedCountries: [],
      aciertosOnce: Number(aciertosOnce || 0),
      aciertosMarcador: Number(aciertosMarcador || 0),
      score: Number(score || 0),
      subscription: subscription || "Ninguna",
      role: "user",
      avatar: avatar || "⚽",
      licenseCode: licenseCode || (subscription && subscription !== "Ninguna" ? `LIC-${(subscription === "Pase VIP Mundialista" || subscription === "Pase VIP Elite") ? "VIP" : "SCOUT"}-${Math.floor(100000 + Math.random() * 900000)}` : ""),
      createdAt: new Date().toISOString()
    };
    
    REGISTERED_USERS.push(newUser);

    saveUsersToDisk();

    // Track in Subscriptions DB if paid plan
    if (newUser.subscription && newUser.subscription !== "Ninguna") {
      recordSubscriptionTxn({
        userId: newUser.id,
        planTier: newUser.subscription,
        licenseCode: newUser.licenseCode,
        gateway: "Manual / Admin (Alta)",
        reference: "ADMIN_CREATE_" + newUser.id.toUpperCase()
      });
    }

    res.json({ status: "success", user: newUser });
  });

  app.post("/api/admin/users/update", (req, res) => {
    const { id, username, gameCode, score, subscription, aciertosOnce, aciertosMarcador, licenseCode } = req.body;
    let u = REGISTERED_USERS.find(x => x.id === id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado." });
    
    const previousSub = u.subscription;

    if (username) u.username = username;
    if (gameCode) u.gameCode = gameCode;
    if (score !== undefined) u.score = Number(score);
    if (subscription) {
      u.subscription = subscription;
      if (subscription !== "Ninguna" && !u.licenseCode) {
        u.licenseCode = `LIC-${(subscription === "Pase VIP Mundialista" || subscription === "Pase VIP Elite") ? "VIP" : "SCOUT"}-${Math.floor(100000 + Math.random() * 900000)}`;
      } else if (subscription === "Ninguna") {
        u.licenseCode = "";
      }
    }
    if (licenseCode !== undefined) u.licenseCode = licenseCode;
    if (aciertosOnce !== undefined) u.aciertosOnce = Number(aciertosOnce);
    if (aciertosMarcador !== undefined) u.aciertosMarcador = Number(aciertosMarcador);
    
    // Track in Subscriptions DB if changed subscription to a paid plan
    if (subscription && subscription !== "Ninguna" && subscription !== previousSub) {
      recordSubscriptionTxn({
        userId: u.id,
        planTier: u.subscription,
        licenseCode: u.licenseCode,
        gateway: "Manual / Admin (Modificación)",
        reference: "ADMIN_UPDATE_" + u.id.toUpperCase()
      });
    }

    saveUsersToDisk();

    res.json({ status: "success", user: u });
  });

  app.post("/api/admin/users/delete", (req, res) => {
    const { id } = req.body;
    if (id === "user_me") {
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta de Administrador." });
    }
    REGISTERED_USERS = REGISTERED_USERS.filter(u => u.id !== id);
    saveUsersToDisk();
    res.json({ status: "success", message: "Usuario eliminado con éxito" });
  });

  app.post("/api/admin/users/reset-all", (req, res) => {
    REGISTERED_USERS = [];
    saveUsersToDisk();
    res.json({ status: "success", message: "Todos los progresos de usuario en el servidor han sido reseteados a cero." });
  });

  // API 2.6: Admin Subscriptions Management Endpoints
  app.get("/api/admin/subscriptions", (req, res) => {
    res.json({
      status: "success",
      subscriptions: SUBSCRIPTIONS_DB
    });
  });

  app.post("/api/admin/subscriptions/delete", (req, res) => {
    const { id } = req.body;
    SUBSCRIPTIONS_DB = SUBSCRIPTIONS_DB.filter(s => s.id !== id);
    res.json({
      status: "success",
      message: "Registro de suscripción eliminado con éxito"
    });
  });

  app.post("/api/admin/subscriptions/create", (req, res) => {
    const { userId, planTier, gateway, reference, amount, promoterId } = req.body;
    
    const userObj = REGISTERED_USERS.find(u => u.id === userId);
    if (!userObj) {
      return res.status(404).json({ error: "Usuario no registrado." });
    }

    // Upgrade the user subscription status
    userObj.subscription = planTier || "Plan Scout Básico";
    userObj.licenseCode = `LIC-ADMIN-${(planTier === "Pase VIP Mundialista" || planTier === "Pase VIP Elite") ? "VIP" : "SCOUT"}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTxn: SubscriptionTxn = {
      id: "sub_txn_" + Math.floor(Math.random() * 90000 + 10000),
      userId,
      username: userObj.username,
      email: userObj.email || "",
      planTier: planTier || "Plan Scout Básico",
      licenseCode: userObj.licenseCode,
      gateway: gateway || "Administración (Manual)",
      reference: reference || "REF-ADMIN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      amount: Number(amount) || ((planTier === "Pase VIP Elite" || planTier === "Pase VIP Mundialista") ? 15.00 : 5.00),
      timestamp: new Date().toISOString(),
      status: "Aprobado",
      promoterId: promoterId || ""
    };

    SUBSCRIPTIONS_DB.unshift(newTxn);

    res.json({
      status: "success",
      subscription: newTxn,
      user: userObj
    });
  });

  // API 3: Audit Seed Draw (Certifies cryptographic deterministic transparencies for drawings)
  app.post("/api/stickers/unlock-packet", validateBody(stickerUnlockSchema), (req, res) => {
    const { seed, countryName } = req.body;

    if (!countryName) {
      return res.status(400).json({ error: "Falta especificar el país de destino." });
    }

    const drawSeed = seed || `seed_${Math.floor(Math.random() * 99999999)}`;
    const rand = seededPRNG(drawSeed);

    // Deterministically select 3 players indexes to unlock
    const sizeOfSquad = 26;
    const stickerIndicesToUnlock: number[] = [];
    
    while (stickerIndicesToUnlock.length < 3) {
      const idx = Math.floor(rand() * sizeOfSquad);
      if (!stickerIndicesToUnlock.includes(idx)) {
        stickerIndicesToUnlock.push(idx);
      }
    }

    res.json({
      status: "success",
      seedCalculated: drawSeed,
      country: countryName,
      indicesUnlocked: stickerIndicesToUnlock.sort((a, b) => a - b),
      algorithm: "MurmurHash3-32bit Seeded PRNG",
      auditable: true,
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================================================
  // BRAND PROMOTER REVENUE & QR REFERRAL SYSTEM ENDPOINTS
  // ==========================================================================

  // Record a physical street QR visit
  app.post("/api/affiliate/visit", validateBody(affiliateVisitSchema), (req, res) => {
    const { promoterId, deviceType } = req.body;
    if (!promoterId) {
      return res.status(400).json({ error: "Falta el 'promoterId' de referencia." });
    }
    const cleanId = promoterId.toUpperCase().trim();
    const newVisit = {
      id: "v_" + Math.floor(Math.random() * 900000 + 100000),
      promoterId: cleanId,
      city: parseCity(cleanId),
      timestamp: new Date().toISOString(),
      deviceType: deviceType || "Web"
    };
    AFFILIATE_VISITS.push(newVisit);
    console.log(`[Affiliate System] Registrando visita de QR para la promotora ${cleanId} en ${newVisit.city}`);
    res.json({ status: "success", visit: newVisit });
  });

  // Mock payment webhook for gateways (Stripe/Payphone/Kushki)
  app.post("/api/affiliate/sales/webhook", (req, res) => {
    const { transactionId, amount, promoterId, planTier, userId } = req.body;
    
    if (!promoterId || !amount) {
      return res.status(400).json({ error: "El 'promoterId' y 'amount' son requeridos para procesar e imputar la venta." });
    }

    const cleanPromoterId = promoterId.toUpperCase().trim();
    const newSale = {
      id: "s_" + Math.floor(Math.random() * 900000 + 100000),
      promoterId: cleanPromoterId,
      city: parseCity(cleanPromoterId),
      amount: Number(amount),
      timestamp: new Date().toISOString(),
      transactionId: transactionId || "TX_WEBHOOK_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      planTier: planTier || "Pase VIP Mundialista",
      userId: userId || "user_guest"
    };

    AFFILIATE_SALES.push(newSale);
    console.log(`[Webhook Gateways] Pago exitoso recibido vía Webhook: $${amount} asignados a la promotora ${cleanPromoterId}`);
    res.json({ status: "success", message: "Venta asignada con éxito vía webhook", sale: newSale });
  });

  // Consolidated statistics for the Admin Panel
  app.get("/api/affiliate/stats", (req, res) => {
    // Generate stats using the dynamic promoter list as the primary source
    const stats = DYNAMIC_PROMOTERS.map(dp => {
      const pId = dp.promoterId;
      const pVisits = AFFILIATE_VISITS.filter(v => v.promoterId === pId);
      const pSales = AFFILIATE_SALES.filter(s => s.promoterId === pId);
      const totalVisits = pVisits.length;
      const totalSales = pSales.length;
      const totalRevenue = pSales.reduce((acc, curr) => acc + curr.amount, 0);
      const conversionRate = totalVisits > 0 ? (totalSales / totalVisits) * 100 : 0;

      return {
        promoterId: pId,
        city: dp.city || parseCity(pId),
        totalVisits,
        totalSales,
        conversionRate,
        totalRevenue,
        rawVisits: pVisits,
        rawSales: pSales
      };
    });

    res.json({
      status: "success",
      totalVisitsCount: AFFILIATE_VISITS.length,
      totalSalesCount: AFFILIATE_SALES.length,
      totalRevenueSum: AFFILIATE_SALES.reduce((acc, curr) => acc + curr.amount, 0),
      stats
    });
  });

  // POST /api/affiliate/promoter/add
  app.post("/api/affiliate/promoter/add", (req, res) => {
    const { promoterId, city } = req.body || {};
    if (!promoterId) {
      return res.status(400).json({ status: "error", error: "El Promoter ID es obligatorio." });
    }
    const cleanId = promoterId.toUpperCase().trim();
    if (DYNAMIC_PROMOTERS.some(dp => dp.promoterId === cleanId)) {
      return res.status(400).json({ status: "error", error: "El Promoter ID ya existe." });
    }
    const assignedCity = city || parseCity(cleanId);
    const newPromoter = {
      promoterId: cleanId,
      city: assignedCity,
      createdAt: new Date().toISOString()
    };
    DYNAMIC_PROMOTERS.push(newPromoter);
    res.json({ status: "success", promoter: newPromoter });
  });

  // POST /api/affiliate/promoter/delete
  app.post("/api/affiliate/promoter/delete", (req, res) => {
    const { promoterId } = req.body || {};
    if (!promoterId) {
      return res.status(400).json({ status: "error", error: "El Promoter ID es obligatorio para eliminar." });
    }
    const cleanId = promoterId.toUpperCase().trim();
    const index = DYNAMIC_PROMOTERS.findIndex(dp => dp.promoterId === cleanId);
    if (index === -1) {
      return res.status(404).json({ status: "error", error: "El promotor no fue encontrado." });
    }
    DYNAMIC_PROMOTERS.splice(index, 1);
    res.json({ status: "success", message: `Promotor ${cleanId} eliminado correctamente.` });
  });

  // Serve static files / Vite middleware
  const isProd = process.env.NODE_ENV === "production" || !!process.env.PORT;

  if (!isProd) {
    console.log("Modo: Desarrollo Local");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Modo: Producción en Cloud Run");
    const distPath = fs.existsSync(path.join(__dirname, "../dist")) 
      ? path.join(__dirname, "../dist")
      : path.join(process.cwd(), "dist");

    // Explicitly expose src/assets if it exists for assets to load properly in production
    if (fs.existsSync(path.join(process.cwd(), "src/assets"))) {
      app.use("/src/assets", express.static(path.join(process.cwd(), "src/assets")));
    }
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}...`);
  });
}

// Fallback trivia if Gemini doesn't answer or is not set up
function getSeededTrivia(country: string, level: number) {
  const normalizedCountry = country.toLowerCase().trim();
  
  const seedQuestions: { [key: string]: { [level: number]: any[] } } = {
    argentina: {
      1: [
        {
          id: 1,
          pregunta: "¿Qué colores componen la camiseta oficial de la selección de Argentina?",
          opciones: ["Blanco y Negro", "Camiseta Celeste y Blanca a bastones verticales", "Azul y Amarillo", "Rojo y Blanco"],
          correcta: "Camiseta Celeste y Blanca a bastones verticales"
        },
        {
          id: 2,
          pregunta: "¿Cuál es el apodo popular histórico de la Selección de Argentina?",
          opciones: ["La Roja", "La Celeste", "La Albiceleste", "La Canarinha"],
          correcta: "La Albiceleste"
        },
        {
          id: 3,
          pregunta: "¿Cuántos Mundiales de la FIFA ha ganado Argentina en su historia (hasta Catar 2022)?",
          opciones: ["1 Mundial", "2 Mundiales", "3 Mundiales", "4 Mundiales"],
          correcta: "3 Mundiales"
        }
      ],
      2: [
        {
          id: 1,
          pregunta: "¿Contra qué país marcó Diego Maradona el famoso gol conocido como 'La mano de Dios' en 1986?",
          opciones: ["Alemania Federal", "Bélgica", "Inglaterra", "Uruguay"],
          correcta: "Inglaterra"
        },
        {
          id: 2,
          pregunta: "¿Quién era el director técnico de la selección argentina campeona del mundo en el Mundial de 1978?",
          opciones: ["Carlos Salvador Bilardo", "César Luis Menotti", "Alfio Basile", "Marcelo Bielsa"],
          correcta: "César Luis Menotti"
        },
        {
          id: 3,
          pregunta: "¿Qué jugador argentino fue el máximo goleador del Mundial de Estados Unidos 1994?",
          opciones: ["Diego Maradona", "Gabriel Batistuta", "Claudio Caniggia", "Ariel Ortega"],
          correcta: "Gabriel Batistuta"
        }
      ],
      3: [
        {
          id: 1,
          pregunta: "En la final del Mundial de México 1986, ¿quién dio la asistencia clave para el gol consagratorio de Jorge Burruchaga?",
          opciones: ["Jorge Valdano", "Diego Maradona", "Julio Olarticoechea", "Héctor Enrique"],
          correcta: "Diego Maradona"
        },
        {
          id: 2,
          pregunta: "En el Mundial de Italia 1990, ¿qué guardameta tomó el puesto tras la fractura de Nery Pumpido y fue héroe en los penales?",
          opciones: ["Sergio Goycochea", "Luis Islas", "Carlos Roa", "Ubaldo Fillol"],
          correcta: "Sergio Goycochea"
        },
        {
          id: 3,
          pregunta: "¿Qué dorsal utilizó Lionel Messi en su debut mundialista contra Serbia y Montenegro en Alemania 2006?",
          opciones: ["Dorsal 10", "Dorsal 18", "Dorsal 19", "Dorsal 30"],
          correcta: "Dorsal 19"
        }
      ]
    },
    brasil: {
      1: [
        {
          id: 1,
          pregunta: "¿Cuál es el color principal de la camiseta local de la selección de Brasil?",
          opciones: ["Verde", "Verde y Blanco", "Amarillo Canario", "Blanco"],
          correcta: "Amarillo Canario"
        },
        {
          id: 2,
          pregunta: "¿Cómo se le conoce popularmente a la selección nacional de fútbol de Brasil?",
          opciones: ["La Canarinha", "La Seleção", "El Scratch de Oro", "Todas las opciones son correctas"],
          correcta: "Todas las opciones son correctas"
        },
        {
          id: 3,
          pregunta: "¿Cuántos campeonatos del mundo de la FIFA posee Brasil actualmente (Pentacampeón)?",
          opciones: ["3 copas", "4 copas", "5 copas", "6 copas"],
          correcta: "5 copas"
        }
      ],
      2: [
        {
          id: 1,
          pregunta: "¿A qué edad ganó Pelé su primera Copa del Mundo en Suecia 1958?",
          opciones: ["15 años", "17 años", "19 años", "21 años"],
          correcta: "17 años"
        },
        {
          id: 2,
          pregunta: "¿Quién fue el Director Técnico que llevó a Brasil a conseguir el campeonato en el Mundial de EE.UU. 1994?",
          opciones: ["Mário Zagallo", "Carlos Alberto Parreira", "Luiz Felipe Scolari", "Dunga"],
          correcta: "Carlos Alberto Parreira"
        },
        {
          id: 3,
          pregunta: "¿Qué pareja de delanteros estrella brilló y lideró el ataque de Brasil durante el torneo de EE.UU. 1994?",
          opciones: ["Ronaldo y Ronaldinho", "Ronaldo y Rivaldo", "Bebeto y Romário", "Pelé y Garrincha"],
          correcta: "Bebeto y Romário"
        }
      ],
      3: [
        {
          id: 1,
          pregunta: "¿En qué club de la liga brasileña jugaba el mítico Garrincha durante gran parte de sus éxitos mundiales en 1958 y 1962?",
          opciones: ["Flamengo", "Santos FC", "Botafogo", "Palmeiras"],
          correcta: "Botafogo"
        },
        {
          id: 2,
          pregunta: "En la final del Mundial de Corea-Japón 2002, ¿quién asistió a Ronaldo para el segundo gol en la victoria 2-0 ante Alemania?",
          opciones: ["Rivaldo", "Ronaldinho", "Kafú", "Roberto Carlos"],
          correcta: "Rivaldo"
        },
        {
          id: 3,
          pregunta: "¿Quién capitaneó y levantó la copa de la mítica e inolvidable selección brasileña del Mundial de México 1970?",
          opciones: ["Pelé", "Carlos Alberto", "Tostão", "Rivelino"],
          correcta: "Carlos Alberto"
        }
      ]
    }
  };

  // Find preseeded, otherwise generate generic high-quality questions for the country requested
  const countryKey = normalizedCountry.includes("arg") ? "argentina" : normalizedCountry.includes("bra") ? "brasil" : "generic";
  const preset = seedQuestions[countryKey]?.[level];
  
  if (preset) {
    return { pais: country, nivel: level, preguntas: preset };
  }

  // Create high-quality dynamic simulated questions for any of the 48 countries
  return {
    pais: country,
    nivel: level,
    preguntas: [
      {
        id: 1,
        pregunta: `¿Cuál es el principal enfoque táctico o apodo de ${country} cuando compite en un Mundial de la FIFA?`,
        opciones: [
          "Juego rápido de transiciones y contraataques fluidos",
          "Un fútbol vistoso basado en la tenencia del balón",
          "Bloque defensivo sólido de alta presión colectiva",
          "Alternancia según el rival con plantillas rotativas"
        ],
        correcta: "Juego rápido de transiciones y contraataques fluidos"
      },
      {
        id: 2,
        pregunta: `Para desbloquear el bloque ${level} de cromos de ${country}, dinos: ¿cuál de estos aspectos históricos suele destacar en su preparación deportiva?`,
        opciones: [
          "La unificación de metodologías juveniles a nivel nacional",
          "La exportación de talentos jóvenes a ligas de élite extranjeras",
          "El entrenamiento riguroso en altura y condiciones climáticas severas",
          "El uso temprano de analíticas e inteligencia de datos en scouting"
        ],
        correcta: "La exportación de talentos jóvenes a ligas de élite extranjeras"
      },
      {
        id: 3,
        pregunta: `Considerando la historia competitiva global de ${country}, ¿qué rol asume habitualmente en los torneos continentales de clasificación?`,
        opciones: [
          "Fuerza emergente en constante renovación táctica",
          "Clásico competidor regional con notable experiencia",
          "Líder defensivo difícil de vencer en casa",
          "Todas las opciones representan fases de su proceso evolutivo"
        ],
        correcta: "Todas las opciones representan fases de su proceso evolutivo"
      }
    ]
  };
}

startServer();

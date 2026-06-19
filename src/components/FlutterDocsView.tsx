import React, { useState } from 'react';
import { Copy, Check, FileText, FolderTree, Code, Sparkles, BookOpen } from 'lucide-react';

export default function FlutterDocsView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const folderStructureText = `scouting_album_app/
├── android/
├── ios/
├── web/
├── assets/
│   ├── images/
│   └── fonts/
└── lib/
    ├── main.dart
    ├── core/
    │   ├── errors/
    │   │   └── failures.dart
    │   ├── theme/
    │   │   └── app_theme.dart
    │   └── utils/
    │       └── constants.dart
    ├── data/
    │   ├── datasources/
    │   │   ├── local/
    │   │   │   └── local_storage_datasource.dart
    │   │   └── remote/
    │   │       ├── firebase_datasource.dart
    │   │       └── gemini_api_datasource.dart
    │   ├── models/
    │   │   └── player_model.dart
    │   └── repositories/
    │       └── scouting_repository_impl.dart
    ├── domain/
    │   ├── entities/
    │   │   └── player_entity.dart
    │   ├── repositories/
    │   │   └── scouting_repository.dart
    │   └── usecases/
    │       ├── get_trivia_usecase.dart
    │       ├── save_tactical_board_usecase.dart
    │       └── calculate_score_usecase.dart
    └── presentation/
        ├── blocs/
        │   ├── trivia/
        │   │   ├── trivia_bloc.dart
        │   │   └── trivia_event.dart
        │   └── tactical_board/
        │       ├──board_bloc.dart
        │       └──board_state.dart
        └── pages/
            ├── album_page.dart
            ├── trivia_page.dart
            ├── tactical_board_page.dart
            └── leaderboard_page.dart`;

  const playerModelCode = `// lib/data/models/player_model.dart

import 'dart:convert';

class PlayerModel {
  final String id;
  final String name;         // Nombre Artístico o descriptivo (Ej. "El 10 de Argentina")
  final String realName;     // Nombre Factual Físico (sin infracción DA, ej. L. Messi)
  final String country;
  final int age;
  final double weight;       // En kg
  final double height;       // En cm
  final String dominantFoot; // "Izquierdo" | "Derecho" | "Ambidiestro"
  final String currentClub;
  final int rating;          // Calificación global (0 - 100)
  final String styleOfPlay;  // Descripción detallada producida por IA de Scouting

  PlayerModel({
    required this.id,
    required this.name,
    required this.realName,
    required this.country,
    required this.age,
    required this.weight,
    required this.height,
    required this.dominantFoot,
    required this.currentClub,
    required this.rating,
    required this.styleOfPlay,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'realName': realName,
      'country': country,
      'age': age,
      'weight': weight,
      'height': height,
      'dominantFoot': dominantFoot,
      'currentClub': currentClub,
      'rating': rating,
      'styleOfPlay': styleOfPlay,
    };
  }

  factory PlayerModel.fromMap(Map<String, dynamic> map) {
    return PlayerModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      realName: map['realName'] ?? '',
      country: map['country'] ?? '',
      age: map['age']?.toInt() ?? 0,
      weight: map['weight']?.toDouble() ?? 0.0,
      height: map['height']?.toDouble() ?? 0.0,
      dominantFoot: map['dominantFoot'] ?? 'Derecho',
      currentClub: map['currentClub'] ?? '',
      rating: map['rating']?.toInt() ?? 0,
      styleOfPlay: map['styleOfPlay'] ?? '',
    );
  }

  String toJson() => json.encode(toMap());

  factory PlayerModel.fromJson(String source) => PlayerModel.fromMap(json.decode(source));
}`;

  const geminiServiceCode = `// lib/data/datasources/remote/gemini_api_datasource.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

class GeminiApiDatasource {
  final String apiKey;
  final String _baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  GeminiApiDatasource({required this.apiKey});

  /// Invocación directa a Gemini 1.5 Flash para generación de trivias de fútbol de 3 niveles
  Future<Map<String, dynamic>> generateTrivia({
    required String country,
    required int level,
  }) async {
    final String difficulty = level == 1 ? 'Fácil' : level == 2 ? 'Media' : 'Difícil';
    
    final String prompt = """
Genera una trivia interactiva de fútbol de exactamente 3 preguntas de opción múltiple para el país: \$country.
Nivel de dificultad: Nivel \$level (\$difficulty).
La estructura debe seguir estrictamente este esquema JSON:
{
  "pais": "\$country",
  "nivel": \$level,
  "preguntas": [
    {
      "id": 1,
      "pregunta": "¿Texto pregunta?",
      "opciones": ["A", "B", "C", "D"],
      "correcta": "A"
    }
  ]
}
Responde únicamente en idioma Español, asegurando que las opciones de respuestas sean realistas pero que solo una sea la correcta exacta.
""";

    final url = Uri.parse('\$_baseUrl/gemini-1.5-flash:generateContent?key=\$apiKey');
    
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'contents': [
          {
            'parts': [{'text': prompt}]
          }
        ],
        'generationConfig': {
          'responseMimeType': 'application/json',
        }
      }),
    );

    if (response.statusCode == 200) {
      final jsonResponse = json.decode(response.body);
      final String textContent = jsonResponse['candidates'][0]['content']['parts'][0]['text'];
      return json.decode(textContent.trim());
    } else {
      throw Exception('Fallo en la comunicación con la API de Google AI Studio: \${response.body}');
    }
  }
}`;

  const tacticalPitchWidgetCode = `// lib/presentation/widgets/tactical_pitch_widget.dart

import 'package:flutter/material.dart';
import '../../data/models/player_model.dart';

class TacticalPitchWidget extends StatefulWidget {
  final List<PlayerModel> unlockedPlayers;
  final Map<String, PlayerModel?> currentFormation; // Map: "PositionLabel" -> Player
  final Function(String positionLabel, PlayerModel player) onPlayerPlaced;

  const TacticalPitchWidget({
    Key? key,
    required this.unlockedPlayers,
    required this.currentFormation,
    required this.onPlayerPlaced,
  }) : super(key: key);

  @override
  State<TacticalPitchWidget> createState() => _TacticalPitchWidgetState();
}

class _TacticalPitchWidgetState extends State<TacticalPitchWidget> {
  // Coordenadas relativas (x, y de 0.0 a 1.0) para un esquema 4-3-3
  final Map<String, Offset> positionOffsets = {
    'POR': const Offset(0.5, 0.88),
    'LI': const Offset(0.15, 0.70),
    'DFC1': const Offset(0.38, 0.72),
    'DFC2': const Offset(0.62, 0.72),
    'LD': const Offset(0.85, 0.70),
    'MCD': const Offset(0.5, 0.52),
    'MC1': const Offset(0.30, 0.46),
    'MC2': const Offset(0.70, 0.46),
    'EI': const Offset(0.20, 0.22),
    'DC': const Offset(0.5, 0.16),
    'ED': const Offset(0.80, 0.22),
  };

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;
        final double height = constraints.maxHeight;

        return Container(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F4C1B), Color(0xFF14732C)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white24, width: 2),
            boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 12)],
          ),
          child: Stack(
            children: [
              // 1. Líneas de cancha del campo verde
              Positioned.fill(
                child: CustomPaint(
                  painter: PitchLinesPainter(),
                ),
              ),

              // 2. Drag targets dinámicos de las 11 posiciones
              ...positionOffsets.entries.map((entry) {
                final String posKey = entry.key;
                final Offset relativeOffset = entry.value;
                final PlayerModel? currentPlayer = widget.currentFormation[posKey];

                return Positioned(
                  left: relativeOffset.dx * width - 35,
                  top: relativeOffset.dy * height - 35,
                  width: 70,
                  height: 90,
                  child: DragTarget<PlayerModel>(
                    onWillAcceptWithDetails: (details) => !widget.currentFormation.values.contains(details.data),
                    onAcceptWithDetails: (details) => widget.onPlayerPlaced(posKey, details.data),
                    builder: (context, candidateData, rejectedData) {
                      return GestureDetector(
                        onTap: () => _showPlayerSelectionSheet(context, posKey),
                        child: Column(
                          children: [
                            Container(
                              width: 50,
                              height: 50,
                              decoration: BoxDecoration(
                                color: candidateData.isNotEmpty 
                                    ? Colors.emeraldAccent.withOpacity(0.4)
                                    : (currentPlayer != null ? Colors.slate[950] : Colors.black45),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: currentPlayer != null ? Colors.emeraldAccent : Colors.white38,
                                  width: 2,
                                ),
                              ),
                              child: Center(
                                child: currentPlayer != null
                                    ? Text(
                                        currentPlayer.realName.substring(0, 3).toUpperCase(),
                                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                      )
                                    : Text(
                                        posKey,
                                        style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                              ),
                            ),
                            if (currentPlayer != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4.0),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 4, py: 2),
                                  color: Colors.black85,
                                  child: Text(
                                    currentPlayer.realName,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: Colors.white, fontSize: 8),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                );
              }).toList(),
            ],
          ),
        );
      },
    );
  }

  void _showPlayerSelectionSheet(BuildContext context, String posLabel) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.grey[900],
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return ListView.builder(
          itemCount: widget.unlockedPlayers.length,
          itemBuilder: (context, index) {
            final player = widget.unlockedPlayers[index];
            return ListTile(
              title: Text(player.realName, style: const TextStyle(color: Colors.white)),
              subtitle: Text(player.currentClub, style: const TextStyle(color: Colors.white54)),
              trailing: Text('Rating \${player.rating}', style: const TextStyle(color: Colors.emeraldAccent)),
              onTap: () {
                widget.onPlayerPlaced(posLabel, player);
                Navigator.pop(context);
              },
            );
          },
        );
      },
    );
  }
}

class PitchLinesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white24
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Línea central
    canvas.drawLine(Offset(0, size.height / 2), Offset(size.width, size.height / 2), paint);
    // Círculo central
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), 50.0, paint);
    // Área chica norte
    canvas.drawRect(Rect.fromLTWH(size.width / 4, 0, size.width / 2, size.height / 6), paint);
    // Área chica sur
    canvas.drawRect(Rect.fromLTWH(size.width / 4, size.height - (size.height / 6), size.width / 2, size.height / 6), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}`;

  const scoringEngineCode = `// lib/utils/scoring_engine.dart

class ScoringEngine {
  /// Algoritmo de cálculo de puntuación (Módulo 4 y 5)
  /// Reglas de negocio:
  /// - Por cada jugador colocado en el XI inicial del usuario que coincida
  ///   exactamente con el XI inicial oficial para ese partido: +1 punto
  /// - Por acertar el marcador exacto (Goles Local y Goles Visitante): +5 puntos
  static int calculateUserPoints({
    required List<String> userTacticalXIIds,       // Player IDs colocados en la pizarra
    required List<String> officialStartingXIIds,   // Player IDs que jugaron de inicio oficiales
    required int predictedLocalGoals,
    required int predictedVisitorGoals,
    required int actualLocalGoals,
    required int actualVisitorGoals,
  }) {
    int points = 0;

    // 1. Verificación de alineaciones
    for (var playerId in userTacticalXIIds) {
      if (officialStartingXIIds.contains(playerId)) {
        points += 1; // +1 Punto por jugador coincidente
      }
    }

    // 2. Verificación de pronóstico del marcador
    if (predictedLocalGoals == actualLocalGoals && 
        predictedVisitorGoals == actualVisitorGoals) {
      points += 5; // +5 Puntos por marcador exacto confirmado
    }

    return points;
  }
}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-8" id="flutter-docs-panel">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-bold text-white text-base">Módulo Flutter (Arquitectura Limpia)</h3>
            <p className="text-gray-450 text-xs mt-0.5">Estructuras, clases y lógicas para el desarrollador Solopreneur</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
          <Sparkles className="w-3 h-3 anim-pulse" />
          Architectural Blueprint
        </div>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        El siguiente contenido ha sido compilado bajo los lineamientos de un <strong>Arquitecto de Software Senior</strong> para el traspaso limpio de este álbum interactivo a una base de código híbrida de <strong>Flutter con clean architecture (patrón BLoC)</strong>. Puedes navegar y copiar cada archivo de forma independiente.
      </p>

      {/* Grid of code resources */}
      <div className="grid grid-cols-1 gap-6">

        {/* 1. Folder structure */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-emerald-400" /> Estructura de Proyecto (Clean BLoC)
            </span>
            <button
              onClick={() => handleCopyToClipboard('folders', folderStructureText)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer bg-slate-900 px-2 py-1 rounded"
            >
              {copiedKey === 'folders' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'folders' ? 'Copiado' : 'Copiar Árbol'}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-gray-400 overflow-x-auto bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 max-h-[300px] whitespace-pre">
            {folderStructureText}
          </pre>
        </div>

        {/* 2. player_model.dart */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" /> lib/data/models/player_model.dart
            </span>
            <button
              onClick={() => handleCopyToClipboard('model', playerModelCode)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer bg-slate-900 px-2 py-1 rounded"
            >
              {copiedKey === 'model' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'model' ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-gray-400 overflow-x-auto bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 max-h-[300px] whitespace-pre">
            {playerModelCode}
          </pre>
        </div>

        {/* 3. gemini_api_datasource.dart */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" /> lib/data/datasources/remote/gemini_api_datasource.dart
            </span>
            <button
              onClick={() => handleCopyToClipboard('gemini', geminiServiceCode)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer bg-slate-900 px-2 py-1 rounded"
            >
              {copiedKey === 'gemini' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'gemini' ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-gray-400 overflow-x-auto bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 max-h-[300px] whitespace-pre">
            {geminiServiceCode}
          </pre>
        </div>

        {/* 4. tactical_pitch_widget.dart */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" /> lib/presentation/widgets/tactical_pitch_widget.dart
            </span>
            <button
              onClick={() => handleCopyToClipboard('widget', tacticalPitchWidgetCode)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer bg-slate-900 px-2 py-1 rounded"
            >
              {copiedKey === 'widget' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'widget' ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-gray-400 overflow-x-auto bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 max-h-[300px] whitespace-pre">
            {tacticalPitchWidgetCode}
          </pre>
        </div>

        {/* 5. scoring_engine.dart */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" /> lib/utils/scoring_engine.dart
            </span>
            <button
              onClick={() => handleCopyToClipboard('score', scoringEngineCode)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px] font-mono cursor-pointer bg-slate-900 px-2 py-1 rounded"
            >
              {copiedKey === 'score' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'score' ? 'Copiado' : 'Copiar Código'}
            </button>
          </div>
          <pre className="text-[11px] font-mono leading-relaxed text-gray-400 overflow-x-auto bg-slate-950/80 p-3 rounded-lg border border-slate-900/60 max-h-[300px] whitespace-pre">
            {scoringEngineCode}
          </pre>
        </div>

      </div>
    </div>
  );
}

# AGENTS.md - Instrucciones del Sistema del Agente
## Proyecto: Álbum Trivia Mundial 2026

Este archivo proporciona la guía conceptual, directrices técnicas, de diseño y convenciones del sistema que deben ser respetadas de manera estricta durante el desarrollo del proyecto.

---

### 1. Rol y Enfoque del Desarrollador
- **Persona**: Arquitecto de Software Fullstack Senior.
- **Objetivo**: Desarrollar la aplicación **"Álbum Trivia Mundial 2026"** con máxima calidad técnica, código modular altamente reusable, tipado estricto y total seguridad en la gestión de sorteos/canjes.
- **Pilares Clave**:
  1. **Código Limpio (Clean Code)**: Separación absoluta de la lógica de interfaz de usuario de las bases de datos de datos duros.
  2. **Rendimiento Móvil**: Diseño ágil adaptado a dispositivos móviles de gama de entrada/media.
  3. **Seguridad y Auditabilidad**: Arquitectura robusta idónea para auditorías de sorteos en la adjudicación de coleccionables de jugador y cómputo de trivias.

---

### 2. Normas de Arquitectura y TypeScript
- **Centralización de Modelos**: Todos los esquemas y contratos de datos deben declararse de forma centralizada en `/src/types.ts`. Está estrictamente prohibido duplicar interfaces de tipo `Player`, `Match`, `Trivia` o `User` en archivos de componentes locales.
- **Pureza de Importaciones**: Las declaraciones de importación deben estar ubicadas en la parte superior del archivo. Usar importaciones con nombre directas en lugar de desestructuración genérica tardía. No importar enums usando la nomenclatura `import type`.
- **Roster Factual**: Para el manejo de jugadores, se consume el módulo unificado de `/src/data/squadsData.ts` con sus respectivos bloques divididos por tokens. Se mantendrá el parseo robusto para limpiar de forma segura cualquier prefijo posicional OCR residual de datos crudos (ej. "PO ", "DF ", "MC ", "DC ", "PO|").

---

### 3. Pauta de Sorteos, Trivia y Canjes Auditable
- **Determinismo y Semilla**: Cualquier reparto de sobres de cromos (stickers) por responder trivias o por acciones del sistema debe ser determinista, predecible y auditable. Si una rutina permite el uso de una semilla pseudoaleatoria (`seed`), esta se debe priorizar en ambientes de validación física o digital para certificar la transparencia de los sorteos y evitar vulnerabilidades de manipulación del cliente.
- **Transaccionalidad**: El desbloqueo de cromos y suma de puntajes en el álbum debe resolverse de manera atómica, previniendo duplicaciones indeseadas por re-intentos de peticiones de red o clics repetitivos en la interfaz de usuario.

---

### 4. Pizarra Táctica y Usabilidad Móvil
- **Pizarra Táctica Operativa**: Elementos visuales dinámicos interactivos de arrastre (drag-and-drop) en `/src/components/ActivePitch.tsx` deben funcionar con eventos táctiles óptimos (`onTouchStart`, `onTouchMove`, `onTouchEnd`) configurados de manera no bloqueante.
- **Optimización de Pantalla**: Priorizar distribuciones compactas en móviles. Usar amplios espacios negativos con márgenes elegantes, hojas de diálogo deslizables desde la base (bottom-drawer sheets) y listados virtuales si la lista de elementos en pantalla es densa.
- **Accesibilidad y Touch Targets**: Diseñar botones y controles interactivos respetando la norma de objetivos táctiles mínimos de `44px` por `44px`. Cumplir con la relación de contraste WCAG AA para textos medianos y pequeños.

---

### 5. Consistencia de Diseño y Estética
- **Paleta de Colores Profesional**: Utilizar colores limpios, de alta visibilidad, combinando matices oscuros elegantes o un tema claro sofisticado de alto contraste. No usar degradados sobresaturados sin justificación conceptual.
- **Tipografía Limpia**: Emplear tipografías sans-serif nítidas (Inter) para la interfaz general, y fuentes monoespaciadas legibles para tableros numéricos de estadísticas, records o marcas de auditoría de sorteos.

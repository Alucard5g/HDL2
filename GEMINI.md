# GEMINI.md - Directrices de Generación de Código para IA
## Álbum Trivia Mundial 2026

Este archivo describe las instrucciones de codificación, optimización y prevención de errores críticas para los modelos de Inteligencia Artificial que colaboren en este repositorio.

---

### 1. Manejo Estricto de useEffect y Rerenders
- **Antipatrón de Re-renders Infinitos**: Queda estrictamente prohibido disparar cambios de estado directo en el cuerpo del componente React o incluir dependencias mutables (objetos complejos, arreglos o funciones declaradas in-line) dentro del arreglo de dependencias de `useEffect`.
- **Fidelidad del Dependency Array**: El arreglo de dependencias de `useEffect` debe ser primitivo (strings, numbers, booleans, etc.). Si se requieren dependencias densas, deben estar previamente memorizadas o estabilizadas con `useMemo` o `useCallback` fuera del componente.

---

### 2. Estilo de los Componentes React
- **Uso de Hooks**: Priorizar siempre componentes funcionales puros. Separar los hooks customizados para controlar la persistencia del estado en el álbum de cromos y trivias.
- **Iconografía**: Utilizar exclusivamente íconos de la librería `lucide-react`. Está prohibida la inserción manual de paths SVG extensos en línea dentro del marcado para evitar saturar el límite de tokens y mantener excelente orden visual.
- **Interactividad Intuitiva**: Asegurar que las llamadas de acción por parte del usuario incluyan transiciones de estado ágiles provistas por `motion` de `motion/react`.

---

### 3. Modularidad y Mitigación de Límites de Tokens de IA
- No concentrar lógica dispar en un único archivo gigante (p. ej., evitar colapsar la lógica de juego secundaria y autenticación dentro de `App.tsx`).
- Si un componente supera las 400 líneas de código, se debe fragmentar en sub-componentes especializados ubicados en la carpeta `/src/components/` o almacenar constantes de datos estáticos en `/src/data/`.

---

### 4. Seguridad de Claves API en Frontend (No-Exposición)
- Las claves del sistema o tokens delicados jamás se deben colocar directamente en el código de lado del cliente en variables públicas ni formularios UI directos.
- Definir variables de entorno en el archivo `.env.example` y consumirlas mediante interfaces seguras.

---

Al editar cualquier característica del sistema, el modelo consultará y complementará este archivo con prácticas aprendidas para consolidar la base histórica de automatización del proyecto.

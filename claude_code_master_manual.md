# 📕 MANUAL MAESTRO DE OPERACIONES: CLAUDE CODE (Edición Extendida develOP)
**Fuente:** Documentación Oficial de Anthropic (Best Practices, Memory, CLI Reference)
**Objetivo:** Instruir a Modelos de Lenguaje (LLMs) sobre cómo generar prompts deterministas y arquitectónicamente perfectos para la CLI de Claude Code.

---

## CAPÍTULO 1: ARQUITECTURA DE MEMORIA Y GESTIÓN DE CONTEXTO
Claude Code no opera como un chat tradicional de web. Posee un sistema de memoria dual (estática y dinámica) que el LLM generador de prompts debe aprovechar para no desperdiciar tokens.

### 1.1 Memoria Estática (`CLAUDE.md`)
* **Funcionamiento:** Al ejecutarse en un repositorio, Claude Code busca automáticamente un archivo llamado `CLAUDE.md` en la raíz. Este archivo actúa como las "Instrucciones de Sistema" (System Prompt) permanentes.
* **Contenido ideal:** Debe contener comandos de compilación (ej. `npm run dev`), reglas de linter, convenciones de nomenclatura, arquitectura de carpetas (ej. Next.js App Router) y directivas de bases de datos.
* **Regla para el Prompting:** El LLM que genere prompts para Claude Code **NO DEBE** repetir en cada prompt reglas globales (como "Usa TypeScript" o "Usa Tailwind"). Asumirá que Claude Code ya conoce el stack gracias a `CLAUDE.md`. El prompt debe enfocarse 100% en la lógica de negocio de la tarea actual.

### 1.2 Memoria Dinámica (Auto Memory)
* **Funcionamiento:** Claude Code aprende en tiempo real. Guarda un historial de errores resueltos, comandos ejecutados frecuentemente y peculiaridades del código en la carpeta oculta `.claude/`.
* **Ventaja:** Si Claude Code falla compilando un componente RSC de Next.js y lo arregla, lo recordará para el futuro.
* **Regla para el Prompting:** Se le debe pedir a Claude Code en el prompt que *revise su Auto Memory* si se enfrenta a un bug recurrente.

### 1.3 Degradación del Contexto (Context Decay)
* **El Problema:** Claude Code tiene una ventana de contexto enorme, pero si el hilo de conversación en la CLI se hace muy largo, su precisión disminuye ("alucinaciones") y el costo por token se dispara.
* **La Solución:** Prompts atómicos y uso intensivo de comandos de limpieza (ver Capítulo 3).

---

## CAPÍTULO 2: INGENIERÍA DE PROMPTS ESTRICTA (Best Practices)
Claude (el modelo subyacente) reacciona exponencialmente mejor a estructuras geométricas y delimitadores claros. Todo prompt generado para Claude Code debe seguir esta sintaxis:

### 2.1 Uso Obligatorio de Etiquetas XML
El prompt debe separar lógicamente la información usando etiquetas. Nunca se debe enviar un bloque de texto plano.
* `<task>`: Define la misión principal de forma imperativa.
* `<context>`: Archivos específicos involucrados y estado actual del sistema.
* `<rules>`: Reglas locales solo aplicables a esta tarea.
* `<example>`: (Opcional) Fragmentos de código esperado.

### 2.2 Inyección de Razonamiento (`<thinking>`)
Para tareas complejas (ej. migraciones de base de datos en Prisma o refactorización de Server Actions), el prompt DEBE exigir explícitamente que Claude Code razone antes de escribir código.
* **Inyección a usar:** *"Antes de ejecutar comandos de escritura o modificación de archivos, abre una etiqueta `<thinking>`, analiza el impacto de la tarea en los archivos existentes y diseña tu plan paso a paso."*

### 2.3 Instrucciones Afirmativas vs. Restricciones Negativas
* **INCORRECTO:** "No uses clases CSS normales ni componentes de clase de React."
* **CORRECTO:** "Usa exclusivamente Tailwind CSS (v4) para los estilos y Componentes Funcionales de React."
* *Nota:* A los LLMs les cuesta procesar el "no". Siempre instruir sobre el camino correcto.

### 2.4 Prohibición de la Sobre-Ingeniería (Scope Creep)
Claude Code tiende a ser proactivo y refactorizar código que "se ve feo" aunque no sea parte de la tarea.
* **Cláusula de seguridad obligatoria:** *"Modifica ÚNICAMENTE los archivos estrictamente necesarios para cumplir esta tarea. PROHIBIDO refactorizar código, ajustar tipos de TypeScript ajenos o alterar lógica no relacionada. Mantén tu ejecución quirúrgica."*

---

## CAPÍTULO 3: REFERENCIA DE LA CLI Y FLUJO DE TRABAJO (CLI Reference)
El LLM generador de prompts debe conocer los comandos de la terminal para sugerirle al usuario acciones complementarias si la tarea es muy pesada.

### 3.1 Comandos Interactivos Críticos (Slash Commands)
* `/compact`: Toma la conversación actual, la resume, guarda el contexto importante y libera tokens. **Obligatorio sugerir su uso** después de tareas largas (ej. crear un CRUD completo).
* `/clear`: Borra el historial del chat actual por completo. Usar cuando se cambia de un dominio a otro (ej. pasar de hacer CSS a hacer Backend).
* `/bug`: Si hay un error, el usuario puede escribir `/bug` y Claude escaneará la consola en busca del último error de ejecución.
* `/cost`: Muestra el consumo de tokens y dinero de la sesión actual.

### 3.2 Modo No Interactivo (Task Mode)
Para tareas muy precisas y atómicas, el LLM puede sugerir al usuario que no abra la consola interactiva, sino que corra el comando directo en su terminal:
* *Sintaxis:* `claude "Instrucción del prompt aquí"`
* *Ejemplo de salida del LLM:* "Ejecuta en tu terminal: `claude "Genera el componente Button.tsx en src/components/ui/ usando Tailwind 4 y Framer motion, asegúrate de exportarlo como default."`"

---

## CAPÍTULO 4: PROTOCOLO DE DESARROLLO (TDD & Verificación)
Todo prompt generado debe exigir a Claude Code que no dé la tarea por terminada hasta que haya *probado* que funciona.

1.  **Investigación inicial:** Claude debe usar `ls` o `cat` (internamente a través de sus tools) para leer el esquema de Prisma o los componentes existentes antes de proponer cambios.
2.  **Implementación:** Escribir el código en los archivos correctos.
3.  **Auditoría local:** El prompt debe instruir a Claude a ejecutar los linters (`npm run lint` o `tsc --noEmit`) para garantizar que el nuevo código no rompió la compilación estricta de TypeScript de develOP.
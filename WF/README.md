# WF — Método de trabajo de develOP

Sistema de trabajo asistido por IA (spec-driven, 3 capas: planificación → ejecución → verificación humana).

## Documentos y orden de carga
- **cimiento.md** — Comportamiento y método de la IA. Pegado en un chat, lo deja operando bajo el WF. SE CARGA en cada chat nuevo.
- **manual-resumido.md** — Referencia operativa condensada (glosario, registros, recursos, memoria, anti-patrones). SE CARGA junto al Cimiento.
- **manual.md** — Manual completo. Referencia profunda para humanos. NO se carga de base; se consulta.
- **kit-continuidad.md** — Parte 1: inicialización (abre un chat). Parte 2: finalización (cierra un chat → handoff).
- **prompts-auditoria.md** — Chat-juez de documentos (3 turnos) + auditoría de workflow. Se corren en chats FRÍOS, sin contexto del proyecto.
- **briefs/** — Briefs de arranque de chats de trabajo puntuales (ej. C6-limpieza).

## Regla de carga
Chat de trabajo = Cimiento + Manual resumido + Kit (Parte 1) + brief puntual.
Chat de validación = en frío, sin estos documentos.

## Versionado
Cada doc mantiene su changelog interno; git lleva el historial. Es el patrón contra el que se mide el drift del método.

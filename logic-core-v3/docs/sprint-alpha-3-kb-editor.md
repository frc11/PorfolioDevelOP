# Sprint Alpha.3 - Knowledge Base Editor

## Alcance

El editor de Knowledge Base ahora funciona como una herramienta de trabajo para operar KBs de clientes reales sin cambiar la API de guardado existente.

## Funcionalidades

- Editor Markdown con modos editar, preview y split.
- Preview Markdown con GitHub Flavored Markdown.
- Estimacion aproximada de tokens por seccion y total de la KB.
- Modal de confirmacion con diff visual antes de guardar.
- Busqueda full-text dentro de las 7 secciones actuales.
- Sandbox de test prompt con streaming usando la KB draft sin persistir.
- Validacion heuristica de secciones cortas, contradicciones simples y exceso de longitud.

## Contrato preservado

`KnowledgeBaseEditor` sigue aceptando:

- `botConfigId`
- `initialData`
- `orgSlug`

El guardado sigue pasando por:

- `saveKnowledgeBase`
- `saveKnowledgeBaseByOrgSlug`

Las props `botName`, `tone` y `companyName` son opcionales y se usan solo para mejorar el sandbox.

## Pendiente fuera de Alpha.3

- Historial persistente de cambios en AdminAuditLog.
- Conteo exacto de tokens con tiktoken.
- Autocomplete inteligente de KB.
- Importacion desde Google Docs.

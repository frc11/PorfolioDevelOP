# Generadores del Atlas

Portables por diseño (ENMIENDA-01 E7): **solo módulos nativos de Node y el binario de `git`**. Ningún import de `src/`, ninguna dependencia de npm. Funcionan sobre cualquier commit con `--repo` y `--ref`, y se pueden mudar a otro repo junto con la carpeta `06-ATLAS/`: el contrato son los JSON y `atlas.schema.json`, no el código de la app.

| Script | Tipo | Qué hace |
|---|---|---|
| `nodos.mjs` | permanente (módulo) | Gramática de IDs: áreas, herramientas y la regla que asigna cada ruta del repo a su nodo. Es lo único específico de este repo: una carpeta nueva de `src/` pide una regla acá. |
| `generar.mjs` | permanente | Lee el árbol de la ref y escribe `atlas.json` (nodos, aristas, entradas y control) y agrega una línea a `historial.jsonl`. |
| `vistas.mjs` | permanente | Genera `rutas.md`, `datos.md`, `dependencias.md`, `ramas.md`, `modulos/*.md` y `_indice-modulos.md` desde los JSON. |
| `alias.mjs` | permanente (módulo) | Resuelve un id de nodo citado al nodo real: alias curado de `06-ATLAS/alias.json` o, si no, el prefijo existente más largo. Lo usan `validar.mjs --emitir` y los generadores del backlog. |
| `backlog.mjs` | permanente | Genera `backlog.json` desde `07-BACKLOG.md` (E7: el .md es la fuente; las personas cambian el estado de cada tarjeta ahí). Falla si una tarjeta no tiene tamaño, nivel o nodos, o si un prerrequisito no existe. |
| `validar-atlas.mjs` | permanente | Valida los JSON contra `atlas.schema.json` y la integridad del grafo. Usa un validador propio y mínimo, para no depender de Ajv, que en este repo solo está como dependencia transitiva de eslint. |
| `semilla.mjs` | **un solo uso** (F5, 2026-10) | Sembró `funcionalidades.json`, `zonas.json`, `entradas.json` y `atlas.curado.json` desde el crudo de la auditoría. No pisa archivos que ya existan. |

Uso: ver `docs/auditoria-2026-10/06-ATLAS/regenerar.md`.

## Límites conocidos

- El árbol de la app que entra al Atlas es `src/`, `netlify/`, el código de `scripts/`, `tests/` y `prisma/` (sin `prisma/backups/`) y la config de la raíz de la app (desde C23). `.github/` y el resto de la raíz del repo quedan fuera: los hallazgos sobre CI apuntan a sus otros nodos.

- Las aristas `importa` resuelven el alias `@/` y las rutas relativas; no siguen `export *` en cadena ni imports dinámicos con plantilla.
- `usa-modelo` se detecta por la forma `<algo>.<modelo>.<método>(`: cuenta también accesos a través de `tx` o del helper de aislamiento, y puede contar un objeto ajeno que se llame igual que un modelo.
- `llama-api` busca `fetch('/api/…')` con la URL literal; los `fetch` con la URL armada en una variable no aparecen. En `57c421bc` no hubo ninguno literal.
- La zona de un nodo es la de la mayoría de sus archivos.

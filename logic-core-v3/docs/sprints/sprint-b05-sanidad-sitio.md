# SPRINT B0.5 — Sanidad del sitio público + SEO base

## Cómo correrla
- **Modelo:** Sonnet 5 · **Effort:** `/effort high` — es trabajo mecánico y totalmente especificado; el criterio ya está resuelto en este documento, no hace falta un modelo de razonamiento caro. Excepción: si en T5 (sitemap/robots) el agente duda de la estructura de rutas, que frene y reporte.
- **Sesión limpia** (`/clear`). Sin Plan Mode.
- **Rama:** `fix/site-sanidad` desde `main` **actualizado y con B0 + B0-bis ya mergeados**. Si esas ramas todavía no están en main, **frenar y avisar** — este sprint toca `CLAUDE.md` y archivos de landings, y trabajar sobre un main viejo va a generar conflictos.
- **Antes de empezar:** `git status`. Si aparecen cambios o archivos sin trackear que no son de este sprint (por ejemplo `docs/probe-*.md`), **frenar y reportar**: hay otra sesión en el mismo árbol.
- **Al terminar:** commit, push, `git checkout main`. **No mergear.**

## Contexto
Repo `logic-core-v3`, sitio público develOP (home + 4 landings de servicio + contact). Una auditoría completa del sitio público detectó errores de copy sistemáticos, claims no verificables, archivos basura y ausencia de SEO base. El home ya fue saneado (B0/B0-bis); este sprint sanea **las landings y la infraestructura**, sin tocar nada estético. El rediseño visual viene en bloques posteriores y no es asunto de este sprint.

## Reglas absolutas
1. **Un objetivo:** las tareas T1–T6. Cero refactors, cero cambios de estilo, cero "mejoras" no pedidas.
2. **Cero cambios visuales de layout o estética.** Solo texto, archivos borrados, y los dos archivos nuevos de T5.
3. **No tocar** rutas protegidas, portales, admin, login, ni el motor de WhatsApp.
4. **No inventar copy.** Los reemplazos están especificados. Donde no lo estén, frenar y reportar.
5. Si un archivo o línea no coincide con lo esperado (el código pudo moverse), **frenar y reportar esa tarea** y seguir con las demás.

## La tarea

### T1 — Eliminar el claim "+47" (decisión de negocio ya tomada)
El claim no es defendible con clientes nombrables y además es inconsistente (dice "Tucumán" en un lado y "NOA" en el otro, con el mismo número). Sale.
- `src/components/ia/RubrosIA.tsx:318` → hoy: `+47 negocios ya automatizados en Tucuman`
- `src/components/ia/VaultIA.tsx:184` → hoy: `+47 negocios ya automatizados en NOA`

**Reemplazo en ambos:** `Automatizaciones funcionando en negocios del NOA`
(sin número, sin cifra inventada; misma idea, defendible). Si el string está dentro de una estructura que espera un formato tipo métrica (label + value), adaptar respetando la estructura: label `AUTOMATIZACIONES`, value `Funcionando en el NOA`. Reportar cómo quedó en cada caso.

Después: `grep -rn "+47" src/` debe dar **cero**.

### T2 — Preguntas sin apertura `¿`
La auditoría contabilizó **44 casos** de preguntas en copy visible sin el `¿` de apertura, concentrados en las landings de IA y web-development. El detalle está en `audit/copy-preguntas-sin-apertura.txt` (si el archivo ya no existe porque `audit/` fue borrada, regenerar el listado con un barrido propio y reportarlo).
1. Leer el listado y aplicar el `¿` de apertura a cada pregunta de **texto visible al usuario**.
2. **No tocar** interrogativos indirectos que no son preguntas (`no sé qué hacer`, `depende de cuándo`), ni strings de código, keys, ni comentarios.
3. Reportar el conteo aplicado y cualquier caso dudoso que se haya dejado sin tocar, con archivo y línea.

### T3 — Tildes faltantes
La auditoría contabilizó **36 tildes faltantes** en copy visible de las landings, más los casos puntuales:
- Tuteo en copy voseante: `GarantiaIA.tsx:61` y `contact/…:208` → pasar a voseo (`Hablas`→`Hablás`, etc. — respetar el sentido de cada frase).
- Interrogativos sin tilde: `contact/…:275`.
- Tilde sobrante: `WebDevelopmentTimeline.tsx:66`.
- `Tucuman` → `Tucumán` en todo copy visible del sitio (incluye el string de T1 si sobreviviera en otra forma).

El detalle está en `audit/copy-tildes.txt` (si no existe, regenerar y reportar). Mismas reglas que T2: solo texto visible, no keys ni comentarios. Reportar conteo y dudosos.

### T4 — Higiene de archivos
1. **Borrar los 3 archivos `.bak`** detectados por la auditoría, en `src/app/web-development/`, `src/app/software-development/` y `src/app/process-automation/`. Verificar antes que ninguno esté importado por nada (`grep` del nombre) — si alguno lo está, frenar y reportar.
2. **Mojibake en comentarios** (8 casos, sin impacto visible pero es basura de encoding): `src/components/automation/HeroAutomation.tsx` (líneas ~576, 621, 631, 650, 1189, 1208) y `src/components/ia/RubrosIA.tsx` (~758, 919). Corregir los caracteres a UTF-8 correcto (`Ã³`→`ó`, `Ã­`→`í`, `Ã`→`Á`, `Ã¡`→`á`). Son comentarios: no cambiar nada de la lógica.
   Después: `LC_ALL=C grep -rn $'\xc3\x83' src/` debe dar **cero**.

### T5 — SEO base: `sitemap.ts` y `robots.ts`
La auditoría confirmó que **no existe ninguno de los dos en todo el repo**. Con el dominio a punto de servir esta app, es indexación perdida.
1. Crear `src/app/sitemap.ts` (convención de Next.js App Router) con **solo las rutas públicas**: `/`, `/web-development`, `/ai-implementations`, `/process-automation`, `/software-development`, `/contact`. Usar el mismo `metadataBase` que ya declara el layout raíz (`https://develop.com.ar`) como base de las URLs. Prioridad razonable: home 1.0, landings 0.8, contact 0.5.
2. Crear `src/app/robots.ts` que permita todo lo público y **excluya explícitamente** las superficies de producto y privadas: `/dashboard`, `/admin`, `/setter`, `/api/`, `/embed/`, `/login`, `/bienvenida`, y cualquier otro grupo protegido que exista en `src/app/` (verificar la estructura real antes de escribirlo, no asumir). Referenciar el sitemap.
3. **No incluir ninguna ruta protegida en el sitemap.** Si hay dudas sobre si una ruta es pública, dejarla afuera y reportarlo.

### T6 — Corregir el mapeo de colores en `CLAUDE.md`
La auditoría verificó contra el código que el mapeo real color↔servicio es:
- web → **cyan**
- IA → **verde/emerald**
- automatización → **ámbar/naranja**
- software → **índigo/violeta**

`CLAUDE.md` documenta esto mal en 3 de los 4 servicios. Corregirlo para que refleje el mapeo real verificado. **Solo esa sección**: no reescribir ni reorganizar el resto del archivo.

## El cierre
1. **Verificación obligatoria antes del commit:**
   - `npm run build` verde (`npm install`, **NO** `npm ci`).
   - `tsc --noEmit` → 0 errores. `eslint` sobre los archivos tocados → 0.
   - `grep -rn "+47" src/` → **cero**.
   - `LC_ALL=C grep -rn $'\xc3\x83' src/` → **cero**.
   - `grep -rn "Tucuman" src/` → cero en copy visible (reportar si sobrevive en algún comentario o key).
   - Los 3 `.bak` ya no existen.
   - `npm run dev` y recorrer las 4 landings + contact confirmando que **el layout no cambió** y que los textos corregidos se ven bien.
   - Visitar `/sitemap.xml` y `/robots.txt` en dev y confirmar que responden con el contenido esperado y **sin rutas privadas**.
2. **Reporte final:** estado de T1–T6, conteos aplicados en T2 y T3, listado de casos dudosos no tocados (archivo:línea), contenido final de sitemap y robots, y cualquier tarea frenada con su motivo.
3. **Commit** `fix(site): sanidad de copy, higiene y SEO base` + push. `git checkout main`. **No mergear.**

## Verificación humana (Franco)
- Deploy preview: recorrer las 4 landings y contact **primero en el teléfono**, después en desktop. Confirmar que no cambió nada visual y que las preguntas y tildes se leen bien.
- Confirmar el texto de reemplazo de T1 (es copy de venta: si querés otra frase, es el momento).
- Revisar `sitemap.xml` del preview y confirmar que no aparece ninguna ruta privada.
- Recién ahí, merge a main.

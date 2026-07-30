# SPRINT B0-bis — Cierre de B0: three fuera del bundle inicial

## Cómo correrla
- **Modelo:** Opus 5 (`/model` explícito) · **Effort:** `/effort high`
- **Ask-mode ACTIVADO** para T1: es un archivo del flujo de fases del preloader, marcado como sensible en `CLAUDE.md`. Checkpoint antes de aplicar el cambio.
- **Sesión limpia** (`/clear`). Sin Plan Mode.
- **Rama:** si `fix/home-sanidad` **todavía no se mergeó**, trabajar sobre esa misma rama (esto cierra B0 y el bloque queda coherente). Si ya se mergeó a main, crear `fix/home-sanidad-2` desde main actualizado.
- **Antes de empezar:** verificar con `git status` que el working tree no tenga cambios de otra sesión. Si aparecen archivos modificados o sin trackear que no son de este sprint (por ejemplo `docs/probe-*.md`), **frenar y reportar** — hay otra sesión trabajando en el mismo árbol y hay riesgo de mezclar trabajo ajeno en esta rama.

## Contexto
El sprint B0 (`fix/home-sanidad`, commit `fe099b9`) dejó una tarea parcial. El objetivo era sacar Three.js del bundle inicial del home; se logró extraer el canvas del Hero a `HeroCanvas.tsx` con `dynamic(ssr:false)` y self-hostear el HDRI (1,68 MB que antes se descargaban de githubusercontent), pero el reporte de ese sprint identificó y midió una **segunda cadena independiente** que sigue trayendo three al bundle inicial desde el layout raíz:

`src/app/layout.tsx` → `Preloader` → `MarketingIntro` → `BrandedIntroCanvas` (three/r3f/drei)

Medición del sprint anterior: `MarketingIntro` compila dentro de `chunks/app/layout-*.js`, y 4 de los 30 chunks iniciales contienen three. El sprint anterior dejó el fix sin aplicar, correctamente, porque el archivo estaba fuera de su scope. Este sprint lo aplica.

## Reglas absolutas
1. **Un objetivo:** las tres tareas de abajo. Nada más — ni refactors oportunistas, ni tocar el resto del flujo del preloader, ni "mejorar" nada que no esté acá.
2. **Cero cambios visuales.** El preloader y el hero deben verse y comportarse exactamente igual que antes: mismas fases, mismos tiempos, misma animación de intro.
3. **No borrar ni desactivar el Preloader ni `MarketingIntro`.** Solo cambia CÓMO se cargan, no si se cargan. (La decisión de si el preloader sobrevive al rediseño es de B2, no de acá.)
4. Si algo no coincide con lo descrito, **frenar y reportar** — no adivinar ni improvisar una alternativa.

## La tarea

### T1 — Cortar la cadena de three en `Preloader.tsx` (Ask-mode)
La cadena completa medida por el sprint anterior es:
`app/layout.tsx` → `Preloader.tsx:10` importa `MarketingIntro` **estático** → `MarketingIntro.tsx` importa `BrandedIntroCanvas` **estático** → `BrandedIntroCanvas.tsx` importa r3f + drei + postprocessing + three.

El punto de corte correcto es **el más alto de la cadena**: `src/components/ui/Preloader.tsx` línea ~10 (verificar).
1. Convertir el import de `MarketingIntro` a `dynamic(() => import(...), { ssr: false })`, con fallback `null`. Un solo cambio ahí saca del bundle inicial los cinco chunks medidos (three core ×2, r3f, drei, postprocessing ≈ 1,03 MB sin comprimir).
2. **Verificar antes de tocar:** `MarketingIntro` ya está gateado en runtime por `shouldRunMarketingIntro(pathname)`. Confirmar que el gate existe y que el componente no se necesita en el primer frame sincrónico del preloader. Si el preloader depende de que `MarketingIntro` esté disponible sincrónicamente para calcular sus fases, **frenar y reportar** en vez de aplicar.
3. **Si T1 rompe el flujo de fases**, revertir y probar el plan B: dejar el import de `Preloader.tsx` como está y hacer dinámico el import de `BrandedIntroCanvas` dentro de `MarketingIntro.tsx` (un nivel más abajo, ya gateado por `isClient && isSplitLayout`). Reportar cuál de los dos se aplicó.
4. **No cambiar** timing, orden de fases, ni la lógica de montaje/desmontaje del preloader. Solo el mecanismo de import. `MarketingIntro` y el preloader **no se borran ni se desactivan** (esa decisión es de B2).

### T2 — Unificar el guion del badge de ubicación
El reporte de B0 detectó que el badge de ubicación existe 3 veces en `src/components/sections/home/About.tsx` (líneas ~245, ~280, ~294) y que B0 aplicó raya (`—`) solo a la de :294, dejando las otras dos con guion simple. Unificar las tres con el mismo texto exacto:

`Tucumán, Argentina — trabajamos con clientes de todo el país`

Verificar que las tres tengan tildes correctas y la misma raya. No cambiar nada más de esas líneas.

### T3 — Canonical propio para el home
`src/app/layout.tsx` declara `metadataBase: https://develop.com.ar` pero la home no tiene `alternates.canonical` propio. Agregarlo apuntando a la raíz (`/`), siguiendo el mismo patrón que las rutas de servicio ya usan. No tocar ningún otro canonical ni `metadataBase`.

## El cierre
1. **Verificación obligatoria antes del commit:**
   - `npm run build` verde (recordatorio: `npm install`, **NO** `npm ci`).
   - `tsc --noEmit` → 0 errores.
   - **La verificación clave — three fuera del bundle inicial:** levantar `next start` sobre el build de producción y confirmar que ninguno de los `<script>` del documento inicial del home contiene three. Baseline medido por el sprint anterior (los cinco chunks a eliminar, ≈1,03 MB sin comprimir): three core `b536a0f1` 349.423 B + `bd904a5c` 372.244 B, r3f `b79b7286` 146.468 B, drei `8471` 80.177 B, postprocessing `a3cd4a83` 82.636 B. Reportar el conteo y el peso antes/después.
   - Confirmar que el chunk de `MarketingIntro`/`BrandedIntroCanvas` se pide **recién al montar**, no en el documento inicial.
   - **JS inicial del home:** medir y reportar. Baseline conocido: main 2.672.058 B → tras B0 2.180.545 B. Este sprint debería bajarlo cerca de 1 MB más.
   - **Verificación funcional del preloader:** cargar el home en el browser y confirmar que la intro se ve y se comporta igual (misma secuencia de fases, sin flash, sin pantalla en blanco extra, sin errores de consola). Si el preloader cambia de comportamiento en algo, **revertir T1 y reportar** — no dejarlo "casi bien".
2. **Reporte final:** estado de T1–T3, el conteo de chunks con three antes/después, y qué se verificó del preloader y cómo.
3. **Commit** con mensaje `fix(home): saca three del bundle inicial via MarketingIntro dinámico` y push. **No mergear.**
4. **Dejar el checkout en `main`** al terminar (`git checkout main`), para no dejar el árbol compartido parado en una rama de trabajo.

## Verificación humana (Franco)
- Deploy preview: abrir el home **en el teléfono primero** y confirmar que la intro/preloader se ve igual que antes y que el hero 3D monta.
- Correr Lighthouse mobile sobre el preview y anotar el número: es la primera medición real del efecto de B0 completo (baseline a superar: 34/100, LCP 6,1 s, JS inicial 723 KB).
- Recién ahí, merge de la rama a main.

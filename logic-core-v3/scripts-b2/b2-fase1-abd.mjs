export const meta = {
  name: 'b2-fase1-abd',
  description: 'B2 Fase 1 (re-despacho) — frentes A, B y D cierran los pozos de acontecimientos',
  phases: [{ title: 'Frentes', detail: 'A hero+quienes-somos · B numeros+trabajos · D tu-panel+por-que-develop+cierre' }],
}

const COMUN = `
# B2 — LOS MOMENTOS · Fase 1. Sos un frente de un sprint que YA MIDIÓ.

⚠️ **ESTO ES UN RE-DESPACHO.** Una corrida anterior de cuatro frentes murió por límite de cuota. **El frente C (Servicios) SÍ terminó y su trabajo está en el árbol: NO SE TOCA.** Sus archivos —\`_secciones/servicios/*\`— están fuera del scope de los tres frentes de ahora, y ya están verificados: 112 afirmaciones en verde y 4 acontecimientos medidos donde antes había 1.

## Dónde corrés
- Worktree \`C:\\v3-momentos\\logic-core-v3\`, rama \`v3/momentos\`. Todos los comandos desde ahí.
- **EL PUERTO ES EL 3001 Y SOLO EL 3001.** \`http://localhost:3001/v3\`. El dev server YA ESTÁ CORRIENDO: no lo levantes. Hay otra sesión en el 3002: si medís ahí estás midiendo el sitio de otro y no te vas a enterar.
- Shell: PowerShell (no hay \`&&\`, no hay heredoc) y también Bash. En Bash usá \`cd C:/v3-momentos/logic-core-v3 && ...\`.

## ⚠️ LA PREMISA DE LA INSTRUCCIÓN ESTÁ CORREGIDA POR LA MEDICIÓN. LEÉ ESTO PRIMERO.

La instrucción de este bloque decía «faltan momentos, agregá acontecimientos». **La Fase 0 midió y NO es eso.** Contra la referencia (\`nk.studio\`), con el mismo instrumento y en los dos anchos:

| | nk | /v3 antes de B2 |
|---|---|---|
| acontecimientos | 12 | 9 |
| hueco **medio** entre acontecimientos | 1,11 pantallas | **0,90** |
| hueco **MÁXIMO** | **1,56 pantallas** | **2,44** |

> **Nuestra densidad media YA ERA MEJOR que la de la referencia. Lo que falta no es cantidad: es REGULARIDAD.**

**EL GATE DE ESTE BLOQUE ES EL HUECO MÁXIMO, NO EL TOTAL.** Sumar un evento donde ya pasan cosas no mueve el gate: sumás trabajo y no sumás nada. **Cada frente apunta a SU POZO.**

### El estado de HOY, medido a 1920 sobre el documento entero (18 pantallas, 18.360 px de scroll)

11 acontecimientos. **Hueco máximo: 5.880 px = 5,44 pantallas**, contra 1,56 de nk. Los huecos, en pantallas, en orden:

\`\`\`
0,89 · 1,44 · 5,44 · 0,33 · 1,11 · 0,44 · 0,44 · 0,78 · 1,11 · 0,44
                ▲
        EL POZO: de y 4320 a y 10200
\`\`\`

**El pozo se come Números entero —sus CUATRO pantallas, con CERO acontecimientos— más pantalla y media de Trabajos.** Es el objetivo del frente B y es el más grande de los tres. (Empeoró contra las 2,44 de antes porque la Fase 0 abrió scroll que la Fase 1 tiene que llenar.)

Los grupos de aterrizajes de hoy, en píxeles de scroll: \`600 · 2160 · 3720 · 10200 · 10560 · 12000 · 12720 · 13440 · 14520 · 16320 · 17760\`. Todo lo que está entre 4320 y 10200 es tu enemigo si sos el frente B.

## LEÉ ESTO ANTES DE TOCAR CÓDIGO (obligatorio, en este orden)
1. \`docs/rediseno/sprints/B2-DELTAS.md\` — **es tu vara**. §0 explica qué es un acontecimiento y cómo se mide; §1-bis es la corrección de premisa de arriba; §6 tiene tu objetivo por sección.
2. \`docs/rediseno/MEDICION-NAVEGADOR.md\` — la receta. ⚠️ dice puerto 3000; **el tuyo es el 3001**.
3. Los archivos de tu scope, enteros, antes de proponer nada.

## QUÉ ES UN MOMENTO
Algo que **PASA cuando el visitante llega a un lugar**: algo cambia de estado y **se nota**. Medido: un **acontecimiento** es un ATERRIZAJE — un grupo de elementos que estaban cambiando y **dejan de cambiar** en un lugar del scroll. Un elemento que cambia todo el tiempo no produce ninguno.

**La banda a la que apuntar es la de nk: 0,67 – 1,11 pantallas entre acontecimientos. Ninguno por encima de 1,56.** Lo que quede arriba se reporta con su número y su razón. No se afloja: se explica.

## EL PATRÓN QUE EL FRENTE C YA USÓ, Y QUE PROBABLEMENTE NECESITES
Su defecto era exactamente el tuyo con otra cara: los canales se consumían sobre el progreso local de 0 a 1, y **1 es el píxel donde el tramo se acaba** — o sea que nada llegaba a verse terminado y quieto. Lo arregló con \`asentar\` (\`_secciones/servicios/asentamiento.ts\`), que satura el progreso en una fracción del tramo y deja el resto **quieto**. Resultado medido: de 1 acontecimiento de 2.040 px a **4**, con huecos de 0,44 · 0,44 · 0,78.

**Leelo antes de inventar nada.** Es tuyo para copiar el MÉTODO —no el archivo—: si tu sección tiene un progreso continuo que nunca se detiene, no vas a producir un aterrizaje por más patrones que agregues.

## LOS NUEVE PATRONES YA EXISTEN — no inventes uno
En \`src/app/v3/_lib/motion/patrones-tipografia.ts\` (P1 P2 P3 P6) y \`patrones-piezas.ts\` (P4 P5 P7 P8 P9), con sus valores MEDIDOS. Se consumen con \`<Bloque patron="P4">\` del contrato (\`_secciones/_contrato/coreografia.tsx\`). **Si ninguno sirve: FRENÁ Y REPORTALO. No inventes un patrón y no cambies un valor de un patrón.**
- P1 línea por línea (yPercent 120→0, escalonado 0,2) · P2 bloque entero (yPercent 60→0) · P3 palabra por palabra (opacity 0,3→1, sin moverse) · P4 lista frenada (y 100→0 px REALES + opacity, power4.out, escalonado 0,2) · P5 crecimiento lineal (scale 0,8→1) · P6 cruce horizontal · P7 planos en profundidad · P8 vuelo de 32 piezas · P9 grilla que crece.

## LO QUE LA FASE 0 YA HIZO, y que te condiciona
- **La tabla de alturas cambió** (\`_lib/secciones.ts\`): \`quienes-somos\` 200→**300svh**, \`numeros\` 100→**400svh**. Salen del techo de velocidad de la cámara (\`_lib/escena/techoDeVelocidad.ts\`) y de la densidad de nk: no son gusto. El documento pasó de 14 a **18 pantallas** y los momentos estructurales de 12,0 a **16,0**.
- ⚠️ **\`npm run test:s10-mobile\` está EN ROJO** con dos líneas: \`quienes-somos\` y \`numeros\` **no llenan las pantallas que declaran** (su composición tiene 2 y 1 caja \`min-h-svh\` contra 3 y 4 declaradas). Si tu scope incluye una de esas dos, **cerrar ese rojo es tu gate y no es opcional**: una sección que declara más de lo que compone es un pozo con otro nombre.

## REGLAS ABSOLUTAS
1. **Escribís SOLO en tus archivos** (listados abajo). Si necesitás \`_lib/secciones.ts\`, \`_lib/escena/*\`, \`_secciones/_contrato/*\`, \`_lib/motion/*\` o **cualquier cosa de \`_secciones/servicios/\`**: **NO lo edites — reportalo.**
2. **Frozen, se leen y jamás se editan:** \`src/components/3d/HeroArtifact.tsx\`, \`src/context/TransitionContext.tsx\`, \`src/context/PreloaderContext.tsx\`, \`prisma/schema.prisma\`, \`auth.ts\`, \`lib/prisma.ts\`.
3. **No cambiás CONTENIDO.** Los \`contenido.ts\` y sus marcadores (\`[TEXTO]\`, \`[FOTO DEL EQUIPO]\`, \`[VIDEO]\`…) se quedan tal cual. Podés cambiar GEOMETRÍA y composición.
4. **Cero valores fuera de los tokens.** Nada de \`px\` sueltos ni colores literales. Los \`px\` de un patrón (los 100 de P4) son del patrón, no tuyos.
5. **Cero \`any\`. Cero dependencias nuevas. Cero \`setState\` por frame. Nada de base de datos.**
6. **Archivos de más de 300 líneas se parten**, por TEMA. \`npm run test:s8-montaje\`, \`test:s6-lane\` y \`test:s7-contrato\` lo miden, y los tres se pusieron rojos por esto en la corrida anterior. **Corré tus invariantes: es lo que el frente C no llegó a hacer.**
7. **Ninguna afirmación se afloja. Ninguna comprobación verde por vacío.** Si un invariante tuyo se pone rojo porque cambiaste una propiedad, actualizá la afirmación al valor NUEVO **con su razón en el docblock** — nunca a algo más débil.
8. **No auto-confirmás que se ve bien.** Podés decir "el hueco máximo de mi sección pasó de 5,44 a 0,8 pantallas". No podés decir "queda premium".
9. **Toda cifra con su instrumento.** Una cifra sin instrumento es prosa.

## EL NAVEGADOR ES UNO SOLO Y LO COMPARTEN LOS TRES
Abrí **tu propia pestaña** con \`new_page\` sobre \`http://localhost:3001/v3\`. Antes de CADA lectura verificá \`visibilityState: 'visible'\` **y** \`innerWidth > 0\`. Si no, \`select_page\` con \`bringToFront: true\` y repetí desde \`emulate\`. **Si después de 3 intentos no conseguís una lectura válida, reportá "no medido" — NO inventes el número y no lo deduzcas de la geometría.** Con la pestaña oculta el navegador no despacha \`scroll\`, no corre \`requestAnimationFrame\` y \`innerWidth\` devuelve 0.

Receta: \`new_page\` → \`emulate\` viewport \`1920x1080x1\` → \`navigate_page\` type \`reload\` con \`initScript: try { sessionStorage.setItem('home:intro','1') } catch (e) {}\` → verificar → medir. Cerrá tu pestaña al terminar.

⚠️ **La escena 3D NO se puede medir leyendo el canvas** (\`drawImage\` y \`gl.readPixels\` devuelven un cuadro rancio). Si necesitás el píxel de la sala, es \`take_screenshot\`. Vos casi seguro no lo necesitás.

## CÓMO MEDÍS TUS ACONTECIMIENTOS
Un solo \`evaluate_script\`. Cambiá \`DESDE\` y \`HASTA\` por los píxeles de tu sección (los sacás de \`[data-panel]\`), y medí **antes y después** de tu cambio:

\`\`\`js
async () => {
  const DESDE = 4320, HASTA = 8640, PASO = 120
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const ruta = (el) => { const p = []; let n = el
    while (n !== null && n.parentElement !== null) { p.push(n.tagName.toLowerCase() + ':' + [...n.parentElement.children].indexOf(n)); n = n.parentElement }
    return p.reverse().join('/') }
  const leer = () => { const f = {}
    for (const el of document.querySelectorAll('*')) { const s = el.getAttribute('style'); if (s !== null && s.length > 0) f[ruta(el)] = s }
    return f }
  const M = []
  for (let y = DESDE; y <= HASTA; y += PASO) { window.scrollTo(0, y); await raf2(); await sleep(160); M.push({ y: window.scrollY, f: leer() }) }
  window.scrollTo(0, 0)
  const reales = new Map(); const montajes = []
  for (let k = 1; k < M.length; k += 1) { const a = M[k-1].f, b = M[k].f; let alta = 0, baja = 0
    for (const c of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const ea = a[c] !== undefined, eb = b[c] !== undefined
      if (ea && eb) { if (a[c] !== b[c]) { if (!reales.has(c)) reales.set(c, []); reales.get(c).push(M[k].y) } }
      else if (eb) alta += 1; else baja += 1 }
    if (alta + baja > 0) montajes.push({ y: M[k].y, alta, baja }) }
  const hist = {}
  for (const ys of reales.values()) { const h = ys[ys.length-1]; hist[h] = (hist[h] ?? 0) + 1 }
  const ys = Object.keys(hist).map(Number).sort((p,q)=>p-q); const g = []
  for (const y of ys) { const u = g[g.length-1]
    if (u !== undefined && y - u.fin <= 2*PASO) { u.fin = y; u.piezas += hist[y] } else g.push({ ini: y, fin: y, piezas: hist[y] }) }
  const huecos = []
  for (let i = 1; i < g.length; i += 1) huecos.push(g[i].ini - g[i-1].fin)
  return { acontecimientos: g.length, grupos: g, huecosPx: huecos,
    huecosPantallas: huecos.map((h) => Math.round(100*h/window.innerHeight)/100), montajes, ventana: window.innerHeight }
}
\`\`\`

⚠️ **El hueco que te importa incluye el borde con la sección vecina**, no sólo los de adentro. Fijate en qué píxel cae tu primer y tu último aterrizaje contra los bordes de tu sección.

## CAPTURAS
Las de ANTES ya están, a 1920, en \`docs/rediseno/capturas/b2/<seccion>-1920-antes.png\`. **Vos tomás las de DESPUÉS**: \`take_snapshot\` con \`filePath\` a tu scratchpad → buscás el \`uid\` de la \`region\` de tu sección → \`take_screenshot\` con ese \`uid\` a \`docs/rediseno/capturas/b2/<seccion>-1920-despues.png\`.

## AL TERMINAR corré, en primer plano, y reportá la salida
Los invariantes de tus secciones (abajo) **más estos cinco, que son de todos**:
\`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\` · \`npm run test:s6-lane\` · \`npm run test:s7-contrato\`
Y \`npx tsc --noEmit\`, que tiene que salir limpio.

## GIT
**No hagas NINGUNA operación de git.** Ni add, ni commit, ni stash, ni checkout. El agente principal comitea.

## EL REPORTE
Devolvé el objeto estructurado que se te pide, y sé literal: **una cifra que no mediste se reporta como \`null\`, no se estima.**
`

const ESQUEMA = {
  type: 'object',
  properties: {
    frente: { type: 'string' },
    secciones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          acontecimientosAntes: { type: ['integer', 'null'] },
          acontecimientosDespues: { type: ['integer', 'null'] },
          huecoMaximoPantallasAntes: { type: ['number', 'null'] },
          huecoMaximoPantallasDespues: { type: ['number', 'null'] },
          huecosPantallas: { type: 'array', items: { type: 'number' } },
          patronesPorMomento: { type: 'array', items: { type: 'string' } },
          llenaSuAlto: { type: ['boolean', 'null'] },
          capturaDespues: { type: ['string', 'null'] },
        },
        required: ['id', 'acontecimientosAntes', 'acontecimientosDespues', 'patronesPorMomento'],
      },
    },
    archivosTocados: { type: 'array', items: { type: 'string' } },
    invariantes: { type: 'array', items: { type: 'string' } },
    fueraDeScope: { type: 'array', items: { type: 'string' } },
    frenos: { type: 'array', items: { type: 'string' } },
    loQueNoSePudoMedir: { type: 'array', items: { type: 'string' } },
  },
  required: ['frente', 'secciones', 'archivosTocados', 'invariantes', 'frenos'],
}

const FRENTES = [
  {
    key: 'B',
    label: 'B · números + trabajos (EL POZO)',
    prompt: `${COMUN}

# TU SCOPE — FRENTE B · Números + Trabajos. **SOS EL DUEÑO DEL POZO.**

Escribís SOLO en:
- \`src/app/v3/_secciones/numeros/\` (Numeros.tsx, Cifra.tsx, numeros.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/trabajos/\` (Trabajos.tsx, Proyecto.tsx, geometria.ts, soporte.ts, trabajos-piezas.ts, trabajos.invariant.tsx — **contenido.ts NO**)

**El hueco de 5,44 pantallas del sitio es tuyo entero: va de \`y\` 4320 a \`y\` 10200, o sea Números completo más pantalla y media de Trabajos.** Es el gate del bloque. Los otros dos frentes tienen pozos de 1,44 y 1,11 pantallas; el tuyo es cuatro veces más grande.

## NÚMEROS — 4 pantallas (y 4320–8640), **CERO acontecimientos**, objetivo 5–6
⚠️ **DECLARA 4 PANTALLAS Y SU COMPOSICIÓN LLENA 1.** \`s10-mobile\` está rojo por eso. Cerrarlo es tu gate.
- Hoy: un solo \`min-h-svh\`, la cabecera con P2 y **las cinco cifras entrando con P2 escalonado**, o sea un único grupo que además no aterriza donde nadie lo ve.
- **Las cinco cifras no van en grilla** — dispersas, asimétricas, tamaños distintos, y eso ya está medido en \`GEOMETRIA\` de \`Numeros.tsx\`. **No lo conviertas en una grilla.**
- **Cinco cifras entrando de a una, cada una en su lugar del scroll, son cinco momentos.** Más la cabecera: seis. Repartidas sobre cuatro pantallas dan un acontecimiento cada 0,67 pantallas, que es exactamente el hueco más chico de la referencia.
- Los 400svh salen de esa cuenta y del techo de velocidad. **Repartí lo que YA HAY sobre las cuatro pantallas: no inventes contenido y no metas relleno.**
- ⚠️ Las cifras son marcadores del pedido (\`cifras[n].valor\`). **No los toques.**

## TRABAJOS — 3 pantallas pinneadas (y 8640–11880), 2 acontecimientos, objetivo 3–4
- **La primera pantalla y media de Trabajos es la segunda mitad del pozo**: el primer aterrizaje de la sección cae recién en \`y\` 10200, o sea 1.560 px después de que la sección empieza.
- Ya tiene **P7** con su rampa de llegada de 268 px, pinneada sobre 2.160 px. \`anclaje="seccion"\` hace que el patrón se reparta contra la sección y no contra el bloque: eso lo arregló B1 y **no se toca**.
- **Tres proyectos son tres momentos, no uno.** Cada uno llega, se queda, y sale. ⚠️ Ojo con el mismo defecto que el frente C encontró en Servicios: si la ventana de cada proyecto cierra justo donde empieza el siguiente, **ninguno llega a verse quieto** y el censo los lee como uno solo.
- **Verificá con scroll REAL que los tres se leen por separado** — no con geometría. Un pin "verificado" comparando alturas no está verificado.
- ⚠️ El alto (300svh) sale de \`altoDeSecuenciaPinneada(3)\`, atado a los 3 proyectos de \`contenido.ts\`. **No lo cambies.**
- ⚠️ El aire muerto de esta sección era 85,65 % antes de B1. No lo empeores.

## Invariantes que corrés al terminar
\`npm run test:s5-numeros\` · \`npm run test:s5-trabajos\` · \`npm run test:s5-ritmo\` · más los cinco comunes y \`tsc\`.
`,
  },
  {
    key: 'A',
    label: 'A · hero + quiénes somos',
    prompt: `${COMUN}

# TU SCOPE — FRENTE A · Hero + Quiénes somos

Escribís SOLO en:
- \`src/app/v3/_secciones/hero/\` (Hero.tsx, hero.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/quienes-somos/\` (QuienesSomos.tsx, quienes-somos-piezas.tsx, quienes-somos.invariant.tsx — **contenido.ts NO**)

**Tu pozo es el segundo del sitio: 1,44 pantallas**, entre el aterrizaje de \`y\` 2160 y el de \`y\` 3720. Y la tercera pantalla de Quiénes somos —de \`y\` 3240 a 4320— alimenta el pozo grande del frente B: tu último aterrizaje cae en 3720+600 = 4320 y el siguiente del sitio está en 10200.

## HERO — 1 pantalla (y 0–1080), 1 acontecimiento, objetivo 2
Es \`papel-transparente\` y la escena llena la pantalla; B1 lo midió con **0 % de aire muerto**, así que su defecto NO es el vacío. Hoy **el titular con P1 y la bajada+CTA con P2 entran juntos**: un acontecimiento.
- **El candidato, dicho por la instrucción: la bajada y el CTA entran DESPUÉS del titular, no con él.** Dos aterrizajes en una pantalla.
- ⚠️ **El alto del hero NO se toca y no es negociable**: \`s8-chrome.invariant.ts\` §2 afirma \`pantallasDe(primera) === 1\` porque de ahí sale el nacimiento de la pastilla de navegación. Está declarado en \`B2-DELTAS.md\` §2.5 y aflojarlo está prohibido.
- ⚠️ No toques el encuadre ni \`GEOMETRIA.claseDelTitular\` sin medir: B1 midió el borde seguro del texto contra el logo (contraste 10,45:1 a 1440, cero píxeles bajo AA). Si tu cambio mueve el ancho o la posición del texto, **volvé a medir el contraste bajo el GLIFO** (\`B1-DELTAS.md\` §4-bis) o no lo hagas.

## QUIÉNES SOMOS — **300svh** (y 1080–4320), 2 acontecimientos, objetivo 3–4
⚠️ **DECLARA 3 PANTALLAS Y SU COMPOSICIÓN LLENA 2.** \`s10-mobile\` está rojo por eso. Cerrarlo es tu gate.
- La composición son dos cajas \`min-h-svh\`: \`data-pantalla="agencia"\` (etiqueta, titular P1, bajada P2, cómo trabajamos P2, lugar) y \`data-pantalla="personas"\` (la foto P2 + las dos personas P2).
- **Cinco piezas que pueden llegar por separado**: titular · bajada · cómo trabajamos · la foto con su pie · las dos personas. Hoy la primera caja entrega **un** aterrizaje agrupado y la segunda **otro**.
- La instrucción dice: **un momento por bloque de texto con P2 escalonado, y la foto entrando aparte.** La tercera pantalla es tuya para componer.
- ⚠️ **El hueco de la foto NO se achica.** Medido a 1920: 1481,59 × 987,72 px, relación **1,500 exacta** = los 3:2 que declara \`GEOMETRIA.foto\`; ya está dimensionado por su relación de aspecto, y con su epígrafe llena el 94,4 % de su pantalla. B1 lo subió de 3 a 4 columnas con su propia medición y bajarlo reabre el hueco que B1 cerró. \`B2-DELTAS.md\` §4.1.

## Invariantes que corrés al terminar
\`npm run test:s5-hero\` · \`npm run test:s5-quienes-somos\` · \`npm run test:s5-ritmo\` · más los cinco comunes y \`tsc\`.
`,
  },
  {
    key: 'D',
    label: 'D · tu panel + por qué develOP + cierre',
    prompt: `${COMUN}

# TU SCOPE — FRENTE D · Tu panel + Por qué develOP + Cierre

Escribís SOLO en:
- \`src/app/v3/_secciones/tu-panel/\` (TuPanel.tsx, Capacidades.tsx, deteccion.ts, s6-tu-panel.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/por-que-develop/\` (PorQueDevelop.tsx, Diferenciales.tsx, s7-por-que-develop.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/cierre/\` (Cierre.tsx, ColumnasDelPie.tsx, soporte.ts, s8-cierre.invariant.tsx — **contenido.ts NO**)

**Tu pozo es el tercero: 1,11 pantallas**, entre el aterrizaje de \`y\` 15120 (fin del grupo de Servicios, que NO es tuyo) y el de \`y\` 16320 en Tu panel. Y tenés **el final del sitio sin un solo aterrizaje**: el último del documento cae en \`y\` 17760+480 = 18240, y el scroll termina en 18360.

## TU PANEL — 2 pantallas (y 15120–17280), 1 acontecimiento, objetivo 2–3
- 200svh y **43,70 % de aire** medido por B1. **Es la que más pide una secuencia y no tiene ninguna.**
- Su contenido es **una lista de capacidades**: **P4**, los ítems entrando desde 100 px abajo, muy frenados. Ya hay un \`patron="P4"\` en \`TuPanel.tsx\` y otro en \`Capacidades.tsx\`: **mirá si están aterrizando por separado o todos juntos** — hoy la sección entera produce UN grupo, en \`y\` 16320, con 14 piezas.
- ⚠️ El alto (200svh) **no se puede cambiar**: \`servicios : tu-panel : por-que-develop\` tiene que quedarse en **3:2:1** o el ancla de \`tu-panel\` se mueve. La derivación, en \`B2-DELTAS.md\` §5. Si creés que necesitás más alto: **frená y reportá.**

## POR QUÉ DEVELOP — 1 pantalla (y 17280–18360), 1 acontecimiento, objetivo 1–2
- \`papel-transparente\`: **la escena vuelve acá**, ancla declarada 0,8525. B1 lo midió con **0 % de aire muerto**.
- **La vuelta de la escena es un momento en sí mismo** — verificá con scroll real que se lee como llegada.
- **Los cuatro diferenciales pueden entrar de a uno.** Hoy usan P5 (tres instancias) y P1, y producen UN grupo en \`y\` 17760 con 12 piezas.
- ⚠️ **Se pasa 24 px de su alto a 1440** (renderiza 924 px en una ventana de 900). Pendiente abierto de B1: si podés cerrarlo sin tocar contenido, cerralo y reportá el número; si no, reportalo.
- ⚠️ El alto (100svh) **no se puede cambiar** — misma razón, \`B2-DELTAS.md\` §5.
- ⚠️ El titular cae sobre el logo y el contraste está al filo: el ancla 0,8525 se eligió con cuatro cifras (\`s16-anclaje\` §5) para que dé 4,98:1. **Si movés el titular de lugar o de tamaño, volvé a medir el contraste bajo el GLIFO** o no lo muevas.

## CIERRE — 1 pantalla (y 18360–19440), **CERO acontecimientos**, objetivo 1–2
- **57,59 % de aire, el peor que queda**, y el censo lo mide con **cero aterrizajes**.
- **El titular, el CTA y las columnas del pie entran HOY JUNTOS. Separalos.** Hoy: \`Cierre.tsx\` tiene un P1 y un P2, y \`ColumnasDelPie.tsx\` un P2.
- ⚠️ El alto (100svh) **no se puede cambiar**: el guardián 3 de \`derivarAnclaje\` tira si el Cierre tiene recorrido de scroll propio. \`B2-DELTAS.md\` §5.
- ⚠️ A 1440 entra en 0,82 pantallas y a 375 se pasa (1,54). El \`alto\` es un piso: no recorta.
- ⚠️ \`Pie.tsx\` (en \`_componentes/chrome/\`) **no es tuyo**. Si lo necesitás, reportalo.
- ⚠️ El Cierre es la última pantalla del documento: el scroll TERMINA en \`y\` 18360, así que un aterrizaje que dependa de scrollear más allá **no va a ocurrir nunca**. Ancla contra lo que entra en cuadro, no contra el final.

## Invariantes que corrés al terminar
\`npm run test:s6-tu-panel\` · \`npm run test:s6-por-que-develop\` · \`npm run test:s6-cierre\` · más los cinco comunes y \`tsc\`.
`,
  },
]

log('Re-despacho de la Fase 1: A, B y D. El frente C ya cerró y no se toca. Gate: el hueco MÁXIMO, no el total.')

const reportes = await parallel(
  FRENTES.map((f) => () => agent(f.prompt, { label: `frente ${f.label}`, phase: 'Frentes', schema: ESQUEMA })),
)

return { reportes: reportes.map((r, i) => ({ frente: FRENTES[i].key, reporte: r })) }

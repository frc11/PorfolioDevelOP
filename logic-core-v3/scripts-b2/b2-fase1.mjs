export const meta = {
  name: 'b2-fase1-momentos',
  description: 'B2 Fase 1 — cuatro frentes agregan acontecimientos a las ocho secciones de /v3',
  phases: [{ title: 'Frentes', detail: 'A hero+quienes-somos · B numeros+trabajos · C servicios · D tu-panel+por-que-develop+cierre' }],
}

const COMUN = `
# B2 — LOS MOMENTOS · Fase 1. Sos un frente de un sprint que ya midió.

## Dónde corrés
- Worktree \`C:\\v3-momentos\\logic-core-v3\`, rama \`v3/momentos\`. Todos los comandos desde ahí.
- **EL PUERTO ES EL 3001 Y SOLO EL 3001.** \`http://localhost:3001/v3\`. El dev server YA ESTÁ CORRIENDO: no lo levantes. Hay otra sesión en el 3002: si medís ahí estás midiendo el sitio de otro y no te vas a enterar.
- Shell: PowerShell (no hay \`&&\`, no hay heredoc) y también Bash. En Bash usá \`cd C:/v3-momentos/logic-core-v3 && ...\`.

## LEÉ ESTO ANTES DE TOCAR CÓDIGO (obligatorio, en este orden)
1. \`docs/rediseno/sprints/B2-DELTAS.md\` — **es tu vara**. §6 tiene tu objetivo por sección. §0 explica qué es un acontecimiento y cómo se mide.
2. \`docs/rediseno/MEDICION-NAVEGADOR.md\` — la receta de medición. ⚠️ dice puerto 3000; **el tuyo es el 3001**.
3. Los archivos de tu scope, enteros, antes de proponer nada.

## QUÉ ES UN MOMENTO (la regla que gobierna a los cuatro)
Un momento es **algo que PASA cuando el visitante llega a un lugar**: algo cambia de estado y **se nota**. No es una animación más. Si agregás un evento que nadie nota, no sumaste un momento: sumaste trabajo.

Medido: un **acontecimiento** es un ATERRIZAJE — un grupo de elementos que estaban cambiando y **dejan de cambiar** en un lugar del scroll.

## LA VARA, medida contra la referencia (B2-DELTAS §1)
- El hueco entre dos acontecimientos consecutivos de nk: **media 1,11 pantallas, mínimo 0,67, máximo 1,56**, igual a 1440 y a 1920.
- **Ningún hueco por encima de 1,56 pantallas.** Lo que quede arriba se reporta con su número y su razón. No se afloja: se explica.
- El defecto que este bloque arregla no es la densidad media (la nuestra ya es mejor): es **un pozo de 2,44 pantallas** y dos secciones con CERO acontecimientos.

## LOS NUEVE PATRONES YA EXISTEN — no inventes uno
Están en \`src/app/v3/_lib/motion/patrones-tipografia.ts\` (P1 P2 P3 P6) y \`patrones-piezas.ts\` (P4 P5 P7 P8 P9), con sus valores MEDIDOS. Se consumen por \`<Bloque patron="P4">\` del contrato (\`_secciones/_contrato/coreografia.tsx\`). **Si ninguno sirve para lo que necesitás: FRENÁ Y REPORTALO. No inventes un patrón, no cambies un valor de un patrón.**
- P1 línea por línea (yPercent 120→0, escalonado 0,2) · P2 bloque entero (yPercent 60→0) · P3 palabra por palabra (opacity 0,3→1, sin moverse) · P4 lista frenada (y 100→0 px REALES + opacity, power4.out, escalonado 0,2) · P5 crecimiento lineal (scale 0,8→1) · P6 cruce horizontal · P7 planos en profundidad (translateZ −3000→0→1000) · P8 vuelo de 32 piezas · P9 grilla que crece.

## LO QUE LA FASE 0 YA HIZO, y que te condiciona
- **La tabla de alturas cambió** (\`_lib/secciones.ts\`): \`quienes-somos\` 200→**300svh**, \`numeros\` 100→**400svh**. Las otras seis no se tocaron. El documento pasó de 14 a **18 pantallas** y los momentos estructurales de 12,0 a **16,0**.
- Los altos nuevos salen del **techo de velocidad de la cámara** (\`_lib/escena/techoDeVelocidad.ts\`) y de la densidad de nk. No son gusto.
- ⚠️ **\`npm run test:s10-mobile\` está EN ROJO** con dos líneas: \`quienes-somos\` y \`numeros\` **no llenan las pantallas que declaran**. Si tu scope incluye una de esas dos, **cerrar ese rojo es tu gate**.

## REGLAS ABSOLUTAS
1. **Escribís SOLO en tus archivos** (listados abajo). Si necesitás \`_lib/secciones.ts\`, \`_lib/escena/anclaje.ts\`, \`_lib/escena/recorrido.ts\` o cualquier cosa de \`_secciones/_contrato/\` o \`_lib/motion/\`: **NO lo edites — reportalo**. Son de la Fase 0 / compartidos.
2. **NO toques \`_lib/escena/\`** (salvo leerlo): es de otro sprint que corre en paralelo AHORA MISMO en otro worktree.
3. **Frozen, se leen y jamás se editan:** \`src/components/3d/HeroArtifact.tsx\`, \`src/context/TransitionContext.tsx\`, \`src/context/PreloaderContext.tsx\`, \`prisma/schema.prisma\`, \`auth.ts\`, \`lib/prisma.ts\`.
4. **No cambiás CONTENIDO.** Los \`contenido.ts\` y sus marcadores (\`[TEXTO]\`, \`[FOTO DEL EQUIPO]\`, \`[VIDEO]\`…) se quedan tal cual. Podés cambiar GEOMETRÍA y composición.
5. **Cero valores fuera de los tokens.** Nada de \`px\` sueltos ni colores literales: todo sale de \`theme-develop.css\` / las escalas del sistema. Los \`px\` de un patrón (los 100 px de P4) son del patrón, no tuyos.
6. **Cero \`any\`. Cero dependencias nuevas. Cero \`setState\` por frame. Nada de base de datos.**
7. **Archivos de más de 300 líneas se parten.** \`npm run test:s8-montaje\` lo mide.
8. **Ninguna afirmación se afloja. Ninguna comprobación verde por vacío.** Si un invariante tuyo se pone rojo porque cambiaste una propiedad, actualizá la afirmación al valor NUEVO **con su razón en el docblock** — nunca la relajes a algo más débil.
9. **No auto-confirmás que se ve bien.** Podés decir "los acontecimientos pasaron de 2 a 4". No podés decir "queda premium".
10. **Toda cifra con su instrumento.** Una cifra sin instrumento es prosa.

## EL NAVEGADOR ES UNO SOLO Y LO COMPARTEN LOS CUATRO
Abrí **tu propia pestaña** con \`new_page\` sobre \`http://localhost:3001/v3\`. Antes de CADA lectura verificá que devuelva \`visibilityState: 'visible'\` **y** \`innerWidth > 0\`. Si no, \`select_page\` con \`bringToFront: true\` y repetí desde \`emulate\`. **Si después de 3 intentos no conseguís una lectura válida, reportá "no medido" — NO inventes el número, y no lo deduzcas de la geometría.** Con la pestaña oculta el navegador no despacha \`scroll\`, no corre \`requestAnimationFrame\` y \`innerWidth\` devuelve 0: es una lección ya pagada en este repo.

Receta: \`new_page\` → \`emulate\` viewport \`1920x1080x1\` → \`navigate_page\` type \`reload\` con \`initScript: try { sessionStorage.setItem('home:intro','1') } catch (e) {}\` → verificar → medir. Cerrá tu pestaña al terminar.

## CÓMO MEDÍS TUS ACONTECIMIENTOS
Un solo \`evaluate_script\` que barre el scroll de TU sección y devuelve los aterrizajes. Pegalo tal cual, cambiando \`DESDE\` y \`HASTA\` por los píxeles de tu sección (los sacás de \`[data-panel]\`):

\`\`\`js
async () => {
  const DESDE = 0, HASTA = 4320, PASO = 120
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

## CAPTURAS
Las de ANTES ya están tomadas, a 1920, en \`docs/rediseno/capturas/b2/<seccion>-1920-antes.png\`. **Vos tomás las de DESPUÉS**: \`take_snapshot\` con \`filePath\` a tu scratchpad → buscás el \`uid\` de la \`region\` de tu sección → \`take_screenshot\` con ese \`uid\` a \`docs/rediseno/capturas/b2/<seccion>-1920-despues.png\`.

## AL TERMINAR corré, en primer plano, y reportá la salida
Los invariantes de tus secciones (abajo, en tu scope) más estos tres, que son de todos:
\`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\`

## GIT
**No hagas NINGUNA operación de git.** Ni add, ni commit, ni stash, ni checkout. El agente principal comitea.
`

const REPORTE = `
## EL REPORTE (lo que devolvés)
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
          huecoMaximoPantallas: { type: ['number', 'null'] },
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
    key: 'A',
    label: 'A · hero + quiénes somos',
    prompt: `${COMUN}

# TU SCOPE — FRENTE A · Hero + Quiénes somos

Escribís SOLO en:
- \`src/app/v3/_secciones/hero/\` (Hero.tsx, hero.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/quienes-somos/\` (QuienesSomos.tsx, quienes-somos-piezas.tsx, quienes-somos.invariant.tsx — **contenido.ts NO**)

## HERO — 1 pantalla, 1 acontecimiento hoy, objetivo 2
Es \`papel-transparente\` y la escena llena la pantalla; B1 lo midió con **0 % de aire muerto**, así que su defecto NO es el vacío. Hoy entra **el titular con P1 y la bajada+CTA con P2 a la vez**: eso es UN acontecimiento.
- **El candidato natural, dicho por la instrucción: la bajada y el CTA entran DESPUÉS del titular, no con él.** Dos aterrizajes en una pantalla.
- ⚠️ **El alto del hero NO se toca y no es negociable**: \`s8-chrome.invariant.ts\` §2 afirma \`pantallasDe(primera) === 1\` porque de ahí sale el nacimiento de la pastilla de navegación. Está declarado en B2-DELTAS §2.5.
- ⚠️ No toques el encuadre ni \`GEOMETRIA.claseDelTitular\` sin medir: B1 midió el borde seguro del texto contra el logo (contraste 10,45:1 a 1440, cero píxeles bajo AA). Si tu cambio mueve el ancho o la posición del texto, **volvé a medir el contraste bajo el GLIFO** (B1-DELTAS §4-bis) o no lo hagas.

## QUIÉNES SOMOS — **300svh desde la Fase 0**, 2 acontecimientos hoy, objetivo 3–4
⚠️ **HOY DECLARA 3 PANTALLAS Y SU COMPOSICIÓN LLENA 2.** \`npm run test:s10-mobile\` está rojo por eso. **Cerrar ese rojo es tu gate.**
- La composición son dos cajas \`min-h-svh\`: \`data-pantalla="agencia"\` (etiqueta, titular P1, bajada P2, cómo trabajamos P2, lugar) y \`data-pantalla="personas"\` (la foto P2 + las dos personas P2).
- **Cinco piezas que pueden llegar por separado**: titular · bajada · cómo trabajamos · la foto con su pie · las dos personas. Hoy la primera caja entrega **un** aterrizaje agrupado y la segunda **otro**.
- La instrucción del sprint dice: **un momento por bloque de texto con P2 escalonado, y la foto entrando aparte.**
- ⚠️ **El hueco de la foto NO se achica.** Medido a 1920: 1481,59 × 987,72 px, relación 1,500 = los 3:2 que declara \`GEOMETRIA.foto\`. Ya está dimensionado por su relación de aspecto. B1 lo subió de 3 a 4 columnas con su propia medición y bajarlo reabre el hueco que B1 cerró. Está en B2-DELTAS §4.1.
- La tercera pantalla es tuya para componer: repartí las cinco piezas sobre las TRES cajas, no metas relleno.

## Invariantes que corrés al terminar
\`npm run test:s5-hero\` · \`npm run test:s5-quienes-somos\` · \`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\`
${REPORTE}`,
  },
  {
    key: 'B',
    label: 'B · números + trabajos',
    prompt: `${COMUN}

# TU SCOPE — FRENTE B · Números + Trabajos

Escribís SOLO en:
- \`src/app/v3/_secciones/numeros/\` (Numeros.tsx, Cifra.tsx, numeros.invariant.tsx — **contenido.ts NO**)
- \`src/app/v3/_secciones/trabajos/\` (Trabajos.tsx, Proyecto.tsx, geometria.ts, soporte.ts, trabajos-piezas.ts, trabajos.invariant.tsx — **contenido.ts NO**)

## NÚMEROS — **400svh desde la Fase 0**, **CERO acontecimientos hoy**, objetivo 5–6
**Es la sección con más ganancia por menos trabajo de todo el sitio, y la que está peor.** El censo la midió con **cero aterrizajes** a 1920: la mitad del pozo de 2,44 pantallas donde no pasa nada es esta sección.
⚠️ **HOY DECLARA 4 PANTALLAS Y SU COMPOSICIÓN LLENA 1.** \`npm run test:s10-mobile\` está rojo por eso. **Cerrar ese rojo es tu gate.**
- Hoy: un \`min-h-svh\`, la cabecera con P2 y **las cinco cifras entrando con P2 escalonado**, o sea UN acontecimiento agrupado.
- **Las cinco cifras no van en grilla** — dispersas, asimétricas, tamaños distintos, y eso está medido (\`GEOMETRIA\` en \`Numeros.tsx\`).
- **Cinco cifras entrando de a una, cada una en su lugar del scroll, son cinco momentos.** Más la cabecera: seis.
- Los 400svh salen de eso: seis piezas a 0,67 pantallas por acontecimiento —el hueco más chico medido en la referencia— dan 4,0 pantallas exactas. **Repartí las seis sobre las cuatro pantallas.** No metas relleno: repartí lo que ya hay.
- ⚠️ Las cifras son marcadores del pedido (\`cifras[n].valor\`). **No los toques**: son el pedido a Franco.

## TRABAJOS — 3 pantallas pinneadas, 2 acontecimientos hoy, objetivo 3–4
- Ya tiene **P7** con su rampa de llegada de 268 px, y está pinneada sobre 2.160 px de recorrido. \`anclaje="seccion"\` hace que el patrón se reparta contra la sección y no contra el bloque — eso lo arregló B1 y **no se toca**.
- **Tres proyectos son tres momentos, no uno.** Cada uno llega, se queda, y sale.
- **Verificá con scroll REAL que los tres se leen por separado** — no con geometría. Un pin "verificado" comparando alturas no está verificado.
- ⚠️ El alto (300svh) sale de \`altoDeSecuenciaPinneada(3)\` y está atado a que haya 3 proyectos en \`contenido.ts\`. **No lo cambies.**
- ⚠️ El aire muerto de esta sección era 85,65 % antes de B1. Si tu cambio lo empeora, se nota.

## Invariantes que corrés al terminar
\`npm run test:s5-numeros\` · \`npm run test:s5-trabajos\` · \`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\`
${REPORTE}`,
  },
  {
    key: 'C',
    label: 'C · servicios',
    prompt: `${COMUN}

# TU SCOPE — FRENTE C · Servicios

Escribís SOLO en \`src/app/v3/_secciones/servicios/\` (Servicios.tsx, ServiciosEnSecuencia.tsx, CabeceraDeServicios.tsx, ContenidoDeServicio.tsx, geometria.ts, deteccion.ts, s6-servicios.invariant.tsx — **contenido.ts NO**).

## SERVICIOS — 3 pantallas pinneadas, 1 acontecimiento + 2 montajes hoy, objetivo 4–5
**Es la sección más coreografiada del sitio de referencia y la que más lejos está.** nk tiene cinco secuencias pinneadas en su página de servicios y el 60 % de las instancias de un patrón entero; nosotros tenemos una secuencia.

Lo que el censo midió acá, a 1920: **un solo grupo de aterrizajes de 2.040 px de ancho con 131 piezas**, más **dos montajes** (los reemplazos de contenido en \`scrollY\` 8280 y 9000, 47 y 45 elementos). O sea: la secuencia entera se lee como **un** acontecimiento largo con dos cambios de contenido adentro.

- **Lo que YA está y NO se rompe:** un \`sticky\` con un progreso y **tres canales sincronizados** —nombre, panel y párrafo con resaltado—. Eso es correcto.
- **Lo que falta son momentos ADENTRO de esa secuencia:** cada servicio tiene que leerse como un momento propio.
- **Adentro de cada servicio, la lista puede entrar con P4** — los ítems subiendo **100 px reales**, muy frenados. Es el **único uso de \`power4.out\`** del corpus y su lugar natural es exactamente una lista. Ya hay un \`patron="P4"\` en \`ContenidoDeServicio.tsx\`: mirá si está haciendo lo que dice.
- **El resaltado progresivo palabra por palabra (P3) ya está.** **Verificá con scroll REAL que se lee** — que la opacidad de las palabras cambia de verdad a lo largo del recorrido del pin, y no de golpe.
- ⚠️ **EL HUECO DEL \`[VIDEO]\` VOLVIÓ A SU TAMAÑO GRANDE EN B1, A PROPÓSITO. NO LO ACHIQUES.** Es lo único que le da tinta a esas filas hasta que haya video. B1 lo revirtió y midió: aire 44,72 → 33,52 %, banda vacía 120 → 88 px.
- ⚠️ El alto (300svh) sale de \`altoDeSecuenciaPinneada(3)\`, atado a los 3 servicios de \`contenido.ts\`. **No lo cambies.**
- Servicios es hoy la MEJOR sección del sitio en aire muerto (33,52 %, banda máxima 104 px). No la empeores.

## Invariantes que corrés al terminar
\`npm run test:s6-servicios\` · \`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\` · \`npm run test:s6-contraste\`
${REPORTE}`,
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

## TU PANEL — 2 pantallas, 2 acontecimientos hoy, objetivo 2–3
- 200svh y **43,70 % de aire** medido por B1. **Es la que más pide una secuencia y hoy no tiene ninguna.**
- Su contenido es **una lista de capacidades**: **P4**, con los ítems entrando desde 100 px abajo, muy frenados. Ya hay un \`patron="P4"\` en \`TuPanel.tsx\` y otro en \`Capacidades.tsx\`: mirá si están aterrizando por separado o todos juntos.
- ⚠️ El alto (200svh) **no se puede cambiar**: \`servicios : tu panel : por qué develOP\` tiene que quedarse en **3 : 2 : 1** o el ancla de \`tu-panel\` se mueve. La derivación está en B2-DELTAS §5. Si creés que necesitás más alto: **frená y reportá**.

## POR QUÉ DEVELOP — 1 pantalla, 1 acontecimiento hoy, objetivo 1–2
- \`papel-transparente\`: **la escena vuelve acá**, y el ancla declarada es 0,8525. B1 lo midió con **0 % de aire muerto** (la sala llena la pantalla).
- **La vuelta de la escena es un momento en sí mismo** — verificá con scroll real que se lee como llegada, y no como algo que ya estaba.
- **Los cuatro diferenciales pueden entrar de a uno.** Hoy usan P5 (tres instancias) y P1.
- ⚠️ Esta sección **se pasa 24 px de su alto a 1440** (medido: renderiza 924 px en una ventana de 900). Es un pendiente abierto de B1. Si podés cerrarlo sin tocar contenido, cerralo y reportá el número; si no, reportalo.
- ⚠️ El alto (100svh) **no se puede cambiar** — misma razón que Tu panel, B2-DELTAS §5.
- ⚠️ Acá el titular cae sobre el logo y el contraste está al filo: el ancla 0,8525 se eligió con cuatro cifras (\`s16-anclaje\` §5) para que el titular quede limpio y el contraste dé 4,98:1. **Si movés el titular de lugar o de tamaño, volvé a medir el contraste bajo el GLIFO** (B1-DELTAS §4-bis) o no lo muevas.

## CIERRE — 1 pantalla, **CERO acontecimientos hoy**, objetivo 1–2
- **57,59 % de aire, el peor que queda** — y el censo lo midió con **cero aterrizajes**.
- **El titular, el CTA y las columnas del pie entran HOY JUNTOS. Separalos.** Hoy: Cierre.tsx tiene un P1 y un P2, y ColumnasDelPie.tsx un P2.
- ⚠️ El alto (100svh) **no se puede cambiar**: el guardián 3 de \`derivarAnclaje\` tira si el Cierre tiene recorrido de scroll propio. Está en B2-DELTAS §5.
- ⚠️ A 1440 la sección entra en 0,82 pantallas y a 375 se pasa (1,54). El \`alto\` es un piso: no recorta.
- ⚠️ \`Pie.tsx\` (en \`_componentes/chrome/\`) **no es tuyo**. Si lo necesitás, reportalo.

## Invariantes que corrés al terminar
\`npm run test:s6-tu-panel\` · \`npm run test:s6-por-que-develop\` · \`npm run test:s6-cierre\` · \`npm run test:s10-mobile\` · \`npm run test:s6-render\` · \`npm run test:s7-ritmo\`
${REPORTE}`,
  },
]

log(`Fase 1 — cuatro frentes sobre las ocho secciones. Vara: docs/rediseno/sprints/B2-DELTAS.md §6.`)

const reportes = await parallel(
  FRENTES.map((f) => () =>
    agent(f.prompt, { label: `frente ${f.label}`, phase: 'Frentes', schema: ESQUEMA }),
  ),
)

return { reportes: reportes.map((r, i) => ({ frente: FRENTES[i].key, reporte: r })) }

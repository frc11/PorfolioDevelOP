/**
 * INVARIANTE — B9 · CADA COSA A SU TIEMPO: la regla del rango, y el padrón de
 * quién la declara y quién no.
 *
 * Corre con `npm run test:s19-sincronia`. Es todo función pura y lectura de
 * fuente: no monta React, no abre un navegador y no lee el build.
 *
 * ═══ QUÉ PROPIEDAD SOSTIENE ═══════════════════════════════════════════════
 *
 * > **El rango de scroll de una instancia se deriva de la ventana visible de SU
 * > caja: arranca cuando su borde superior está `ENTRADA_EN_CUADRO_PX` adentro
 * > del cuadro y llega cuando su borde inferior está a
 * > `DESCANSO_ANTES_DE_SALIR_PX` del borde de abajo.**
 *
 * Los dos números salen de medir la referencia y no de una preferencia: su
 * procedencia está en `_contrato/asentamiento.ts`. Acá se afirman las tres
 * cosas que pueden romperse en silencio:
 *
 *   1. **Que el ancla publicada por el contrato siga siendo la que se midió.**
 *      `ANCLA_DE_LA_VENTANA_VISIBLE` se escribe a mano en `bloqueAnimado.ts`
 *      —el producto no puede importar un valor de `_lib/motion/` sin romper la
 *      compuerta de 1025— y acá se re-deriva de `ANCLAS.P1`. Es la misma
 *      costura de espejo-con-guardia que `CORTE_DE_TRAMOS` tiene con
 *      `corteDeTramos`.
 *   2. **Que la regla haga lo que dice sobre una caja cualquiera**, con la
 *      fórmula de `posicionDeAncla` y no con un ejemplo.
 *   3. **EL PADRÓN.** Todo `<Bloque>` del lane declara la regla, o está en la
 *      lista de exclusiones **con su motivo**. Un bloque nuevo que se olvide de
 *      declararla pone esto en rojo; una exclusión que alguien agregue tiene
 *      que escribir por qué. Es lo único que impide que la regla se vuelva un
 *      parche sobre doce sitios que se va desactualizando.
 *
 * ⚠️ **Lo que este invariante NO puede ver, y va dicho.** Es fuente y
 * aritmética: no sabe dónde cae cada bloque en el documento ni dónde aterriza
 * en el cuadro. La tabla de desfases se mide con scroll real
 * (`scripts-b9/b9-desfases.ts`) y el ritmo con el censo de B2
 * (`scripts-b9/b9-censo.ts`). Esto sostiene la REGLA; aquéllos, el EFECTO.
 */

import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { ANCLAS, posicionDeAncla, rangoDeScroll, rangoDegenerado } from '../../_lib/motion/anclas'
import { DESCANSO_ANTES_DE_SALIR_PX, ENTRADA_EN_CUADRO_PX } from '../_contrato/asentamiento'
import { ANCLA_DEL_PIN, ANCLA_DE_LA_VENTANA_VISIBLE } from '../_contrato/bloqueAnimado'
import { LANE, leer, recorrer } from './soporte'

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El ancla de la regla ES la de P1, y eso es el hallazgo — no una copia')

/**
 * La referencia ancla su gesto dominante a la ventana visible del elemento: los
 * dos desplazamientos de `ANCLAS.P1` —80 al entrar, 240 al llegar— reproducen
 * su distribución de aterrizajes (p50 0,70 · p75 0,77 de pantalla, medido en
 * `scripts-b9/b9-referencia.ts` sobre 202 elementos animados sin pinnear). Que
 * la regla coincida con el patrón que la referencia usa en 142 de sus 244
 * instancias no es una casualidad cómoda: es de dónde salió.
 */
afirmarIgual(ENTRADA_EN_CUADRO_PX, -ANCLAS.P1.inicio.viewport.px, 'la entrada en cuadro son los 80 px del inicio de P1, leídos del ancla')
afirmarIgual(DESCANSO_ANTES_DE_SALIR_PX, -ANCLAS.P1.fin.viewport.px, 'y el descanso son los 240 del fin de P1')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.inicio.elemento.fraccion, ANCLAS.P1.inicio.elemento.fraccion, 'el lado del elemento al arrancar es el mismo: el borde superior')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.inicio.viewport.fraccion, ANCLAS.P1.inicio.viewport.fraccion, '  y cuelga del borde inferior del cuadro')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.inicio.viewport.px, ANCLAS.P1.inicio.viewport.px, '  con el mismo desplazamiento en píxeles')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.fin.elemento.fraccion, ANCLAS.P1.fin.elemento.fraccion, 'el lado del elemento al llegar es el borde inferior')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.fin.viewport.fraccion, ANCLAS.P1.fin.viewport.fraccion, '  y cuelga del borde inferior del cuadro')
afirmarIgual(ANCLA_DE_LA_VENTANA_VISIBLE.fin.viewport.px, ANCLAS.P1.fin.viewport.px, '  con el mismo desplazamiento en píxeles')
controlPositivo(
  'el ancla de P5 —la que el bloque del diferencial resolvía— NO reproduce la regla',
  ANCLAS.P5,
  (a: typeof ANCLAS.P5) =>
    a.inicio.viewport.fraccion === ANCLA_DE_LA_VENTANA_VISIBLE.inicio.viewport.fraccion &&
    a.inicio.viewport.px === ANCLA_DE_LA_VENTANA_VISIBLE.inicio.viewport.px,
)
controlPositivo(
  'ni el ancla de P2, que llega 240 px antes de tiempo',
  ANCLAS.P2,
  (a: typeof ANCLAS.P2) => a.fin.viewport.px === ANCLA_DE_LA_VENTANA_VISIBLE.fin.viewport.px,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La regla hace lo que dice sobre una caja cualquiera')

/** Tres cajas: una alta, una baja y una más baja que el descanso. */
const CAJAS = [
  { nombre: 'alta', topDoc: 5000, alto: 900 },
  { nombre: 'baja', topDoc: 5000, alto: 120 },
  { nombre: 'más baja que el descanso', topDoc: 5000, alto: 40 },
] as const
const VENTANAS = [1080, 900] as const

for (const V of VENTANAS) {
  for (const c of CAJAS) {
    const caja = { topDoc: c.topDoc, alto: c.alto }
    const r = rangoDeScroll(ANCLA_DE_LA_VENTANA_VISIBLE, caja, V)
    const entraEnCuadro = caja.topDoc - V
    const saleDeCuadro = caja.topDoc + caja.alto
    // El borde inferior de la caja, en coordenadas del cuadro, en el píxel
    // donde el patrón llega. Es la cifra que se compara contra la referencia.
    const fondoAlLlegar = caja.topDoc + caja.alto - r.fin
    afirmarIgual(r.inicio - entraEnCuadro, ENTRADA_EN_CUADRO_PX, `@${V} caja ${c.nombre}: arranca ${ENTRADA_EN_CUADRO_PX} px después de entrar en cuadro`)
    afirmarIgual(V - fondoAlLlegar, DESCANSO_ANTES_DE_SALIR_PX, `  y llega con su borde inferior a ${DESCANSO_ANTES_DE_SALIR_PX} px del borde de abajo del cuadro`)
    afirmar(r.fin < saleDeCuadro, `  o sea ${saleDeCuadro - r.fin} px de scroll ANTES de que la caja salga: llega y se queda quieta`)
    afirmar(r.fin > r.inicio, '  el rango es positivo')
    afirmar(!rangoDegenerado(ANCLA_DE_LA_VENTANA_VISIBLE, caja, V), '  y no degenera')
    afirmarIgual(r.fin - r.inicio, caja.alto + (DESCANSO_ANTES_DE_SALIR_PX - ENTRADA_EN_CUADRO_PX), '  el rango es `alto + 160`')
    afirmar(Math.abs(fondoAlLlegar / V - (1 - DESCANSO_ANTES_DE_SALIR_PX / V)) < 1e-9, `  su borde inferior queda en ${(fondoAlLlegar / V).toFixed(3)} del cuadro`)
  }
}
console.log(`  la referencia aterriza en p25 0,58 · p50 0,70 · p75 0,77 (nk.studio, 1920×1080, 202 elementos sin pinnear). La regla da ${(1 - DESCANSO_ANTES_DE_SALIR_PX / 1080).toFixed(3)} a 1080 y ${(1 - DESCANSO_ANTES_DE_SALIR_PX / 900).toFixed(3)} a 900.`)
controlPositivo(
  'con el ancla de P2 el borde inferior queda AL RAS del borde de abajo (1,000), que es el extremo de la referencia y no su centro',
  ANCLAS.P2,
  (a: typeof ANCLAS.P2) => {
    const caja = { topDoc: 5000, alto: 300 }
    const r = rangoDeScroll(a, caja, 1080)
    return Math.abs((caja.topDoc + caja.alto - r.fin) / 1080 - (1 - DESCANSO_ANTES_DE_SALIR_PX / 1080)) < 1e-9
  },
)
afirmarIgual(
  posicionDeAncla(ANCLA_DEL_PIN.inicio, { topDoc: 5000, alto: 3240 }, 1080),
  5000,
  'el ancla del pin no se toca: sigue arrancando en el tope del panel',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL PADRÓN — quién declara la regla, y quién no con su motivo')

/**
 * LAS EXCLUSIONES, con su motivo y su número. **No es una lista de omisiones:
 * es la parte del padrón que dice por qué.** Cada clave es un fragmento literal
 * del `<Bloque …>` tal como aparece en el fuente, y el invariante exige que
 * exista exactamente una vez: si alguien lo edita, esto se pone rojo antes que
 * la exclusión se vuelva muda.
 */
const EXCLUIDOS: readonly { readonly archivo: string; readonly marca: string; readonly motivo: string }[] = [
  {
    archivo: 'hero/Hero.tsx',
    marca: '<Bloque patron="P1" className={GEOMETRIA.claseDelTitular}>',
    motivo:
      'HERO · el titular. Los dos bloques del hero cierran su rango en `scrollY` NEGATIVO —la sección mide una pantalla— y llegan a su estado final antes del primer píxel de scroll. `Hero.tsx` ya lo declara como aritmética, no como defecto. La regla los correría 240 px y seguirían cerrando en negativo: no compra nada y toca el hero.',
  },
  {
    archivo: 'hero/Hero.tsx',
    marca: '<Bloque patron="P2">',
    motivo:
      'HERO · la bajada y el CTA. Mismo motivo que el titular: la sección mide una pantalla, así que el rango de este bloque cierra en `scrollY` −120 (1920) y −9 (1440) y llega a su estado final antes del primer píxel de scroll. Es aritmética declarada en `Hero.tsx`, no un defecto de sincronía.',
  },
  // ⚠️ B12 · `D-B9.T1` SE CIERRA SIN ARREGLARSE, y hay que decir cómo: el bloque
  // que la llevaba era el MARCO de Trabajos —`<Bloque patron="P2">`, el título y
  // la bajada clavados arriba— y el humano pidió que deje de estar arriba. El
  // marco ya no existe: título y bajada son ahora la PORTADA, el plano de índice
  // −1 del mismo `<Bloque patron="P7" anclaje="seccion">` de acá abajo, que ya
  // estaba excluido por su ancla. **No se arregló la sincronía: se fue el bloque.**
  {
    archivo: 'trabajos/Trabajos.tsx',
    marca: '<Bloque patron="P7" anclaje="seccion"',
    motivo:
      'TRABAJOS · los tres planos. ZONA PROHIBIDA, y además `anclaje: "seccion"`: mide la `<section>` de 300svh y no su propia caja, así que su ventana visible no es la vara. Su rango arranca exactamente cuando la sección entra en cuadro.',
  },
  {
    archivo: 'servicios/Servicios.tsx',
    marca: 'patron="pin"',
    motivo:
      'SERVICIOS · la secuencia pinneada. Resuelve `ANCLA_DEL_PIN`, que es el recorrido del `sticky` (`alto − viewport`) y es correcto por construcción: el bloque no se mueve mientras está clavado, así que su ventana visible no describe nada. `anclasDe` le da el pin ANTES de mirar `rango`, así que la regla no lo puede alcanzar ni por error.',
  },
  {
    archivo: 'cierre/Cierre.tsx',
    marca: '<Bloque patron="P1">',
    motivo:
      'CIERRE · el titular. Su ancla de P1 YA es la de la regla, pero `asentar` lo devuelve a `bottom bottom` y aterriza en 0,967 (1920) / 0,827 (1440). Declarar la regla acá sería afirmar algo que el remapeo desmiente. Cerrarlo pide sacar el asentamiento y reescribir la sección de B2 de `s8-entrada.ts`. DIFERIDO como `D-B9.C1`.',
  },
  {
    archivo: 'cierre/Cierre.tsx',
    marca: '<Bloque patron="P2">',
    motivo:
      'CIERRE · las columnas del pie. LA REGLA NO SE PUEDE CUMPLIR: su punto de llegada cae en `scrollY` 18.415 (1920) y 15.376 (1440), y el último píxel de scroll del documento es 18.360 y 15.300 — 55 y 76 px DESPUÉS del final. Las tres columnas se quedarían al 87 % de su entrada para siempre. Es un hecho de dónde cae el bloque en el documento, no del ancla. DIFERIDO como `D-B9.C2`.',
  },
  {
    archivo: 'tu-panel/TuPanel.tsx',
    marca: '<Bloque patron="P4" className="flex flex-1 flex-col">',
    motivo:
      'TU PANEL · la lista de capacidades. Cumple la regla por su ASENTAMIENTO y no por su ancla: `tu-panel/asentamiento.ts` satura el progreso en `(rango − sobrepaso)/rango` con el sobrepaso re-derivado contra `DESCANSO_ANTES_DE_SALIR_PX`, y eso lo deja aterrizando en el mismo 0,778 / 0,733. Cambiarle el ancla además dejaría el remapeo apuntando a otro rango.',
  },
]

const RE_BLOQUE = /<Bloque\b[^>]*>/g

interface Hallazgo {
  readonly archivo: string
  readonly texto: string
}

/**
 * ⚠️ **El barrido recorre el LANE ENTERO y no `codigoDelLane()`.** Esa función
 * deriva su alcance de `CARPETAS_DE_SECCION`, que declara **cuatro** secciones
 * —las que construyó el lane B— y no las ocho. Un padrón que se apoyara en ella
 * dejaría a `hero`, `quienes-somos`, `numeros` y `trabajos` fuera del alcance y
 * daría verde sin haberlos mirado: exactamente la clase de verde por vacío que
 * el repo persigue. La cuenta de abajo lo hace visible.
 */
const bloques: Hallazgo[] = []
for (const relativo of recorrer(LANE)) {
  if (!relativo.endsWith('.tsx')) continue
  if (/\.invariant\.tsx?$/.test(relativo)) continue
  const texto = leer(relativo)
  for (const m of texto.matchAll(RE_BLOQUE)) bloques.push({ archivo: relativo, texto: m[0] })
}
const SECCIONES_CON_BLOQUE = [...new Set(bloques.map((b) => b.archivo.split('/').at(-2)))].sort()
afirmarIgual(
  SECCIONES_CON_BLOQUE,
  ['cierre', 'hero', 'numeros', 'por-que-develop', 'quienes-somos', 'servicios', 'trabajos', 'tu-panel'],
  'el barrido llega a las OCHO secciones, no a las cuatro de `CARPETAS_DE_SECCION`',
)

afirmar(bloques.length > 0, `${bloques.length} declaraciones de <Bloque> en el lane`, 'no es verde por vacío')

const conRegla = bloques.filter((b) => b.texto.includes('rango="ventana-visible"'))
const sinRegla = bloques.filter((b) => !b.texto.includes('rango="ventana-visible"'))
console.log(`  con la regla: ${conRegla.length} · sin la regla: ${sinRegla.length}`)
for (const b of conRegla) console.log(`    regla   ${path.basename(b.archivo).padEnd(22)} ${b.texto.slice(0, 84)}`)

/**
 * Cada `<Bloque>` sin la regla tiene que estar cubierto por UNA exclusión, y
 * cada exclusión tiene que cubrir al menos uno. Las dos direcciones: una
 * exclusión que sobra es una lista que se quedó vieja, y un bloque sin cubrir
 * es la regla convertida en parche.
 */
const sinCubrir = sinRegla.filter(
  (b) => !EXCLUIDOS.some((e) => b.archivo.endsWith(e.archivo) && b.texto.includes(e.marca.split('\n')[0].trim())),
)
afirmarIgual(
  sinCubrir.map((b) => `${b.archivo} :: ${b.texto}`),
  [],
  'todo <Bloque> que no declara la regla está en el padrón de exclusiones con su motivo',
)

for (const e of EXCLUIDOS) {
  const texto = leer(`src/app/v3/_secciones/${e.archivo}`)
  // Las marcas son de UNA linea a proposito: con `core.autocrlf=true` el fuente
  // en disco puede venir en CRLF, y una marca multilinea escrita con un salto
  // no encontraria nada y la exclusion quedaria muda sin fallar.
  const veces = texto.split(e.marca).length - 1
  afirmarIgual(veces, 1, `  la exclusión de ${e.archivo} apunta a un <Bloque> que existe exactamente una vez: ${e.motivo.slice(0, 60)}…`)
  afirmar(e.motivo.length > 80, `  y trae su motivo escrito (${e.motivo.length} caracteres)`)
}
console.log('')
for (const e of EXCLUIDOS) console.log(`    excluido  ${e.archivo.padEnd(26)} ${e.motivo}`)

controlPositivo(
  'un <Bloque> nuevo sin la regla y sin exclusión NO pasa el padrón',
  { archivo: 'inventada/Inventada.tsx', texto: '<Bloque patron="P2">' },
  (b: Hallazgo) => EXCLUIDOS.some((e) => b.archivo.endsWith(e.archivo) && b.texto.includes(e.marca.split('\n')[0].trim())),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La resolución del ancla, leída del contrato')

/**
 * Que el orden de las ramas de `anclasDe` sea el que es no se puede afirmar
 * llamando a la función —vive en el módulo perezoso y devuelve un objeto, no el
 * camino que tomó—, así que se afirma sobre su fuente. Es la misma clase de
 * comprobación que `s6-servicios` §7 hace contando `useProgresoDePatron(`.
 */
const ANIMADA = leer('src/app/v3/_secciones/_contrato/coreografia-animada.tsx')
const CUERPO = /function anclasDe\(props: BloqueProps\): ParDeAnclas \{([\s\S]*?)\n\}/.exec(ANIMADA)?.[1] ?? ''
afirmar(CUERPO.length > 0, 'se encontró el cuerpo de `anclasDe`')
const LINEAS = CUERPO.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
afirmarIgual(LINEAS.length, 3, 'resuelve en tres ramas y ninguna más')
afirmar(LINEAS[0].includes("props.patron === 'pin'") && LINEAS[0].includes('ANCLA_DEL_PIN'), 'la PRIMERA es el pin: `patron: "pin"` no nombra un patrón de los nueve y `PATRONES["pin"]` no existe')
afirmar(LINEAS[1].includes("props.rango === 'ventana-visible'") && LINEAS[1].includes('ANCLA_DE_LA_VENTANA_VISIBLE'), 'la SEGUNDA es la regla')
afirmar(LINEAS[2].includes('PATRONES[props.patron].anclas'), 'y el defecto sigue siendo el ancla del patrón')
afirmar(
  !/patron="pin"[^>]*rango=/.test(leer('src/app/v3/_secciones/servicios/Servicios.tsx')),
  'el bloque del pin no declara `rango`: la asimetría está en el fuente y no sólo en el orden de las ramas',
)

cerrar('s19-sincronia.invariant')

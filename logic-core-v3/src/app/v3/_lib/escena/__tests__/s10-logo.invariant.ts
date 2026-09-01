/**
 * INVARIANTE — SITIO-S10 · LA COMPOSICIÓN DEL LOGO CONTRA EL TEXTO.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s10-logo.invariant.ts
 *
 * ── LA PREGUNTA, Y POR QUÉ NADIE LA TENÍA CONTESTADA ───────────────────────
 *
 * `s8-tinta` mide el contraste del texto de los paneles transparentes contra
 * **el fondo**, y para eso **descarta los píxeles del logo** (`sinLogo` en
 * `cuadro.ts`) con su razón escrita: sobre el logo el contraste es ~1:1 por
 * construcción, *«y por eso la composición pone el contenido del lado que el
 * logo deja libre»*. Este frente pregunta lo otro: **¿el logo deja el lado
 * libre?** Si no lo deja, esa exclusión deja de ser decisión de método y pasa a
 * ser un agujero de medición.
 *
 * ── LO PRIMERO, Y ES UN HALLAZGO: en cuatro de los cinco anchos NO APLICA ──
 *
 * `_lib/compuerta.ts` monta el escenario sólo desde 1025 (`CONSULTA_ESCENARIO`)
 * y abajo del umbral el bundle ni se descarga: no hay logo con el que competir,
 * así que van con `noCorre` y su motivo. **El eje que sí varía y que nadie miró
 * es la RELACIÓN DE ASPECTO** (§7.6, abierto por escrito: *«en vertical el logo
 * no entra igual»*): a 1025 con los tres altos declarados el cuadro va de 1,139
 * a 1,537, contra el 1,600 de la referencia con la que se compuso el recorrido.
 *
 * **Regla 13:** se **afirma** lo que es propiedad del instrumento o geometría
 * estable, y se **publica con `console.log`** todo juicio de composición que
 * este sprint mide y no arregla. Un defecto no arreglado no se escribe en rojo.
 *
 * ⚠ **La afirmación del §3 sobre el Hero es un guardián deliberado.** Hoy el
 * logo entra ENTERO en el cuadro del Hero en los cuatro aspectos, así que la
 * premisa *«queda cortado por el borde»* con la que llegó este frente **no se
 * reproduce** (regla 11: una instrucción es una fuente, y una fuente que se
 * equivoca se corrige con su medición al lado). Si algún día se decide recortar
 * el Hero a propósito, este invariante se pone en rojo — y ése es el lugar donde
 * esa decisión hay que escribirla, igual que §7.29 hizo con `s8-tinta`.
 */

import { afirmar, cerrar, controlPositivo, noCorre, razonDeContraste, titulo } from '../../__tests__/afirmar'
import { ANCHOS } from '../../__tests__/s10-banco'
import { tokenPx, variantesActivas } from '../../__tests__/s10-css'
import { FUENTE_TITULO, lineasDeTexto } from '../../__tests__/s10-avance'
import { leerAvancesDe } from '../../__tests__/s10-woff2'
import { TINTA_HEX } from '../../superficies'
import { ESCENARIO_MIN_ANCHO_PX } from '../../compuerta'
import { CHOREO_KEYFRAMES } from '../choreography'
import { FRAME_TRAVEL_SAFETY, LOGO_W, TAN_HALF_V } from '@/app/probe-escena/__tests__/harness'
import { SCENE_LOGO_MESH_WORLD } from '@/lib/scene-camera'
import { muestrearCuadro, vistaEn } from './cuadro'
import { muestrearLogo } from './s10-logo'
import {
  ESCENA_REAL,
  TINTA_DEL_LOGO,
  TRANSPARENTES,
  VENTANAS,
  barridoVertical,
  cajaDelLogo,
  cobertura,
  codoDeEncuadre,
  conPose,
  contrasteSobreElFondo as contraElFondo,
  contrasteSobreElLogo as contraste,
  fraccionDentro,
  mayorCaja,
  muestra,
  progresosDe,
  superposicion,
} from './s10-logo-lectura'
import { SUPUESTOS_DE_LAS_CAJAS, aCuadroAlto, aCuadroX } from './s10-logo-cajas'

const AA = 4.5
const pct = (v: number, n = 1): string => `${(v * 100).toFixed(n).padStart(n === 0 ? 4 : 6)}%`
const par = (a: number, b: number): string => `${a.toFixed(2).padStart(5)},${b.toFixed(2).padStart(5)}`

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA COMPUERTA — en cuatro de los cinco anchos la pregunta NO APLICA')

const sinEscena = `abajo de ${ESCENARIO_MIN_ANCHO_PX} \`EscenarioCompuerta\` no monta el canvas (\`_lib/compuerta.ts\`, \`CONSULTA_ESCENARIO\`) y el bundle ni se descarga: no hay logo con el que competir`
for (const a of ANCHOS.filter((w) => w < ESCENARIO_MIN_ANCHO_PX)) noCorre(`el logo contra el texto a ${a}px`, sinEscena)
afirmar(
  ESCENARIO_MIN_ANCHO_PX === tokenPx('--breakpoint-escritorio', 0),
  'el umbral de la compuerta y el breakpoint del tema son el MISMO número',
  `${ESCENARIO_MIN_ANCHO_PX}px`,
)
afirmar(
  !variantesActivas(ESCENARIO_MIN_ANCHO_PX - 1).includes('escritorio') &&
    variantesActivas(ESCENARIO_MIN_ANCHO_PX).includes('escritorio'),
  '  y la escena y la variante `escritorio:` conmutan en el mismo píxel',
  `${ESCENARIO_MIN_ANCHO_PX - 1} → sin · ${ESCENARIO_MIN_ANCHO_PX} → con`,
)
controlPositivo(
  'el detector de «acá hay escena» sabe rechazar el ancho de justo abajo',
  ESCENARIO_MIN_ANCHO_PX - 1,
  (a: number) => a >= ESCENARIO_MIN_ANCHO_PX,
)
console.log(`  los cuadros medidos: ${VENTANAS.map((v) => `${v.etiqueta} (${v.aspecto.toFixed(3)})`).join(' · ')}`)
console.log(`  supuestos de las cajas:\n${SUPUESTOS_DE_LAS_CAJAS.map((s) => `   · ${s}`).join('\n')}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL CONTROL DE EQUIVALENCIA — este muestreador ES el de S8/S10/S11')

for (const p of [0, 0.75, 0.9]) {
  const suyo = muestrearCuadro(p, vistaEn(p), ESCENA_REAL, 200, 113)
  const mio = muestrearLogo(p, 16 / 9, ESCENA_REAL, 200, 113, 1)
  let suma = 0
  for (let i = 0; i < mio.celdasDeLogo; i += 1) suma += mio.valor[i]
  let sumaSinLogo = 0
  for (const v of suyo.sinLogo) sumaSinLogo += v
  const esperada = suyo.media * suyo.total - sumaSinLogo
  afirmar(
    mio.celdasDeLogo === suyo.enLogo,
    `p=${p.toFixed(3)} — la MÁSCARA cuenta los mismos píxeles de logo que \`muestrearCuadro\``,
    `${mio.celdasDeLogo} contra ${suyo.enLogo}`,
  )
  afirmar(
    Math.abs(suma - esperada) < 1e-6,
    '  y el SOMBREADO cierra contra su complemento: Σ logo = media × total − Σ sinLogo',
    `${suma.toFixed(3)} contra ${esperada.toFixed(3)}`,
  )
}
controlPositivo(
  'el comparador de máscara vería una divergencia: no compara un número consigo mismo',
  1,
  (desvio: number) =>
    muestrearLogo(0, 16 / 9, ESCENA_REAL, 60, 34, 1).celdasDeLogo + desvio ===
    muestrearCuadro(0, vistaEn(0), ESCENA_REAL, 60, 34).enLogo,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · CUÁNTO LOGO ENTRA EN EL CUADRO, por sección y por relación de aspecto')

console.log('  sección           cuadro        p     dentro  del cuadro       x        y')
let heroEntero = true
let encerrado = true
for (const fila of TRANSPARENTES) {
  for (const v of VENTANAS) {
    for (const p of progresosDe(fila)) {
      const m = muestra(p, v.aspecto)
      const c = cajaDelLogo(m)
      if (m.tocaElBorde || c === null) {
        encerrado = false
        continue
      }
      if (fila.id === 'hero' && fraccionDentro(m) < 1) heroEntero = false
      console.log(
        `  ${fila.id.padEnd(16)} ${v.etiqueta.padEnd(9)} ${p.toFixed(3)}  ${pct(fraccionDentro(m))}  ${pct(cobertura(m))}` +
          `   ${par(c.x0, c.x1)}  ${par(c.y0, c.y1)}`,
      )
    }
  }
}
afirmar(
  encerrado,
  'LA GRILLA EXTENDIDA ENCIERRA AL LOGO en las 32 muestras: ningún total está truncado',
  'sin este encierro, «entra entero» y «la grilla lo cortó» darían la misma cifra',
)
afirmar(
  heroEntero,
  'HERO — el logo entra ENTERO en el cuadro en los cuatro aspectos y en toda su ventana',
  'la premisa «queda cortado por el borde del cuadro» NO se reproduce con este instrumento',
)
controlPositivo(
  'y el detector sabe ver un logo que se sale: el diferencial en su pose no da 1,000',
  0.75,
  (p: number) => fraccionDentro(muestra(p, VENTANAS[0].aspecto)) >= 1,
)
console.log(
  '  🔴 DEFECTO — el diferencial entra sobre `demos` y ahí el logo SE SALE por arriba: la caja llega a y=+1,05 con el\n  borde del cuadro en +1,00. Es poca ÁREA (≈1%) y mucha MASA: ocupa hasta el 35,9% del cuadro a 1025×900, contra\n  el 6,5% del Hero a 1440×900. Publicado, no arreglado.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · CUÁNTO SE SUPERPONE CON EL TEXTO — banda derivada, alto modelado, y la posición vertical BARRIDA en vez de inventada')

console.log('  sección           cuadro    caja      p      banda x      sup.mín  máx  centrada')
let inevitable = false
for (const fila of TRANSPARENTES) {
  for (const v of VENTANAS) {
    const caja = mayorCaja(fila.id, v.ancho)
    const x0 = aCuadroX(caja.banda.izquierda, v.ancho)
    const x1 = aCuadroX(caja.banda.izquierda + caja.banda.ancho, v.ancho)
    const alto = aCuadroAlto(caja.altoPx, v.alto)
    for (const p of [fila.llenaDesde, (fila.llenaDesde + fila.seVeHasta) / 2]) {
      const m = muestra(p, v.aspecto)
      const b = barridoVertical(m, x0, x1, alto, 100)
      const centrada = superposicion(m, { x0, x1, y0: -alto / 2, y1: alto / 2 }).fraccion
      if (p === fila.llenaDesde && b.minima > 0) inevitable = true
      console.log(
        `  ${fila.id.padEnd(16)} ${v.etiqueta.padEnd(9)} ${caja.etiqueta.padEnd(3)} ${p.toFixed(3)}` +
          `  ${par(x0, x1)}   ${pct(b.minima, 0)} ${pct(b.maxima, 0)}  ${pct(centrada, 0)}`,
      )
    }
  }
}
controlPositivo(
  'el medidor de superposición sabe devolver CERO: una caja fuera de la caja del logo',
  { x0: -1, x1: -0.99, y0: -1, y1: -0.99 },
  (c: { x0: number; x1: number; y0: number; y1: number }) =>
    superposicion(muestra(0.75, VENTANAS[0].aspecto), c).fraccion > 0,
)
console.log(
  `  🔴 DEFECTO — en el diferencial la superposición mínima del titular es MAYOR QUE CERO (${inevitable ? 'sí' : 'no'}): no hay\n  altura de pantalla en la que ese bloque quede limpio, porque la banda del logo cruza la columna de texto entera.\n  En el Hero el mínimo SÍ es cero: ahí la superposición es de posición vertical, no de banda.`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · 🔴 EL CONTRASTE DONDE SE SUPERPONEN — el número que nadie tenía')

for (const fila of TRANSPARENTES) {
  const p = fila.llenaDesde
  const m = muestra(p, VENTANAS[0].aspecto)
  console.log(
    `  ${fila.id.padEnd(16)} p=${p.toFixed(3)} — la tinta ${TINTA_HEX} contra EL LOGO: ${contraste(m, 0).toFixed(2)}:1 (peor) · ` +
      `${contraste(m, 0.05).toFixed(2)}:1 (p05) · ${contraste(m, 0.5).toFixed(2)}:1 (mediana) · ${contraste(m, 1).toFixed(2)}:1 (el MEJOR` +
      ` píxel) — contra el FONDO, que es lo que \`s8-tinta\` publica: ${contraElFondo(p).toFixed(2)}:1`,
  )
}
const mejorSobreElLogo = Math.max(...TRANSPARENTES.map((f) => contraste(muestra(f.llenaDesde, VENTANAS[0].aspecto), 1)))
const peorSobreElFondo = Math.min(...TRANSPARENTES.map((f) => contraElFondo(f.llenaDesde)))
afirmar(
  mejorSobreElLogo < peorSobreElFondo,
  'las dos poblaciones son DISJUNTAS: el mejor píxel del logo es peor que el peor del fondo',
  `${mejorSobreElLogo.toFixed(2)}:1 contra ${peorSobreElFondo.toFixed(2)}:1 — la exclusión de \`sinLogo\` no es conservadora`,
)
afirmar(
  razonDeContraste(TINTA_HEX, TINTA_DEL_LOGO) < 3 && mejorSobreElLogo < AA,
  '  y es por construcción: la tinta del texto y la del logo son el mismo negro',
  `${razonDeContraste(TINTA_HEX, TINTA_DEL_LOGO).toFixed(2)}:1 sin sombrear · sombreado no llega a AA (${AA}:1) ni a 3:1 de texto grande`,
)
controlPositivo('razonDeContraste sabe reprobar: la tinta contra sí misma no pasa AA', TINTA_HEX, (h: string) =>
  razonDeContraste(TINTA_HEX, h) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · DEFECTO O DECISIÓN — lo que el keyframe declara por escrito')

afirmar(
  CHOREO_KEYFRAMES.some((k) => k.name === 'demos' && k.pose.frameX === 1),
  'DECISIÓN — que `demos` LLENE el cuadro está escrito en `choreography.ts` y en §2.2',
  '«Es la única pose donde el logo llena el cuadro —81% del alto en tinta— y es la excepción que la arquitectónica se reserva»',
)
console.log(
  '  DEFECTO — que se SALGA no está escrito en ninguna parte: `choreography.ts` no contiene una sola mención de recorte,\n  y llenar el cuadro y salirse de él no son lo mismo. La decisión declarada cubre la masa; el recorte por arriba y la\n  superposición con el titular no las cubre nadie.',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · LAS PALANCAS, con su número. NINGUNA se aplica en este sprint')

const codoHarness = codoDeEncuadre('demos', LOGO_W, TAN_HALF_V)
const codoRig = codoDeEncuadre('demos', SCENE_LOGO_MESH_WORLD.width, TAN_HALF_V)
const masAngosto = VENTANAS.reduce((a, b) => (b.aspecto < a.aspecto ? b : a))
afirmar(
  masAngosto.aspecto < codoRig && masAngosto.aspecto < codoHarness,
  'PALANCA `frameX` de `demos` — está INERTE en el cuadro más alto, en las DOS cámaras',
  `codo en ${codoHarness.toFixed(3)} (harness) y ${codoRig.toFixed(3)} (rig, §7.15); ${masAngosto.etiqueta} da ` +
    `${masAngosto.aspecto.toFixed(3)} — abajo de los dos, así que \`frameX: 1\` no corre el logo ni un píxel`,
)
afirmar(
  codoDeEncuadre('hero', LOGO_W, TAN_HALF_V) < masAngosto.aspecto,
  '  el Hero no tiene ese problema: su codo queda abajo de todos los aspectos medidos',
  `${codoDeEncuadre('hero', LOGO_W, TAN_HALF_V).toFixed(3)} contra ${masAngosto.aspecto.toFixed(3)}`,
)

const cajaDelHero = mayorCaja('hero', masAngosto.ancho)
const derechaDelHero = aCuadroX(cajaDelHero.banda.izquierda + cajaDelHero.banda.ancho, masAngosto.ancho)
const bordes = [0.8, 0.9, 1].map((fx) => {
  const c = cajaDelLogo(conPose('hero', { frameX: fx }, 0, masAngosto.aspecto))
  return `${fx}→${(c?.x0 ?? Number.NaN).toFixed(3)}`
})
console.log(
  `  PALANCA \`frameX\` del Hero (hoy ${CHOREO_KEYFRAMES[0].pose.frameX}): el borde IZQUIERDO del logo va ${bordes.join(' · ')} y la ` +
    `columna de texto termina en ${derechaDelHero.toFixed(3)} → ni en el tope de 1 libera la columna · costo: mueve el ` +
    'destino del preloader (`scene-framing.ts` proyecta ESTE keyframe) y toca la perilla abierta de §7.1',
)
const distancias = [11, 13, 15].map((d) => {
  const m = conPose('demos', { distance: d }, 0.75, masAngosto.aspecto)
  return `${d}→${(fraccionDentro(m) * 100).toFixed(1)}% dentro / ${(cobertura(m) * 100).toFixed(1)}% del cuadro`
})
console.log(
  `  PALANCA distancia de \`demos\` (hoy ${CHOREO_KEYFRAMES.find((k) => k.name === 'demos')?.pose.distance}): ${distancias.join(' · ')}` +
    ' · costo: rompe «el momento más íntimo» (§2.2) y la condición `altura ≤ −0,214 × distancia` que pone el sol en cuadro',
)
const canal = tokenPx('--grilla-canal-amplio', masAngosto.ancho)
const anchoDeDos = (2 * (cajaDelHero.banda.ancho - 2 * canal)) / 3 + canal
const lineasDeDos = lineasDeTexto(leerAvancesDe(FUENTE_TITULO), cajaDelHero.texto, anchoDeDos, cajaDelHero.tamanoPx, cajaDelHero.interletradoEm)
console.log(
  '  PALANCA medida del titular del Hero (3 de 5 columnas, `GEOMETRIA.columnasDeLaMedida`) → 2 de 5: la columna pasa de ' +
    `${cajaDelHero.banda.ancho.toFixed(0)} a ${anchoDeDos.toFixed(0)}px y su borde derecho de ${derechaDelHero.toFixed(3)} a ` +
    `${aCuadroX(cajaDelHero.banda.izquierda + anchoDeDos, masAngosto.ancho).toFixed(3)} · costo: el titular pasa de ${cajaDelHero.lineas} a ${lineasDeDos} líneas`,
)
console.log(
  `  PALANCA dónde cae la sección en el progreso: a p=0,875 el logo ocupa ${pct(cobertura(muestra(0.875, masAngosto.aspecto))).trim()} del cuadro ` +
    `contra el ${pct(cobertura(muestra(0.75, masAngosto.aspecto))).trim()} de p=0,750 · costo: correr el diferencial hacia adelante lo lleva contra ` +
    'el cruce de AA del FONDO (p=0,878, §7.29) y contra el anclaje entero de SITIO-S9. La más cara.\n' +
    `  Y el margen del encuadre, \`FRAME_TRAVEL_SAFETY\` = ${FRAME_TRAVEL_SAFETY}: llevarlo a 1 corre el logo un ` +
    `${pct((1 - FRAME_TRAVEL_SAFETY) / FRAME_TRAVEL_SAFETY).trim()} más de recorrido en las poses con encuadre, y CERO en las que el codo ya dejó ` +
    'inertes — o sea que no toca el caso que este frente encontró.',
)

cerrar('s10-logo.invariant')

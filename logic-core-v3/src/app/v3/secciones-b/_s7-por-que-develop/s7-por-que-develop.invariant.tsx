/**
 * INVARIANTE — SECCIÓN 07, POR QUÉ DEVELOP.
 *
 * Renderiza la sección a HTML en las DOS ramas —`anima={false}` y `anima={true}`—
 * y afirma sobre el marcado real, no sobre el código fuente. Las cifras que van
 * al reporte se IMPRIMEN acá, aunque ninguna afirmación las mire: una cifra
 * publicada sin instrumento que la produzca es prosa.
 *
 * ⚠️ Este archivo NO se escanea a sí mismo, y hay que decirlo: sus controles
 * positivos contienen a propósito hex, píxeles sueltos, clases de fondo y la
 * frase con cifras inventadas que el lane existe para no escribir. Es la misma
 * excepción declarada que `_invariantes/soporte.ts` deja escrita.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { cn } from '@/lib/utils'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, arbitrariosSinVar, funcionesDeColorEncontradas, hexEncontrados, literalesConUnidad, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { rangoDeScroll, rangoDegenerado } from '../../_lib/motion/anclas'
import { propiedadesDePieza } from '../../_lib/motion/fotograma'
import { PATRONES } from '../../_lib/motion/patrones'
import { COLORES_DEL_CANVAS_DE_PRUEBA, SUPERFICIES, TINTA_HEX } from '../../_lib/superficies'
import { escanearContenido, marcadoresEn, textoVisible } from '../_contrato/contenido'
import { USOS_DECLARADOS, especificacionDe } from '../_contrato/motion'
import { SUPERFICIE_DE_CONTRATO, pantallasDe, seccionDe } from '../_contrato/secciones'
import { codigoDeLaSeccion, leer } from '../_invariantes/soporte'
import { PorQueDevelop } from './PorQueDevelop'
import {
  ALTO_MINIMO_DEL_BLOQUE, ALTO_MINIMO_DEL_BLOQUE_SVH, DIFERENCIALES, ENTRADA,
  NOMBRE_DE_SECCION, PIEZAS_DE_P5, TESTIMONIO, TITULAR,
} from './contenido'

const ID = 'por-que-develop'
const VIEWPORT = 900 // el viewport de la medición de la referencia: 1440×900

const quieto = renderToStaticMarkup(<PorQueDevelop anima={false} />)
const movido = renderToStaticMarkup(<PorQueDevelop anima={true} />)

const ARCHIVOS = codigoDeLaSeccion(ID)
const FUENTE = ARCHIVOS.map((a) => leer(a))
const CARACTERES_DE_FUENTE = FUENTE.reduce((n, t) => n + t.length, 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Abajo de 1025 no se monta una sola transformada')

const transformadas = (html: string): string[] => [...html.matchAll(/style="[^"]*transform:[^"]*"/g)].map((m) => m[0])
const willChange = (html: string): string[] => [...html.matchAll(/will-change[\w-]*/g)].map((m) => m[0])
const marcaDeLineas = (html: string): string[] => [...html.matchAll(/data-lineas-piezas/g)].map((m) => m[0])

console.log(`  marcado: ${quieto.length} caracteres quieto · ${movido.length} caracteres animado`)
afirmarIgual(transformadas(quieto), [], 'con anima=false no hay una sola transformada en el marcado')
afirmarIgual(willChange(quieto), [], 'ni un `will-change`')
afirmarIgual(marcaDeLineas(quieto), [], 'ni la marca del divisor de líneas')

// EL CONTROL POSITIVO de los tres: los mismos detectores contra la rama que sí anima.
afirmar(transformadas(movido).length > 0, `con anima=true hay ${transformadas(movido).length} transformada(s) — los detectores no están ciegos`)
afirmar(willChange(movido).length > 0, `y ${willChange(movido).length} marca(s) de will-change`)
afirmar(marcaDeLineas(movido).length > 0, `y ${marcaDeLineas(movido).length} marca(s) del divisor de líneas`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El texto es el MISMO en las dos ramas')

/**
 * El divisor de líneas emite DOS copias del titular: la accesible (`sr-only`) y
 * la visual (`aria-hidden`, `data-lineas-piezas`). La comparación se hace sobre
 * lo ANUNCIADO, que es lo único que una persona recibe una sola vez.
 */
function sinCopiaVisual(html: string): string {
  let salida = ''
  let i = 0
  for (;;) {
    const marca = html.indexOf('data-lineas-piezas', i)
    if (marca === -1) return salida + html.slice(i)
    const abre = html.lastIndexOf('<span', marca)
    salida += html.slice(i, abre)
    let profundidad = 0
    let j = abre
    for (;;) {
      const otroAbre = html.indexOf('<span', j + 1)
      const cierra = html.indexOf('</span>', j + 1)
      if (cierra === -1) return salida
      if (otroAbre !== -1 && otroAbre < cierra) { profundidad += 1; j = otroAbre; continue }
      if (profundidad === 0) { i = cierra + '</span>'.length; break }
      profundidad -= 1
      j = cierra
    }
  }
}

const textoQuieto = textoVisible(quieto)
const textoMovido = textoVisible(sinCopiaVisual(movido))
afirmarIgual(textoMovido, textoQuieto, 'el texto anunciado es idéntico en las dos ramas')
afirmar(sinCopiaVisual(movido).length < movido.length, `el removedor sacó ${movido.length - sinCopiaVisual(movido).length} caracteres de copia visual — no es una igualdad por vacío`)
afirmarIgual(sinCopiaVisual(quieto).length, quieto.length, 'y no saca nada de la rama quieta, que no tiene copia visual')
afirmarIgual(sinCopiaVisual('<span data-lineas-piezas=""><span>a</span><span>b</span></span>c'), 'c', 'el removedor saca el subárbol entero, no solo la etiqueta')

const TEXTOS_ESPERADOS: readonly string[] = [
  NOMBRE_DE_SECCION, TITULAR, ENTRADA, TESTIMONIO.marcador, TESTIMONIO.forma, TESTIMONIO.firma,
  ...DIFERENCIALES.flatMap((d) => [d.titulo, d.cuerpo]),
]
const faltantes = TEXTOS_ESPERADOS.filter((t) => !textoQuieto.includes(t))
afirmarIgual(faltantes, [], `los ${TEXTOS_ESPERADOS.length} textos de la sección se leen enteros sin una sola animación`)
controlPositivo('el buscador de textos ve uno que falta', 'una frase que la sección no dice', (t: string) => textoQuieto.includes(t))

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Contenido — ningún número que se pueda leer como un hecho')

/** La frase que este lane existe para no escribir. Vive acá, en el instrumento. */
const CONTENIDO_PROHIBIDO_DE_CONTROL = 'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

const hallazgos = escanearContenido(textoQuieto)
console.log(`  escaneados ${textoQuieto.length} caracteres de texto visible`)
afirmarIgual(hallazgos, [], 'cero cifras sospechosas, cero precios y cero números sin declarar')
afirmarIgual(escanearContenido(textoMovido), [], 'y lo mismo en la rama animada')

const marcadores = marcadoresEn(textoQuieto)
console.log(`  marcadores en pantalla: ${marcadores.join(' · ')}`)
afirmar(marcadores.length >= 4, `hay ${marcadores.length} marcadores distintos — "cero hallazgos" no es "cero contenido"`)
afirmar(textoQuieto.includes('Esquina') && textoQuieto.includes('El Garage') && textoQuieto.includes('Matsu Automotores'), 'los tres nombres reales están escritos derecho, sin marcador')

controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t: string) => escanearContenido(t).length === 0)
console.log(`  la frase de control dispara ${escanearContenido(CONTENIDO_PROHIBIDO_DE_CONTROL).length} hallazgos`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Tokens — cero color y cero literales con unidad')

const sinComentarios = FUENTE.map((t) => quitarComentarios(t))
afirmarIgual(sinComentarios.flatMap(hexEncontrados), [], `cero hex en los ${ARCHIVOS.length} archivos (${CARACTERES_DE_FUENTE} caracteres)`)
afirmarIgual(sinComentarios.flatMap(funcionesDeColorEncontradas), [], 'cero rgb()/hsl()/oklch()')
afirmarIgual(sinComentarios.flatMap(literalesConUnidad), [], 'cero literales con unidad')
afirmarIgual(sinComentarios.flatMap(arbitrariosSinVar), [], 'toda clase arbitraria de Tailwind consume var(--token)')

controlPositivo('el detector de hex ve uno', 'color: #0E0E0E', (t: string) => hexEncontrados(t).length === 0)
controlPositivo('el de funciones de color ve una', 'rgba(17, 17, 17, 0.1)', (t: string) => funcionesDeColorEncontradas(t).length === 0)
controlPositivo('el de literales con unidad ve uno', 'const alto = "55svh"', (t: string) => literalesConUnidad(t).length === 0)
controlPositivo('el de arbitrarios ve uno sin var()', 'className="min-h-[55svh]"', (t: string) => arbitrariosSinVar(t).length === 0)

/** LA ÚNICA EXCEPCIÓN DECLARADA: un valor que viene del DATO, en `style`. */
const estilosEnLaFuente = sinComentarios.flatMap((t) => [...t.matchAll(/style=\{\{([^}]*)\}\}/g)].map((m) => m[1].trim()))
afirmarIgual(estilosEnLaFuente, ['minHeight: ALTO_MINIMO_DEL_BLOQUE'], 'el único `style` inline de la carpeta es el alto del bloque de P5')
afirmarIgual(ALTO_MINIMO_DEL_BLOQUE, `${ALTO_MINIMO_DEL_BLOQUE_SVH}svh`, 'y su valor se compone del número declarado más su unidad')
console.log(`  el alto declarado es ${ALTO_MINIMO_DEL_BLOQUE} y aparece ${(quieto.match(/min-height:55svh/g) ?? []).length} vez/veces en el marcado`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Foco — nada interactivo, y nadie apaga el anillo')

const ETIQUETA_DE_CONTROL = /<(a|button|input|select|textarea|summary)\b([^>]*)>/gi
function focalizablesDe(html: string): string[] {
  const encontrados: string[] = []
  for (const m of html.matchAll(ETIQUETA_DE_CONTROL)) {
    const etiqueta = m[1].toLowerCase()
    if (/\sdisabled(?:[=\s>]|$)/i.test(m[2])) continue
    if (etiqueta !== 'a' || /\shref=/.test(m[2])) encontrados.push(`<${etiqueta}`)
  }
  for (const m of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*\btabindex="(?!-1)[^"]*"[^>]*)>/gi)) encontrados.push(`<${m[1]} tabindex`)
  return encontrados
}

afirmarIgual(focalizablesDe(quieto), [], 'la sección no declara ningún elemento interactivo — es contenido puro')
afirmarIgual(focalizablesDe(movido), [], 'y tampoco en la rama animada')
afirmarIgual(sinComentarios.flatMap(apagadosDeFoco), [], 'ningún archivo apaga el anillo de foco')
controlPositivo('el buscador de focalizables ve uno', '<a href="#cierre">Ver el cierre</a>', (h: string) => focalizablesDe(h).length === 0)
controlPositivo('el detector de apagados ve las tres formas', '.a{outline:none}.b{outline-width:0}.c{outline-style:none}', (t: string) => apagadosDeFoco(t).length === 0)
controlPositivo('y también la utilidad de Tailwind', 'const c = "outline-none"', (t: string) => apagadosDeFoco(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Contraste de la tinta contra lo que hay detrás')

const TEMA = leer('src/app/theme-develop.css').replace(/\/\*[\s\S]*?\*\//g, '')
function valorDelTema(token: string): string {
  const m = new RegExp(`${token}\\s*:\\s*([^;]+);`).exec(TEMA)
  if (m === null) throw new Error(`s7: el token ${token} no está en el tema`)
  return m[1].trim()
}
const PAPEL = valorDelTema('--color-fondo')

afirmarIgual(razonDeContraste('#000000', '#FFFFFF').toFixed(4), '21.0000', 'control de la calculadora: negro contra blanco da 21,0000')
afirmarIgual(razonDeContraste(TINTA_HEX, TINTA_HEX).toFixed(4), '1.0000', 'y un color contra sí mismo da 1,0000')

const razones = COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => ({ contra: `${c.token} (${c.hex})`, razon: razonDeContraste(TINTA_HEX, c.hex) }))
const razonPapel = razonDeContraste(TINTA_HEX, PAPEL)
for (const r of razones) console.log(`  tinta ${TINTA_HEX} contra ${r.contra}: ${r.razon.toFixed(4)}:1`)
console.log(`  tinta ${TINTA_HEX} contra el papel --color-fondo (${PAPEL}), que es lo que se ve abajo de 1025: ${razonPapel.toFixed(4)}:1`)

const peor = razones.reduce((a, b) => (a.razon <= b.razon ? a : b))
console.log(`  PEOR CASO sobre el marcador de posición: ${peor.razon.toFixed(4)}:1 contra ${peor.contra}`)
afirmar(peor.razon >= 4.5, `el peor caso pasa AA (4,5:1) — ${peor.razon.toFixed(4)}:1`)
afirmar(peor.razon >= 7, `y pasa AAA (7:1) — ${peor.razon.toFixed(4)}:1`)
afirmar(razones[0].razon !== razones[1].razon, `el comparador ve la diferencia entre los dos colores del canvas: ${razones[0].razon.toFixed(4)} contra ${razones[1].razon.toFixed(4)}`)

/** El número de sección lo pinta `_contrato/Seccion.tsx` a `--opacity-casi`. */
function componer(frente: string, alfa: number, fondo: string): string {
  const canal = (h: string, i: number): number => Number.parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const mezcla = (i: number): string => Math.round(canal(frente, i) * alfa + canal(fondo, i) * (1 - alfa)).toString(16).padStart(2, '0')
  return `#${mezcla(0)}${mezcla(1)}${mezcla(2)}`
}
const ALFA = Number.parseFloat(valorDelTema('--opacity-casi'))
const rotuloPeor = COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => razonDeContraste(componer(TINTA_HEX, ALFA, c.hex), c.hex)).reduce((a, b) => Math.min(a, b))
console.log(`  HEREDADO — el "07" del rótulo va a --opacity-casi (${ALFA}): peor caso ${rotuloPeor.toFixed(4)}:1 sobre el canvas de prueba`)
afirmar(rotuloPeor > 1, `el compositor de alfa produce un número real (${rotuloPeor.toFixed(4)}:1) y no un 1,0000 por no hacer nada`)

console.warn('  ⚠️ ESTA CIFRA VALE PARA EL MARCADOR DE POSICIÓN, que es plano y pinta dos tokens. La escena real es una sala con gradiente y NO hereda este número: hay que volver a medirlo cuando entre.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La sección no pinta fondo — la guardia contra inventar una capa')

const RE_PINTURA = /\bbg-[a-z[][\w[\]().,%-]*|\bbackdrop-[\w-]+|\bbackground(?:-[a-z]+)?\s*:|(?:linear|radial|conic)-gradient|\bbg-gradient[\w-]*|\binset-0\b/g
const pinturas = (t: string): string[] => [...t.matchAll(RE_PINTURA)].map((m) => m[0])

afirmarIgual(sinComentarios.flatMap(pinturas), [], `ninguno de los ${ARCHIVOS.length} archivos pinta fondo, velo, gradiente ni capa a pantalla completa`)
controlPositivo('el detector ve un fondo del sistema', 'className="bg-fondo text-tinta"', (t: string) => pinturas(t).length === 0)
controlPositivo('ve un vidrio esmerilado', 'className="bg-white/[0.04] backdrop-blur-[20px]"', (t: string) => pinturas(t).length === 0)
controlPositivo('ve un gradiente', 'background: linear-gradient(180deg, #fff, #000)', (t: string) => pinturas(t).length === 0)
controlPositivo('y ve una capa a pantalla completa', 'className="absolute inset-0"', (t: string) => pinturas(t).length === 0)

/** El único `bg-` del marcado lo pone `Panel` desde la tabla, no esta sección. */
const fondosEnElMarcado = pinturas(quieto)
console.log(`  el marcado trae ${fondosEnElMarcado.length} utilidad(es) de fondo: ${fondosEnElMarcado.join(' · ') || '(ninguna)'} — las pone Panel desde _lib/secciones.ts`)
const primeraEtiqueta = /<section\b[^>]*>/.exec(quieto)
afirmar(primeraEtiqueta !== null && fondosEnElMarcado.every((f) => primeraEtiqueta[0].includes(f)), 'y todas están en la `<section>` del panel: ningún descendiente de esta sección pinta')

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El rango de P5 no degenera con el alto declarado')

const P5 = PATRONES.P5
const P1 = PATRONES.P1
const altoDelBloque = (VIEWPORT * ALTO_MINIMO_DEL_BLOQUE_SVH) / 100
const caja = { topDoc: 5000, alto: altoDelBloque }
const rango = rangoDeScroll(P5.anclas, caja, VIEWPORT)
const PISO_SVH = 40

console.log(`  a un viewport de ${VIEWPORT}px, ${ALTO_MINIMO_DEL_BLOQUE} son ${altoDelBloque}px de bloque`)
console.log(`  el ancla de P5 mide alto − 0,4·viewport → rango de ${rango.fin - rango.inicio}px de scroll`)
console.log(`  EL ALTO QUE HACE FALTA: más de ${PISO_SVH}svh. Por debajo de ahí el rango sale negativo y el patrón se lee como un salto.`)
afirmar(!rangoDegenerado(P5.anclas, caja, VIEWPORT), `el bloque de ${ALTO_MINIMO_DEL_BLOQUE} no degenera`)
afirmarIgual(rango.fin - rango.inicio, altoDelBloque - 0.4 * VIEWPORT, 'y el rango es exactamente `alto − 0,4·viewport`')
afirmar(!rangoDegenerado(P1.anclas, { topDoc: 5000, alto: 120 }, VIEWPORT), 'P1 no puede degenerar: su rango es `alto + 160px`')

controlPositivo('un bloque de 30svh SÍ degenera', { topDoc: 5000, alto: VIEWPORT * 0.3 }, (c: { topDoc: number; alto: number }) => !rangoDegenerado(P5.anclas, c, VIEWPORT))
controlPositivo('y uno de exactamente 40svh también, porque el rango queda en cero', { topDoc: 5000, alto: VIEWPORT * 0.4 }, (c: { topDoc: number; alto: number }) => !rangoDegenerado(P5.anclas, c, VIEWPORT))

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · Una pantalla, sin pinneado')

const seccion = seccionDe(ID)
console.log(`  la tabla declara alto ${seccion.alto} · pinneada ${String(seccion.pinneada ?? 'no')}`)
afirmarIgual(pantallasDe(seccion.alto), 1, 'la sección ocupa UNA pantalla según la tabla del sitio')
afirmarIgual(seccion.pinneada, undefined, 'y no está pinneada')
afirmarIgual(sinComentarios.flatMap((t) => [...t.matchAll(/\bsticky\b|position\s*:\s*sticky/g)].map((m) => m[0])), [], 'ningún archivo de la carpeta escribe `sticky`')
afirmarIgual([...quieto.matchAll(/\bsticky\b/g)].map((m) => m[0]), [], 'y el marcado tampoco lo trae')
const altosDeclarados = [...quieto.matchAll(/min-height:([^"]*)"/g)].map((m) => m[1])
console.log(`  alturas declaradas en el marcado: ${altosDeclarados.join(' · ')}`)
afirmarIgual(altosDeclarados, [seccion.alto, ALTO_MINIMO_DEL_BLOQUE], 'la sección no declara más alto que el de la tabla: el otro es el del bloque de P5')
controlPositivo('el detector de sticky ve uno', 'className="sticky top-0"', (t: string) => !/\bsticky\b/.test(t))

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Los patrones que declaro son los que están')

const declarados = USOS_DECLARADOS.filter((u) => u.seccion === ID).map((u) => u.patron)
const usadosEnLaFuente = [...new Set(sinComentarios.flatMap((t) => [...t.matchAll(/PATRONES\.(P\d)/g)].map((m) => m[1])))].sort()
afirmarIgual(usadosEnLaFuente, ['P1', 'P5'], 'la sección consume exactamente P1 y P5')
afirmarIgual([...declarados].sort(), usadosEnLaFuente, 'y son los que `_contrato/motion.ts` declara para esta sección en USOS_DECLARADOS')
controlPositivo('el detector ve un patrón que no está declarado', 'const x = PATRONES.P9', (t: string) => [...t.matchAll(/PATRONES\.(P\d)/g)].map((m) => m[1]).every((p) => declarados.includes(p)))

/** La firma de P5 en el marcado: el fotograma en 0 es `scale(0,8)` con opacidad 0. */
const fotogramaCero = propiedadesDePieza(especificacionDe(P5, PIEZAS_DE_P5), 0, 0)
console.log(`  P5 en progreso 0 escribe: transform "${String(fotogramaCero.transform)}" · opacity ${String(fotogramaCero.opacity)}`)
afirmar(fotogramaCero.transform !== undefined && movido.includes(fotogramaCero.transform), 'y ese fotograma exacto está en el marcado animado')
afirmarIgual(PIEZAS_DE_P5, DIFERENCIALES.length + 1, `el conjunto de P5 tiene ${PIEZAS_DE_P5} piezas: los ${DIFERENCIALES.length} diferenciales más el testimonio`)
afirmarIgual(P5.escalonado, 0, 'con escalonado 0: las cinco arrancan juntas, como se midió')
afirmar(movido.includes('data-lineas-accesible'), 'el canal de P1 emite su copia accesible del titular')

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · La superficie: lo propio se afirma, lo heredado se publica')

afirmarIgual(SUPERFICIE_DE_CONTRATO[ID], 'papel-transparente', 'el contrato pide `papel-transparente` para esta sección')
console.log(`  la tabla del lane A declara HOY: ${seccion.superficie}`)
console.log(`  con papel-transparente el panel pinta "${SUPERFICIES['papel-transparente'].clases}" · con papel-opaco "${SUPERFICIES['papel-opaco'].clases}"`)
afirmar(
  SUPERFICIES['papel-transparente'].clases.split(/\s+/).every((c) => SUPERFICIES[seccion.superficie].clases.includes(c)),
  'la superficie de hoy es un superconjunto de la del contrato: lo único que cambia es si se agrega `bg-fondo`',
)
afirmarIgual(sinComentarios.flatMap((t) => [...t.matchAll(/papel-opaco|papel-transparente|oscuro-opaco|text-tinta|bg-fondo/g)].map((m) => m[0])), [], 'la sección no nombra ninguna superficie ni ninguna de sus clases: es correcta con las dos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · Ninguna clase de tamaño tipográfico se pierde en el merge')

const TAMANOS_ESPERADOS = ['text-fluido-titulo-xl', 'text-fluido-titulo-s', 'text-cuerpo', 'text-fluido-caption']
const perdidos = TAMANOS_ESPERADOS.filter((c) => !quieto.includes(c))
afirmarIgual(perdidos, [], `los ${TAMANOS_ESPERADOS.length} tamaños tipográficos de la sección sobreviven al merge de clases`)
/** LA TRAMPA, medida: `tailwind-merge` no conoce los nombres de v3 y mete el
 *  tamaño y el color en el mismo grupo. Por eso esta sección no pisa el color. */
const merge = cn('font-cuerpo', 'text-fluido-caption', 'text-tinta-media')
console.log(`  cn('font-cuerpo','text-fluido-caption','text-tinta-media') → "${merge}"`)
afirmar(!merge.includes('text-fluido-caption'), 'HALLAZGO: pasarle un color a un componente de texto le BORRA el tamaño — por eso acá no se pasa ninguno')

cerrar('s7-por-que-develop.invariant')

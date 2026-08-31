/**
 * INVARIANTE — SERVICIOS: una secuencia, un progreso, un acento por contexto.
 *
 * Renderiza la sección REAL a HTML en las dos ramas —`anima={false}` y
 * `anima={true}`— y afirma sobre el marcado, no sobre la intención. Y sondea
 * los tres tramos con `PanelDeSecuencia`, que es la misma pieza que monta el
 * producto: no hay atributo de forzado en ningún lado.
 *
 * ⚠️ ESTE ARCHIVO NO SE ESCANEA A SÍ MISMO, y hay que decirlo: contiene a
 * propósito la frase con cifras inventadas que el lane existe para no escribir,
 * un hex y un párrafo con las palabras pegadas. `codigoDeLaSeccion` ya excluye
 * los `*.invariant.*`; la exclusión es la que S3 dejó declarada.
 */

import { cn } from '@/lib/utils'
import { useMotionValue } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, arbitrariosSinVar, funcionesDeColorEncontradas, hexEncontrados, literalesConUnidad, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { rangoDeScroll, type ParDeAnclas } from '../../_lib/motion/anclas'
import { ATRIBUTO_PIEZAS } from '../../_lib/motion/lineas'
import { IDS_DE_SERVICIO, SERVICIOS } from '../_contrato/acento'
import { escanearContenido, marcadoresEn, textoVisible } from '../_contrato/escaneo'
import { ANCLA_DEL_PIN } from '../_contrato/motion'
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'
import { cambiosDeTramo, canalesSincronizados, desincronizaciones, tramoDeSecuencia, type LectorDeCanales } from '../_contrato/secuencia'
import { clasesEscritas, codigoDeLaSeccion, leer, valoresDeAcentoDelTema } from '../_invariantes/soporte'
import { cuentaDeAtributo, hayAnidamiento, valoresDeAtributo } from '../_invariantes/marcado'
import { acentosConcretos, cuenta, elementosTipograficos, familiasDeCuerpoPerdidas, familiasDeTituloPerdidas, focalizablesDe, interiorDe, tamanosPerdidos, textoPegado } from './deteccion'
import { CONTENIDO, ITEMS_POR_SERVICIO, LONGITUDES, palabrasDelParrafo } from './contenido'
import { Servicios } from './Servicios'
import { CANTIDAD_DE_TRAMOS, PanelDeSecuencia } from './ServiciosEnSecuencia'

/** La frase que este lane existe para no escribir. Vive acá y no en el
 *  contrato: lleva `%` y `$`, y allá hacía fallar al escáner de tokens contra
 *  su propio arnés. */
const CONTENIDO_PROHIBIDO_DE_CONTROL =
  'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

/** El progreso de una sonda de tramo. Es `PanelDeSecuencia`, la MISMA pieza que
 *  monta el producto: `activo` ya es una propiedad porque el estado está izado. */
function SondaDeTramo({ activo }: { readonly activo: number }): React.JSX.Element {
  const progreso = useMotionValue(0)
  return <PanelDeSecuencia activo={activo} progreso={progreso} />
}

const seccionDeServicios = seccionDe('servicios')
const montada = <Servicios seccion={seccionDeServicios} />
const quieto = marcar(montada, { anima: false })
const animado = marcar(montada, { anima: true })
const tramos = SERVICIOS.map((_, i) => renderToStaticMarkup(<SondaDeTramo activo={i} />))
const ARCHIVOS = codigoDeLaSeccion('servicios')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Qué se construyó, y las cifras que van al reporte')

for (const archivo of ARCHIVOS) {
  console.log(`  ${String(leer(archivo).split('\n').length).padStart(4)} líneas  ${archivo}`)
}
console.log(`  párrafos: ${IDS_DE_SERVICIO.map((id) => `${id} ${LONGITUDES[id]} palabras`).join(' · ')}`)
console.log(`  marcado: rama quieta ${quieto.length} caracteres · rama animada ${animado.length}`)
afirmar(ARCHIVOS.length > 0, `${ARCHIVOS.length} archivos de producto en la carpeta`, ARCHIVOS.map((a) => a.split('/').pop()).join(' · '))
afirmar(ARCHIVOS.every((a) => leer(a).split('\n').length <= 300), 'ningún archivo pasa las 300 líneas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Abajo de 1025 la sección se lee entera y no se mueve nada')

afirmarIgual(cuenta(quieto, /transform:/g), 0, 'sin coreografía no se escribe una sola transformada')
afirmarIgual(cuenta(quieto, /will-change/g), 0, '  ni se promueve una capa de composición')
afirmar(cuenta(animado, /transform:/g) > 0, `CONTROL: con coreografía hay ${cuenta(animado, /transform:/g)} transformadas`)
afirmarIgual(cuenta(animado, /will-change-transform/g), 14, '  y 14 capas promovidas: las 3 filas de P2 y los 11 ítems de P4')
afirmar(cuenta(animado, /opacity:/g) > 0, `  y ${cuenta(animado, /opacity:/g)} opacidades escritas — P3 y P4`)

// El divisor NO aparece en ninguna de las dos, y no es un olvido:
// `USOS_DECLARADOS` no le da P1 a esta sección. El detector se prueba aparte.
afirmarIgual(cuenta(quieto, new RegExp(ATRIBUTO_PIEZAS, 'g')), 0, `sin coreografía no hay ${ATRIBUTO_PIEZAS}`)
afirmarIgual(cuenta(animado, new RegExp(ATRIBUTO_PIEZAS, 'g')), 0, `  y con coreografía tampoco: Servicios no consume P1`)
controlPositivo('el detector del divisor SÍ ve el atributo cuando está', `<span ${ATRIBUTO_PIEZAS}=""></span>`, (h) => cuenta(h, new RegExp(ATRIBUTO_PIEZAS, 'g')) === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El texto es el mismo en las dos ramas')

const textoQuieto = textoVisible(quieto)
const textosDeTramo = tramos.map(textoVisible)
afirmarIgual(textoQuieto, textosDeTramo.join(' '), 'la rama apilada dice EXACTAMENTE lo que dicen los tres tramos juntos')
afirmar(textoQuieto.length > 0, `${textoQuieto.length} caracteres de texto visible`, textosDeTramo.map((t) => `${t.length}`).join(' + '))
controlPositivo('el comparador ve un tramo al que le falta una palabra', textosDeTramo.map((t, i) => (i === 1 ? t.replace('turnos, ', '') : t)), (partes) => textoQuieto === partes.join(' '))

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El contenido no tiene un solo número que se pueda leer como un hecho')

const hallazgos = escanearContenido(textoQuieto)
afirmarIgual(hallazgos, [], `cero hallazgos sobre ${textoQuieto.length} caracteres escaneados`)
const marcadores = marcadoresEn(textoQuieto)
afirmar(marcadores.length >= 4, `el contrapeso: el escáner miró un texto con ${marcadores.length} marcadores`, marcadores.join(' · '))
afirmar(IDS_DE_SERVICIO.every((id) => textoQuieto.includes(CONTENIDO[id].rubro)), 'los tres rubros están en el documento')
afirmar(['Esquina', 'El Garage', 'Matsu Automotores'].every((n) => textoQuieto.includes(n)), 'y los tres clientes REALES también')
controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t) => escanearContenido(t).length === 0)
afirmar(escanearContenido(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, `  y le encuentra ${escanearContenido(CONTENIDO_PROHIBIDO_DE_CONTROL).length} hallazgos`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Cero valores fuera de los tokens')

const fuentes = ARCHIVOS.map((a) => ({ a, texto: quitarComentarios(leer(a)) }))
afirmarIgual(fuentes.flatMap((f) => hexEncontrados(f.texto)), [], 'ningún color escrito a mano')
afirmarIgual(fuentes.flatMap((f) => funcionesDeColorEncontradas(f.texto)), [], 'ninguna función de color literal')
afirmarIgual(fuentes.flatMap((f) => literalesConUnidad(f.texto)), [], 'ningún literal con unidad')
afirmarIgual(fuentes.flatMap((f) => arbitrariosSinVar(f.texto)), [], 'toda clase arbitraria consume var(--token)')
const arbitrarios = fuentes.flatMap((f) => [...f.texto.matchAll(/[a-z][a-z0-9-]*-\[var\(--[a-z0-9-]+\)\]/g)].map((m) => m[0]))
afirmar(arbitrarios.length > 0, `el contrapeso: ${arbitrarios.length} clases arbitrarias revisadas`, [...new Set(arbitrarios)].join(' · '))
controlPositivo('los detectores ven un hex, un px suelto y un arbitrario sin var', 'className="p-[16px] text-[#ff0000]" color: rgba(0,0,0,.1)', (t) => hexEncontrados(t).length + literalesConUnidad(t).length + arbitrariosSinVar(t).length + funcionesDeColorEncontradas(t).length === 0)

// El único estilo inline viene del DATO y está declarado en su lugar.
afirmar(animado.includes(`min-height:${seccionDe('servicios').alto}`), 'el alto del bloque sale de la tabla del sitio, no de una clase muerta')
afirmar(cuenta(animado, /aspect-ratio:/g) === 1, 'y la relación del hueco de medio es el otro estilo del dato')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Foco: nadie apaga el anillo, y no hay nada que lo capture')

afirmarIgual(fuentes.flatMap((f) => apagadosDeFoco(f.texto)), [], 'ningún archivo apaga el anillo de foco')
afirmarIgual(fuentes.flatMap((f) => [...f.texto.matchAll(/\bhover:[a-z[]/g)].map((m) => m[0])), [], 'ninguna variante `hover:` sin su gemela — la coreografía de estado vive en las hojas')
afirmarIgual(focalizablesDe(quieto), [], 'la sección no tiene elementos interactivos: cero focalizables sin coreografía')
afirmarIgual(focalizablesDe(animado), [], '  y cero con coreografía — no hay CTA, y queda reportado')
controlPositivo('el buscador de focalizables no está ciego', '<button>x</button><a href="#y">y</a>', (h) => focalizablesDe(h).length === 0)
controlPositivo('el detector de apagados ve las cuatro formas', '.a{outline:none}.b{outline-width:0}.c{outline-style:none} "outline-none"', (t) => apagadosDeFoco(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · La secuencia es UN progreso — no hay un segundo motor')

// Sin comentarios: `Bloque.tsx` DOCUMENTA por qué no hace falta un
// `IntersectionObserver`, y un buscador ingenuo lo encontraría justo ahí.
const CODIGO = quitarComentarios(
  [...ARCHIVOS, 'src/app/v3/_secciones/_contrato/coreografia-animada.tsx'].map(leer).join('\n'),
)
afirmarIgual(cuenta(CODIGO, /useProgresoDePatron\s*\(/g), 1, 'el motor de progreso se monta UNA sola vez, en el Bloque')
afirmarIgual(cuenta(CODIGO, /<Bloque\b/g), 1, 'y hay UN solo Bloque medido en toda la sección')
for (const prohibida of ['useScroll', 'useProgresoEnTiempoReal', "addEventListener('scroll'", 'scrollY', 'IntersectionObserver']) {
  afirmarIgual(cuenta(CODIGO, new RegExp(prohibida.replace(/[()']/g, '\\$&'), 'g')), 0, `ningún archivo toca \`${prohibida}\` por su cuenta`)
}
controlPositivo('el buscador ve un feed de scroll propio', "useScroll(); window.addEventListener('scroll', f); new IntersectionObserver(g)", (t) => ['useScroll', "addEventListener('scroll'", 'IntersectionObserver'].every((p) => cuenta(t, new RegExp(p.replace(/[()']/g, '\\$&'), 'g')) === 0))

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · La secuencia está sincronizada, y avanza')

afirmarIgual(desincronizaciones(canalesSincronizados, CANTIDAD_DE_TRAMOS), [], 'los cinco canales leen el mismo tramo en los 601 puntos del barrido')
afirmarIgual(cambiosDeTramo(canalesSincronizados, CANTIDAD_DE_TRAMOS), CANTIDAD_DE_TRAMOS - 1, 'y el tramo cambia exactamente 2 veces — ni 0 ni 3')

/** EL CONTROL: tres canales con su propio progreso, desfasados. */
const canalesDesfasados: LectorDeCanales = (p, c) => ({
  nombre: tramoDeSecuencia(p, c).indice,
  medio: tramoDeSecuencia(Math.min(1, p + 0.12), c).indice,
  acento: tramoDeSecuencia(Math.max(0, p - 0.12), c).indice,
  parrafo: tramoDeSecuencia(p * 0.75, c),
  lista: tramoDeSecuencia(Math.min(1, p * 1.3), c),
})
controlPositivo('tres progresos desfasados NO pasan la simultaneidad', canalesDesfasados, (l) => desincronizaciones(l, CANTIDAD_DE_TRAMOS).length === 0)
controlPositivo('y un lector clavado en el primer tramo no pasa el contrapeso', ((p, c) => ({ nombre: 0, medio: 0, acento: 0, parrafo: tramoDeSecuencia(p, c), lista: tramoDeSecuencia(p, c) })) as LectorDeCanales, (l) => cambiosDeTramo(l, CANTIDAD_DE_TRAMOS) === CANTIDAD_DE_TRAMOS - 1)

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · El rango del pin es `alto − viewport`, exacto')

const VIEWPORT = 900
const CAJA = { topDoc: 5000, alto: VIEWPORT * 3 }
const rango = rangoDeScroll(ANCLA_DEL_PIN, CAJA, VIEWPORT)
afirmarIgual(rango.fin - rango.inicio, CAJA.alto - VIEWPORT, `300svh con un hijo de 100svh: el pin recorre ${rango.fin - rango.inicio} px de 200svh`)
afirmarIgual(rango.inicio, CAJA.topDoc, 'el progreso vale 0 justo cuando el bloque llega al tope del viewport')
const lado = (fraccion: number) => ({ fraccion, px: 0 })
const MUTILADAS: readonly ParDeAnclas[] = [
  { inicio: { declarado: 'top bottom', elemento: lado(0), viewport: lado(1) }, fin: ANCLA_DEL_PIN.fin },
  { inicio: ANCLA_DEL_PIN.inicio, fin: { declarado: 'bottom top', elemento: lado(1), viewport: lado(0) } },
]
for (const par of MUTILADAS) {
  controlPositivo(`un ancla \`${par.inicio.declarado} → ${par.fin.declarado}\` no reproduce el pin`, par, (a) => {
    const r = rangoDeScroll(a, CAJA, VIEWPORT)
    return r.fin - r.inicio === CAJA.alto - VIEWPORT
  })
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Un acento por contexto, nunca los tres')

afirmarIgual(cuentaDeAtributo(animado, 'data-servicio'), 1, 'con coreografía hay EXACTAMENTE un [data-servicio], en el sticky')
afirmarIgual(valoresDeAtributo(animado, 'data-servicio'), ['web'], '  y su valor es el del tramo activo')
afirmarIgual(tramos.map((h) => valoresDeAtributo(h, 'data-servicio')[0]), [...IDS_DE_SERVICIO], '  los tres tramos tiñen los tres servicios, en orden')
afirmarIgual(cuentaDeAtributo(quieto, 'data-servicio'), 3, 'sin coreografía hay tres, uno por servicio')
afirmar(!hayAnidamiento(quieto, 'data-servicio'), '  y son HERMANOS: ninguno adentro de otro')
afirmarIgual(cuenta(quieto, /min-h-svh/g), 3, '  cada uno de al menos una pantalla: nunca dos acentos en el mismo cuadro')
controlPositivo('el detector de anidamiento lo vería', '<div data-servicio="a"><div data-servicio="b"></div></div>', (h) => !hayAnidamiento(h, 'data-servicio'))
controlPositivo('y el contador vería un segundo acento', '<div data-servicio="a"></div><div data-servicio="b"></div>', (h) => cuentaDeAtributo(h, 'data-servicio') === 1)

// Cero acento CONCRETO: se consume el alias, nunca el token por servicio.
const acentos = valoresDeAcentoDelTema()
afirmar(acentos.length === 3, `el tema declara ${acentos.length} acentos por servicio`, acentos.map((a) => a.token).join(' · '))
afirmarIgual(fuentes.flatMap((f) => acentosConcretos(leer(f.a))), [], 'ningún archivo nombra un acento por servicio ni su valor')
// El contrapeso: el alias TIENE que llegar al marcado. Se mira la clase emitida
// y no el fuente, porque la sección consume `CLASES_DE_ACENTO` y las cadenas
// literales viven en el contrato.
const clases = new Set(clasesEscritas(animado))
afirmar(['bg-acento', 'text-acento'].every((c) => clases.has(c)), 'y sí llegan al marcado las clases del ALIAS', [...clases].filter((c) => c.endsWith('-acento')).join(' · '))
afirmarIgual([...clases].filter((c) => /acento-[a-z]/.test(c)), [], '  y ninguna utilidad nombra un acento por servicio')
controlPositivo('el buscador ve el token concreto y el hex', `color: ${acentos[0].valor}; --x: var(${acentos[0].token})`, (t) => acentosConcretos(t).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · El párrafo se reconstruye IGUAL, palabra por palabra')

for (let i = 0; i < SERVICIOS.length; i++) {
  const id = SERVICIOS[i].id
  const reconstruido = textoPegado(interiorDe(tramos[i], 'data-canal', 'parrafo'))
  afirmarIgual(reconstruido, CONTENIDO[id].parrafo, `${id}: las ${LONGITUDES[id]} piezas de P3 reconstruyen el párrafo exacto`)
}
const palabrasWeb = palabrasDelParrafo('web')
controlPositivo('el reconstructor ve el rótulo pegado — el defecto "PomeloExplore"', palabrasWeb.map((p) => `<span>${p}</span>`).join(''), (h) => textoPegado(h) === CONTENIDO.web.parrafo)
afirmarIgual(textoPegado(palabrasWeb.map((p, i) => `<span>${i === 0 ? p : ` ${p}`}</span>`).join('')), CONTENIDO.web.parrafo, '  y con el espacio adentro de la pieza sí lo reconstruye')
afirmarIgual(interiorDe('<div data-canal="x"><div>a</div>b</div>', 'data-canal', 'x'), '<div>a</div>b', 'el extractor cuenta profundidad y no corta en el primer cierre')
controlPositivo('el extractor devuelve vacío si el canal no está', '<div>nada</div>', (h) => interiorDe(h, 'data-canal', 'parrafo').length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · La lista es una lista, y las filas son filas')

for (let i = 0; i < SERVICIOS.length; i++) {
  const lista = interiorDe(tramos[i], 'data-canal', 'lista')
  afirmarIgual(cuenta(lista, /<li\b/g), ITEMS_POR_SERVICIO, `${SERVICIOS[i].id}: <ul> con once <li> — quien navega por listas la encuentra`)
}
afirmarIgual(cuenta(quieto, /<ul\b/g), SERVICIOS.length, 'la rama apilada tiene las tres listas')
afirmarIgual(cuentaDeAtributo(animado, 'data-fila'), 3, 'tres filas de P2 por tramo: rótulo, medio y caso')
afirmarIgual(cuentaDeAtributo(quieto, 'data-fila'), 9, 'y nueve en la rama apilada — tres por servicio')
afirmarIgual(cuentaDeAtributo(animado, 'data-medio'), 1, 'un hueco de medio por tramo, con su marcador y su sizes')
afirmarIgual(valoresDeAtributo(animado, 'data-marcador'), ['[VIDEO]'], '  y es un VIDEO: está medido que es video, no imagen fija')
afirmar(valoresDeAtributo(animado, 'data-sizes')[0].includes('vw'), '  con un sizes real compuesto por los ayudantes', valoresDeAtributo(animado, 'data-sizes')[0])
controlPositivo('el contador de ítems vería una lista corta', '<ul><li>uno</li></ul>', (h) => cuenta(h, /<li\b/g) === ITEMS_POR_SERVICIO)

titulo('13 · `cn()` no se comió ninguna clase de tipografía')

/**
 * La trampa es REAL y está medida en este repo: `cn` es `twMerge`, que no
 * conoce los nombres del sistema v3 y mete `text-<tamaño>` y `text-<color>` en
 * el mismo grupo. El control positivo de abajo NO es una entrada fabricada: es
 * la lista de clases que producía `<Micro className="text-tinta-media">` antes
 * del arreglo, corrida por el `cn` de verdad.
 */
const elementos = elementosTipograficos(quieto)
afirmarIgual(tamanosPerdidos(quieto), [], `los ${elementos} elementos tipográficos conservan su clase de tamaño`)
afirmarIgual(tamanosPerdidos(animado), [], '  y también con coreografía')
afirmarIgual(familiasDeTituloPerdidas(quieto), [], '  y ningún titular cayó a la familia de cuerpo — la pérdida que SÍ se ve')
afirmar(elementos >= 3 * 5, `el contrapeso: ${elementos} elementos con data-nivel inspeccionados`)

// HEREDADO, se publica y no se afirma en cero (regla 13). Son de piezas
// compartidas que este lane no toca: `EtiquetaDeSeccion` y el `<Caption>` de
// `HuecoDeMedio`, los dos con `peso="medio"`. Heredan `font-cuerpo` de la raíz
// de /v3, así que no se ve — pero el mecanismo es el mismo que sí se vería en
// un titular. El bound es `<=`: si alguien lo arregla, esto no se pone rojo.
const heredadas = familiasDeCuerpoPerdidas(quieto)
console.log(`  ${heredadas.length} pérdidas de \`font-cuerpo\` HEREDADAS de piezas compartidas:`)
for (const h of new Set(heredadas)) console.log(`    ${h}`)
afirmar(heredadas.length <= 6, `no las agrega esta sección: ${heredadas.length} sobre ${elementos} elementos`, 'dos por servicio, de EtiquetaDeSeccion y del marco de medio')
/**
 * ⚠ ESTOS DOS CONTROLES AFIRMABAN EL DEFECTO, Y SITIO-S7 LO ARREGLÓ.
 *
 * Corrían `cn()` con las clases reales y exigían que el tamaño y la familia
 * DESAPARECIERAN. Era lo correcto mientras el arreglo estuviera fuera del
 * alcance del lane. Ahora la raíz está arreglada, así que se afirma lo
 * contrario con el mismo caso: sobreviven. Si alguien revirtiera el arreglo,
 * esto se pone en rojo — que es para lo que sirve dar vuelta una comprobación
 * en vez de borrarla.
 */
const CON_COLOR = cn('font-cuerpo', 'text-fluido-micro', 'leading-micro', 'tracking-micro', 'font-normal', 'text-tinta-media uppercase')
afirmar(CON_COLOR.split(' ').includes('text-fluido-micro'), 'el tamaño sobrevive a un color por `className`', CON_COLOR)
const CON_FAMILIA = cn('font-cuerpo', 'text-fluido-caption', 'leading-texto', 'tracking-texto', 'font-medio', 'font-codigo uppercase')
afirmar(CON_FAMILIA.split(' ').includes('font-medio'), '  y el peso sobrevive a otra familia', CON_FAMILIA)
afirmar(CON_FAMILIA.split(' ').includes('font-codigo'), '  con la familia que gana siendo la última, que es lo correcto')
controlPositivo('el detector ve un elemento al que le falta el tamaño', '<p data-pieza="texto" data-nivel="micro" class="font-cuerpo leading-micro font-normal text-tinta-media"></p>', (h) => tamanosPerdidos(h).length === 0)
controlPositivo('y un titular al que le falta font-titulo', '<h2 data-nivel="titulo-xl" class="font-cuerpo text-fluido-titulo-xl"></h2>', (h) => familiasDeTituloPerdidas(h).length === 0)

cerrar('s6-servicios.invariant')

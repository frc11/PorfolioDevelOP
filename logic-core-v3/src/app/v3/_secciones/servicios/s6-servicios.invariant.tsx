/**
 * INVARIANTE — SERVICIOS: una secuencia, un progreso, un acento por contexto.
 *
 * Renderiza la sección REAL a HTML en las dos ramas —`anima={false}` y
 * `anima={true}`— y afirma sobre el marcado, no sobre la intención.
 *
 * ⚠️ **Ya no sondea tramos, y no es una pérdida de cobertura.** La rama
 * pinneada montaba un servicio por vez, así que había que renderizarla tres
 * veces —una por tramo— para ver todo lo que llegaba a decir. Desde que es UNA
 * tira continua con los tres bloques siempre en flujo, un solo render los dice
 * a los tres: la comparación entre ramas es directa y no hay que sumar estados.
 *
 * ⚠️ ESTE ARCHIVO NO SE ESCANEA A SÍ MISMO, y hay que decirlo: contiene a
 * propósito la frase con cifras inventadas que el lane existe para no escribir,
 * un hex y un párrafo con las palabras pegadas. `codigoDeLaSeccion` ya excluye
 * los `*.invariant.*`; la exclusión es la que S3 dejó declarada.
 */

import { useMotionValue } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineas, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import { apagadosDeFoco, arbitrariosSinVar, funcionesDeColorEncontradas, hexEncontrados, literalesConUnidad, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ATRIBUTO_PIEZAS } from '../../_lib/motion/lineas'
import { IDS_DE_SERVICIO, SERVICIOS, numeroEnLaSecuencia } from '../_contrato/acento'
import { seccionDe } from '../_contrato/forma'
import { marcar } from '../_invariantes/render'
import { NOMBRES_REALES, escanearLoReal, marcadoresRealesEn, textoVisible } from '../_contrato/escaneo'
import { clasesEscritas, codigoDeLaSeccion, leer, valoresDeAcentoDelTema } from '../_invariantes/soporte'
import { cuentaDeAtributo, hayAnidamiento, quitarSubarbolesConAtributo, valoresDeAtributo } from '../_invariantes/marcado'
import { acentosConcretos, capasDeServicio, capasFueraDelArbol, capasSinPantalla, cuenta, focalizablesDe, interiorDe, srOnlyQueTapanContenido, textoPegado } from './deteccion'
import { afirmarLaTipografia } from './s6-tipografia'
import { afirmarElTraspaso } from './s6-traspaso'
import { CONTENIDO, CTA_POR_SERVICIO, LONGITUDES, ROTULO_DE_LA_INTRO, palabrasDelParrafo } from './contenido'
import { CtaQueRota } from './CtaQueRota'
import { CANTIDAD_DE_ESTADOS } from './RodilloDeEstados'
import {
  CLASE_DE_LA_CAJA_DEL_RODILLO,
  CLASE_DE_LA_RANURA,
  CLASE_DE_LA_RANURA_DE_ENTRADA,
  CURVA_DEL_DISPARO,
  DURACION_DEL_DISPARO,
} from './geometria'
import { Servicios } from './Servicios'
import { afirmarServiciosAngostos } from './angosto-invariante'

/** La frase que este lane existe para no escribir. Vive acá y no en el
 *  contrato: lleva `%` y `$`, y allá hacía fallar al escáner de tokens contra
 *  su propio arnés. */
const CONTENIDO_PROHIBIDO_DE_CONTROL =
  'Crecimos +340% en 3 meses, con planes desde $99.000 por mes y ×2 de leads.'

/** El CTA montado con el 01 puesto: es el único estado en el que existe. */
function SondaDelCta(): React.JSX.Element {
  const posicion = useMotionValue(1)
  return <CtaQueRota posicion={posicion} />
}
const ETIQUETAS_DEL_CTA = IDS_DE_SERVICIO.map((id) => CTA_POR_SERVICIO[id])

const seccionDeServicios = seccionDe('servicios')
const montada = <Servicios seccion={seccionDeServicios} />
const quieto = marcar(montada, { anima: false })
const animado = marcar(montada, { anima: true })
const ARCHIVOS = codigoDeLaSeccion('servicios')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Qué se construyó, y las cifras que van al reporte')

for (const a of ARCHIVOS) console.log(`  ${String(contarLineasDeCodigo(leer(a))).padStart(4)} de código · ${String(contarLineas(leer(a))).padStart(4)} totales  ${a}`)
console.log(`  párrafos: ${IDS_DE_SERVICIO.map((id) => `${id} ${LONGITUDES[id]} palabras`).join(' · ')}`)
console.log(`  marcado: rama quieta ${quieto.length} caracteres · rama animada ${animado.length}`)
afirmar(ARCHIVOS.length > 0, `${ARCHIVOS.length} archivos de producto en la carpeta`, ARCHIVOS.map((a) => a.split('/').pop()).join(' · '))
afirmar(ARCHIVOS.every((a) => contarLineasDeCodigo(leer(a)) <= LIMITE_DE_LINEAS_DE_CODIGO), 'ningún archivo pasa las 300 líneas de código')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Abajo de 1025 la sección se lee entera y no se mueve nada')

afirmarIgual(cuenta(quieto, /transform:/g), 0, 'sin coreografía no se escribe una sola transformada')
afirmarIgual(cuenta(quieto, /will-change/g), 0, '  ni se promueve una capa de composición')
afirmar(cuenta(animado, /transform:/g) > 0, `CONTROL: con coreografía hay ${cuenta(animado, /transform:/g)} transformadas`)
// ⚠️ **TRES, Y EL REPARTO POR DUEÑO ES LA CIFRA QUE IMPORTA.** Fueron 15 —2
// filas de P2, los 11 ítems de P4, el rodillo y la columna—, después 4 cuando
// la lista salió, después 2 —la tira y el rodillo, uno cada uno— y ahora 3.
// Los tres bloques de contenido siguen sin promover NADA porque no se mueven
// por su cuenta: la única traslación de la derecha es la de la tira, que los
// lleva a los tres. Eso es lo que esta cuenta cuida y no cambió.
//
// ⚠️ **La tercera es la LLEGADA DEL ESTADO 00**, y es la única pieza de la
// sección que se mueve por su cuenta a propósito: el canal P2 que hace entrar a
// «Nuestros servicios» desde detrás de su ventana de recorte. La pone `Pieza`
// sola —promueve donde hay transformada y no en todo—, así que subir esta cifra
// no es aflojar la regla: es declarar el dueño nuevo. Si apareciera una CUARTA
// sin dueño, esto se pone en rojo igual que antes.
afirmarIgual(cuenta(animado, /will-change-transform/g), 3, '  y 3 capas promovidas, una por cosa que se mueve: la tira, el rodillo y la llegada del estado 00')
controlPositivo('el contador vería una capa promovida de más', '<div class="will-change-transform"></div>', (h) => cuenta(h, /will-change-transform/g) === 0)
// ⚠️ **LAS OPACIDADES, CONTADAS POR DUEÑO — y el reparto ES la afirmación.**
//
// Pidió «más de cero» (P3 y P4), después «exactamente cero» cuando el párrafo
// pasó a pintarse con un degradado, y después UNA: la de la tira, que entra con
// poco contraste mientras la sección se acerca. El modo de falla que vigila es
// el contrario del que parece: no es que sobre una opacidad, es que APAREZCAN
// varias sobre el contenido — una por bloque sería el apagado por capa entrando
// otra vez por la ventana.
//
// Ahora hay cinco, y por eso se cuentan **separadas**. Las cuatro nuevas son del
// RODILLO, una por ranura, y no apagan contenido: apagan los rótulos que no
// participan del relevo, que es lo que impide que el subrayado del estado
// anterior se asome por el borde de arriba. La puerta que la afirmación cuidaba
// —la tira— sigue cerrada con su UNA, y ahora se afirma sin que el rodillo la
// pueda tapar.
const rodilloParaContar = interiorDe(animado, 'data-rodillo', 'estados')
const fueraDelRodillo = animado.replace(rodilloParaContar, '')
afirmarIgual(cuenta(fueraDelRodillo, /opacity:/g), 1, '  y UNA sola opacidad fuera del rodillo: la entrada atenuada de la tira, no un apagado por bloque')
afirmarIgual(cuenta(rodilloParaContar, /opacity:/g), CANTIDAD_DE_ESTADOS, `  y ${CANTIDAD_DE_ESTADOS} adentro, una por ranura: las que no participan del relevo no se pintan`)
controlPositivo('el contador vería una opacidad colada en la tira', `${fueraDelRodillo}<div style="opacity:0"></div>`, (h: string) => cuenta(h, /opacity:/g) === 1)
controlPositivo('el contador vería una opacidad por bloque', '<div style="opacity:0.3"></div><div style="opacity:0.3"></div>', (h) => cuenta(h, /opacity:/g) === 1)
afirmar(cuenta(animado, /background-position|mask-image/g) > 0, `  CONTROL: lo que sí escribe son ${cuenta(animado, /background-position|mask-image/g)} valores de pintura y máscara`)

// El divisor NO aparece en ninguna de las dos, y no es un olvido:
// `USOS_DECLARADOS` no le da P1 a esta sección. El detector se prueba aparte.
afirmarIgual(cuenta(quieto, new RegExp(ATRIBUTO_PIEZAS, 'g')), 0, `sin coreografía no hay ${ATRIBUTO_PIEZAS}`)
afirmarIgual(cuenta(animado, new RegExp(ATRIBUTO_PIEZAS, 'g')), 0, `  y con coreografía tampoco: Servicios no consume P1`)
controlPositivo('el detector del divisor SÍ ve el atributo cuando está', `<span ${ATRIBUTO_PIEZAS}=""></span>`, (h) => cuenta(h, new RegExp(ATRIBUTO_PIEZAS, 'g')) === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El texto es el mismo en las dos ramas')

/**
 * ⚠️ **CAMBIÓ EL INSTRUMENTO, Y HAY QUE DECIR POR QUÉ NO ES UN AFLOJE.**
 *
 * Comparaba `textoVisible` de las dos ramas, carácter por carácter. Eso dejó de
 * ser comparable cuando el rótulo pasó a estar DOS veces en la rama pinneada: la
 * copia que se VE, en el rodillo de la izquierda, y la que se ANUNCIA, adentro
 * de su bloque de la tira. Un comparador de texto crudo ve esa duplicación como
 * «la animada dice algo de más» y pone en rojo un marcado correcto.
 *
 * La duplicación no es un descuido: es lo que permite que el ORDEN de lo
 * anunciado sea idéntico al de la rama apilada —rótulo, párrafo, medio, caso,
 * por servicio— mientras lo que se ve va en dos columnas. Sin ella, la pinneada
 * anunciaría los tres rótulos juntos y después los tres contenidos, y las tres
 * afirmaciones de igualdad de texto entre ramas se caerían por ORDEN sin que
 * falte una palabra.
 *
 * Así que se compara **lo anunciado**, que es lo que una persona oye, y la
 * duplicación queda ACOTADA por su propia afirmación: el podador tiene que
 * sacar algo (si no sacara nada, estaríamos contando la copia visual) y §10
 * afirma que lo único duplicado es el rodillo, entero bajo `aria-hidden`. Es el
 * mismo criterio que `s10-acceso` dejó escrito para su árbol de encabezados:
 * comparar los crudos habría puesto en rojo un árbol correcto.
 */
const textoAnunciado = (html: string): string =>
  textoVisible(quitarSubarbolesConAtributo(html, 'aria-hidden'))
const textoQuieto = textoAnunciado(quieto)
const visibleQuieto = textoVisible(quieto)
afirmarIgual(textoAnunciado(animado), textoQuieto, 'las DOS ramas ANUNCIAN exactamente lo mismo, en el mismo orden: rótulo, párrafo, medio y caso por servicio')
afirmar(textoQuieto.length > 0, `el contrapeso: ${textoQuieto.length} caracteres de texto anunciado`)
afirmar(
  textoAnunciado(animado).length < textoVisible(animado).length,
  `  y el podador saca ${textoVisible(animado).length - textoAnunciado(animado).length} caracteres de copia visual: la del rodillo`,
  'si no sacara nada, la igualdad estaría contando el rótulo dos veces',
)
// ⚠️ La palabra que se saca se DERIVA de un dato que §4 afirma presente cuatro
// renglones abajo. Escrita a mano ya quedó ciega dos veces —«turnos, » murió
// con el párrafo viejo y «frentes, » con el titular— y un control positivo
// ciego no avisa: pasa en verde.
controlPositivo('el comparador ve una rama a la que le falta una palabra', textoQuieto.replace(NOMBRES_REALES[0], ''), (t) => t === textoQuieto)
controlPositivo('y el podador no deja pasar texto oculto', '<p>visible</p><span aria-hidden="true"><span>tapado</span></span>', (h) => textoAnunciado(h).includes('tapado'))
/** ⚠️ B12 · La cabecera montaba el `05` y el nombre de la sección leídos de la
 *  tabla del recorrido. Los dos se fueron de las ocho: se afirma la AUSENCIA con
 *  la misma fuente que los emitía, no con una cadena escrita a mano. Regla 15. */
const SECCION_DE_LA_TABLA = seccionDe('servicios')
afirmar(!visibleQuieto.includes(SECCION_DE_LA_TABLA.nombre), `el RÓTULO DE SECCIÓN («${SECCION_DE_LA_TABLA.nombre}») ya NO se lee: el título toma su lugar (B12)`)
afirmar(!visibleQuieto.includes(`>${SECCION_DE_LA_TABLA.numero}<`) && !/(^|\s)05(\s|$)/.test(visibleQuieto), `  y el NÚMERO («${SECCION_DE_LA_TABLA.numero}») tampoco`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El contenido no tiene un solo número que se pueda leer como un hecho')

const hallazgos = escanearLoReal(visibleQuieto)
afirmarIgual(hallazgos, [], `cero hallazgos sobre ${visibleQuieto.length} caracteres escaneados`)
// Bajó de 5 a 3 marcadores REALES: [MÉTRICA] y [CIFRA] se fueron con la frase de
// métrica inventada de cada párrafo — el dueño confirmó que no va a haber
// cifras reales de ningún cliente, así que no quedan detrás de la llave
// esperando un dato. Quedan [TESTIMONIO], [VIDEO] y [PÓSTER].
const marcadores = marcadoresRealesEn(visibleQuieto)
// RECURSOS: el video llegó; quedan los [TESTIMONIO] de cada frente.
afirmar(marcadores.length >= 1 && marcadores.every((m) => m === '[TESTIMONIO]'), `el contrapeso: el escáner miró un texto con ${marcadores.length} marcadores, sólo testimonios`, marcadores.join(' · '))
afirmar(IDS_DE_SERVICIO.every((id) => textoQuieto.includes(CONTENIDO[id].rubro)), 'los tres rubros están en el documento')
afirmar(NOMBRES_REALES.every((n) => textoQuieto.includes(n)), `y los ${NOMBRES_REALES.length} clientes REALES también, DERIVADOS de NOMBRES_REALES y no escritos acá`, NOMBRES_REALES.join(' · '))
controlPositivo('el escáner ve la frase prohibida', CONTENIDO_PROHIBIDO_DE_CONTROL, (t) => escanearLoReal(t).length === 0)
afirmar(escanearLoReal(CONTENIDO_PROHIBIDO_DE_CONTROL).length > 0, `  y le encuentra ${escanearLoReal(CONTENIDO_PROHIBIDO_DE_CONTROL).length} hallazgos`)

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
afirmar(cuenta(animado, /aspect-ratio:/g) === 0, 'y el video lleva su relación por clase (`aspect-video`): ningún otro estilo inline')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Foco: nadie apaga el anillo, y no hay nada que lo capture')

afirmarIgual(fuentes.flatMap((f) => apagadosDeFoco(f.texto)), [], 'ningún archivo apaga el anillo de foco')
afirmarIgual(fuentes.flatMap((f) => [...f.texto.matchAll(/\bhover:[a-z[]/g)].map((m) => m[0])), [], 'ninguna variante `hover:` sin su gemela — la coreografía de estado vive en las hojas')
// MÓVIL 2: un CTA al terminar cada servicio (abajo de 1024 se ve; desde 1024 va oculto y rota uno solo).
afirmarIgual(focalizablesDe(quieto), SERVICIOS.map(() => '<button'), 'los únicos focalizables son los CTA de cada servicio, uno por servicio, sin coreografía')
afirmarIgual(focalizablesDe(animado), SERVICIOS.map(() => '<button'), '  y los mismos con coreografía: las dos ramas tienen el mismo recorrido de teclado')
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
/**
 * ⚠️ **DOS BLOQUES, Y LA CUENTA SUBIÓ CON SU MOTIVO.**
 *
 * Era UNO y lo que esa cifra cuidaba sigue intacto: que la SECUENCIA tenga un
 * solo motor, o sea que no haya dos mecanismos moviendo el mismo contenido. Eso
 * lo garantiza la línea de arriba —`useProgresoDePatron` sigue montándose una
 * sola vez, en el `Bloque` del pin— y no ésta.
 *
 * El segundo es la LLEGADA DEL ESTADO 00, y existe porque el pin **no puede
 * expresar su rango**. El progreso del pin está acotado en 0 durante toda la
 * aproximación —medido: el último cuadro con el 00 encendido cae 40 px antes de
 * que el pin enganche— así que un gesto colgado de él empieza cuando la sección
 * ya se posó, que es exactamente lo que se pidió corregir. Su rango es
 * `ventana-de-la-mascara`, el mismo del titular de «El equipo», que abre con la
 * sección todavía entrando.
 *
 * Lo que se afirma, entonces, no es «uno» sino el REPARTO: dos bloques, y el
 * segundo es el del rodillo. Si apareciera un tercero, o si el segundo saliera
 * de otro archivo, esto se pone en rojo igual que antes.
 */
// MÓVIL 2: el tercero es el pin de la cabeza fija de abajo de 1024 (`angosto.tsx`).
afirmarIgual(cuenta(CODIGO, /<Bloque\b/g), 3, 'y hay TRES Bloques medidos: el del pin, el de la llegada del estado 00 y el pin de la cabeza angosta')
afirmarIgual(
  cuenta(quitarComentarios(leer('src/app/v3/_secciones/servicios/RodilloDeEstados.tsx')), /<Bloque\b/g),
  1,
  '  y el segundo es el del rodillo, que es el único que necesita un rango que el pin no puede dar',
)
controlPositivo('el contador vería un cuarto Bloque', `${CODIGO}<Bloque patron="P2">`, (t: string) => cuenta(t, /<Bloque\b/g) === 3)
for (const prohibida of ['useScroll', 'useProgresoEnTiempoReal', "addEventListener('scroll'", 'scrollY', 'IntersectionObserver']) {
  afirmarIgual(cuenta(CODIGO, new RegExp(prohibida.replace(/[()']/g, '\\$&'), 'g')), 0, `ningún archivo toca \`${prohibida}\` por su cuenta`)
}
controlPositivo('el buscador ve un feed de scroll propio', "useScroll(); window.addEventListener('scroll', f); new IntersectionObserver(g)", (t) => ['useScroll', "addEventListener('scroll'", 'IntersectionObserver'].every((p) => cuenta(t, new RegExp(p.replace(/[()']/g, '\\$&'), 'g')) === 0))

// ═══════════════════════════════════════════════════════════════════════════
// B1: el alto de la sección se DERIVA de los pasos, y los pasos son los
// servicios del contenido — la única parte de §9 que no era rango de scroll.
afirmarIgual(seccionDeServicios.pasosDeLaSecuencia, Object.keys(CONTENIDO).length, `los ${SERVICIOS.length} pasos de la tabla SON los servicios de \`contenido.ts\`: la derivación del alto es comprobable. El rodillo tiene UN estado MÁS —el titular de la sección— y ése no es un paso: el alto de la sección no se mueve por él`)
controlPositivo('la afirmación de los pasos vería una tabla desincronizada', { ...seccionDeServicios, pasosDeLaSecuencia: 9 }, (s: typeof seccionDeServicios) => s.pasosDeLaSecuencia === Object.keys(CONTENIDO).length)

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Tres en la tira, cuatro en el rodillo, y UN acento por cuadro')

/**
 * ⚠️ **REESCRITA CONTRA LA PROPIEDAD NUEVA (regla 8 / regla 15), y es la
 * TERCERA vez que esta sección cambia de sujeto. Conviene el historial, porque
 * cada paso endureció la afirmación en vez de aflojarla.**
 *
 *   S10   «con coreografía hay EXACTAMENTE un `[data-servicio]`». Era cierta
 *         **por un defecto**: la secuencia montaba un servicio por vez, así que
 *         los otros dos no existían ni para un lector de pantalla — 26
 *         encabezados contra 24, 43 marcadores contra 33.
 *   S11   los tres en el árbol, uno pintado y dos apagados con `sr-only`.
 *         Arreglaba el árbol y dejaba el intercambio.
 *   HOY   no hay nada que apagar. **Los tres bloques están SIEMPRE en flujo** y
 *         lo único que cambia es cuánto se corrió la tira.
 *
 * Y el intercambio era el problema de fondo, no un detalle de implementación:
 * una capa que se prende no tiene traspaso —nace en su lugar— que es
 * exactamente por qué los servicios se teletransportaban. Por eso `sr-only`
 * sobre un bloque pasa de ser el mecanismo a ser un DEFECTO, y hay una
 * afirmación que lo caza abajo.
 *
 * Lo que se afirma es la propiedad ESTRUCTURAL que sostiene la regla del acento
 * sin depender de ningún apagado: hermanos, nunca anidados, y cada bloque de la
 * tira pide al menos una pantalla. Es la forma que `_contrato/acento.ts` ya
 * declaraba para la rama SIN coreografía; ahora vale para las dos, que es lo
 * que la tira hizo posible.
 */
const tira = interiorDe(animado, 'data-columna', 'tira')
const rodillo = interiorDe(animado, 'data-rodillo', 'estados')
afirmar(tira.length > 0 && rodillo.length > 0, 'el panel publica sus dos piezas: la tira y el rodillo')
afirmarIgual(valoresDeAtributo(tira, 'data-servicio'), [...IDS_DE_SERVICIO], '  la tira lleva los TRES bloques, en el orden de la secuencia')
afirmarIgual(valoresDeAtributo(rodillo, 'data-servicio'), [...IDS_DE_SERVICIO], '  y el rodillo los tres rótulos, en el mismo orden')
afirmarIgual(cuentaDeAtributo(rodillo, 'data-estado'), SERVICIOS.length + 1, `  con ${SERVICIOS.length + 1} estados y no ${SERVICIOS.length}: el titular de la sección es el estado 0`)

/** ⚠️ **EL RODILLO NO PUBLICA UN SOLO ENCABEZADO, y de eso depende `s10-acceso`.**
 *  `encabezados()` filtra por ETIQUETA y no por visibilidad, así que un `<h3>`
 *  acá adentro seguiría entrando al árbol aunque el rodillo sea `aria-hidden` —
 *  y §4 de `s10-acceso` afirma que ningún encabezado sale del árbol por
 *  `aria-hidden`. Con `<span>` el árbol de las dos ramas queda idéntico. */
afirmarIgual(cuenta(rodillo, /<h[1-6]\b/g), 0, 'el rodillo no publica un solo encabezado: los nombres van en `<span>`')
afirmar(/data-rodillo="estados"/.test(animado), '  y se declara como lo que es')
afirmar(
  /<div[^>]*aria-hidden="true"[^>]*data-rodillo="estados"|<div[^>]*data-rodillo="estados"[^>]*aria-hidden="true"/.test(animado),
  '  el rodillo ENTERO va `aria-hidden`: es la copia visual, y lo anunciado vive en la tira',
)
controlPositivo('el detector vería un encabezado colado en el rodillo', '<h3>x</h3>', (h) => cuenta(h, /<h[1-6]\b/g) === 0)

/** EL ESTADO QUE ABRE EL RODILLO tiene la MISMA anatomía que los tres
 *  servicios —rótulo, número, nombre y subrayado— y eso es lo que lo vuelve el
 *  primer estado de una secuencia en vez de un cartel. Lo único que no
 *  comparte es el color: su rótulo y su subrayado son tinta, no el acento de un
 *  servicio, porque todavía no hay servicio del que hablar. */
const intro = interiorDe(rodillo, 'data-estado', 'intro')
afirmarIgual(cuenta(intro, /data-fila="rotulo"/g), 1, 'el estado 0 trae la misma anatomía que los otros tres: su fila de rótulo')
afirmar(intro.includes(numeroEnLaSecuencia(0)), `  con su número (${numeroEnLaSecuencia(0)}), del mismo formateador que los otros`)
afirmar(intro.includes(ROTULO_DE_LA_INTRO), `  y su rótulo propio («${ROTULO_DE_LA_INTRO}»)`)
afirmarIgual(cuenta(intro, /-acento/g), 0, '  y NADA de acento: su rótulo y su subrayado son tinta, no el color de un servicio')
controlPositivo('el detector vería el acento colado en la intro', '<span class="bg-acento"></span>', (h) => cuenta(h, /-acento/g) === 0)

/**
 * ⚠️ **LAS DOS PROPIEDADES DEL RODILLO VIVEN EN LAS CLASES DE LA RANURA, y se
 * pelearían si no fuera por cómo están armadas.**
 *
 *   el subrayado no se mueve   cada ranura apoya su FONDO contra el fondo de
 *                              la caja, y el subrayado es el último hijo
 *   el hueco es constante      la ranura reserva el hueco ARRIBA, con padding,
 *                              en vez de dejar que sea el sobrante de un alto fijo
 *
 * Con ranuras del mismo alto sólo se podía tener la primera: lo que quedaba
 * arriba del bloque era lo que sobraba, y sobraba distinto según cuántos
 * renglones tuviera el título. El padding lo vuelve una decisión y no un resto.
 */
afirmar(CLASE_DE_LA_RANURA.includes('pt-['), 'la ranura reserva el hueco ARRIBA con padding: es una decisión, no el sobrante de un alto fijo')

/** ⚠️ **Y la ranura de entrada tiene que medir EXACTAMENTE la caja**, o el
 *  primer cuadro sale corrido: el traslado del estado 0 vale cero mientras la
 *  medida no llegó, y eso sólo es correcto si su fondo ya coincide con el de la
 *  caja. La cuenta está escrita en los dos lados porque Tailwind escanea el
 *  fuente; acá se afirma que siguen diciendo lo mismo. */
/** La cuenta de una clase arbitraria, sin expresión regular: las barras
 *  invertidas de un patrón no sobreviven a todos los caminos de edición. */
const calcDe = (clase: string): string => {
  const desde = clase.indexOf('calc(')
  if (desde < 0) return ''
  const hasta = clase.indexOf(']', desde)
  return hasta < 0 ? '' : clase.slice(desde, hasta)
}
afirmar(calcDe(CLASE_DE_LA_RANURA_DE_ENTRADA).length > 0, "la ranura de entrada declara su alto con una cuenta de tokens")
afirmarIgual(calcDe(CLASE_DE_LA_RANURA_DE_ENTRADA), calcDe(CLASE_DE_LA_CAJA_DEL_RODILLO), "  y es la MISMA que la de la caja: si se separan, el estado 0 nace fuera de lugar")
controlPositivo('el comparador vería dos cuentas distintas', 'min-h-[calc(var(--spacing-1))]', (c: string) => calcDe(c) === calcDe(CLASE_DE_LA_CAJA_DEL_RODILLO))

// ── EL ACOTAMIENTO DEL `sr-only`, que es la puerta por la que volvió tres veces ──
afirmarIgual(srOnlyQueTapanContenido(animado), [], 'ningún `sr-only` envuelve contenido: sólo el rótulo anunciado, rubro y nombre')
afirmarIgual(cuenta(tira, /sr-only/g), SERVICIOS.length, `  y en la tira hay exactamente ${SERVICIOS.length}, uno por servicio, ni uno más`)
controlPositivo('el detector vería un `sr-only` tapando un bloque de servicio', '<div class="sr-only"><div data-servicio="web"><p data-canal="parrafo">x</p></div></div>', (h) => srOnlyQueTapanContenido(h).length === 0)
controlPositivo('  y uno tapando un párrafo suelto', '<span class="sr-only"><p data-canal="parrafo">x</p></span>', (h) => srOnlyQueTapanContenido(h).length === 0)

afirmarIgual(capasSinPantalla(tira), [], 'cada bloque de la tira pide al menos una pantalla: nunca dos acentos posados en el mismo cuadro')
afirmarIgual(capasFueraDelArbol(animado), [], 'ninguno se esconde con algo que lo borre del árbol — es el defecto 1, y no vuelve')
afirmarIgual(capasDeServicio(quieto).map((c) => c.id), [...IDS_DE_SERVICIO], 'sin coreografía están los mismos tres, en el mismo orden')
afirmarIgual(capasSinPantalla(quieto), [], '  y también piden su pantalla')
afirmar(!hayAnidamiento(quieto, 'data-servicio') && !hayAnidamiento(animado, 'data-servicio'), '  y en las DOS ramas son HERMANOS: ninguno adentro de otro')
controlPositivo('el lector de la caja ve un bloque sin su pantalla', '<div data-servicio="web" class="flex w-full"></div>', (h) => capasSinPantalla(h).length === 0)
controlPositivo('y una capa con `aria-hidden`, que sí la borra del árbol', '<div data-servicio="a" aria-hidden="true" class="sr-only"></div>', (h) => capasFueraDelArbol(h).length === 0)
controlPositivo('el detector de anidamiento lo vería', '<div data-servicio="a"><div data-servicio="b"></div></div>', (h) => !hayAnidamiento(h, 'data-servicio'))

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

/** ⚠️ S11: se acota primero a la CAPA de cada servicio, porque con los tres
 *  montados `interiorDe(tramo, 'data-canal', 'parrafo')` devuelve siempre el
 *  primero. De paso quedan cubiertas las DOS formas del canal: sólo `web` tiene
 *  progreso, así que las otras dos se reconstruyen desde las piezas quietas. */
for (const { id } of SERVICIOS) {
  // Por la TIRA y no por el documento: el rodillo también lleva
  // `data-servicio`, y `interiorDe` devuelve el PRIMERO — su ranura.
  const capa = interiorDe(tira, 'data-servicio', id)
  const reconstruido = textoPegado(interiorDe(capa, 'data-canal', 'parrafo'))
  afirmarIgual(reconstruido, CONTENIDO[id].parrafo, `${id}: las ${LONGITUDES[id]} piezas de P3 reconstruyen el párrafo exacto`)
}
const palabrasWeb = palabrasDelParrafo('web')
controlPositivo('el reconstructor ve el rótulo pegado — el defecto "PomeloExplore"', palabrasWeb.map((p) => `<span>${p}</span>`).join(''), (h) => textoPegado(h) === CONTENIDO.web.parrafo)
afirmarIgual(textoPegado(palabrasWeb.map((p, i) => `<span>${i === 0 ? p : ` ${p}`}</span>`).join('')), CONTENIDO.web.parrafo, '  y con el espacio adentro de la pieza sí lo reconstruye')
afirmarIgual(interiorDe('<div data-canal="x"><div>a</div>b</div>', 'data-canal', 'x'), '<div>a</div>b', 'el extractor cuenta profundidad y no corta en el primer cierre')
controlPositivo('el extractor devuelve vacío si el canal no está', '<div>nada</div>', (h) => interiorDe(h, 'data-canal', 'parrafo').length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · La derecha es UN párrafo, y las filas son filas')

/* ⚠️ **ESTAS CUATRO AFIRMACIONES DECÍAN LO CONTRARIO, y el cambio es de
   propiedad, no de umbral.** Hasta acá la columna derecha publicaba
   `<ul data-canal="lista">` con once `<li>` por servicio —el canal P4— y §12
   afirmaba que los once estaban. El pedido es una sola masa de texto que se
   pinta mientras el paso avanza, así que la lista se fue de las DOS ramas.

   Lo que se afirma ahora NO es «ya no hay lista» a secas —eso lo cumpliría
   también una sección vacía— sino las dos mitades juntas: cero listas Y el
   párrafo completo en su lugar, servicio por servicio. Es la misma forma que
   §11 usa para el canal del párrafo, y por eso el control positivo de abajo
   corre el detector contra un marcado que SÍ trae una lista. */
for (const { id } of SERVICIOS) {
  const capa = interiorDe(tira, 'data-servicio', id)
  afirmarIgual(cuenta(capa, /<ul\b/g), 0, `${id}: la columna derecha no publica ninguna lista`)
  afirmar(
    interiorDe(capa, 'data-canal', 'parrafo').length > 0,
    `  y sí publica el canal del párrafo, que es lo que la reemplaza`,
  )
}
afirmarIgual(cuenta(quieto, /<ul\b/g), 0, 'y la rama apilada tampoco: se fue de las dos a la vez')
afirmarIgual(cuenta(animado, /<li\b/g) + cuenta(quieto, /<li\b/g), 0, '  cero `<li>` en las dos ramas sumadas')
controlPositivo('el detector de listas SÍ las ve cuando están', '<ul><li>uno</li></ul>', (h) => cuenta(h, /<ul\b/g) === 0)
/** ⚠️ **DIEZ con coreografía y NUEVE sin ella, y la diferencia es el estado que
 *  abre el rodillo.** No es una asimetría entre ramas: es que la rama pinneada
 *  tiene un rótulo más —el `00` de la sección— que la apilada no necesita,
 *  porque ahí el titular ya está arriba como encabezado. Se deriva de la cuenta
 *  de estados para que agregar un servicio no deje el número viejo. */
afirmarIgual(cuentaDeAtributo(animado, 'data-fila'), SERVICIOS.length * 2 + CANTIDAD_DE_ESTADOS, `${SERVICIOS.length * 2 + CANTIDAD_DE_ESTADOS} filas con coreografía: medio y caso por servicio, más los ${CANTIDAD_DE_ESTADOS} rótulos del rodillo`)
afirmarIgual(cuentaDeAtributo(quieto, 'data-fila'), 9, 'y las mismas nueve en la rama apilada')
// RECURSOS: el hueco pasó a ser el video de muestra, uno por servicio, mudo, en bucle y sin cargar hasta acercarse.
const videos = [...animado.matchAll(/<video\b[^>]*>/g)].map((m) => m[0])
afirmarIgual(videos.length, SERVICIOS.length, 'un video por servicio')
afirmar(videos.every((v) => /muted/.test(v) && /loop/.test(v) && /playsInline|playsinline/.test(v) && /preload="none"/.test(v) && /poster="/.test(v) && !/ src="/.test(v)), '  mudo, en bucle, en línea, con póster y SIN fuente en el servidor: la pide recién cuando se acerca')
// ═══════════════════════════════════════════════════════════════════════════
titulo('14 · El rodillo DISPARA, y su máquina no sale de su archivo')

/**
 * ⚠️ **ESTE SPRINT DESHIZO A PROPÓSITO UNA GARANTÍA, Y ÉSTA ES LA QUE LA
 * REEMPLAZA.**
 *
 * El sprint anterior cerró con «la sección no re-renderiza durante el pin: todo
 * lo que se mueve es un `useTransform` puro». El rodillo dejó de serlo: ahora
 * cruzar una frontera DISPARA una animación por tiempo, que corre sola aunque
 * la persona frene el scroll. Eso es un efecto y un valor que se escribe solo.
 *
 * Lo que NO se puede perder es la otra mitad: **la tira sigue siendo continua y
 * lineal, y el estado del rodillo no la toca.** Un `useState` en el panel —o un
 * disparo que subiera por una prop— re-renderizaría la columna derecha en cada
 * rotación, y con eso volvería la clase de falla que la tira vino a cerrar.
 *
 * Como eso no se puede leer del marcado, se afirma sobre el FUENTE: la máquina
 * del disparo tiene que estar entera en un solo archivo, y los dos que arman la
 * derecha no pueden nombrarla. Es la misma forma que §7 usa para afirmar que hay
 * un solo motor de progreso.
 */
const fuenteDe = (sufijo: string): string => {
  const ruta = ARCHIVOS.find((a) => a.endsWith(sufijo))
  if (ruta === undefined) throw new Error(`s6-servicios: no encontré ${sufijo}`)
  return quitarComentarios(leer(ruta))
}
const MAQUINA_DEL_DISPARO = /\banimate\(|useMotionValueEvent\(/g
const fuenteDelDisparo = fuenteDe('disparo.ts')
const fuenteDelRodillo = fuenteDe('RodilloDeEstados.tsx')
const fuenteDeLaTira = fuenteDe('TiraDeServicios.tsx')
const fuenteDelPanel = fuenteDe('ServiciosEnSecuencia.tsx')

/** ⚠️ **EL DISPARO SE MUDÓ, Y LA AFIRMACIÓN SE ENDURECIÓ.** Vivía adentro del
 *  rodillo y la afirmación era «el disparo vive en `RodilloDeEstados`». Ahora
 *  rotan TRES cosas con el mismo cambio de estado —el rodillo, la torta y el
 *  CTA— y la instrucción es explícita: la torta usa el mismo disparo, no un
 *  reloj propio. Tres consumidores con tres relojes se desincronizan en cuanto
 *  alguien toque una duración; leyendo el mismo `MotionValue`, no pueden.
 *
 *  Así que lo que se afirma ya no es en qué archivo está, sino que hay UNO: una
 *  sola máquina y una sola llamada que la arma. */
afirmarIgual(cuenta(fuenteDelDisparo, /\banimate\(/g), 1, 'el disparo es UNO y vive en `disparo.ts`')
afirmarIgual(cuenta(fuenteDelRodillo, MAQUINA_DEL_DISPARO), 0, '  y el rodillo ya no la arma: la recibe resuelta')
afirmarIgual(cuenta(fuenteDelPanel, /useEstadoDisparado\(/g), 1, '  el panel la arma UNA vez y se la reparte a los tres que rotan')
afirmarIgual(cuenta(fuenteDeLaTira, MAQUINA_DEL_DISPARO), 0, '`TiraDeServicios` no nombra la máquina: la tira no se entera de que el rodillo rota')
afirmarIgual(cuenta(fuenteDeLaTira, /useEstadoDisparado\(/g), 0, '  ni la recibe: su `y` sigue siendo una función lineal del progreso del pin')
afirmarIgual(cuenta(fuenteDeLaTira, /\buseState\(/g) + cuenta(fuenteDelPanel, /\buseState\(/g), 0, '  y ninguno de los dos guarda estado de React: la medición vive en `useMedidaDeLaTira`')
controlPositivo('el detector vería la máquina colada en otro archivo', 'animate(posicion, 2)', (t) => cuenta(t, MAQUINA_DEL_DISPARO) === 0)

/** La duración y la curva son constantes a mano, no valores del sistema de
 *  motion: el disparo es de esta sección y no un patrón del padrón. */
afirmar(DURACION_DEL_DISPARO > 0, `el disparo dura ${DURACION_DEL_DISPARO} s, escrito a mano`)
afirmarIgual(CURVA_DEL_DISPARO.length, 4, '  y su curva es una cúbica de cuatro puntos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('15 · El pintado va por PALABRA, y no corta ninguna al medio')

/**
 * El barrido anterior era un degradado corriéndose por detrás del texto: el
 * frente avanzaba en el eje horizontal y **partía las palabras al medio**.
 * Ahora cada palabra es una pieza con su umbral, así que lo que avanza es la
 * cuenta de palabras resueltas.
 *
 * Se afirma la CUENTA contra las palabras reales de los tres párrafos —ni una
 * de más ni de menos— y que las dos clases del mecanismo viejo ya no están.
 * Que el texto siga siendo idéntico lo afirma §11, que lo reconstruye.
 */
const PALABRAS_DE_LOS_TRES = IDS_DE_SERVICIO.reduce((n, id) => n + palabrasDelParrafo(id).length, 0)
afirmarIgual(cuenta(animado, /data-pieza="palabra"/g), PALABRAS_DE_LOS_TRES, `${PALABRAS_DE_LOS_TRES} piezas de palabra con coreografía: las de los tres párrafos, sin una de más`)
/** ⚠️ **LA RAMA APILADA PARTE EL PÁRRAFO CON OTRO MECANISMO, y es a propósito.**
 *  Abajo de 1025 el párrafo sigue saliendo del canal P3 —`CanalDePiezas`, que
 *  emite sus propias piezas— porque ahí no hay nada que pintar y porque ES el
 *  patrón que `USOS_DECLARADOS` le asigna a esta sección; sacarlo dejaría al
 *  padrón compartido diciendo algo falso.
 *
 *  Así que lo que se compara entre ramas NO es la cuenta de piezas —serían dos
 *  mecanismos y la cifra no significaría lo mismo— sino la propiedad que los
 *  dos tienen que cumplir: **el texto reconstruido, sin insertar separadores,
 *  es idéntico al del contenido.** Partir en palabras no puede mover ni una
 *  coma ni un espacio, en ninguna de las dos. */
for (const { id } of SERVICIOS) {
  const bloque = interiorDe(quieto, 'data-servicio', id)
  const rehecho = textoPegado(interiorDe(bloque, 'data-canal', 'parrafo'))
  afirmarIgual(rehecho, CONTENIDO[id].parrafo, `  ${id}: sin coreografía las piezas reconstruyen el mismo párrafo, carácter por carácter`)
}
/**
 * ⚠️ **`bg-clip-text` Y `text-transparent` VOLVIERON, Y ESTÁ AUTORIZADO.**
 *
 * El sprint anterior las sacó y celebró que `s6-tokens` se pusiera verde. Este
 * las trae de vuelta, porque el borde BLANDO del frente es una zona de mezcla
 * entre dos colores y eso no se puede hacer con una propiedad de color, que
 * vale una sola cosa por elemento: hace falta un degradado recortado al glifo.
 *
 * Lo que cambia respecto del barrido viejo —y es lo que esta afirmación
 * protege— es DE QUÉ es el degradado. Antes era UNO, del ancho del párrafo, y
 * por eso pintaba la primera palabra del segundo renglón junto con la del
 * primero: el orden era el de la CAJA y no el de lectura. Ahora hay uno POR
 * PALABRA. Así que no alcanza con contar las clases: hay que afirmar que el
 * recorte está en las piezas y **nunca en el contenedor del párrafo**, que es
 * exactamente la forma que tendría el barrido viejo si volviera.
 */
afirmarIgual(cuenta(animado, /bg-clip-text/g), PALABRAS_DE_LOS_TRES, `el recorte al glifo está en las ${PALABRAS_DE_LOS_TRES} piezas de palabra, una por una`)
const parrafosEnCurso = [...animado.matchAll(/<p [^>]*data-pintado="en-curso"[^>]*>/g)].map((m) => m[0])
afirmarIgual(parrafosEnCurso.length, SERVICIOS.length, `  y los ${SERVICIOS.length} párrafos en curso están, uno por servicio`)
afirmarIgual(parrafosEnCurso.filter((p) => p.includes('bg-clip-text')), [], '  y NINGUNO lo lleva en su contenedor: el degradado del ancho del párrafo no volvió')
controlPositivo('el detector vería el barrido viejo, recortado en el contenedor', '<p data-pintado="en-curso" class="bg-clip-text">x</p>', (h) => [...h.matchAll(/<p [^>]*data-pintado="en-curso"[^>]*>/g)].every((m) => !m[0].includes('bg-clip-text')))

// ═══════════════════════════════════════════════════════════════════════════
titulo('16 · La torta y el CTA, que el marcado estático NO muestra')

/**
 * ⚠️ **DOS PIEZAS QUE NINGÚN INVARIANTE DE MARCADO VE, Y POR ESO SE SONDEAN.**
 *
 * El CTA aparece recién con el 01 —«no hay servicio que querer antes»— así que
 * en el render estático, donde la posición disparada vale 0, **no existe**.
 * Contarlo en `animado` daría cero y todo pasaría en verde sin que nadie lo
 * haya mirado: exactamente la clase de falla que este repo tiene anotada como
 * «verde por arnés». Así que se monta aparte, con la posición forzada, que es
 * el único estado en el que la pieza existe.
 *
 * La torta sí está en el marcado, pero su estado también depende de la posición
 * disparada, así que se afirma lo que el marcado sí puede decir: que publica
 * una porción por servicio, que cada una lleva su `[data-servicio]` —de ahí
 * saca el acento, sin que este lane nombre un color— y que no escribe ninguno.
 */
const ctaSondeado = renderToStaticMarkup(<SondaDelCta />)
afirmar(cuentaDeAtributo(ctaSondeado, 'data-pieza') > 0, 'con el 01 puesto, el CTA existe')
afirmar(
  ETIQUETAS_DEL_CTA.some((e) => textoVisible(ctaSondeado).includes(e)),
  '  y dice una de las tres etiquetas reales, no una inventada',
  textoVisible(ctaSondeado),
)
afirmarIgual(focalizablesDe(ctaSondeado).length, 1, '  y es UNA parada de teclado: es un botón de verdad, no un cartel')
/** ⚠️ **CINCO piezas decorativas, y las cinco tienen que estarlo.** Dos son del
 *  propio `Cta` —la copia que el intercambio usa para relevar la etiqueta, y el
 *  subrayado— y TRES son los fantasmas que fijan el ancho de la ventana: las
 *  tres etiquetas en la misma celda, para que la caja mida la más larga y no
 *  cambie de tamaño al relevar.
 *
 *  Que vayan `aria-hidden` no es prolijidad: sin eso el botón anunciaría las
 *  tres etiquetas a la vez y su nombre accesible sería una sopa. */
afirmarIgual(cuenta(ctaSondeado, /aria-hidden="true"/g), 2 + SERVICIOS.length, `  con sus ${2 + SERVICIOS.length} piezas decorativas: la copia que releva, el subrayado y los ${SERVICIOS.length} fantasmas del ancho`)
afirmarIgual(ETIQUETAS_DEL_CTA.filter((e) => ctaSondeado.includes(e)).length, ETIQUETAS_DEL_CTA.length, '  y los fantasmas traen las TRES etiquetas: la ventana mide la más larga, no la visible')
controlPositivo('el detector vería una ventana armada con una sola etiqueta', ETIQUETAS_DEL_CTA[0], (h: string) => ETIQUETAS_DEL_CTA.filter((e) => h.includes(e)).length === ETIQUETAS_DEL_CTA.length)
afirmarIgual(cuenta(ctaSondeado, /data-parte="copia-b"/g), 1, '  y la que se releva es exactamente una')
controlPositivo('el detector de paradas vería un cartel en vez de un botón', '<span>Quiero</span>', (h) => focalizablesDe(h).length === 1)

/** ⚠️ **El CTA es el ÚNICO focalizable de la sección, y llega tarde.** §6 afirma
 *  cero paradas de teclado sobre el marcado estático, y sigue siendo cierto
 *  ahí. Queda dicho que a partir del 01 hay una, para que nadie lea ese cero
 *  como «esta sección no tiene nada que enfocar». */
console.log(`  ⚠️ el CTA agrega 1 parada de teclado a partir del estado 1, invisible para §6`)

const fuenteDelCta = fuenteDe('CtaQueRota.tsx')
const torta = interiorDe(animado, 'data-pieza', 'torta')
afirmar(torta.length > 0, 'la torta está en el marcado, aunque su estado dependa de la posición')
afirmarIgual(valoresDeAtributo(torta, 'data-servicio'), [...IDS_DE_SERVICIO], '  con una porción por servicio, en el orden de la secuencia')
afirmarIgual(hexEncontrados(torta), [], '  y sin un solo color escrito: el acento entra por el atributo, como en todo el lane')
afirmarIgual(funcionesDeColorEncontradas(torta).filter((f) => !f.startsWith('color-mix')), [], '  ni una función de color que traiga un valor')


// ═══════════════════════════════════════════════════════════════════════════
// §17 y §18 viven en `s6-traspaso.ts` — misma regla de 300 líneas que §13.
afirmarElTraspaso(animado, torta, fuenteDelRodillo, fuenteDelCta, fuenteDeLaTira, fuenteDe('GraficoDeTorta.tsx'))

// ═══════════════════════════════════════════════════════════════════════════
// §13 vive en `s6-tipografia.ts` — es un asunto de `cn()`, no de la sección.
afirmarLaTipografia(quieto, animado)
// MÓVIL 2: abajo de 1024 vive en `angosto-invariante.tsx`.
afirmarServiciosAngostos()

cerrar('s6-servicios.invariant')

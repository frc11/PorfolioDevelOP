/**
 * INVARIANTE — EL CIERRE: sin coreografía se lee entero, el formulario no puede
 * tener éxito falso, ningún enlace lleva a la nada y el pie se consume.
 *
 * Corre con `npx tsx src/app/v3/_secciones/cierre/s8-cierre.invariant.tsx`.
 *
 * Los detectores puros y las entradas rotas viven en `./soporte.ts`, para que
 * cada control positivo corra LA MISMA función contra una entrada fabricada.
 * Ese archivo queda fuera del escaneo de tokens —guarda un hex, un píxel suelto
 * y la frase prohibida a propósito— y esa exclusión se afirma acá abajo.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { Panel } from '../../_componentes/Panel'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ANCLAS } from '../../_lib/motion/anclas'
import { ventanaDeHijo } from '../../_lib/motion/cronograma'
import { PATRONES } from '../../_lib/motion/patrones'
import { FORMAS_PERMITIDAS_SOBRE_OSCURO } from '../_contrato/acento'
import { escanearContenido, marcadoresEn, textoVisible } from '../_contrato/escaneo'
import { cronogramaDe } from '../_contrato/motion'
import { seccionDe } from '../_contrato/forma'
import { ritmoDe } from '../_contrato/ritmo'
import { marcar } from '../_invariantes/render'
import { CARPETAS_DE_SECCION, clasesEscritas, codigoDeLaSeccion, existe, leer, valoresDeAcentoDelTema } from '../_invariantes/soporte'
import { Cierre, ContenidoDelCierre } from './Cierre'
import { ANCLAS_QUE_EXISTEN, COLUMNAS, CTA_DE_CIERRE, DESTINOS_DE_LA_RUTA, ETIQUETA_DE_SECCION, LINEA_DE_CIERRE, NOVEDADES, PEDIDOS_DE_CONTACTO, TITULAR_DE_CIERRE } from './contenido'
import * as S from './soporte'

const seccionDelCierre = seccionDe('cierre')
const montada = <Cierre seccion={seccionDelCierre} />
const SIN = marcar(montada, { anima: false })
const CON = marcar(montada, { anima: true })
const CARPETA = CARPETAS_DE_SECCION.cierre
const TODOS = codigoDeLaSeccion('cierre')
const ARCHIVOS = TODOS.filter((a) => !a.endsWith(`/${S.ARCHIVO_DE_APOYO}`))
const FUENTE = ARCHIVOS.map((a) => quitarComentarios(leer(a))).join('\n')
const TEMA = leer('src/app/theme-develop.css').replace(/\/\*[\s\S]*?\*\//g, '')
const hexDe = (re: RegExp): string => re.exec(TEMA)?.[1] ?? ''

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Abajo de 1025 no se monta coreografía, y el texto está entero')

const MARCAS = ['transform:', 'will-change', 'data-lineas-piezas']
for (const marca of MARCAS) {
  afirmar(!SIN.includes(marca), `con anima=false el marcado no tiene \`${marca}\``)
  afirmar(CON.includes(marca), `  y con anima=true SÍ tiene \`${marca}\` — el detector no está ciego`)
}
controlPositivo('el detector de coreografía ve la rama animada', CON, (h) => MARCAS.every((m) => !h.includes(m)))

const TEXTOS = [
  ETIQUETA_DE_SECCION, TITULAR_DE_CIERRE, CTA_DE_CIERRE.rotulo, NOVEDADES.rotulo, NOVEDADES.ayuda,
  LINEA_DE_CIERRE.marca, LINEA_DE_CIERRE.nota, ...COLUMNAS.map((c) => c.titulo),
  ...DESTINOS_DE_LA_RUTA.map((d) => d.rotulo), ...PEDIDOS_DE_CONTACTO.map((p) => p.descripcion),
]
const visibleSin = textoVisible(SIN)
afirmarIgual(TEXTOS.filter((t) => !visibleSin.includes(t)), [], `las ${TEXTOS.length} cadenas de contenido se leen enteras sin una sola animación`)
controlPositivo('el buscador de cadenas ve una que falta', 'una frase que no está', (t: string) => visibleSin.includes(t))

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El texto es el mismo en las dos ramas')

const pSin = S.palabras(SIN)
const pCon = S.palabras(CON)
const mismoVocabulario = (h: string): boolean => JSON.stringify(S.vocabulario(h)) === JSON.stringify(S.vocabulario(SIN))

afirmar(mismoVocabulario(CON), 'el vocabulario visible es idéntico en las dos ramas — quien está abajo de 1025 no lee otra cosa', `${S.vocabulario(SIN).length} palabras distintas`)
console.log(`  ${pSin.length} palabras en la rama quieta contra ${pCon.length} en la animada. La diferencia son las ${S.palabras(TITULAR_DE_CIERRE).length} del titular, que el divisor emite dos veces: una \`sr-only\` para el lector y otra partida en piezas con \`aria-hidden\`. Por eso se compara el vocabulario y no la cuenta.`)
afirmarIgual(pCon.length - pSin.length, S.palabras(TITULAR_DE_CIERRE).length, '  y la diferencia es exactamente esa, ni una palabra más')
controlPositivo('el comparador ve un vocabulario al que le falta una palabra', SIN.replace(TITULAR_DE_CIERRE, ''), mismoVocabulario)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El contenido inventado PARECE inventado')

for (const [rama, html] of [['quieta', SIN], ['animada', CON]] as const) {
  const texto = textoVisible(html)
  const hallazgos = escanearContenido(texto)
  afirmar(hallazgos.length === 0, `rama ${rama}: cero hallazgos sobre ${texto.length} caracteres escaneados`, hallazgos.map((h) => h.fragmento).join(' · ') || 'ninguno')
}
const marcadores = marcadoresEn(visibleSin)
afirmar(marcadores.length > 0, `el contrapeso: ${marcadores.length} marcadores distintos en pantalla — "cero hallazgos" no es "cero contenido"`, marcadores.join(' · '))
const delProhibido = escanearContenido(S.CONTENIDO_PROHIBIDO)
controlPositivo('el escáner ve la frase prohibida', S.CONTENIDO_PROHIBIDO, (t) => escanearContenido(t).length === 0)
console.log(`  la frase de control produce ${delProhibido.length} hallazgos: ${delProhibido.map((h) => h.fragmento).join(' · ')}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, en los archivos de producto')

console.log(`  ${ARCHIVOS.length} archivos de producto, ${FUENTE.split('\n').length} líneas sin comentarios:`)
for (const a of ARCHIVOS) console.log(`    ${a}`)
afirmarIgual(ARCHIVOS.length, 3, 'la sección son tres archivos de producto')
/**
 * ⚠️ LA EXCLUSIÓN DEL ARNÉS SE MUDÓ, Y LO QUE SE AFIRMA CAMBIÓ CON ELLA.
 *
 * Este invariante filtraba `soporte.ts` por su cuenta y afirmaba haber excluido
 * exactamente un archivo. Esa afirmación era sobre el MECANISMO —"mi filtro
 * sacó uno"— y dejó de valer cuando la exclusión pasó a `codigoDeLaSeccion`,
 * que ya no se lo entrega. Tres secciones tuvieron el mismo problema por
 * separado, así que la convención está declarada una vez en
 * `_invariantes/soporte.ts` (`MODULOS_DE_APOYO`).
 *
 * Lo que se afirma ahora es la PROPIEDAD, que es la que importa y sobrevive a
 * dónde viva el filtro: el arnés existe, y ningún escáner de este archivo lo
 * mira.
 */
afirmar(
  existe(`${CARPETA}/${S.ARCHIVO_DE_APOYO}`),
  `el arnés existe: \`${S.ARCHIVO_DE_APOYO}\` guarda las entradas rotas a propósito`,
)
afirmarIgual(
  ARCHIVOS.filter((a) => a.endsWith(`/${S.ARCHIVO_DE_APOYO}`)),
  [],
  '  y ningún escáner de este invariante lo mira: escanearlo haría fallar la comprobación contra su propio arnés',
)
for (const [nombre, detector, roto] of S.DETECTORES) {
  afirmarIgual(detector(FUENTE), [], `cero ${nombre}`)
  controlPositivo(`el detector de ${nombre} ve una entrada rota`, roto, (t: string) => detector(t).length === 0)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Foco: todo lo interactivo entra en el orden de tabulación')

const focos = S.focalizables(SIN)
afirmarIgual(focos.length, DESTINOS_DE_LA_RUTA.length + 2, `${focos.length} focalizables: ${DESTINOS_DE_LA_RUTA.length} enlaces del recorrido, el CTA y el campo de correo`)
afirmarIgual(S.focalizables(CON).length, focos.length, 'los mismos en la rama animada: la coreografía no se come una parada de tabulación')
afirmarIgual(apagadosDeFoco(SIN), [], 'ningún elemento del marcado apaga el anillo')
console.log('  el botón de envío NO es focalizable, y es a propósito: está `disabled` porque no hay a dónde enviar.')
controlPositivo('el contador no cuenta un <a> sin href', '<a>x</a>', (h: string) => S.focalizables(h).length > 0)
controlPositivo('ni un control deshabilitado', '<button disabled="">x</button>', (h: string) => S.focalizables(h).length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El formulario de novedades no puede tener éxito falso')

const forma = S.formaDe(SIN)
const apertura = S.aperturaDe(forma)
const envios = S.enviosDe(forma)
const idDeAyuda = /aria-describedby="([^"]*)"/.exec(forma)?.[1] ?? ''
const ayuda = new RegExp(`<p id="${idDeAyuda}"[^>]*>([^<]*)</p>`).exec(forma)?.[1] ?? ''

afirmar(forma.length > 0, `el formulario está en el marcado — ${forma.length} caracteres`)
afirmar(envios.length > 0 && /\bdisabled[=\s>]/.test(envios[0]), '1 · el PRIMER botón de envío en orden de árbol renderiza `disabled`', `${envios.length} botón(es) de envío`)
afirmar(envios.every((b) => /\bdisabled[=\s>]/.test(b)), '2 · y no queda ninguno habilitado que el navegador pueda tomar por defecto con Enter')
afirmar(!/\saction=/.test(apertura) && !/\smethod=/.test(apertura), '3 · el <form> no declara `action` ni `method`', apertura)
afirmar(idDeAyuda.length > 0 && ayuda === NOVEDADES.ayuda, '4 · el texto de ayuda existe y está atado por `aria-describedby`, así que se anuncia', idDeAyuda)
for (const motivo of ['deshabilitado', 'destino']) afirmar(ayuda.includes(motivo), `  y dice el motivo: nombra "${motivo}"`)

afirmar(S.sinExitoFalso(SIN), 'el predicado entero pasa sobre el marcado real')
controlPositivo('y ve un envío habilitado', SIN.replace(' disabled=""', ''), S.sinExitoFalso)
controlPositivo('y ve un <form> con action', SIN.replace('<form ', '<form action="/x" '), S.sinExitoFalso)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Ningún <a href> lleva a la nada')

const hrefs = S.hrefsDe(SIN)
afirmarIgual(S.aLaNada(hrefs), [], `los ${hrefs.length} enlaces del marcado apuntan a un ancla que existe`)
console.log(`  destinos: ${[...new Set(hrefs)].join(' · ')}`)
console.log(`  las cuatro anclas de la ruta son ${ANCLAS_QUE_EXISTEN.join(' ')}; \`#cierre\` existe y NO se enlaza: es la sección en la que ya estás.`)
controlPositivo('el detector ve un ancla que no existe', ['#no-existe'], (l: readonly string[]) => S.aLaNada(l).length === 0)
controlPositivo('y una URL externa inventada', ['https://develop.example/contacto'], (l: readonly string[]) => S.aLaNada(l).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El acento NUNCA como texto — y por qué, medido contra el tema')

const clases = clasesEscritas(SIN)
afirmarIgual(S.comoTexto(clases), [], `cero acento como texto o como borde, sobre ${clases.length} clases revisadas`)
afirmarIgual(S.conAcento(clases), [], 'y cero usos de acento a secas: la decisión de este lane es que el Cierre no usa acento')
afirmar(S.conAcento(clases).every((c) => FORMAS_PERMITIDAS_SOBRE_OSCURO.includes(c)), 'todo uso de acento cae en las formas permitidas sobre oscuro', `permitidas: ${FORMAS_PERMITIDAS_SOBRE_OSCURO.join(' · ')}`)
controlPositivo('el detector VE un text-acento cuando lo hay', clasesEscritas(S.MARCADO_CON_ACENTO_DE_TEXTO), (l) => S.comoTexto(l).length === 0)
controlPositivo('y también un border-acento', clasesEscritas(S.MARCADO_CON_ACENTO_DE_BORDE), (l) => S.comoTexto(l).length === 0)

const OSCURO = hexDe(/\[data-seccion="invertida"\]\s*\{[^}]*?--color-fondo\s*:\s*(#[0-9A-Fa-f]{6})/)
const PAPEL = hexDe(/--color-fondo\s*:\s*(#[0-9A-Fa-f]{6})/)
afirmar(OSCURO.length === 7 && PAPEL.length === 7, 'los dos fondos se leen del tema, no se escriben acá', `${PAPEL} y ${OSCURO}`)
for (const { token, valor } of valoresDeAcentoDelTema()) {
  afirmar(razonDeContraste(valor, OSCURO) < 3, `${token} sobre el fondo invertido da ${razonDeContraste(valor, OSCURO).toFixed(2)}:1 — ni siquiera llega a 3:1`)
  afirmar(razonDeContraste(PAPEL, valor) >= 4.5, `  pero como RELLENO, con el papel encima, da ${razonDeContraste(PAPEL, valor).toFixed(2)}:1 y pasa AA`)
}

// ═══════════════════════════════════════════════════════════════════════════
titulo('9 · El pie se consume, no se rehace')

afirmarIgual(S.rehaceElPie(FUENTE), [], 'ningún archivo declara un <footer>, un `data-pieza="pie` ni una regla propia de pie')
controlPositivo('el detector ve un pie rehecho', S.PIE_REHECHO, (t: string) => S.rehaceElPie(t).length === 0)
for (const pieza of ['chrome/Pie', 'chrome/PiePiezas', 'chrome/Novedades', 'chrome/Cta']) {
  afirmar(FUENTE.includes(`'../../_componentes/${pieza}'`), `se importa \`${pieza}\` de los componentes compartidos`)
}
afirmarIgual([...FUENTE.matchAll(/\binvertido\b/g)].map((m) => m[0]), [], 'no se le pasa `invertido` al Pie: la inversión la decide la tabla del lane A, no esta sección')

// ═══════════════════════════════════════════════════════════════════════════
titulo('10 · Lucide con strokeWidth={1.5}, sin excepciones')

const iconos = S.conteoDeIconos(FUENTE)
const svgs = S.svgsDe(SIN)
afirmar(S.grosorOk(FUENTE), `los ${iconos.usos} usos de iconos de lucide llevan strokeWidth={1.5}`, `${iconos.conGrosor} con la prop`)
afirmar(svgs.length > 0 && S.svgsSinGrosor(SIN).length === 0, `y los ${svgs.length} svg del marcado salen con stroke-width 1.5`, `${S.svgsSinGrosor(SIN).length} con otro grosor`)
controlPositivo('el detector ve un icono sin la prop', S.ICONO_SIN_GROSOR, S.grosorOk)
controlPositivo('y no se pone verde cuando no hay ningún icono', '<div />', S.grosorOk)
controlPositivo('el contador de svg ve un grosor equivocado', '<svg stroke-width="2"></svg>', (h: string) => S.svgsSinGrosor(h).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('11 · `cn()` no le come el tamaño a ningún texto — la trampa medida')

const perdidos = S.tamanosPerdidos(SIN)
afirmarIgual(perdidos, [], `los ${S.nivelesVistos(SIN)} elementos con \`data-nivel\` conservan su utilidad de tamaño`)
afirmarIgual(S.tamanosPerdidos(CON), [], `  y los ${S.nivelesVistos(CON)} de la rama animada también`)
afirmarIgual(S.piezasDelPieSinTamano(SIN), [], 'las piezas del pie conservan su `text-cuerpo`: no se les pasa ningún `className` de color ni de familia')
controlPositivo('el detector ve un tamaño comido', '<p data-nivel="micro" class="font-cuerpo leading-micro">x</p>', (h: string) => S.tamanosPerdidos(h).length === 0)
controlPositivo('y no se pone verde sobre un marcado sin niveles', '<p class="x">y</p>', (h: string) => S.nivelesVistos(h) > 0)

afirmarIgual(S.coloresDeTextoEnFuente(FUENTE), [], 'esta sección no escribe NINGUNA clase de color de texto: el color se hereda de la superficie')
controlPositivo('el detector ve un color pasado por className', 'className="text-tinta-media uppercase"', (t: string) => S.coloresDeTextoEnFuente(t).length === 0)
const comidas = S.familiasComidas(SIN)
console.log(
  `  ⚠️ HALLAZGO FUERA DE MI CARPETA: ${comidas.length} de los ${S.nivelesVistos(SIN)} elementos de texto se quedaron ` +
    'SIN familia. Sale de `Textos.tsx`: `EtiquetaDeSeccion` pasa `peso="medio"` y `cn()` lee `font-medio` como una ' +
    'FAMILIA —no es un peso que twMerge conozca— así que se come `font-cuerpo`. Se publica y no se afirma: el ' +
    `arreglo es de un componente compartido. ${comidas.join(' · ')}`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('12 · Las columnas suben ESCALONADAS — la desviación declarada de P2')

const crono = cronogramaDe(PATRONES.P2, COLUMNAS.length)
const ventanas = COLUMNAS.map((_, i) => ventanaDeHijo(i, crono))
afirmarIgual(crono.cantidad, COLUMNAS.length, `el conjunto tiene ${COLUMNAS.length} piezas, que es cuántas columnas hay`)
afirmar(S.escalonan(ventanas), 'las ventanas arrancan escalonadas y no todas en cero', ventanas.map((v) => v.desde.toFixed(4)).join(' · '))
afirmarIgual(ventanas[0].desde, 0, 'la primera arranca en cero y las otras después')
afirmarIgual(crono.escalonado, PATRONES.P2.escalonado, 'el escalonado es el medido, sin factor')
controlPositivo('un cronograma con escalonado 0 NO escalona: todas arrancan juntas', COLUMNAS.map((_, i) => ventanaDeHijo(i, { ...crono, escalonado: 0 })), S.escalonan)
console.log(`  ⚠️ P2 mide UN target por instancia y ahí su escalonado queda inerte. Acá son ${COLUMNAS.length} piezas de un mismo conjunto, así que se aplica: la duración pasa de ${PATRONES.P2.duracionDeclarada} a ${(PATRONES.P2.duracionDeclarada + PATRONES.P2.escalonado * (COLUMNAS.length - 1)).toFixed(1)} s. Es la desviación que pide la instrucción.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('13 · El mismo subárbol es correcto con las DOS superficies')

const bajoSuperficie = (superficie: 'papel-opaco' | 'oscuro-opaco'): string =>
  marcar(
    <Panel seccion={{ ...seccionDelCierre, superficie }}>
      <ContenidoDelCierre seccion={seccionDelCierre} />
    </Panel>,
    { anima: false },
  )
const papel = bajoSuperficie('papel-opaco')
const oscuro = bajoSuperficie('oscuro-opaco')
afirmar(S.pelar(oscuro) === S.pelar(papel), 'el marcado es el MISMO salvo el atributo: ninguna clase, ningún color y ninguna medida cambian', `${S.pelar(papel).length} caracteres idénticos`)
afirmar(oscuro.includes('data-seccion="invertida"') && !papel.includes('data-seccion="invertida"'), 'y el atributo sí cambia — el mecanismo de S0 está puesto y lo pone `Panel` desde la tabla')
afirmar(!SIN.includes('<footer data-pieza="pie" data-seccion'), 'el <footer> no lleva un `data-seccion` propio encima del de la sección')
controlPositivo('el comparador ve una diferencia de verdad', papel.replace('bg-fondo', 'bg-white'), (h: string) => S.pelar(h) === S.pelar(papel))
console.log(`  la tabla del lane A declara HOY \`${seccionDe('cierre').superficie}\`; el contrato acordó \`oscuro-opaco\`. Las dos andan y este lane no toca la tabla.`)

/** ⚠️ HALLAZGO: la tinta secundaria NO se da vuelta. Se mide, no se supone. */
const TENUE = hexDe(/--color-tinta-tenue\s*:\s*(#[0-9A-Fa-f]{6})/)
const TINTA_CLARA = hexDe(/\[data-seccion="invertida"\]\s*\{[^}]*?--color-tinta\s*:\s*(#[0-9A-Fa-f]{6})/)
const TINTA = hexDe(/--color-tinta\s*:\s*(#[0-9A-Fa-f]{6})/)
const ALFA = Number.parseFloat(/--opacity-casi\s*:\s*([\d.]+)/.exec(TEMA)?.[1] ?? '0')
console.log(`  ⚠️ HALLAZGO FUERA DE MI CARPETA: \`--color-tinta-tenue\` (${TENUE}) NO se redefine en [data-seccion="invertida"]. Sobre ${OSCURO} da ${razonDeContraste(TENUE, OSCURO).toFixed(2)}:1 — falla AA y no llega a 3:1. Lo usa el <p> del texto de ayuda de \`chrome/Novedades.tsx\`, que este lane monta y no toca.`)
console.log(`  Mis archivos usan \`opacity-casi\` sobre la tinta en vez de esa clase: da ${razonDeContraste(S.mezclar(TINTA_CLARA, OSCURO, ALFA), OSCURO).toFixed(2)}:1 sobre el fondo invertido y ${razonDeContraste(S.mezclar(TINTA, PAPEL, ALFA), PAPEL).toFixed(2)}:1 sobre el papel. Pasa AA en las dos.`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('14 · Cuántas pantallas ocupa — [derivado de tokens], NO medido')

const RAIZ_PX = 16
function tokenPx(nombre: string): number {
  const v = (new RegExp(`${nombre}\\s*:\\s*([^;]+);`).exec(TEMA)?.[1] ?? '').trim()
  const clamp = /^clamp\((-?[\d.]+)px/.exec(v)
  if (clamp !== null) return Number.parseFloat(clamp[1])
  const rem = /^(-?[\d.]+)rem$/.exec(v)
  if (rem !== null) return Number.parseFloat(rem[1]) * RAIZ_PX
  const px = /^(-?[\d.]+)px$/.exec(v)
  return px !== null ? Number.parseFloat(px[1]) : Number.parseFloat(v)
}
const cajaDeLinea = (texto: string, interlineado: string): number => tokenPx(texto) * tokenPx(interlineado)
const MICRO = cajaDeLinea('--text-micro', '--leading-micro')
const CAMPO = 2 * tokenPx('--spacing-2') + cajaDeLinea('--text-caption', '--leading-texto')
const COLUMNA = MICRO + tokenPx('--spacing-4') + MICRO + tokenPx('--spacing-2') + CAMPO + tokenPx('--spacing-2') + 2 * MICRO
const CTA_ALTO = cajaDeLinea('--text-cuerpo', '--leading-texto') + 2 * tokenPx('--spacing-2')
const LINEA_ALTO = cajaDeLinea('--text-caption', '--leading-texto') + tokenPx('--spacing-1') + MICRO
const SEPARACIONES = 4 * tokenPx('--spacing-12')
const RELLENO = 2 * tokenPx('--spacing-20')

const ritmo = ritmoDe([seccionDelCierre])
afirmarIgual(ritmo.pantallas, 1, `la tabla declara \`${seccionDe('cierre').alto}\` — una pantalla`)
afirmarIgual(ritmo.pantallasPinneadas, 0, 'y la sección NO va pinneada: la única pinneada del lane es Servicios')

const ESCRITORIO = RELLENO + MICRO + cajaDeLinea('--text-titulo-xl', '--leading-titulo') + CTA_ALTO + COLUMNA + LINEA_ALTO + SEPARACIONES
const MOBILE = RELLENO + MICRO + 3 * tokenPx('--text-fluido-titulo-xl') * tokenPx('--leading-titulo') + CTA_ALTO + 3 * COLUMNA + 2 * tokenPx('--grilla-canal-compacto') + LINEA_ALTO + SEPARACIONES
console.log(`  alto derivado @escritorio (tres columnas en fila, titular de una línea): ${ESCRITORIO.toFixed(0)} px`)
console.log(`  alto derivado @375 (columnas apiladas, titular de tres líneas al piso del clamp): ${MOBILE.toFixed(0)} px`)
console.log('  ⚠️ Sale de sumar cajas de línea y tokens. NO está medido en un navegador y falta confirmarlo con ojo.')
afirmar(ESCRITORIO < 900, `a 1440×900 entra en una pantalla (${ESCRITORIO.toFixed(0)} < 900): el 100svh de la tabla es correcto y no hay que cambiarlo`)
afirmar(MOBILE > 667, `a 375×667 se pasa (${MOBILE.toFixed(0)} > 667) y crece sola — el alto declarado es un MÍNIMO, así que la tabla sigue estando bien`)

/** P1 termina 240px antes del fin de SU bloque: si abajo no hay tanto, no completa. */
const EXIGE_P1 = -ANCLAS.P1.fin.viewport.px
const DEBAJO = 3 * tokenPx('--spacing-12') + CTA_ALTO + COLUMNA + LINEA_ALTO + tokenPx('--spacing-20')
afirmar(DEBAJO > EXIGE_P1, `el titular alcanza a completarse: su ancla exige ${EXIGE_P1} px de documento por debajo y hay ${DEBAJO.toFixed(0)}`, 'los 240 salen de `bottom bottom-=240px`, leídos del ancla y no escritos acá')
console.log('  P2 (`bottom bottom`) no corre ese riesgo: su fin es `topDoc + alto − viewport`, que nunca pasa el fin del documento.')

cerrar('s8-cierre.invariant')

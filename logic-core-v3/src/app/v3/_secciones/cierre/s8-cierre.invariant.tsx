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

import { Panel } from '../../_componentes/Panel'
import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { contarLineas } from '../../_lib/__tests__/s8-largos'
import { apagadosDeFoco, quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { FORMAS_PERMITIDAS_SOBRE_OSCURO } from '../_contrato/acento'
import { seccionDe } from '../_contrato/forma'
import { escanearLoReal, marcadoresRealesEn, textoVisible } from '../_contrato/escaneo'
import { marcar } from '../_invariantes/render'
import { CARPETAS_DE_SECCION, clasesEscritas, codigoDeLaSeccion, existe, leer, valoresDeAcentoDelTema } from '../_invariantes/soporte'
import { Cierre, ContenidoDelCierre } from './Cierre'
import { ANCLAS_QUE_EXISTEN, COLUMNAS, CTA_DE_CIERRE, DESTINOS_DE_LA_RUTA, ETIQUETA_DE_SECCION, LINEA_DE_CIERRE, PEDIDOS_DE_CONTACTO, TITULAR_DE_CIERRE } from './contenido'
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

// ⚠️ B12 · `ETIQUETA_DE_SECCION` sale de acá y se afirma al revés abajo (regla 15).
const TEXTOS = [TITULAR_DE_CIERRE, CTA_DE_CIERRE.rotulo,
  LINEA_DE_CIERRE.marca, LINEA_DE_CIERRE.nota, ...COLUMNAS.map((c) => c.titulo),
  ...DESTINOS_DE_LA_RUTA.map((d) => d.rotulo), ...PEDIDOS_DE_CONTACTO.map((p) => p.descripcion),
]
const visibleSin = textoVisible(SIN)
afirmarIgual(TEXTOS.filter((t) => !visibleSin.includes(t)), [], `las ${TEXTOS.length} cadenas de contenido se leen enteras sin una sola animación`)
controlPositivo('el buscador de cadenas ve una que falta', 'una frase que no está', (t: string) => visibleSin.includes(t))
afirmar(!visibleSin.includes(ETIQUETA_DE_SECCION) && !textoVisible(CON).includes(ETIQUETA_DE_SECCION), `y el RÓTULO DE SECCIÓN («${ETIQUETA_DE_SECCION}») ya NO se lee en ninguna de las dos ramas: se fue de las ocho en B12 y el título toma su lugar`)

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
  const hallazgos = escanearLoReal(texto)
  afirmar(hallazgos.length === 0, `rama ${rama}: cero hallazgos sobre ${texto.length} caracteres escaneados`, hallazgos.map((h) => h.fragmento).join(' · ') || 'ninguno')
}
const marcadores = marcadoresRealesEn(visibleSin)
afirmar(marcadores.length > 0, `el contrapeso: ${marcadores.length} marcadores distintos en pantalla — "cero hallazgos" no es "cero contenido"`, marcadores.join(' · '))
const delProhibido = escanearLoReal(S.CONTENIDO_PROHIBIDO)
controlPositivo('el escáner ve la frase prohibida', S.CONTENIDO_PROHIBIDO, (t) => escanearLoReal(t).length === 0)
console.log(`  la frase de control produce ${delProhibido.length} hallazgos: ${delProhibido.map((h) => h.fragmento).join(' · ')}`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Cero valores fuera de los tokens, en los archivos de producto')

console.log(`  ${ARCHIVOS.length} archivos de producto, ${contarLineas(FUENTE)} líneas sin comentarios: ${ARCHIVOS.join(' · ')}`)
/** ⚠️ ERAN TRES, DESPUÉS CINCO, SEIS, Y AHORA CINCO OTRA VEZ: el número sigue
 *  al archivo real en vez de clavarse. B2 agregó `asentamiento.ts` y
 *  `s8-entrada.ts`; B4-A `LineaDeCierre.tsx`; Modo pulido borró `s8-entrada.ts`
 *  entero (era 100% composición: el timing de entrada por pieza de §12). */
afirmarIgual(ARCHIVOS.length, 5, 'la sección son cinco archivos de producto')
/**
 * ⚠️ LA EXCLUSIÓN DEL ARNÉS SE MUDÓ, Y LO QUE SE AFIRMA CAMBIÓ CON ELLA. Este
 * invariante filtraba `soporte.ts` por su cuenta y afirmaba haber excluido
 * exactamente un archivo: era una afirmación sobre el MECANISMO y dejó de valer
 * cuando la exclusión pasó a `codigoDeLaSeccion`. Tres secciones tuvieron el
 * mismo problema por separado, así que la convención vive una vez en
 * `_invariantes/soporte.ts` (`MODULOS_DE_APOYO`). Lo que se afirma ahora es la
 * PROPIEDAD: el arnés existe y ningún escáner de este archivo lo mira.
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
// SPRINT PANEL 2 · el campo de correo se mudó a Tu Panel con el formulario: queda una parada menos.
afirmarIgual(focos.length, DESTINOS_DE_LA_RUTA.length + 1, `${focos.length} focalizables: ${DESTINOS_DE_LA_RUTA.length} enlaces del recorrido y el CTA`)
afirmarIgual(S.focalizables(CON).length, focos.length, 'los mismos en la rama animada: la coreografía no se come una parada de tabulación')
afirmarIgual(apagadosDeFoco(SIN), [], 'ningún elemento del marcado apaga el anillo')
controlPositivo('el contador no cuenta un <a> sin href', '<a>x</a>', (h: string) => S.focalizables(h).length > 0)
controlPositivo('ni un control deshabilitado', '<button disabled="">x</button>', (h: string) => S.focalizables(h).length > 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El formulario de novedades se mudó a Tu Panel (SPRINT PANEL 2)')

// Estaba acá, deshabilitado porque no hay destino; ahora vive en `tu-panel/Remate.tsx`,
// con el mismo componente, y `s6-tu-panel` §10 afirma ahí que no puede fingir un éxito.
afirmarIgual(S.formaDe(SIN), '', 'el pie ya no monta un <form>')
controlPositivo('el buscador de formularios ve uno cuando está', '<div><form data-pieza="novedades-forma"><input></form></div>', (h: string) => S.formaDe(h) === '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Ningún <a href> lleva a la nada')

const hrefs = S.hrefsDe(SIN)
afirmarIgual(S.aLaNada(hrefs), [], `los ${hrefs.length} enlaces del marcado apuntan a un ancla que existe`)
console.log(`  destinos: ${[...new Set(hrefs)].join(' · ')}`)
console.log(`  ⚠️ ESTA LÍNEA DECÍA "las cuatro anclas de la ruta" y ya eran OCHO: \`ANCLAS_QUE_EXISTEN\` se deriva de la tabla desde SITIO-S7 y la cadena se quedó vieja sin que nada se quejara. Corregido en SITIO-S8, derivando también la cuenta. Las ${ANCLAS_QUE_EXISTEN.length} anclas que existen son ${ANCLAS_QUE_EXISTEN.join(' ')}; el pie enlaza ${DESTINOS_DE_LA_RUTA.length} y \`#cierre\` NO, porque es la sección en la que ya estás.`)
controlPositivo('el detector ve un ancla que no existe', ['#no-existe'], (l: readonly string[]) => S.aLaNada(l).length === 0)
controlPositivo('y una URL externa inventada', ['https://develop.example/contacto'], (l: readonly string[]) => S.aLaNada(l).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · El acento NUNCA como texto — y por qué, medido contra el tema')

const clases = clasesEscritas(SIN)
afirmarIgual(S.comoTexto(clases), [], `cero acento como texto o como borde, sobre ${clases.length} clases revisadas`)
/** ⚠️ B4-A · «cero acento» lo REVIERTE la instrucción: el prefijo de marca que se
 *  monta acá ES relleno en `--color-acento`. Lo que entra es más fuerte. */
const conAcento = S.conAcento(clases)
const prefijos = (SIN.match(/data-pieza="prefijo-de-servicio"/g) ?? []).length
afirmar(conAcento.length > 0 && conAcento.length === prefijos, `los ${conAcento.length} usos de acento del Cierre son exactamente sus ${prefijos} piezas \`prefijo-de-servicio\`: no entra por ningún otro lado, y ya NO es cero`, conAcento.join(' · '))
afirmar(conAcento.every((c) => FORMAS_PERMITIDAS_SOBRE_OSCURO.includes(c)), 'todo uso de acento cae en las formas permitidas sobre oscuro', `permitidas: ${FORMAS_PERMITIDAS_SOBRE_OSCURO.join(' · ')}`)
controlPositivo('el contador ve un acento que NO viene de la pieza', clasesEscritas('<span class="bg-acento"></span>'), (l: readonly string[]) => S.conAcento(l).length === prefijos)
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
for (const pieza of ['chrome/Pie', 'chrome/PiePiezas', 'chrome/Cta']) {
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
afirmarIgual(S.familiasComidas(SIN), [], `ninguno de los ${S.nivelesVistos(SIN)} elementos de texto se queda SIN familia. ⚠️ Esto ERA un hallazgo publicado y no afirmado: \`EtiquetaDeSeccion\` pasa \`peso="medio"\` y \`cn()\` leía \`font-medio\` como una FAMILIA, así que se comía \`font-cuerpo\`. SITIO-S7 lo arregló en la raíz (\`src/lib/utils.ts\`) y SITIO-S8 lo convierte en AFIRMACIÓN: lo que se publicaba ya no pasa, y si volviera, esto se pone rojo`)
controlPositivo('el detector de familia comida no está ciego', '<p data-nivel="micro" class="text-micro leading-micro font-medio">x</p>', (h: string) => S.familiasComidas(h).length === 0)

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
console.log(`  la tabla del lane A declara HOY \`${seccionDe('cierre').superficie}\`; el contrato acordó \`oscuro-opaco\` y B6-A la abrió a \`oscuro-transparente\`. Las dos opacas andan y este lane no toca la tabla.`)

/** ⚠️ HALLAZGO: la tinta secundaria NO se da vuelta. Se mide, no se supone. */
const TENUE = hexDe(/--color-tinta-tenue\s*:\s*(#[0-9A-Fa-f]{6})/)
const TINTA_CLARA = hexDe(/\[data-seccion="invertida"\]\s*\{[^}]*?--color-tinta\s*:\s*(#[0-9A-Fa-f]{6})/)
const TINTA = hexDe(/--color-tinta\s*:\s*(#[0-9A-Fa-f]{6})/)
const ALFA = Number.parseFloat(/--opacity-casi\s*:\s*([\d.]+)/.exec(TEMA)?.[1] ?? '0')
console.log(`  ⚠️ HALLAZGO FUERA DE MI CARPETA: \`--color-tinta-tenue\` (${TENUE}) NO se redefine en [data-seccion="invertida"]. Sobre ${OSCURO} da ${razonDeContraste(TENUE, OSCURO).toFixed(2)}:1 — falla AA y no llega a 3:1. Lo usaba el texto de ayuda de \`chrome/Novedades.tsx\`, que desde SPRINT PANEL 2 se monta en Tu Panel, sobre papel.`)
console.log(`  Mis archivos usan \`opacity-casi\` sobre la tinta en vez de esa clase: da ${razonDeContraste(S.mezclar(TINTA_CLARA, OSCURO, ALFA), OSCURO).toFixed(2)}:1 sobre el fondo invertido y ${razonDeContraste(S.mezclar(TINTA, PAPEL, ALFA), PAPEL).toFixed(2)}:1 sobre el papel. Pasa AA en las dos.`)

// El control de que `Pie` sin props emite byte a byte lo de antes de B1 vive en `s3-layout.invariant`: la cadena de contención es su sujeto.
cerrar('s8-cierre.invariant')

/**
 * INVARIANTE — LA CADENA DE MEZCLA DE LA BAJADA, Y EL PISO SOBRE PAPEL LIMPIO.
 *
 * Corre con `npm run test:s7-mezcla`.
 *
 * ── Por qué existe: una falla silenciosa y total ──────────────────────────
 *
 * Abajo de 1025 la bajada de «Quiénes somos» se pinta con
 * `mix-blend-mode: difference` y la tinta del papel. `difference` mezcla contra
 * lo pintado debajo **dentro del mismo contexto de apilamiento**, así que el
 * efecto entero depende de una condición que no está escrita en ningún lado del
 * componente: que **ningún ancestro del párrafo abra un contexto propio** entre
 * él y `[data-v3]`, que es el grupo que contiene el canvas de la escena.
 *
 * El día que alguien le agregue `transform`, `filter`, `opacity < 1`, `mask` o
 * `will-change` a cualquiera de esos ancestros —por una animación, por una capa
 * de composición, por un recorte— la cadena se corta. Y no tira error: el texto
 * mezcla contra un grupo que no tiene la escena adentro, o contra nada, y sale
 * **blanco sobre papel**. Medido: 100 % del glifo bajo AA, contraste 1,06:1. Es
 * el modo de falla peor que hay — total, invisible en el código y visible sólo
 * en pantalla, a un ancho que el desarrollo no mira.
 *
 * ── Qué custodia, y con qué lo lee ────────────────────────────────────────
 *
 *   1. **La cadena llega al canvas a 768 y a 375.** La cadena adentro de la
 *      sección sale del marcado REAL (`quieto`, el render de la rama quieta que
 *      la sección ya publica) y se camina por profundidad con `nodosDe`; los
 *      tres ancestros de afuera —el panel, el `<main>` y `[data-v3]`— se leen
 *      del fuente, para que un cambio en cualquiera de los cinco archivos lo
 *      vea este invariante y no una captura.
 *
 *      Las clases se resuelven al ancho con `clasesEfectivas` (`s10-css`), que
 *      es el mismo modelo que S10 usa para decidir qué variante aplica: una
 *      clase `escritorio:` no cuenta abajo del umbral, y una `max-escritorio:`
 *      sí. Eso es lo que hace que la pregunta se pueda contestar por ancho.
 *
 *   2. **El orden de pintado adentro del grupo.** Papel (`-z-20`) → escena
 *      (`-z-10`) → texto (en flujo). Si la escena dejara de ser negativa se
 *      pintaría ENCIMA del texto; si el piso no fuera más negativo que la
 *      escena, el papel la taparía. Las dos son cifras, no prosa.
 *
 *   3. **Arriba de 1025 no cambia nada.** Mismo lector, ancho 1025: el `<main>`
 *      y las secciones vuelven a `z-10`, `[data-v3]` vuelve a pintar el papel y
 *      la bajada vuelve a la tinta normal sin blend.
 *
 *   4. **El piso de legibilidad sobre papel limpio.** Es el caso que el blend
 *      podría arruinar sin que nadie lo note: donde NO hay logo detrás, el texto
 *      se pinta `|papel − tinta|`, y con la tinta igual al papel eso da negro
 *      pleno. Se deriva del token y se compara contra AA.
 *
 * ── El control positivo, que es la mitad del invariante ───────────────────
 *
 * Un detector que nunca dijo que no puede estar roto y verse verde. Los cuatro
 * controles de acá plantan el defecto exacto que se teme —un `will-change` en un
 * ancestro, una opacidad parcial, la escena de vuelta en `z-0`, una tinta que
 * cae en la zona muerta— y exigen que el chequeo se ponga en rojo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { createElement } from 'react'

import { Hero } from '../../_secciones/hero/Hero'
import { Cierre } from '../../_secciones/cierre/Cierre'
import { PorQueDevelop } from '../../_secciones/por-que-develop/PorQueDevelop'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { marcar } from '../../_secciones/_invariantes/render'
import { quieto } from '../../_secciones/quienes-somos/quienes-somos-piezas'
import { GEOMETRIA } from '../../_secciones/quienes-somos/geometria'
import { CLASES_DE_LA_ESCENA } from '../escena/contrato'
import { MEZCLA_SOBRE_LA_ESCENA } from '../superficies'
import { SECCIONES } from '../secciones'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'
import { AA, razon } from './s10-acceso-color'
import { clasesEfectivas, valorDeToken } from './s10-css'
import { RAIZ } from './s3-archivos'
import { nodosDe, type Nodo } from './s10-recorrido'
import { abrenContexto, cadenaCompleta, claseDe, plantada, afirmarQueLaCadenaLlega, type Eslabon } from './s7-apilamiento'

/** Se re-exporta para que quien ya lo importaba de acá no cambie de puerta. */
export { abrenContexto } from './s7-apilamiento'

/** Los dos anchos de abajo del umbral que el sprint midió, y el primero de arriba. */
/** El salto de línea, nombrado. Ver `bloqueDeRevelado`: una barra escapada en este archivo ya se comió un salto una vez. */
const NADA = String.fromCharCode(10)

const ABAJO: readonly number[] = [768, 375]
const ARRIBA = 1025

/**
 * LA BANDA MÓVIL — los tres anchos donde el hero mezcla.
 *
 * El hero estrena el gesto abajo de **768** y no abajo de 1025, porque el tramo
 * 768–1024 no se podía tocar. Así que sus anchos de prueba son otros, y 768 entra
 * en la lista de ARRIBA para él: ahí NO tiene que haber mezcla.
 */
const BANDA_MOVIL: readonly number[] = [425, 375, 320]
const PRIMERO_SIN_MEZCLA_EN_EL_HERO = 768

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · Las cinco clases que sostienen la mezcla, leídas de su fuente')

function delFuente(archivo: string, re: RegExp, que: string): string {
  const src = readFileSync(path.join(RAIZ, archivo), 'utf8')
  const m = re.exec(src)
  if (m === null) throw new Error(`no se encontró ${que} en ${archivo}: la mezcla no se puede verificar`)
  return m[1]
}

const CLASE_DEL_MAIN = delFuente('src/app/v3/page.tsx', /<main className="([^"]+)"/, 'la clase del `<main>`')
const CLASE_DE_LA_RAIZ = delFuente('src/app/v3/layout.tsx', /font-cuerpo ([^`]+)`}/, 'la clase de `[data-v3]`')
const CLASE_DEL_PISO = delFuente('src/app/v3/layout.tsx', /<div aria-hidden="true" className="([^"]+)" \/>/, 'la clase del piso de papel')
const CLASE_DEL_PANEL = delFuente('src/app/v3/_componentes/Panel.tsx', /'(relative z-10[^']*)'/, 'la clase del panel')

afirmar(CLASE_DEL_MAIN.includes('z-10'), `el \`<main>\` sigue en z-10 arriba del umbral — "${CLASE_DEL_MAIN}"`)
afirmar(CLASE_DEL_PANEL.includes('z-10'), `y la sección también — "${CLASE_DEL_PANEL}"`)
afirmar(CLASE_DE_LA_RAIZ.includes('bg-fondo'), '  `[data-v3]` sigue pintando el papel arriba del umbral')
afirmar(CLASE_DEL_PISO.includes('fixed inset-0'), '  y el piso cubre la ventana entera')
afirmar(CLASES_DE_LA_ESCENA.includes('z-0'), '  la escena sigue en z-0 arriba del umbral')
afirmar(
  GEOMETRIA.cuerpoDeLaBajada.includes('mix-blend-difference'),
  '  y la bajada declara el blend (acotado por ancho, se comprueba abajo)',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El detector de contextos de apilamiento, en clases')

afirmarIgual(abrenContexto(['relative', 'w-full']), [], 'un `relative` solo no abre contexto')
afirmarIgual(abrenContexto(['relative', 'z-10']), ['z-10'], 'un `relative z-10` sí')
afirmarIgual(abrenContexto(['z-10']), [], '  y un `z-10` sin posición NO: la regla es de par')
afirmarIgual(abrenContexto(['fixed', 'inset-0']), ['fixed'], 'un `fixed` abre solo')
afirmarIgual(abrenContexto(['opacity-100']), [], '`opacity-100` es 1 y no apila')
afirmarIgual(abrenContexto(['opacity-casi']), ['opacity-casi'], '  y cualquier otra opacidad sí')
afirmarIgual(
  abrenContexto(['relative', 'z-10', 'z-auto']),
  [],
  'GANA LA ÚLTIMA: `z-10` seguido de `z-auto` no abre contexto — es la forma que tiene el árbol',
)
afirmarIgual(abrenContexto(['relative', 'z-auto', 'z-10']), ['z-10'], '  y al revés sí: el orden es el que manda')

controlPositivo('el detector ve un `will-change-transform`', ['flex', plantada('will-change', '-transform')], (c: string[]) => abrenContexto(c).length === 0)
controlPositivo('  y un `blur-sm`', ['flex', plantada('blur', '-sm')], (c: string[]) => abrenContexto(c).length === 0)
controlPositivo('  y un `translate-y-full`', ['block', plantada('translate', '-y-full')], (c: string[]) => abrenContexto(c).length === 0)
controlPositivo('  y una mascara arbitraria', ['block', plantada('mask-[', 'url(x)]')], (c: string[]) => abrenContexto(c).length === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La cadena del párrafo, del marcado real hasta `[data-v3]`')

const NODOS = nodosDe(quieto)
afirmar(NODOS.length > 0, `el render de la rama quieta trae ${NODOS.length} nodos`)
afirmar(
  NODOS.every((n, i) => n.indice === i),
  'los nodos vienen en orden de documento: el índice ES la posición',
)

/** Los dos eslabones que viven afuera del marcado de una sección. §1 los leyó del fuente. */
const COLA_DE_LA_CADENA: readonly Eslabon[] = [
  { quien: 'section[data-panel]', clases: CLASE_DEL_PANEL },
  { quien: '<main>', clases: CLASE_DEL_MAIN },
]

const CADENA = cadenaCompleta(quieto, 'la bajada de quiénes somos', (n, clases) => n.etiqueta === 'p' && clases.includes('mix-blend-difference'), COLA_DE_LA_CADENA)
afirmarQueLaCadenaLlega(CADENA, 'la bajada de quiénes somos', ABAJO)

/**
 * ⚠️ **EL HERO SE VERIFICA APARTE, Y NO ES REDUNDANCIA.** Tiene su propia
 * estructura —su marca, la grilla de la caja del titular, la columna lateral— y
 * cualquiera de esos envoltorios podría abrir contexto sin que la sección de al
 * lado se enterara. El render quieto se arma acá igual que en `hero.invariant`:
 * ese archivo lo tiene en un `const` privado y no lo exporta.
 */
const HERO = marcar(Hero({ seccion: seccionDe('hero') }), { anima: false })
const CADENA_DEL_TITULAR = cadenaCompleta(HERO, 'el titular del hero', (n, clases) => n.etiqueta === 'h1' && clases.includes('mix-blend-difference'), COLA_DE_LA_CADENA)
afirmarQueLaCadenaLlega(CADENA_DEL_TITULAR, 'el titular del hero', BANDA_MOVIL)
const CADENA_DE_LA_BAJADA = cadenaCompleta(HERO, 'la bajada del hero', (n, clases) => n.etiqueta === 'p' && clases.includes('mix-blend-difference'), COLA_DE_LA_CADENA)
afirmarQueLaCadenaLlega(CADENA_DE_LA_BAJADA, 'la bajada del hero', BANDA_MOVIL)

/**
 * **[FINAL 2] EL FINAL TAMBIÉN MEZCLA.** De día, «Por qué develOP» y el pie se apoyan sobre el
 * logo oscuro abajo de 1024 como la bajada de «Quiénes somos». La diferencia es que llegan con
 * P5: la mezcla va en el CANAL de cada llegada —el elemento que lleva la transformada—, que
 * es lo que deja la cadena limpia de ahí para arriba.
 */
const POR_QUE = marcar(createElement(PorQueDevelop, { seccion: seccionDe('por-que-develop') }), { anima: false })
const PIE_DEL_FINAL = marcar(createElement(Cierre, { seccion: seccionDe('cierre') }), { anima: false })
const conMezcla = (_n: Nodo, clases: string): boolean => clases.includes('mix-blend-difference')
afirmarQueLaCadenaLlega(cadenaCompleta(POR_QUE, 'la frase de «Por qué develOP»', conMezcla, COLA_DE_LA_CADENA), 'la frase de «Por qué develOP»', ABAJO)
afirmarQueLaCadenaLlega(
  // El canal del botón es el último que mezcla en la sección.
  cadenaCompleta(POR_QUE, 'el botón de «Por qué develOP»', (n, clases) => conMezcla(n, clases) && n.indice === Math.max(...nodosDe(POR_QUE).filter((m) => conMezcla(m, claseDe(m))).map((m) => m.indice)), COLA_DE_LA_CADENA),
  'el botón de «Por qué develOP»',
  ABAJO,
)
afirmarQueLaCadenaLlega(cadenaCompleta(PIE_DEL_FINAL, 'el isotipo del pie', conMezcla, COLA_DE_LA_CADENA), 'el isotipo del pie', ABAJO)

// `[data-v3]` es el único que SÍ debe abrirlo: es el grupo, y tiene la escena adentro.
for (const ancho of [...ABAJO, ...BANDA_MOVIL]) {
  afirmarIgual(
    abrenContexto(clasesEfectivas(CLASE_DE_LA_RAIZ, ancho)),
    ['isolate'],
    `  y a ${ancho} el grupo es \`[data-v3]\`, por \`isolate\` y nada más`,
  )
}

afirmar(
  /<EscenarioCompuerta \/>[\s\S]*\{children\}/.test(readFileSync(path.join(RAIZ, 'src/app/v3/layout.tsx'), 'utf8')),
  'la escena y el contenido cuelgan del MISMO `[data-v3]`: el grupo tiene el canvas adentro',
)

controlPositivo(
  'el chequeo de la cadena ve un ancestro que la corta',
  [...CADENA.map((a) => a.clases), `flex ${plantada('will-change', '-transform')}`],
  (clases: string[]) => clases.flatMap((c) => abrenContexto(clasesEfectivas(c, 768))).length === 0,
)
controlPositivo(
  '  y lo mismo en la cadena del hero, con una opacidad parcial',
  [...CADENA_DEL_TITULAR.map((a) => a.clases), 'flex opacity-casi'],
  (clases: string[]) => clases.flatMap((c) => abrenContexto(clasesEfectivas(c, 375))).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El orden de pintado adentro del grupo: papel → escena → texto')

function zDe(clases: string, ancho: number): number {
  const z = clasesEfectivas(clases, ancho).filter((c) => /^-?z-/.test(c)).pop()
  if (z === undefined || z === 'z-auto') return Number.NaN
  return Number(z.replace(/^(-?)z-/, '$1'))
}

for (const ancho of ABAJO) {
  const piso = zDe(CLASE_DEL_PISO, ancho)
  const escena = zDe(CLASES_DE_LA_ESCENA, ancho)
  afirmar(escena < 0, `a ${ancho} la escena es negativa (${escena}): se pinta DEBAJO del texto en flujo`)
  afirmar(piso < escena, `  y el piso (${piso}) es más negativo que la escena: el papel no la tapa`)
  afirmar(
    clasesEfectivas(CLASE_DEL_PISO, ancho).includes('bg-fondo'),
    '  y el piso pinta el papel a este ancho',
  )
  afirmar(
    clasesEfectivas(CLASE_DE_LA_RAIZ, ancho).includes('bg-transparent'),
    '  mientras `[data-v3]` deja de pintarlo, o taparía la escena',
  )
}

controlPositivo(
  'el orden se rompe si la escena vuelve a z-0',
  'fixed inset-0 z-0 pointer-events-none',
  (clases: string) => zDe(clases, 768) < 0,
)
controlPositivo(
  '  y si el piso deja de ser más negativo que la escena',
  'fixed inset-0 -z-10 max-escritorio:bg-fondo',
  (clases: string) => zDe(clases, 768) < zDe(CLASES_DE_LA_ESCENA, 768),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Arriba de 1025 no cambia nada')

afirmar(clasesEfectivas(CLASE_DEL_MAIN, ARRIBA).includes('z-10'), 'a 1025 el `<main>` sigue en z-10')
afirmar(!clasesEfectivas(CLASE_DEL_MAIN, ARRIBA).includes('z-auto'), '  y la variante de abajo no aplica')
afirmar(clasesEfectivas(CLASE_DEL_PANEL, ARRIBA).includes('z-10'), 'a 1025 la sección sigue en z-10')
afirmar(clasesEfectivas(CLASE_DE_LA_RAIZ, ARRIBA).includes('bg-fondo'), 'a 1025 `[data-v3]` sigue pintando el papel')
afirmarIgual(abrenContexto(clasesEfectivas(CLASE_DE_LA_RAIZ, ARRIBA)), [], '  y NO es un grupo de mezcla: sin `isolate`')
afirmarIgual(zDe(CLASES_DE_LA_ESCENA, ARRIBA), 0, 'a 1025 la escena vuelve a z-0')
afirmarIgual(
  clasesEfectivas(CLASE_DEL_PISO, ARRIBA).filter((c) => c.startsWith('bg-')),
  [],
  'a 1025 el piso no pinta nada: cuesta un div y cero píxeles',
)
afirmar(
  !clasesEfectivas(GEOMETRIA.cuerpoDeLaBajada, ARRIBA).includes('mix-blend-difference'),
  'a 1025 la bajada NO lleva blend',
)
afirmar(
  !clasesEfectivas(GEOMETRIA.cuerpoDeLaBajada, ARRIBA).includes('text-fondo'),
  '  ni la tinta del papel: arriba del umbral es la tinta de siempre',
)
for (const ancho of ABAJO) {
  afirmar(clasesEfectivas(GEOMETRIA.cuerpoDeLaBajada, ancho).includes('mix-blend-difference'), `a ${ancho} sí lleva blend`)
  afirmar(clasesEfectivas(GEOMETRIA.cuerpoDeLaBajada, ancho).includes('text-fondo'), `  y la tinta del papel`)
}

/**
 * EL HERO, CON SU PROPIO ALCANCE — y las dos constantes leídas de un solo lugar.
 *
 * `superficies.ts` declara las dos formas del gesto porque los rangos son dos:
 * `MEZCLA_SOBRE_LA_ESCENA` (1025, la que estrenó quiénes somos) y
 * `MEZCLA_SOBRE_LA_ESCENA` (768, la del hero). Acá se afirma que cada una
 * enciende donde debe y se apaga donde no, y que el marcado usa esas constantes y
 * no una copia.
 */
afirmar(GEOMETRIA.cuerpoDeLaBajada.includes(MEZCLA_SOBRE_LA_ESCENA), 'la bajada de quiénes somos usa la constante de abajo del umbral')
for (const ancho of BANDA_MOVIL) {
  afirmar(clasesEfectivas(MEZCLA_SOBRE_LA_ESCENA, ancho).includes('mix-blend-difference'), `a ${ancho} la banda móvil mezcla`)
  afirmar(clasesEfectivas(MEZCLA_SOBRE_LA_ESCENA, ancho).includes('text-fondo'), `  con la tinta del papel`)
}
/**
 * ⚠️ **EL ALCANCE ES UNO Y ES EL DEL CORTE DE COMPOSICIÓN.** Nació partido —1025
 * para «Quiénes somos», 768 para el hero— y eso era un accidente de dos sprints.
 * El motivo escrito para frenarlo en 768 («arriba la cadena no se destraba por el
 * `transform` inline de `Pieza.tsx`») es falso y está medido: ese `transform` sólo
 * existe con la coreografía instalada, o sea ARRIBA del umbral, y `j-hero.ts` leyó
 * la cadena llegando al canvas en los tres anchos de la banda. Así que la mezcla
 * vale en TODO el tramo de abajo del corte, 768 incluido, y se apaga en el corte.
 */
afirmar(
  clasesEfectivas(MEZCLA_SOBRE_LA_ESCENA, PRIMERO_SIN_MEZCLA_EN_EL_HERO).includes('mix-blend-difference'),
  `a ${PRIMERO_SIN_MEZCLA_EN_EL_HERO} la mezcla SÍ aplica: es parte del tramo de abajo del corte`,
)
afirmarIgual(clasesEfectivas(MEZCLA_SOBRE_LA_ESCENA, ARRIBA), [], `y a ${ARRIBA} se apaga: ahí la composición es de escritorio`)

/**
 * ⚠️ **Y EL HERO YA NO PINTA PAPEL OPACO.** Era lo que resolvía la lectura abajo
 * de 390 tapando la sala; la mezcla la resuelve sin taparla. Si alguien le
 * devuelve la banda angosta, el papel vuelve a cubrir la escena y el blend
 * mezclaría contra papel en los dos lados — o sea negro sobre papel, que se lee,
 * pero con la escena perdida y sin que nada se ponga rojo. Por eso se afirma.
 */
const HERO_EN_LA_TABLA = SECCIONES.find((s) => s.id === 'hero')
afirmar(HERO_EN_LA_TABLA !== undefined, 'el hero está en la tabla de secciones')
afirmarIgual(HERO_EN_LA_TABLA?.superficieAngosta, undefined, '  y NO declara banda angosta: el papel opaco se fue con la mezcla')
controlPositivo(
  'el chequeo del papel opaco ve una sección que lo declara',
  'papel-opaco',
  (modo: string | undefined) => modo === undefined,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · El piso de legibilidad sobre papel limpio')

/**
 * Donde NO hay logo detrás, el backdrop del párrafo es el papel y `difference`
 * pinta `|papel − tinta|` canal por canal. Con la tinta igual al papel eso da
 * **negro pleno**, que es el mejor caso posible — pero es una consecuencia de
 * que los dos tokens sean el mismo, no una casualidad, y por eso se deriva de
 * los tokens y no se escribe a mano.
 */
const PAPEL = valorDeToken('--color-fondo')
afirmar(/^#[0-9a-fA-F]{6}$/.test(PAPEL), `el papel es un hex de seis: ${PAPEL}`)

function diferencia(fondo: string, fuente: string): string {
  const canal = (c: string, i: number): number => Number.parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
  const hex = (n: number): string => n.toString(16).padStart(2, '0')
  return `#${[0, 1, 2].map((i) => hex(Math.abs(canal(fondo, i) - canal(fuente, i)))).join('')}`
}

const PINTADO_SOBRE_PAPEL = diferencia(PAPEL, PAPEL)
afirmarIgual(PINTADO_SOBRE_PAPEL, '#000000', 'con la tinta igual al papel, sobre papel limpio el blend pinta negro pleno')

const RAZON_SOBRE_PAPEL = razon(PINTADO_SOBRE_PAPEL, PAPEL)
afirmar(
  RAZON_SOBRE_PAPEL >= AA,
  `y ese negro sobre el papel no baja del piso de legibilidad`,
  `${RAZON_SOBRE_PAPEL.toFixed(2)}:1 contra un piso de ${AA}:1`,
)

controlPositivo(
  'el piso no se cumple solo: con una tinta en la zona muerta, el blend desaparece',
  '#808080',
  (tinta: string) => razon(diferencia(PAPEL, tinta), PAPEL) >= AA,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Todo lo que se apoya en la escena entra, y lo que se apoya en la foto no')

/**
 * ⚠️ **LA RED TIENE QUE CUBRIR A LAS NUEVE PIEZAS, NO A UNA.**
 *
 * La mezcla dejó de ser el arreglo de un párrafo y pasó a ser la regla del tramo:
 * la lleva todo texto y todo trazo que se apoye sobre la escena. Y el modo de
 * falla no es que una pieza se rompa — es que una pieza **quede afuera**: si el
 * titular invierte y su subrayado no, la raya se queda en tinta oscura sobre el
 * logo oscuro, que es exactamente el defecto que la mezcla vino a sacar.
 *
 * Por eso acá no se afirma «la mezcla existe» sino **cuántas piezas la llevan y
 * cuáles**, sobre el marcado real de las dos secciones.
 */
const CON_MEZCLA = (html: string): string[] =>
  nodosDe(html)
    .filter((n) => claseDe(n).includes('mix-blend-difference'))
    .map((n) => {
      const datos = /data-([a-z-]+)=/.exec(n.atributos)
      return `${n.etiqueta}${datos === null ? '' : `[data-${datos[1]}]`}`
    })

const EN_EL_HERO = CON_MEZCLA(HERO)
afirmar(EN_EL_HERO.length >= 3, `el hero mezcla ${EN_EL_HERO.length} piezas: titular, bajada y CTA`, EN_EL_HERO.join(' · '))
afirmar(EN_EL_HERO.some((q) => q.startsWith('h1')), '  entre ellas el titular')

const EN_QUIENES_SOMOS = CON_MEZCLA(quieto)
afirmar(
  EN_QUIENES_SOMOS.length >= 8,
  `quiénes somos mezcla ${EN_QUIENES_SOMOS.length} piezas: titular, bajada, ≠, «El equipo», dos nombres, dos descripciones, el pie y los rótulos del toque`,
  EN_QUIENES_SOMOS.join(' · '),
)
for (const etiqueta of ['h3', 'h4', 'svg', 'p']) {
  afirmar(EN_QUIENES_SOMOS.some((q) => q.startsWith(etiqueta)), `  y hay al menos un \`${etiqueta}\` adentro`)
}
// [FINAL 2] El final: la frase, los seis valores, el CTA y su botón; en el pie, el isotipo, la identidad y las columnas.
const EN_POR_QUE = CON_MEZCLA(POR_QUE)
afirmar(EN_POR_QUE.length >= 9, `«Por qué develOP» mezcla ${EN_POR_QUE.length} piezas: la frase, los seis valores, el CTA y su botón`, EN_POR_QUE.join(' · '))
const EN_EL_PIE = CON_MEZCLA(PIE_DEL_FINAL)
afirmar(EN_EL_PIE.length >= 4, `el pie mezcla ${EN_EL_PIE.length} piezas: el isotipo, la identidad y las dos columnas (la fila de abajo no: lleva el acento)`, EN_EL_PIE.join(' · '))

/**
 * ⚠️ **Y EL TEXTO DE LA FOTO NO ENTRA, QUE ES LA MITAD DE LA REGLA.** Ahí el
 * fondo no es la escena: es la imagen y su velo. `difference` contra una foto no
 * invierte hacia el papel, da el negativo de lo que haya debajo — o sea cualquier
 * cosa, y distinta en cada retrato. Se afirma sobre las clases del revelado,
 * que es donde estaría si alguien lo agregara por simetría.
 */
const FUENTE_DEL_MARCO = readFileSync(path.join(RAIZ, 'src/app/v3/_secciones/quienes-somos/marco.tsx'), 'utf8')
/** El bloque del revelado, acotado por sus llaves. Sin regex: una barra en un
 *  literal de este archivo ya se comió un salto de linea una vez. */
function bloqueDeRevelado(fuente: string): string | null {
  const i = fuente.indexOf('const REVELADO = {')
  if (i < 0) return null
  const j = fuente.indexOf(
    [NADA, '}'].join(''), i)
  return j < 0 ? null : fuente.slice(i, j + 2)
}
const REVELADO = bloqueDeRevelado(FUENTE_DEL_MARCO)
afirmar(REVELADO !== null, 'el revelado del marco está en su fuente')
afirmar(
  REVELADO !== null && !REVELADO.includes('MEZCLA_SOBRE_LA_ESCENA') && !REVELADO[0].includes('mix-blend'),
  'el texto que va ENCIMA de la foto NO mezcla: su fondo es la imagen, no la escena',
)
controlPositivo(
  'el chequeo del revelado ve una mezcla puesta donde no va',
  ['const REVELADO = {', '  texto: MEZCLA_SOBRE_LA_ESCENA,', '}'].join(NADA),
  (fuente: string) => !fuente.includes('MEZCLA_SOBRE_LA_ESCENA') && !fuente.includes('mix-blend'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('8 · La hoja de la banda: los trazos, el CTA que mezcla y el corte atado')

/**
 * El subrayado, el tachado y los tres trazos del ≠ se pintan con `--color-tinta`
 * EXPLÍCITO y no con `currentColor`, así que la mezcla del envoltorio no los
 * alcanza sola: `trazo.css` los repinta con el papel abajo del corte. Y lo hace
 * con `@variant max-escritorio` y no con una media query escrita, que es lo que
 * `s3-tokens` §6 prohíbe y lo que dejaría el umbral escrito dos veces.
 */
const BANDA_CSS = readFileSync(path.join(RAIZ, 'src/app/v3/_estilos/banda.css'), 'utf8')
/**
 * ⚠️ **EL LITERAL DEL CORTE, ATADO AL TOKEN.** `trazo.css` escribe el umbral como
 * número porque no le queda otra —las tres formas probadas están en su docblock— y
 * esta afirmación es la red: si alguien mueve `--breakpoint-escritorio` y se olvida
 * del archivo, queda una franja con el texto invertido y las rayas no, y esto se
 * pone rojo antes. Es el mismo patrón de `tokens.invariant` §7b con el 375.
 */
const CORTE_EN_EL_TRAZO = /@media \(width < (\d+)px\)/.exec(BANDA_CSS)
afirmar(CORTE_EN_EL_TRAZO !== null, '`banda.css` declara el corte como media query de ancho')
afirmarIgual(
  CORTE_EN_EL_TRAZO === null ? null : Number(CORTE_EN_EL_TRAZO[1]),
  Number(valorDeToken('--breakpoint-escritorio').replace('px', '')),
  '  y dice EXACTAMENTE lo mismo que `--breakpoint-escritorio`: un solo umbral en dos lugares',
)
controlPositivo(
  'el atado ve un corte desincronizado',
  '@media (width < 900px) { [data-trazo] { background-color: var(--color-fondo) } }',
  (css: string) => {
    const m = /@media \(width < (\d+)px\)/.exec(css)
    return m !== null && Number(m[1]) === Number(valorDeToken('--breakpoint-escritorio').replace('px', ''))
  },
)
/**
 * ⚠️ **SE SACA EL COMENTARIO ANTES DE PREGUNTAR, Y LO ENSEÑÓ ESTE MISMO ARCHIVO.**
 *
 * La primera versión buscaba la media query en el fuente ENTERO y se puso roja
 * contra un `trazo.css` correcto: su docblock CUENTA que la primera versión usaba
 * una media query escrita, o sea que la deletrea para explicar por qué no hay que
 * usarla. Un detector que castiga la documentación de su propia regla está midiendo
 * la palabra y no la propiedad — es textual el argumento de `s7-contrato` §5, que
 * llegó acá por el mismo camino, y el mismo de `s10-mobile-pastilla` antes.
 */
const soloCss = (fuente: string): string =>
  fuente
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split(NADA)
    .filter((l) => !/^\s*\/\//.test(l))
    .join(NADA)

const iVariant = BANDA_CSS.indexOf('@media (width < ')
const jVariant = iVariant < 0 ? -1 : BANDA_CSS.indexOf([NADA, '}'].join(''), iVariant)
const BLOQUE_DEL_VARIANT = iVariant < 0 || jVariant < 0 ? null : BANDA_CSS.slice(iVariant, jVariant + 2)
afirmar(BLOQUE_DEL_VARIANT !== null, '  y el bloque del repintado está ahí')
for (const que of ['background-color: var(--color-fondo)', 'stroke: var(--color-fondo)', "[data-pieza='cta'][data-mezcla]"]) {
  afirmar(BLOQUE_DEL_VARIANT !== null && BLOQUE_DEL_VARIANT.includes(que), `  y repinta \`${que}\``)
}

/**
 * 🔴 **EL RESPIRO DE LA FOTO SE FUE, Y ACÁ SE AFIRMA QUE NO QUEDÓ NADA.**
 *
 * Tuvo tres condiciones en tres sprints —el corte de composición, después
 * ninguna, después `(hover: hover)` negado— y el cuarto sprint lo sacó entero:
 * donde se clickea, quien mira se da cuenta solo. La afirmación que quedaba
 * («sigue declarado en `banda.css`») se da vuelta en vez de borrarse, porque un
 * rastro suelto —la regla sin el atributo, o los `@keyframes` sin consumidor— es
 * exactamente lo que este archivo existe para cazar.
 */
/**
 * ⚠️ Los tres nombres se ARMAN y no se deletrean, y el control positivo también:
 * el escáner de Tailwind 4 lee este archivo —invariantes y comentarios incluidos—
 * y un selector escrito entero puede salir emitido como regla. Es la misma regla
 * que `Seccion.tsx:208` ya aplica, escrita en `CLAUDE.md`.
 */
const ATRIBUTO_DEL_RESPIRO = `data-${'respira'}`
const RASTROS_DEL_RESPIRO = [ATRIBUTO_DEL_RESPIRO, `respiro-${'de-la-foto'}`, `--respiro-${'ciclo'}`]
for (const rastro of RASTROS_DEL_RESPIRO) {
  afirmar(!BANDA_CSS.includes(rastro), `no queda rastro de \`${rastro}\` en \`banda.css\``)
}
controlPositivo(
  'el detector de rastros del respiro no está ciego',
  `[${ATRIBUTO_DEL_RESPIRO}] { animation: ${RASTROS_DEL_RESPIRO[1]} 1s infinite }`,
  (css: string) => !css.includes(ATRIBUTO_DEL_RESPIRO),
)

cerrar('s7-mezcla.invariant')



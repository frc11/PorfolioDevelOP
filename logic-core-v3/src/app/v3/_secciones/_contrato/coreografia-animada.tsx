'use client'

import { motion, useMotionValueEvent, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

import { Titular } from '../../_componentes/tipografia/Titular'
import { acotar01 } from '../../_lib/acotar'
import type { ParDeAnclas } from '../../_lib/motion/anclas'
import { CURVAS } from '../../_lib/motion/curvas'
import { perspectivaDeLaEscena, useOrigenDeLaLente } from '../../_lib/motion/lente'
import { PATRONES } from '../../_lib/motion/patrones'
import { useProgresoDePatron } from '../../_lib/motion/useProgresoDePatron'
import { LineasDeTexto } from '../../motion/_componentes/LineasDeTexto'
import { Pieza } from '../../motion/_componentes/Pieza'
import { Piezas } from '../../motion/_componentes/Piezas'

import { TRAZOS_DEL_SIGNO } from './canales'
import type {
  CanalDePiezaProps,
  CanalDePiezasProps,
  CanalDeTitularProps,
  LlegadaEnCurvaProps,
  ProgresoAmortiguadoProps,
  SignoDistintoProps,
  TextoPorLineasProps,
  TrazoProps,
} from './canales'
import type { BloqueProps, PrimitivasDeCoreografia } from './coreografia'
import { ATRIBUTO_DE_PANEL } from './forma'
import { MARCA_COREOGRAFIA_DEL_HOME } from './marcaCoreografia'
import { ANCLA_DEL_PIN, ANCLA_DEL_TRAZO, ANCLA_DE_LA_LLEGADA, ANCLA_DE_LA_MASCARA, ANCLA_DE_LA_VENTANA_VISIBLE, CORTE_DE_LA_VENTANA_DEL_TRAZO, DESFASE_DE_LAS_BARRAS, LLEGADA_EN_CURVA, PERSECUCION_DEL_SCROLL, especificacionDe, inerciaDe } from './bloqueAnimado'

/**
 * LAS PRIMITIVAS ANIMADAS — el único módulo del home que importa el sistema.
 *
 * ── Qué lo hace especial, y por qué está solo ─────────────────────────────
 *
 * Todo lo que importa de `_lib/motion/` y de `motion/_componentes/` está acá y
 * en ningún otro archivo del home. Es lo que hace que la compuerta sea
 * estructural y no cosmética: este módulo entra al grafo por un `import()`
 * perezoso —`Instalador.tsx`, con el mecanismo de S1— y abajo de 1025 ese
 * `import()` nunca se ejecuta, así que el navegador no pide su chunk.
 *
 * `MARCA_COREOGRAFIA_DEL_HOME` viaja adentro para que `s7-compuerta` pueda
 * afirmarlo sobre la SALIDA DEL BUILD y no sobre una promesa: la marca tiene
 * que existir en algún chunk —o el buscador está ciego— y no puede aparecer en
 * la carga inicial de `/v3`.
 *
 * ── Qué NO reimplementa ───────────────────────────────────────────────────
 *
 * El sistema. `PATRONES` con sus valores medidos, `useProgresoDePatron` como
 * motor, y las tres piezas de glue de S2 (`Pieza`, `Piezas`, `LineasDeTexto`)
 * se consumen tal cual. Lo único propio es el cableado.
 *
 * ⚠ Las tres piezas de glue viven en `motion/_componentes/`, que es la carpeta
 * privada de la ruta de demostración de S2 y está declarada como deuda con
 * fecha de baja. **Este archivo es el único punto del home que las importa**,
 * así que el día que se muevan a `_lib/motion/` lo que cambia son tres líneas,
 * acá. Los dos lanes lo habían acotado a un archivo cada uno; ahora es uno solo
 * para las ocho secciones.
 *
 * ── Los valores son los MEDIDOS, sin perillas ─────────────────────────────
 *
 * `BloqueDePatron` del demo multiplica duración y escalonado por los factores
 * de la mesa de calibración y puede forzar una curva. Acá no hay perillas: el
 * sitio corre en lo medido. La calibración fina la hace el ojo sobre la mesa,
 * no sobre el sitio.
 */

/**
 * De dónde salen las anclas del bloque, resuelto acá porque es acá donde se
 * puede: el seam quieto sólo maneja la palabra.
 *
 * ⚠️ **El orden de las dos ramas no es indiferente [B9].** El pin va primero
 * porque `patron: 'pin'` no nombra un patrón de los nueve: `PATRONES['pin']` no
 * existe y `ANCLA_DE_LA_VENTANA_VISIBLE` sobre un bloque que YA mide la sección
 * entera daría `rango = alto + 160` en vez del recorrido del `sticky`. Un
 * bloque pinneado no declara `rango` —el invariante lo afirma— y esta rama es
 * la que lo hace imposible aunque alguien lo declarara.
 */
function anclasDe(props: BloqueProps): ParDeAnclas {
  if (props.patron === 'pin') return ANCLA_DEL_PIN
  if (props.rango === 'ventana-visible') return ANCLA_DE_LA_VENTANA_VISIBLE
  if (props.rango === 'ventana-del-trazo') return ANCLA_DEL_TRAZO
  if (props.rango === 'ventana-de-la-mascara') return ANCLA_DE_LA_MASCARA
  if (props.rango === 'llegada-de-la-foto') return ANCLA_DE_LA_LLEGADA
  return PATRONES[props.patron].anclas
}

/**
 * QUÉ ELEMENTO SE MIDE. **[B1]**
 *
 * `anclaje: 'seccion'` sube al ancestro que lleva el alto del recorrido. Es lo
 * único que esa propiedad hace: **no toca el ancla**, que sigue siendo la del
 * patrón. El porqué —con el número que lo fuerza y con la forma anterior, que
 * estaba mal y lo empeoraba— está en `AnclajeDelBloque` (`coreografia.tsx`).
 *
 * Si el ancestro no existe devuelve el propio bloque, que es el defecto: una
 * sección que no es un panel del recorrido no tiene por qué romperse, y el
 * invariante de la sección que pide `'seccion'` afirma que ahí SÍ existe.
 */
function elementoMedido(el: HTMLElement, anclaje: BloqueProps['anclaje']): HTMLElement {
  if (anclaje !== 'seccion') return el
  const panel = el.closest(`[${ATRIBUTO_DE_PANEL}]`)
  return panel instanceof HTMLElement ? panel : el
}

/**
 * La inercia del `scrub`, o `null`.
 *
 * El pin no lleva inercia y no es un valor por defecto: es la decisión que el
 * bloque de `Servicios` traía escrita. Un resorte sobre el progreso del pin
 * haría que el nombre del servicio cambie después de que el scroll paró.
 */
function inerciaDelBloque(props: BloqueProps): number | null {
  if (props.patron === 'pin') return null
  // ⚠ `anclaje: 'pin'` NO entra acá, y la asimetría es deliberada: lo que esa
  // propiedad cambia es contra qué recorrido se reparte el patrón, no cómo
  // persigue el cabezal. La inercia es una decisión del PATRÓN —`scrub` en
  // SCROLL.md— y quitársela porque la sección esté pinneada sería anular un
  // valor medido por la puerta de atrás. P7 declara `scrub: true`, así que hoy
  // esto devuelve `null` para Trabajos por la razón correcta.
  return inerciaDe(PATRONES[props.patron])
}

/**
 * El estilo del bloque: SÓLO la perspectiva, y sólo cuando el patrón la
 * declara.
 *
 * Sin alto mínimo —ése es el punto de no usar el bloque del demo, que escribe
 * uno derivado de la geometría del INSTRUMENTO— y sin ninguna otra propiedad.
 * La perspectiva sí va, y va acá: se midió `perspective: 1000px` **en un
 * ancestro** de los 44 planos de la referencia, no en cada plano. Es la
 * diferencia entre doce planos compartiendo un punto de fuga y doce planos con
 * doce puntos de fuga distintos.
 *
 * ⚠️ **B6-A: con `lente="escena"` la perspectiva es el FOCO DE LA CÁMARA de
 * la sala** (`_lib/motion/lente.ts`) y no los 1000 px que el patrón declara:
 * P7 se calibró contra un fondo plano, y con la sala real detrás los planos
 * tienen que converger al punto de fuga de la sala y a la profundidad de su
 * pared. El patrón no cambia un valor; cambia el lente. El ORIGEN del lente
 * —el centro del viewport en coordenadas del bloque— no cabe en un estilo
 * estático: lo escribe `useOrigenDeLaLente` en el montaje y en cada resize.
 */
function estiloDelBloque(props: BloqueProps): React.CSSProperties | undefined {
  if (props.patron === 'pin') return props.style
  const perspectivaPx = PATRONES[props.patron].perspectivaPx
  if (perspectivaPx === undefined) return props.style
  return { ...props.style, perspective: props.lente === 'escena' ? perspectivaDeLaEscena() : `${perspectivaPx}px` }
}

function BloqueConMotor(props: BloqueProps): React.JSX.Element {
  // El `ref` que baja al motor apunta al ELEMENTO MEDIDO, que con
  // `anclaje: 'seccion'` no es este `div` sino su `<section>`. No sube: leer una
  // propiedad que contiene un `ref` durante el render dispara
  // `react-hooks/refs`.
  const refDeMedida = useRef<HTMLElement | null>(null)
  /** El propio `div`, para el origen del lente: es él quien lleva la `perspective`. */
  const refDelBloque = useRef<HTMLElement | null>(null)
  const anclaje = props.anclaje

  /**
   * ⚠ **Un `ref` de callback y no un `useEffect`, y es la condición de que esto
   * funcione.** El motor resuelve su rango adentro de un `useEffect` propio, y
   * los efectos de un hook corren ANTES que los del componente que lo llama: un
   * `useEffect` acá poblaría `refDeMedida` después de que el motor ya lo leyó
   * nulo, y el patrón se quedaría sin rango en el primer montaje. Un `ref` de
   * callback corre en el commit, antes de cualquier efecto.
   */
  const montar = useCallback(
    (el: HTMLDivElement | null) => {
      refDelBloque.current = el
      refDeMedida.current = el === null ? null : elementoMedido(el, anclaje)
    },
    [anclaje],
  )

  // El origen del lente se escribe sobre el nodo, en el montaje y por época de
  // medición: cero `setState`, y nunca por cuadro. Sin lente, no escribe nada.
  useOrigenDeLaLente(refDelBloque, props.lente === 'escena' && props.patron !== 'pin')

  const progreso = useProgresoDePatron({
    ref: refDeMedida,
    anclas: anclasDe(props),
    inerciaSegundos: inerciaDelBloque(props),
  })

  return (
    // `data-arbol` con la marca del chunk animado, igual que la rama quieta con
    // la suya: un atributo en un `div` que se renderiza de verdad. Es el mismo
    // mecanismo que S2 usa para su chunk, y la razón es la misma — una
    // constante exportada y no usada la puede podar el empaquetador.
    <div
      ref={montar}
      data-arbol={MARCA_COREOGRAFIA_DEL_HOME}
      data-anclaje={anclaje ?? 'propia'}
      // `data-rango` es el hermano de `data-anclaje` y existe por lo mismo: el
      // instrumento de B9 encuentra las instancias por `[data-arbol]` y tiene
      // que poder decir, sobre el DOM renderizado y no sobre el fuente, cuál
      // resuelve su rango por la ventana visible. Sin él, la tabla del
      // «después» tendría que confiar en que el diff se aplicó donde dice.
      data-rango={props.rango ?? 'del-patron'}
      className={props.className}
      style={estiloDelBloque(props)}
    >
      {props.children(progreso)}
    </div>
  )
}

function CanalDePiezaAnimado(props: CanalDePiezaProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('CanalDePieza animado sin progreso')
  return (
    <Pieza
      spec={especificacionDe(PATRONES[props.patron], props.cantidad)}
      indice={props.indice}
      progreso={progreso}
      como={props.como}
      className={props.className}
    >
      {props.children}
    </Pieza>
  )
}

function CanalDePiezasAnimado(props: CanalDePiezasProps): React.JSX.Element {
  const spec = especificacionDe(PATRONES[props.patron], props.cantidad)
  return (
    <Piezas
      estado={{ progreso: props.progreso, spec, cronograma: spec.cronograma }}
      cantidad={props.cantidad}
      className={props.className}
      contenedor={props.contenedor}
      como={props.como}
      render={props.render}
    />
  )
}

function CanalDeTitularAnimado(props: CanalDeTitularProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('CanalDeTitular animado sin progreso')
  const patron = PATRONES[props.patron]
  return (
    <Titular nivel={props.nivel} como={props.como} className={props.className}>
      <LineasDeTexto
        texto={props.texto}
        progreso={progreso}
        claves={patron.claves}
        curva={patron.curva}
        duracionDeclarada={patron.duracionDeclarada}
        escalonado={patron.escalonado}
      />
    </Titular>
  )
}

function TextoPorLineasAnimado(props: TextoPorLineasProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('TextoPorLineas animado sin progreso')
  const patron = PATRONES[props.patron]
  const Etiqueta = props.como
  return (
    <div data-texto-por-lineas="partido">
      {/* El encabezado real. Es lo ÚNICO que entra al árbol de accesibilidad. */}
      <Etiqueta id={props.id} className="sr-only">
        {props.texto}
      </Etiqueta>
      <div aria-hidden="true">
        <LineasDeTexto
          texto={props.texto}
          progreso={progreso}
          claves={patron.claves}
          curva={patron.curva}
          duracionDeclarada={patron.duracionDeclarada}
          escalonado={patron.escalonado}
          className={props.className}
        />
      </div>
    </div>
  )
}

/**
 * EL TRAZO ANIMADO — la raya se dibuja con el scroll, en los dos sentidos.
 *
 * No hay disparo ni estado: `scaleX` es una función del progreso, así que al
 * volver para arriba la raya se desdibuja por el mismo camino. Los dos tramos
 * son SECUENCIALES: la ventana se parte en `CORTE_DE_LA_VENTANA_DEL_TRAZO` y el
 * tachado no empieza hasta que el subrayado llegó a 1.
 *
 * El mismo `avance` sale por dos puertas: `scaleX` en la raya y
 * `--trazo-despinte` en el tramo, que es lo que despinta el texto tachado en la
 * hoja. Un solo valor, así que no pueden desincronizarse.
 */
function TrazoAnimado(props: TrazoProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('Trazo animado sin progreso')
  const corte = CORTE_DE_LA_VENTANA_DEL_TRAZO
  const esTachado = props.tipo === 'tachado'
  const avance = useTransform(progreso, (p) =>
    CURVAS.principal(acotar01(esTachado ? (p - corte) / (1 - corte) : p / corte)),
  )

  /**
   * El despinte viaja por una propiedad personalizada y no por `style` de motion:
   * quien lo consume es la hoja, que mezcla los DOS tokens de tinta con
   * `color-mix`. Así el color sigue siendo del sistema y acá no se escribe ninguno.
   */
  const tramo = useRef<HTMLSpanElement | null>(null)
  const escribirDespinte = useCallback((valor: number) => {
    tramo.current?.style.setProperty('--trazo-despinte', String(valor))
  }, [])
  useMotionValueEvent(avance, 'change', escribirDespinte)
  useEffect(() => escribirDespinte(avance.get()), [avance, escribirDespinte])

  return (
    <span ref={tramo} data-trazo={props.tipo} className={props.className}>
      {props.children}
      <motion.span data-parte="linea" style={{ scaleX: avance }} />
    </span>
  )
}

/**
 * LA LLEGADA EN CURVA ANIMADA — el camino curvo sale de las dos curvas, no de una
 * trayectoria escrita.
 *
 * `x` recorre con `principal` (power1.out) y `y` con `salida-fuerte` (power4.out):
 * la vertical frena mucho antes que la horizontal, así que en cada instante el punto
 * está más arriba de lo que estaría en una recta — y eso, dibujado, es un arco. Las
 * dos son curvas que el sistema ya declara; ninguna es nueva.
 *
 * La escala y el giro van con `principal`, la misma que la horizontal: el enderezado
 * acompaña al desplazamiento en vez de competir con él.
 */
function LlegadaEnCurvaAnimada(props: LlegadaEnCurvaProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('LlegadaEnCurva animada sin progreso')
  const signo = props.sentido === 'desde-la-izquierda' ? -1 : 1
  const ejeX = useTransform(progreso, (p) => signo * LLEGADA_EN_CURVA.x * (1 - CURVAS.principal(p)))
  const ejeY = useTransform(progreso, (p) => LLEGADA_EN_CURVA.y * (1 - CURVAS['salida-fuerte'](p)))
  const escala = useTransform(
    progreso,
    (p) => LLEGADA_EN_CURVA.escala + (1 - LLEGADA_EN_CURVA.escala) * CURVAS.principal(p),
  )
  const giro = useTransform(progreso, (p) => signo * LLEGADA_EN_CURVA.giro * (1 - CURVAS.principal(p)))
  return (
    <motion.span className={props.className} style={{ x: ejeX, y: ejeY, scale: escala, rotate: giro }}>
      {props.children}
    </motion.span>
  )
}

/**
 * EL SIGNO ≠ ANIMADO — cada trazo crece desde SU origen, no se dibuja de punta a punta.
 *
 * Las dos barras del «=» nacen en su punto medio y se extienden a los dos lados
 * a la vez (`scaleX` con el origen en el centro de cada una). La diagonal hace
 * lo inverso y va PARTIDA en dos: cada mitad nace en su extremo de afuera y
 * crece hasta encontrarse en el centro (`scale` con el origen en ese extremo).
 *
 * Las barras van en la primera mitad de la ventana —con el subrayado, la de
 * arriba adelantada `DESFASE_DE_LAS_BARRAS`— y la diagonal lleva la MISMA
 * cuenta del tachado: mismo corte, misma curva, mismo arranque y mismo final.
 *
 * `vector-effect: non-scaling-stroke` en la hoja es lo que deja el grosor quieto
 * mientras el grupo escala, y el remate a ras evita que un trazo en escala cero
 * deje un punto pintado en el centro.
 */
function SignoDistintoAnimado(props: SignoDistintoProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('SignoDistinto animado sin progreso')
  const corte = CORTE_DE_LA_VENTANA_DEL_TRAZO
  const tramoDeLaBarra = corte * (1 - DESFASE_DE_LAS_BARRAS)
  const arriba = useTransform(progreso, (p) => CURVAS.principal(acotar01(p / tramoDeLaBarra)))
  const abajo = useTransform(progreso, (p) =>
    CURVAS.principal(acotar01((p - corte * DESFASE_DE_LAS_BARRAS) / tramoDeLaBarra)),
  )
  const diagonal = useTransform(progreso, (p) => CURVAS.principal(acotar01((p - corte) / (1 - corte))))
  const { lado, barras, mitadesDeLaDiagonal: mitades } = TRAZOS_DEL_SIGNO
  const avances = [arriba, abajo]
  return (
    <svg data-signo="distinto" aria-hidden="true" viewBox={`0 0 ${lado} ${lado}`} className={props.className}>
      {barras.map((t, i) => (
        <motion.g key={t.clave} data-parte="barra" style={{ originX: t.origenX, originY: t.origenY, scaleX: avances[i] }}>
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        </motion.g>
      ))}
      {mitades.map((t) => (
        <motion.g key={t.clave} data-parte="diagonal" style={{ originX: t.origenX, originY: t.origenY, scale: diagonal }}>
          <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        </motion.g>
      ))}
    </svg>
  )
}

/**
 * EL PROGRESO AMORTIGUADO — el scroll mueve el objetivo y el resorte lo persigue.
 *
 * `useSpring` sobre el progreso crudo: lo que sale es un progreso que va atrás y
 * que sigue viajando cuando el scroll se detiene. La calibración está en
 * `PERSECUCION_DEL_SCROLL` —0,5 s de asentamiento, sin rebote— y vive ahí y no
 * acá porque es la forma de la persecución y no de esta primitiva.
 */
function ProgresoAmortiguadoAnimado(props: ProgresoAmortiguadoProps): React.JSX.Element {
  const progreso = props.progreso
  if (progreso === null) throw new Error('ProgresoAmortiguado animado sin progreso')
  const perseguido = useSpring(progreso, PERSECUCION_DEL_SCROLL)
  return <>{props.children(perseguido)}</>
}

/**
 * El juego completo. Es lo que el instalador mete en el contexto, y lo que un
 * instrumento puede pasarle al proveedor para renderizar la rama animada sin
 * navegador ni compuerta.
 */
export const PRIMITIVAS_ANIMADAS: PrimitivasDeCoreografia = {
  Bloque: BloqueConMotor,
  CanalDePieza: CanalDePiezaAnimado,
  CanalDePiezas: CanalDePiezasAnimado,
  CanalDeTitular: CanalDeTitularAnimado,
  TextoPorLineas: TextoPorLineasAnimado,
  Trazo: TrazoAnimado,
  SignoDistinto: SignoDistintoAnimado,
  ProgresoAmortiguado: ProgresoAmortiguadoAnimado,
  LlegadaEnCurva: LlegadaEnCurvaAnimada,
}

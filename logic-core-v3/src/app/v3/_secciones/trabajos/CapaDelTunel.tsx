'use client'

import { type MotionValue } from 'motion/react'
import React, { useCallback, useEffect, useRef } from 'react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'
import {
  MEDIDAS_DE_LAS_CAPTURAS,
  SIZES_DE_LA_CAPTURA,
  enLaVentana,
  progresoDelPxDelTunel,
  pxDelTunelEn,
  ventanaDeLaSalida,
  ventanaDelTunel,
} from './geometria'
import { VentanaDelCta } from './piezas'
import { pintarElTipeo } from './trabajos-tipeo'
import {
  ANCHO_CON_EL_ROTULO_ENTERO,
  DURACION_DEL_FRENO_MS,
  PX_DEL_TUNEL,
  PX_DE_LA_SALIDA,
  VELO_DEL_CTA,
  avanzarElResorte,
  opacidadDelRotulo,
  poseDelTunel,
  pxParaQueElProyectoMida,
  transformDeLaCapa,
  transformDelRotulo,
  type EstadoDelResorte,
} from './tunel'

/**
 * EL TÚNEL — la mitad que toca el DOM. **[PORTFOLIO]**
 *
 * El modelo puro vive en `tunel.ts` y las ventanas en `geometria.ts`. Acá está lo
 * mínimo que escribe en el navegador: cero `setState` por cuadro, todo es
 * `style.setProperty` sobre un `ref`.
 *
 * ── ⚠️ LAS CAPAS VAN ANIDADAS, Y EL MARCADO LO DICE ─────────────────────
 *
 * escenario › proyecto 1 › proyecto 2 › proyecto 3 › CTA. Cada capa es una caja
 * del tamaño del cuadro con su propia escala, y la siguiente vive ADENTRO de
 * ella: lo que mide en pantalla es el producto de su cadena, igual que en la
 * referencia. La hija va DESPUÉS de la captura de su madre y afuera de ella —nunca
 * adentro de su ancla—: así el orden anunciado sigue siendo nombre → rubro →
 * imagen por proyecto, y no hay un enlace adentro de otro.
 *
 * ── ⚠️ UN SOLO RELOJ PARA TODO EL TRAMO, Y ES UN PROGRESO CON RESORTE ───
 *
 * Lo que se persigue es **el progreso de la sección**, con el resorte de la
 * referencia. De ese progreso dibujado salen las cinco escalas, el tipeo, el velo
 * y la salida, así que todos heredan la misma inercia sin un segundo reloj.
 *
 * **Éste es el único tramo del sitio que no dibuja una función pura del scroll**:
 * el mismo scroll puede dar dos cuadros distintos según de dónde venga y cuánto
 * tiempo pasó. Para el que venga a medir: una captura hecha justo después de
 * mover el scroll NO muestra el estado final; hay que esperar el asentamiento.
 *
 * ── ⚠️ EL LAZO SE APAGA FUERA DE PANTALLA, Y AL VOLVER NO ANIMA ──────────
 *
 * Un `IntersectionObserver` sobre el panel lo prende y lo apaga. Al apagarlo el
 * progreso dibujado se lleva **de un salto** al real, y en reposo: si no, al
 * volver a entrar se vería el resorte corriendo hacia un estado que ya debería
 * estar puesto. `arrancar` siembra por la misma razón, y es simétrico a propósito.
 */

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/** Escala cero: no pinta un píxel, no recibe un clic, y sigue siendo parada. */
const ESCONDIDO = 'scale(0)'

/**
 * ⚠️ **EL RECORTE DEL TÚNEL — `clip` con margen, y las dos mitades son medidas.**
 *
 * **Por qué hay que recortar:** las capas desbordan el cuadro y, centradas sobre
 * 1.440, su borde derecho cae fuera. Sin recorte eso no queda en la sección:
 * `document.scrollWidth` pasaba de 1.440 a 1.899 y el sitio entero ganaba una
 * barra de scroll HORIZONTAL a mitad del tramo.
 *
 * **Por qué NO es `overflow: hidden`:** adentro viven siete anclas, y el anillo de
 * foco del sistema se dibuja con desplazamiento POSITIVO, o sea por FUERA del
 * elemento. Un ancestro con `hidden` se lo come entero. Lo dice el invariante de
 * la compacta con todas las letras, y tiene razón: acá se probó y lo marcó en rojo.
 *
 * **La salida:** `overflow: clip` recorta igual pero no crea un contenedor de
 * scroll, y `overflow-clip-margin` le deja pintar unos píxeles por afuera.
 *
 * ⚠️ El margen va en píxeles a mano y NO como `calc()` de los tokens, y eso se
 * midió: escrito como `calc()` el navegador lo computa en **0px**; con una
 * longitud directa computa lo que dice. Blink no acepta `calc()` acá. La suma
 * queda derivada del otro lado: `s5-trabajos` lee los dos tokens del tema y
 * afirma que dan esto.
 *
 * ⚠️ **Y el recorte va en ESTA caja, que no escala.** Si fuera la del escenario,
 * su caja crecería ×1,3 con él y volvería la barra horizontal.
 */
const MARGEN_DEL_RECORTE_PX = 4

const RECORTE_DEL_TUNEL = {
  overflow: 'clip',
  overflowClipMargin: `${MARGEN_DEL_RECORTE_PX}px`,
} as const

/** Las tres, en el orden en que entran. El índice ES su lugar en la cadena. */
const CAPTURAS: readonly ProyectoDeContenido[] = CONTENIDO.proyectos

// El día que entre un cuarto proyecto sin su capa en la tabla, esto tira acá.
ventanaDelTunel(CAPTURAS.length)

const VENTANA_DE_LA_SALIDA = ventanaDeLaSalida(CAPTURAS.length)
const LETRAS_DE_LA_FRASE = [...CONTENIDO.cta.frase.replace(/ /g, '')].length

/**
 * La pose del primer cuadro, con el progreso en cero: la sección está a tres
 * pantallas de la carga. Sale de la misma tabla que el lazo, así que el papel y
 * el cliente dicen lo mismo —el escenario en su piso de 1, cada capa en 0—.
 */
const POSE_INICIAL = poseDelTunel(pxDelTunelEn(0))

function medidaDe(indice: number): { readonly ancho: number; readonly alto: number } {
  const medida = MEDIDAS_DE_LAS_CAPTURAS[indice]
  // El día que entre un cuarto proyecto sin su medida, esto tira acá y no tres
  // cuadros después con un `aspect-ratio: undefined / undefined` que no dice nada.
  if (medida === undefined) {
    throw new Error(`falta la medida de la captura ${indice}: hay ${MEDIDAS_DE_LAS_CAPTURAS.length} declaradas`)
  }
  return medida
}

export function CapaDelTunel({
  progreso,
  className,
}: {
  readonly progreso: MotionValue<number>
  readonly className?: string
}): React.JSX.Element {
  const contenedor = useRef<HTMLDivElement | null>(null)
  const escenario = useRef<HTMLDivElement | null>(null)
  const envoltorios = useRef<(HTMLDivElement | null)[]>([])
  const rotulos = useRef<(HTMLDivElement | null)[]>([])
  const anclas = useRef<(HTMLAnchorElement | null)[]>([])
  const envoltorioCta = useRef<HTMLDivElement | null>(null)
  const fraseCta = useRef<HTMLDivElement | null>(null)
  const cursorCta = useRef<HTMLSpanElement | null>(null)
  const veloCta = useRef<HTMLDivElement | null>(null)
  /** El progreso dibujado y su velocidad: el único estado del tramo. */
  const resorte = useRef<EstadoDelResorte>({ posicion: 0, velocidad: 0 })
  /** Los dos tokens del anillo de foco, leídos del tema una vez. */
  const anillo = useRef<{ grosor: number; desplazamiento: number } | null>(null)

  const montarEnvoltorio = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      envoltorios.current[i] = el
    },
    [],
  )
  const montarRotulo = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      rotulos.current[i] = el
    },
    [],
  )
  const montarAncla = useCallback(
    (i: number) => (el: HTMLAnchorElement | null) => {
      anclas.current[i] = el
    },
    [],
  )

  /**
   * Escribe el cuadro entero desde un progreso. Es lo único que toca el DOM.
   *
   * ⚠️ **ESCONDE CON `scale(0)` Y NO CON `visibility` — y es una corrección de
   * accesibilidad.** Con `visibility: hidden` sobre la caja de una captura, sus
   * dos anclas salen del foco secuencial: el navegador no le da Tab a lo que no
   * se renderiza. Como arriba de 1025 la lista no existe, el resultado medido era
   * que **los enlaces a los sitios de los clientes no se podían alcanzar con el
   * teclado**. Un elemento en `scale(0)` no pinta, no recibe clic —su caja mide
   * cero— y **sigue siendo una parada**. Una madre en `scale(0)` esconde a toda
   * su cadena por la misma vía.
   */
  const pintar = useCallback((p: number): void => {
    const pose = poseDelTunel(pxDelTunelEn(p))
    escenario.current?.style.setProperty('transform', transformDeLaCapa(pose.escenario))
    for (let i = 0; i < CAPTURAS.length; i += 1) {
      envoltorios.current[i]?.style.setProperty('transform', transformDeLaCapa(pose.proyectos[i]))
      const ancho = pose.anchos[i]
      /**
       * ⚠️ **EL ANILLO DE FOCO SE DIBUJA EN EL ESPACIO YA ESCALADO**, y el que lo
       * escala es la cadena ENTERA, no la escala propia: con la captura chica
       * salía sub-píxel y con la desbordada salía grueso. Se arregla redefiniendo
       * sobre el ancla **los dos tokens con los que el tema lo dibuja**,
       * divididos por lo que mide la captura en pantalla.
       */
      const tokens = anillo.current
      const rotulo = rotulos.current[i]
      // Las dos anclas de la captura: la de la imagen y —por herencia desde su
      // rótulo— la del nombre, que escala con la misma cadena.
      for (const el of [anclas.current[i], rotulo]) {
        if (el === null || el === undefined || tokens === null || !(ancho > 0)) continue
        el.style.setProperty('--foco-grosor', `${(tokens.grosor / ancho).toFixed(4)}px`)
        el.style.setProperty('--foco-desplazamiento', `${(tokens.desplazamiento / ancho).toFixed(4)}px`)
      }
      if (rotulo === null || rotulo === undefined) continue
      const cuantoSeVe = opacidadDelRotulo(ancho)
      rotulo.style.setProperty('opacity', cuantoSeVe.toFixed(3))
      rotulo.style.setProperty('transform', cuantoSeVe <= 0 ? ESCONDIDO : transformDelRotulo())
    }

    // ── EL CTA: la última capa de la tabla, adentro del tercer proyecto ──
    envoltorioCta.current?.style.setProperty('transform', transformDeLaCapa(pose.cta))
    const velo = veloCta.current
    if (velo !== null) velo.style.setProperty('opacity', (VELO_DEL_CTA * pose.fraccionDelCta).toFixed(3))
    // El tipeo entero —el recorte por palabra y el cursor— vive en
    // `trabajos-tipeo.ts`, por la regla de las 300 líneas. Acá sólo se le pasa
    // cuánto de su tamaño final lleva la ventana, que es de lo único que depende.
    pintarElTipeo(fraseCta.current, cursorCta.current, pose.fraccionDelCta, LETRAS_DE_LA_FRASE)

    /**
     * ── ⚠️ LA SALIDA: LA CAPA SE VA A LA VELOCIDAD DEL SCROLL, NI UNA MÁS ──
     *
     * Hubo un `translateY(−130 %)` acá: 1.170 px de movimiento repartidos en 450
     * px de scroll, o sea 2,6 veces el dedo. Eso es lo que se leía como
     * deslizamiento impuesto — no el gesto, la velocidad. Después se sacó del
     * todo, y el contenido pasó a irse con el despineado del panel; tampoco
     * sirvió, porque el pin termina un viewport antes que la sección y durante
     * ese viewport **servicios ya está entrando por abajo**: nunca queda un
     * cuadro con la sala sola.
     *
     * Ahora la capa se traslada de nuevo, y a **1:1**: un píxel de scroll, un
     * píxel de traslación. A esa velocidad no hay nada que distinguir de un
     * scroll normal, porque es la velocidad del scroll. Lo que se gana es que el
     * contenido se va MIENTRAS la sección sigue clavada, y detrás queda el
     * espacio de demos.
     *
     * Va en PÍXELES y no en porcentaje del contenedor justamente para que la
     * igualdad con el scroll sea exacta y no dependa de cuánto mida la caja.
     *
     * ⚠️ Y **no toca la opacidad**: nada se desvanece, todo sale por arriba.
     */
    const capa = contenedor.current
    if (capa !== null) {
      const salida = enLaVentana(p, VENTANA_DE_LA_SALIDA) * PX_DE_LA_SALIDA
      capa.style.setProperty('transform', `translateY(${(-salida).toFixed(1)}px)`)
    }
  }, [])

  useEffect(() => {
    const caja = contenedor.current
    const panel = caja?.closest('[data-panel]') ?? null
    if (caja === null || panel === null) return

    // Los dos tokens del anillo, del tema y no de acá.
    const px = (nombre: string): number =>
      Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(nombre)) || 0
    anillo.current = { grosor: px('--foco-grosor'), desplazamiento: px('--foco-desplazamiento') }

    let cuadro = 0
    let anterior = 0
    /** Qué tiene el foco adentro del túnel: una captura por su índice, o el CTA. */
    let enfocada: number | 'cta' | null = null
    let frenoHasta = 0
    let yaFreno = false

    /**
     * ⚠️ **EL PISO DEL FOCO.** Una parada de teclado que no se ve no sirve de
     * nada. Mientras el foco esté adentro de una captura, el progreso no puede
     * bajar del que la deja RECONOCIBLE: el de `ANCHO_CON_EL_ROTULO_ENTERO`, el
     * ancho EN PANTALLA —el de su cadena— desde el que su nombre se lee entero.
     * Y en el CTA, el del final del túnel: la ventana entera y la frase escrita.
     * El resto lo pone el navegador: al dar foco a algo hace scroll para traerlo
     * al cuadro, y eso arranca el lazo.
     */
    const pisoDelFoco = (): number => {
      if (enfocada === null) return 0
      if (enfocada === 'cta') return progresoDelPxDelTunel(PX_DEL_TUNEL)
      return progresoDelPxDelTunel(pxParaQueElProyectoMida(enfocada, ANCHO_CON_EL_ROTULO_ENTERO))
    }

    const objetivoDeAhora = (): number => Math.max(progreso.get(), pisoDelFoco())

    /** Deja el progreso dibujado en `p` y QUIETO: un salto no hereda velocidad. */
    const reposarEn = (p: number): void => {
      resorte.current = { posicion: p, velocidad: 0 }
    }

    /**
     * ⚠️ **EL FRENO — lo que se detiene es el GESTO, no el scroll.**
     *
     * Cuando la frase termina de escribirse, el progreso dibujado se queda quieto
     * `DURACION_DEL_FRENO_MS` para que se alcance a leer. La página sigue
     * scrolleando normal: **nadie queda atrapado, ni con rueda ni con teclado**, y
     * no se detiene el motor de scroll suave ni se cancela un solo evento — el
     * repo tiene dos invariantes que prohíben lo primero y la doctrina escrita de
     * que el gesto del visitante siempre gana. Al soltar, el resorte retoma desde
     * el reposo y el reencuentro con el scroll no es un salto.
     */
    const frenaSiCorresponde = (ahora: number): boolean => {
      const uCta = poseDelTunel(pxDelTunelEn(resorte.current.posicion)).fraccionDelCta
      if (uCta <= 0) yaFreno = false
      if (!yaFreno && uCta >= 1) {
        yaFreno = true
        frenoHasta = ahora + DURACION_DEL_FRENO_MS
      }
      return ahora < frenoHasta
    }

    const paso = (ahora: number): void => {
      const dt = anterior === 0 ? 0 : ahora - anterior
      anterior = ahora
      if (frenaSiCorresponde(ahora)) reposarEn(resorte.current.posicion)
      else resorte.current = avanzarElResorte(resorte.current, objetivoDeAhora(), dt)
      pintar(resorte.current.posicion)
      cuadro = requestAnimationFrame(paso)
    }

    const arrancar = (): void => {
      if (cuadro !== 0) return
      anterior = 0
      reposarEn(objetivoDeAhora())
      // Entrar con la frase ya escrita —recargando más abajo, o volviendo desde
      // Servicios— no es terminar de escribirla: ahí no se frena.
      yaFreno = poseDelTunel(pxDelTunelEn(resorte.current.posicion)).fraccionDelCta >= 1
      pintar(resorte.current.posicion)
      cuadro = requestAnimationFrame(paso)
    }

    /** Frena el lazo y deja el progreso DONDE CORRESPONDE, sin animar la vuelta. */
    const frenar = (): void => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
      reposarEn(objetivoDeAhora())
      pintar(resorte.current.posicion)
    }

    const alEntrarElFoco = (e: FocusEvent): void => {
      const objetivo = e.target as HTMLElement | null
      const dueña = objetivo?.closest('[data-captura]') ?? null
      const indice = dueña === null ? -1 : CAPTURAS.findIndex((c) => c.nombre === dueña.getAttribute('data-captura'))
      // El CTA no vive adentro de una captura: vive en su propia capa.
      enfocada = objetivo?.closest('[data-capa="cta"]') ? 'cta' : indice < 0 ? null : indice
      // El piso se toma de UN SALTO: un foco que aparece de a poco no es un foco.
      const piso = pisoDelFoco()
      if (resorte.current.posicion < piso) {
        reposarEn(piso)
        pintar(resorte.current.posicion)
      }
    }
    const alSalirElFoco = (): void => {
      enfocada = null
    }

    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) arrancar()
      else frenar()
    })
    observador.observe(panel)
    caja.addEventListener('focusin', alEntrarElFoco)
    caja.addEventListener('focusout', alSalirElFoco)

    return () => {
      observador.disconnect()
      caja.removeEventListener('focusin', alEntrarElFoco)
      caja.removeEventListener('focusout', alSalirElFoco)
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
    }
  }, [pintar, progreso])

  /**
   * UNA CAPA DE PROYECTO, con la siguiente adentro. La última lleva al CTA.
   *
   * La caja de la capa es el cuadro entero —así escala desde su centro— y la
   * captura va centrada en ella. La hija va DESPUÉS de la captura, como hermana:
   * se pinta encima, que es lo que hace cierto «nace adentro de la anterior».
   */
  const proyecto = (i: number): React.JSX.Element => {
    const trabajo = CAPTURAS[i]
    const medida = medidaDe(i)
    return (
      <div
        ref={montarEnvoltorio(i)}
        data-capa={`proyecto-${String(i)}`}
        className="absolute inset-0 will-change-transform"
        style={{ transform: transformDeLaCapa(POSE_INICIAL.proyectos[i]) }}
      >
        <div
          data-captura={trabajo.nombre}
          className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
          style={{ aspectRatio: `${medida.ancho} / ${medida.alto}` }}
        >
          {/* ⚠️ **EL RÓTULO VA PRIMERO EN EL MARCADO.** La rama quieta anuncia
              nombre → rubro → imagen, y `s10-acceso` compara el texto anunciado de
              las dos ramas. El orden de PINTURA no se pierde: el rótulo es
              `absolute` y lo posicionado pinta arriba de lo que está en flujo. */}
          <div
            ref={montarRotulo(i)}
            data-rotulo={trabajo.nombre}
            className="bg-fondo pointer-events-auto absolute bottom-0 left-0 flex origin-bottom-left flex-col gap-1 px-5 py-4"
            style={{ opacity: 0, transform: ESCONDIDO }}
          >
            <Titular nivel="titulo-m" como="h3">
              <a href={trabajo.enlace} target="_blank" rel="noopener noreferrer" data-pieza="enlace-de-proyecto">
                {trabajo.nombre}
              </a>
            </Titular>
            <Cuerpo como="p">{trabajo.rubro}</Cuerpo>
          </div>
          {/* ⚠️ `pointer-events-auto` sobre el ancla y no sobre la capa: la capa
              entera con eventos taparía el scroll de la sección, y sin ellos deja
              el ancla INERTE al clic aunque tome foco. */}
          <a
            ref={montarAncla(i)}
            href={trabajo.enlace}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={trabajo.pagina.alt}
            data-pieza="enlace-de-proyecto"
            data-anillo="sin-escala"
            className="pointer-events-auto block"
          >
            <MarcoDeMedio
              marcador="[CAPTURA]"
              fuente={trabajo.pagina.fuente}
              alt={trabajo.pagina.alt}
              ancho={medida.ancho}
              alto={medida.alto}
              sizes={SIZES_DE_LA_CAPTURA}
            />
          </a>
        </div>
        {i + 1 < CAPTURAS.length ? (
          proyecto(i + 1)
        ) : (
          <VentanaDelCta
            escalaInicial={POSE_INICIAL.cta}
            refEnvoltorio={(el) => {
              envoltorioCta.current = el
            }}
            refFrase={(el) => {
              fraseCta.current = el
            }}
            refCursor={(el) => {
              cursorCta.current = el
            }}
            refVelo={(el) => {
              veloCta.current = el
            }}
          />
        )}
      </div>
    )
  }

  return (
    // ⚠️ SIN `aria-hidden`: las capturas y el CTA son CONTENIDO, y `s10-acceso`
    // compara el texto anunciado de las dos ramas carácter por carácter.
    <div
      ref={contenedor}
      data-pieza="tunel"
      /* `will-change` acá y no sólo en las capas: en la SALIDA la caja que se
         transforma es ÉSTA, y la regla del repo pide la capa de composición
         sobre el elemento que efectivamente se mueve. */
      className={`${className ?? ''} will-change-transform`}
      style={RECORTE_DEL_TUNEL}
    >
      <div
        ref={escenario}
        data-capa="escenario"
        className="absolute inset-0 will-change-transform"
        style={{ transform: transformDeLaCapa(POSE_INICIAL.escenario) }}
      >
        {proyecto(0)}
      </div>
    </div>
  )
}

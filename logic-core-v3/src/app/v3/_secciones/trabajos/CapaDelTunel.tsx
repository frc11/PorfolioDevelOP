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
  ventanaDeLaLevantada,
  ventanaDelCta,
  ventanaDelTunel,
} from './geometria'
import { VentanaDelCta } from './piezas'
import {
  ALTURAS_DE_LA_LEVANTADA,
  DURACION_DEL_FRENO_MS,
  ENTRADA_DEL_NACIMIENTO,
  VELO_DEL_CTA,
  anchoDeLaCaptura,
  avanceDelNacimiento,
  avanceObjetivo,
  letrasEscritas,
  opacidadDeLaCaptura,
  opacidadDelRotulo,
  perseguir,
  progresoDelAvance,
  transformDeLaCaptura,
  transformDelRotulo,
} from './tunel'

/**
 * EL TÚNEL — la mitad que toca el DOM. **[PORTFOLIO]**
 *
 * El modelo puro vive en `tunel.ts` y las ventanas en `geometria.ts`. Acá está lo
 * mínimo que escribe en el navegador: cero `setState` por cuadro, todo es
 * `style.setProperty` sobre un `ref`.
 *
 * ── ⚠️ UN SOLO RELOJ PARA TODO EL TRAMO, Y ES UN PROGRESO CON RETRASO ────
 *
 * Lo que se persigue no es el zoom: es **el progreso de la sección**. De ese
 * progreso lento salen las cuatro cosas que pasan acá —el avance del túnel, el
 * crecimiento del CTA, el tipeo de la frase y la huida—, así que las cuatro
 * heredan la misma inercia sin que haya un segundo reloj que mantener de acuerdo.
 * Perseguir el progreso y después mapear es lo mismo que mapear y después
 * perseguir, porque el mapeo es lineal, y de las dos formas equivalentes ésta
 * tiene un solo estado.
 *
 * **Éste es el único tramo del sitio que no dibuja una función pura del scroll**:
 * el mismo scroll puede dar dos cuadros distintos según de dónde venga y cuánto
 * tiempo pasó. Para el que venga a medir: una captura hecha justo después de
 * mover el scroll NO muestra el estado final; hay que esperar el asentamiento.
 *
 * ── ⚠️ EL LAZO SE APAGA FUERA DE PANTALLA, Y AL VOLVER NO ANIMA ──────────
 *
 * Un `IntersectionObserver` sobre el panel lo prende y lo apaga. Al apagarlo el
 * progreso lento se lleva **de un salto** al real: si no, al volver a entrar se
 * verían tres segundos de persecución hacia un estado que ya debería estar puesto.
 * `arrancar` siembra por la misma razón, y es simétrico a propósito.
 *
 * ── ⚠️ TODO CRECE DESDE EL CENTRO ───────────────────────────────────────
 *
 * Cada captura se posiciona en el medio y su `transform` lleva
 * `translate(-50%, -50%)` antes de la escala. Los porcentajes de `translate` se
 * miden sobre la caja SIN escalar, así que el centro cae en el centro del cuadro
 * valga la escala lo que valga.
 */

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/** Escala cero: no pinta un píxel, no recibe un clic, y sigue siendo parada. */
const ESCONDIDO = 'scale(0)'

/**
 * ⚠️ **EL RECORTE DEL TÚNEL — `clip` con margen, y las dos mitades son medidas.**
 *
 * **Por qué hay que recortar:** la primera captura llega a 1,70 anchos de cuadro
 * y, centrada sobre 1.440, su borde derecho cae fuera. Sin recorte eso no queda
 * en la sección: `document.scrollWidth` pasaba de 1.440 a 1.899 y el sitio entero
 * ganaba una barra de scroll HORIZONTAL a mitad del tramo.
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
 * ⚠️ Lo que el margen deja sin cerrar, con su número: `document.scrollWidth` mide
 * **1.444** contra 1.440 de ventana. Son 4 px contra los 459 que había sin
 * recortar, y es el precio de que el anillo de foco exista.
 */
const MARGEN_DEL_RECORTE_PX = 4

const RECORTE_DEL_TUNEL = {
  overflow: 'clip',
  overflowClipMargin: `${MARGEN_DEL_RECORTE_PX}px`,
} as const

/** Las tres, en el orden en que entran. El índice ES su lugar en el túnel. */
const CAPTURAS: readonly ProyectoDeContenido[] = CONTENIDO.proyectos

const VENTANA_DEL_TUNEL = ventanaDelTunel(CAPTURAS.length)
const VENTANA_DEL_CTA = ventanaDelCta(CAPTURAS.length)
const VENTANA_DE_LA_LEVANTADA = ventanaDeLaLevantada(CAPTURAS.length)
const LETRAS_DE_LA_FRASE = [...CONTENIDO.cta.frase.replace(/ /g, '')].length

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
  const capturas = useRef<(HTMLDivElement | null)[]>([])
  const rotulos = useRef<(HTMLDivElement | null)[]>([])
  const anclas = useRef<(HTMLAnchorElement | null)[]>([])
  const ventanaCta = useRef<HTMLDivElement | null>(null)
  const fraseCta = useRef<HTMLDivElement | null>(null)
  const veloCta = useRef<HTMLDivElement | null>(null)
  /** El progreso perseguido. Es el único estado del tramo. */
  const lento = useRef(0)
  /** Los dos tokens del anillo de foco, leídos del tema una vez. */
  const anillo = useRef<{ grosor: number; desplazamiento: number } | null>(null)

  const montarCaptura = useCallback(
    (i: number) => (el: HTMLDivElement | null) => {
      capturas.current[i] = el
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
   * cero— y **sigue siendo una parada**.
   */
  const pintar = useCallback((p: number): void => {
    const avance = avanceObjetivo(p, VENTANA_DEL_TUNEL, CAPTURAS.length)
    for (let i = 0; i < CAPTURAS.length; i += 1) {
      const caja = capturas.current[i]
      const ancho = anchoDeLaCaptura(i, avance)
      if (caja !== null && caja !== undefined) {
        caja.style.setProperty('transform', ancho === null ? ESCONDIDO : transformDeLaCaptura(ancho))
        caja.style.setProperty('opacity', opacidadDeLaCaptura(i, avance).toFixed(3))
      }
      /**
       * ⚠️ **EL ANILLO DE FOCO SE DIBUJA EN EL ESPACIO YA ESCALADO**, así que la
       * escala lo multiplica: con la captura chica salía sub-píxel y con la
       * captura desbordada salía grueso. No se arregla moviendo el ancla: se
       * arregla redefiniendo sobre ella **los dos tokens con los que el tema lo
       * dibuja**, divididos por la escala. Los valores salen del tema.
       */
      const ancla = anclas.current[i]
      const tokens = anillo.current
      if (ancla !== null && ancla !== undefined && tokens !== null && ancho !== null && ancho > 0) {
        ancla.style.setProperty('--foco-grosor', `${(tokens.grosor / ancho).toFixed(4)}px`)
        ancla.style.setProperty('--foco-desplazamiento', `${(tokens.desplazamiento / ancho).toFixed(4)}px`)
      }
      const rotulo = rotulos.current[i]
      if (rotulo === null || rotulo === undefined) continue
      const cuantoSeVe = ancho === null ? 0 : opacidadDelRotulo(ancho)
      rotulo.style.setProperty('opacity', cuantoSeVe.toFixed(3))
      rotulo.style.setProperty('transform', cuantoSeVe <= 0 || ancho === null ? ESCONDIDO : transformDelRotulo(ancho))
    }

    // ── EL CTA: la ventana crece y la frase se escribe con ella ──────────
    const uCta = enLaVentana(p, VENTANA_DEL_CTA)
    const ventana = ventanaCta.current
    if (ventana !== null) {
      // ⚠️ La escala va de 0 a 1 y el ANCHO lo pone el layout, no la escala. Al
      // revés —una caja del ancho del cuadro escalada a 0,62— todo lo de adentro
      // salía multiplicado por 0,62: la URL declarada en 10 px llegaba a la
      // pantalla en 6,2 y era ilegible. Con la caja ya del tamaño final, los
      // tamaños tipográficos declarados son los que se ven.
      ventana.style.setProperty('transform', transformDeLaCaptura(uCta))
    }
    const velo = veloCta.current
    if (velo !== null) velo.style.setProperty('opacity', (VELO_DEL_CTA * uCta).toFixed(3))
    const frase = fraseCta.current
    if (frase !== null) {
      // El tipeo es un RECORTE por palabra —ver el docblock de `VentanaDelCta`—:
      // se reparten las letras escritas entre las palabras, en orden, y cada una
      // se descubre de izquierda a derecha en la fracción que le tocó.
      let restan = letrasEscritas(uCta, LETRAS_DE_LA_FRASE)
      const palabras = frase.querySelectorAll('[data-palabra]')
      for (let k = 0; k < palabras.length; k += 1) {
        const el = palabras[k] as HTMLElement
        const largo = (el.getAttribute('data-palabra') ?? '').length
        const visibles = Math.max(0, Math.min(largo, restan))
        restan -= visibles
        const oculto = largo === 0 ? 0 : (1 - visibles / largo) * 100
        el.style.setProperty('clip-path', `inset(0 ${oculto.toFixed(2)}% 0 0)`)
      }
    }

    /**
     * ── LA LEVANTADA: nada desaparece, todo sube y sale por arriba ────────
     *
     * ⚠️ **Acá NO hay huida.** Era un `translateZ` negativo con desvanecido, y
     * eso se lee como «esto se borra». Lo que tiene que pasar es lo que pasaría
     * con cualquier página: el contenido se va para arriba y detrás queda lo que
     * sigue. Así que es UNA traslación, lineal con el scroll —sin curva, porque
     * un scroll no tiene curva— y **sin tocar la opacidad**: nada se desvanece.
     *
     * El porcentaje se mide sobre la caja de la capa, que es exactamente el
     * cuadro, así que `-130 %` son 1,3 alturas de ventana: alcanza para sacar
     * también a la primera captura, que desborda el cuadro por arriba y por abajo.
     */
    const capa = contenedor.current
    if (capa !== null) {
      const subida = ALTURAS_DE_LA_LEVANTADA * 100 * enLaVentana(p, VENTANA_DE_LA_LEVANTADA)
      capa.style.setProperty('transform', `translateY(${(-subida).toFixed(2)}%)`)
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
    let enfocada: number | null = null
    let frenoHasta = 0
    let yaFreno = false

    /**
     * ⚠️ **EL PISO DEL FOCO.** Una parada de teclado que no se ve no sirve de
     * nada. Mientras el foco esté adentro de una captura, el progreso no puede
     * bajar del que la deja nacida y entera. El resto lo pone el navegador: al dar
     * foco a algo hace scroll para traerlo al cuadro, y eso arranca el lazo.
     */
    const pisoDelFoco = (): number =>
      enfocada === null
        ? 0
        : progresoDelAvance(avanceDelNacimiento(enfocada) + ENTRADA_DEL_NACIMIENTO, VENTANA_DEL_TUNEL, CAPTURAS.length)

    const objetivoDeAhora = (): number => Math.max(progreso.get(), pisoDelFoco())

    /**
     * ⚠️ **EL FRENO — lo que se detiene es el GESTO, no el scroll.**
     *
     * Cuando la frase termina de escribirse, el progreso lento se queda quieto
     * `DURACION_DEL_FRENO_MS` para que se alcance a leer. La página sigue
     * scrolleando normal: **nadie queda atrapado, ni con rueda ni con teclado**, y
     * no se detiene el motor de scroll suave ni se cancela un solo evento — el
     * repo tiene dos invariantes que prohíben lo primero y la doctrina escrita de
     * que el gesto del visitante siempre gana. Al soltar, la persecución de tres segundos se
     * encarga de que el reencuentro con el scroll no sea un salto.
     */
    const frenaSiCorresponde = (ahora: number): boolean => {
      const uCta = enLaVentana(lento.current, VENTANA_DEL_CTA)
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
      if (!frenaSiCorresponde(ahora)) {
        lento.current = perseguir(lento.current, objetivoDeAhora(), dt)
      }
      pintar(lento.current)
      cuadro = requestAnimationFrame(paso)
    }

    const arrancar = (): void => {
      if (cuadro !== 0) return
      anterior = 0
      lento.current = objetivoDeAhora()
      pintar(lento.current)
      cuadro = requestAnimationFrame(paso)
    }

    /** Frena el lazo y deja el progreso DONDE CORRESPONDE, sin animar la vuelta. */
    const frenar = (): void => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
      lento.current = objetivoDeAhora()
      pintar(lento.current)
    }

    const alEntrarElFoco = (e: FocusEvent): void => {
      const dueña = (e.target as HTMLElement | null)?.closest('[data-captura]') ?? null
      const indice = dueña === null ? -1 : CAPTURAS.findIndex((c) => c.nombre === dueña.getAttribute('data-captura'))
      enfocada = indice < 0 ? null : indice
      // El piso se toma de UN SALTO: un foco que aparece de a poco no es un foco.
      const piso = pisoDelFoco()
      if (lento.current < piso) {
        lento.current = piso
        pintar(lento.current)
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
   * El primer cuadro sale del servidor con el progreso en cero: la sección está a
   * tres pantallas de la carga y nadie la ve. Lo que sí hace falta es que las tres
   * nazcan en ESCALA cero y no escondidas, por lo que dice el docblock de `pintar`.
   */
  const estiloInicial = (indice: number): React.CSSProperties => {
    const medida = medidaDe(indice)
    return {
      aspectRatio: `${medida.ancho} / ${medida.alto}`,
      transform: ESCONDIDO,
      opacity: 0,
    }
  }

  return (
    // ⚠️ SIN `aria-hidden`: las capturas y el CTA son CONTENIDO, y `s10-acceso`
    // compara el texto anunciado de las dos ramas carácter por carácter.
    <div
      ref={contenedor}
      data-pieza="tunel"
      /* `will-change` acá y no sólo en los hijos: desde la levantada, la caja que
         se transforma es ÉSTA, y la regla del repo pide la capa de composición
         sobre el elemento que efectivamente se mueve. */
      className={`${className ?? ''} will-change-transform`}
      style={RECORTE_DEL_TUNEL}
    >
      {CAPTURAS.map((proyecto, i) => (
        <div
          key={proyecto.nombre}
          ref={montarCaptura(i)}
          data-captura={proyecto.nombre}
          className="absolute top-1/2 left-1/2 w-full will-change-transform"
          style={estiloInicial(i)}
        >
          {/* ⚠️ **EL RÓTULO VA PRIMERO EN EL MARCADO.** La rama quieta anuncia
              nombre → rubro → imagen, y `s10-acceso` compara el texto anunciado de
              las dos ramas. El orden de PINTURA no se pierde: el rótulo es
              `absolute` y lo posicionado pinta arriba de lo que está en flujo. */}
          <div
            ref={montarRotulo(i)}
            data-rotulo={proyecto.nombre}
            className="bg-fondo pointer-events-auto absolute bottom-0 left-0 flex origin-bottom-left flex-col gap-1 px-5 py-4"
            style={{ opacity: 0, transform: ESCONDIDO }}
          >
            <Titular nivel="titulo-m" como="h3">
              <a href={proyecto.enlace} target="_blank" rel="noopener noreferrer" data-pieza="enlace-de-proyecto">
                {proyecto.nombre}
              </a>
            </Titular>
            <Cuerpo como="p">{proyecto.rubro}</Cuerpo>
          </div>
          {/* ⚠️ `pointer-events-auto` sobre el ancla y no sobre la capa: la capa
              entera con eventos taparía el scroll de la sección, y sin ellos deja
              el ancla INERTE al clic aunque tome foco. */}
          <a
            ref={montarAncla(i)}
            href={proyecto.enlace}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={proyecto.pagina.alt}
            data-pieza="enlace-de-proyecto"
            data-anillo="sin-escala"
            className="pointer-events-auto block"
          >
            <MarcoDeMedio
              marcador="[CAPTURA]"
              fuente={proyecto.pagina.fuente}
              alt={proyecto.pagina.alt}
              ancho={medidaDe(i).ancho}
              alto={medidaDe(i).alto}
              sizes={SIZES_DE_LA_CAPTURA}
            />
          </a>
        </div>
      ))}
      <VentanaDelCta
        refVentana={(el) => {
          ventanaCta.current = el
        }}
        refFrase={(el) => {
          fraseCta.current = el
        }}
        refVelo={(el) => {
          veloCta.current = el
        }}
      />
    </div>
  )
}

'use client'

import { type MotionValue } from 'motion/react'
import React, { useCallback, useEffect, useRef } from 'react'

import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'
import { MEDIDAS_DE_LAS_CAPTURAS, SIZES_DE_LA_CAPTURA, VENTANA_DEL_TUNEL } from './geometria'
import {
  ANCHO_DEL_RELEVO,
  anchoDeLaCaptura,
  avanceDelNacimiento,
  avanceObjetivo,
  opacidadDelRotulo,
  perseguir,
  transformDeLaCaptura,
  transformDelRotulo,
} from './tunel'

/**
 * EL TÚNEL — la mitad que toca el DOM. **[PORTFOLIO]**
 *
 * El modelo puro vive en `tunel.ts` §2 y los lugares y los tiempos en
 * `geometria.ts`. Acá está lo mínimo que escribe en el navegador: cero `setState`
 * por cuadro, cada captura es un `style.setProperty` sobre un `ref`.
 *
 * ── ⚠️ ÉSTE ES EL ÚNICO TRAMO DEL SITIO QUE NO CUELGA DEL SCROLL ─────────
 *
 * Todo lo demás de `/v3` dibuja una función pura del progreso: mismo scroll,
 * mismo cuadro. Acá no. El scroll mueve un OBJETIVO y lo que se dibuja lo
 * persigue con retraso, así que **el mismo scroll puede dar dos cuadros
 * distintos** según de dónde venga y cuánto tiempo haya pasado. Ésa es
 * exactamente la sensación que el tramo viene a producir —soltás y la imagen
 * sigue metiéndose— y por eso el lazo es de `requestAnimationFrame` y no una
 * suscripción al `MotionValue`: un valor que cambia con el TIEMPO necesita que
 * alguien mire el reloj aunque el scroll esté quieto.
 *
 * La consecuencia práctica, escrita para el que venga a medir: **una captura
 * hecha justo después de mover el scroll no muestra el estado final.** Hay que
 * esperar a que la persecución se asiente —`ASENTAMIENTO_DEL_TUNEL_MS`— o se mide
 * el instrumento en vez del sitio.
 *
 * ── ⚠️ EL LAZO SE APAGA FUERA DE PANTALLA, Y AL VOLVER NO ANIMA ──────────
 *
 * Un `IntersectionObserver` sobre el panel prende y apaga el lazo, que es la
 * regla de rendimiento del repo. Al apagarlo el avance se lleva **de un salto**
 * al objetivo: si no, al volver a entrar se vería correr tres segundos de
 * persecución hacia un estado que ya debería estar puesto.
 *
 * ── ⚠️ TODO CRECE DESDE EL CENTRO, y el centrado está en el `transform` ──
 *
 * Cada captura se posiciona en el medio del cuadro y su `transform` lleva
 * `translate(-50%, -50%)` antes de la escala. Los porcentajes de `translate` se
 * miden sobre la caja SIN escalar, así que el centro de la imagen cae en el
 * centro del cuadro valga su escala lo que valga. No hay un `transform-origin`
 * que mantener sincronizado con nada.
 */

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/** Escala cero: no pinta un píxel, no recibe un clic, y sigue siendo parada. */
const ESCONDIDO = 'scale(0)'

/**
 * ⚠️ **EL RECORTE DEL TÚNEL — `clip` con margen, y las dos mitades son medidas.**
 *
 * **Por qué hay que recortar:** la primera captura llega a 1,64 anchos de cuadro
 * y, centrada sobre 1.440, su borde derecho cae en 1.898 px. Sin recorte eso no
 * queda en la sección: `document.scrollWidth` pasaba de 1.440 a **1.899** y el
 * sitio entero ganaba una barra de scroll HORIZONTAL a mitad del tramo.
 *
 * **Por qué NO es `overflow: hidden`:** adentro del túnel viven seis anclas, y el
 * anillo de foco del sistema se dibuja con desplazamiento POSITIVO —`2px`—, o
 * sea por FUERA del elemento. Un ancestro con `hidden` se lo come entero y la
 * parada de teclado queda sin señal visible. Lo dice el invariante de la
 * compacta con todas las letras, y tiene razón: acá se probó y lo marcó en rojo.
 *
 * **La salida:** `overflow: clip` recorta igual pero no crea un contenedor de
 * scroll, y `overflow-clip-margin` le deja pintar unos píxeles POR AFUERA.
 *
 * ⚠️ **El margen va en píxeles a mano y NO como `calc()` de los tokens, y eso se
 * midió:** escrito como `calc(var(--foco-desplazamiento) + var(--foco-grosor))`
 * —que es la misma suma que `navegacion.css` ya hace para esta misma razón— el
 * navegador lo computa en **0px**, o sea que no recorta con margen ninguno y el
 * anillo se pierde igual; con una longitud directa computa lo que dice. Blink no
 * acepta `calc()` en esta propiedad. La suma queda derivada igual, pero del otro
 * lado: `s5-trabajos` §17 lee los dos tokens del tema y afirma que dan esto.
 *
 * ⚠️ **Lo que el margen deja sin cerrar, dicho con su número.** El margen también
 * es desborde: con él puesto, `document.scrollWidth` mide **1.444** contra 1.440
 * de ventana. Son 4 px de scroll horizontal contra los **459** que había sin
 * recortar —115 veces menos— y es el precio de que el anillo de foco exista. Las
 * dos perillas para llevarlo a cero están a la vista y ninguna es gratis: bajar
 * el margen a cero se come el anillo, y recortar un nivel más arriba mete a la
 * sección entera en una caja recortada.
 */
const MARGEN_DEL_RECORTE_PX = 4

const RECORTE_DEL_TUNEL = {
  overflow: 'clip',
  overflowClipMargin: `${MARGEN_DEL_RECORTE_PX}px`,
} as const

/** Las tres, en el orden en que entran. El índice ES su lugar en el túnel. */
const CAPTURAS: readonly ProyectoDeContenido[] = CONTENIDO.proyectos

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
  const avance = useRef(0)

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

  /**
   * Escribe el cuadro entero desde un avance. Es lo único que toca el DOM.
   *
   * ⚠️ **ESCONDE CON `scale(0)` Y NO CON `visibility` — y es una corrección de
   * accesibilidad, no un gusto.** Con `visibility: hidden` sobre la caja de una
   * captura, sus dos anclas salen del foco secuencial: el navegador no le da Tab
   * a lo que no se renderiza. Como arriba de 1025 la lista no existe, el
   * resultado medido era que **los tres enlaces a los sitios de los clientes no
   * se podían alcanzar con el teclado** —el foco saltaba de Quiénes somos a
   * Servicios—, mientras `s10-acceso` afirmaba que el recorrido no cambia con el
   * ancho. Un elemento en `scale(0)` no pinta un píxel, no recibe un clic —su
   * caja mide cero— y **sigue siendo una parada**. Lo que lo hace visible cuando
   * le toca el turno es el piso de abajo.
   */
  const pintar = useCallback((cuanto: number): void => {
    for (let i = 0; i < CAPTURAS.length; i += 1) {
      const caja = capturas.current[i]
      const rotulo = rotulos.current[i]
      const ancho = anchoDeLaCaptura(i, cuanto)
      if (caja !== null && caja !== undefined) {
        caja.style.setProperty('transform', transformDeLaCaptura(ancho ?? 0))
      }
      if (rotulo === null || rotulo === undefined) continue
      const cuantoSeVe = ancho === null ? 0 : opacidadDelRotulo(ancho)
      rotulo.style.setProperty('opacity', cuantoSeVe.toFixed(3))
      rotulo.style.setProperty('transform', cuantoSeVe <= 0 || ancho === null ? ESCONDIDO : transformDelRotulo(ancho))
    }
  }, [])

  useEffect(() => {
    const caja = contenedor.current
    const panel = caja?.closest('[data-panel]') ?? null
    if (caja === null || panel === null) return

    let cuadro = 0
    let anterior = 0

    /**
     * ⚠️ **EL PISO DEL FOCO — la otra mitad de la corrección de arriba.**
     *
     * Una parada de teclado que no se ve no sirve de nada. Mientras el foco esté
     * adentro de una captura, el avance no puede bajar del que la deja en el
     * tamaño del relevo, que es donde el rótulo se lee: tabular hasta un trabajo
     * LO MUESTRA. El resto lo pone el navegador solo —al dar foco a algo, hace
     * scroll para traerlo al cuadro, y eso arranca el lazo—.
     *
     * Al salir el foco, el piso desaparece y la persecución vuelve sola al
     * scroll, con su mismo retraso. No hay un modo nuevo: hay un mínimo.
     */
    let enfocada: number | null = null

    const pisoDelFoco = (): number =>
      enfocada === null ? 0 : avanceDelNacimiento(enfocada) + ANCHO_DEL_RELEVO

    const objetivoDeAhora = (): number =>
      Math.max(avanceObjetivo(progreso.get(), VENTANA_DEL_TUNEL, CAPTURAS.length), pisoDelFoco())

    const alEntrarElFoco = (e: FocusEvent): void => {
      const dueña = (e.target as HTMLElement | null)?.closest('[data-captura]') ?? null
      const indice = dueña === null ? -1 : CAPTURAS.findIndex((c) => c.nombre === dueña.getAttribute('data-captura'))
      enfocada = indice < 0 ? null : indice
      // ⚠️ El piso se toma de UN SALTO y no persiguiéndolo. Medido: con la
      // persecución puesta, a los 340 ms de tabular la captura enfocada iba por
      // 190 px de los 922 que le tocan, y llegar tardaba los tres segundos
      // enteros. Un foco que aparece de a poco no es un foco: se muestra ya. Al
      // salir sí vale la persecución, porque ahí nadie está esperando nada.
      const piso = pisoDelFoco()
      if (avance.current < piso) {
        avance.current = piso
        pintar(avance.current)
      }
    }
    const alSalirElFoco = (): void => {
      enfocada = null
    }

    const paso = (ahora: number): void => {
      const dt = anterior === 0 ? 0 : ahora - anterior
      anterior = ahora
      avance.current = perseguir(avance.current, objetivoDeAhora(), dt)
      pintar(avance.current)
      cuadro = requestAnimationFrame(paso)
    }

    /**
     * ⚠️ **SIEMBRA EL AVANCE, y por la misma razón por la que `frenar` lo hace.**
     *
     * El lazo puede empezar con la sección YA a la vista: la compuerta de 1025
     * vuelve a montar este componente entero al cruzar el umbral con un zoom del
     * navegador o al dar vuelta `prefers-reduced-motion`, y ahí el observador
     * entrega `isIntersecting: true` de una. Sin sembrar, `avance` arranca en 0
     * contra un objetivo que puede valer 1,64: la pantalla queda vacía un cuadro
     * y después el túnel entero se vuelve a dibujar desde cero durante tres
     * segundos, sin que nadie haya scrolleado. Bajando normalmente esto no hace
     * nada —el panel empieza a intersecar mucho antes de la ventana del túnel,
     * donde el objetivo es cero—, que es lo que lo hace seguro.
     */
    const arrancar = (): void => {
      if (cuadro !== 0) return
      anterior = 0
      avance.current = objetivoDeAhora()
      pintar(avance.current)
      cuadro = requestAnimationFrame(paso)
    }

    /** Frena el lazo y deja el avance DONDE CORRESPONDE, sin animar la vuelta. */
    const frenar = (): void => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
      avance.current = objetivoDeAhora()
      pintar(avance.current)
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
   * El primer cuadro sale del servidor con el avance en cero: la sección está a
   * tres pantallas de la carga y nadie la ve, así que no hace falta adivinar un
   * progreso. Lo que sí hace falta es que las tres nazcan en cero y no a tamaño
   * completo, que es lo que se vería por un cuadro sin esto — y que nazcan en
   * ESCALA cero y no escondidas, por lo que dice el docblock de `pintar`.
   */
  const estiloInicial = (indice: number): React.CSSProperties => {
    const medida = medidaDe(indice)
    return {
      aspectRatio: `${medida.ancho} / ${medida.alto}`,
      transform: transformDeLaCaptura(0),
    }
  }

  return (
    // ⚠️ SIN `aria-hidden`: las tres capturas son CONTENIDO —los trabajos que
    // esta sección viene a mostrar— y `s10-acceso` compara el texto anunciado de
    // las dos ramas carácter por carácter.
    <div ref={contenedor} data-pieza="tunel" className={className} style={RECORTE_DEL_TUNEL}>
      {CAPTURAS.map((proyecto, i) => (
        <div
          key={proyecto.nombre}
          ref={montarCaptura(i)}
          data-captura={proyecto.nombre}
          className="absolute top-1/2 left-1/2 w-full will-change-transform"
          style={estiloInicial(i)}
        >
          {/* ⚠️ **EL RÓTULO VA PRIMERO EN EL MARCADO, y no es cosmético.** La rama
              quieta anuncia nombre → rubro → imagen, y `s10-acceso` compara el texto
              anunciado de las dos ramas; con el rótulo después del ancla, arriba de
              1025 se anunciaba imagen → nombre → rubro. El orden de PINTURA no se
              pierde: el rótulo es `absolute` y lo posicionado pinta arriba de lo que
              está en flujo, venga antes o después. */}
          {/* El rótulo viaja pegado a la esquina de abajo a la izquierda de SU
              captura y deshace su escala, así que no cambia de tamaño mientras la
              imagen crece. Se ve sólo en la banda declarada en `tunel.ts`.

              ⚠️ **Va sobre el papel de la sección y no suelto sobre la imagen.**
              Medido: sobre la captura de Banú —oscura— el texto se leía, y sobre
              la de Esquina —una página blanca— desaparecía. Una captura es una
              superficie que no controlamos, así que el rótulo trae la suya: el
              par tinta/fondo del tema, que es el único contraste que esta sección
              puede prometer en las tres. */}
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
              entera con eventos taparía el scroll de la sección, y la capa entera
              sin ellos —como estaba— deja el ancla INERTE al clic aunque tome
              foco. Una captura visible se puede clickear; el aire, no. */}
          <a
            href={proyecto.enlace}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={proyecto.pagina.alt}
            data-pieza="enlace-de-proyecto"
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
    </div>
  )
}

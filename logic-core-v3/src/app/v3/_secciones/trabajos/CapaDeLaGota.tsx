'use client'

import { useEffect, useRef } from 'react'

import { NOCHE_DISPARADA } from '../../_lib/escena/nocheDisparada'
import { useMovimientoReducido } from '../../_lib/motion/reducido'

import { DISPARO_DE_LA_NOCHE } from './geometria'
import {
  DURACION_DEL_BARRIDO,
  cantidadDeLaNoche,
  estadoDeLaVuelta,
  estadoDelBarrido,
  maskDelBarrido,
} from './gota'

/**
 * LA CAPA DEL BARRIDO — el gatillo y la banda que cruza. **[B12 · PORTFOLIO]**
 *
 * ⚠ **El archivo se llama `CapaDeLaGota.tsx` y no `Gota.tsx`, y no es un
 * capricho:** al lado vive `gota.ts` —el núcleo puro— y en un checkout
 * case-insensitive (Windows) dos módulos del mismo directorio que difieren sólo
 * en la caja se resuelven al azar y la sección se rompe **en silencio**.
 *
 * ── ⚠️ EL COLOR SE ESCRIBE EN UN SOLO LUGAR, Y ES EL LAZO ────────────────
 *
 * `NOCHE_DISPARADA.cantidad` se escribe **únicamente adentro de `pintar`**, con
 * el número que el propio barrido devuelve para ese cuadro. Ningún observador la
 * toca. Ése era el segundo defecto: el observador prendía la noche y la
 * animación corría al lado, así que con el scroll rápido se veía el resultado sin
 * el gesto —clara, negro pleno, clara otra vez—. Ahora **el color no puede
 * moverse sin que el reloj avance**, en ninguna de las dos direcciones.
 *
 * Los extremos tampoco son literales: salen de `cantidadDeLaNoche(0)` y
 * `cantidadDeLaNoche(1)`, o sea de la misma función.
 *
 * ── ⚠️ CAMBIAR DE DIRECCIÓN NO REINICIA: ESPEJA EL RELOJ ─────────────────
 *
 * Si el scroll se da vuelta a mitad del barrido, `arrancar` no pone el reloj en
 * cero: lo espeja —`inicio = ahora − (DURACION − ms)`— de modo que el primer
 * cuadro de la vuelta es exactamente el mismo que el último de la ida. Sin eso,
 * darse vuelta a mitad de camino haría saltar la banda al otro extremo del
 * cuadro y el color con ella, que es la misma familia de defecto.
 *
 * ── POR QUÉ NO RECIBE EL PROGRESO DEL BLOQUE ─────────────────────────────
 *
 * Porque el barrido corre por TIEMPO y porque tiene que valer abajo de 1025,
 * donde no hay coreografía. Se monta como hermano del bloque —fuera de las dos
 * ramas, así que `s7-arboles` §4 sigue valiendo— y mide el scroll con dos
 * `IntersectionObserver` sobre la sección, alcanzada por `closest('[data-panel]')`.
 *
 * ── UNA SOLA CAJA, Y ES `fixed` ──────────────────────────────────────────
 *
 * La banda cruza el CUADRO: un `absolute` sobre una sección de tres pantallas la
 * mediría contra 2.700 px en vez de contra el alto de la ventana. Vive 760 ms y
 * después se esconde.
 */
export function CapaDeLaGota({ className }: { readonly className?: string }): React.JSX.Element {
  const banda = useRef<HTMLDivElement | null>(null)
  const reducido = useMovimientoReducido()

  useEffect(() => {
    const capa = banda.current
    const caja = capa?.closest('[data-panel]') ?? null
    if (caja === null || capa === null) return

    // Con movimiento reducido la sala se invierte igual, pero sin banda: el gesto
    // es decorativo y el contraste del texto no lo es. El número sigue saliendo
    // de `cantidadDeLaNoche`, así que tampoco acá hay un color escrito a mano.
    if (reducido) {
      const soloNoche = new IntersectionObserver(
        ([e]) => {
          NOCHE_DISPARADA.cantidad = cantidadDeLaNoche(e.isIntersecting ? 1 : 0)
        },
        { rootMargin: `0px 0px ${DISPARO_DE_LA_NOCHE.ida}% 0px` },
      )
      soloNoche.observe(caja)
      return () => {
        soloNoche.disconnect()
        NOCHE_DISPARADA.cantidad = cantidadDeLaNoche(0)
      }
    }

    let sentido: 'ida' | 'vuelta' | null = null
    let inicio = 0
    let cuadro = 0

    const pintar = (): void => {
      if (sentido === null) return
      const ms = performance.now() - inicio
      const estado = sentido === 'ida' ? estadoDelBarrido(ms) : estadoDeLaVuelta(ms)
      if (estado === null) {
        // Cruzó entero. El color queda en el extremo que corresponde y la banda
        // se va: de acá en adelante lo único oscuro en pantalla es la escena.
        NOCHE_DISPARADA.cantidad = cantidadDeLaNoche(sentido === 'ida' ? 1 : 0)
        capa.style.setProperty('visibility', 'hidden')
        sentido = null
        cuadro = 0
        return
      }
      NOCHE_DISPARADA.cantidad = estado.noche
      capa.style.setProperty('visibility', 'visible')
      capa.style.setProperty('opacity', String(estado.opacidad))
      capa.style.setProperty('mask-image', estado.mask)
      capa.style.setProperty('-webkit-mask-image', estado.mask)
      cuadro = requestAnimationFrame(pintar)
    }

    const arrancar = (haciaDonde: 'ida' | 'vuelta'): void => {
      if (sentido === haciaDonde) return
      const ahora = performance.now()
      if (sentido === null) {
        inicio = ahora
      } else {
        const ms = Math.min(ahora - inicio, DURACION_DEL_BARRIDO)
        inicio = ahora - (DURACION_DEL_BARRIDO - ms)
      }
      sentido = haciaDonde
      if (cuadro === 0) cuadro = requestAnimationFrame(pintar)
    }

    /** Corta el reloj y esconde la banda. NO toca el color: sólo el lazo lo escribe. */
    const cortar = (): void => {
      sentido = null
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
      capa.style.setProperty('visibility', 'hidden')
    }

    /**
     * ⚠️ **SALIR POR ARRIBA Y SALIR POR ABAJO NO SON LO MISMO, y el observador
     * sólo dice «ya no».** La sección deja de cruzar la línea en los dos
     * extremos: subiendo —y ahí la noche tiene que volver, con su barrido— y
     * bajando, cuando Trabajos ya pasó. Los separa la caja que el evento trae: si
     * el pie de la sección todavía está debajo del tope del cuadro, quedó abajo.
     */
    const salioPorArriba = (e: IntersectionObserverEntry): boolean => e.boundingClientRect.bottom > 0

    const laIda = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) arrancar('ida')
        else if (!salioPorArriba(e)) {
          /**
           * ⚠️ **Trabajos quedó arriba: se suelta sin gesto, Y ES VISIBLE QUE NO
           * SE VE.** Acá sí hay un cambio de color sin barrido, y está acotado por
           * un hecho de la tabla: la sección que llena el cuadro en ese instante es
           * Servicios, y Servicios es `papel-opaco` (`secciones.ts`) — el canvas no
           * se ve. Correr la vuelta en cambio pintaría una banda negra encima de
           * Servicios, que sí se vería. Soltar es lo invisible de las dos.
           */
          NOCHE_DISPARADA.cantidad = cantidadDeLaNoche(0)
          cortar()
        }
      },
      { rootMargin: `0px 0px ${DISPARO_DE_LA_NOCHE.ida}% 0px` },
    )

    /**
     * ⚠️ **LA VUELTA NO PUEDE CORRER SI NO HUBO IDA — y acá estaba el salto.**
     *
     * `salioPorArriba` mira si el pie de la sección sigue debajo del tope del
     * cuadro, y eso es cierto en DOS situaciones que no se parecen en nada:
     * cuando volvimos para arriba después de haber cruzado, y **cuando todavía no
     * llegamos**. Al cargar la página estamos en la segunda: el observador se
     * dispara en su primer cuadro con `isIntersecting: false`, y sin esta guarda
     * arrancaba la vuelta ahí mismo. Eso es lo que se veía —la banda apareciendo
     * arriba a la izquierda, que es donde la vuelta EMPIEZA, y barriendo hasta
     * abajo a la derecha— al abrir el sitio, sin que nadie hubiera cruzado nada.
     *
     * La guarda es la pregunta correcta: **¿hay noche que devolver?** La hay si
     * la ida está corriendo o si ya dejó algo de cantidad puesta.
     */
    const hayNocheQueDevolver = (): boolean => sentido === 'ida' || NOCHE_DISPARADA.cantidad > 0

    const laVuelta = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && salioPorArriba(e) && hayNocheQueDevolver()) arrancar('vuelta')
      },
      { rootMargin: `0px 0px ${DISPARO_DE_LA_NOCHE.vuelta}% 0px` },
    )

    laIda.observe(caja)
    laVuelta.observe(caja)

    return () => {
      laIda.disconnect()
      laVuelta.disconnect()
      cortar()
      NOCHE_DISPARADA.cantidad = cantidadDeLaNoche(0)
    }
  }, [reducido])

  return (
    <div
      ref={banda}
      data-pieza="gota"
      aria-hidden="true"
      className={className}
      /* ⚠️ **EL REPOSO SE RESUELVE EN EL PRIMER RENDER, sin medir nada.** La
         máscara sale de `maskDelBarrido(0)`, que es la banda ENTERA afuera del
         cuadro por su esquina de partida —abajo a la derecha—: su pluma de
         adelante toca el 0 % justo. Así, aunque algo la muestre antes de que el
         lazo escriba el primer cuadro, lo que aparece está donde el barrido
         empieza y no en la otra punta. `visibility: hidden` es el cinturón; esto
         es el tirante. */
      style={{ opacity: 1, visibility: 'hidden', maskImage: maskDelBarrido(0), WebkitMaskImage: maskDelBarrido(0) }}
    />
  )
}

'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useId } from 'react'

import { LOGO_INK_VIEWBOX_ATTR, LOGO_PATH_D } from '@/components/ui/LogoMark'

import { STROKE_WIDTH_VB, strokeOpacityForFill } from './introSilhouette'

/**
 * EL TRAZO Y EL RELLENO — la marca plana del preloader.
 *
 * ── El gesto, no la implementación ─────────────────────────────────────────
 *
 * Recupera el trazo del preloader clásico de `main` (`ui/LogoStrokeOverlay.tsx`,
 * que sigue vivo en Route B y no se toca), más corto y más limpio. El mecanismo
 * del dibujado sí se hereda porque es el correcto y es el que manda
 * `CLAUDE.md`: `pathLength="1"` NATIVO + `strokeDasharray` + un
 * `strokeDashoffset` que baja de 1 a 0. Nunca la `pathLength` de Framer, que en
 * un path de esta complejidad es cara.
 *
 * El path es un solo subpath cerrado (`LogoMark.tsx`): una pasada de lápiz
 * continua, sin saltos.
 *
 * ── ⚠ El contorno va CLIPEADO contra la propia silueta ─────────────────────
 *
 * Un `stroke` de SVG se pinta centrado sobre el borde, así que la mitad de su
 * ancho cae por fuera de lo que el `fill` cubre — y al apagarse el contorno la
 * silueta se achicaba esa mitad, de golpe. **El clip recorta la parte de
 * afuera**, así que el trazo vive enteramente adentro de la silueta final y
 * apagarlo no cambia un solo píxel.
 *
 * Es el `stroke-alignment: inner` que ningún navegador implementa, hecho a mano:
 * ancho declarado al doble, recortado contra el mismo path, queda el interior.
 * La derivación completa —y por qué ésta es la única alternativa que no obliga a
 * mover el mesh 3D— está en `introSilhouette.ts`.
 *
 * Por eso tampoco hace falta ya `overflow: visible`: no hay nada que pintar
 * fuera de la caja.
 *
 * ── El `viewBox` es la caja de la TINTA, no el cuadrado de 1024 ────────────
 *
 * Es lo que hace posible el relevo por el mesh: con el viewBox recortado a la
 * tinta, el path llena el elemento y el elemento ES la caja de la tinta. El mesh
 * se escala a esa misma caja y las dos siluetas coinciden. Con el cuadrado de
 * 1024 habría que arrastrar además el desvío de 33 unidades del centro de la
 * tinta.
 *
 * ── El relleno no es el corte ──────────────────────────────────────────────
 *
 * El contorno se completa, la tinta lo llena, y la transformación de color llega
 * después, sobre un logo ya sólido.
 */

type IntroLogoStrokeProps = {
  /** 0 → 1: cuánto lleva dibujado el contorno. */
  strokeDraw: MotionValue<number>
  /** 0 → 1: cuánto lleva rellenado. */
  fill: MotionValue<number>
  /** Opacidad de la capa: baja mientras el mesh sube, durante el relevo. */
  opacity: MotionValue<number>
}

export function IntroLogoStroke({ strokeDraw, fill, opacity }: IntroLogoStrokeProps) {
  const dashoffset = useTransform(strokeDraw, (drawn) => 1 - drawn)
  const strokeOpacity = useTransform(fill, strokeOpacityForFill)
  // `useId` es estable entre server y cliente. Se sanea porque su formato lleva
  // caracteres que no son válidos en un id de SVG.
  const clipId = `intro-ink-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <motion.svg
      viewBox={LOGO_INK_VIEWBOX_ATTR}
      className="h-full w-full"
      style={{ opacity }}
      role="presentation"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        {/*
          LA SILUETA, como recorte. Es el MISMO `d` que el relleno: por eso lo
          que el trazo pinta no puede salirse ni un píxel de lo que el relleno
          cubre, y apagarlo no cambia la forma.
        */}
        <clipPath id={clipId}>
          <path d={LOGO_PATH_D} />
        </clipPath>
      </defs>

      {/*
        El relleno. Los atributos `fillOpacity`/`strokeDashoffset` estáticos no
        son redundantes con el `style`: son lo que garantiza que el PRIMER PAINT
        —server, antes de hidratar— no muestre la marca ya dibujada ni ya sólida.
      */}
      <motion.path
        d={LOGO_PATH_D}
        fill="currentColor"
        fillOpacity={0}
        style={{ fillOpacity: fill }}
      />

      <g clipPath={`url(#${clipId})`}>
        <motion.path
          d={LOGO_PATH_D}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH_VB}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1}
          style={{ strokeDashoffset: dashoffset, strokeOpacity }}
        />
      </g>
    </motion.svg>
  )
}

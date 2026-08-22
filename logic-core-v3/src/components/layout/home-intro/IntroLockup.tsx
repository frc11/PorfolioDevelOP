'use client'

import { motion, type MotionValue } from 'motion/react'

import { IntroLogoStroke } from './IntroLogoStroke'
import type { IntroInkSize, IntroLockupText } from './introFlight'

/**
 * EL LOCKUP — "develOP" arriba, la marca al medio, el slogan abajo.
 *
 * El orden lo pide la secuencia (`DIRECCION-ESCENA.md` §1.1, paso 3): "arriba"
 * y "abajo" solo pueden ser respecto de la marca, que es lo que el trazo dibuja
 * primero y lo único que queda al final.
 *
 * ── La marca es el ancla, y todo se mide contra ella ───────────────────────
 *
 * Lo que se centra en la pantalla es **la marca**, no la columna, y las dos
 * líneas se posicionan contra sus bordes (`bottom-full` y `top-full`). Y desde
 * S8d **el cuerpo de las dos líneas y su separación salen del alto de la
 * tinta**, no de la ventana: el logo lo fija la escena, así que si el texto se
 * dimensionara aparte las proporciones internas del lockup cambiarían con la
 * resolución.
 *
 * Las clases del sistema se conservan y solo se pisa el `font-size`: el
 * interlineado, el peso y el tracking del token son relativos al `em`, así que
 * escalan solos.
 *
 * ── Acá no hay escala ──────────────────────────────────────────────────────
 *
 * El logo no cambia de tamaño en ningún momento de la secuencia (S8d). El único
 * transform que existe es el **desplazamiento** del acomodamiento, y vive sobre
 * la marca sola: el texto ya se fue cuando ese gesto empieza, así que no tiene
 * por qué viajar con ella.
 *
 * ── El texto entra y sale SIN DIRECCIÓN ────────────────────────────────────
 *
 * Solo opacidad. Sin desplazamiento, sin escala propia, sin blur direccional.
 * **Aprobado en S8b y no se toca.** La salida es la misma curva que la entrada.
 */

type IntroLockupProps = {
  /** Tamaño de la tinta. Constante durante toda la secuencia. */
  ink: IntroInkSize
  /** Cuerpos y separación, derivados de ese tamaño. */
  text: IntroLockupText
  wordmarkOpacity: MotionValue<number>
  sloganOpacity: MotionValue<number>
  strokeDraw: MotionValue<number>
  fill: MotionValue<number>
  /** Opacidad del SVG: baja mientras el mesh sube. */
  svgOpacity: MotionValue<number>
  /** El desplazamiento del acomodamiento. No hay ningún otro transform. */
  logoX: MotionValue<number>
  logoY: MotionValue<number>
}

const LINE = 'absolute left-1/2 w-[min(88vw,44rem)] -translate-x-1/2 text-center'

export function IntroLockup({
  ink,
  text,
  wordmarkOpacity,
  sloganOpacity,
  strokeDraw,
  fill,
  svgOpacity,
  logoX,
  logoY,
}: IntroLockupProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative" style={{ width: ink.widthPx, height: ink.heightPx }}>
        <motion.p
          className={`${LINE} bottom-full font-ds-sans text-ds-display-lg will-change-[opacity]`}
          style={{
            opacity: wordmarkOpacity,
            fontSize: text.wordmarkPx,
            marginBottom: text.gapPx,
          }}
        >
          develOP
        </motion.p>

        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ x: logoX, y: logoY }}
        >
          <IntroLogoStroke strokeDraw={strokeDraw} fill={fill} opacity={svgOpacity} />
        </motion.div>

        <motion.p
          className={`${LINE} top-full text-ds-lead will-change-[opacity]`}
          style={{ opacity: sloganOpacity, fontSize: text.sloganPx, marginTop: text.gapPx }}
        >
          Ingeniería para negocios reales
        </motion.p>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

import type { VarianteCta } from '../../_lib/cta'

/**
 * EL CTA DE ROLLOVER DE DOS COPIAS — el componente más usado del sistema.
 *
 * 26 apariciones entre sus dos variantes en la home, la página de estudio y
 * una de caso. La coreografía completa —ángulos, traslaciones, `clip-path`,
 * tiempos— vive en `_estilos/cta.css`, con cada número etiquetado. Acá está
 * la estructura y **la corrección de accesibilidad**.
 *
 * ── Los dos gestos, en una línea cada uno ─────────────────────────────────
 *
 * **El rótulo se desliza y SE QUEDA.** Al entrar, las dos copias se
 * intercambian en 1,3 s; al soltar, el reposo vuelve en UN CUADRO. Y no se ve
 * ningún salto, porque la copia B termina el hover exactamente donde arrancó
 * la copia A. El mecanismo entero es dónde está declarada la duración, y vive
 * en `cta.css`: en la regla de ESTADO y no en la base.
 *
 * **El subrayado se parte y el hueco viaja.** La raya está entera en reposo;
 * al entrar, una capa se retrae hacia la derecha y otra crece desde la
 * izquierda 100 ms más tarde, y el hueco entre las dos abre en el borde
 * izquierdo, llega a la mitad del ancho y se cierra contra el derecho. Las dos
 * capas son el `::before` y el `::after` del mismo `<span>` que ya existía:
 * **el gesto no agrega un solo nodo al marcado**.
 *
 * Los dos gestos están medidos en `docs/rediseno/outputs/BOTON-1.md` y sus
 * números viven en `_lib/cta.ts`, contrastados uno por uno por
 * `s3-cta.invariant.tsx`.
 *
 * ── El defecto de la referencia que no heredamos ──────────────────────────
 *
 * El rollover necesita DOS copias del rótulo en el DOM. En la referencia las
 * dos son visibles para el árbol de accesibilidad, así que un lector de
 * pantalla anuncia el rótulo duplicado y **sin espacio entre las copias**: un
 * CTA de 20 caracteres reporta 40 caracteres y 5 palabras en vez de 3, porque
 * la última palabra de la primera copia y la primera de la segunda quedan
 * pegadas ("…PomeloExplore…").
 *
 * La corrección es una línea: **la segunda copia va `aria-hidden`**. No es un
 * `aria-label` encima —eso taparía el síntoma dejando el árbol sucio— sino
 * sacar del árbol lo que es una copia visual.
 *
 * `s3-cta.invariant.ts` renderiza este componente, calcula el rótulo accesible
 * y afirma que da el rótulo exacto, con su cuenta de palabras. Y corre la
 * MISMA cuenta sobre el mismo marcado sin `aria-hidden`, donde tiene que ver
 * el rótulo duplicado — si no lo viera, la afirmación no mediría nada.
 *
 * ── Dos elementos, nunca anidados ─────────────────────────────────────────
 *
 * La referencia envuelve el `<button>` en un `<a>` (`a|1|button|block`, 6
 * apariciones). Eso es contenido interactivo adentro de un enlace: dos
 * paradas de tabulación para un solo control y comportamiento indefinido al
 * activar. Acá son dos componentes separados —`Cta` emite `<button>`,
 * `CtaEnlace` emite `<a>`— y nunca uno adentro del otro.
 *
 * ── El foco hace lo mismo que el puntero ──────────────────────────────────
 *
 * En la referencia el rollover **no se dispara con Tab**. Acá sí: las reglas
 * de `cta.css` nombran `:hover` y `:focus-visible` juntos. El anillo del
 * sistema lo pone la regla global de `theme-develop.css` sobre el `<button>`,
 * que no está recortado — la ventana con `overflow: hidden` es un `<span>`
 * interno y no es focalizable.
 */

/** Estados que la galería de `/v3/componentes` puede forzar sin un puntero. */
export type EstadoForzado = 'hover' | 'foco'

/**
 * EL REGISTRO TIPOGRÁFICO del rótulo. NO es una variante.
 *
 * `VarianteCta` son las DOS formas MEDIDAS en la referencia (`inline-block`,
 * 17 ejemplares · `block`, 9) y esa tabla no se contamina con una decisión
 * nuestra: agregarle una tercera entrada volvería una medición en una mezcla.
 * El registro es otro eje —qué tipografía lleva el rótulo— y viaja por su
 * propio atributo, así que las dos variantes medidas siguen siendo dos.
 *
 *   `cuerpo`  el medido: `--text-cuerpo` 15 px, `--tracking-texto`, peso semi.
 *             De ahí sale el alto de reposo de la ventana (15 × 1,6 = 24 px).
 *   `rotulo`  mayúsculas y `--tracking-micro`, el único interletrado positivo
 *             del sistema. Es el registro con el que el CTA del hero deja de
 *             parecer un enlace de párrafo y pasa a ser un pie de bloque.
 *
 * ⚠ **`rotulo` ya NO bifurca el subrayado, y eso es nuevo.** Hasta BOTON-1
 * este registro era además el único con la regla horizontal visible en reposo,
 * y para lograrlo APAGABA la animación del subrayado: una raya ya entera no
 * tenía a dónde crecer. El gesto de dos capas dejó esa excepción sin motivo,
 * porque **necesita** la raya entera en reposo para poder partirla. La raya en
 * reposo pasó a ser del componente y los dos ejemplares —el hero y el Cierre—
 * hacen hoy exactamente la misma coreografía, como los 26 de la referencia.
 *
 * 🔴 La consecuencia de composición, que hay que mirar: el CTA del Cierre, en
 * registro `cuerpo`, antes no mostraba raya en reposo y ahora sí. Está
 * desarrollado al pie de `cta.css`, con la regla que lo revierte.
 */
export type RegistroDeCta = 'cuerpo' | 'rotulo'

interface CtaComun {
  readonly rotulo: string
  readonly variante?: VarianteCta
  /** El registro tipográfico. Por defecto el medido. */
  readonly registro?: RegistroDeCta
  readonly forzado?: EstadoForzado
  readonly className?: string
}

export interface CtaProps extends CtaComun {
  readonly deshabilitado?: boolean
  readonly type?: 'button' | 'submit'
}

export function Cta({
  rotulo,
  variante = 'linea',
  registro = 'cuerpo',
  forzado,
  deshabilitado = false,
  type = 'button',
  className,
}: CtaProps) {
  return (
    <button
      type={type}
      data-pieza="cta"
      data-variante={variante}
      data-registro={registro}
      data-forzado={forzado}
      disabled={deshabilitado}
      className={cn('text-base', className)}
    >
      <ContenidoDelCta rotulo={rotulo} />
    </button>
  )
}

export interface CtaEnlaceProps extends CtaComun {
  readonly href: string
}

export function CtaEnlace({
  href,
  rotulo,
  variante = 'linea',
  registro = 'cuerpo',
  forzado,
  className,
}: CtaEnlaceProps) {
  return (
    <a
      href={href}
      data-pieza="cta"
      data-variante={variante}
      data-registro={registro}
      data-forzado={forzado}
      className={cn('text-base no-underline', className)}
    >
      <ContenidoDelCta rotulo={rotulo} />
    </a>
  )
}

/**
 * Las dos copias y el subrayado.
 *
 * La ventana lleva la tipografía medida del rollover —`text.cuerpo`,
 * `tracking.texto`, peso semi— y no la del botón, que es `text.base`. De ahí
 * sale el alto de reposo: 15px × 1,6 = 24px, la caja de línea exacta.
 *
 * ⚠ El `<span>` del subrayado **no pinta**: es el contenedor posicionado de
 * las dos capas que sí pintan, que son su `::before` y su `::after`. Van como
 * pseudo-elementos y no como dos `<span>` más por peso — este componente viaja
 * adentro de dos componentes de cliente, así que su marcado SÍ cuenta contra el
 * presupuesto de `/v3`, y el gesto entero terminó costando cero bytes de
 * JavaScript. El precio está declarado en `cta.css`: un pseudo-elemento no se
 * puede congelar para fotografiarlo.
 */
function ContenidoDelCta({ rotulo }: { rotulo: string }) {
  return (
    <>
      <span
        data-parte="ventana"
        className="text-cuerpo tracking-texto leading-texto font-semi"
      >
        <span data-parte="copia-a">{rotulo}</span>
        {/* LA CORRECCIÓN. Copia visual, fuera del árbol de accesibilidad. */}
        <span data-parte="copia-b" aria-hidden="true">
          {rotulo}
        </span>
      </span>
      <span data-parte="subrayado" aria-hidden="true" />
    </>
  )
}

import { cn } from '@/lib/utils'

import type { EstadoForzado } from './Cta'

/**
 * LAS PIEZAS DEL PIE — estructura y estados, sin contenido.
 *
 * El pie es el componente más replicado del sitio medido: **la mitad de las
 * instancias de animación son un pie repetido en cada página**. Sus piezas y
 * sus conteos salen del inventario: link con icono (42 apariciones), botón
 * social (21), link de contacto (3), link de texto (12).
 *
 * ── Los iconos entran por prop ────────────────────────────────────────────
 *
 * Ninguna pieza trae un icono adentro. No es una comodidad de API: este sprint
 * no tiene contenido, y un icono elegido acá sería una decisión de contenido
 * disfrazada de componente. Quien use la pieza pasa el suyo.
 *
 * ── El rótulo accesible de un botón que sólo tiene un icono ───────────────
 *
 * `BotonSocialDelPie` no pinta texto —su firma medida es un `<a>` con un solo
 * hijo `<svg>`— así que su nombre accesible tiene que venir de un atributo. Va
 * en `aria-label`, y es obligatorio en el tipo: sin él no compila. Un enlace
 * sin nombre es un enlace que el lector de pantalla anuncia como "enlace".
 */

interface PiezaComun {
  readonly href: string
  readonly forzado?: EstadoForzado
  readonly className?: string
}

/** Link del pie con icono — 42 apariciones. El icono se adelanta en el hover. */
export function EnlaceDelPieConIcono({
  href,
  rotulo,
  icono,
  forzado,
  className,
}: PiezaComun & { readonly rotulo: string; readonly icono: React.ReactNode }) {
  return (
    <a
      href={href}
      data-pieza="pie-enlace-icono"
      data-forzado={forzado}
      className={cn('text-cuerpo tracking-texto leading-texto font-semi', className)}
    >
      <span data-parte="icono" aria-hidden="true">
        {icono}
      </span>
      <span data-parte="rotulo">{rotulo}</span>
    </a>
  )
}

/** Botón social — 21 apariciones. Sólo icono, así que el nombre va aparte. */
export function BotonSocialDelPie({
  href,
  rotulo,
  icono,
  forzado,
  className,
}: PiezaComun & { readonly rotulo: string; readonly icono: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={rotulo}
      data-pieza="pie-social"
      data-forzado={forzado}
      className={cn('text-micro leading-micro tracking-micro font-medio', className)}
    >
      <span data-parte="icono" aria-hidden="true">
        {icono}
      </span>
    </a>
  )
}

/**
 * Link de contacto — `text.titulo-s`, `leading.titulo`, `tracking.texto`,
 * `duracion.rapida` y `ease.principal`. Los cinco medidos.
 * El subrayado barre de izquierda a derecha y va `aria-hidden`: es una raya.
 */
export function EnlaceDeContactoDelPie({
  href,
  rotulo,
  forzado,
  className,
}: PiezaComun & { readonly rotulo: string }) {
  return (
    <a
      href={href}
      data-pieza="pie-contacto"
      data-forzado={forzado}
      className={cn('text-titulo-s leading-titulo tracking-texto font-normal', className)}
    >
      <span data-parte="rotulo">{rotulo}</span>
      <span data-parte="subrayado" aria-hidden="true" />
    </a>
  )
}

/**
 * Link de texto — 12 apariciones, inline dentro de un párrafo.
 *
 * El de la referencia computa 17px, que no es ninguno de los ocho niveles de
 * la escala: es uno de los dos huérfanos del inventario, junto con un radio de
 * 16px. Acá hereda el tamaño de su párrafo, que es lo que un link inline tiene
 * que hacer y lo que evita el huérfano.
 */
export function EnlaceDeTextoDelPie({
  href,
  children,
  forzado,
  className,
}: PiezaComun & { readonly children: React.ReactNode }) {
  return (
    <a href={href} data-pieza="pie-enlace-texto" data-forzado={forzado} className={cn('tracking-texto', className)}>
      {children}
    </a>
  )
}

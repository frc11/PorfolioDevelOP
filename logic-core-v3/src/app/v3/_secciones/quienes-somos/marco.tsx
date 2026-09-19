'use client'

import { cn } from '@/lib/utils'

import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'

/**
 * EL MARCO DE DOS TOMAS — la seria en reposo, la descontracturada en el hover.
 *
 * Salió de `QuienesSomos.tsx` cuando ese archivo pasó las 300 líneas de código: el
 * mismo corte que Trabajos y el Hero ya tienen. Y el corte es por TEMA y no por
 * tamaño: allá vive la composición de la sección —qué va arriba de qué, y con qué
 * ancho—, y acá una pieza con su propio gesto, que no sabe en qué sección está.
 *
 * ── Qué hace ──────────────────────────────────────────────────────────────
 *
 * La suelta **crece desde el centro** con `clip-path: inset(50%) → inset(0)`: en
 * rectángulo, sin escalar la imagen, así que no se deforma ni pierde nitidez. El
 * velo es un degradado desde abajo y no un velo parejo: parejo ensucia la foto
 * entera, y lo único que hace falta oscurecer es donde se apoya el texto.
 *
 * ⚠️ Las dos tomas comparten el MISMO archivo —el rayado claro de
 * `/placeholders/equipo.png`— así que sin distinción el intercambio era invisible
 * aunque funcionara. `invert` (filtro, no un archivo nuevo) le da vuelta el rayado
 * y el texto de la suelta: mismo marco, mismo `MarcoDeMedio`, tono opuesto.
 *
 * ⚠ Abajo de 1025 no hay hover y no hay velo: la descripción sale SIEMPRE, debajo
 * de la foto, en su propio párrafo, y eso lo arma la sección. Arriba de 1025 ese
 * párrafo pasa a `sr-only` — la descripción nunca depende del puntero para llegar
 * a quien lee. Las gemelas de foco viajan porque la regla del lane es que ninguna
 * clase de estado viaje sola; hoy no hay nada focalizable acá y no disparan.
 */

/** Una toma: el marcador que se pide y la leyenda que la distingue de su gemela. */
export interface Toma {
  readonly marcador: (typeof CONTENIDO.equipo.seria)['marcador'] | (typeof CONTENIDO.equipo.suelta)['marcador']
  readonly leyenda: string
}

/**
 * LOS VALORES A MEDIDA DEL MARCO, COMO PROPIEDADES Y NO COMO LITERALES.
 *
 * `s5-tokens` §T4 admite UNA sola forma de valor arbitrario: `var(--token)`. El velo
 * y la propiedad que transiciona no pueden ser tokens del sistema —son la forma de
 * un gesto, no una escala—, así que viajan como propiedades de alcance de componente,
 * el mismo mecanismo que el CTA usa para sus ángulos medidos. El velo se compone con
 * `--color-tinta`: ni un color escrito a mano.
 */
const ESTILO_DEL_MARCO = {
  '--marco-oculto': '0',
  '--marco-propiedad': 'clip-path',
  '--revelado-interlineado': '1.25',
  '--marco-acercamiento': '1.06',
  '--marco-velo':
    'linear-gradient(to top, color-mix(in srgb, var(--color-tinta) 85%, transparent), color-mix(in srgb, var(--color-tinta) 40%, transparent) 50%, transparent)',
} as React.CSSProperties

/**
 * EL REVELADO — UNA sola parte, que sube desde una línea invisible en su base.
 *
 * Es el mismo gesto que `LineasDeTexto` hace por línea: `overflow-hidden` afuera y el
 * texto adentro, corrido una altura de sí mismo. La base RECORTA, así que el texto no
 * se ve venir desde afuera del marco — aparece desde su propio renglón.
 *
 * El truco de los tiempos es el del CTA y no una animación nueva: **la transición de
 * la ENTRADA se declara en la regla de estado** —`group-hover`— y la de la SALIDA en
 * la base. Al soltar, la regla de estado deja de aplicar, vuelve la de la base
 * —`--duracion-rapida`— y el texto se va más rápido de lo que entró, a la vez que la
 * imagen se vuelve a achicar.
 */
const REVELADO = {
  ventana: 'block overflow-hidden',
  texto: cn(
    'block translate-y-full',
    // Al SALIR el texto espera a que la imagen vaya por la mitad de su vuelta; al ENTRAR arranca en la mitad de la de ella.
    'transition duration-[var(--duracion-rapida)] ease-[var(--ease-salida)] delay-[calc(var(--duracion-rapida)*0.5)]',
    'escritorio:group-hover:translate-y-0 escritorio:group-hover:duration-[var(--duracion-lenta)] escritorio:group-hover:delay-[calc(var(--duracion-lenta)*0.5)]',
    'escritorio:group-focus-visible:translate-y-0 escritorio:group-focus-visible:duration-[var(--duracion-lenta)] escritorio:group-focus-visible:delay-[calc(var(--duracion-lenta)*0.5)]',
  ),
  rotulo: 'font-codigo text-caption uppercase',
  cuerpo: 'text-fluido-titulo-s leading-[var(--revelado-interlineado)]',
}

/**
 * LA IMAGEN LLENA EL MARCO, Y SE ACERCA AL PASAR EL MOUSE.
 *
 * ⚠️ `Imagen` monta el `<img>` con `h-auto`, así que su alto lo decide el ARCHIVO y no
 * la caja: con un placeholder de 3:2 adentro de un marco de 4:3 quedaba una franja
 * muerta abajo, y el texto del revelado caía ahí en vez de sobre la foto. `object-cover`
 * la hace llenar la caja recortando, que además es lo que va a hacer falta el día que
 * entren fotos reales con encuadres que nadie eligió para este marco.
 *
 * El acercamiento es de la toma SERIA —la que ya estaba— mientras la suelta crece desde
 * el centro. Va con la misma duración de entrada que ella y vuelve con la de salida; el
 * `overflow-hidden` del envoltorio es lo que impide que el 6 % de más desborde el marco.
 */
const ACERCAMIENTO = cn(
  '[&_img]:h-full [&_img]:object-cover',
  'scale-100 transition duration-[var(--duracion-rapida)] ease-[var(--ease-salida)]',
  'escritorio:group-hover:scale-[var(--marco-acercamiento)] escritorio:group-hover:duration-[var(--duracion-lenta)]',
  'escritorio:group-focus-visible:scale-[var(--marco-acercamiento)] escritorio:group-focus-visible:duration-[var(--duracion-lenta)]',
)

export function MarcoDeDosTomas({
  seria,
  suelta,
  texto,
  registro,
  ancho,
  alto,
  sizes,
}: {
  readonly seria: Toma
  readonly suelta: Toma
  /** Lo ÚNICO que aparece en el hover. En los retratos es el puesto; en la foto del equipo, su frase. */
  readonly texto: string
  readonly registro: 'rotulo' | 'cuerpo'
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
}): React.JSX.Element {
  const comun = { fuente: CONTENIDO.equipo.fuente, provisional: true, ancho, alto, sizes }

  return (
    <div data-marco="dos-tomas" className="group relative w-full" style={ESTILO_DEL_MARCO}>
      <span className="block overflow-hidden">
        <MarcoDeMedio marcador={seria.marcador} alt={seria.leyenda} {...comun} className={ACERCAMIENTO} />
      </span>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 [clip-path:inset(50%)]',
          'transition-[var(--marco-propiedad)] duration-[var(--duracion-rapida)] ease-[var(--ease-salida)]',
          'escritorio:group-hover:[clip-path:inset(0%)] escritorio:group-hover:duration-[var(--duracion-lenta)]',
          'escritorio:group-focus-visible:[clip-path:inset(0%)] escritorio:group-focus-visible:duration-[var(--duracion-lenta)]',
        )}
      >
        <MarcoDeMedio
          marcador={suelta.marcador}
          alt={suelta.leyenda}
          {...comun}
          className="h-full invert [&_img]:h-full [&_img]:object-cover"
        />
      </div>

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 hidden opacity-[var(--marco-oculto)] escritorio:flex escritorio:items-end',
          'transition-opacity duration-[var(--duracion-media)] ease-[var(--ease-salida)]',
          'escritorio:group-hover:opacity-100 escritorio:group-focus-visible:opacity-100',
        )}
      >
        <span className="absolute inset-0 bg-[image:var(--marco-velo)]" />
        <div className="text-fondo relative flex w-full flex-col p-[var(--spacing-6)]">
          <p className={REVELADO.ventana}>
            <span className={cn(REVELADO.texto, registro === 'rotulo' ? REVELADO.rotulo : REVELADO.cuerpo)}>
              {texto}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

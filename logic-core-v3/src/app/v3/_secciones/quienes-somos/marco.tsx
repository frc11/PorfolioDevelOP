'use client'

import { useCallback, useState } from 'react'

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
 * ⚠ **EL DISPARADOR SE ELIGE POR CAPACIDAD DE PUNTERO, no por ancho.** Fue clic
 * en los ocho anchos por un sprint, y eso resultó excesivo: un mouse ya tiene hover,
 * que es más rápido que un clic y no deja el estado abierto pegado. La partición
 * correcta no es de ancho —una notebook angosta tiene mouse, un iPad apaisado a
 * 1024 es táctil y no tiene hover— es de `(hover: hover)`, la media feature que
 * pregunta si el dispositivo primario puede posarse sin presionar.
 *
 * Los dos mecanismos conviven en el MISMO marcado:
 *
 *   · `group-hover:` / `group-focus-visible:` — Tailwind 4 ya envuelve `hover:`
 *     en `@media (hover: hover)` (verificado en la hoja servida), así que estas
 *     clases son inertes solas en un dispositivo táctil: no hace falta pedirlo.
 *     El foco por teclado no depende de la capacidad de posarse y por eso no
 *     lleva el mismo resguardo — un teclado funciona igual con mouse o sin él.
 *   · `group-data-[abierto=true]:` — el estado que el `<button>` escribe al
 *     tocar. `banda.css` le apaga `pointer-events` al botón bajo
 *     `(hover: hover)`, así que un clic de mouse nunca llega a escribir el
 *     estado ahí: sin eso, tocar y alejar el mouse habría dejado el revelado
 *     pegado en abierto, que es exactamente el defecto que el hover viejo NO
 *     tenía. El foco por teclado SÍ puede activarlo con Enter en cualquier
 *     dispositivo —es el mismo botón— pero ahí no hace daño: en un dispositivo
 *     con hover el resultado visual es el mismo que ya muestra `:focus-visible`.
 *
 * El EFECTO es uno solo —la misma máscara escalonada— y vive en las clases de
 * abajo; lo único que cambia entre los dos mecanismos es qué lo enciende.
 */

/**
 * 🔴 **EL AVISO DE QUE SE PUEDE TOCAR NO EXISTE, Y ÉSA ES LA CUARTA FORMA.**
 *
 * Hubo tres y ninguna sobrevivió. Fue un punto en una esquina de la imagen —y un
 * punto sobre una foto se lee como parte de la foto—, después un rótulo «TOCÁ LA
 * FOTO» debajo —que decía con palabras lo que el gesto puede decir solo—, y
 * después la foto misma respirando, escala de 1 a 1,02 con el ciclo del sistema.
 *
 * La cuarta es no avisar. El argumento es el mismo que mató al rótulo, llevado
 * hasta el final: **donde se clickea, quien mira se da cuenta solo**. Un aviso
 * permanente para un gesto opcional es ruido que corre siempre para una acción
 * que pasa una vez.
 *
 * Con él se fueron su regla de `banda.css`, sus `@keyframes`, el token
 * `--respiro-ciclo` y el estado `tocado` que existía SÓLO para apagarlo después
 * del primer toque. No queda nada que apagar: el `<button>` sigue estando y sigue
 * siendo la única pieza que anuncia, por ser un botón.
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
  /**
   * ⚠️ **EL ENCADENADO DEL REVELADO, EN UN SOLO LUGAR.** Las TRES ramas del
   * disparador —`group-hover`, `group-focus-visible` y `group-data-[abierto]`—
   * leen estas cuatro propiedades, así que no pueden divergir: cambiar el gesto
   * es cambiar un valor acá, no tres copias que hay que acordarse de sincronizar.
   *
   * Las demoras son la MITAD de lo que tarda la imagen, y por eso se escriben
   * como una fracción de su duración y no como un número suelto: la regla del
   * pedido es «cuando la apertura va por el 50 %, recién ahí arranca el texto»,
   * y escrita así se sigue cumpliendo si mañana la imagen cambia de duración.
   *
   *     entra   500 ms tras 250 de demora  (la imagen abre en 500)
   *     sale    300 ms tras 150 de demora  (la imagen cierra en 300)
   *
   * La salida es más rápida que la entrada a propósito: al soltar, el texto se
   * va antes de que la imagen termine de volver, y eso lee como soltar y no como
   * desarmar.
   */
  '--revelado-entra': 'var(--duracion-lenta)',
  '--revelado-entra-demora': 'calc(var(--duracion-lenta) * 0.5)',
  '--revelado-sale': 'var(--duracion-rapida)',
  '--revelado-sale-demora': 'calc(var(--duracion-rapida) * 0.5)',
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
    // La SALIDA se declara en la base y la ENTRADA en las reglas de estado: al
    // soltar, la regla de estado deja de aplicar y vuelve ésta, que es más corta.
    'transition duration-[var(--revelado-sale)] ease-[var(--ease-salida)] delay-[var(--revelado-sale-demora)]',
    // Hover y foco — Tailwind guarda `hover:` solo bajo `(hover: hover)`.
    'group-hover:translate-y-0 group-hover:duration-[var(--revelado-entra)] group-hover:delay-[var(--revelado-entra-demora)]',
    'group-focus-visible:translate-y-0 group-focus-visible:duration-[var(--revelado-entra)] group-focus-visible:delay-[var(--revelado-entra-demora)]',
    // El estado del toque, para el dispositivo sin hover. MISMOS valores que arriba.
    'group-data-[abierto=true]:translate-y-0 group-data-[abierto=true]:duration-[var(--revelado-entra)] group-data-[abierto=true]:delay-[var(--revelado-entra-demora)]',
  ),
  rotulo: 'font-codigo text-caption uppercase',
  /** Un escalón más abajo que antes (`titulo-s`): el pedido es que se aprecie más la foto y menos el texto encima. */
  cuerpo: 'text-cuerpo leading-[var(--revelado-interlineado)]',
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
  'group-hover:scale-[var(--marco-acercamiento)] group-hover:duration-[var(--duracion-lenta)]',
  'group-focus-visible:scale-[var(--marco-acercamiento)] group-focus-visible:duration-[var(--duracion-lenta)]',
  'group-data-[abierto=true]:scale-[var(--marco-acercamiento)] group-data-[abierto=true]:duration-[var(--duracion-lenta)]',
)

export function MarcoDeDosTomas({
  seria,
  suelta,
  texto,
  registro,
  ancho,
  alto,
  sizes,
  proporcion,
  descripcionYaVisible,
}: {
  readonly seria: Toma
  readonly suelta: Toma
  /** Lo ÚNICO que aparece en el hover. En los retratos es el puesto; en la foto del equipo, su frase. */
  readonly texto: string
  readonly registro: 'rotulo' | 'cuerpo'
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
  /**
   * LA PROPORCIÓN DE LA CAJA, cuando el archivo no alcanza. Opcional y por
   * instancia, porque es un caso y no una regla: la foto del equipo es 3:2
   * apaisada —decisión escrita: son dos personas una al lado de la otra— y a 320
   * eso deja 171 px de alto, 5 menos de los que necesita el texto que revela el
   * toque. Los retratos no la pasan: entran con 53 y 107 px de sobra.
   */
  readonly proporcion?: string
  /**
   * ⚠️ **SÓLO LA VERDAD PARA LA FOTO DEL EQUIPO.** Cuando la descripción de esta
   * instancia YA se lee afuera de la foto —el caso de «Nosotros» en la banda
   * móvil, `sr-only max-movil:not-sr-only`— el mismo texto adentro del revelado
   * es un duplicado y no un refuerzo. Los retratos no lo pasan: su `texto` es el
   * puesto, que sólo existe adentro del revelado en cualquier ancho.
   */
  readonly descripcionYaVisible?: boolean
}): React.JSX.Element {
  const comun = { fuente: CONTENIDO.equipo.fuente, provisional: true, ancho, alto, sizes }
  const [abierto, setAbierto] = useState(false)
  const alternar = useCallback(() => {
    setAbierto((v) => !v)
  }, [])

  return (
    /* El envoltorio existe para que el aviso caiga DEBAJO de la foto y no
       adentro: las dos capas y el botón del marco son `absolute inset-0`, así que
       cualquier cosa que viva en esa caja termina tapada por el velo. */
    <div className="flex w-full flex-col gap-[var(--spacing-2)]">
      <div
        data-marco="dos-tomas"
        data-abierto={abierto ? 'true' : 'false'}
        {...(descripcionYaVisible ? { 'data-descripcion-afuera': '' } : {})}
        className="group relative w-full"
        style={ESTILO_DEL_MARCO}
      >
        <span className={cn('block overflow-hidden', proporcion)}>
          <MarcoDeMedio
            marcador={seria.marcador}
            alt={seria.leyenda}
            {...comun}
            className={cn(ACERCAMIENTO, proporcion === undefined ? undefined : 'h-full')}
          />
        </span>

        <div
          aria-hidden="true"
          data-parte="suelta"
          className={cn(
            'pointer-events-none absolute inset-0 [clip-path:inset(50%)]',
            'transition-[var(--marco-propiedad)] duration-[var(--duracion-rapida)] ease-[var(--ease-salida)]',
            'group-hover:[clip-path:inset(0%)] group-hover:duration-[var(--duracion-lenta)]',
            'group-focus-visible:[clip-path:inset(0%)] group-focus-visible:duration-[var(--duracion-lenta)]',
            'group-data-[abierto=true]:[clip-path:inset(0%)] group-data-[abierto=true]:duration-[var(--duracion-lenta)]',
          )}
        >
          <MarcoDeMedio
            marcador={suelta.marcador}
            alt={suelta.leyenda}
            {...comun}
            className="h-full invert [&_img]:h-full [&_img]:object-cover"
          />
        </div>

        {/* ⚠️ **ESTA CAJA ESTÁ RENDERIZADA SIEMPRE, Y ÉSA ES LA CORRECCIÓN.**
            Estuvo en `hidden` hasta el disparo, y con eso el revelado aparecía de
            golpe en los ocho anchos: **CSS no transiciona un elemento que no
            estaba renderizado el cuadro anterior**, porque no hay estilo «de
            antes» del cual partir. El texto de adentro no viajaba de su base a su
            lugar — se pintaba ya puesto, en el primer cuadro en que existía.

            Medido antes de tocar nada, con rAF cuadro a cuadro: 105 muestras del
            gesto entero y **CERO** con el texto entre sus dos extremos, en 375,
            768 y 1440. Y las otras dos causas quedaron descartadas con la misma
            lectura: el recorte estaba (`overflow: hidden`) y la duración resolvía
            (300 ms con 150 de demora, sin `prefers-reduced-motion`). Estaba todo
            bien declarado; no arrancaba.

            No cambia NADA de lo que se ve en reposo: la caja sigue en
            `opacity: 0`, sigue `pointer-events-none` y sigue `aria-hidden`. Lo
            único que cambia es que existe, que es lo que la transición necesita.
            De paso, el velo pasa a hacer su propio fundido de 400 ms —el que su
            clase ya declaraba y tampoco podía correr—. `items-end` baja a la base
            por el mismo motivo: si entrara con el disparo, el texto arrancaría
            desde otra alineación. */}
        <div
          aria-hidden="true"
          data-parte="revelado"
          className={cn(
            'pointer-events-none absolute inset-0 flex items-end opacity-[var(--marco-oculto)]',
            'transition-opacity duration-[var(--duracion-media)] ease-[var(--ease-salida)]',
            'group-hover:opacity-100',
            'group-focus-visible:opacity-100',
            'group-data-[abierto=true]:opacity-100',
          )}
        >
          <span className="absolute inset-0 bg-[image:var(--marco-velo)]" />
          <div className="text-fondo relative flex w-full flex-col p-[var(--spacing-6)]">
            {/* `data-parte="revelado-texto"` es lo que `banda.css` apaga en la banda
                móvil cuando la descripción YA está afuera de la foto (§2 del pedido):
                el intercambio de imagen y el velo se quedan, sale sólo el texto. */}
            <p className={REVELADO.ventana} data-parte="revelado-texto">
              <span className={cn(REVELADO.texto, registro === 'rotulo' ? REVELADO.rotulo : REVELADO.cuerpo)}>
                {texto}
              </span>
            </p>
          </div>
        </div>

        {/* ⚠️ **EL CONTROL EXISTE EN TODOS LOS ANCHOS, y el hover se fue.** Era hover
            arriba de 1025 y toque abajo: dos disparadores para un gesto, y el de arriba
            no existe en un teléfono ni en una tablet, así que la mitad de la gente veía
            otra cosa. Ahora es UN clic en los ocho anchos, con el mismo revelado
            escalonado, y el teclado entra por donde siempre: es un `<button>`. */}
        <button
          type="button"
          data-toque="marco"
          aria-pressed={abierto}
          onClick={alternar}
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">{texto}</span>
        </button>
      </div>

    </div>
  )
}

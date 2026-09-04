'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Caption, Cuerpo, EtiquetaDeSeccion, Micro } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { sizesPorColumnas } from '../../_lib/imagen'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza, TextoPorLineas } from '../_contrato/canales'
import { MarcoDeMedio } from '../_contrato/medios'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'

/**
 * 02 · QUIÉNES SOMOS — dos pantallas de papel, sin canvas y sin pinneo.
 *
 * `secciones.ts` le da `papel-opaco` y **200svh**, sin `pinneada`, y ninguna de
 * las tres se declara acá. Es el tramo más largo del sitio en el que el canvas
 * NO se ve: la escena vale porque desaparece un rato largo. El corte entre las
 * dos pantallas cae donde **cambia el sujeto** —la agencia primero, las dos
 * personas después— y como no es pinneada, las dos scrollean.
 *
 * ── B1 · LA RESTA. Qué se midió y qué se cambió. [medido] ─────────────────
 *
 * Antes, a 1920×1080: **65,09 % de aire muerto y una banda vacía continua de
 * 600 px**. La causa no es el alto declarado: es que cada pantalla centraba su
 * contenido y le sobraba caja.
 *
 *     pantalla 1   204,70 px de tinta en 1080 → dos huecos de 437 y 438 px
 *     pantalla 2   770,05 px de tinta en 1080 → dos huecos de 155 px
 *     la juntura   642 → 1234 px = **592 px continuos sin nada**
 *
 * Tres cambios, y los tres salen de un número:
 *
 *   1. **La medida de lectura deja de crecer con la ventana** (ver `medida`):
 *      la nuestra valía la columna entera, 1700 px, con el titular en UNA línea.
 *   2. **El hueco se reparte en vez de acumularse.** Las cinco piezas de la
 *      pantalla 1 son filas de una grilla de doce que reparte su espacio libre
 *      con `content-evenly`: el hueco es el MISMO entre todas y se recalcula
 *      solo con el alto de la ventana, cosa que un `gap` fijo no puede hacer.
 *   3. **La foto ocupa su lugar.** Pasa de 3 a 4 columnas de 5 —de 738 a 987,7
 *      px de alto a 1920— y las dos personas se reparten el alto de la pantalla
 *      en vez de apilarse arriba.
 *
 * ── La coreografía y lo que pasa abajo de 1025 ───────────────────────────
 *
 * P1 para el titular; P2 para los cinco bloques de cuerpo —bajada, cómo
 * trabajamos, la foto, Franco y Valentino—, cada uno en **su propio `Bloque`**,
 * porque P2 tiene un solo target por instancia y el escalonado no sale de un
 * `stagger` sino de la GEOMETRÍA. Abajo de 1025 `Bloque` entrega `progreso:
 * null` y sale el árbol quieto; el reparto vive en la variante `escritorio:`,
 * así que ahí las cinco piezas caen en una columna con el `gap-y` fijo — a 375
 * la caja no sobra: sobra tinta, y no hay hueco que repartir.
 */

/** LA GEOMETRÍA — los números técnicos de la sección, fuera del contenido: los
 *  decide quien construye la sección y no cambian cuando llegue la foto real. */
export const GEOMETRIA = {
  foto: {
    /** 3:2 apaisado — [decidido]. Es una foto de DOS personas una al lado de la
     *  otra: el encuadre que pide es horizontal y de plano medio. 16:9 deja
     *  demasiado aire o corta las cabezas; 1:1 obliga a apilarlas, que es lo que
     *  la sección no quiere decir. 1800 × 1200 es el ARCHIVO, no una caja. */
    ancho: 1800,
    alto: 1200,
    /**
     * Cuántas columnas ocupa, de cuántas. **Es la entrada del `sizes`**, y por
     * eso la grilla de la segunda pantalla es de CINCO: `sizesPorColumnas`
     * compone su condición desde el breakpoint de escritorio (1025), y de las
     * grillas del sistema **la de 5 es la única que colapsa ahí**; las de 2, 3 y
     * 4 colapsan en 768, con lo cual el `sizes` MENTIRÍA entre 768 y 1024.
     *
     * ⚠ **B1 · de 3 a 4 columnas [medido].** Con 3 la caja valía 1107,2 px a
     * 1920 y la foto medía 738,1 px en una pantalla de 1080: 310 px de hueco.
     * Con 4 vale 1481,6 px y la foto mide 987,7 px, que con su epígrafe llena la
     * pantalla; los 1800 px del archivo siguen cubriendo esa caja con margen.
     */
    columnas: 4,
    columnasTotales: 5,
  },
  /**
   * LA MEDIDA DE LECTURA — una sola para las tres piezas de texto. [medido]
   *
   * ⚠ **No es un ancho de columna: es un TOPE.** La columna sigue siendo fluida
   * y el tope sólo manda arriba de ~1025, donde la columna se vuelve demasiado
   * ancha para una línea. Es la forma medida en la referencia externa: *la caja
   * de texto no acompaña al viewport*.
   * `--fluido-piso` menos un escalón de la escala de espaciado: 375 − 48 = 327
   * px. El número sale de comparar en el navegador, a 1920, los altos que
   * produce cada tope — que es lo que decide cuánta tinta hay para repartir:
   *
   *     tope   titular   bajada   cómo   tinta    juntura
   *     375     288,91       96     96   519,8      93,4
   *     343     288,91       96    120   543,8      89,4
   *     327     346,69      120    120   617,6      77,1
   *
   * Y no deja el texto fuera de registro: 327 px sobre un titular de 53 px son
   * 6,2 em de línea, contra los 6,67 em de la referencia (480 px sobre 72).
   */
  medida: 'max-w-[calc(var(--fluido-piso)_-_var(--spacing-12))]',
  /**
   * EL REPARTO de la pantalla 1: doce columnas usadas como primitiva de
   * posición, una fila por pieza. Mismo instrumento que usa Números, y las
   * cadenas van enteras porque Tailwind escanea el código fuente.
   *
   * Las tres primeras arrancan en la columna 1 y las dos últimas en la 9. La 9
   * y no la 7 está medida: a 1920 la pastilla de navegación ocupa de x 658 a
   * x 1262 y una caja que arranca en la columna 9 empieza en x 1332 — por fuera
   * de la pastilla en todo su recorrido. Es lo único que esta sección puede
   * hacer por ese choque sin tocar la pastilla, que no es suya.
   */
  reparto: {
    etiqueta: 'escritorio:col-start-1 escritorio:col-span-3 escritorio:row-start-1',
    titular: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-2',
    bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-3',
    comoTrabajamos: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-4',
    lugar: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-5',
  },
  /** Cuántas líneas promete el titular. Es inerte para P1 —`LineasDeTexto` las
   *  recalcula midiendo— y va declarado igual porque hace comparable la sección
   *  con el rango medido del patrón (1 a 6): cinco a 1920, cuatro a 1440. */
  lineasDelTitular: 5,
} as const

/** El `sizes` real de la foto. Exportado para que el instrumento afirme el
 *  MISMO valor que se pasa al marco y no una copia escrita a mano. */
export const SIZES_DE_LA_FOTO = sizesPorColumnas(GEOMETRIA.foto.columnas, GEOMETRIA.foto.columnasTotales)

/** LA GRILLA DE LA PANTALLA 1 — doce columnas desde 1025, UNA abajo, y el hueco
 *  repartido en vez de acumulado. `grow` + `content-evenly` es el par que hace
 *  la resta: la grilla crece hasta el alto de la pantalla y reparte lo que le
 *  sobra **por igual entre las seis junturas**. Por eso `gap-y` se apaga arriba
 *  de 1025: sumado al reparto daría junturas desparejas. Abajo del umbral
 *  vuelve, porque ahí no sobra caja. */
const CLASES_DE_LA_AGENCIA = cn(
  'grid w-full grow grid-cols-1 content-evenly items-start gap-y-12',
  'escritorio:grid-cols-12 escritorio:gap-y-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

/** Una persona: nombre en h3, rol real, y el hueco rotulado al lado del rol. */
function Persona({
  persona,
  rotulo,
}: {
  readonly persona: (typeof CONTENIDO.personas)[number]
  readonly rotulo: string
}): React.JSX.Element {
  return (
    <div data-pieza-a="persona" className="flex flex-col gap-2">
      <Titular nivel="titulo-s" como="h3">
        {persona.nombre}
      </Titular>
      <Caption como="p">{persona.rol}</Caption>
      {/* El hueco, con la estructura a la vista: rótulo + marcador. El borde
          punteado es el mismo lenguaje de `MarcoDeMedio` — un pedido se ve
          igual en toda la sección. */}
      <p className="border-borde-fuerte flex flex-wrap items-baseline gap-2 border border-dashed px-3 py-2">
        <Micro como="span" className="uppercase opacity-casi">
          {rotulo}
        </Micro>
        <Micro como="span" className="font-codigo uppercase">
          {persona.enUnProyecto}
        </Micro>
      </p>
    </div>
  )
}

/** PANTALLA 1 · LA AGENCIA — cinco piezas repartidas sobre la pantalla entera.
 *  `escritorio:py-0` y no un relleno fijo: arriba de 1025 el borde lo pone el
 *  propio reparto —la juntura de arriba mide lo mismo que las de adentro— y
 *  sumarle un `padding` lo duplicaría. Abajo del umbral vuelve. */
function LaAgencia({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <div
      data-pantalla="agencia"
      className="flex min-h-svh w-full flex-col justify-center py-12 escritorio:py-0"
    >
      <Grilla columnas="lateral" className="grow">
        <NumeroDeSeccion seccion={seccion} />
        <div data-composicion="agencia" className={CLASES_DE_LA_AGENCIA}>
          <EtiquetaDeSeccion className={GEOMETRIA.reparto.etiqueta}>
            {CONTENIDO.etiqueta}
          </EtiquetaDeSeccion>

          <Bloque patron="P1" className={cn(GEOMETRIA.reparto.titular, GEOMETRIA.medida)}>
            {(progreso) => (
              <TextoPorLineas
                texto={CONTENIDO.titular}
                progreso={progreso}
                patron="P1"
                como="h2"
                className="font-titulo text-fluido-titulo-l leading-titulo tracking-titulo"
                // El `h2` que nombra la región de la sección (S11, defecto 10).
                id={idDelTitularDeSeccion(seccion.id)}
              />
            )}
          </Bloque>

          <Bloque patron="P2" className={cn(GEOMETRIA.reparto.bajada, GEOMETRIA.medida)}>
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <Cuerpo>{CONTENIDO.bajada}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>

          <Bloque patron="P2" className={cn(GEOMETRIA.reparto.comoTrabajamos, GEOMETRIA.medida)}>
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <Cuerpo>{CONTENIDO.comoTrabajamos}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>

          {/* El lugar cierra la pantalla en vez de colgar del rótulo: es la
              quinta pieza, y sin ella el reparto tendría cinco junturas en vez
              de seis y cada una mediría 18 px más. */}
          <Caption como="p" className={cn(GEOMETRIA.reparto.lugar, 'opacity-casi')}>
            {CONTENIDO.lugar}
          </Caption>
        </div>
      </Grilla>
    </div>
  )
}

/** PANTALLA 2 · LAS DOS PERSONAS — la foto en cuatro columnas y los dos nombres
 *  repartidos sobre el alto de la pantalla, no apilados arriba.
 *  `escritorio:py-2` es un hilo, y está medido: a 1920 la foto con su epígrafe
 *  mide 1019,65 px en una caja de 1080, así que un `py-20` la desbordaría y la
 *  sección crecería por encima de los 200svh de la tabla. Con 8 px la juntura
 *  contra la pantalla de arriba queda en el hueco del reparto. */
function LasPersonas(): React.JSX.Element {
  return (
    <div
      data-pantalla="personas"
      className="flex min-h-svh w-full flex-col justify-center py-20 escritorio:py-2"
    >
      <Grilla columnas={5} className="escritorio:grow">
        <Bloque patron="P2" className="escritorio:col-span-4">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P2">
              <figure className="flex flex-col gap-3">
                <MarcoDeMedio
                  marcador={CONTENIDO.equipo.marcador}
                  fuente={null}
                  alt={CONTENIDO.equipo.alt}
                  ancho={GEOMETRIA.foto.ancho}
                  alto={GEOMETRIA.foto.alto}
                  sizes={SIZES_DE_LA_FOTO}
                />
                <figcaption>
                  <Caption como="p">{CONTENIDO.equipo.pie}</Caption>
                </figcaption>
              </figure>
            </CanalDeUnaPieza>
          )}
        </Bloque>

        {/* Los dos en bloques separados: cada uno resuelve su ancla contra su
            propia caja, así que Valentino entra después de Franco sin `stagger`.
            `escritorio:justify-between` es la otra mitad de la resta: la columna
            se estira con la pantalla y los dos nombres se van a los bordes, con
            lo cual la tinta llega hasta abajo del todo en vez de terminar donde
            termina la foto. Medido a 1920: sin él quedaba un hueco de 221,75 px
            debajo del epígrafe; con él son 61,75 px. Abajo de 1025 no aplica:
            ahí la columna mide su contenido y no hay nada que repartir. */}
        <div className="flex flex-col gap-12 escritorio:col-span-1 escritorio:justify-between">
          {CONTENIDO.personas.map((persona) => (
            <Bloque key={persona.nombre} patron="P2">
              {(progreso) => (
                <CanalDeUnaPieza progreso={progreso} patron="P2">
                  <Persona persona={persona} rotulo={CONTENIDO.rotuloDelPedido} />
                </CanalDeUnaPieza>
              )}
            </Bloque>
          ))}
        </div>
      </Grilla>
    </div>
  )
}

export function QuienesSomos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        <LaAgencia seccion={seccion} />
        <LasPersonas />
      </Envoltorio>
    </Seccion>
  )
}

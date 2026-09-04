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
 * 02 · QUIÉNES SOMOS — TRES pantallas de papel, sin canvas y sin pinneo.
 *
 * `secciones.ts` le da `papel-opaco` y **300svh**, sin `pinneada`, y ninguna de
 * las tres se declara acá. Es el tramo más largo del sitio en el que el canvas
 * NO se ve: la escena vale porque desaparece un rato largo.
 *
 * ── B2 · POR QUÉ SON TRES, Y POR QUÉ EL CORTE CAE DONDE CAE ───────────────
 *
 * La Fase 0 subió la tabla de 200 a 300svh por dos números medidos —el techo de
 * velocidad de la cámara y la densidad de la referencia (cinco piezas a 0,67
 * pantallas = 3,35)—. **La composición se quedó en DOS, así que la tercera
 * pantalla quedó vacía**: a 1920×1080 el panel iba de `y` 1080 a 4320 y el flujo
 * terminaba en 3240: 1080 px de nada, y `s10-mobile` §2 en rojo.
 *
 * El corte sale de las CINCO piezas que enumera la fila de `secciones.ts`:
 *
 *     01 la agencia   etiqueta · titular (P1) · bajada (P2) · el lugar
 *     02 el equipo    cómo trabajamos (P2) · Franco (P2) · Valentino (P2)
 *     03 la foto      el [FOTO DEL EQUIPO] con su epígrafe (P2)
 *
 * **La foto entra sola, que es lo que la instrucción pide.** Ya llenaba el 94,4 %
 * de su pantalla con su epígrafe (1.019,64 px de 1.080): no le sobraba lugar para
 * nadie al lado, y darle el suyo no le cambia un píxel — sigue en 4 de 5 columnas,
 * la decisión que B1 midió (`B2-DELTAS.md` §4.1).
 *
 * ── Lo que el corte hace con los ATERRIZAJES, que es el gate del bloque ───
 *
 * El ancla de P2 es `top bottom` → `bottom bottom`: un bloque **aterriza** en
 * `borde inferior del bloque − alto de ventana`, o sea cuando termina de entrar
 * al cuadro. Con dos pantallas los aterrizajes caían en `y` 600–1200 y 2160, y
 * no pasaba nada más hasta el primero de Números, en 3720: **1,44 pantallas de
 * hueco**, el segundo pozo del sitio. Con tres, cada pantalla pone su grupo.
 *
 * **Las tres decisiones medidas de B1 siguen en pie y no se tocan**, cada una
 * en su docblock: la medida de lectura que no crece con la ventana (`medida`),
 * el hueco repartido en vez de acumulado (`CLASES_DEL_REPARTO`) y la foto en
 * 4 de 5 columnas (`GEOMETRIA.foto.columnas`).
 *
 * P1 para el titular; P2 para los cinco bloques de cuerpo, cada uno en **su
 * propio `Bloque`**, porque P2 tiene un solo target por instancia y el
 * escalonado no sale de un `stagger` sino de la GEOMETRÍA. Abajo de 1025 `Bloque`
 * entrega `progreso: null` y sale el árbol quieto; el reparto vive en la variante
 * `escritorio:`, así que ahí las piezas caen en una columna con el `gap-y` fijo.
 */

/** LA GEOMETRÍA — los números técnicos de la sección, fuera del contenido: los decide
 *  quien construye la sección y no cambian cuando llegue la foto real. */
export const GEOMETRIA = {
  foto: {
    /** 3:2 apaisado — [decidido]. Es una foto de DOS personas una al lado de la
     *  otra: el encuadre que pide es horizontal y de plano medio. 16:9 deja
     *  aire o corta las cabezas; 1:1 obliga a apilarlas, que es lo que la
     *  sección no quiere decir. 1800 × 1200 es el ARCHIVO, no una caja. */
    ancho: 1800,
    alto: 1200,
    /**
     * Cuántas columnas ocupa, de cuántas. **Es la entrada del `sizes`**, y por
     * eso la grilla de la tercera pantalla es de CINCO: `sizesPorColumnas` compone
     * su condición desde el breakpoint de escritorio (1025) y de las grillas del
     * sistema **la de 5 es la única que colapsa ahí**; las de 2, 3 y 4 colapsan en
     * 768, con lo cual el `sizes` MENTIRÍA entre 768 y 1024.
     *
     * ⚠ **B1 · de 3 a 4 columnas [medido]. B2 NO lo toca.** Con 3 la caja valía
     * 1107,2 px a 1920 y la foto medía 738,1 px en una pantalla de 1080: 310 px de
     * hueco. Con 4 vale 1481,6 px y la foto mide 987,7 px. Darle su propia pantalla
     * no cambia ni la caja ni la relación: cambia con quién la comparte. */
    columnas: 4,
    columnasTotales: 5,
  },
  /**
   * LA MEDIDA DE LECTURA — una sola para las tres piezas de texto. [medido]
   *
   * ⚠ **No es un ancho de columna: es un TOPE.** La columna sigue siendo fluida
   * y el tope sólo manda arriba de ~1025, donde se vuelve demasiado ancha para
   * una línea. Es la forma medida en la referencia externa: *la caja de texto no
   * acompaña al viewport*. `--fluido-piso` menos un escalón de espaciado:
   * 375 − 48 = 327 px, sacado de comparar en el navegador, a 1920, los altos que
   * produce cada tope — que es lo que decide cuánta tinta hay para repartir:
   *
   *     tope   titular   bajada   cómo   tinta    juntura
   *     375     288,91       96     96   519,8      93,4
   *     343     288,91       96    120   543,8      89,4
   *     327     346,69      120    120   617,6      77,1
   *
   * Y no deja el texto fuera de registro: 327 px sobre un titular de 53 px son 6,2
   * em de línea, contra los 6,67 em de la referencia (480 px sobre 72). */
  medida: 'max-w-[calc(var(--fluido-piso)_-_var(--spacing-12))]',
  /**
   * EL REPARTO de las dos pantallas de texto: doce columnas usadas como
   * primitiva de posición, una fila por pieza. Mismo instrumento que usa
   * Números, y las cadenas van enteras porque Tailwind escanea el código fuente.
   *
   * La columna 9 no es una preferencia: a 1920 la pastilla de navegación ocupa de
   * x 658 a x 1262 y una caja que arranca en la 9 empieza en x 1332, por fuera de
   * la pastilla en todo su recorrido. Por eso **la última fila de cada pantalla
   * arranca en la 9**: con `content-evenly` queda contra el pie del cuadro.
   */
  reparto: {
    etiqueta: 'escritorio:col-start-1 escritorio:col-span-3 escritorio:row-start-1',
    titular: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-2',
    bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-3',
    lugar: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-4',
    comoTrabajamos: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-1',
    primeraPersona: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-2',
    segundaPersona: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-3',
  },
  /** Cuántas líneas promete el titular. Es inerte para P1 —`LineasDeTexto` las
   *  recalcula midiendo— y va declarado porque hace comparable la sección con el
   *  rango medido del patrón (1 a 6): cinco a 1920, cuatro a 1440. */
  lineasDelTitular: 5,
} as const

/** El `sizes` real de la foto. Exportado para que el instrumento afirme el MISMO
 *  valor que se pasa al marco y no una copia escrita a mano. */
export const SIZES_DE_LA_FOTO = sizesPorColumnas(GEOMETRIA.foto.columnas, GEOMETRIA.foto.columnasTotales)

/** LA GRILLA DE LAS DOS PANTALLAS DE TEXTO — doce columnas desde 1025, UNA abajo,
 *  y el hueco repartido en vez de acumulado. `grow` + `content-evenly` es el par
 *  que hace la resta: la grilla crece hasta el alto de la pantalla y reparte lo
 *  que le sobra **por igual entre todas las junturas**. Por eso `gap-y` se apaga
 *  arriba de 1025: sumado al reparto daría junturas desparejas. */
const CLASES_DEL_REPARTO = cn(
  'grid w-full grow grid-cols-1 content-evenly items-start gap-y-12',
  'escritorio:grid-cols-12 escritorio:gap-y-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

/** El contenedor de una pantalla de texto. `escritorio:py-0` y no un relleno fijo:
 *  arriba de 1025 el borde lo pone el propio reparto —la juntura de arriba mide lo
 *  mismo que las de adentro— y un `padding` lo duplicaría. */
function Pantalla(props: {
  readonly nombre: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      data-pantalla={props.nombre}
      className="flex min-h-svh w-full flex-col justify-center py-12 escritorio:py-0"
    >
      {props.children}
    </div>
  )
}

/** Una persona: nombre en h3, rol real, y el hueco rotulado al lado del rol.
 *  El borde punteado es el mismo lenguaje de `MarcoDeMedio`: un pedido se ve
 *  igual en toda la sección. */
function Persona({
  persona,
  rotulo,
}: {
  readonly persona: (typeof CONTENIDO.personas)[number]
  readonly rotulo: string
}): React.JSX.Element {
  return (
    <div data-pieza-a="persona" className="flex flex-col gap-2">
      <Titular nivel="titulo-s" como="h3">{persona.nombre}</Titular>
      <Caption como="p">{persona.rol}</Caption>
      <p className="border-borde-fuerte flex flex-wrap items-baseline gap-2 border border-dashed px-3 py-2">
        <Micro como="span" className="uppercase opacity-casi">{rotulo}</Micro>
        <Micro como="span" className="font-codigo uppercase">{persona.enUnProyecto}</Micro>
      </p>
    </div>
  )
}

/** PANTALLA 1 · LA AGENCIA — quiénes somos y qué somos, repartido sobre la pantalla
 *  entera. El lugar cierra abajo a la derecha: deja la juntura pareja y esquiva la
 *  pastilla. */
function LaAgencia({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Pantalla nombre="agencia">
      <Grilla columnas="lateral" className="grow">
        <NumeroDeSeccion seccion={seccion} />
        <div data-composicion="agencia" className={CLASES_DEL_REPARTO}>
          <EtiquetaDeSeccion className={GEOMETRIA.reparto.etiqueta}>{CONTENIDO.etiqueta}</EtiquetaDeSeccion>

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

          <Caption como="p" className={cn(GEOMETRIA.reparto.lugar, 'opacity-casi')}>{CONTENIDO.lugar}</Caption>
        </div>
      </Grilla>
    </Pantalla>
  )
}

/** PANTALLA 2 · EL EQUIPO — cómo trabajamos, y quiénes son «la misma gente de punta
 *  a punta» que ese párrafo nombra. Las dos personas llegan en filas distintas: cada
 *  una resuelve su ancla contra su propia caja, así que son dos aterrizajes y no uno.
 *  El `div` vacío de la columna lateral no es un descuido: reserva los 156 px que en
 *  la pantalla 1 lleva el número, y sin él el reparto de doce arrancaría a la
 *  izquierda del de la otra pantalla de texto. */
function ElEquipo(): React.JSX.Element {
  return (
    <Pantalla nombre="equipo">
      <Grilla columnas="lateral" className="grow">
        <div />
        <div data-composicion="equipo" className={CLASES_DEL_REPARTO}>
          <Bloque patron="P2" className={cn(GEOMETRIA.reparto.comoTrabajamos, GEOMETRIA.medida)}>
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <Cuerpo>{CONTENIDO.comoTrabajamos}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>

          {CONTENIDO.personas.map((persona, indice) => (
            <Bloque key={persona.nombre} patron="P2" className={indice === 0 ? GEOMETRIA.reparto.primeraPersona : GEOMETRIA.reparto.segundaPersona}>
              {(progreso) => (
                <CanalDeUnaPieza progreso={progreso} patron="P2">
                  <Persona persona={persona} rotulo={CONTENIDO.rotuloDelPedido} />
                </CanalDeUnaPieza>
              )}
            </Bloque>
          ))}
        </div>
      </Grilla>
    </Pantalla>
  )
}

/** PANTALLA 3 · LA FOTO — cuatro columnas de cinco y su epígrafe, solos.
 *  `escritorio:py-2` es un hilo y está medido: la caja con el epígrafe mide 1.019,64
 *  px en una pantalla de 1.080, así que un `py-20` la desbordaría. */
function LaFoto(): React.JSX.Element {
  return (
    <div data-pantalla="foto" className="flex min-h-svh w-full flex-col justify-center py-20 escritorio:py-2">
      <Grilla columnas={GEOMETRIA.foto.columnasTotales}>
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
                <figcaption><Caption como="p">{CONTENIDO.equipo.pie}</Caption></figcaption>
              </figure>
            </CanalDeUnaPieza>
          )}
        </Bloque>
      </Grilla>
    </div>
  )
}

export function QuienesSomos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        <LaAgencia seccion={seccion} />
        <ElEquipo />
        <LaFoto />
      </Envoltorio>
    </Seccion>
  )
}

'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Caption, Cuerpo, Micro } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { sizesPorColumnas } from '../../_lib/imagen'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza, TextoPorLineas } from '../_contrato/canales'
import { MarcoDeMedio } from '../_contrato/medios'
import { MarcaDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO } from './contenido'

/**
 * 02 · QUIÉNES SOMOS — TRES pantallas de papel, sin canvas y sin pinneo.
 *
 * `secciones.ts` le da la superficie —`papel-transparente` desde B8— y **300svh**,
 * sin `pinneada`, y ninguna de las tres se declara acá.
 *
 * ── B2 · POR QUÉ SON TRES, Y POR QUÉ EL CORTE CAE DONDE CAE ───────────────
 *
 * La Fase 0 subió la tabla de 200 a 300svh por dos números medidos —el techo de
 * velocidad de la cámara y la densidad de la referencia (cinco piezas a 0,67
 * pantallas = 3,35)—. **La composición se quedó en DOS y la tercera pantalla
 * quedó vacía**: a 1920×1080 el panel iba de `y` 1080 a 4320 y el flujo terminaba
 * en 3240 (1080 px de nada, `s10-mobile` §2 en rojo). El corte sale de las CINCO
 * piezas que enumera la fila de `secciones.ts`:
 *
 *     01 la agencia   etiqueta · titular (P1) · bajada (P2) · el lugar
 *     02 el equipo    cómo trabajamos (P2) · Franco (P2) · Valentino (P2)
 *     03 la foto      el [FOTO DEL EQUIPO] con su epígrafe (P2)
 *
 * **La foto entra sola, que es lo que la instrucción pide.** Ya llenaba el 94,4 %
 * de su pantalla con su epígrafe (1.019,64 px de 1.080): seguía en 4 de 5, la
 * decisión de B1 (`B2-DELTAS.md` §4.1) que B11 revisó con el logo medido (abajo).
 * **Los aterrizajes, que son el gate del bloque:** el ancla de P2 es `top bottom`
 * → `bottom bottom` (un bloque aterriza cuando termina de entrar al cuadro). Con
 * dos pantallas caían en `y` 600–1200 y 2160, y nada más hasta el primero de
 * Números, en 3720: **1,44 pantallas de hueco**, el segundo pozo del sitio. Con
 * tres, cada pantalla pone su grupo. Las otras dos decisiones medidas de B1 siguen
 * en pie: `medida` (no crece con la ventana) y `CLASES_DEL_REPARTO` (el hueco repartido).
 *
 * P1 para el titular; P2 para los cinco bloques de cuerpo, cada uno en **su
 * propio `Bloque`** (P2 tiene un solo target por instancia y el escalonado sale
 * de la GEOMETRÍA, no de un `stagger`). Abajo de 1025 `Bloque` entrega
 * `progreso: null` y sale el árbol quieto; el reparto vive en `escritorio:`.
 *
 * ═══ B11 · EL TEXTO SE CORRE DE DONDE PASA EL LOGO [medido] ═════════════════
 *
 * B8 abrió la sección sobre la sala y el logo cruza el tramo en diagonal: arriba
 * a la derecha en la pantalla 1, al centro en la 2, abajo a la izquierda en la 3
 * (la silueta cada 1/16 de pantalla, `scripts-b11/a-logo.ts` con `h-columnas.ts`;
 * la tabla, en `B11-ACOMODAMIENTO.md` §3). Tres movimientos, ninguno cambia lo
 * que dice el texto: (1) «Cómo trabajamos» y la primera persona van a c7–c10 —en
 * c1–c6 el logo pasaba por detrás del 49 % (1440), 18 % (1920) y 77 % (2560) de
 * su glifo, 1,00:1; c7–c10 tiene ≤ 10 %—; la segunda persona SE QUEDA en la 9
 * (fila de abajo: la 7 cae en la pastilla, B1), con la celosía en c11–c12 (19–23 %
 * de su caja, 1 % del tiempo). (2) La foto baja de 4 a 3 columnas y va a c3–c5:
 * con 4 de 5 el marcador quedaba 100 % bajo el logo en los tres anchos (1,11:1) y
 * el epígrafe el 76,6 %; en c3–c5 el marcador cae en c4 (0 %) y el epígrafe va a
 * la derecha, a c4–c5. (3) El titular y la bajada no se mueven (0–5 %). **Lo que
 * cuesta:** la foto vuelve al ancho que B1 descartó y reabre **~310 px de hueco**
 * (PARADA 1 de B11: legibilidad antes que aire). El piso de motas (0,54–0,57 % del
 * cuadro) lleva número en `deudas-b11.ts` (D-B11.2); las dos tintas al 0,6, ver `Persona`.
 */

/** LA GEOMETRÍA — los números técnicos de la sección, fuera del contenido: los decide quien la construye y no cambian con la foto real. */
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
     * sistema **la de 5 es la única que colapsa ahí** (las de 2, 3 y 4 colapsan en
     * 768, y el `sizes` MENTIRÍA entre 768 y 1024).
     * ⚠ **B1 · de 3 a 4 [medido]; B11 · de 4 a 3, en c3–c5 [medido].** Con 3 la
     * caja valía 1107,2 px a 1920 y la foto 738,1 en 1080: 310 px de hueco que B1
     * cerró con 4 (1481,6 / 987,7). B11 midió las columnas 1 y 2 bajo el logo el
     * 100 % del tramo en los tres anchos y la 3 entre el 34 y el 60 %: con 3 en
     * c3–c5 el marcador queda en la 4 (0–1 %). Los 310 px vuelven (PARADA 1). */
    columnas: 3,
    columnasTotales: 5,
    claseDeLaCaja: 'escritorio:col-start-3 escritorio:col-span-3', // literal: Tailwind escanea el fuente
  },
  /**
   * LA MEDIDA DE LECTURA — una sola para las tres piezas de texto. [medido]
   *
   * ⚠ **No es un ancho de columna: es un TOPE.** La columna sigue siendo fluida
   * y el tope sólo manda arriba de ~1025, donde se vuelve demasiado ancha para
   * una línea (la referencia: *la caja de texto no acompaña al viewport*).
   * `--fluido-piso` menos un escalón: 375 − 48 = 327 px, de comparar a 1920 los
   * altos que produce cada tope, que es lo que decide cuánta tinta se reparte:
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
   * EL REPARTO de las dos pantallas de texto: doce columnas como primitiva de
   * posición, una fila por pieza (el instrumento de Números; las cadenas van
   * enteras porque Tailwind escanea el fuente). La columna 9 no es una preferencia:
   * a 1920 la pastilla ocupa de x 658 a x 1262 y una caja que arranca en la 9
   * empieza en x 1332, afuera en todo su recorrido; por eso **la última fila de
   * cada pantalla arranca en la 9**, contra el pie del cuadro con `content-evenly`.
   * ⚠ B11: en la pantalla del equipo, «cómo trabajamos» (fila 1) y la primera
   * persona (fila 2) arrancan en la 7, la primera columna que el logo deja libre
   * ahí (c7–c10 ≤ 10 % en los tres anchos); la segunda sigue en la 9 (pastilla).
   */
  reparto: {
    // ⚠️ B12: la fila 1 quedó vacía —era el rótulo— y su celda se borra con él.
    // Las otras NO se re-numeran: correrlas movería lo que B11 acomodó.
    titular: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-2',
    bajada: 'escritorio:col-start-1 escritorio:col-span-6 escritorio:row-start-3',
    lugar: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-4',
    comoTrabajamos: 'escritorio:col-start-7 escritorio:col-span-4 escritorio:row-start-1',
    primeraPersona: 'escritorio:col-start-7 escritorio:col-span-4 escritorio:row-start-2',
    segundaPersona: 'escritorio:col-start-9 escritorio:col-span-4 escritorio:row-start-3',
  },
  /** Cuántas líneas promete el titular. Inerte para P1 (`LineasDeTexto` mide); va
   *  declarado para compararla con el rango del patrón (1 a 6): cinco a 1920, cuatro a 1440. */
  lineasDelTitular: 5,
} as const

/** El `sizes` real de la foto, exportado para que el instrumento afirme el MISMO valor que recibe el marco. */
export const SIZES_DE_LA_FOTO = sizesPorColumnas(GEOMETRIA.foto.columnas, GEOMETRIA.foto.columnasTotales)

/** LA GRILLA DE LAS DOS PANTALLAS DE TEXTO — doce columnas desde 1025, UNA abajo, y el
 *  hueco repartido en vez de acumulado: `grow` + `content-evenly` crece hasta el alto de
 *  la pantalla y reparte lo que sobra **por igual entre las junturas** (por eso `gap-y` se apaga arriba de 1025). */
const CLASES_DEL_REPARTO = cn(
  'grid w-full grow grid-cols-1 content-evenly items-start gap-y-12',
  'escritorio:grid-cols-12 escritorio:gap-y-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

/** El contenedor de una pantalla de texto. `escritorio:py-0` y no un relleno fijo: arriba de 1025 el borde lo pone el reparto. */
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

/** Una persona: nombre en h3, rol real, y el hueco rotulado al lado del rol (el borde punteado es el lenguaje de `MarcoDeMedio`).
 *  ⚠ B11: el rótulo del pedido y «Tucumán, Argentina» van a tinta PLENA, no a `opacity-casi` (la palanca de B6-A, PARADA 2): al 0,6 sobre
 *  el gris de la pared daban mediana 4,06–4,30 con TODO el glifo bajo AA; a plena, mediana 7,4–13,2 y 5–21 px de ~550 bajo AA: motas. §6. */
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
        <Micro como="span" className="uppercase">{rotulo}</Micro>
        <Micro como="span" className="font-codigo uppercase">{persona.enUnProyecto}</Micro>
      </p>
    </div>
  )
}

/** PANTALLA 1 · LA AGENCIA — quiénes somos y qué somos, repartido sobre la pantalla
 *  entera. El lugar cierra abajo a la derecha: juntura pareja, y esquiva la pastilla. */
function LaAgencia({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Pantalla nombre="agencia">
      <Grilla columnas="lateral" className="grow">
        <MarcaDeSeccion />
        <div data-composicion="agencia" className={CLASES_DEL_REPARTO}>
          {/* ⚠️ B12: el rótulo y su celda se fueron; el titular NO se mueve. */}          <Bloque patron="P1" rango="ventana-visible" className={cn(GEOMETRIA.reparto.titular, GEOMETRIA.medida)}>
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

          <Bloque patron="P2" rango="ventana-visible" className={cn(GEOMETRIA.reparto.bajada, GEOMETRIA.medida)}>
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <Cuerpo>{CONTENIDO.bajada}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>

          <Caption como="p" className={GEOMETRIA.reparto.lugar}>{CONTENIDO.lugar}</Caption>
        </div>
      </Grilla>
    </Pantalla>
  )
}

/** PANTALLA 2 · EL EQUIPO — cómo trabajamos, y quiénes son «la misma gente de punta
 *  a punta» que ese párrafo nombra. Las dos personas llegan en filas distintas (cada
 *  una resuelve su ancla contra su caja: dos aterrizajes, no uno). El `div` vacío de
 *  la columna lateral reserva los 156 px que en la pantalla 1 lleva el número. */
function ElEquipo(): React.JSX.Element {
  return (
    <Pantalla nombre="equipo">
      <Grilla columnas="lateral" className="grow">
        <div />
        <div data-composicion="equipo" className={CLASES_DEL_REPARTO}>
          <Bloque patron="P2" rango="ventana-visible" className={cn(GEOMETRIA.reparto.comoTrabajamos, GEOMETRIA.medida)}>
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <Cuerpo>{CONTENIDO.comoTrabajamos}</Cuerpo>
              </CanalDeUnaPieza>
            )}
          </Bloque>

          {CONTENIDO.personas.map((persona, indice) => (
            <Bloque key={persona.nombre} patron="P2" rango="ventana-visible" className={indice === 0 ? GEOMETRIA.reparto.primeraPersona : GEOMETRIA.reparto.segundaPersona}>
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

/** PANTALLA 3 · LA FOTO — tres columnas de cinco, en c3–c5, y su epígrafe, solos.
 *  `escritorio:py-2` es un hilo medido con 4 columnas (1.019,64 px en 1.080); con 3
 *  (B11) la caja mide ~757 y lo que sobra es hueco, publicado arriba. ⚠ B11: el
 *  epígrafe va a la derecha desde 1025 y no es estética: sus 372 px arrancaban en
 *  la columna 3 (el logo la tapa hasta el 60 % del tramo) y a la derecha viven en
 *  c4–c5, libres. Abajo de 1025 no hay escena y sigue a la izquierda. */
function LaFoto(): React.JSX.Element {
  return (
    <div data-pantalla="foto" className="flex min-h-svh w-full flex-col justify-center py-20 escritorio:py-2">
      <Grilla columnas={GEOMETRIA.foto.columnasTotales}>
        <Bloque patron="P2" rango="ventana-visible" className={GEOMETRIA.foto.claseDeLaCaja}>
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
                <figcaption><Caption como="p" className="escritorio:text-right">{CONTENIDO.equipo.pie}</Caption></figcaption>
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

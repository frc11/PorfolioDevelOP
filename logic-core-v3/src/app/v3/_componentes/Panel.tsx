import { cn } from '@/lib/utils'

import { SECCIONES, type Seccion } from '../_lib/secciones'
import { CLASES_DE_LA_BANDA_ANGOSTA, SUPERFICIES } from '../_lib/superficies'
import { idDelTitularDeSeccion } from './tipografia/Titular'

/**
 * EL PANEL — un bloque del flujo del documento, encima del escenario.
 *
 * Sin contenido: su altura declarada, su nombre visible como texto plano para
 * poder identificarlo, y nada más. Eso es todo lo que este sprint construye.
 *
 * ── El layout invierte lo que uno esperaría ────────────────────────────────
 *
 * Sale de la medición de la referencia y es contraintuitivo. El patrón
 * habitual —padding lateral fluido y columnas de grilla fijas— da algo que se
 * PARECE y no se siente igual. Acá es al revés:
 *
 *   · **Padding lateral FIJO: 32px** (`--pad-lateral-compacto`). No fluido, no
 *     en `%`, no en `vw`. El mismo en 375 y en 1920.
 *   · **Columnas de grilla FLUIDAS** — `minmax(0, 1fr)`, no anchos fijos.
 *   · **Gaps FIJOS**: 12px compacto, 16px amplio.
 *   · **Los paneles son A SANGRE**: `max-width: 100%` domina con 66,2% de los
 *     casos medidos. La `<section>` ocupa el ancho entero y pinta el ancho
 *     entero; el tope de 1920px es del CONTENIDO, no del panel.
 *   · **Columna lateral de 140px**, fija, donde vive el número de sección.
 *
 * Los cinco valores son tokens de `theme-develop.css`. Ninguno tiene namespace
 * de Tailwind salvo `--container-tope`, así que los otros cuatro se consumen
 * con `var()` en valor arbitrario. Es la forma prevista por S0 — y es también
 * la razón por la que el bloque `@theme` tiene que ser `static`: un token que
 * solo se usa así no cuenta como usado y Tailwind lo poda.
 *
 * ── Las separaciones son cero ──────────────────────────────────────────────
 *
 * Ningún panel declara margen. Está medido: 33 de 36 separaciones en 0px. El
 * ritmo vive en el pinneado, no en el aire entre bloques. La única excepción es
 * a sabiendas y NEGATIVA: el `solape` de una sección (`estiloDelAlto`).
 */

/**
 * LA SECCIÓN DE ENTRADA — el destino del enlace de salto.
 *
 * Es la primera de la tabla y se deriva de ella: el «saltar al contenido» del
 * chrome (`_chrome/SaltarAlContenido.tsx`) aterriza acá, y esta constante es la
 * ÚNICA que dice cuál es. Las dos puntas la importan de este módulo, que es el
 * que emite el `id` del ancla — el enlace no puede apuntar a una sección que no
 * exista porque no escribe el nombre: lo lee.
 */
export const ID_DE_LA_SECCION_DE_ENTRADA: string = SECCIONES[0].id

/**
 * La `<section>`: superficie, altura y atributos. Sin contenido propio.
 *
 * `minHeight` va en estilo inline y no en una clase porque el valor viene del
 * DATO (`secciones.ts`) y cambia por sección. Una clase construida como
 * `min-h-[${alto}]` no la ve el escáner de Tailwind y no se emitiría nunca:
 * sería una clase muerta que parece viva. Es la excepción que la regla de
 * "nada de CSS inline si existe una clase" contempla — acá no existe.
 */
export function Panel({ seccion, children }: { seccion: Seccion; children?: React.ReactNode }) {
  const superficie = SUPERFICIES[seccion.superficie]

  return (
    <section
      id={seccion.id}
      // El nombre accesible de la región. La fórmula —y el porqué— viven en
      // `tipografia/Titular.tsx`, que es la punta que EMITE el id.
      aria-labelledby={idDelTitularDeSeccion(seccion.id)}
      /**
       * ⚠ `tabindex="-1"` SÓLO en la sección de entrada, y no es decorativo:
       * es lo que hace que el «saltar al contenido» mueva el foco de verdad.
       * Un ancla a un elemento NO focalizable mueve el punto de partida del
       * foco secuencial en Chromium y en Gecko, pero WebKit no lo hace, y ahí
       * el Tab siguiente vuelve al enlace de salto: el enlace parece andar y no
       * anda. Con `-1` el destino recibe foco de verdad en los tres.
       *
       * No entra al orden de tabulación —`-1` es «focalizable pero no
       * tabulable»— y `s10-lectura.paradasDeTabulacion` lo descarta
       * explícitamente, así que las paradas del documento no cambian por esto.
       * Y no pinta un anillo: el foco programático sobre un contenedor no
       * dispara `:focus-visible`.
       */
      tabIndex={seccion.id === ID_DE_LA_SECCION_DE_ENTRADA ? -1 : undefined}
      /**
       * ⚠ **VA COMO LITERAL, Y NO ES UN DESCUIDO (B1).** El nombre del atributo
       * también vive en `_secciones/_contrato/forma.ts` como `ATRIBUTO_DE_PANEL`,
       * porque la coreografía animada lo necesita para resolver
       * `anclaje: 'seccion'`. Lo natural sería consumirlo acá y tener una sola
       * fuente — y no se puede: `s13b-escena.invariant.ts` afirma sobre el
       * FUENTE de este archivo que la línea dice `data-panel={seccion.id}`, y ese
       * invariante vive en `_lib/escena/`, congelado para este sprint.
       *
       * Lo que evita que las dos se desincronicen mientras tanto está en
       * `trabajos.invariant.tsx` §1b: afirma que la constante del contrato
       * aparece LITERALMENTE en el fuente de este archivo. El día que
       * `_lib/escena/` se pueda tocar, esto pasa a `{...{ [ATRIBUTO_DE_PANEL]: … }}`
       * y esa afirmación se borra.
       */
      data-panel={seccion.id}
      data-superficie={seccion.superficie}
      /**
       * ⚠ **EL ANCHO EN EL QUE ESO DEJA DE SER CIERTO, dicho en el marcado.**
       * Sin esto, `data-superficie` diría `papel-transparente` a 320 y la
       * pantalla mostraría papel opaco: un atributo que miente es peor que uno
       * que falta, y los bancos de medición leen atributos. Sale sólo en la
       * sección que declara las dos, y dice cuál rige abajo de 375.
       */
      data-superficie-angosta={seccion.superficieAngosta}
      // El mecanismo de S0: redefine --color-fondo y --color-tinta, y el
      // anillo de foco se da vuelta solo porque --color-foco ES la tinta.
      data-seccion={superficie.invertida ? 'invertida' : undefined}
      /**
       * `relative z-10`: los paneles van ARRIBA del escenario, que es `z-0`.
       * Abajo de 1025 el reparto cambia y el resultado es el mismo: ahí el
       * escenario baja a `-z-10` y la sección suelta su `z-index`, para que la
       * bajada de «Quiénes somos» pueda mezclar contra la escena. Sigue arriba.
       *
       * ⚠ La tercera clase es la de la BANDA ANGOSTA y sale sólo si la sección
       * declara una segunda superficie. Es una media query —`max-angosto:`, la
       * única del lane que mira hacia abajo— y no una rama de JS, porque este
       * componente corre en el SERVIDOR y el hook que lee el ancho devuelve
       * `false` durante la hidratación: decidirlo en JS pintaría el primer
       * cuadro con la superficie equivocada. El porqué entero, con las cifras
       * de por qué el Hero la necesita, está en `CLASES_DE_LA_BANDA_ANGOSTA`.
       */
      className={cn(
        // `max-escritorio:z-auto`: abajo de 1025 la seccion no abre contexto de
        // apilamiento. Es el corte que `s7-mezcla` custodia — ver su docblock.
        'relative z-10 max-escritorio:z-auto w-full',
        superficie.clases,
        seccion.superficieAngosta === undefined
          ? undefined
          : CLASES_DE_LA_BANDA_ANGOSTA[seccion.superficieAngosta],
        seccion.solape === undefined ? undefined : CLASE_DEL_SOLAPE,
      )}
      style={estiloDelAlto(seccion)}
    >
      {children}
      {seccion.solape === undefined ? null : <CajaSinSolape />}
    </section>
  )
}

/**
 * EL ALTO DEL PANEL, con el solape si la sección lo declara (`secciones.ts`).
 *
 * El solape sube el panel sobre el anterior y le suma lo mismo al piso del alto:
 * arranca antes y termina donde terminaba, así que nada de lo que viene después
 * se corre y la escena —que ancla cada tramo al fin de su sección— no se entera.
 *
 * ⚠️ **RIGE SÓLO DESDE ESCRITORIO, y por eso viaja en dos propiedades.** El valor
 * sale del DATO y va inline; lo que lo prende es la variante `escritorio:` de
 * `CLASE_DEL_SOLAPE`, que copia ese valor a la propiedad que el margen y el alto
 * leen. Abajo esa propiedad no existe y los dos caen a cero. Es CSS y no una
 * rama de JS por lo mismo que la banda angosta: este componente corre en el
 * servidor, y decidirlo al hidratar movería la página un cuadro después.
 */
function estiloDelAlto(seccion: Seccion): React.CSSProperties {
  if (seccion.solape === undefined) return { minHeight: seccion.alto }
  return {
    '--solape-del-panel': `${Number((seccion.solape * 100).toFixed(4))}svh`,
    // MÓVIL-TRABAJOS: el alto suma el solape en todo ancho (la tabla cuenta con él); el margen, sólo desde escritorio.
    minHeight: `calc(${seccion.alto} + var(--solape-del-panel))`,
    // MÓVIL 2: el mismo alto, legible por las clases de adentro (Trabajos le suma el túnel estirado).
    '--alto-minimo-del-panel': `calc(${seccion.alto} + var(--solape-del-panel))`,
    marginTop: 'calc(-1 * var(--solape-en-uso, 0px))',
  } as React.CSSProperties
}

/** Prende el solape desde escritorio. Literal entera: armada, el escáner no la ve. */
const CLASE_DEL_SOLAPE = 'escritorio:[--solape-en-uso:var(--solape-del-panel)]'

/**
 * ⚠️ **LA CAJA SIN SOLAPE — el panel donde estaría si no subiera.** Vacía y sin
 * nombre accesible: va del tope sin solape al pie, que el solape no mueve. Es lo
 * que mide quien necesita la sección tal como la declara la tabla —la noche de
 * Trabajos, que se dispara contra ella— sin preguntar el ancho: su tope lee la
 * misma propiedad que el margen, así que sigue al corte por CSS.
 */
function CajaSinSolape(): React.JSX.Element {
  return (
    <div
      data-caja-sin-solape=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0"
      style={{ top: 'var(--solape-en-uso, 0px)' }}
    />
  )
}

/**
 * El rótulo del panel: el número en la columna lateral de 140px y el nombre en
 * la columna fluida. Es el único "contenido" que existe en este sprint.
 *
 * La columna lateral colapsa abajo de `tablet` (768px, token del sistema):
 * 140px fijos contra un viewport de 375 dejan la columna fluida en 155px, que
 * no es una grilla sino un accidente. Arriba de 768 la estructura medida
 * aparece entera.
 */
export function RotuloDePanel({ seccion }: { seccion: Seccion }) {
  return (
    <div className="max-w-tope mx-auto grid w-full grid-cols-1 gap-[var(--grilla-canal-amplio)] px-[var(--pad-lateral-compacto)] tablet:grid-cols-[var(--columna-lateral)_minmax(0,1fr)]">
      <p className="font-codigo text-micro tracking-micro leading-micro uppercase opacity-casi">
        {seccion.numero}
      </p>
      <h2 className="font-titulo text-titulo-l tracking-titulo leading-titulo">{seccion.nombre}</h2>
    </div>
  )
}

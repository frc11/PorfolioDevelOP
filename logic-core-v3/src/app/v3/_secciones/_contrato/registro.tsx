import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import type { IdDePatron } from '../../_lib/motion/patrones'
import type { Seccion as EntradaDeSeccion } from '../../_lib/secciones'
import { Cierre } from '../cierre/Cierre'
import { PEDIDO as PEDIDO_CIERRE } from '../cierre/contenido'
import { Hero } from '../hero/Hero'
import { PEDIDO as PEDIDO_HERO } from '../hero/contenido'
import { PorQueDevelop } from '../por-que-develop/PorQueDevelop'
import { PEDIDO as PEDIDO_POR_QUE } from '../por-que-develop/contenido'
import { QuienesSomos } from '../quienes-somos/QuienesSomos'
import { PEDIDO as PEDIDO_QUIENES } from '../quienes-somos/contenido'
import { Servicios } from '../servicios/Servicios'
import { PEDIDO as PEDIDO_SERVICIOS } from '../servicios/contenido'
import { Trabajos } from '../trabajos/Trabajos'
import { PEDIDO as PEDIDO_TRABAJOS } from '../trabajos/contenido'
import { TuPanel } from '../tu-panel/TuPanel'
import { PEDIDO as PEDIDO_TU_PANEL } from '../tu-panel/contenido'

import { IDS_DE_SECCION, seccionDe, type PropsDeSeccion } from './forma'
import { USOS_DECLARADOS } from './motion'
import type { EntradaDePedido } from './pedido'
import { Seccion } from './Seccion'

/**
 * ⚠️ NÚMEROS — EL MARCADOR SIN CONTENIDO (PORTFOLIO, etapa 2 de 3).
 *
 * `Numeros` —el componente real, en `../numeros/Numeros.tsx`— NO se importa
 * más acá: es la mitad de "sale del registro" (la otra mitad es el `alto` de
 * `secciones.ts`). Sus archivos siguen intactos; reconectarla es volver a
 * importarlo y devolverle esta entrada de `COMPONENTE_POR_ID`.
 *
 * Sigue habiendo un `<Panel>` —con su `data-panel="numeros"` y su región con
 * nombre accesible— porque `derivarAnclaje` necesita la sección para el tramo
 * `números` de la coreografía (ver el comentario en `secciones.ts`) y porque
 * los instrumentos que miden «las ocho secciones» como hermanas contiguas
 * (`extensionDeLasSecciones.ts`) siguen esperando ocho paneles en el DOM. Lo
 * único que cambia es que adentro no hay nada que ver: el `h2` existe para que
 * `aria-labelledby` no apunte a un id que no está, y va `sr-only` porque no hay
 * nada que anunciar.
 */
function NumerosDesconectada({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
        {seccion.nombre}
      </h2>
    </Seccion>
  )
}

/**
 * EL REGISTRO DE LAS OCHO — uno, no dos.
 *
 * ── Qué reemplaza ─────────────────────────────────────────────────────────
 *
 * Había dos: `registro.ts` con las cuatro del lane A y `recorrido.ts` con las
 * cuatro del lane B. Los dos hacían lo mismo —atar un id a su componente— y los
 * dos declaraban su propio orden. Con dos listas de orden, cuál manda es una
 * pregunta abierta; con una, no hay pregunta.
 *
 * **La divergencia y su resolución:** el lane B exportaba dos componentes por
 * sección —la pura y la de compuerta— porque cada sección resolvía su propia
 * compuerta. Con la compuerta resuelta arriba, en la composición, la segunda no
 * tiene para qué existir. Queda una entrada por sección y un componente por
 * entrada.
 *
 * ── El ORDEN no se escribe acá ────────────────────────────────────────────
 *
 * Sale de `IDS_DE_SECCION`, que sale de `_lib/secciones.ts`, que es la única
 * tabla del recorrido. Esta tabla sólo dice **qué componente corresponde a cada
 * id**; el orden, el alto y la superficie son de la tabla. Si mañana el
 * recorrido cambia, cambia en un lugar.
 *
 * Un id de la tabla sin componente acá hace fallar la construcción del
 * registro, con su nombre. Es lo que impide que una sección nueva quede
 * declarada y sin montar.
 *
 * ── Por qué vive en el contrato y no en `page.tsx` ────────────────────────
 *
 * Para que los instrumentos lo puedan importar. Un archivo de ruta de Next
 * tiene un juego cerrado de exportaciones válidas —`default`, `metadata` y poco
 * más—, así que colgarle un padrón sería pedirle al framework algo que no
 * promete.
 */

export interface SeccionRegistrada {
  readonly id: string
  /** La entrada de la tabla del recorrido: alto, superficie y pinneo. */
  readonly seccion: EntradaDeSeccion
  readonly Componente: (props: PropsDeSeccion) => React.JSX.Element
  /**
   * Dónde se edita el contenido de esta sección. Es el dato que hace accionable
   * el pedido: `CONTENIDO-PENDIENTE.md` lo publica y no lo transcribe.
   */
  readonly archivoDeContenido: string
  /** Qué patrones consume, derivado del padrón de usos. No se lista acá. */
  readonly patrones: readonly IdDePatron[]
  /** Lo que falta en esta sección. Es lo que produce `CONTENIDO-PENDIENTE.md`. */
  readonly pedido: readonly EntradaDePedido[]
}

/** Qué componente monta cada id. Lo único que esta tabla decide. */
const COMPONENTE_POR_ID: Readonly<Record<string, (props: PropsDeSeccion) => React.JSX.Element>> = {
  hero: Hero,
  'quienes-somos': QuienesSomos,
  numeros: NumerosDesconectada,
  trabajos: Trabajos,
  servicios: Servicios,
  'tu-panel': TuPanel,
  'por-que-develop': PorQueDevelop,
  cierre: Cierre,
}

/**
 * El pedido de cada sección. Lo declara la sección, al lado de su contenido:
 * quien edita el dato tiene el pedido a la vista, que es la mitad de que el
 * pedido no se quede viejo.
 */
const PEDIDO_POR_ID: Readonly<Record<string, readonly EntradaDePedido[]>> = {
  hero: PEDIDO_HERO,
  'quienes-somos': PEDIDO_QUIENES,
  // Desconectada: nada renderiza, nada se pide.
  numeros: [],
  trabajos: PEDIDO_TRABAJOS,
  servicios: PEDIDO_SERVICIOS,
  'tu-panel': PEDIDO_TU_PANEL,
  'por-que-develop': PEDIDO_POR_QUE,
  cierre: PEDIDO_CIERRE,
}

/** En qué carpeta vive cada sección. El nombre de la carpeta ES el id. */
const CARPETA = 'src/app/v3/_secciones'

/**
 * Los patrones de una sección, derivados del padrón de usos.
 *
 * Regla 14: los agregados se derivan, no se listan. El lane A declaraba
 * `PATRONES_DE_LA_SECCION` en cada `contenido.ts` y el lane B tenía
 * `USOS_DECLARADOS` con el motivo de cada uso. Gana el del lane B —una lista
 * que además dice PARA QUÉ— y la del lane A se deriva de ella en vez de vivir
 * en paralelo.
 */
function patronesDe(id: string): readonly IdDePatron[] {
  const usados = USOS_DECLARADOS.filter((u) => u.seccion === id).map((u) => u.patron)
  return [...new Set(usados)] as readonly IdDePatron[]
}

export const REGISTRO: readonly SeccionRegistrada[] = IDS_DE_SECCION.map((id) => {
  const Componente = COMPONENTE_POR_ID[id]
  if (Componente === undefined) {
    throw new Error(
      `registro: la sección "${id}" está en la tabla del recorrido y no tiene componente. ` +
        'Una sección declarada y sin montar es una sección que nadie ve.',
    )
  }
  const pedido = PEDIDO_POR_ID[id]
  if (pedido === undefined) {
    throw new Error(
      `registro: la sección "${id}" no declara su pedido. Sin pedido no entra en ` +
        'CONTENIDO-PENDIENTE.md, y lo que no está pedido no se llena.',
    )
  }
  return {
    id,
    seccion: seccionDe(id),
    Componente,
    archivoDeContenido: `${CARPETA}/${id}/contenido.ts`,
    patrones: patronesDe(id),
    pedido,
  }
})

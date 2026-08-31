import { CONTENIDO as CONTENIDO_HERO, PEDIDO as PEDIDO_HERO } from '../../_secciones/hero/contenido'
import { Hero } from '../../_secciones/hero/Hero'
import {
  CONTENIDO as CONTENIDO_NUMEROS,
  PEDIDO as PEDIDO_NUMEROS,
} from '../../_secciones/numeros/contenido'
import { Numeros } from '../../_secciones/numeros/Numeros'
import {
  CONTENIDO as CONTENIDO_QUIENES,
  PEDIDO as PEDIDO_QUIENES,
} from '../../_secciones/quienes-somos/contenido'
import { QuienesSomos } from '../../_secciones/quienes-somos/QuienesSomos'
import {
  CONTENIDO as CONTENIDO_TRABAJOS,
  PEDIDO as PEDIDO_TRABAJOS,
} from '../../_secciones/trabajos/contenido'
import { Trabajos } from '../../_secciones/trabajos/Trabajos'
import { seccionDe, type PropsDeSeccion } from '../../_secciones/_contrato/forma'
import type { EntradaDePedido } from '../../_secciones/_contrato/pedido'
import type { Seccion } from '../secciones'

/**
 * LAS CUATRO SECCIONES DE SITIO-S5, CON SU CONTENIDO COMO OBJETO.
 *
 * ── Por qué existe, y por qué NO sale del registro unificado ──────────────
 *
 * Los instrumentos de S5 recorren el contenido como DATO: `textosDe`,
 * `numerosDe`, `cuentaDeMarcadores` y `entradasColgadas` caminan el objeto y
 * afirman sobre sus hojas. Eso funciona porque las cuatro secciones de este
 * sprint exportan **un** `CONTENIDO`.
 *
 * Las cuatro del otro sprint no: exportan constantes sueltas —`TITULAR`,
 * `BLOQUES`, `CAPACIDADES`— y ahí el escaneo sobre el dato no aplica, así que
 * ese lane construyó el suyo sobre el TEXTO RENDERIZADO. **Los dos escáneres se
 * conservan porque miden cosas distintas**, y la elección está escrita en el
 * contrato: `marcadores.ts` mira el dato, `escaneo.ts` mira lo que se lee.
 *
 * El registro unificado no puede llevar `contenido`, entonces, sin inventar un
 * objeto para cuatro secciones que no lo tienen. Por eso el vínculo id →
 * contenido vive acá, con los instrumentos que lo necesitan, y no en el
 * contrato.
 *
 * ⚠ El orden es el del recorrido y sale de la tabla del sitio, no de esta
 * lista: lo único que esta tabla dice es qué contenido le corresponde a cada
 * id.
 */

export interface ModuloDeS5 {
  readonly id: string
  readonly seccion: Seccion
  readonly Componente: (props: PropsDeSeccion) => React.JSX.Element
  /** El contenido como dato. Es lo que recorre el escáner sobre el objeto. */
  readonly contenido: unknown
  readonly pedido: readonly EntradaDePedido[]
}

/** Las cuatro, en el orden del recorrido. */
export const IDS_DE_S5: readonly string[] = ['hero', 'quienes-somos', 'numeros', 'trabajos']

const POR_ID: Readonly<Record<string, Omit<ModuloDeS5, 'id' | 'seccion'>>> = {
  hero: { Componente: Hero, contenido: CONTENIDO_HERO, pedido: PEDIDO_HERO },
  'quienes-somos': {
    Componente: QuienesSomos,
    contenido: CONTENIDO_QUIENES,
    pedido: PEDIDO_QUIENES,
  },
  numeros: { Componente: Numeros, contenido: CONTENIDO_NUMEROS, pedido: PEDIDO_NUMEROS },
  trabajos: { Componente: Trabajos, contenido: CONTENIDO_TRABAJOS, pedido: PEDIDO_TRABAJOS },
}

export const MODULOS_DE_S5: readonly ModuloDeS5[] = IDS_DE_S5.map((id) => ({
  id,
  seccion: seccionDe(id),
  ...POR_ID[id],
}))

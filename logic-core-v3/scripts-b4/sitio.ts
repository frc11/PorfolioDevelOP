/**
 * LO QUE LOS TRES FRENTES MIDEN IGUAL — las primitivas compartidas.
 *
 * ── Por qué existe, y sale de un hallazgo de B2 ───────────────────────────
 *
 * `B2-DELTAS` §10, «el hallazgo de la integración»: tres frentes aislados
 * llegaron al mismo mecanismo, con el mismo cuerpo, carácter por carácter, sin
 * poder verse entre sí. La conclusión que dejó escrita es la que gobierna este
 * archivo: **cuando tres soluciones independientes convergen, lo que falta no es
 * coordinación entre quienes las escribieron, es una primitiva que el contrato
 * no tenía.**
 *
 * Acá están las tres cosas que los tres frentes van a querer: dónde están las
 * secciones, cuánto mide el documento, y el censo de acontecimientos. Escritas
 * una vez, así ninguna tabla del reporte discute con otra por la definición.
 *
 * Lo que NO está acá es lo que un solo frente necesita —desbordes, áreas de
 * toque, anclas—: eso vive en el script de su frente. Compartir de más es tan
 * malo como compartir de menos.
 */

import { agrupar, fuenteDelCenso, type Censo, type LecturaDelCenso } from './censo'
import { medir, type Pagina } from './navegador'

export interface Panel {
  readonly id: string
  readonly alto: number
  readonly top: number
}

/**
 * Las ocho secciones, por atributo y nunca por texto.
 *
 * `data-panel` lo emite `_componentes/Panel.tsx` y es estable; el texto es
 * relleno declarado y va a cambiar. Lo dice la receta y acá se cumple.
 *
 * ⚠️ **`getBoundingClientRect()` miente con transformadas CSS activas** — es una
 * lección ya pagada en este repo. El `top` de un panel es seguro porque el panel
 * es el contenedor del flujo y la coreografía transforma a sus HIJOS; medir un
 * hijo con esta función y creerle es otra cosa, y el frente que lo haga tiene que
 * neutralizar la transformada primero.
 */
export async function paneles(p: Pagina): Promise<readonly Panel[]> {
  return medir<Panel[]>(
    p,
    `[...document.querySelectorAll('[data-panel]')].map((el) => {
      const r = el.getBoundingClientRect()
      return { id: el.dataset.panel, alto: r.height, top: r.top + window.scrollY }
    })`,
  )
}

export interface Documento {
  readonly alturaPx: number
  readonly ventanaPx: number
  readonly pantallas: number
  readonly anchoDelDocumento: number
  readonly anchoDeLaVentana: number
}

/**
 * El documento entero. `anchoDelDocumento` contra `anchoDeLaVentana` es el
 * detector de desborde horizontal más barato que hay, y por eso está acá: es la
 * primera cosa que cualquier frente va a mirar en mobile.
 */
export async function documento(p: Pagina): Promise<Documento> {
  return medir<Documento>(
    p,
    `(() => {
      const d = document.documentElement
      return {
        alturaPx: d.scrollHeight,
        ventanaPx: window.innerHeight,
        pantallas: Math.round((100 * d.scrollHeight) / window.innerHeight) / 100,
        anchoDelDocumento: d.scrollWidth,
        anchoDeLaVentana: window.innerWidth,
      }
    })()`,
  )
}

export interface ResultadoDelCenso {
  readonly lectura: LecturaDelCenso
  readonly censo: Censo
  /** `true` si NINGUNA parada vio un solo estilo en línea. Ver abajo. */
  readonly sinSistemaDeMovimiento: boolean
}

/**
 * El censo de acontecimientos, de punta a punta: barre en la página, agrupa en
 * Node.
 *
 * ⚠️ **`sinSistemaDeMovimiento` es lo que separa un hallazgo de un error.**
 * Abajo de 1025 la compuerta no monta el escenario ni la coreografía, así que
 * **cero acontecimientos es el resultado esperado y es EL hallazgo**. Pero cero
 * también es lo que devolvería un instrumento que no vio la página. La serie
 * `estiloPorParada` los separa: toda en cero significa que no hay un solo estilo
 * en línea en el documento —el sistema de movimiento no está montado—; con
 * valores y sin aterrizajes, es otra cosa y hay que ir a mirarla.
 */
export async function censar(
  p: Pagina,
  opciones: { readonly desde: number; readonly hasta: number; readonly paso: number },
): Promise<ResultadoDelCenso> {
  const lectura = await medir<LecturaDelCenso>(p, `(${fuenteDelCenso(opciones)})()`)
  if (lectura.visibilityState !== 'visible' || lectura.innerWidth === 0) {
    throw new Error(
      `censo inválido: visibilityState="${lectura.visibilityState}", innerWidth=${lectura.innerWidth}`,
    )
  }
  return {
    lectura,
    censo: agrupar(lectura),
    sinSistemaDeMovimiento: lectura.estiloPorParada.every((n) => n === 0),
  }
}

/**
 * A qué sección pertenece un `scrollY`, por DUEÑO y no por posición.
 *
 * ⚠️ La distinción es de `B2-DELTAS` §8 y cambia una cifra: un bloque aterriza
 * cuando su caja termina de entrar al cuadro, así que **sus piezas pueden
 * aterrizar antes de que su sección llegue al tope del viewport**. Partir por el
 * `scrollY` del aterrizaje le atribuye al Hero un grupo que es de Quiénes somos.
 * Esta función hace lo simple —partir por posición— y por eso lleva el nombre
 * que lleva: quien necesite atribuir por dueño tiene que mirar el elemento.
 */
export function seccionEnPosicion(paneles: readonly Panel[], y: number): string | null {
  for (const s of paneles) if (y >= s.top && y < s.top + s.alto) return s.id
  return null
}

'use client'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeTitular, CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { MarcoDeMedio } from '../_contrato/medios'
import { ContenidoDeSeccion, EncabezadoDeSeccion, Seccion } from '../_contrato/Seccion'
import { Capacidades } from './Capacidades'
import {
  BLOQUES,
  CAPACIDADES,
  CAPTURA,
  COLUMNAS_DE_LA_GRILLA,
  ID,
  NOMBRE,
  TITULAR,
  TITULO_DE_CAPACIDADES,
  type BloqueDeTexto,
} from './contenido'

/**
 * SECCIÓN 06 — TU PANEL. El producto propio, en dos tiempos.
 *
 * ── `anima` entra como propiedad y acá adentro no se consulta ─────────────
 *
 * La compuerta la lee el envoltorio del final del archivo. Esta función recibe un
 * booleano y nada más, y eso es lo que permite que el instrumento renderice las
 * DOS ramas —con coreografía y sin ella— sin inventar un atributo de forzado en
 * el producto. Abajo de 1025, o con movimiento reducido, no se monta un solo hook
 * del sistema de motion: `Bloque` cambia de componente, no de duración.
 *
 * ── Tres patrones, tres bloques medidos, y ninguna secuencia ──────────────
 *
 * Cada patrón tiene su propio `Bloque` porque cada uno tiene su propio RANGO DE
 * SCROLL: el ancla de P1 no es la de P2 ni la de P4, y un progreso compartido los
 * pondría a todos a correr con la geometría de uno solo. Esta sección **no es una
 * secuencia sincronizada** —la única del sprint es Servicios— y no debe serlo:
 * son revelados independientes, cada uno cuando le toca.
 *
 * P2 va más lejos: la referencia lo mide con **un solo target por instancia**, así
 * que cada bloque de texto y la captura llevan su PROPIO `Bloque`. Cuatro rangos,
 * no uno con cuatro piezas. La alternativa —un `Bloque` con cuatro
 * `CanalDeUnaPieza`— es una línea menos y hace entrar los cuatro a la vez, que es
 * justo el gesto que P2 no es.
 *
 * ── Los dos tiempos, y por qué son dos ────────────────────────────────────
 *
 * Cada `ContenidoDeSeccion` declara `min-h-svh` y reparte lo suyo. El primero
 * presenta el panel; el segundo es la lista. Están separados porque el ancla de
 * P4 —`top bottom` → `bottom top`— recorre el alto del bloque MÁS un viewport
 * entero: apretada contra la captura, la lista entraría casi entera antes de que
 * alguien la vea. El `min-height` del `Panel` es un mínimo y el contenido puede
 * pasarlo, así que la sección mide dos pantallas aunque la tabla del lane A diga
 * `100svh`. El invariante cuenta los `min-h-svh` del marcado y publica el delta.
 *
 * ── B1 · LA RESTA: `justify-center` era el que fabricaba la banda ──────────
 *
 * Medido sobre el píxel, la sección tenía **62,04 % de aire muerto y una banda
 * vacía continua de 445 px** en su captura de 1920 × 2160 (359 px a 1440), más
 * 227,12 px de cola al final. La cuenta del DOM dice de dónde salían: los dos
 * tiempos **centraban** su contenido, así que el sobrante de cada uno quedaba
 * partido en dos mitades **y las dos mitades del medio se sumaban** — 117 px del
 * pie del tiempo 1 más 321 px de la cabeza del tiempo 2 = **438,46 px de nada**
 * en la costura, justo donde la sección cambia de tema.
 *
 * Tres cambios, ninguno de contenido:
 *
 *   1. **`justify-between` en vez de `justify-center`.** El sobrante deja de
 *      apilarse en dos lugares y se reparte entre TODAS las costuras del tiempo.
 *      A 1920 el tiempo 1 pasa de 116 · 44 · 45 · 117 a 80 · 81 · 81 · 80.
 *   2. **Una regla en la costura.** El tiempo 2 abre con un `border-t` a ancho
 *      de contenido, pegado al borde superior de su pantalla: parte en dos la
 *      banda que unía los dos tiempos y le da entrada al segundo tema. No es
 *      decoración: es el único trazo que puede caer exactamente en la juntura.
 *   3. **La lista se estira** (`Capacidades.tsx`): a escritorio pasa a una
 *      columna a ancho completo con `content-between`, así sus once reglas
 *      reparten la pantalla en once tramos en vez de dejar una cola de 227 px.
 *
 * El alto de la sección **no se toca**: sigue siendo el mismo `200svh` de la
 * tabla y los mismos dos `min-h-svh` que el invariante cuenta. Lo que cambia es
 * dónde cae el aire adentro de esos dos altos.
 */
export function TuPanel({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* TIEMPO 1 — qué es el panel, y cómo se ve.
          `py-20` son los 80 px que la pastilla de navegación se lleva del pie y
          de la cabeza de cada pantalla (`_lib/navegacion.ts`); `flex-1` +
          `justify-between` reparten el sobrante entre las tres costuras en vez
          de amontonarlo arriba y abajo. */}
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col py-[var(--spacing-20)]"
        claseDeContenido="flex flex-1 flex-col justify-between gap-[var(--spacing-12)]"
      >
        <EncabezadoDeSeccion seccion={seccion} nombre={NOMBRE} />

        <Bloque patron="P1">
          {(progreso) => (
            /* ⚠ El envoltorio existe por UNA razón y está de paso: es el que lleva
               el `id` con el que la `<section>` se nombra (S11, defecto 10). El `h2`
               sale de `CanalDeTitular`, que NO tiene prop `id` —`canales.tsx` y
               `coreografia-animada.tsx` no son de este frente—, así que el id va en
               el elemento que lo contiene: el nombre accesible se computa del
               contenido, y el contenido de este `div` es exactamente el titular. Es
               una caja de bloque adentro de otra: no mueve un píxel. El día que el
               canal acepte `id`, esto se borra y queda una línea. */
            <div id={idDelTitularDeSeccion(seccion.id)}>
              <CanalDeTitular
                progreso={progreso}
                patron="P1"
                texto={TITULAR}
                nivel="titulo-l"
                como="h2"
              />
            </div>
          )}
        </Bloque>

        {/* ⚠ `items-start` estaba y se saca: dejaba la columna de texto colgada
            del borde de arriba y el hueco de 205 px que sobraba contra el alto
            de la captura quedaba abajo, al lado de la imagen. Con el estirado
            por defecto la columna mide lo mismo que la captura y su
            `justify-between` reparte esos 205 px entre los tres bloques. */}
        <Grilla columnas={COLUMNAS_DE_LA_GRILLA}>
          {/* La captura ocupa tres de las cinco columnas arriba de 1025 y el ancho
              entero abajo, que es la geometría exacta que declara su `sizes`. */}
          <div className="escritorio:col-span-3">
            <Bloque patron="P2">
              {(progreso) => (
                <CanalDeUnaPieza progreso={progreso} patron="P2">
                  <MarcoDeMedio
                    clase="imagen"
                    marcador={CAPTURA.marcador}
                    fuente={null}
                    alt={CAPTURA.descripcion}
                    ancho={CAPTURA.ancho}
                    alto={CAPTURA.alto}
                    sizes={CAPTURA.sizes}
                    descripcion={CAPTURA.descripcion}
                  />
                </CanalDeUnaPieza>
              )}
            </Bloque>
          </div>

          <div className="escritorio:col-span-2 flex h-full flex-col justify-between gap-[var(--spacing-8)]">
            {BLOQUES.map((bloque) => (
              <ParrafoDelPanel key={bloque.rotulo} bloque={bloque} />
            ))}
          </div>
        </Grilla>
      </ContenidoDeSeccion>

      {/* TIEMPO 2 — qué se hace ahí adentro.
          Sin `pt`: la regla del `border-t` cae EXACTAMENTE en la juntura de las
          dos pantallas, que es la única posición desde la que puede partir en
          dos la banda vacía que las unía. El aire de arriba lo pone el `py-20`
          del tiempo 1 y el de abajo, el `pb-20` de acá. */}
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col pb-[var(--spacing-20)]"
        claseDeContenido="border-borde flex flex-1 flex-col gap-[var(--spacing-12)] border-t pt-[var(--spacing-8)]"
      >
        <Titular nivel="titulo-m" como="h3">
          {TITULO_DE_CAPACIDADES}
        </Titular>

        {/* El bloque crece con la pantalla para que la lista tenga contra qué
            repartirse: sin esto `content-between` no tiene sobrante que dar. */}
        <Bloque patron="P4" className="flex flex-1 flex-col">
          {(progreso) => <Capacidades progreso={progreso} />}
        </Bloque>
      </ContenidoDeSeccion>
    </Seccion>
  )
}

/**
 * UN BLOQUE DE TEXTO — P2, un target, su propio rango.
 *
 * El rótulo es un encabezado de verdad (`h3`) y no un `<p>` en mayúsculas: quien
 * navega por encabezados tiene que poder saltar de "Qué es" a "Quién entra". La
 * sangría de `EtiquetaDeSeccion` se apaga porque acá no hay columna lateral que
 * la justifique — la separación la da la grilla.
 */
function ParrafoDelPanel({ bloque }: { readonly bloque: BloqueDeTexto }): React.JSX.Element {
  return (
    <Bloque patron="P2">
      {(progreso) => (
        <CanalDeUnaPieza
          progreso={progreso}
          patron="P2"
          className="flex flex-col gap-[var(--spacing-2)]"
        >
          <EtiquetaDeSeccion como="h3" sangria={false}>
            {bloque.rotulo}
          </EtiquetaDeSeccion>
          {/* El color va DIRECTO en el componente de texto. Los dos lanes lo
              habían tenido que poner en un envoltorio para que `cn()` no se
              comiera la clase de tamaño; SITIO-S7 arregló la raíz en
              `src/lib/utils.ts` y el rodeo se saca. Un arreglo de raíz que deja
              los parches es código muerto que esconde el arreglo. */}
          <Cuerpo className="text-tinta-media">{bloque.texto}</Cuerpo>
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}

/** Cuántas piezas anima cada patrón. Es lo que el instrumento cuenta en el HTML. */
export const PIEZAS_POR_PATRON = {
  /** El titular entero: una instancia de P1, partida en líneas por el divisor. */
  P1: 1,
  /** Los tres bloques de texto MÁS la captura. Un target cada uno. */
  P2: BLOQUES.length + 1,
  /** Un `<li>` por capacidad. */
  P4: CAPACIDADES.length,
} as const

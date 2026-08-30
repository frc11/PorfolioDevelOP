'use client'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { ANCLAS } from '../../_lib/motion/anclas'
import { PATRONES } from '../../_lib/motion/patrones'
import { Bloque } from '../_contrato/Bloque'
import { CanalDeTitular, CanalDeUnaPieza } from '../_contrato/Canales'
import { useAnima } from '../_contrato/Compuerta'
import { HuecoDeMedio } from '../_contrato/HuecoDeMedio'
import { inerciaDe } from '../_contrato/motion'
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
 * Cada `ContenidoDeSeccion` declara `min-h-svh` y centra lo suyo. El primero
 * presenta el panel; el segundo es la lista. Están separados porque el ancla de
 * P4 —`top bottom` → `bottom top`— recorre el alto del bloque MÁS un viewport
 * entero: apretada contra la captura, la lista entraría casi entera antes de que
 * alguien la vea. El `min-height` del `Panel` es un mínimo y el contenido puede
 * pasarlo, así que la sección mide dos pantallas aunque la tabla del lane A diga
 * `100svh`. El invariante cuenta los `min-h-svh` del marcado y publica el delta.
 */
export function TuPanel({ anima }: { readonly anima: boolean }): React.JSX.Element {
  return (
    <Seccion id={ID}>
      {/* TIEMPO 1 — qué es el panel, y cómo se ve. */}
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col justify-center py-[var(--spacing-20)]"
        claseDeContenido="flex flex-col gap-[var(--spacing-12)]"
      >
        <EncabezadoDeSeccion id={ID} nombre={NOMBRE} />

        <Bloque anclas={ANCLAS.P1} inerciaSegundos={inerciaDe(PATRONES.P1)} anima={anima}>
          {(progreso) => (
            <CanalDeTitular
              progreso={progreso}
              patron={PATRONES.P1}
              texto={TITULAR}
              nivel="titulo-l"
              como="h2"
            />
          )}
        </Bloque>

        <Grilla columnas={COLUMNAS_DE_LA_GRILLA} className="items-start">
          {/* La captura ocupa tres de las cinco columnas arriba de 1025 y el ancho
              entero abajo, que es la geometría exacta que declara su `sizes`. */}
          <div className="escritorio:col-span-3">
            <Bloque anclas={ANCLAS.P2} inerciaSegundos={inerciaDe(PATRONES.P2)} anima={anima}>
              {(progreso) => (
                <CanalDeUnaPieza progreso={progreso} patron={PATRONES.P2}>
                  <HuecoDeMedio
                    clase="imagen"
                    marcador={CAPTURA.marcador}
                    relacion={CAPTURA.relacion}
                    sizes={CAPTURA.sizes}
                    descripcion={CAPTURA.descripcion}
                  />
                </CanalDeUnaPieza>
              )}
            </Bloque>
          </div>

          <div className="escritorio:col-span-2 flex flex-col gap-[var(--spacing-8)]">
            {BLOQUES.map((bloque) => (
              <ParrafoDelPanel key={bloque.rotulo} bloque={bloque} anima={anima} />
            ))}
          </div>
        </Grilla>
      </ContenidoDeSeccion>

      {/* TIEMPO 2 — qué se hace ahí adentro. */}
      <ContenidoDeSeccion
        className="flex min-h-svh flex-col justify-center py-[var(--spacing-20)]"
        claseDeContenido="flex flex-col gap-[var(--spacing-12)]"
      >
        <Titular nivel="titulo-m" como="h3">
          {TITULO_DE_CAPACIDADES}
        </Titular>

        <Bloque anclas={ANCLAS.P4} inerciaSegundos={inerciaDe(PATRONES.P4)} anima={anima}>
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
function ParrafoDelPanel({
  bloque,
  anima,
}: {
  readonly bloque: BloqueDeTexto
  readonly anima: boolean
}): React.JSX.Element {
  return (
    <Bloque anclas={ANCLAS.P2} inerciaSegundos={inerciaDe(PATRONES.P2)} anima={anima}>
      {(progreso) => (
        <CanalDeUnaPieza
          progreso={progreso}
          patron={PATRONES.P2}
          className="flex flex-col gap-[var(--spacing-2)]"
        >
          <EtiquetaDeSeccion como="h3" sangria={false}>
            {bloque.rotulo}
          </EtiquetaDeSeccion>
          {/* EL COLOR VA EN EL ENVOLTORIO, NO EN EL COMPONENTE DE TEXTO. `cn()` es
              `twMerge` y no conoce los nombres de v3: mete `text-<tamaño>` y
              `text-<color>` en el mismo grupo y descarta uno EN SILENCIO —
              `text-tinta-media` por `className` le borra `text-cuerpo` a
              `Cuerpo`, sin error de build ni de tipos. Está medido, y el
              invariante lo afirma sobre el marcado: cada elemento con
              `data-nivel` conserva su tamaño, su familia y su peso. */}
          <div className="text-tinta-media">
            <Cuerpo>{bloque.texto}</Cuerpo>
          </div>
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}

/**
 * EL ENVOLTORIO DE COMPUERTA — lo que consume la ruta.
 *
 * Es el único lugar de la sección que llama a `useAnima()`. La ruta monta esto;
 * el instrumento monta `TuPanel` con el booleano puesto a mano.
 */
export function TuPanelConCompuerta(): React.JSX.Element {
  const anima = useAnima()
  return <TuPanel anima={anima} />
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

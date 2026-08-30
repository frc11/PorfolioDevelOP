'use client'

import { Grilla } from '../../_componentes/layout/Grilla'
import { Titular } from '../../_componentes/tipografia/Titular'
import { PATRONES } from '../../_lib/motion/patrones'
import { Bloque } from '../_contrato/Bloque'
import { CanalDePieza, CanalDeTitular } from '../_contrato/Canales'
import { useAnima } from '../_contrato/Compuerta'
import { inerciaDe } from '../_contrato/motion'
import { ContenidoDeSeccion, EncabezadoDeSeccion, Seccion } from '../_contrato/Seccion'
import { BloqueDeTestimonio, TarjetaDeDiferencial } from './Diferenciales'
import {
  ALTO_MINIMO_DEL_BLOQUE,
  DIFERENCIALES,
  ENTRADA,
  INDICE_DEL_TESTIMONIO,
  NOMBRE_DE_SECCION,
  PIEZAS_DE_P5,
  TESTIMONIO,
  TITULAR,
} from './contenido'

/**
 * SECCIÓN 07 — POR QUÉ DEVELOP. El diferencial, sobre la escena.
 *
 * ── Lo que la hace distinta de las otras tres ─────────────────────────────
 *
 * Es el segundo de los tres momentos de escena del recorrido y el único en
 * medio de la página: su superficie de contrato es `papel-transparente`, o sea
 * que el panel **no pinta fondo** y deja ver lo que hay detrás.
 *
 * ⚠️ La tabla que renderiza —`_lib/secciones.ts`, que escribe el otro lane—
 * declara hoy `papel-opaco` para esta sección. **Esta sección es correcta con
 * las dos y no hay que tocarle una línea el día que cambie**, porque no pinta
 * un color: consume `text-tinta` heredado del panel, `--color-borde` para las
 * separaciones y nada más. Queda reportado como divergencia, no resuelto acá.
 *
 * Y por la misma razón, lo que este archivo **no** hace: no agrega una capa, ni
 * un velo, ni un gradiente, ni un fondo para "asegurar" la lectura sobre el
 * escenario. Si el contraste no da, se reporta. Inventar una capa acá sería
 * tomar por cuenta propia una decisión de dirección de arte que no es de este
 * sprint. El invariante afirma la ausencia, archivo por archivo.
 *
 * ── Dos bloques medidos, dos patrones ─────────────────────────────────────
 *
 *   · **P1** sobre el titular, línea por línea. Es el 58 % del corpus de la
 *     referencia y el ancla no puede degenerar: su rango es `alto + 160px`.
 *   · **P5** sobre las cinco piezas que aparecen —los cuatro diferenciales y
 *     el testimonio—. Es el único patrón LINEAL del sitio, uno de sus pocos
 *     usos, y `_contrato/motion.ts` ya lo declara para esta sección en
 *     `USOS_DECLARADOS`. Su escalonado medido es 0: las cinco arrancan juntas.
 *
 * P5 es también el único cuyo rango puede salir NEGATIVO —mide
 * `alto − 0,4·viewport`—, así que su bloque declara un alto mínimo. De dónde
 * sale ese número está escrito en `contenido.ts`, y el invariante lo verifica
 * con `rangoDegenerado` en las dos direcciones.
 *
 * ── `anima` entra como propiedad y no se consulta acá ─────────────────────
 *
 * Es lo que permite que el invariante renderice las dos ramas sin inventar un
 * atributo de forzado en el producto. Quien consulta la compuerta es el
 * envoltorio de abajo, y lo usa la ruta.
 */

const ID = 'por-que-develop'

/** Los dos patrones, leídos del registro. Ninguno de sus valores se escribe. */
const P1 = PATRONES.P1
const P5 = PATRONES.P5

export function PorQueDevelop({ anima }: { readonly anima: boolean }): React.JSX.Element {
  return (
    <Seccion id={ID}>
      <ContenidoDeSeccion claseDeContenido="flex flex-col gap-[var(--spacing-12)] py-[var(--spacing-12)]">
        <EncabezadoDeSeccion id={ID} nombre={NOMBRE_DE_SECCION} />

        <Bloque anclas={P1.anclas} inerciaSegundos={inerciaDe(P1)} anima={anima}>
          {(progreso) => (
            <Grilla columnas={3} canal="amplio">
              <div className="flex flex-col gap-[var(--spacing-6)] tablet:col-span-2">
                <CanalDeTitular
                  progreso={progreso}
                  patron={P1}
                  texto={TITULAR}
                  nivel="titulo-xl"
                  como="h2"
                />
                <Titular nivel="titulo-s" como="p">
                  {ENTRADA}
                </Titular>
              </div>
            </Grilla>
          )}
        </Bloque>

        {/* El `min-height` va en estilo inline porque el valor viene del DATO y
            lleva unidad: una clase armada como `min-h-[${n}svh]` no la ve el
            escáner de Tailwind y su regla no se emitiría nunca. Es la misma
            excepción que `Panel` declara para el alto de la sección y
            `HuecoDeMedio` para su relación de aspecto, y es la ÚNICA de esta
            carpeta. Su derivación está en `contenido.ts`. */}
        <Bloque
          anclas={P5.anclas}
          inerciaSegundos={inerciaDe(P5)}
          anima={anima}
          style={{ minHeight: ALTO_MINIMO_DEL_BLOQUE }}
        >
          {(progreso) => (
            <Grilla columnas={3} canal="amplio">
              <ul className="grid grid-cols-1 gap-[var(--grilla-canal-amplio)] tablet:col-span-2 tablet:grid-cols-2">
                {DIFERENCIALES.map((diferencial, indice) => (
                  <li key={diferencial.clave}>
                    <CanalDePieza
                      progreso={progreso}
                      patron={P5}
                      cantidad={PIEZAS_DE_P5}
                      indice={indice}
                    >
                      <TarjetaDeDiferencial diferencial={diferencial} />
                    </CanalDePieza>
                  </li>
                ))}
              </ul>
              <CanalDePieza
                progreso={progreso}
                patron={P5}
                cantidad={PIEZAS_DE_P5}
                indice={INDICE_DEL_TESTIMONIO}
              >
                <BloqueDeTestimonio testimonio={TESTIMONIO} />
              </CanalDePieza>
            </Grilla>
          )}
        </Bloque>
      </ContenidoDeSeccion>
    </Seccion>
  )
}

/**
 * EL ENVOLTORIO DE COMPUERTA — lo que consume la ruta.
 *
 * La sección no llama a este hook: lo llama esto, y le pasa el resultado como
 * propiedad. Arriba de 1025 y sin preferencia de movimiento reducido anima;
 * en cualquier otro caso monta el árbol quieto, que es el mismo contenido sin
 * un solo hook del sistema de motion.
 */
export function PorQueDevelopConCompuerta(): React.JSX.Element {
  const anima = useAnima()
  return <PorQueDevelop anima={anima} />
}

'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza, CanalDeUnaPieza, ProgresoAmortiguado, SignoDistinto, Trazo } from '../_contrato/canales'
import { Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'

import { CONTENIDO, TRAMOS_DEL_TITULAR, TRAMOS_DEL_TITULAR_EN_LA_BANDA } from './contenido'
import { ElEquipo, LaFoto } from './equipo'
import { Pantalla } from './pantalla'
import { CLASES_DEL_REPARTO, GEOMETRIA } from './geometria'

/** Se re-exportan para que quien ya las importaba de acá —los instrumentos— no cambie de puerta. */
export { GEOMETRIA, SIZES_DEL_RETRATO, SIZES_DE_LA_FOTO } from './geometria'


/** PANTALLA 1 · LA AGENCIA — quiénes somos y qué somos, repartido sobre la pantalla
 *  entera. El lugar cierra abajo a la derecha: juntura pareja, y esquiva la pastilla. */
function LaAgencia({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Pantalla nombre="agencia">
      {/* ⚠️ **LA COLUMNA LATERAL COLAPSA HASTA EL CORTE, NO HASTA 768.** `lateral`
          la abre en `tablet:`, así que a 768 reservaba sus 140 px + canaleta y el
          titular medía **552 de 704** — y esa reserva es la que ponía el texto en una
          columna angosta con el margen derecho vacío. Es la misma corrección que
          COMPO-1 §5 ya hizo en el hero (`claseDeLaColumnaLateral`), por el mismo
          motivo medido: a 768 esa celda está VACÍA. */}
      <Grilla
        columnas="lateral"
        className={cn('grow', GEOMETRIA.claseDeLaColumnaLateral)}
      >
        {/* Modo pulido: se pidió sacar el cuadrado de acento de esta pantalla. La columna se queda (B11/Rotulo.tsx), como en ElEquipo. */}
        <div />
        <div data-composicion="agencia" className={CLASES_DEL_REPARTO}>
          {/* ⚠️ B12: el rótulo y su celda se fueron; el titular NO se mueve. */}          {/* ⚠️ EL TITULAR DEJÓ `TextoPorLineas`, por el mismo motivo que el del Hero: ese
              divisor reparte UNA cadena con UNA métrica y acá hay dos tramos con raya
              propia. El patrón no cambia —sigue siendo P1, con su ancla y sus claves—,
              cambia que la pieza es una sola. El Bloque de adentro no mide para entrar:
              mide la ventana en la que los trazos SE DIBUJAN, que es otra. */}
          <Bloque
            patron="P1"
            rango={GEOMETRIA.rangoDeLaMascara}
            className={cn(GEOMETRIA.reparto.titular, GEOMETRIA.tipografiaDelTitular, GEOMETRIA.medidaDelTitular)}
            style={GEOMETRIA.estilos.titular}
          >
            {(progresoDeEntrada) => (
              <Bloque patron="P1" rango="ventana-del-trazo">
                {(progresoDelTrazo) => (
                  <>
                    {/* El encabezado real, con la frase entera: es lo único que entra al árbol de accesibilidad. */}
                    <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
                      {CONTENIDO.titular}
                    </h2>
                    {/* ⚠️ LA MÁSCARA, AHORA POR RENGLÓN. P1 mueve `yPercent 120 → 0`
                        —«cada línea sube desde una altura de sí misma»— y con UNA sola
                        caja los dos renglones salían del mismo piso, el del bloque. Con
                        una ventana por renglón cada uno sale de SU línea, y de paso P1
                        recupera su escalonado: son dos piezas, no una.
                        El contenedor es `flex` a propósito — ahí los márgenes negativos
                        de las ventanas NO colapsan, así que la holgura del recorte sigue
                        aportando cero al layout, igual que en `LineasDeTexto`. */}
                    {/* La mezcla va en el envoltorio de los dos renglones y no por
                        renglón: así el titular y SUS TRAZOS —el subrayado y el
                        tachado— componen como un grupo y invierten juntos. Si el
                        texto invirtiera y los trazos no, quedarían en tinta oscura
                        sobre el logo oscuro, que es el defecto que esto evita. */}
                    {/* ⚠️ **DOS REPARTOS DEL MISMO TITULAR, Y UNO SOLO SE VE.**
                        Hasta la banda de tablet la frase va en CUATRO renglones y el
                        tachado alcanza sólo «de siempre»: partido en dos renglones no se
                        lee como tachado sino como defecto de render. Arriba van los dos
                        renglones de siempre, con el tachado sobre la frase entera.

                        ⚠️ El corte es `movil:` / `max-movil:` —426—, o sea que los cuatro
                        renglones viven EXACTO en la banda móvil. Nació estirado hasta 859
                        (`medio:`) porque el tema no tenía corte en 425; ahora lo tiene
                        (`--breakpoint-movil`) y la regla termina donde debe. De 426 para
                        arriba van los dos renglones de siempre, tablet incluido.

                        Los dos son `aria-hidden`: el nombre accesible lo da el `h2`
                        `sr-only` de arriba con la frase entera, así que duplicar el
                        marcado visual no duplica nada de lo que se anuncia. */}
                    {[
                      { tramos: TRAMOS_DEL_TITULAR_EN_LA_BANDA, clase: 'movil:hidden' },
                      { tramos: TRAMOS_DEL_TITULAR, clase: 'max-movil:hidden' },
                    ].map((reparto) => (
                      <div
                        key={reparto.clase}
                        aria-hidden="true"
                        className={cn('flex flex-col', reparto.clase, MEZCLA_SOBRE_LA_ESCENA)}
                      >
                        {reparto.tramos.map((renglon, indice) => (
                          <span key={`${renglon.antes}${renglon.marcado}`} className={GEOMETRIA.ventanaDelTexto}>
                            <CanalDePieza
                              progreso={progresoDeEntrada}
                              patron="P1"
                              cantidad={reparto.tramos.length}
                              indice={indice}
                              como="span"
                              className="block"
                            >
                              {renglon.antes}
                              {renglon.tipo === null ? null : (
                                <>
                                  {renglon.antes === '' ? null : ' '}
                                  <Trazo
                                    progreso={progresoDelTrazo}
                                    tipo={renglon.tipo}
                                    className={GEOMETRIA.pesosDelTitular[renglon.tipo]}
                                  >
                                    {renglon.marcado}
                                  </Trazo>
                                  {renglon.cierre}
                                </>
                              )}
                            </CanalDePieza>
                          </span>
                        ))}
                      </div>
                    ))}
                  </>
                )}
              </Bloque>
            )}
          </Bloque>

          {/* El ≠ lleva la tipografía del titular sin escribir texto: de ahí salen su `em` y su medida, y con ellas el alto y el centrado. */}
          <Bloque
            patron="P1"
            rango="ventana-del-trazo"
            className={cn(
              GEOMETRIA.reparto.signo,
              GEOMETRIA.tipografiaDelTitular,
              GEOMETRIA.medidaDelTitular,
            )}
            style={GEOMETRIA.estilos.titular}
          >
            {(progresoDelSigno) => <SignoDistinto progreso={progresoDelSigno} className={MEZCLA_SOBRE_LA_ESCENA} />}
          </Bloque>

          <Bloque
            patron="P2"
            rango="ventana-visible"
            className={cn(GEOMETRIA.reparto.bajada, GEOMETRIA.medidaAgencia)}
            style={GEOMETRIA.estilos.bajada}
          >
            {(progreso) => (
              <CanalDeUnaPieza progreso={progreso} patron="P2">
                <p className={GEOMETRIA.cuerpoDeLaBajada}>{CONTENIDO.bajada}</p>
              </CanalDeUnaPieza>
            )}
          </Bloque>

        </div>
      </Grilla>
    </Pantalla>
  )
}

export function QuienesSomos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* `--medida-movil` se declara acá arriba: la consumen la bajada y las
          descripciones del equipo, y una sola declaración no se desincroniza. */}
      <Envoltorio style={GEOMETRIA.estilos.seccion}>
        <LaAgencia seccion={seccion} />
        <ElEquipo />
        <LaFoto />
      </Envoltorio>
    </Seccion>
  )
}

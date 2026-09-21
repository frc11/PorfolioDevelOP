'use client'

import { cn } from '@/lib/utils'

import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza, CanalDeUnaPieza, LlegadaEnCurva, ProgresoAmortiguado } from '../_contrato/canales'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'

import { CONTENIDO } from './contenido'
import { CLASES_DEL_REPARTO, GEOMETRIA, SIZES_DEL_RETRATO, SIZES_DE_LA_FOTO } from './geometria'
import { MarcoDeDosTomas } from './marco'
import { CalleDerecha, Pantalla } from './pantalla'

/**
 * LAS DOS PANTALLAS DE LAS PERSONAS — el bloque del equipo y la foto.
 *
 * Salieron de `QuienesSomos.tsx` por la regla de las 300 líneas, y el corte es
 * por TEMA y no por tamaño: las dos hablan de las PERSONAS —quiénes son, cómo
 * trabajan, cómo se ven— mientras que la que se quedó allá habla de la AGENCIA.
 * Comparten el zigzag, la calle derecha y el mismo marco de dos tomas; la
 * agencia no comparte ninguno de los tres.
 *
 * ⚠️ Las dos siguen siendo internas de la sección: se exportan para que
 * `QuienesSomos.tsx` las componga, no para que alguien las monte por su cuenta.
 */
/**
 * PANTALLA 2 · EL EQUIPO — el rótulo gigante y las dos personas, en zigzag.
 *
 * ⚠️ Modo pulido: todo el contenido vive adentro de `CalleDerecha`. El `@container`
 * del rótulo mide ahora el ancho de la CALLE y no el de contenido —nadie tocó el
 * número, 17,2cqw sigue siendo el mismo cálculo, sólo cambió contra qué caja
 * resuelve—, y pasa a `text-right`: antes el tercio libre quedaba a la derecha
 * porque la caja entera era el límite; ahora el límite es la calle, así que el
 * hueco se corre a la izquierda, que es aire de más antes del 50 %. Franco queda
 * pegado al borde izquierdo de la calle por `items-start` (el defecto); Valentino
 * no se tocó: su `items-end` + `self-end` ya apuntaba al margen derecho, que es
 * el mismo antes y después de este cambio.
 *
 * `justify-start` y no `justify-center`: el bloque arranca arriba, que es lo que deja
 * el hueco que se fue con «Tucumán, Argentina». Y el alto es el del contenido así
 * que `min-h-svh` acá es un piso y no una caja.
 *
 * La entrada de los retratos es el recorte de `LineasDeTexto` aplicado a una foto:
 * `overflow-hidden` afuera y P2 adentro, que sube la pieza desde su media altura con
 * su opacidad. Ni una duración ni una curva nuevas: el patrón las trae.
 */
export function ElEquipo(): React.JSX.Element {
  return (
    <div data-pantalla="equipo" className="flex min-h-svh w-full flex-col justify-start py-12 escritorio:py-0">
      <CalleDerecha className="grow">
        <div data-composicion="equipo" className="flex w-full flex-col gap-[var(--spacing-12)]">
          <Bloque patron="P2" rango={GEOMETRIA.rangoDeLaMascara} className="@container w-full" style={GEOMETRIA.estilos.tituloDelEquipo}>
            {(progreso) => (
              <span className={GEOMETRIA.ventanaDelTexto}>
                <CanalDeUnaPieza progreso={progreso} patron="P2" como="span" className="block">
                  <h3 className={cn(GEOMETRIA.tituloDelEquipo, MEZCLA_SOBRE_LA_ESCENA)}>{CONTENIDO.tituloDelEquipo}</h3>
                </CanalDeUnaPieza>
              </span>
            )}
          </Bloque>

          {CONTENIDO.personas.map((persona, indice) => {
            const aLaDerecha = indice === 1
            return (
              <div key={persona.nombre} data-pieza-a="persona" className={GEOMETRIA.fila.caja}>
                <div
                  className={cn(
                    GEOMETRIA.fila.texto,
                    aLaDerecha ? GEOMETRIA.fila.textoADerecha : GEOMETRIA.fila.textoAIzquierda,
                  )}
                >
                  <Bloque patron="P2" rango={GEOMETRIA.rangoDeLaMascara} className="w-full">
                    {(progreso) => (
                      <span className={GEOMETRIA.ventanaDelTexto}>
                        <CanalDeUnaPieza progreso={progreso} patron="P2" como="span" className="block">
                          {/* Hasta tablet los nombres suben al escalón que tenía «El equipo»
                              (`titulo-l`), que a su vez subió al del titular: la sección
                              corre su escalera completa un paso. Arriba del corte queda
                              `titulo-m`, el nivel que el componente declara. */}
                          <Titular
                            nivel="titulo-m"
                            como="h4"
                            className={cn('max-escritorio:text-fluido-titulo-l', MEZCLA_SOBRE_LA_ESCENA)}
                          >
                            {persona.nombre}
                          </Titular>
                        </CanalDeUnaPieza>
                      </span>
                    )}
                  </Bloque>

                  {/* La descripción usa la llegada del cuerpo de arriba —P2 sin máscara—
                      y no la del nombre: son dos registros distintos, y el pedido lo dice. */}
                  <Bloque patron="P2" rango="ventana-visible" className="w-full">
                    {(progreso) => (
                      <CanalDeUnaPieza progreso={progreso} patron="P2">
                        <Cuerpo como="p" className={cn(GEOMETRIA.medidaMovilDelCuerpo, MEZCLA_SOBRE_LA_ESCENA)}>
                          {persona.descripcion}
                        </Cuerpo>
                      </CanalDeUnaPieza>
                    )}
                  </Bloque>

                  {/* El renglón de rol dejó el reposo: su lugar es el hover de la foto.
                      Queda en `sr-only` porque un dato que sólo existe al pasar el mouse
                      no existe para quien no tiene mouse. */}
                  <Caption como="p" className="sr-only">{persona.rol}</Caption>
                </div>

                <div
                  className={cn(
                    GEOMETRIA.fila.foto,
                    aLaDerecha ? GEOMETRIA.fila.fotoAIzquierda : GEOMETRIA.fila.fotoADerecha,
                  )}
                >
                  {/* La llegada es scrubbeada y va sin recorte: el recorrido es en curva y
                      con giro, y una máscara le cortaría las esquinas al girar. */}
                  <Bloque patron="P2" rango="llegada-de-la-foto" className="w-full">
                    {(progreso) => (
                      <ProgresoAmortiguado progreso={progreso}>
                        {(perseguido) => (
                      <LlegadaEnCurva
                        progreso={perseguido}
                        sentido={aLaDerecha ? 'desde-la-derecha' : 'desde-la-izquierda'}
                        className="block"
                      >
                        <MarcoDeDosTomas
                          seria={persona.seria}
                          suelta={persona.suelta}
                          texto={persona.rol}
                          registro="rotulo"
                          ancho={GEOMETRIA.retrato.ancho}
                          alto={GEOMETRIA.retrato.alto}
                          sizes={SIZES_DEL_RETRATO}
                        />
                      </LlegadaEnCurva>
                        )}
                      </ProgresoAmortiguado>
                    )}
                  </Bloque>
                </div>
              </div>
            )
          })}
        </div>
      </CalleDerecha>
    </div>
  )
}

/**
 * PANTALLA 3 · LA FOTO — la foto del equipo, adentro de la misma calle derecha.
 *
 * ⚠️ Modo pulido: era 65 % del ancho de contenido, centrada; ahora es el 100 % de
 * la CALLE —«ocupa el ancho de la calle», textual—, pegada al margen derecho por
 * `CalleDerecha` y no por `mx-auto`. Abajo de 1025 no hay calle —no hay escena que
 * esquivar— así que ahí se queda en 65 % centrada, como estaba: `--foto-ancho` sigue
 * viva para ese único caso.
 *
 * ⚠️ Y abajo del corte tampoco: el 65 % dejaba la foto en 166 px de 256 a 320 —con el
 * texto revelado desbordándose 192 px— y en **465 de 704 a 768**, que es el «se agranda
 * más» del pedido. `max-escritorio:w-full` le devuelve el ancho de contenido en toda la
 * banda. El `--foto-ancho` se queda vivo para la composición de escritorio.
 */
export function LaFoto(): React.JSX.Element {
  return (
    <div
      /* ⚠️ **ABAJO DEL CORTE LA FOTO NO FLOTA EN EL MEDIO DE SU PANTALLA.** Con
         `justify-center` y `py-20` quedaba despegada del bloque de Valentino: medido,
         **210 px a 320, 261 a 375, 332 a 425 y 390 a 768** de aire entre los dos.
         Apoyada arriba con `--spacing-8` el aire pasa a ser el de una juntura y no el
         de una pantalla vacía. El `min-h-svh` se queda: es lo que le da a la sección su
         alto declarado, y tocarlo movería el mapeo del scroll de la escena. */
      data-pantalla="foto"
      className="flex min-h-svh w-full flex-col justify-center py-20 max-escritorio:justify-start max-escritorio:pt-[var(--spacing-8)] escritorio:py-2"
    >
      <CalleDerecha>
        {/* La entrada es la que esta pantalla ya tenía —P2 sin recorte— y no la de los
            retratos: el pedido la deja como está. */}
        <Bloque patron="P2" rango="ventana-visible" className="w-full">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P2">
              <figure
                style={GEOMETRIA.estilos.fotoDelEquipo}
                className="mx-auto flex w-[var(--foto-ancho)] flex-col gap-[var(--spacing-3)] max-escritorio:w-full escritorio:mx-0 escritorio:w-full"
              >
                {/* ⚠️ **EL TÍTULO ABRE EL BLOQUE, arriba y a la izquierda.** Va en el
                    mismo escalón que «Franco» y «Valentino» porque es el mismo nivel de
                    la jerarquía: son los tres rótulos de una persona o de un grupo. El
                    `figcaption` es su lugar semántico —nombra la figura— y de paso deja
                    de estar debajo, que es donde estaba el epígrafe que se fue. */}
                <figcaption>
                  <Titular
                    nivel="titulo-m"
                    como="h3"
                    className={cn('max-escritorio:text-fluido-titulo-l', MEZCLA_SOBRE_LA_ESCENA)}
                  >
                    {CONTENIDO.equipo.titulo}
                  </Titular>
                </figcaption>

                {/* ⚠️ **LA DESCRIPCIÓN SE VE SÓLO EN LA BANDA MÓVIL, y es una decisión
                    de ancho y no de gusto.** Hasta 425 va debajo del título, siempre
                    visible: ahí la columna es angosta, el texto se lee cómodo y el
                    revelado sobre una foto de 256 px de ancho competiría con la imagen.
                    De 426 para arriba vuelve a `sr-only` y la trae el clic, que es donde
                    el gesto tiene sentido y donde el texto entra adentro con holgura
                    —medido: 121 px de sobra a 425 y 203 a 768—. En los dos casos el
                    marcado la trae: quien no puede hacer clic la tiene siempre. */}
                <Cuerpo
                  como="p"
                  className={cn(
                    'sr-only max-movil:not-sr-only',
                    GEOMETRIA.medidaMovilDelCuerpo,
                    MEZCLA_SOBRE_LA_ESCENA,
                  )}
                >
                  {CONTENIDO.equipo.descripcion}
                </Cuerpo>

                <MarcoDeDosTomas
                  seria={CONTENIDO.equipo.seria}
                  suelta={CONTENIDO.equipo.suelta}
                  texto={CONTENIDO.equipo.descripcion}
                  registro="cuerpo"
                  ancho={GEOMETRIA.foto.ancho}
                  alto={GEOMETRIA.foto.alto}
                  sizes={SIZES_DE_LA_FOTO}
                  proporcion={GEOMETRIA.proporcionDeLaFotoEnPapel}
                  // La descripción ya se lee arriba, siempre visible en la banda móvil:
                  // sin esto se repetiría adentro del revelado (ver `banda.css`).
                  descripcionYaVisible
                />
              </figure>
            </CanalDeUnaPieza>
          )}
        </Bloque>
      </CalleDerecha>
    </div>
  )
}

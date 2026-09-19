'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDePieza, CanalDeUnaPieza, LlegadaEnCurva, ProgresoAmortiguado, SignoDistinto, Trazo } from '../_contrato/canales'
import { Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'

import { CONTENIDO, TRAMOS_DEL_TITULAR } from './contenido'
import { CLASES_DEL_REPARTO, GEOMETRIA, SIZES_DEL_RETRATO, SIZES_DE_LA_FOTO } from './geometria'
import { MarcoDeDosTomas } from './marco'

/** Se re-exportan para que quien ya las importaba de acá —los instrumentos— no cambie de puerta. */
export { GEOMETRIA, SIZES_DEL_RETRATO, SIZES_DE_LA_FOTO } from './geometria'

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


/**
 * LA CALLE DERECHA — del 50 % del viewport al margen derecho. Todo el bloque
 * El Equipo —el rótulo, las dos personas y la foto del equipo— vive adentro:
 * la mitad izquierda es del logo, siempre.
 *
 * `data-pantalla` es hijo directo de `Envoltorio`, cuyo padding es SIMÉTRICO
 * (32px por lado, `Envoltorio.tsx`) y cuya caja de contenido se centra con
 * `mx-auto`: el punto medio de esa caja coincide EXACTO con el 50 % del
 * viewport, a cualquier ancho, sin importar cuánto mida el padding. Por eso
 * la calle se arma con `w-1/2` sobre esa caja simétrica y no con una cuenta
 * en `vw`: `w-1/2` de una caja centrada en el viewport ES el 50vw real, sin
 * un solo número hardcodeado. `justify-end` empuja la calle contra el borde
 * derecho de esa misma caja, que es el margen que ya usa el resto del sitio.
 *
 * Sólo de escritorio para arriba: abajo no hay escena que esquivar y el
 * bloque sigue a ancho completo, como estaba.
 */
function CalleDerecha({
  children,
  className,
}: {
  readonly children: React.ReactNode
  readonly className?: string
}): React.JSX.Element {
  return (
    <div className={cn('w-full escritorio:flex escritorio:justify-end', className)}>
      <div className="w-full escritorio:w-1/2">{children}</div>
    </div>
  )
}

/** PANTALLA 1 · LA AGENCIA — quiénes somos y qué somos, repartido sobre la pantalla
 *  entera. El lugar cierra abajo a la derecha: juntura pareja, y esquiva la pastilla. */
function LaAgencia({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Pantalla nombre="agencia">
      <Grilla columnas="lateral" className="grow">
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
                    <div aria-hidden="true" className="flex flex-col">
                      {TRAMOS_DEL_TITULAR.map((renglon, indice) => (
                        <span key={renglon.marcado} className={GEOMETRIA.ventanaDelTexto}>
                          <CanalDePieza
                            progreso={progresoDeEntrada}
                            patron="P1"
                            cantidad={TRAMOS_DEL_TITULAR.length}
                            indice={indice}
                            como="span"
                            className="block"
                          >
                            {renglon.antes}{' '}
                            <Trazo
                              progreso={progresoDelTrazo}
                              tipo={renglon.tipo}
                              className={GEOMETRIA.pesosDelTitular[renglon.tipo]}
                            >
                              {renglon.marcado}
                            </Trazo>
                            {renglon.cierre}
                          </CanalDePieza>
                        </span>
                      ))}
                    </div>
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
            {(progresoDelSigno) => <SignoDistinto progreso={progresoDelSigno} />}
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
function ElEquipo(): React.JSX.Element {
  return (
    <div data-pantalla="equipo" className="flex min-h-svh w-full flex-col justify-start py-12 escritorio:py-0">
      <CalleDerecha className="grow">
        <div data-composicion="equipo" className="flex w-full flex-col gap-[var(--spacing-12)]">
          <Bloque patron="P2" rango={GEOMETRIA.rangoDeLaMascara} className="@container w-full" style={GEOMETRIA.estilos.tituloDelEquipo}>
            {(progreso) => (
              <span className={GEOMETRIA.ventanaDelTexto}>
                <CanalDeUnaPieza progreso={progreso} patron="P2" como="span" className="block">
                  <h3 className={GEOMETRIA.tituloDelEquipo}>{CONTENIDO.tituloDelEquipo}</h3>
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
                          <Titular nivel="titulo-m" como="h4">{persona.nombre}</Titular>
                        </CanalDeUnaPieza>
                      </span>
                    )}
                  </Bloque>

                  {/* La descripción usa la llegada del cuerpo de arriba —P2 sin máscara—
                      y no la del nombre: son dos registros distintos, y el pedido lo dice. */}
                  <Bloque patron="P2" rango="ventana-visible" className="w-full">
                    {(progreso) => (
                      <CanalDeUnaPieza progreso={progreso} patron="P2">
                        <Cuerpo como="p">{persona.descripcion}</Cuerpo>
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
 */
function LaFoto(): React.JSX.Element {
  return (
    <div data-pantalla="foto" className="flex min-h-svh w-full flex-col justify-center py-20 escritorio:py-2">
      <CalleDerecha>
        {/* La entrada es la que esta pantalla ya tenía —P2 sin recorte— y no la de los
            retratos: el pedido la deja como está. */}
        <Bloque patron="P2" rango="ventana-visible" className="w-full">
          {(progreso) => (
            <CanalDeUnaPieza progreso={progreso} patron="P2">
              <figure
                style={GEOMETRIA.estilos.fotoDelEquipo}
                className="mx-auto flex w-[var(--foto-ancho)] flex-col gap-[var(--spacing-3)] escritorio:mx-0 escritorio:w-full"
              >
                <MarcoDeDosTomas
                  seria={CONTENIDO.equipo.seria}
                  suelta={CONTENIDO.equipo.suelta}
                  texto={CONTENIDO.equipo.descripcion}
                  registro="cuerpo"
                  ancho={GEOMETRIA.foto.ancho}
                  alto={GEOMETRIA.foto.alto}
                  sizes={SIZES_DE_LA_FOTO}
                />
                <figcaption><Caption como="p" className="escritorio:text-right">{CONTENIDO.equipo.pie}</Caption></figcaption>
                <Cuerpo como="p" className="escritorio:sr-only">{CONTENIDO.equipo.descripcion}</Cuerpo>
              </figure>
            </CanalDeUnaPieza>
          )}
        </Bloque>
      </CalleDerecha>
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

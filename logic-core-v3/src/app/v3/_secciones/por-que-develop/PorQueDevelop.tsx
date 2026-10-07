'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef } from 'react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { TituloDeVolumen } from '../../_componentes/titulos3d/TituloDeVolumen'
import { LECTURA } from '../../_lib/titulos3d/registro'
import { LENTOS } from '../../_lib/titulos3d/repeticiones'
import { useAcompananteDelTitulo } from '../../_lib/titulos3d/acompanantes'
import { DIA_DEL_TEXTO } from '../../_lib/escena/amanecer/diaDelTexto'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_contrato/coreografia'
import { CanalDeUnaPieza, ConInercia } from '../_contrato/canales'
import { seccionDe, type PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { CTA, FRASE, NOMBRE_DE_SECCION, VALORES, type Valor } from './contenido'
import {
  ESTILO_DEL_ESCENARIO,
  ESTILO_DE_LA_LISTA,
  SUBIDA_DE_LA_FRASE_SVH,
  SUBIDA_DE_LA_LEVANTADA_SVH,
  VENTANA_DEL_CTA,
  VENTANA_DEL_DESTACADO,
  VENTANA_DE_LA_FRASE,
  VENTANA_DE_LA_LEVANTADA,
  VENTANA_DE_LA_SUBIDA_DE_LA_FRASE,
  ventanaDelValor,
  type Ventana,
} from './geometria'
import { ValorEnVolumen } from './valorEnVolumen'
import { PiezaDeValor } from './Valores'

/**
 * 07 · POR QUÉ develOP — la frase, los seis valores y el CTA, alrededor del logo.
 * **[FINAL]**
 *
 * Desde escritorio es un ESCENARIO clavado de cuatro pantallas sobre la sala de noche: la
 * escena hace los tiempos A, B y C (`_lib/escena/finalDelRecorrido.ts`) y esta sección
 * pone arriba lo que corresponde a cada uno, sobre el MISMO scroll —el pin de la sección—:
 *
 *   A · la frase llega desde atrás (P5: escala de 0,8 a 1 con la opacidad, que es el gesto
 *       que nk hace con «5 things / to remember», medido en su DOM) y rodea al logo;
 *   B · los seis valores entran de a pares, tres a cada lado del logo (P5, escalonados);
 *   C · la frase y los valores se levantan juntos y llega el CTA, centrado (P5).
 *
 * Abajo de 1024 no hay escenario: la frase en dos renglones, la lista de valores, el CTA
 * con su botón, y cada pieza llega con el gesto de la casa sobre su ventana visible.
 *
 * La sección sigue siendo «Por qué develOP» para el lector y para el menú: el `h2` lleva
 * ese nombre, en `sr-only`, en las dos ramas.
 */
const ALTO = seccionDe('por-que-develop').alto

export function PorQueDevelop({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      {/* El alto va en línea porque viene del dato (la misma excepción que Servicios);
          abajo de 1024 no hay pin y la sección mide su contenido. */}
      <Bloque patron="pin" style={{ minHeight: ALTO }} className="relative max-escritorio:min-h-0!">
        {(pin: Progreso) => (pin === null ? <PorQueEnLista seccion={seccion} /> : <Escenario seccion={seccion} pin={pin} />)}
      </Bloque>
    </Seccion>
  )
}

/** Una columna de valores; en una columna angosta (menos de 16rem) el aire entre valores se achica a la mitad. */
const CLASE_DE_LA_COLUMNA = 'flex flex-col justify-start gap-[var(--spacing-6)] @max-3xs:gap-[var(--spacing-3)]'

/** Una copia invisible y sin alto de la mitad del título: le da a la columna su mismo ancho. No se anuncia. */
function AnchoDeLaFrase({ texto }: { readonly texto: string }): React.JSX.Element {
  return (
    <span aria-hidden="true" className="invisible block h-0">
      <FraseDelFinal texto={texto} />
    </span>
  )
}

/** El tramo de una ventana del pin, de 0 a 1. */
function useTramo(pin: MotionValue<number>, v: Ventana): MotionValue<number> {
  return useTransform(pin, [v.desde, v.hasta], [0, 1])
}

/**
 * [ESCENA 8] T3 · La llegada de una pieza espera al día: es tinta de día, y con un scroll rápido la sala todavía
 * está amaneciendo detrás (el amanecer tarda por lo menos 2,5 s). La frase va sobre las paredes; los valores y el
 * CTA, sobre el piso, que se ilumina después. Con un scroll lento el día ya está: no cambia nada.
 */
function useLlegadaDeDia(pin: MotionValue<number>, v: Ventana, donde: keyof typeof DIA_DEL_TEXTO): MotionValue<number> {
  const tramo = useTramo(pin, v)
  return useTransform([tramo, DIA_DEL_TEXTO[donde]], ([t, d]: number[]) => Math.min(t, d))
}

function Escenario({ seccion, pin }: PropsDeSeccion & { readonly pin: MotionValue<number> }): React.JSX.Element {
  const frase = useLlegadaDeDia(pin, VENTANA_DE_LA_FRASE, 'frase')
  // La frase se queda mientras entran los valores, pero sube: el valor del medio de cada
  // columna le caía encima.
  const subeLaFrase = useTransform(useTramo(pin, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE), (u) => `${(-u * SUBIDA_DE_LA_FRASE_SVH).toFixed(3)}svh`)
  const levantada = useTramo(pin, VENTANA_DE_LA_LEVANTADA)
  const y = useTransform(levantada, (u) => `${(-u * SUBIDA_DE_LA_LEVANTADA_SVH).toFixed(3)}svh`)
  // [RETOQUE 3D] B5 · la misma subida, para el título de volumen (fracción del cuadro): sube con los valores y no se cruzan.
  const corrida = useTransform(levantada, (u) => (-u * SUBIDA_DE_LA_LEVANTADA_SVH) / 100)
  const opacity = useTransform(levantada, [0, 1], [1, 0])
  // [NOCTURNO] A1 · cada columna de valores va en el plano de su mitad de la frase de volumen.
  const valoresDeLaIzquierda = useAcompananteDelTitulo<HTMLDivElement>('frase-izquierda')
  const valoresDeLaDerecha = useAcompananteDelTitulo<HTMLDivElement>('frase-derecha')
  return (
    <div data-pieza="escenario-del-final" className="sticky top-0 h-svh w-full overflow-hidden" style={ESTILO_DEL_ESCENARIO}>
      <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
        {NOMBRE_DE_SECCION}
      </h2>
      <motion.div className="absolute inset-0" style={{ y, opacity }}>
        {/* La frase, partida a los dos lados del logo. Se anuncia entera y en orden. [INTERFAZ 1] T1: con la inercia de los títulos. */}
        <motion.p data-pieza="frase-del-final" className="absolute inset-0" style={{ y: subeLaFrase }}>
          <span className="absolute top-1/2 right-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
            <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block" llegadaDe="por-que-develop">
              <ConInercia><FraseDelFinal texto={FRASE.izquierda} volumen={{ id: 'frase-izquierda', llegada: frase, salida: levantada, corrida }} /></ConInercia>
            </CanalDeUnaPieza>
          </span>{' '}
          <span className="absolute top-1/2 left-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
            <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block" llegadaDe="por-que-develop">
              <ConInercia><FraseDelFinal texto={FRASE.derecha} volumen={{ id: 'frase-derecha', llegada: frase, salida: levantada, corrida }} /></ConInercia>
            </CanalDeUnaPieza>
          </span>
        </motion.p>
        {/* Los valores: tres a la izquierda del logo y tres a la derecha. */}
        {/* Cada columna es un contenedor: a 1024×768 mide 159 px y, con el aire de siempre, la de la derecha se desbordaba 41 px. */}
        {/* [FINAL 3] Cada columna mide lo que su mitad del título (una copia invisible le da el ancho) y se pega a su lado del logo: simétricas. */}
        <div ref={valoresDeLaIzquierda} className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] right-[calc(50%+var(--hueco-de-los-valores))] flex w-min flex-col">
          <AnchoDeLaFrase texto={FRASE.izquierda} />
          {/* El contenedor va adentro: con contención de tamaño no aportaría ancho y la columna mediría 0. [PASADA FINAL] D3:
              la columna es flex (era una grilla `auto 1fr` escrita a mano): el ancho de la frase arriba y esto, el resto. */}
          <div className="@container min-h-0 flex-1">
            <ul className={CLASE_DE_LA_COLUMNA}>
              {VALORES.slice(0, 3).map((valor, i) => (
                <ValorEnElEscenario key={valor.clave} valor={valor} pin={pin} indice={i} />
              ))}
            </ul>
          </div>
        </div>
        <div ref={valoresDeLaDerecha} className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] left-[calc(50%+var(--hueco-de-los-valores))] flex w-min flex-col">
          <AnchoDeLaFrase texto={FRASE.derecha} />
          <div className="@container min-h-0 flex-1">
            <ul className={CLASE_DE_LA_COLUMNA}>
              {VALORES.slice(3).map((valor, i) => (
                <ValorEnElEscenario key={valor.clave} valor={valor} pin={pin} indice={i + 3} />
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
      <CtaEnElEscenario pin={pin} />
    </div>
  )
}

/** La mitad de la frase: un titular que nunca pasa del lugar que el logo le deja. La variante
 *  `escritorio:` deja viva la clase del nivel (`cn()` la borraba y `s6-render` lo marca).
 *  [ESCENA 10] T3 · con `volumen`, el título de volumen ([3D Y SONIDO] T1: del producto): llega con la frase; se lee con la
 *  cámara de los valores y en el lugar al que la frase sube con ellos. [RONDA 2] F2: vuelve a irse con la levantada, y la
 *  llegada y la salida son función del scroll (con el asiento al frenar): ninguna velocidad la deja a medio armar.
 *  [NOCTURNO] A5: la salida, con un mínimo de tiempo (bastante más lenta: se iba volando). [PASADA FINAL] A3: y la llegada,
 *  con el mínimo de ESCENA 10 (1,4 s: se ve armarse a cualquier velocidad) y el asiento «armado» al frenar a mitad. */
function FraseDelFinal({ texto, volumen }: { readonly texto: string; readonly volumen?: { readonly id: string; readonly llegada: MotionValue<number>; readonly salida: MotionValue<number>; readonly corrida: MotionValue<number> } }): React.JSX.Element {
  return (
    <Titular
      nivel="titulo-xl"
      como="span"
      className="block whitespace-nowrap escritorio:text-[length:min(var(--text-fluido-titulo-xl),calc((50vw-var(--hueco-de-la-frase)-var(--spacing-8))/7.2))]"
    >
      {volumen === undefined ? texto : <TituloDeVolumen id={volumen.id} texto={texto} lectura={LECTURA.frase} subida={SUBIDA_DE_LA_FRASE_SVH / 100} llegada={volumen.llegada} salida={volumen.salida} corrida={volumen.corrida} minimoS={LENTOS.llegadaDeLaFraseS} asiento="armado" salidaMinimaS={LENTOS.salidaDeLaFraseS} llegadaDe="por-que-develop" />}
    </Titular>
  )
}

function ValorEnElEscenario({ valor, pin, indice }: { readonly valor: Valor; readonly pin: MotionValue<number>; readonly indice: number }): React.JSX.Element {
  const tramo = useLlegadaDeDia(pin, ventanaDelValor(indice), 'abajo')
  return (
    <li>
      {/* [RETOQUE 3D] 3G · cada valor llega desde un lugar distinto de la sala (CSS 3D; antes, P5). */}
      <ValorEnVolumen progreso={tramo} indice={indice}>
        <PiezaDeValor valor={valor} className="@max-3xs:gap-[var(--spacing-1)]" espesor />
      </ValorEnVolumen>
    </li>
  )
}

/**
 * [NOCTURNO FINAL] D3 · el CTA centrado en la pantalla: la frase en dos renglones y «Hablanos», bastante más grande (el
 * display), en el lugar que deja el logo (`--lugar-del-cta`). Los divisores reparten ese lugar entre los dos renglones, el
 * aire y el botón (su caja mide ~1,8 veces su letra, con el subrayado): a 1440 × 900, 56 y 100 px; en una pantalla baja, menos.
 */
const TAMANO_DEL_CTA = 'escritorio:text-[length:min(var(--text-fluido-titulo-xl),calc(var(--lugar-del-cta)/5))]'
/** [FINAL 3] «Hablanos» más grande: el mismo botón, con su tipografía redefinida. [NOCTURNO FINAL] D3 · al display. */
const BOTON_GRANDE = '[--text-cuerpo:var(--text-fluido-display-xl)] escritorio:[--text-cuerpo:min(var(--text-fluido-display-xl),calc(var(--lugar-del-cta)/3.3))]'

/**
 * [INTERFAZ 1] T3 · EL FOCO QUE LLEGA ANTES QUE EL CTA. Con Tab, el «Hablanos» toma el foco aunque todavía no llegó (espera
 * al final del recorrido del escenario y al día): medido, el anillo se dibujaba alrededor de nada (1,0:1, sólo el cielo).
 * Al recibir el foco sin haber llegado, la página va de un salto al final del escenario, donde llega; el día lo alcanza
 * con su propio tope (amanecer, ~2,5 s). El mismo gesto que el túnel de Trabajos con sus capturas.
 */
function llevarAlCta(cta: HTMLElement, llegada: number): void {
  if (llegada > 0.5) return
  const panel = cta.closest('[data-panel]')
  if (!(panel instanceof HTMLElement)) return
  const fin = panel.getBoundingClientRect().bottom + window.scrollY - window.innerHeight
  window.scrollTo({ top: Math.round(fin), behavior: 'instant' })
}

function CtaEnElEscenario({ pin }: { readonly pin: MotionValue<number> }): React.JSX.Element {
  const frase = useLlegadaDeDia(pin, VENTANA_DEL_CTA, 'abajo')
  const destacado = useLlegadaDeDia(pin, VENTANA_DEL_DESTACADO, 'abajo')
  // Mientras no llegó, el botón no se puede tocar aunque esté en su lugar.
  const pointerEvents = useTransform(destacado, (u) => (u > 0.5 ? 'auto' : 'none'))
  return (
    <motion.div
      data-pieza="cta-del-final"
      // [FINAL 2] Nunca encima del logo: de día es negro y no se leía. [NOCTURNO FINAL] D3 · centrado en la pantalla, con
      // el logo abajo (la pose C).
      className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-[var(--pad-lateral-compacto)] text-center"
      style={{ pointerEvents }}
      onFocus={(e) => llevarAlCta(e.currentTarget, destacado.get())}
    >
      <CanalDeUnaPieza progreso={frase} patron="P5">
        <Titular nivel="titulo-xl" como="p" className={TAMANO_DEL_CTA}>
          {CTA.frase}
        </Titular>
      </CanalDeUnaPieza>
      {/* Destacado por el peso, como el «let's create it» de nk. */}
      <CanalDeUnaPieza progreso={destacado} patron="P5">
        <Titular nivel="titulo-xl" como="p" peso="fuerte" className={TAMANO_DEL_CTA}>
          {CTA.destacado}
        </Titular>
      </CanalDeUnaPieza>
      {/* [BASE] El botón abajo, solo y más grande, sin fondo: sólo el texto y su subrayado, como el resto. */}
      <CanalDeUnaPieza progreso={destacado} patron="P5" className="mt-[var(--spacing-6)]">
        <div className={BOTON_GRANDE}>
          <CtaEnlace href={CTA.destino} rotulo={CTA.rotulo} />
        </div>
      </CanalDeUnaPieza>
    </motion.div>
  )
}

/**
 * LA RAMA SIN ESCENARIO: abajo de 1024, y con menos movimiento en cualquier ancho. La
 * frase en dos renglones, los valores en lista (dos columnas en tablet) y el CTA. Pide la
 * coreografía en todo ancho para que cada pieza llegue con el gesto de la casa sobre su
 * ventana visible; sin movimiento, queda quieta.
 */
function PorQueEnLista({ seccion }: PropsDeSeccion): React.JSX.Element {
  // [NOCTURNO FINAL] D2 · mientras el piso no está iluminado la lista va sin mezcla (`banda.css` §6): `data-amanecer`.
  const lista = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const poner = (): void => {
      const modo = modoDelAmanecer(DIA_DEL_TEXTO.frase.get(), DIA_DEL_TEXTO.abajo.get())
      if (modo === null) lista.current?.removeAttribute('data-amanecer')
      else lista.current?.setAttribute('data-amanecer', modo)
    }
    poner()
    const quitar = [DIA_DEL_TEXTO.frase.on('change', poner), DIA_DEL_TEXTO.abajo.on('change', poner)]
    return () => quitar.forEach((q) => q())
  }, [])
  return (
    <ContenidoDeSeccion className="py-[var(--spacing-20)]" claseDeContenido="flex flex-col gap-[var(--spacing-12)]">
      <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
        {NOMBRE_DE_SECCION}
      </h2>
      {/* `contents`: sin caja propia, las piezas siguen siendo hijas de la columna (y la mezcla no se corta). */}
      <div ref={lista} data-parte="lista-del-final" className="contents">
        <CoreografiaEnTodoAncho>
          <Llega>
            <p data-pieza="frase-del-final">
              <Titular nivel="titulo-xl" como="span" className="block">
                {FRASE.izquierda}
              </Titular>{' '}
              <Titular nivel="titulo-xl" como="span" className="block">
                {FRASE.derecha}
              </Titular>
            </p>
          </Llega>
          <ul className="grid grid-cols-1 gap-[var(--spacing-8)] movil:grid-cols-2">
            {VALORES.map((valor) => (
              <li key={valor.clave}>
                <Llega>
                  <PiezaDeValor valor={valor} />
                </Llega>
              </li>
            ))}
          </ul>
          {/* [FINAL 3] Separado de los valores, en su propio espacio. [NOCTURNO FINAL] D3 · centrado en todos los anchos, en
              una pantalla entera. */}
          <div data-pieza="cta-del-final" style={ESTILO_DE_LA_LISTA} className="flex min-h-[var(--alto-del-cta-en-lista)] flex-col items-center justify-center gap-[var(--spacing-8)] text-center">
            <Llega>
              <Titular nivel="titulo-xl" como="p">
                {CTA.frase}
              </Titular>
              <Titular nivel="titulo-xl" como="p" peso="fuerte">
                {CTA.destacado}
              </Titular>
            </Llega>
            <Llega>
              <div className={BOTON_GRANDE}>
                <CtaEnlace href={CTA.destino} rotulo={CTA.rotulo} mezcla />
              </div>
            </Llega>
          </div>
        </CoreografiaEnTodoAncho>
      </div>
    </ContenidoDeSeccion>
  )
}

/**
 * [NOCTURNO FINAL] D2 · el texto de la lista mientras amanece (abajo de 1024): con la pared todavía oscura, `noche` (el
 * papel con un halo de la tinta); con la pared iluminada y el piso no, `pared` (la tinta con un halo del papel); con el
 * piso iluminado, `null`: la mezcla. Medido en el banco: cada uno se lee donde el otro no.
 */
export const PARED_ILUMINADA = 0.5
export function modoDelAmanecer(frase: number, abajo: number): 'noche' | 'pared' | null {
  if (abajo >= 1) return null
  return frase < PARED_ILUMINADA ? 'noche' : 'pared'
}

/** Una pieza que llega con P5 sobre su ventana visible. Sin coreografía, está puesta. */
function Llega({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <Bloque patron="P5" rango="ventana-visible">
      {(progreso) => (
        // [FINAL 2] La mezcla va en el canal, que es el que se transforma: en un ancestro cortaría la cadena.
        <CanalDeUnaPieza progreso={progreso} patron="P5" className={MEZCLA_SOBRE_LA_ESCENA}>
          {children}
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}

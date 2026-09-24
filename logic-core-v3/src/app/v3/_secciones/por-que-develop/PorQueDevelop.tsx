'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../_lib/superficies'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { seccionDe, type PropsDeSeccion } from '../_contrato/forma'
import { ContenidoDeSeccion, Seccion } from '../_contrato/Seccion'
import { CTA, FRASE, NOMBRE_DE_SECCION, VALORES, type Valor } from './contenido'
import {
  ESTILO_DEL_ESCENARIO,
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

function Escenario({ seccion, pin }: PropsDeSeccion & { readonly pin: MotionValue<number> }): React.JSX.Element {
  const frase = useTramo(pin, VENTANA_DE_LA_FRASE)
  // La frase se queda mientras entran los valores, pero sube: el valor del medio de cada
  // columna le caía encima.
  const subeLaFrase = useTransform(useTramo(pin, VENTANA_DE_LA_SUBIDA_DE_LA_FRASE), (u) => `${(-u * SUBIDA_DE_LA_FRASE_SVH).toFixed(3)}svh`)
  const levantada = useTramo(pin, VENTANA_DE_LA_LEVANTADA)
  const y = useTransform(levantada, (u) => `${(-u * SUBIDA_DE_LA_LEVANTADA_SVH).toFixed(3)}svh`)
  const opacity = useTransform(levantada, [0, 1], [1, 0])
  return (
    <div data-pieza="escenario-del-final" className="sticky top-0 h-svh w-full overflow-hidden" style={ESTILO_DEL_ESCENARIO}>
      <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
        {NOMBRE_DE_SECCION}
      </h2>
      <motion.div className="absolute inset-0" style={{ y, opacity }}>
        {/* La frase, partida a los dos lados del logo. Se anuncia entera y en orden. */}
        <motion.p data-pieza="frase-del-final" className="absolute inset-0" style={{ y: subeLaFrase }}>
          <span className="absolute top-1/2 right-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
            <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block">
              <FraseDelFinal texto={FRASE.izquierda} />
            </CanalDeUnaPieza>
          </span>{' '}
          <span className="absolute top-1/2 left-[calc(50%+var(--hueco-de-la-frase))] -translate-y-1/2">
            <CanalDeUnaPieza progreso={frase} patron="P5" como="span" className="block">
              <FraseDelFinal texto={FRASE.derecha} />
            </CanalDeUnaPieza>
          </span>
        </motion.p>
        {/* Los valores: tres a la izquierda del logo y tres a la derecha. */}
        {/* Cada columna es un contenedor: a 1024×768 mide 159 px y, con el aire de siempre, la de la derecha se desbordaba 41 px. */}
        {/* [FINAL 3] Cada columna mide lo que su mitad del título (una copia invisible le da el ancho) y se pega a su lado del logo: simétricas. */}
        <div className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] right-[calc(50%+var(--hueco-de-los-valores))] grid w-min grid-rows-[auto_1fr]">
          <AnchoDeLaFrase texto={FRASE.izquierda} />
          {/* El contenedor va adentro: con contención de tamaño no aportaría ancho y la columna mediría 0. */}
          <div className="@container">
            <ul className={CLASE_DE_LA_COLUMNA}>
              {VALORES.slice(0, 3).map((valor, i) => (
                <ValorEnElEscenario key={valor.clave} valor={valor} pin={pin} indice={i} />
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute top-[var(--arriba-de-los-valores)] bottom-[var(--abajo-de-los-valores)] left-[calc(50%+var(--hueco-de-los-valores))] grid w-min grid-rows-[auto_1fr]">
          <AnchoDeLaFrase texto={FRASE.derecha} />
          <div className="@container">
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
 *  `escritorio:` deja viva la clase del nivel (`cn()` la borraba y `s6-render` lo marca). */
function FraseDelFinal({ texto }: { readonly texto: string }): React.JSX.Element {
  return (
    <Titular
      nivel="titulo-xl"
      como="span"
      className="block whitespace-nowrap escritorio:text-[length:min(var(--text-fluido-titulo-xl),calc((50vw-var(--hueco-de-la-frase)-var(--spacing-8))/7.2))]"
    >
      {texto}
    </Titular>
  )
}

function ValorEnElEscenario({ valor, pin, indice }: { readonly valor: Valor; readonly pin: MotionValue<number>; readonly indice: number }): React.JSX.Element {
  const tramo = useTramo(pin, ventanaDelValor(indice))
  return (
    <li>
      <CanalDeUnaPieza progreso={tramo} patron="P5">
        <PiezaDeValor valor={valor} className="@max-3xs:gap-[var(--spacing-1)]" />
      </CanalDeUnaPieza>
    </li>
  )
}

/** Dos renglones en el lugar que queda entre el logo y su sombra: nunca más grande que el `titulo-xl` fluido. */
const TAMANO_DEL_CTA = 'escritorio:text-[length:min(var(--text-fluido-titulo-xl),calc((var(--lugar-del-cta)-var(--spacing-20))/2.3))]'
/** [FINAL 3] «Hablanos» más grande: el mismo botón, con su tipografía redefinida a `titulo-m`. */
const BOTON_GRANDE = '[--text-cuerpo:var(--text-titulo-m)]'

function CtaEnElEscenario({ pin }: { readonly pin: MotionValue<number> }): React.JSX.Element {
  const frase = useTramo(pin, VENTANA_DEL_CTA)
  const destacado = useTramo(pin, VENTANA_DEL_DESTACADO)
  // Mientras no llegó, el botón no se puede tocar aunque esté en su lugar.
  const pointerEvents = useTransform(destacado, (u) => (u > 0.5 ? 'auto' : 'none'))
  return (
    <motion.div
      data-pieza="cta-del-final"
      // [FINAL 2] Debajo del logo: de día el logo es negro y encima no se leía.
      className="absolute inset-x-0 top-[var(--arriba-del-cta)] flex flex-col items-center px-[var(--pad-lateral-compacto)] text-center"
      style={{ pointerEvents }}
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
      {/* [FINAL 3] El botón abajo, solo y más grande; su pastilla de papel lo separa de la sombra del piso. */}
      <CanalDeUnaPieza progreso={destacado} patron="P5" className="mt-[var(--spacing-4)]">
        <div className={`${BOTON_GRANDE} rounded-[var(--radius-pastilla-s)] bg-fondo px-[var(--spacing-6)] py-[var(--spacing-2)]`}>
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
  return (
    <ContenidoDeSeccion className="py-[var(--spacing-20)]" claseDeContenido="flex flex-col gap-[var(--spacing-12)]">
      <h2 id={idDelTitularDeSeccion(seccion.id)} className="sr-only">
        {NOMBRE_DE_SECCION}
      </h2>
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
        {/* [FINAL 3] Separado de los valores, en su propio espacio; centrado desde tablet. */}
        <div data-pieza="cta-del-final" className="flex min-h-[70svh] flex-col items-start justify-center gap-[var(--spacing-8)] tablet:items-center tablet:text-center">
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
    </ContenidoDeSeccion>
  )
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

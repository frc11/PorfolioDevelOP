'use client'

import { useTransform, type MotionValue } from 'motion/react'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { CanalDePieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { MarcaDeSeccion } from '../_contrato/Seccion'

import { CONTENIDO } from './contenido'
import { CAJA_DE_LA_CAPTURA, GEOMETRIA, localDeLaPortada, localDelPlano } from './geometria'
import { Proyecto } from './Proyecto'

/**
 * LAS PIEZAS QUE EL ESCENARIO MONTA — un plano, la portada y la rama quieta.
 *
 * ── Por qué viven acá y no en `Trabajos.tsx` (B12) ────────────────────────
 *
 * Porque ese archivo pasó las 300 líneas al mudar el título y la bajada al
 * escenario, y la regla del repo es que se parte. **El corte es por TEMA y no
 * por tamaño**, el mismo que `geometria.ts` ya usó: allá viven los números,
 * en `Trabajos.tsx` la COMPOSICIÓN —qué monta la sección y en qué orden— y acá
 * las PIEZAS que esa composición monta. Quien cambia qué entra abre aquél;
 * quien cambia cómo se ve una pieza abre éste.
 *
 * Las tres comparten una propiedad y por eso están juntas: **cada una es una
 * caja `absolute inset-0` que se consume con el progreso del bloque de P7**, o
 * su equivalente quieto. Ninguna sabe dónde cae en el recorrido; eso lo decide
 * `geometria.ts`, que es quien reparte.
 */

/**
 * UN PLANO — el proyecto `indice`, con SU tercio del recorrido. **[B2]**
 *
 * El progreso del bloque es uno solo y los tres planos cuelgan de él; lo que
 * cambia es que cada uno lo lee por `localDelPlano`, que le da su tramo. Es el
 * mismo mecanismo que Servicios usa para su secuencia —un número, N canales— y
 * la cuenta vive en `geometria.ts`, con la medición que la fuerza.
 *
 * `cantidad = 1` e `indice = 0` en el canal: **el escalonado de P7 queda inerte
 * a propósito** (`cantidad − 1 = 0`), porque el reparto ya no es del cronograma
 * sino del scroll. Ningún valor de P7 se toca.
 *
 * ⚠ Un componente y no un `useTransform` adentro del `children` del bloque: ese
 * `children` corre durante el render de OTRO componente, así que un hook ahí
 * sería un hook condicional del bloque. Acá cada plano tiene el suyo, en orden
 * fijo y con cantidad fija.
 */
export function PlanoDelProyecto({
  progreso,
  indice,
  proyecto,
}: {
  readonly progreso: MotionValue<number>
  readonly indice: number
  readonly proyecto: (typeof CONTENIDO.proyectos)[number]
}): React.JSX.Element {
  const local = useTransform(progreso, (p) => localDelPlano(p, indice))
  return (
    <CanalDePieza progreso={local} patron="P7" cantidad={1} indice={0} className="absolute inset-0 flex items-center">
      {/* La MISMA grilla de tres, y el plano ocupa DOS de sus tres columnas
          —ver `columnasDelPlano`—: con una sola, la tarjeta medía 394 px adentro
          de una pantalla que le deja 825 y quedaban 463 px de banda vacía
          debajo. La clase va literal porque Tailwind escanea el fuente. */}
      {/* ⚠️ B12 · LA MISMA MEDIDA, AHORA CENTRADA. Era una celda de 2 en una
          `Grilla` de 3 —o sea pegada a la izquierda— y el humano pidió *«que
          esté centrado todo lo del portfolio»*. El ANCHO no cambia: la clase
          reconstruye 2 de 3 columnas con los tokens de la propia grilla. El
          `Envoltorio` de acá adentro es el que trae el relleno lateral y el tope
          de 1920 que antes ponía el de la sección. */}
      <Envoltorio>
        <div className={GEOMETRIA.claseDeLaMedidaDelPlano}>
          <Proyecto proyecto={proyecto} rotulo={CONTENIDO.rotuloDeLaMetrica} caja={CAJA_DE_LA_CAPTURA} />
        </div>
      </Envoltorio>
    </CanalDePieza>
  )
}

/**
 * LA PORTADA — el título y la bajada de la sección, en el escenario. **[B12]**
 *
 * > *«Que no haya info arriba de eso, sino que la info venga como las imágenes.»*
 *
 * ── El defecto que arregla, en una línea ──────────────────────────────────
 *
 * El título y la bajada estaban CLAVADOS en el tope del hijo pinneado: dos
 * pantallas enteras de scroll con un bloque de texto quieto arriba y las
 * tarjetas entrando debajo. El humano lo grabó y pidió las dos cosas juntas: que
 * el portfolio esté centrado, y que la info **venga como las imágenes** en vez
 * de estar antes que ellas.
 *
 * ── ⚠️ CÓMO LLEGA Y CÓMO SE VA, SIN TOCAR UN VALOR DE P7 ──────────────────
 *
 * La portada es **el plano de índice −1** del mismo reparto: `localDeLaPortada`
 * es `localDelPlano(progreso, -1)`, la MISMA función pura, con el índice
 * inmediatamente anterior al primer proyecto. Consecuencias, todas derivadas y
 * ninguna elegida:
 *
 *   · En `progreso = 0` su local vale el CORTE de P7, o sea la pose aterrizada:
 *     la portada ya está compuesta cuando la sección asoma por el pie del cuadro.
 *   · Entre 0 y 1/3 corre su SALIDA —del corte a 1—, o sea se va por delante de
 *     la cámara con el mismo gesto con el que se irán los tres proyectos.
 *   · Su salida se **superpone con la llegada del primer plano** exactamente
 *     como la de un plano con la del siguiente. Es el cruce que la meseta de
 *     B4-A ya garantiza entre consecutivos, aplicado un índice antes.
 *
 * **Nada de esto toca lo calibrado**: `GEOMETRIA.planos` sigue siendo 3, la
 * meseta se deriva de 3, el barrido de §16 recorre el pin —donde la portada ya
 * no está— y el reparto en tercios de B2 no se mueve un bit. La portada no es un
 * cuarto paso: es el índice −1 de los tres que ya había.
 *
 * ── El `h2` sigue nombrando la región ─────────────────────────────────────
 *
 * `idDelTitularDeSeccion` va acá, en la caja que contiene el titular. Que la
 * portada se vaya de la vista no le saca el nombre a la `<section>`: el elemento
 * sigue en el árbol —P7 mueve `transform` y `opacity`, no lo desmonta— y el
 * nombre accesible se computa igual.
 */
export function PortadaDeTrabajos({
  seccion,
  progreso,
}: PropsDeSeccion & { readonly progreso: MotionValue<number> }): React.JSX.Element {
  const local = useTransform(progreso, localDeLaPortada)
  return (
    <CanalDePieza progreso={local} patron="P7" cantidad={1} indice={0} className="absolute inset-0 flex items-center">
      <Envoltorio>
        <div className={GEOMETRIA.claseDeLaMedidaDelPlano}>
          <div className="flex flex-col gap-4">
            <Titular nivel="titulo-m" como="h2" id={idDelTitularDeSeccion(seccion.id)}>
              {CONTENIDO.titular}
            </Titular>
            <Cuerpo>{CONTENIDO.bajada}</Cuerpo>
          </div>
        </div>
      </Envoltorio>
    </CanalDePieza>
  )
}

/**
 * LA RAMA QUIETA — el MISMO proyecto, en fila, y la portada arriba.
 *
 * Abajo de 1025 y con `prefers-reduced-motion` no hay coreografía, así que no
 * hay «venir como las imágenes»: no hay imágenes que vengan. La portada vuelve a
 * ser un encabezado y los tres proyectos se apilan, cada uno con su pantalla.
 * **Se declara como asimetría deliberada** y no se disimula: la rama quieta es
 * la que tiene que poder leerse sin movimiento, y un título que aparece y
 * desaparece sin gesto sería un título que se perdió.
 */
export function RamaQuieta({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Envoltorio className="py-4 escritorio:pt-16 escritorio:pb-8" claseDeContenido="flex h-full flex-col gap-8">
      <Grilla columnas="lateral" className="shrink-0">
        <MarcaDeSeccion />
        <div className="flex flex-col gap-2">
          <Titular nivel="titulo-m" como="h2" id={idDelTitularDeSeccion(seccion.id)} className="max-w-[var(--breakpoint-medio)]">
            {CONTENIDO.titular}
          </Titular>
          <Cuerpo className="max-w-[var(--breakpoint-medio)]">{CONTENIDO.bajada}</Cuerpo>
        </div>
      </Grilla>
      <Grilla columnas={1} className="content-center escritorio:h-full escritorio:grid-cols-3">
        {CONTENIDO.proyectos.map((proyecto) => (
          <div key={proyecto.nombre} className="flex min-h-svh flex-col justify-center escritorio:min-h-0">
            <Proyecto proyecto={proyecto} rotulo={CONTENIDO.rotuloDeLaMetrica} caja={CAJA_DE_LA_CAPTURA} />
          </div>
        ))}
      </Grilla>
    </Envoltorio>
  )
}

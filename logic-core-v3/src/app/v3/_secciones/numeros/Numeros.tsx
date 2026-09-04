'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'

import { CifraDeLaComposicion, type Celda } from './Cifra'
import { CONTENIDO, type ClaveDeCifra } from './contenido'

/**
 * 03 · NÚMEROS — CUATRO pantallas de papel, y las cifras NO en una barra.
 *
 * ── El hallazgo que decide la composición entera ───────────────────────────
 *
 * Medido y observado sobre la referencia: *"Están dispersos en posiciones
 * asimétricas y tamaños distintos. Reproducirlos como una barra de cuatro
 * columnas pierde el efecto entero."* N columnas iguales dicen **"estos datos
 * valen lo mismo"** y el efecto copiado dice lo contrario, así que ahí el gesto
 * no se degrada: desaparece. Por eso hay una grilla de DOCE columnas usada como
 * **primitiva de posición** —no una fila de columnas iguales ni una `<Grilla>`—
 * y cada cifra declara arranque, ancho y fila sin compartir las tres con otra.
 * Un instrumento afirma que en el marcado no existe ni un `grid-cols-4` ni un
 * `grid-cols-5`, y que las cinco celdas difieren en las tres coordenadas.
 *
 * ── B2 · LOS MOMENTOS. La sección medía CERO acontecimientos. [medido] ─────
 *
 * La Fase 0 de B2 subió esta sección de `100svh` a **`400svh`** —del techo de
 * velocidad de la cámara y de la densidad de la referencia, `B2-DELTAS.md`
 * §3.1— y la composición se quedó como estaba: **una sola caja `min-h-svh` con
 * los seis bloques adentro y tres pantallas de scroll vacío detrás.** Las dos
 * consecuencias, medidas a 1920×1080 con el censo de `B2-DELTAS.md` §0:
 *
 * 1. **`s10-mobile` §2 en rojo** — `numeros: el flujo llena las 4 pantallas
 *    declaradas` fallaba en los cuatro anchos: el marcado componía UNA.
 * 2. **Cero acontecimientos adentro de la sección.** El ancla de P2 es
 *    `top bottom → bottom bottom`: un bloque aterriza cuando su borde inferior
 *    toca el pie del viewport. Con los seis apretados en la primera pantalla,
 *    aterrizaban entre `scrollY` **3720 y 4320** —ANTES de que la sección
 *    llegue al tope, fundidos con el último grupo de Quiénes somos— y adentro
 *    de `[4320, 8640]` el censo medía **0 grupos**: de ahí salían las **5,44
 *    pantallas** de hueco máximo del documento entero.
 *
 * **El arreglo es geométrico y no agrega una sola pieza:** la misma composición
 * dispersa se reparte en **cuatro cajas `min-h-svh`**, una por pantalla
 * declarada, y las filas que ya tenía pasan a ser las de cada caja. Como cada
 * bloque aterriza donde está su caja, repartirlos en vertical reparte los
 * aterrizajes; `GEOMETRIA.pantallas` es esa tabla.
 *
 * ⚠ Es el mismo defecto que el frente C encontró en Servicios, del otro lado:
 * allá el progreso no se detenía nunca, acá se detenía todo junto y fuera de
 * cuadro. La cura es la misma: que algo TERMINE de moverse donde alguien mire.
 * ⚠ **Y el costo se declara:** seis bloques en cuatro pantallas dejan más aire
 * por pantalla que seis en una — consecuencia directa de *"repartí lo que YA
 * HAY: ni contenido ni relleno"*—; por eso el reparto de B1 se conserva caja
 * por caja.
 *
 * ── Los tamaños, y el escalonado que ya no sale de un desplome ─────────────
 * La escala de display tiene EXACTAMENTE cuatro niveles —`titulo-s` 20px,
 * `titulo-m` 32, `titulo-l` 44, `titulo-xl` 56—, así que cinco tamaños
 * distintos exigirían un quinto: un token que no existe. Uno se repite, en las
 * dos de peso medio. Los rótulos son TODOS `micro`: dos variables a la vez no
 * son jerarquía, son ruido.
 *
 * El escalonado sale de la GEOMETRÍA y no del cronograma —el porqué está en
 * `CifraDeLaComposicion`—, y **B2 cambia de dónde sale la distinta altura que
 * lo produce.** Antes eran las cinco filas de UNA grilla de una pantalla, y las
 * dos que compartían fila se separaban con un desplome de la escala de
 * espaciado (`tablet:mt-20`, 80 px): **menos de un paso del censo** (120 px),
 * así que el instrumento las leía como un solo aterrizaje. Ahora las dos cifras
 * de una pantalla están en **filas distintas de su grilla**, que con
 * `content-evenly` las separa cerca de un tercio de la caja. **Los desplomes se
 * van con el motivo que los puso.**
 *
 * ── Abajo de 1025, y abajo de 768 ─────────────────────────────────────────
 *
 * **Abajo de 1025 la composición no cambia: cambia si se anima.** Las clases de
 * posición viven en la variante `tablet:` (768), así que entre 768 y 1024 se ve
 * la misma composición dispersa, quieta —si fuera otra, lo que juzga el
 * visitante de tablet sería un diseño que nadie compuso—: las primitivas
 * entregan `progreso: null` y las seis piezas salen enteras, sin transformada y
 * sin `will-change`. **Abajo de 768 la grilla colapsa a UNA columna**
 * (`grid-cols-1`) y las posiciones se van con ella, porque también son
 * `tablet:`: las cajas caen en orden de documento —el de lectura de
 * `contenido.ts`— y lo que sobrevive de la asimetría son los TAMAÑOS, que los
 * `clamp()` comprimen a 36 · 24 · 18 · 17px en 375. **Las cuatro cajas de
 * pantalla sí sobreviven**: `min-h-svh` no lleva variante, y es lo que hace que
 * el flujo llene las cuatro pantallas declaradas en los cuatro anchos.
 *
 * ⚠ **La última cifra era 16px hasta SITIO-S11, y eso era el defecto.** 16 es
 * EXACTAMENTE `--text-base` y un píxel arriba de `--text-cuerpo`: la cifra más
 * chica dejaba de leerse como cifra justo en el ancho donde vive la mitad de
 * los visitantes. S11 subió el piso de `--text-fluido-titulo-s` de 16 a 17px
 * —el único entero que pasa `base` y se queda abajo del piso de `titulo-m`
 * (18)— sin tocar su techo. `s10-mobile` §4 lo reproduce leyendo el token. Y
 * nada se rompe al angostar: **ni una posición absoluta** y **ningún ancho en
 * píxeles** —las doce columnas son `minmax(0, 1fr)`, las canaletas son tokens—.
 */

/**
 * UNA PANTALLA DE LA SECCIÓN — qué lleva cada una de las cuatro. **[B2]**
 *
 * El reparto NO es por cantidad: es por lo que las cifras dicen. `volumen` es
 * cuánto trabajo hay, `tiempo` es cuánto tarda y `escala` es lo que corre solo.
 * La cabecera abre y no comparte pantalla con ninguna cifra, que es lo que la
 * separa del primer aterrizaje. El orden de este arreglo y el de sus claves
 * reproducen el ORDEN DE LECTURA de `contenido.ts`, y el instrumento lo afirma.
 */
export interface PantallaDeNumeros {
  /** El valor de `data-pantalla`. Es cómo el instrumento agarra cada caja. */
  readonly id: string
  /** Si lleva el rótulo de sección y la cabecera. Sólo la primera. */
  readonly cabecera: boolean
  /** Las cifras que caen en esta pantalla, en orden de lectura. */
  readonly cifras: readonly ClaveDeCifra[]
}

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido:
 * es técnica, la decide quien compone la sección y no cambia el día que Franco
 * traiga las cifras. La forma de una celda vive en `Cifra.tsx`.
 */
export const GEOMETRIA: {
  readonly columnas: number
  readonly etiqueta: string
  readonly cabecera: string
  readonly medida: string
  readonly pantallas: readonly PantallaDeNumeros[]
  readonly celdas: Readonly<Record<ClaveDeCifra, Celda>>
} = {
  /** DOCE — [decidido]: el mínimo divisible por 2, 3 y 4 a la vez, así que un
   *  ancho puede ser media grilla (6), un tercio (4) o un cuarto (3) sin una
   *  fracción rara. Con 10 los tercios no existen; con 16 los anchos chicos
   *  quedan abajo de la línea de texto más corta. */
  columnas: 12,
  /**
   * ⚠ **B1: el rótulo entró a la composición y no es cosmético.** Estaba
   * afuera, separado por un `gap` fijo, así que el hueco de arriba era
   * `padding + gap` y no participaba del reparto: 232,72 px contra los 32 de
   * las junturas de adentro. Va sin `col-start` a propósito: con la fila
   * declarada cae en la columna 1, y **el instrumento que cuenta las celdas
   * sólo levanta las clases con `col-start`** — el rótulo no se cuenta como una
   * sexta cifra.
   */
  etiqueta: 'tablet:col-span-3 tablet:row-start-1',
  /** El titular y la bajada arrancan en la columna 1, en la segunda fila de la
   *  primera pantalla. El ancho lo manda `medida` arriba de ~1025. */
  cabecera: 'tablet:col-start-1 tablet:col-span-7 tablet:row-start-2',
  /**
   * LA MEDIDA DE LECTURA de la cabecera. [medido] Siete de doce columnas valen
   * 985 px a 1920: la bajada salía en **2 líneas de 74 caracteres** y el
   * titular en UNA sola. Es el defecto que B1 le arregló al Hero, y la
   * referencia lo resuelve igual: su caja de texto mide 480 px y **no crece con
   * la ventana** (`B1-DELTAS.md` §1). `--fluido-piso` son 375 px y deja el
   * titular en 2 líneas y la bajada en ~50 caracteres. Es un TOPE y no un ancho
   * de columna, así que abajo de ~1025 manda la columna.
   *
   * ⚠ Va acá y NO adentro de `cabecera`: `s10-mobile` §4 afirma que toda clase
   * de `cabecera`, `celda` y `desplome` vive en `tablet:` —para que ninguna
   * posición sobreviva a 375—, y un tope de lectura no es una posición. */
  medida: 'max-w-[var(--fluido-piso)]',
  pantallas: [
    { id: 'entrada', cabecera: true, cifras: [] },
    { id: 'volumen', cabecera: false, cifras: ['proyectos', 'clientes'] },
    { id: 'tiempo', cabecera: false, cifras: ['anios', 'respuesta'] },
    { id: 'escala', cabecera: false, cifras: ['procesos'] },
  ],
  celdas: {
    /** La que manda: nivel más grande, al margen y sola en su fila. */
    proyectos: {
      nivel: 'titulo-xl',
      celda: 'tablet:col-start-1 tablet:col-span-5 tablet:row-start-1',
      desplome: '',
    },
    /** El contrapeso, en la fila de abajo y contra el margen derecho: las dos
     *  coordenadas cambian a la vez, que es la asimetría.
     *  ⚠ B1: arranca en la 9 y no en la 8, medido: a 1920 la pastilla de
     *  navegación ocupa de x 658 a x 1262, y desde la columna 8 esta cifra
     *  empezaba en x 1189 —73 px por dentro de la pastilla, que en una parada
     *  de scroll le tapaba 38,11 px de los 51,75 que mide—. Desde la 9 empieza
     *  en x 1332: afuera. */
    clientes: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-9 tablet:col-span-4 tablet:row-start-2',
      desplome: '',
    },
    /** La más chica, sangrada dos columnas: ese hueco a la izquierda es lo que
     *  impide que la pantalla se lea como una grilla. */
    anios: {
      nivel: 'titulo-s',
      celda: 'tablet:col-start-3 tablet:col-span-3 tablet:row-start-1',
      desplome: '',
    },
    /** Segundo nivel, ancha y a la derecha, debajo de la más chica. */
    respuesta: {
      nivel: 'titulo-l',
      celda: 'tablet:col-start-7 tablet:col-span-6 tablet:row-start-2',
      desplome: '',
    },
    /** Cierra sola su pantalla, en la fila DE ABAJO: las tres pantallas de
     *  cifras comparten la retícula de dos filas y la última tiene una sola
     *  cifra. ⚠ **Y ahí hay un número:** en la fila de arriba su aterrizaje
     *  caía cerca de `scrollY` 7053 y dejaba **1,47 pantallas** hasta el primer
     *  aterrizaje de Trabajos —el hueco más grande del tramo—; en la de abajo
     *  baja al final de la sección y el hueco se acorta. */
    procesos: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-2 tablet:col-span-4 tablet:row-start-2',
      desplome: '',
    },
  },
}

/**
 * UNA PANTALLA de la composición: doce columnas desde 768, UNA abajo, y su
 * propia caja de pantalla. Las canaletas son los MISMOS tokens del canal
 * `conmutado` de `Grilla` —12px abajo de 1025, 16px arriba—: una composición
 * que inventa su canaleta se ve de otro sistema.
 *
 * **B1 · el hueco se reparte, no se acumula. [medido]** Antes: 614,56 px de
 * composición centrados en 1080, o sea **232,72 px de nada arriba y otros
 * 232,72 abajo** mientras las junturas de adentro medían 32. `content-evenly`
 * sobre una caja de pantalla reparte lo que sobra **por igual entre las
 * junturas**; un `gap` fijo no puede, y por eso `gap-y` se apaga arriba de 1025
 * —sumado al reparto daría junturas desparejas— y vuelve abajo del umbral,
 * donde la caja no sobra: sobra tinta.
 *
 * ⚠ **B2: el `min-h-svh` se mudó del envoltorio único a cada pantalla.**
 * `escritorio:py-0` y no un relleno fijo: arriba de 1025 el borde lo pone el
 * propio reparto y sumarle un `padding` lo duplicaría.
 */
const CLASES_DE_LA_PANTALLA = cn(
  'grid min-h-svh w-full grid-cols-1 content-evenly items-start gap-y-8 py-12',
  'tablet:grid-cols-12 escritorio:gap-y-0 escritorio:py-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

export function Numeros({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        {/* La columna lateral con el `03` abarca las cuatro pantallas: es el
            rótulo de la SECCIÓN, no el de una caja. */}
        <Grilla columnas="lateral">
          <NumeroDeSeccion seccion={seccion} />
          <div className="flex w-full flex-col">
            {GEOMETRIA.pantallas.map((pantalla) => (
              <div
                key={pantalla.id}
                data-pantalla={pantalla.id}
                data-composicion="dispersa"
                className={CLASES_DE_LA_PANTALLA}
              >
                {/* El rótulo sale de la tabla del recorrido y no del contenido:
                    escribir `Números` también en `contenido.ts` sería una
                    segunda fuente que se desincroniza. Y el `h2` nombra la
                    región de la sección (S11, defecto 10). */}
                {pantalla.cabecera ? (
                  <>
                    <EtiquetaDeSeccion className={GEOMETRIA.etiqueta}>{seccion.nombre}</EtiquetaDeSeccion>
                    <Bloque patron="P2" className={cn(GEOMETRIA.cabecera, GEOMETRIA.medida)}>
                      {(progreso) => (
                        <CanalDeUnaPieza progreso={progreso} patron="P2" className="flex flex-col gap-4">
                          <Titular nivel="titulo-l" como="h2" id={idDelTitularDeSeccion(seccion.id)}>
                            {CONTENIDO.titulo}
                          </Titular>
                          <Cuerpo>{CONTENIDO.entrada}</Cuerpo>
                        </CanalDeUnaPieza>
                      )}
                    </Bloque>
                  </>
                ) : null}
                {/* Se recorre `CONTENIDO.cifras` —y no la lista de la pantalla—
                    para que el ORDEN DE LECTURA lo mande el contenido. */}
                {CONTENIDO.cifras
                  .filter((cifra) => pantalla.cifras.includes(cifra.clave))
                  .map((cifra) => (
                    <CifraDeLaComposicion
                      key={cifra.clave}
                      clave={cifra.clave}
                      valor={cifra.valor}
                      rotulo={cifra.rotulo}
                      celda={GEOMETRIA.celdas[cifra.clave]}
                    />
                  ))}
              </div>
            ))}
          </div>
        </Grilla>
      </Envoltorio>
    </Seccion>
  )
}

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
 * Medido y observado sobre la referencia: *"Están dispersos en posiciones
 * asimétricas y tamaños distintos. Reproducirlos como una barra de cuatro
 * columnas pierde el efecto entero."* N columnas iguales dicen **"estos datos
 * valen lo mismo"** y el efecto copiado dice lo contrario: el gesto no se
 * degrada, desaparece. Por eso hay una grilla de DOCE columnas usada como
 * **primitiva de posición** —no una fila de columnas iguales ni una `<Grilla>`—
 * y cada cifra declara arranque, ancho y fila sin compartir las tres con otra;
 * un instrumento afirma que no hay `grid-cols-4` ni `grid-cols-5` en el marcado.
 *
 * ── B2 · LOS MOMENTOS. La sección medía CERO acontecimientos. [medido] ─────
 *
 * La Fase 0 de B2 subió esta sección de `100svh` a **`400svh`** (el techo de
 * velocidad de la cámara y la densidad de la referencia, `B2-DELTAS.md` §3.1) y
 * la composición se quedó como estaba: **una sola caja `min-h-svh` con los seis
 * bloques adentro y tres pantallas de scroll vacío detrás.** Medido a 1920×1080
 * con el censo de `B2-DELTAS.md` §0: `s10-mobile` §2 en rojo (el marcado
 * componía UNA pantalla de las 4 declaradas) y **cero acontecimientos adentro
 * de la sección** — el ancla de P2 es `top bottom → bottom bottom`, los seis
 * aterrizaban entre `scrollY` **3720 y 4320**, ANTES del tope y fundidos con el
 * último grupo de Quiénes somos, y en `[4320, 8640]` el censo medía **0
 * grupos**: de ahí salían las **5,44 pantallas** de hueco máximo del documento.
 *
 * **El arreglo es geométrico y no agrega una sola pieza:** la misma composición
 * se reparte en **cuatro cajas `min-h-svh`**, una por pantalla declarada, y las
 * filas que ya tenía pasan a ser las de cada caja: cada bloque aterriza donde
 * está su caja (`GEOMETRIA.pantallas` es esa tabla). Es el mismo defecto que el
 * frente C encontró en Servicios, del otro lado —allá el progreso no se detenía
 * nunca—, y la misma cura: que algo TERMINE de moverse donde alguien mire.
 * ⚠ **El costo se declara:** seis bloques en cuatro pantallas dejan más aire por
 * pantalla que seis en una (*"repartí lo que YA HAY: ni contenido ni relleno"*);
 * por eso el reparto de B1 se conserva caja por caja.
 *
 * ── Los tamaños, y el escalonado que ya no sale de un desplome ─────────────
 * La escala de display tiene EXACTAMENTE cuatro niveles —`titulo-s` 20px,
 * `titulo-m` 32, `titulo-l` 44, `titulo-xl` 56—, así que cinco tamaños
 * distintos exigirían un token que no existe: uno se repite, en las dos de peso
 * medio. Los rótulos son TODOS `micro`: dos variables a la vez no son
 * jerarquía, son ruido. El escalonado sale de la GEOMETRÍA y no del cronograma
 * (el porqué está en `CifraDeLaComposicion`), y **B2 cambia de dónde sale la
 * distinta altura que lo produce**: antes, las cinco filas de UNA grilla, con
 * las dos que compartían fila separadas por un desplome de 80 px (`tablet:mt-20`,
 * menos de un paso del censo de 120: un solo aterrizaje). Ahora las dos cifras
 * de una pantalla están en **filas distintas de su grilla**, que `content-evenly`
 * separa cerca de un tercio de la caja. **Los desplomes se van con su motivo.**
 *
 * ── Abajo de 1025, y abajo de 768 ─────────────────────────────────────────
 *
 * **Abajo de 1025 la composición no cambia: cambia si se anima.** Las clases de
 * posición viven en la variante `tablet:` (768), así que entre 768 y 1024 se ve
 * la misma composición dispersa, quieta —si fuera otra, lo que juzga el
 * visitante de tablet sería un diseño que nadie compuso—: las primitivas
 * entregan `progreso: null` y las seis piezas salen enteras, sin transformada y
 * sin `will-change`. **Abajo de 768 la grilla colapsa a UNA columna**
 * (`grid-cols-1`) y las posiciones se van con ella —también son `tablet:`—: las
 * cajas caen en el orden de lectura de `contenido.ts` y sobreviven la asimetría
 * de TAMAÑOS (los `clamp()` dan 36 · 24 · 18 · 17px en 375) y las cuatro cajas
 * de pantalla (`min-h-svh` no lleva variante). ⚠ La última cifra era 16px hasta
 * SITIO-S11 —EXACTAMENTE `--text-base`, un píxel arriba de `--text-cuerpo`—: S11
 * subió el piso de `--text-fluido-titulo-s` de 16 a 17px (el único entero que
 * pasa `base` y queda abajo del piso de `titulo-m`, 18) sin tocar su techo;
 * `s10-mobile` §4 lo reproduce. Y nada se rompe al angostar: **ni una posición
 * absoluta** y **ningún ancho en píxeles** —doce `minmax(0, 1fr)`, canaletas de
 * tokens—.
 *
 * ═══ B11 · LA DISPERSIÓN, EN LA MITAD QUE EL LOGO DEJA LIBRE [medido] ═══════
 *
 * **La coreografía manda y el texto se mueve.** B8 abrió la sección sobre la
 * sala y el logo pasaba por detrás de 8–10 de sus 13 bloques (1,00:1) a lo largo
 * del TRAMO, no en una pose: la silueta cada 1/16 de pantalla (`scripts-b11/`,
 * `a-logo.ts` cruzado con estas columnas por `h-columnas.ts`) tapa las columnas
 * 1–5 en las cuatro pantallas y en los tres anchos, la 6 a medias, y **de la 7 a
 * la 12 queda libre** (0–7 % alguna vez; la tabla, en `B11-ACOMODAMIENTO.md` §3).
 * Por eso la composición vive desde la 7 (`primeraColumnaLibre`) y la dispersión
 * se conserva adentro de esa mitad: arranques 7 · 9 · 8 · 10 · 7, anchos 6 · 4 · 3,
 * fila y pantalla propias, los cuatro tamaños. **Lo que se pierde:** la amplitud,
 * de 1.220 a 594 px a 1440 (PARADA 1 de B11). Lo que NO cierra —la última cifra
 * bajo el atardecer, que no sube a la fila 1 porque ahí deja 1,47 pantallas hasta
 * Trabajos contra el gate de 1,33 de B9— y el piso de motas que ninguna columna
 * baja (0,45–0,48 % del cuadro bajo AA) llevan número en `deudas-b11.ts` (D-B11.3).
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
  readonly primeraColumnaLibre: number
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
  /** SIETE — [medido, B11]: la primera columna que el logo NO tapa en ninguna
   *  parada del tramo, en las cuatro pantallas y en los tres anchos. Ninguna
   *  pieza arranca antes, y el invariante lo afirma leyendo el marcado. */
  primeraColumnaLibre: 7,
  /**
   * ⚠ **B1: el rótulo entró a la composición y no es cosmético.** Estaba afuera,
   * con un `gap` fijo: el hueco de arriba (`padding + gap`, 232,72 px contra los 32
   * de las junturas de adentro) no participaba del reparto.
   * ⚠ **B11: arranca en la 7 con `col-start`, y eso destapó un defecto del
   * instrumento**: `celdasDe` contaba toda clase con `tablet:col-start-` y un
   * rótulo posicionado era una sexta cifra. Se ARREGLA (salta la pieza por su
   * `data-pieza`), no se afloja. Sin `col-span`: «Números» mide 51 px.
   */
  etiqueta: 'tablet:col-start-7 tablet:row-start-1',
  /** El titular y la bajada: primera columna libre, segunda fila de la primera pantalla; el ancho lo manda `medida`. */
  cabecera: 'tablet:col-start-7 tablet:col-span-6 tablet:row-start-2',
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
    /** La que manda: nivel más grande, de la primera columna libre al margen
     *  derecho, sola en su fila (B11: era la 1–5, 100 % bajo el logo). */
    proyectos: {
      nivel: 'titulo-xl',
      celda: 'tablet:col-start-7 tablet:col-span-6 tablet:row-start-1',
      desplome: '',
    },
    /** El contrapeso, abajo y sangrada dos columnas respecto de la de arriba: las
     *  dos coordenadas cambian a la vez. ⚠ B1: en la 9 y no en la 8, medido: a 1920 la pastilla de
     *  navegación ocupa de x 658 a x 1262, y desde la columna 8 esta cifra
     *  empezaba en x 1189 —73 px por dentro de la pastilla, que en una parada
     *  de scroll le tapaba 38,11 px de los 51,75 que mide—. Desde la 9 empieza
     *  en x 1332: afuera. */
    clientes: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-9 tablet:col-span-4 tablet:row-start-2',
      desplome: '',
    },
    /** La más chica, sangrada una columna desde el borde libre: ese hueco es lo
     *  que impide que se lea como grilla (B11: era la 3–5, bajo el logo). */
    anios: {
      nivel: 'titulo-s',
      celda: 'tablet:col-start-8 tablet:col-span-3 tablet:row-start-1',
      desplome: '',
    },
    /** Segundo nivel, contra el margen derecho, debajo de la más chica. Tres
     *  columnas (B11): 290 px a 1440 para 177 de cifra; la 10 es el cuarto arranque. */
    respuesta: {
      nivel: 'titulo-l',
      celda: 'tablet:col-start-10 tablet:col-span-3 tablet:row-start-2',
      desplome: '',
    },
    /** Cierra sola su pantalla, en la fila DE ABAJO: las tres pantallas de
     *  cifras comparten la retícula de dos filas y la última tiene una sola
     *  cifra. ⚠ **Y ahí hay un número:** en la fila de arriba su aterrizaje
     *  caía cerca de `scrollY` 7053 y dejaba **1,47 pantallas** hasta el primer
     *  aterrizaje de Trabajos —el hueco más grande del tramo—; en la de abajo
     *  baja al final de la sección y el hueco se acorta. B11 la corre a la 7 y la
     *  deja abajo aunque la alcance el atardecer: docblock de arriba, D-B11.3. */
    procesos: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-7 tablet:col-span-4 tablet:row-start-2',
      desplome: '',
    },
  },
}

/**
 * UNA PANTALLA de la composición: doce columnas desde 768, UNA abajo, y su
 * propia caja de pantalla. Las canaletas son los MISMOS tokens del canal
 * `conmutado` de `Grilla` —12px abajo de 1025, 16px arriba—: una composición
 * que inventa su canaleta se ve de otro sistema.
 * **B1 · el hueco se reparte, no se acumula. [medido]** Antes: 614,56 px de
 * composición centrados en 1080, o sea **232,72 px de nada arriba y otros
 * 232,72 abajo** mientras las junturas de adentro medían 32. `content-evenly`
 * reparte lo que sobra **por igual entre las junturas**; un `gap` fijo no puede,
 * y por eso `gap-y` se apaga arriba de 1025 —sumado al reparto daría junturas
 * desparejas— y vuelve abajo del umbral, donde no sobra caja: sobra tinta.
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
                    <Bloque patron="P2" rango="ventana-visible" className={cn(GEOMETRIA.cabecera, GEOMETRIA.medida)}>
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

'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular, idDelTitularDeSeccion, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'

import { Cifra } from './Cifra'
import { CONTENIDO, type ClaveDeCifra } from './contenido'

/**
 * 03 · NÚMEROS — una pantalla de papel, y las cifras NO en una barra de cuatro.
 *
 * ── El hallazgo que decide la composición entera ───────────────────────────
 *
 * Medido y observado sobre la referencia: *"Están dispersos en posiciones
 * asimétricas y tamaños distintos. Reproducirlos como una barra de cuatro
 * columnas pierde el efecto entero."* No es estética: N columnas iguales dicen
 * **"estos datos valen lo mismo"** y el efecto copiado dice lo contrario —un
 * dato manda y los otros lo acompañan—, así que ahí el gesto no se degrada,
 * desaparece.
 *
 * Por eso no hay fila de columnas iguales ni `<Grilla>` para las cifras: hay
 * una grilla de DOCE columnas usada como **primitiva de posición**, y cada
 * cifra declara arranque, ancho y fila sin compartir las tres con otra. Un
 * instrumento afirma que en el marcado no existe ni un `grid-cols-4` ni un
 * `grid-cols-5`, y que las cinco celdas difieren en las tres coordenadas.
 *
 * ── Los tamaños: cuatro niveles para cinco cifras, y el repetido es forzado ─
 *
 * La escala de display tiene EXACTAMENTE cuatro niveles —`titulo-s` 20px,
 * `titulo-m` 32, `titulo-l` 44, `titulo-xl` 56—, así que cinco tamaños
 * distintos exigirían un quinto: un token que no existe. Uno se repite, y se
 * repite en las dos de peso medio: "ésta primero, estas dos parejas, ésta".
 *
 * Los rótulos, en cambio, son TODOS del mismo nivel (`micro`, mayúsculas): si
 * también variaran, dos variables a la vez no son jerarquía, son ruido.
 *
 * ── La coreografía: P2 SEIS veces, y el escalonado es real ─────────────────
 *
 * P2 tiene **un solo target por instancia** —está en su ficha medida— y por eso
 * su `escalonado` declarado (0,1 s) queda inerte: el cronograma lo aplica sobre
 * `cantidad − 1 = 0`. Un `BloqueDeSeccion` con `piezas={5}` NO escalonaría
 * nada, las cinco entrarían con el mismo disparo. El de esta sección sale de la
 * GEOMETRÍA: cada cifra vive en **su propio bloque con `piezas={1}`**, y el
 * ancla de P2 —`top bottom → bottom bottom`— se resuelve contra la caja del
 * bloque, así que cada uno arranca cuando SU borde superior toca el borde
 * inferior del viewport. Cajas a distinta altura, arranques a distinto scroll.
 *
 * Y por eso las dos cifras que comparten fila llevan desplome propio
 * (`tablet:mt-*`, de la escala de espaciado): rompe la alineación horizontal
 * —la mitad de la asimetría— y separa los topes de dos cajas que, alineadas,
 * tendrían el MISMO ancla y entrarían juntas. Sin él habría seis bloques y sólo
 * cuatro momentos. Las que están solas en su fila NO lo llevan: no tienen con
 * quién romper la alineación, y el hueco lo reparte la grilla.
 *
 * ── B1 · LA RESTA. Qué se midió y qué se cambió. [medido] ─────────────────
 *
 * Antes, a 1920×1080: **57,13 % de aire muerto y una banda vacía continua de
 * 178 px**, con 614,56 px de composición centrados en una caja de 1080 —232,72
 * px de nada arriba y otros 232,72 abajo—. Y la bajada en **2 líneas de 74
 * caracteres**, porque siete de doce columnas valen 985 px a 1920. Tres
 * cambios, los tres con su número: **la medida de lectura se acota** con
 * `GEOMETRIA.medida` —un tope, no un ancho de columna—, **el rótulo entra a la
 * composición** como su primera fila para que su hueco entre en el reparto en
 * vez de ser `padding + gap`, y **el hueco se reparte** con `grow` +
 * `content-evenly`, con el desplome de `anios` de 48 a 80 px.
 *
 * ── Abajo de 1025, y abajo de 768 ─────────────────────────────────────────
 *
 * **Abajo de 1025 la composición no cambia: cambia si se anima.** Las clases de
 * posición viven en la variante `tablet:` (768), así que entre 768 y 1024 se ve
 * exactamente la misma composición dispersa, quieta. Eso es deliberado: si la
 * composición fuera otra abajo del umbral, lo que juzga el visitante de tablet
 * sería un diseño que nadie compuso. `BloqueDeSeccion` entrega `progreso: null`
 * y las seis piezas se renderizan enteras, sin una transformada y sin un
 * `will-change`.
 *
 * **Abajo de 768 la grilla colapsa a UNA columna** (`grid-cols-1`) y los
 * desplomes se van con ella, porque también son `tablet:`. Las cajas caen en
 * orden de documento —el de lectura declarado en `contenido.ts`— y la asimetría
 * que sobrevive es la de TAMAÑOS, que no depende del ancho: los `clamp()`
 * comprimen los cuatro niveles a 36 · 24 · 18 · 17px en 375.
 *
 * ⚠️ **La última cifra era 16px hasta SITIO-S11, y eso era el defecto.** 16 es
 * EXACTAMENTE `--text-base` y un píxel arriba de `--text-cuerpo`: la cifra más
 * chica dejaba de leerse como cifra justo en el ancho donde vive la mitad de
 * los visitantes. S11 subió el piso de `--text-fluido-titulo-s` de 16 a 17px
 * —el único entero que pasa `base` y se queda abajo del piso de `titulo-m`
 * (18)— sin tocar su techo. `s10-mobile` §4 lo reproduce leyendo el token.
 *
 * No se rompe por dos razones: **ni una posición absoluta** —nada puede quedar
 * encima de otra cosa al angostar— y **ningún ancho en píxeles**: las doce
 * columnas son `minmax(0, 1fr)` y las canaletas son tokens fijos.
 */

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 * Está acá y no en `contenido.ts` porque es técnica: la decide quien compone la
 * sección y no cambia el día que Franco traiga las cifras.
 *
 * ⚠ Las celdas son CADENAS LITERALES y no una clase armada por interpolación:
 * Tailwind escanea el código fuente, una clase construida no la ve nadie, la
 * regla no se emite nunca y la cifra queda en la columna 1 sin un error en
 * consola. El instrumento lee los números DEL MARCADO —parseados de la clase
 * renderizada— así que la comprobación no se desincroniza de lo que se ve.
 */
interface Celda {
  /** El tamaño. De los cuatro niveles de display; no hay un quinto. */
  readonly nivel: NivelDeTitular
  /** Columna de arranque, ancho y fila, desde 768. Literales, no armadas. */
  readonly celda: string
  /** El desplome dentro de la fila, de la escala de espaciado (`1 2 3 4 5 6 8
   *  12 20`) y nunca un px suelto. `''` cuando la cifra manda su fila. */
  readonly desplome: string
}

export const GEOMETRIA: {
  readonly columnas: number
  readonly etiqueta: string
  readonly cabecera: string
  readonly medida: string
  readonly celdas: Readonly<Record<ClaveDeCifra, Celda>>
} = {
  /** DOCE — [decidido]: el mínimo divisible por 2, 3 y 4 a la vez, así que un
   *  ancho puede ser media grilla (6), un tercio (4) o un cuarto (3) sin caer
   *  en una fracción rara. Con 10 los tercios no existen; con 16 los anchos
   *  chicos quedan abajo de la línea de texto más corta. */
  columnas: 12,
  /**
   * ⚠ **B1: el rótulo entró a la composición y no es cosmético.** Estaba
   * afuera, arriba de la grilla y separado por un `gap` fijo, así que el hueco
   * de arriba de la pantalla era `padding + gap` y no participaba del reparto:
   * medía 232,72 px contra los 32 px de las junturas de adentro. Adentro es una
   * fila más y su hueco vale lo mismo que los otros. Va sin `col-start` a
   * propósito: con la fila declarada y la columna automática cae en la 1, y
   * **el instrumento que cuenta las celdas sólo levanta las clases con
   * `col-start`** — o sea que el rótulo no se cuenta como una sexta cifra.
   */
  etiqueta: 'tablet:col-span-3 tablet:row-start-1',
  /** El titular y la bajada arrancan en la columna 1. El ancho lo manda
   *  `medida` arriba de ~1025 y la columna abajo. */
  cabecera: 'tablet:col-start-1 tablet:col-span-7 tablet:row-start-2',
  /**
   * LA MEDIDA DE LECTURA de la cabecera. [medido]
   *
   * Siete de doce columnas valen 985 px a 1920: la bajada salía en **2 líneas
   * de 74 caracteres** y el titular en UNA sola. Es el mismo defecto que B1 le
   * arregló al Hero, y la referencia externa lo resuelve igual: su caja de
   * texto mide 480 px y **no crece con la ventana** (`B1-DELTAS.md` §1).
   * `--fluido-piso` son 375 px —el ancho más angosto que el sistema declara
   * medido— y deja el titular en 2 líneas y la bajada en ~50 caracteres. No es
   * un ancho de columna sino un TOPE, así que abajo de ~1025 la columna sigue
   * mandando y la composición no se angosta de más.
   *
   * ⚠ Va acá y NO adentro de `cabecera`: `s10-mobile` §4 afirma que toda clase
   * de `cabecera`, `celda` y `desplome` vive en la variante `tablet:` —para que
   * ninguna posición sobreviva a 375—, y un tope de lectura no es una posición.
   */
  medida: 'max-w-[var(--fluido-piso)]',
  celdas: {
    /** La que manda: nivel más grande, al margen y sola en su mitad. */
    proyectos: {
      nivel: 'titulo-xl',
      celda: 'tablet:col-start-1 tablet:col-span-5 tablet:row-start-3',
      desplome: '',
    },
    /** Comparte fila con la anterior y se desploma: rompe la alineación Y le
     *  da su propio ancla, que si no sería el mismo.
     *  ⚠ B1: arranca en la 9 y no en la 8. Está medido: a 1920 la pastilla de
     *  navegación ocupa de x 658 a x 1262, y desde la columna 8 esta cifra
     *  empezaba en x 1189 — con 73 px por dentro de la pastilla, que en una
     *  parada de scroll le tapaba 38,11 px de los 51,75 que mide. Desde la 9
     *  empieza en x 1332: afuera. */
    clientes: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-9 tablet:col-span-4 tablet:row-start-3',
      desplome: 'tablet:mt-20',
    },
    /** La más chica, sangrada dos columnas: el hueco de la izquierda es lo
     *  que impide que la fila se lea como una fila.
     *  ⚠ B1: el desplome sube de 48 a 80 px. No es ritmo: son 32 px más de
     *  tinta en la fila —la caja crece de 100,28 a 132,28 px— y sigue pegado
     *  a `respuesta`, que mide 86,78 px, así que la fila no se parte en dos. */
    anios: {
      nivel: 'titulo-s',
      celda: 'tablet:col-start-3 tablet:col-span-3 tablet:row-start-4',
      desplome: 'tablet:mt-20',
    },
    /** El contrapeso de la grande: segundo nivel, a la derecha y sin desplome. */
    respuesta: {
      nivel: 'titulo-l',
      celda: 'tablet:col-start-7 tablet:col-span-6 tablet:row-start-4',
      desplome: '',
    },
    /** Cierra abajo a la izquierda. **Sin desplome**: el desplome existe para
     *  romper la alineación con la otra cifra de la fila, y ésta no tiene otra.
     *  Los 32 px que tenía sólo agrandaban la juntura de abajo, que ahora la
     *  reparte la grilla. */
    procesos: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-2 tablet:col-span-4 tablet:row-start-5',
      desplome: '',
    },
  },
}

/**
 * La grilla de la composición: doce columnas desde 768, UNA abajo. Las canaletas
 * son los MISMOS tokens del canal `conmutado` de `Grilla` —12px abajo de 1025,
 * 16px arriba—: una composición que inventa su canaleta se ve de otro sistema.
 *
 * ── B1 · EL HUECO SE REPARTE, NO SE ACUMULA. [medido] ─────────────────────
 *
 * Antes: 614,56 px de composición centrados en 1080, o sea **232,72 px de nada
 * arriba y otros 232,72 abajo** mientras las junturas de adentro medían 32.
 * `grow` + `content-evenly` cambia eso: la grilla crece hasta el alto de la
 * pantalla y reparte lo que le sobra **por igual entre las seis junturas**. Un
 * `gap` fijo no puede hacerlo, y por eso `gap-y` se apaga arriba de 1025:
 * sumado al reparto daría junturas desparejas, que es lo que se viene a sacar.
 * Abajo del umbral vuelve, porque ahí la caja no sobra: sobra tinta.
 */
const CLASES_DE_LA_COMPOSICION = cn(
  'grid w-full grow grid-cols-1 content-evenly items-start gap-y-8',
  'tablet:grid-cols-12 escritorio:gap-y-0',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

export function Numeros({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        {/* `escritorio:py-0` y no un relleno fijo: arriba de 1025 el borde de
            la pantalla lo pone el propio reparto —la juntura de arriba mide lo
            mismo que las de adentro— y sumarle un `padding` lo duplicaría.
            Abajo del umbral el relleno vuelve, porque ahí no hay reparto. */}
        <div
          data-pantalla="numeros"
          className="flex min-h-svh w-full flex-col justify-center py-12 escritorio:py-0"
        >
          <Grilla columnas="lateral" className="grow">
            <NumeroDeSeccion seccion={seccion} />
            <div data-composicion="dispersa" className={CLASES_DE_LA_COMPOSICION}>
              {/* El rótulo sale de la tabla del recorrido y no del contenido:
                  escribir `Números` también en `contenido.ts` sería una segunda
                  fuente que se desincroniza en el primer cambio. Es la primera
                  fila de la composición — el porqué está en `GEOMETRIA.etiqueta`. */}
              <EtiquetaDeSeccion className={GEOMETRIA.etiqueta}>{seccion.nombre}</EtiquetaDeSeccion>

              {/* La cabecera es un bloque más de la composición: así el titular
                  arranca en la columna 1 y la bajada hereda su medida de lectura
                  sin un `max-width` que no salga de un token. */}
              <Bloque patron="P2" className={cn(GEOMETRIA.cabecera, GEOMETRIA.medida)}>
                {(progreso) => (
                  <CanalDeUnaPieza progreso={progreso} patron="P2" className="flex flex-col gap-4">
                    {/* El `h2` que nombra la región de la sección (S11, defecto 10). */}
                    <Titular nivel="titulo-l" como="h2" id={idDelTitularDeSeccion(seccion.id)}>
                      {CONTENIDO.titulo}
                    </Titular>
                    <Cuerpo>{CONTENIDO.entrada}</Cuerpo>
                  </CanalDeUnaPieza>
                )}
              </Bloque>

              {/* Un bloque POR CIFRA: no es repetición, es de dónde sale el escalonado. */}
              {CONTENIDO.cifras.map((cifra) => (
                <Bloque
                  key={cifra.clave}
                  patron="P2"
                  className={cn(
                    GEOMETRIA.celdas[cifra.clave].celda,
                    GEOMETRIA.celdas[cifra.clave].desplome,
                  )}
                >
                  {(progreso) => (
                    <CanalDeUnaPieza progreso={progreso} patron="P2">
                      <Cifra
                        clave={cifra.clave}
                        nivel={GEOMETRIA.celdas[cifra.clave].nivel}
                        valor={cifra.valor}
                        rotulo={cifra.rotulo}
                      />
                    </CanalDeUnaPieza>
                  )}
                </Bloque>
              ))}
            </div>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}

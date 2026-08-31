'use client'

import { cn } from '@/lib/utils'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
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
 * cifra declara arranque, ancho y fila sin compartir las tres con otra. Lo que
 * se cumple es el RESULTADO —que la forma no sea regular—, no la herramienta;
 * un instrumento afirma que en el marcado no existe ni un `grid-cols-4` ni un
 * `grid-cols-5`, y que las cinco celdas difieren en las tres coordenadas.
 *
 * ── Los tamaños: cuatro niveles para cinco cifras, y el repetido es forzado ─
 *
 * La escala de display tiene EXACTAMENTE cuatro niveles —`titulo-s` 20px,
 * `titulo-m` 32, `titulo-l` 44, `titulo-xl` 56—, así que cinco tamaños
 * distintos exigirían un quinto: un token que no existe, y este lane no los
 * inventa. Uno se repite, y se repite en las dos cifras de peso medio: la
 * jerarquía dice "ésta primero, estas dos parejas, ésta última".
 *
 * Los rótulos, en cambio, son TODOS del mismo nivel (`micro`, mayúsculas): si
 * también variaran, el tamaño dejaría de significar nada — dos variables
 * moviéndose a la vez no son jerarquía, son ruido.
 *
 * ── La coreografía: P2 SEIS veces, y el escalonado es real ─────────────────
 *
 * P2 tiene **un solo target por instancia** —está en su ficha medida— y por eso
 * su `escalonado` declarado (0,1 s) queda inerte: el cronograma lo aplica sobre
 * `cantidad − 1 = 0`. Un `BloqueDeSeccion` con `piezas={5}` NO escalonaría
 * nada, las cinco entrarían con el mismo disparo. Ésa es la diferencia entre un
 * escalonado real y uno declarado que no se aplica.
 *
 * El de esta sección sale de la GEOMETRÍA: cada cifra vive en **su propio
 * bloque con `piezas={1}`**, y el ancla de P2 —`top bottom → bottom bottom`— se
 * resuelve contra la caja del bloque, así que cada uno arranca cuando SU borde
 * superior toca el borde inferior del viewport. Cajas a distinta altura,
 * arranques a distinto scroll.
 *
 * Y por eso las dos cifras que comparten fila llevan desplome propio
 * (`tablet:mt-*`, de la escala de espaciado): rompe la alineación horizontal
 * —la mitad de la asimetría— y separa los topes de dos cajas que, alineadas,
 * tendrían el MISMO ancla y entrarían juntas. Sin él habría seis bloques y sólo
 * cuatro momentos.
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
 * desplomes se van con ella, porque también son `tablet:`. Las seis cajas caen
 * en orden de documento —el orden de lectura declarado en `contenido.ts`— y la
 * asimetría que sobrevive es la de TAMAÑOS, que no depende del ancho: los
 * `clamp()` comprimen los cuatro niveles a 36 · 24 · 18 · 16px en 375, sin
 * aplastarlos a uno solo.
 *
 * No se rompe por dos razones concretas: **ni una posición absoluta** —nada
 * puede quedar encima de otra cosa al angostar— y **ningún ancho en píxeles**:
 * las doce columnas son `minmax(0, 1fr)` y las canaletas son los tokens fijos
 * de `Grilla`.
 */

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *
 * Está acá y no en `contenido.ts` porque es técnica: la decide quien compone la
 * sección y no cambia el día que Franco traiga las cifras. Mezclarla con el
 * contenido obligaría a exceptuar sus números del escáner, y una excepción es
 * por donde vuelve a entrar la primera cifra inventada.
 *
 * ⚠ Las celdas son CADENAS LITERALES y no una clase armada por interpolación:
 * Tailwind escanea el código fuente, una clase construida no la ve nadie, la
 * regla no se emite nunca y la cifra queda en la columna 1 sin un error en
 * consola. El instrumento lee los números DEL MARCADO —parseados de la clase
 * renderizada— así que la comprobación no se puede desincronizar de lo que se ve.
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
  readonly cabecera: string
  readonly celdas: Readonly<Record<ClaveDeCifra, Celda>>
} = {
  /** DOCE — [decidido]: el mínimo divisible por 2, 3 y 4 a la vez, así que un
   *  ancho puede ser media grilla (6), un tercio (4) o un cuarto (3) sin caer
   *  en una fracción rara. Con 10 los tercios no existen; con 16 los anchos
   *  chicos quedan abajo de la línea de texto más corta. */
  columnas: 12,
  /** El titular y la bajada ocupan poco más de media grilla: es lo que le pone
   *  medida de lectura a la bajada sin inventar un `max-width` en píxeles. */
  cabecera: 'tablet:col-start-1 tablet:col-span-7 tablet:row-start-1',
  celdas: {
    /** La que manda: nivel más grande, al margen y sola en su mitad. */
    proyectos: {
      nivel: 'titulo-xl',
      celda: 'tablet:col-start-1 tablet:col-span-5 tablet:row-start-2',
      desplome: '',
    },
    /** Comparte fila con la anterior y se desploma: rompe la alineación Y le
     *  da su propio ancla, que si no sería el mismo. */
    clientes: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-8 tablet:col-span-4 tablet:row-start-2',
      desplome: 'tablet:mt-20',
    },
    /** La más chica, sangrada dos columnas: el hueco de la izquierda es lo
     *  que impide que la fila se lea como una fila. */
    anios: {
      nivel: 'titulo-s',
      celda: 'tablet:col-start-3 tablet:col-span-3 tablet:row-start-3',
      desplome: 'tablet:mt-12',
    },
    /** El contrapeso de la grande: segundo nivel, a la derecha y sin desplome. */
    respuesta: {
      nivel: 'titulo-l',
      celda: 'tablet:col-start-7 tablet:col-span-6 tablet:row-start-3',
      desplome: '',
    },
    /** Cierra abajo a la izquierda, con el desplome más chico. */
    procesos: {
      nivel: 'titulo-m',
      celda: 'tablet:col-start-2 tablet:col-span-4 tablet:row-start-4',
      desplome: 'tablet:mt-8',
    },
  },
}

/**
 * La grilla de la composición: doce columnas desde 768, UNA abajo. Las canaletas
 * son los MISMOS tokens del canal `conmutado` de `Grilla` —12px abajo de 1025,
 * 16px arriba—: una composición que inventa su canaleta se ve de otro sistema.
 * Lo único propio es la separación vertical, que no es canaleta sino ritmo.
 */
const CLASES_DE_LA_COMPOSICION = cn(
  'grid w-full grid-cols-1 items-start gap-y-8 tablet:grid-cols-12',
  'gap-x-[var(--grilla-canal-compacto)] escritorio:gap-x-[var(--grilla-canal-amplio)]',
)

export function Numeros({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        <div
          data-pantalla="numeros"
          className="flex min-h-svh w-full flex-col justify-center py-12"
        >
          <Grilla columnas="lateral">
            <NumeroDeSeccion seccion={seccion} />
            <div className="flex flex-col gap-8">
              {/* El rótulo sale de la tabla del recorrido y no del contenido:
                  escribir `Números` también en `contenido.ts` sería una segunda
                  fuente que se desincroniza en el primer cambio. */}
              <EtiquetaDeSeccion>{seccion.nombre}</EtiquetaDeSeccion>

              <div data-composicion="dispersa" className={CLASES_DE_LA_COMPOSICION}>
                {/* La cabecera es un bloque más de la composición: así el
                    titular arranca en la columna 1 y la bajada hereda su medida
                    de lectura sin un `max-width` que no salga de un token. */}
                <Bloque patron="P2" className={GEOMETRIA.cabecera}>
                  {(progreso) => (
                    <CanalDeUnaPieza
                      progreso={progreso}
                      patron="P2"
                      className="flex flex-col gap-4"
                    >
                      <Titular nivel="titulo-l" como="h2">
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
            </div>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}

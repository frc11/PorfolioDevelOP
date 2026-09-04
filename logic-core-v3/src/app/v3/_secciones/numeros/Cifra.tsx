'use client'

import { cn } from '@/lib/utils'

import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { Bloque } from '../_contrato/coreografia'

import type { ClaveDeCifra } from './contenido'

/**
 * UNA CIFRA — el hueco y su rótulo, en UN solo párrafo: `[CIFRA]` sola no dice
 * qué dato falta y el rótulo solo no dice que falta; juntos son la pregunta
 * contestable, que es todo el pedido.
 *
 * El borde punteado es el mismo lenguaje que `MarcoDeMedio` usa para el hueco
 * de una foto —en este lane un pedido se ve igual en toda la pantalla— y va
 * sobre el marcador y no sobre el par, para que el rótulo se lea como texto y no
 * como parte del agujero. Y ese rótulo va en `text-tinta-media`, NO atenuado con
 * `opacity-casi`: es la mitad accionable del pedido —la que dice QUÉ dato
 * falta— y atenuar justo eso sería esconder lo único que Franco tiene que leer.
 *
 * ── EL RODEO DE `cn()` SE SACÓ EN SITIO-S7, PORQUE SE ARREGLÓ LA RAÍZ ─────
 *
 * Había acá un `<span className="text-tinta-media">` envolviendo al `<Micro>`,
 * y no era estilo: era un rodeo. `cn()` no podía distinguir un `text-<tamaño>`
 * de un `text-<color>` —se escriben igual— y descartaba el primero:
 *
 *     cn('text-fluido-micro', 'text-tinta-media')  →  'text-tinta-media'
 *
 * La primera versión de esta pieza lo pisaba: los cinco rótulos salían **sin
 * una sola clase de tamaño**, o sea a tamaño heredado en vez de a los 10 px de
 * `micro` — justo la asimetría de escala que esta sección existe para mostrar.
 * El rodeo era poner el color afuera, para que se heredara.
 *
 * SITIO-S7 agregó los tokens de /v3 a la lista de `src/lib/utils.ts`, que es
 * donde el defecto vivía y donde el propio archivo ya lo advertía por escrito
 * para el sistema viejo. Con la raíz arreglada el rodeo sobra, y dejarlo sería
 * código muerto que esconde el arreglo.
 *
 * Lo que NO cambió es quién lo vigila: `s5-compacto.invariant.tsx` §5 sigue
 * exigiéndole a cada elemento con `data-nivel` que conserve su clase de tamaño,
 * sobre el marcado renderizado. Afirmaba el resultado, no el rodeo — por eso
 * sigue valiendo.
 */
export function Cifra({
  clave,
  nivel,
  valor,
  rotulo,
}: {
  readonly clave: ClaveDeCifra
  readonly nivel: NivelDeTitular
  readonly valor: string
  readonly rotulo: string
}): React.JSX.Element {
  return (
    <p data-cifra={clave} className="flex flex-col gap-2">
      <Titular
        nivel={nivel}
        como="span"
        className="border-borde-fuerte self-start border border-dashed px-3 py-1"
      >
        {valor}
      </Titular>
      <Micro como="span" className="text-tinta-media uppercase">
        {rotulo}
      </Micro>
    </p>
  )
}

/**
 * DÓNDE CAE UNA CIFRA — el tamaño y la celda, sin el contenido.
 *
 * ⚠ Las clases son CADENAS LITERALES y no una clase armada por interpolación:
 * Tailwind escanea el código fuente, una clase construida no la ve nadie, la
 * regla no se emite nunca y la cifra queda en la columna 1 sin un error en
 * consola. El instrumento lee los números DEL MARCADO —parseados de la clase
 * renderizada— así que la comprobación no se desincroniza de lo que se ve.
 *
 * El tipo vive acá y no en `Numeros.tsx` por la misma razón por la que el nivel
 * entra por prop: `GEOMETRIA` es de allá, esta pieza es de acá, y la dependencia
 * va en un solo sentido. Que el tipo esté del lado del consumidor es lo que
 * permite que la tabla de allá se escriba contra él sin cerrar un ciclo.
 */
export interface Celda {
  /** El tamaño. De los cuatro niveles de display; no hay un quinto. */
  readonly nivel: NivelDeTitular
  /** Columna de arranque, ancho y fila DE SU PANTALLA, desde 768. Literales. */
  readonly celda: string
  /**
   * El desplome dentro de la fila. **Vacío en las cinco desde B2**, y no es una
   * simplificación: existía para romper la alineación de dos cifras que
   * compartían fila —80 px de la escala de espaciado, `tablet:mt-20`— y ya no
   * hay ninguna que la comparta. El porqué está en `Numeros.tsx`.
   */
  readonly desplome: string
}

/**
 * UNA CIFRA COLGADA DE SU PROPIO BLOQUE — de acá sale el escalonado real.
 *
 * P2 tiene **un solo target por instancia**, así que su `escalonado` declarado
 * (0,1 s) queda inerte: el cronograma lo aplica sobre `cantidad − 1 = 0`. Un
 * bloque con las cinco cifras adentro las entraría a las cinco juntas. Con un
 * bloque POR CIFRA, el ancla de P2 —`top bottom → bottom bottom`— se resuelve
 * contra la caja de ESE bloque, así que cada cifra aterriza cuando su propio
 * borde inferior toca el pie del viewport: cajas a distinta altura, aterrizajes
 * a distinto scroll. El escalonado es geométrico y no del cronograma.
 *
 * ⚠ El bloque lleva la CELDA y no un envoltorio con la celda adentro: el
 * elemento que la grilla posiciona tiene que ser el hijo directo de la grilla, y
 * el `Bloque` es justo ese hijo. Un `div` intermedio con la celda dejaría al
 * bloque sin posición y a la cifra en la columna 1.
 */
export function CifraDeLaComposicion({
  clave,
  valor,
  rotulo,
  celda,
}: {
  readonly clave: ClaveDeCifra
  readonly valor: string
  readonly rotulo: string
  readonly celda: Celda
}): React.JSX.Element {
  return (
    <Bloque patron="P2" className={cn(celda.celda, celda.desplome)}>
      {(progreso) => (
        <CanalDeUnaPieza progreso={progreso} patron="P2">
          <Cifra clave={clave} nivel={celda.nivel} valor={valor} rotulo={rotulo} />
        </CanalDeUnaPieza>
      )}
    </Bloque>
  )
}

'use client'

import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'

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
 * ── ⚠ EL COLOR VA EN UN ENVOLTORIO Y NO EN EL `className` del `Micro` ──────
 *
 * Por un defecto HEREDADO de `tailwind-merge`, verificado en runtime y rodeado
 * acá, no arreglado (`src/lib/utils.ts` está fuera de este lane):
 *
 *     cn('text-fluido-micro', 'text-tinta-media')  →  'text-tinta-media'
 *
 * No puede distinguir un `text-<tamaño>` de un `text-<color>` —se escriben
 * igual— y sin una lista que se lo diga los mete en el mismo grupo y descarta
 * el primero. Esa lista existe para los tokens del sistema viejo
 * (`DS_FONT_SIZE_CLASSES`) y **no** para los de /v3.
 *
 * La primera versión de esta pieza lo pisaba: los cinco rótulos salían **sin
 * una sola clase de tamaño**, o sea a tamaño heredado en vez de a los 10 px de
 * `micro` — justo la asimetría de escala que esta sección existe para mostrar.
 * El rodeo: el color va afuera y se HEREDA; el `Micro` se queda con su tamaño.
 * Lo vigila `s5-compacto.invariant.tsx` §5, sobre el marcado renderizado.
 *
 * ── Por qué el NIVEL entra por prop y no se lee de `GEOMETRIA` ─────────────
 *
 * Porque `GEOMETRIA` vive en `Numeros.tsx`, que es quien importa esta pieza:
 * leerla desde acá cerraría un ciclo de VALORES entre los dos módulos. Con el
 * nivel como prop la dependencia va en un solo sentido y esta pieza no sabe
 * nada de la composición — que es lo correcto: no es asunto suyo dónde cae.
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
      <span className="text-tinta-media">
        <Micro como="span" className="uppercase">
          {rotulo}
        </Micro>
      </span>
    </p>
  )
}

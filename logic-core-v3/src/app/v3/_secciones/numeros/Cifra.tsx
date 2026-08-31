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
      <Micro como="span" className="text-tinta-media uppercase">
        {rotulo}
      </Micro>
    </p>
  )
}

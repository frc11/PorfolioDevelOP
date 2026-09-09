'use client'

import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MarcoDeMedio } from '../_contrato/medios'

import { CONTENIDO } from './contenido'

type ProyectoDeContenido = (typeof CONTENIDO.proyectos)[number]

/**
 * ⚠ LA GEOMETRÍA ENTRA POR PROP Y NO SE LEE DE `Trabajos.tsx`.
 *
 * `GEOMETRIA` y `SIZES_DE_LA_CAPTURA` viven allá, que es quien importa esta
 * pieza: leerlas desde acá cerraría un ciclo de VALORES entre los dos módulos.
 * Con la caja como prop la dependencia va en un solo sentido, y esta tarjeta
 * deja de saber en qué composición cae — que es lo correcto: no es asunto suyo.
 */
export interface CajaDeLaCaptura {
  readonly ancho: number
  readonly alto: number
  readonly sizes: string
}

/**
 * UN PROYECTO — el nombre con la métrica pegada, y la captura debajo.
 *
 * Una sola definición para las dos ramas. Lo único que cambia entre la rama
 * coreografiada y la quieta es DÓNDE se pone esta tarjeta —apilada con las otras
 * dos, o en su columna—, nunca qué dice.
 *
 * La métrica va en la misma línea de base que el nombre y con el rótulo que
 * explica qué se está pidiendo. `flex-wrap` para que en una columna angosta baje
 * de renglón en vez de desbordar: baja, pero sigue pegada.
 *
 * ── ⚠️ B11 · EL RENGLÓN DEL NOMBRE VA ARRIBA DE LA CAPTURA, y está medido ────
 *
 * Iba debajo. En la noche de Trabajos el piso más cercano a la cámara queda
 * iluminado en una franja al pie del cuadro —el 8–10 % inferior, medido con
 * `scripts-b11/a-logo.ts` sobre el pin entero—, y con la tarjeta centrada en el
 * escenario el renglón caía adentro de esa franja **sólo a 1920**: y 989–1000 de
 * 1080 (a 1440, 803–813 de 900, y a 2560, 1181–1192 de 1440, quedan arriba).
 * Ahí «Lo que cambió», «[MÉTRICA]» y los nombres daban **2,04–3,82:1 con el 85,7–100 %
 * de su caja bajo AA** («Banú» 449 de 455 px; `bloques-antes-1920.json`), sin una
 * partícula de por medio: tinta clara sobre piso claro. Con el renglón arriba, la tarjeta no
 * cambia de alto —la captura baja lo que el renglón sube— y el nombre queda
 * contra la pared oscura en los tres anchos. Es un cambio de orden, no de
 * contenido: el nombre sigue siendo el `h3` y el enlace, la métrica sigue
 * pegada a él y afuera del enlace, y el marcador `[CAPTURA]` sigue donde estaba.
 */
export function Proyecto({
  proyecto,
  rotulo,
  caja,
}: {
  readonly proyecto: ProyectoDeContenido
  readonly rotulo: string
  readonly caja: CajaDeLaCaptura
}): React.JSX.Element {
  return (
    <article data-proyecto={proyecto.nombre} className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-3">
        {/* EL NOMBRE ES EL ENLACE, y no la tarjeta entera: envolver todo dejaría
            al `[MÉTRICA]` adentro del nombre accesible del enlace —"Esquina Lo
            que cambió MÉTRICA"— que es exactamente lo que un lector de pantalla
            no tiene que anunciar. Con el enlace en el `h3`, el nombre accesible
            es el nombre del cliente y nada más.

            Sin variante `hover:`: el énfasis de puntero y el de teclado son la
            misma decisión y esta sección no tiene hoja propia donde escribirlos
            juntos. El anillo de foco lo pone el tema para todo `[data-v3]`, así
            que la parada de tabulación SÍ se ve. Queda anotado como pedido de
            composición, no resuelto acá. */}
        <Titular nivel="titulo-s" como="h3">
          <a href={proyecto.enlace} data-pieza="enlace-de-proyecto">
            {proyecto.nombre}
          </a>
        </Titular>
        {/* El hueco de la métrica: rótulo + marcador, pegados al nombre y
            SIEMPRE visibles. Nada de `hidden`, `opacity-0` ni `sr-only` acá ni
            en ningún ancestro — el invariante recorre la cadena y lo afirma. */}
        <p className="flex flex-wrap items-baseline gap-2">
          {/* B6-A: a tinta PLENA. Con la sala detrás del velo el rótulo a
              `opacity-casi` daba 2,71:1 en su peor píxel y 5,36:1 pleno
              (docs/rediseno/outputs/b6/c-las-seis-abierto.json). */}
          <Micro como="span" className="uppercase">
            {rotulo}
          </Micro>
          {/* ⚠ EL COLOR VA EN EL ENVOLTORIO Y NO EN EL `className` DEL `Micro`, y
              es el mismo defecto heredado que el brief ya señala para `peso`:
              `tailwind-merge` mete `text-tinta` y `text-fluido-micro` en el MISMO
              grupo —no reconoce `fluido-micro` como un tamaño— y se queda con la
              última. Verificado con `cn` en este repo: pasarle las dos al `Micro`
              devuelve la pastilla SIN su tamaño, o sea la métrica en cuerpo de
              texto. Con el color afuera, el `Micro` conserva su escala y la
              pastilla hereda el papel. No se arregla el defecto: se evita. */}
          <span className="bg-acento text-tinta px-2 py-1">
            <Micro como="span" className="font-codigo uppercase">
              {proyecto.metrica}
            </Micro>
          </span>
        </p>
      </div>
      {/* ⚠ `marcador` va literal y HOY NO SE RENDERIZA: `MarcoDeMedio` lo usa
          sólo en su rama sin archivo, y las tres capturas ya existen. Se deja
          escrito porque es la identidad del hueco: el día que una `fuente`
          vuelva a `null` —un cliente que pide bajar su captura— la caja se
          convierte sola en el pedido, con su relación de aspecto y su `sizes`
          intactos. Sacarlo obligaría a reconstruir esa rama a mano. */}
      <MarcoDeMedio
        marcador="[CAPTURA]"
        fuente={proyecto.captura.fuente}
        alt={proyecto.captura.alt}
        ancho={caja.ancho}
        alto={caja.alto}
        sizes={caja.sizes}
      />
    </article>
  )
}

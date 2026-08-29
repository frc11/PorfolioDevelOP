import { Imagen } from '../../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { sizesPorColumnas, sizesPorTresTramos, sizesPorViewport } from '../../_lib/imagen'

import { Estado, Ficha } from './Ficha'

/**
 * EL PIPELINE DE IMAGEN — la pieza, no las fotos.
 *
 * ── Qué se está mostrando ─────────────────────────────────────────────────
 *
 * Un `srcset` con descriptores de ANCHO y un `sizes` real. Se puede
 * comprobar en el inspector: el atributo `srcset` termina en `640w 750w 828w
 * …`, no en `1x 2x`. La referencia emite lo segundo, con `sizes` en `null`,
 * en las 134 imágenes del sitio — y con densidad el navegador no mira el ancho
 * de la caja: de 768 a 1920 baja exactamente lo mismo.
 *
 * ── La imagen es un archivo que ya estaba en el repo ──────────────────────
 *
 * `logodevelOP.png`, 1024×1024. No es contenido del sitio nuevo: es lo primero
 * que había a mano para que el atributo se pueda leer de verdad. Cuando haya
 * fotos, se cambia el `src` y nada más.
 *
 * ── Los `sizes` no están escritos a mano ──────────────────────────────────
 *
 * Salen de los tres helpers de `_lib/imagen.ts`, que componen la condición
 * desde el breakpoint del sistema. El 1025 aparece una sola vez en el repo.
 */
export function GaleriaMedios() {
  const unTercio = sizesPorColumnas(1, 3)
  const mitad = sizesPorViewport(50)
  const tresTramos = sizesPorTresTramos(33, 50)

  return (
    <Ficha
      titulo="Imagen · descriptores de ancho y sizes obligatorio"
      nota="`sizes` es obligatorio en el tipo, se valida en construcción y hay un instrumento que rechaza cualquier uso sin él. Las tres capas atrapan cosas distintas."
    >
      <Estado rotulo={`sizes armado con sizesPorColumnas(1, 3) → ${unTercio}`}>
        <div className="max-w-[var(--breakpoint-medio)]">
          <Imagen
            src="/logodevelOP.png"
            alt=""
            ancho={1024}
            alto={1024}
            sizes={unTercio}
            className="max-w-[var(--spacing-20)]"
          />
        </div>
      </Estado>

      <Estado rotulo="los otros dos helpers, en texto">
        <div className="flex flex-col gap-[var(--spacing-1)]">
          <Caption className="font-codigo">{`sizesPorViewport(50) → ${mitad}`}</Caption>
          <Caption className="font-codigo">{`sizesPorTresTramos(33, 50) → ${tresTramos}`}</Caption>
        </div>
      </Estado>

      <Cuerpo className="opacity-casi">
        La escalera de candidatos no se declara acá: la emite el optimizador de Next desde
        `images.deviceSizes`, que este repo no sobreescribe. Declarar una propia sería una constante
        que nadie consume y que haría creer que sí.
      </Cuerpo>
    </Ficha>
  )
}

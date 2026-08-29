import type { Metadata } from 'next'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Escala } from '../_bloques/Escala'
import { Multiplicadores } from '../_bloques/Multiplicadores'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA junto con `/v3/tipografia`, que es lo único que la carga.       │
 * │ Baja: el día que /v3 reemplace al home, y a más tardar el 2026-12-31.    │
 * │ No forma parte del sitio: `robots: noindex, nofollow`.                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe una ruta aparte ───────────────────────────────────────
 *
 * Porque los seis niveles fluidos usan `clamp()` con `vw`, y `vw` se resuelve
 * contra el **viewport**, no contra el contenedor. Tres columnas de 375, 860 y
 * 1440px en una misma página mostrarían el MISMO tamaño en las tres: no
 * demostrarían nada.
 *
 * Un `<iframe>` sí tiene viewport propio. `/v3/tipografia` monta esta ruta
 * tres veces, a tres anchos, y ahí los `clamp()` resuelven de verdad. Es la
 * única forma de ver la banda fluida entera en una sola captura sin escalar
 * nada — y escalar sería justamente lo que arruinaría el juicio óptico.
 *
 * ── El panel opaco ────────────────────────────────────────────────────────
 *
 * El layout de /v3 monta el escenario de prueba `fixed inset-0`. Adentro del
 * iframe eso pintaría dos bandas grises detrás del texto. Este panel es
 * `papel-opaco` —`bg-fondo`, `z-10`— que es el mismo recurso que usan los
 * paneles del esqueleto, no un parche.
 */
export const metadata: Metadata = {
  title: 'v3 · muestra tipográfica — instrumento interno',
  description: 'Los ocho niveles con texto real. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaMuestraTipografica() {
  return (
    <div className="bg-fondo text-tinta relative z-10 min-h-svh py-[var(--spacing-8)]">
      <Envoltorio>
        <div className="flex flex-col gap-[var(--spacing-12)]">
          <Escala />
          <Multiplicadores />
        </div>
      </Envoltorio>
    </div>
  )
}

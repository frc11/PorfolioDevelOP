'use client'

import { useRef, type CSSProperties } from 'react'

import { AvisoDeScroll } from '../avisos/AvisoDeScroll'
import { Reluciente } from '../efectos/Reluciente'
import { useBloqueDelFaq } from './BloqueDelFaq'

/** El texto del botón (`05-TEXTOS.md`). */
export const TEXTO_DEL_BOTON_DEL_FAQ = 'Scrolleá una vez más para ver las preguntas frecuentes'

/**
 * [C2-71] EL BOTÓN DEL FAQ (ítem 22) — avisa que después del pie hay preguntas frecuentes. Es una placa de la escena como el botón de
 * «Escribinos por WhatsApp» (la pastilla negra en el piso: `escena/pie3d/faqDeVolumen.ts`, abajo del logo) que sale con la apertura del
 * piso DESPUÉS de que el pie se acostó entero; adentro, la presentación de `AvisoDeScroll` (el texto y los dos chevrones, titilando) y el
 * reflejo de `Reluciente` para que se note que se toca. Tocarlo es el gesto de scroll que trae el FAQ (`alTocar`); con el FAQ se hunde
 * con el pie y no vuelve en esta carga (`BOTON_EN_VIVO`, en memoria). Mientras no está arriba, la escena lo deja inerte (ni el puntero ni
 * el teclado lo encuentran). Va fuera de la raíz del FAQ: enfocarlo no trae el FAQ (enfocar una pregunta sí).
 */
export function BotonDelFaq({ alTocar }: { readonly alTocar: () => void }): React.JSX.Element {
  const placa = useRef<HTMLDivElement | null>(null)
  useBloqueDelFaq(placa, 'boton', true)
  // En la pantalla del pie y recortado a ella (como el FAQ): su DOM, llevado sobre la placa, no le suma desborde al documento.
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-svh overflow-clip">
      <div className="absolute inset-x-0 bottom-[var(--spacing-10)] flex justify-center">
        <div ref={placa} data-bloque-del-faq="boton" data-seccion="invertida" style={OCULTO} inert className="pointer-events-auto relative overflow-hidden rounded-[var(--radius-pastilla-s)] px-[var(--spacing-4)] py-[var(--spacing-2)]">
          <AvisoDeScroll texto={TEXTO_DEL_BOTON_DEL_FAQ} alTocar={alTocar} className="max-w-[calc(var(--spacing-20)*3.5)] text-balance" />
          <Reluciente />
        </div>
      </div>
    </div>
  )
}

/** Apagado hasta que la escena lo enciende con su placa arriba. */
const OCULTO: CSSProperties = { opacity: 0 }

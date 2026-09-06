'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { useHayTrabajoSinRegistrar } from '@/lib/use-unsaved-guard'

/**
 * P23 — «VOLVER A TU DÍA», con aviso cuando queda trabajo sin registrar.
 *
 * El defecto que cierra: en la ficha el setter carga los tres campos del
 * veredicto, toca «Volver a tu día» y los pierde enteros. Era un `<Link>` pelado
 * — navegación SPA, que no dispara `beforeunload`—, así que la única guardia que
 * había (`useUnsavedGuard`) no corría, y el veredicto no tiene autosave detrás
 * que lo salve (A-24, a propósito: un borrador no es un veredicto).
 *
 * Qué hace: si el formulario de la pantalla declaró trabajo sin registrar
 * (`avisaEnSalidaInterna`), pregunta antes de irse y nombra lo que se pierde. Si
 * no hay nada cargado, sale derecho — el diálogo aparece SÓLO cuando hay algo
 * que perder, que es la única forma de que no se vuelva ruido que se aprende a
 * ignorar.
 *
 * Es client-only y vive aparte de `ManualHeader` (server) porque tiene que leer
 * estado del cliente. El destino y el texto son los mismos de antes.
 *
 * Sigue siendo un `<Link>`, no un `<button>`: convertirlo en botón le sacaba el
 * `href` —y con él el click del medio, el «abrir en pestaña nueva» y el anuncio
 * como enlace— para ganar exactamente nada, porque `preventDefault` sobre el
 * click del ancla alcanza para preguntar antes de navegar. La navegación
 * imperativa (`router.push`) corre SÓLO cuando el setter confirma que quiere
 * perder lo cargado; el camino normal lo sigue haciendo el ancla.
 *
 * Está medido: como botón, `getByRole('link', …)` de 00-surfaces dejaba de
 * encontrarlo y `getByRole('button', { name: 'Volver' })` de 13-m16 —que matchea
 * por SUBCADENA— empezaba a agarrar este control en vez del suyo.
 */
export function SalidaDelManual() {
  const router = useRouter()
  const hayTrabajoSinRegistrar = useHayTrabajoSinRegistrar()
  const [preguntando, setPreguntando] = useState(false)

  const salir = () => {
    setPreguntando(false)
    router.push('/setter')
  }

  return (
    <>
      <Link
        href="/setter"
        onClick={(evento) => {
          if (!hayTrabajoSinRegistrar) return
          evento.preventDefault()
          setPreguntando(true)
        }}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft size={13} strokeWidth={1.5} aria-hidden />
        Volver a tu día
      </Link>

      <Modal
        open={preguntando}
        onClose={() => setPreguntando(false)}
        title="Tenés algo cargado sin registrar"
        description="Si salís ahora se pierde: esta pantalla no guarda borrador. Registralo primero y después volvés a tu día."
        surface="glass"
        size="sm"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setPreguntando(false)}>
              Seguir acá
            </Button>
            <Button variant="danger" onClick={salir}>
              Salir y perderlo
            </Button>
          </div>
        }
      >
        {/* Nombra los controles, no dice dónde están: una referencia de posición
            («el botón de abajo») queda mal apenas otro sprint mueva el layout —
            que es exactamente el defecto que este mismo sprint corrige. */}
        <p className="text-xs leading-relaxed text-zinc-400">
          Lo que escribiste en esta pantalla todavía no entró. Con «Seguir acá» volvés
          a la pantalla para registrarlo.
        </p>
      </Modal>
    </>
  )
}

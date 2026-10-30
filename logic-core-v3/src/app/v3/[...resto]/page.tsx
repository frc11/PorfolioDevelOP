import { notFound } from 'next/navigation'

/** [L7d · 2] Cualquier `/v3/...` que no es una página: la 404 de `/v3` (`../not-found.tsx`), con estado 404. */
export default function RutaDesconocida(): never {
  notFound()
}

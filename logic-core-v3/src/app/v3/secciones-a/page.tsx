import type { Metadata } from 'next'

import { Navegacion } from '../_componentes/chrome/Navegacion'

import { REGISTRO } from './_contrato/registro'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. ESTA RUTA ES DEUDA CON **FECHA DE BAJA**.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA el día que `/v3/page.tsx` componga el home completo con las      │
 * │ ocho secciones, y a más tardar el **2026-12-31**.                        │
 * │ Al borrarla NO se borra nada más: las cuatro secciones y el contrato son │
 * │ el sitio, no el instrumento. Lo único propio de esta ruta es este archivo│
 * │ y su entrada en `s4-rutas-de-demo.ts`.                                   │
 * │ `robots: noindex, nofollow, nocache`. No forma parte del sitio público.  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe, y por qué no es `/v3` ────────────────────────────────
 *
 * Porque las secciones 5 a 8 se construyen **en paralelo, en otro worktree**, y
 * `/v3/page.tsx` es el archivo donde los dos lanes se cruzarían. Tocarlo desde
 * acá sería garantizar el conflicto en el merge y, peor, dejar el home a medio
 * componer durante días. La composición del home es una integración posterior
 * de diez minutos, después de mergear los dos lanes.
 *
 * Mientras tanto ésta es la única forma de ver las cuatro **en orden y con sus
 * superficies**, que es lo que hay que juzgar: el recorrido de escena —aparece
 * en el Hero, desaparece en Quiénes somos y Números, y la banda oscura de
 * Trabajos la apaga del todo— no se puede juzgar sección por sección.
 *
 * ── Qué monta, y qué NO ───────────────────────────────────────────────────
 *
 * Monta la **pastilla de navegación**, y va primero por una razón geométrica:
 * su envoltorio es `sticky` con alto CERO y la pastilla vive `absolute` adentro,
 * a `100svh − 72px`. O sea que su posición de nacimiento la define **dónde está
 * en el documento**, y tiene que ser lo más arriba posible o nace tarde. No
 * empuja nada: mide cero.
 *
 * NO monta el pie ni el cursor propio: los dos son chrome de otro sprint y no
 * son parte de lo que este lane construyó. Componerlos es del sprint del home.
 *
 * ── El escenario ya está ──────────────────────────────────────────────────
 *
 * Lo pone `layout.tsx` de `/v3`, fijo a viewport completo y `z-0`, detrás del
 * flujo. Esta ruta no lo menciona: es permanente, no una sección. Por eso el
 * Hero, que es `papel-transparente`, lo deja ver sin hacer nada.
 */
export const metadata: Metadata = {
  title: 'v3 · secciones 1 a 4 — instrumento interno',
  description:
    'Hero, Quiénes somos, Números y Trabajos, en orden y con sus superficies. ' +
    'Contenido de relleno con marcadores a la vista. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Las cuatro salen del REGISTRO y esta página no decide nada sobre ellas: ni el
 * orden, ni el alto, ni la superficie. Los recorre. Es lo que hace que mover el
 * recorrido sea editar `secciones.ts` y el registro, y no esta pantalla.
 */
export default function PaginaSeccionesA() {
  return (
    <>
      <Navegacion />
      {REGISTRO.map(({ id, Componente, seccion }) => (
        <Componente key={id} seccion={seccion} />
      ))}
    </>
  )
}

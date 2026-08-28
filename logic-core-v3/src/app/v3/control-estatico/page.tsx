import type { Metadata } from 'next'

import EscenarioDePrueba from '../_componentes/EscenarioDePrueba'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. ESTA RUTA ES DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA cuando /v3 reemplace al home. Es un instrumento de verificación │
 * │ y no puede quedar vivo en producción más allá de eso.                    │
 * │ Al borrarla hay que borrar también la afirmación A3 de                    │
 * │ `_lib/__tests__/bundle.invariant.ts` — o mejor, reemplazarla por el       │
 * │ control equivalente con build aislado (`E2E_DIST_DIR`), que no deja ruta. │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Para qué existe ────────────────────────────────────────────────────────
 *
 * Es **el control positivo de la compuerta de 1025**.
 *
 * `/v3` afirma que el chunk del escenario NO está entre los archivos que pide
 * la carga inicial. Esa afirmación, sola, pasa en verde por dos motivos
 * distintos e indistinguibles: porque la compuerta funciona, o porque el
 * buscador está ciego —el módulo no compiló, la marca se podó, el manifiesto
 * se leyó mal, la ruta se resolvió con otro nombre—. Hoy el escenario es un
 * marcador de posición, así que la segunda hipótesis es completamente
 * plausible y no se puede descartar mirando la página.
 *
 * Esta ruta la descarta. Importa **el mismo módulo** de forma **estática**, en
 * el **mismo build**, y `bundle.invariant.ts` corre **la misma función de
 * chequeo** sobre las dos rutas:
 *
 *     /v3                   la marca NO está en la carga inicial   (la tesis)
 *     /v3/control-estatico  la marca SÍ está en la carga inicial   (el control)
 *
 * Si el control saliera limpio, el chequeo es ciego y la tesis no vale nada.
 *
 * ── Por qué el import de acá es estático de verdad ─────────────────────────
 *
 * `import EscenarioDePrueba from '…'` en un Server Component: el componente es
 * cliente (`'use client'`), así que Next lo trata como frontera de cliente y
 * su chunk entra en la carga inicial de ESTA ruta. Sin `next/dynamic`, sin
 * `ssr: false`, sin compuerta de ancho — el escenario se monta en todos los
 * anchos, que es exactamente lo que esta ruta tiene que demostrar que pasa
 * cuando alguien se olvida de la compuerta.
 */
export const metadata: Metadata = {
  title: 'v3 · control estático — instrumento interno',
  description: 'Control positivo de la compuerta de 1025. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

export default function PaginaControlEstatico() {
  return (
    <>
      <EscenarioDePrueba />
      <div className="relative z-10 flex min-h-svh items-center px-[var(--pad-lateral-compacto)]">
        <div className="max-w-tope mx-auto">
          <p className="font-codigo text-micro tracking-micro uppercase opacity-casi">
            instrumento interno
          </p>
          <h1 className="font-titulo text-titulo-m tracking-titulo leading-titulo">
            Control positivo de la compuerta
          </h1>
          <p className="font-cuerpo text-cuerpo leading-texto tracking-texto mt-[var(--spacing-4)]">
            Esta ruta importa el escenario de forma estática a propósito. Sirve para que la
            comprobación del bundle pueda fallar cuando tiene que fallar.
          </p>
        </div>
      </div>
    </>
  )
}

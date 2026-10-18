'use client'

import { useRef } from 'react'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Bloque, CoreografiaEnTodoAncho, type Progreso } from '../_contrato/coreografia'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Seccion } from '../_contrato/Seccion'

import { CapaDeLaGota } from './CapaDeLaGota'
import { CapaDeDemos } from './demos/CapaDeDemos'
import { DemosQuietos } from './demos/DemosQuietos'
import { ANCLAS_DEL_PORTFOLIO } from './portfolio/anclas'
import { EscenarioDelPortfolio } from './portfolio/EscenarioDelPortfolio'
import { CANTIDAD_DE_PASOS, PANTALLAS_POR_PASO, pantallasDelAncla, pantallasExtra } from './portfolio/pasos'
import { usePortfolio } from './portfolio/usePortfolio'

/**
 * 04 · TRABAJOS — el Portfolio: la aproximación, el selector lateral y Demos. **[B1]**
 *
 * ── Los tiempos, en el orden en que se leen (`portfolio/pasos.ts`) ─────────
 *
 * 1. **La conversión.** Un gatillo, no un tramo: el final de Quiénes somos lleva la sala a la noche (`gota.ts`).
 * 2. **La aproximación.** El panel sube y entra «Portfolio» con su bajada (el gesto de «El equipo», sin la huida de antes).
 * 3. **El selector.** Con el pin entra desde la derecha el panel con El Garage; un paso por proyecto y uno para «la próxima es
 *    la tuya» ([B1.2b] 1,5 pantallas cada uno). La escena se oscurece y la cámara pone el logo abajo, del lado del texto.
 * 4. **La salida y Demos**, la cola de antes al píxel: el panel se retrae y Demos llega como llegaba.
 *
 * El túnel (el cartel que huía, las capturas anidadas, la ventana del CTA y el vacío) se fue al archivo
 * (`src/app/v3/_archivo/tunel-portfolio/`): nadie de la página lo importa.
 *
 * ── El alto (REGLA DE ALTURAS) ────────────────────────────────────────────
 *
 * La tabla (`secciones.ts`) no cambia. La sección suma los pasos del selector sobre lo que la tabla declara, en CSS y desde el
 * servidor (`--pantallas-extra-del-portfolio`, de la constante del paso), y la escena lo descuenta (`portfolio/tramoDelSelector.ts`).
 * Afuera del selector la escena ve los mismos píxeles que antes.
 *
 * ── Las dos ramas ─────────────────────────────────────────────────────────
 *
 * El escenario es el mismo componente con y sin coreografía: su estado sale del scroll, no del progreso de P7. Lo único que
 * cambia es Demos: con coreografía llega adentro del escenario pegado (su reloj es la cola, `mostradoDeDemos`); sin ella, el
 * escenario se pega mientras dura el selector y Demos aparece después, quieto (`DemosQuietos`).
 */
export function Trabajos({ seccion }: PropsDeSeccion): React.JSX.Element {
  // MÓVIL-TRABAJOS: la única sección que corre su coreografía en todo ancho.
  return (
    <CoreografiaEnTodoAncho>
      <TrabajosEnSuRama seccion={seccion} />
    </CoreografiaEnTodoAncho>
  )
}

/**
 * El alto en todo ancho: el de la tabla más los pasos (la clase va entera, el escáner de Tailwind la ve). `--ancho-del-portfolio`
 * le dice al JS qué ancho decidió el CSS (vacío desde 1024): la sección no mide el ancho (`s7-contrato` §5). [B1.3] Y
 * `--modo-del-portfolio`, si son las historias del teléfono (abajo de 768).
 */
const CLASE_DE_LA_SECCION =
  'relative min-h-[calc(var(--alto-minimo-del-panel)+var(--pantallas-extra-del-portfolio)*100svh)] max-escritorio:[--ancho-del-portfolio:tablet] max-movil:[--ancho-del-portfolio:movil] max-tablet:[--modo-del-portfolio:historias]'

const ESTILO_DE_LA_SECCION = {
  '--pantallas-extra-del-portfolio': pantallasExtra(PANTALLAS_POR_PASO).toFixed(5),
  '--pantallas-de-la-pista': (1 + CANTIDAD_DE_PASOS * PANTALLAS_POR_PASO).toFixed(5),
} as React.CSSProperties

function TrabajosEnSuRama({ seccion }: PropsDeSeccion): React.JSX.Element {
  const caja = useRef<HTMLDivElement | null>(null)
  const vivo = usePortfolio(caja)
  return (
    <Seccion seccion={seccion} className={CLASE_DE_LA_SECCION} style={ESTILO_DE_LA_SECCION}>
      <div ref={caja} data-pieza="caja-del-portfolio" className="absolute inset-0">
        {ANCLAS_DEL_PORTFOLIO.map((a) => (
          <span key={a.id} id={a.id} aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(4)}svh` }} />
        ))}
        <Bloque patron="P7" anclaje="seccion" lente="escena" className="absolute inset-0">
          {(progreso: Progreso) =>
            progreso === null ? (
              <div className="flex h-full flex-col">
                <div className="relative h-[calc(var(--pantallas-de-la-pista)*100svh)] shrink-0">
                  <EscenarioDelPortfolio seccion={seccion} vivo={vivo} />
                </div>
                <Envoltorio className="flex-1" claseDeContenido="flex h-full flex-col justify-end">
                  <DemosQuietos />
                </Envoltorio>
              </div>
            ) : (
              <EscenarioDelPortfolio seccion={seccion} vivo={vivo}>
                {/* Demos va DESPUÉS del panel porque se lee después, y se pinta debajo por su `z-index` negativo. */}
                <CapaDeDemos mostrado={vivo.mostradoDeDemos} className="absolute inset-0 -z-[var(--z-elevado)]" />
              </EscenarioDelPortfolio>
            )
          }
        </Bloque>
      </div>

      {/* Hermano del bloque, no descendiente: vale en las dos ramas. */}
      <CapaDeLaGota className="bg-fondo pointer-events-none fixed inset-0 z-50" />
    </Seccion>
  )
}

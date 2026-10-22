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
import { FlujoDelPortfolio } from './portfolio/FlujoDelPortfolio'
import { PANTALLAS_DESPUES_DEL_FLUJO, PANTALLAS_EXTRA_CON_EL_CARRUSEL } from './portfolio/medioDelCarrusel'
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
 *
 * ── [B1.2e] Debajo de 1024: el carrusel ───────────────────────────────────
 *
 * El CSS decide el carrusel (`--modo-del-portfolio: carrusel`) y el cliente lo lee: la sección deja de ser un pin de pasos y pasa a ser un
 * FLUJO que se scrollea (`FlujoDelPortfolio`: el título, el carrusel y «la tuya»), hermano de la caja, seguido por lo que la cola necesita
 * (`PANTALLAS_DESPUES_DEL_FLUJO`). El escenario pegado queda sólo para Demos. El alto sale del contenido (la variable de los pasos va en
 * cero: el flujo en su mínimo y la cola suman la tabla) y la escena lo descuenta con el flujo medido (`medioDelCarrusel.ts`).
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
 * `--modo-del-portfolio`: [B1.2e] el carrusel, debajo de 1024 (de 1023 a 768 inclusive y más abajo).
 */
const CLASE_DE_LA_SECCION =
  'relative min-h-[calc(var(--alto-minimo-del-panel)+var(--pantallas-extra-del-portfolio)*100svh)] max-escritorio:[--ancho-del-portfolio:tablet] max-movil:[--ancho-del-portfolio:movil] max-escritorio:[--modo-del-portfolio:carrusel]'

const ESTILO_DE_LA_SECCION = {
  '--pantallas-extra-del-portfolio': pantallasExtra(PANTALLAS_POR_PASO).toFixed(5),
  '--pantallas-de-la-pista': (1 + CANTIDAD_DE_PASOS * PANTALLAS_POR_PASO).toFixed(5),
} as React.CSSProperties

/** [B1.2e] Con el carrusel: la sección mide su contenido (el flujo y lo que sigue), no los pasos; la pista de la rama quieta no se usa. */
const ESTILO_CON_EL_CARRUSEL = {
  '--pantallas-extra-del-portfolio': PANTALLAS_EXTRA_CON_EL_CARRUSEL.toFixed(5),
} as React.CSSProperties
const ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO: React.CSSProperties = { height: `${(PANTALLAS_DESPUES_DEL_FLUJO * 100).toFixed(4)}svh` }

function TrabajosEnSuRama({ seccion }: PropsDeSeccion): React.JSX.Element {
  const caja = useRef<HTMLDivElement | null>(null)
  const vivo = usePortfolio(caja)
  return (
    <Seccion seccion={seccion} className={CLASE_DE_LA_SECCION} style={vivo.carrusel ? ESTILO_CON_EL_CARRUSEL : ESTILO_DE_LA_SECCION}>
      <div ref={caja} data-pieza="caja-del-portfolio" className="absolute inset-0">
        {/* [B1.2e] Con el carrusel las anclas van en el flujo (sus pantallas). */}
        {vivo.carrusel ? null : ANCLAS_DEL_PORTFOLIO.map((a) => (
          <span key={a.id} id={a.id} aria-hidden="true" className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `${(pantallasDelAncla(a.paso, PANTALLAS_POR_PASO) * 100).toFixed(4)}svh` }} />
        ))}
        <Bloque patron="P7" anclaje="seccion" lente="escena" className="absolute inset-0">
          {(progreso: Progreso) =>
            progreso === null ? (
              vivo.carrusel ? (
                // [B1.2e] Sin coreografía, con el carrusel: Demos quieto al final, en lo que sigue al flujo (el flujo va arriba, encima).
                <div className="flex h-full flex-col">
                  <div className="flex-1" />
                  <Envoltorio className="shrink-0" style={ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO} claseDeContenido="flex h-full flex-col justify-end">
                    <DemosQuietos />
                  </Envoltorio>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="relative h-[calc(var(--pantallas-de-la-pista)*100svh)] shrink-0">
                    <EscenarioDelPortfolio seccion={seccion} vivo={vivo} />
                  </div>
                  <Envoltorio className="flex-1" claseDeContenido="flex h-full flex-col justify-end">
                    <DemosQuietos />
                  </Envoltorio>
                </div>
              )
            ) : (
              <EscenarioDelPortfolio seccion={seccion} vivo={vivo}>
                {/* Demos va DESPUÉS del panel porque se lee después, y se pinta debajo por su `z-index` negativo. */}
                <CapaDeDemos mostrado={vivo.mostradoDeDemos} salidaDeLaCola={vivo.salidaDeLaCola} className="absolute inset-0 -z-[var(--z-elevado)]" />
              </EscenarioDelPortfolio>
            )
          }
        </Bloque>
      </div>

      {/* [B1.2e] El flujo del carrusel y lo que lo sigue (la cola: Demos, pegado en la caja). */}
      {vivo.carrusel ? <FlujoDelPortfolio seccion={seccion} vivo={vivo} /> : null}
      {vivo.carrusel ? <div aria-hidden="true" data-pieza="despues-del-flujo" style={ESTILO_DE_LO_QUE_SIGUE_AL_FLUJO} /> : null}

      {/* Hermano del bloque, no descendiente: vale en las dos ramas. */}
      <CapaDeLaGota className="bg-fondo pointer-events-none fixed inset-0 z-50" />
    </Seccion>
  )
}

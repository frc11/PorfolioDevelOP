'use client'

import { CLASES_FUERA_DE_FLUJO } from '../_lib/compuerta'
import { MARCA_ESCENARIO } from '../_lib/marcaEscenario'
import { COLORES_DEL_CANVAS_DE_PRUEBA } from '../_lib/superficies'

/**
 * EL CANVAS DE PRUEBA — un marcador de posición, NO la escena.
 *
 * ⚠ La escena 3D real existe, tiene catorce sprints y vive en otro worktree.
 * Acá se construye el HUECO donde va a entrar, y se demuestra que funciona.
 * Este archivo no la importa, no la busca y no la referencia.
 *
 * ── Por qué alcanza sin ser la escena ──────────────────────────────────────
 *
 * Lo que hay que demostrar en este sprint son tres propiedades del hueco, y
 * ninguna de las tres depende de WebGL:
 *
 *   1. Es PERMANENTE y no scrollea — `fixed inset-0`, y los paneles se
 *      deslizan encima. Ése es el hallazgo estructural entero.
 *   2. Se VE a través de los paneles `papel-transparente` y no se ve a través
 *      de los opacos.
 *   3. Está detrás de la COMPUERTA: su chunk no baja abajo de 1025px.
 *
 * Por eso es DOM y no `<canvas>`: sin `three`, sin WebGL, sin contexto de
 * render, sin listener de resize. Un `<canvas>` acá no demostraría nada más y
 * traería una superficie de fallo que este sprint no necesita.
 *
 * ── SITIO-S8: la escena real entró, y este módulo se quedó ─────────────────
 *
 * S1 escribió acá que «cuando entre la escena real, se reemplaza ESTE módulo».
 * La escena entró —`EscenarioCompuerta` pide ahora `_lib/escena/EscenaDelHome`,
 * y fue una línea, que era el punto— pero **este archivo NO se reemplazó, y no
 * es olvido: pasó a ser el control positivo del MECANISMO.**
 *
 * `/v3/control-estatico` lo importa de forma ESTÁTICA, así que su marca
 * (`MARCA_ESCENARIO`) TIENE que aparecer en la carga inicial de esa ruta. Eso
 * es lo que demuestra que el buscador del build encuentra un módulo cuando sí
 * está — sin él, «la escena no viaja en la carga inicial de /v3» pasaría en
 * verde también si el buscador estuviera ciego. La escena real lleva su propia
 * marca (`_lib/marcaEscena.ts`) justamente para que las dos se puedan buscar
 * por separado en el mismo build.
 *
 * Se borra el día que se borre `/v3/control-estatico`, y ese día su reemplazo
 * es el control con build aislado que esa ruta ya deja escrito.
 *
 * ── Sin animación ──────────────────────────────────────────────────────────
 *
 * Ni entrada, ni scroll, ni hover. La coreografía es otro lane, y la compuerta
 * tiene que existir ANTES: si queda para el final, el peso ya se coló en el
 * bundle base.
 *
 * ── Los colores ────────────────────────────────────────────────────────────
 *
 * Dos tokens del sistema, leídos de `superficies.ts`, que es el mismo lugar de
 * donde `superficies.invariant.ts` saca los valores para calcular el contraste
 * de la tinta contra este campo. Un solo origen: si alguien cambia el color
 * del canvas, la cifra del reporte se mueve con él.
 * Cero color fuera de los tokens, ni un hex suelto.
 */
export default function EscenarioDePrueba() {
  return (
    <div
      // La MARCA viaja como valor de atributo: se usa en tiempo de ejecución,
      // así que ningún minificador la pliega y ningún tree-shaking la poda.
      // Es lo que `bundle.invariant.ts` busca en la salida del build.
      data-escenario={MARCA_ESCENARIO}
      aria-hidden="true"
      className={CLASES_FUERA_DE_FLUJO}
    >
      <div className="grid h-full w-full grid-rows-2">
        {COLORES_DEL_CANVAS_DE_PRUEBA.map(({ token }) => (
          <div key={token} style={{ backgroundColor: `var(${token})` }} />
        ))}
      </div>

      {/* La etiqueta: para poder decir, mirando la pantalla, que lo que se ve
          a través de un panel transparente es ESTO y no otra cosa. */}
      <p className="text-tinta font-codigo text-micro tracking-micro absolute bottom-[var(--spacing-4)] left-[var(--pad-lateral-compacto)] uppercase">
        canvas de prueba · marcador de posición · la escena entra acá
      </p>
    </div>
  )
}

/**
 * B7 · FRENTE C — LA CELDA QUE B4-B NO PUDO ASENTAR, VERIFICADA. Y LA CONFUSIÓN
 * QUE HAY QUE NO COMETER.
 *
 *     npx tsx scripts-b7/c-tu-panel.ts
 *
 * ── ⚠️ SON DOS MEDICIONES DISTINTAS Y NO SE PUEDEN LEER COMO UNA ──────────
 *
 * B4-B declaró **una celda no asentada en 5 intentos** para `tu-panel` a 1920. Esa
 * celda era de **AIRE MUERTO** —cuánto del cuadro no tiene nada, con el lazo de
 * asentamiento de `scripts-b4/aire-muerto.ts`—, y el aire muerto no se asienta
 * cuando la escena de atrás sigue moviéndose entre repetición y repetición.
 *
 * Lo que se mide acá es **CONTRASTE bajo el glifo**, que es otra cosa: qué razón
 * hay entre la tinta y lo que quedó atrás, píxel por píxel de letra. Una celda
 * puede no asentar en aire y estar perfecta en contraste, y es exactamente el
 * caso. **Un reporte que use el «no asentó» de B4-B para dudar del contraste
 * estaría citando una medición para responder otra pregunta.**
 *
 * Este archivo no mide aire muerto y no lo intenta: no es su defecto, y hacerlo
 * a medias —sin el lazo de asentamiento— produciría un tercer número que nadie
 * podría comparar con los otros dos.
 *
 * ── Y por qué el mismo scrollY y el mismo instrumento ─────────────────────
 *
 * Porque la Fase 0 ya publicó la cifra (`f0-contraste.json`) y esto es una
 * verificación, no una segunda opinión: si cambiara el `scrollY`, el ancho o la
 * secuencia, un desacuerdo no diría si la cifra estaba mal o si se midió otra
 * cosa. Comparte `c-glifo-medicion.ts` con `c-contraste.ts` justamente para que
 * las dos tablas del frente sean la misma tabla.
 *
 * ⚠️ **El piso de 3000 píxeles de glifo se exige acá también, y es lo que hace
 * que valga.** «Cero píxeles bajo AA» sobre 300 píxeles de glifo no dice que el
 * texto se lea: dice que casi no había texto. Con 28.000 sí lo dice.
 */

import { guardarJson } from './b7-comun'
import { carpetaTemporal, medirElContrasteBajoElGlifo, type Escenario } from './c-glifo-medicion'

const TEMP = carpetaTemporal('b7-c-tu-panel')

const MINIMO_DE_GLIFO = 3000

/** La celda exacta de la Fase 0: mismo ancho, mismo scrollY, mismo selector. */
const ESCENARIO: Escenario = {
  id: 'tu-panel-1920',
  perfil: '1920',
  scrollY: 15120,
  selectorDelTexto: '[data-panel="tu-panel"] .font-cuerpo',
  textoGrande: false,
}

async function principal(): Promise<void> {
  console.log(`· ${ESCENARIO.id} — ${ESCENARIO.perfil}, scrollY ${ESCENARIO.scrollY}`)
  const m = await medirElContrasteBajoElGlifo(ESCENARIO, TEMP)
  const a = m.agregado
  const bajoElPiso = a.pixelesDeGlifo < MINIMO_DE_GLIFO
  console.log(
    `  glifo ${a.pixelesDeGlifo} px (piso ${MINIMO_DE_GLIFO}${bajoElPiso ? ' — ✗ NO ALCANZA' : ' ✓'}) · ` +
      `mediana ${a.medianaContraste}:1 · peor ${a.peorContraste}:1 · bajo AA ${a.bajoAA} (${a.porcientoBajoAA} %)`,
  )
  console.log(`  ${m.elementos} elementos · tinta ${m.tinta.join(',')} · papel ${m.papel.join(',')}`)
  console.log(
    bajoElPiso
      ? '  → sin veredicto: por debajo del piso, cualquier cifra sería verde por vacío'
      : a.bajoAA === 0
        ? '  → CERRADO: cero píxeles bajo AA sobre una masa de glifo que supera el piso'
        : `  → ABIERTO: ${a.bajoAA} píxeles bajo AA`,
  )
  console.log('  ⚠️ esto es CONTRASTE. La celda que B4-B no asentó era de AIRE MUERTO — otra medición.')
  console.log(`\n→ ${guardarJson('c-tu-panel', { escenario: ESCENARIO, medicion: { ...m, cajas: m.cajas.length }, pisoDeGlifo: MINIMO_DE_GLIFO, temp: TEMP })}`)
}

void principal()

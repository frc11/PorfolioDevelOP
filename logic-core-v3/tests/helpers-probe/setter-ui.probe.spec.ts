import { test, expect, type Page } from '@playwright/test'
import {
  vis,
  firstVisible,
  pickSelect,
  fieldControl,
  expectToast,
  expandCartera,
} from '../helpers/setter-ui'
import { typeControlledInput, setControlledInput, setControlledSelect } from '../helpers/form'

/**
 * SABOTAJE de los helpers compartidos (sprint «los helpers que prueban»).
 *
 * Cada helper va de a pares:
 *   CONDUCTA — la conducta ocurrió  → el helper DEBE pasar.
 *   SABOTAJE — la conducta NO ocurrió (pero el señuelo está) → DEBE fallar.
 *
 * Un helper que solo pasa el caso CONDUCTA podría estar siempre en verde; uno
 * que solo pasa el SABOTAJE podría estar siempre en rojo. Los dos juntos son lo
 * único que distingue «verifica» de «no verifica».
 *
 * El DOM lo arma `page.setContent()`: sin server, sin DB, sin seed. El sujeto es
 * el helper, no la pantalla.
 */

/** Corre `fn` y afirma que LANZÓ. El mensaje dice qué conducta faltaba. */
async function debeFallar(razon: string, fn: () => Promise<unknown>): Promise<void> {
  let lanzo = false
  try {
    await fn()
  } catch {
    lanzo = true
  }
  expect(lanzo, `el helper pasó sin la conducta — ${razon}`).toBe(true)
}

// ── Fragmentos de DOM reales ─────────────────────────────────────────────────

/** El contenedor de sonner tal como lo monta `<Toaster />` en `app/layout.tsx`. */
function toaster(avisos: readonly string[]): string {
  const items = avisos
    .map(
      (texto) =>
        `<li data-sonner-toast data-mounted="true"><div data-content=""><div data-title="">${texto}</div></div></li>`,
    )
    .join('')
  return `<section aria-label="Notifications alt+T"><ol data-sonner-toaster="" tabindex="-1">${items}</ol></section>`
}

const AVISO_CONSTRUCCION = 'Construcción arrancada — seguí la guía.'

/**
 * El señuelo REAL: la copy que `m-construccion.tsx` tenía antes de que P10 la
 * reescribiera en subjuntivo justo para no chocar con este helper.
 */
const SENUELO_CONSTRUCCION =
  'Los tildes se abren con la construcción arrancada — el botón está acá arriba.'

async function montar(page: Page, html: string): Promise<void> {
  await page.setContent(`<div style="margin:0">${html}</div>`, { waitUntil: 'domcontentloaded' })
}

// ─────────────────────────────────────────────────────────────────────────────
// expectToast — 19 llamadas en 3 archivos
// ─────────────────────────────────────────────────────────────────────────────

test('expectToast · CONDUCTA: el aviso está en el contenedor de toasts', async ({ page }) => {
  await montar(page, `<main><p>Nada que ver acá.</p></main>${toaster([AVISO_CONSTRUCCION])}`)
  await expectToast(page, /Construcción arrancada/i, { timeout: 3_000 })
})

test('expectToast · SABOTAJE: la frase vive en el cuerpo y NO hubo aviso', async ({ page }) => {
  await montar(page, `<main><p>${SENUELO_CONSTRUCCION}</p></main>${toaster([])}`)
  await debeFallar('no se emitió ningún aviso; la frase es copy de la pantalla', () =>
    expectToast(page, /Construcción arrancada/i, { timeout: 3_000 }),
  )
})

test('expectToast · SABOTAJE: el aviso llegó pero dice OTRA cosa', async ({ page }) => {
  await montar(
    page,
    `<main><p>${SENUELO_CONSTRUCCION}</p></main>${toaster(['No pudimos guardar. Reintentá.'])}`,
  )
  await debeFallar('el único aviso emitido fue un error distinto', () =>
    expectToast(page, /Construcción arrancada/i, { timeout: 3_000 }),
  )
})

test('expectToast · SABOTAJE: la frase vive en el <select> espejo sr-only', async ({ page }) => {
  // `<Select>` monta un `<select aria-hidden sr-only>` con TODAS las opciones.
  // No está en el árbol de accesibilidad, pero `getByText` lo ve igual.
  await montar(
    page,
    `<main><select aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden">
       <option>Construcción arrancada</option>
     </select></main>${toaster([])}`,
  )
  await debeFallar('la frase es una opción espejo, no un aviso', () =>
    expectToast(page, /Construcción arrancada/i, { timeout: 3_000 }),
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// pickSelect — 7 llamadas en 4 archivos
// ─────────────────────────────────────────────────────────────────────────────

/** `<Select>` compartido: trigger + panel que commitea en mousedown. */
function selectHtml(opts: { commitea: boolean; panelAbiertoDeEntrada?: boolean }): string {
  const displayInicial = opts.panelAbiertoDeEntrada ? 'block' : 'none'
  const cuerpoDelCommit = opts.commitea
    ? "document.getElementById('valor').textContent = 'Avanzar'; panel.style.display = 'none'; trigger.setAttribute('aria-expanded', 'false')"
    : '/* el commit no ocurre */'
  return `
    <main>
      <button type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Veredicto del Evaluador" id="trigger">
        <span id="valor">&nbsp;</span>
      </button>
      <ul role="listbox" id="panel" style="display:${displayInicial}">
        <li role="option" id="opt">Avanzar</li>
      </ul>
    </main>
    <script>
      const trigger = document.getElementById('trigger')
      const panel = document.getElementById('panel')
      const opt = document.getElementById('opt')
      trigger.addEventListener('click', () => {
        const abierto = panel.style.display === 'block'
        panel.style.display = abierto ? 'none' : 'block'
        trigger.setAttribute('aria-expanded', String(!abierto))
      })
      opt.addEventListener('mousedown', () => { ${cuerpoDelCommit} })
    </script>`
}

test('pickSelect · CONDUCTA: elegir la opción deja el valor en el trigger', async ({ page }) => {
  await montar(page, selectHtml({ commitea: true }))
  await pickSelect(page, 'Veredicto del Evaluador', /^Avanzar$/i)
  await expect(page.locator('#valor')).toHaveText('Avanzar')
})

test('pickSelect · SABOTAJE: se clickea la opción y el valor NO se commitea', async ({ page }) => {
  await montar(page, selectHtml({ commitea: false }))
  await debeFallar('la opción se clickeó pero el select siguió vacío', () =>
    pickSelect(page, 'Veredicto del Evaluador', /^Avanzar$/i),
  )
})

test('pickSelect · SABOTAJE: la opción ya estaba, el trigger CERRÓ el panel', async ({ page }) => {
  // El panel arranca abierto: el click del trigger lo cierra. La opción sigue en
  // el DOM y `page.getByRole('option')` la encuentra igual — ámbito de página.
  await montar(page, selectHtml({ commitea: false, panelAbiertoDeEntrada: true }))
  await debeFallar('el trigger cerró el panel y nada se eligió', () =>
    pickSelect(page, 'Veredicto del Evaluador', /^Avanzar$/i),
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// fieldControl — 21 llamadas en 4 archivos
// ─────────────────────────────────────────────────────────────────────────────

const DOS_CAMPOS = `
  <main>
    <div><label>Notas de traspaso para Franco</label><textarea id="traspaso"></textarea></div>
    <div><label>Nota (opcional)</label><textarea id="nota"></textarea></div>
  </main>`

test('fieldControl · CONDUCTA: la etiqueta única lleva a su propio control', async ({ page }) => {
  await montar(page, DOS_CAMPOS)
  await firstVisible(fieldControl(page, 'Notas de traspaso para Franco')).fill('x')
  await expect(page.locator('#traspaso')).toHaveValue('x')
})

/**
 * QUEDA EN ROJO A PROPÓSITO (`test.fail`): el hallazgo está declarado y NO se
 * arregló en este sprint.
 *
 * El xpath de `fieldControl` usa `contains()`, y esa laxitud es PORTANTE: tres
 * call sites piden por un prefijo de la etiqueta real («Tu opener» →
 * «Tu opener (el texto que vas a pegar en Instagram)», «Qué intentaste» →
 * «¿Qué intentaste y dónde te trabaste?», «Nota» → «Nota (opcional)»). Pasar a
 * igualdad exacta los rompe a los tres.
 *
 * El locator SÍ devuelve los dos matches —el modo estricto de Playwright
 * gritaría— pero los 21 call sites lo envuelven en `firstVisible()`, que hace
 * `.first()` y elige en silencio. Cerrarlo de verdad pide tocar los 21, que es
 * otro objetivo.
 *
 * Hoy la trampa está latente, no viva: ninguna de las 13 etiquetas que la suite
 * usa colisiona con otra en la misma pantalla («Nota (opcional)» vive en m5 y
 * «Notas de traspaso para Franco» en m16). Si alguien la arregla, este caso
 * pasa a verde y Playwright lo reporta como fallo inesperado — la señal para
 * borrar esta anotación.
 */
test('fieldControl · SABOTAJE: dos etiquetas matchean y se escribe en la que no era', async ({
  page,
}) => {
  test.fail()
  await montar(page, DOS_CAMPOS)
  // «Nota» es subcadena de «Notas de traspaso para Franco»: el xpath usa
  // contains() y `firstVisible` toma el primero del DOM, en silencio.
  await firstVisible(fieldControl(page, 'Nota')).fill('para el seguimiento')
  await expect(
    page.locator('#nota'),
    'la nota del seguimiento tiene que aterrizar en su propio campo',
  ).toHaveValue('para el seguimiento')
})

// ─────────────────────────────────────────────────────────────────────────────
// expandCartera — 12 llamadas en 6 archivos
// ─────────────────────────────────────────────────────────────────────────────

function carteraHtml(opts: { expandeDeVerdad: boolean }): string {
  const cuerpoDelClick = opts.expandeDeVerdad
    ? "document.getElementById('cuerpo').style.display = 'block'"
    : '/* el cuerpo no se monta */'
  return `
    <main>
      <button type="button" aria-expanded="false" id="toggle">Ver toda la cartera</button>
      <div id="cuerpo" style="display:none">
        <input type="search" aria-label="Buscar en tu cartera" />
      </div>
    </main>
    <script>
      document.getElementById('toggle').addEventListener('click', () => {
        document.getElementById('toggle').setAttribute('aria-expanded', 'true')
        ${cuerpoDelClick}
      })
    </script>`
}

test('expandCartera · CONDUCTA: abre y el buscador queda visible', async ({ page }) => {
  await montar(page, carteraHtml({ expandeDeVerdad: true }))
  await expandCartera(page)
  await expect(
    firstVisible(page.getByRole('searchbox', { name: 'Buscar en tu cartera' })),
  ).toBeVisible()
})

test('expandCartera · SABOTAJE: el toggle dice abierto y el cuerpo nunca monta', async ({
  page,
}) => {
  await montar(page, carteraHtml({ expandeDeVerdad: false }))
  await debeFallar('aria-expanded quedó en true sin que el cuerpo montara', () =>
    expandCartera(page),
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// firstVisible / vis — 240 llamadas en 19 archivos
// ─────────────────────────────────────────────────────────────────────────────

const COPIA_RESPONSIVE = `
  <main>
    <div style="display:none"><p>Demo enviada a revisión</p></div>
    <div><p>Demo enviada a revisión</p></div>
  </main>`

test('firstVisible · CONDUCTA: elige la copia visible, no la del responsive oculto', async ({
  page,
}) => {
  await montar(page, COPIA_RESPONSIVE)
  await expect(firstVisible(page.getByText('Demo enviada a revisión'))).toBeVisible()
  await expect(vis(page.getByText('Demo enviada a revisión'))).toHaveCount(1)
})

test('firstVisible · SABOTAJE: el texto existe SOLO en la copia oculta', async ({ page }) => {
  await montar(page, `<main><div style="display:none"><p>Demo enviada a revisión</p></div></main>`)
  await debeFallar('el texto está en el DOM pero no se lee', () =>
    expect(firstVisible(page.getByText('Demo enviada a revisión'))).toBeVisible({ timeout: 2_000 }),
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// typeControlledInput / setControlledInput — form.ts
// ─────────────────────────────────────────────────────────────────────────────

const SELECT_NATIVO = `
  <main>
    <select id="tono">
      <option value="">Elegí</option>
      <option value="legal">Legal</option>
      <option value="informal_rioplatense">Informal rioplatense</option>
    </select>
  </main>`

test('setControlledSelect · CONDUCTA: el valor queda elegido', async ({ page }) => {
  await montar(page, SELECT_NATIVO)
  await setControlledSelect(page.locator('#tono'), 'legal')
  await expect(page.locator('#tono')).toHaveValue('legal')
})

test('setControlledSelect · SABOTAJE: ninguna opción tiene ese valor', async ({ page }) => {
  await montar(page, SELECT_NATIVO)
  // El setter de `HTMLSelectElement.value` descarta en silencio un valor que no
  // existe: el select queda en ''. Es lo que pasaría con una opción renombrada.
  await debeFallar('la opción no existe: el select quedó vacío', () =>
    setControlledSelect(page.locator('#tono'), 'formal_academico'),
  )
})

test('typeControlledInput · CONDUCTA: el texto aterriza en el input', async ({ page }) => {
  await montar(page, `<main><input id="libre" /></main>`)
  await typeControlledInput(page.locator('#libre'), 'hola')
  await expect(page.locator('#libre')).toHaveValue('hola')
})

test('typeControlledInput · SABOTAJE: el input es readonly y no acepta nada', async ({ page }) => {
  await montar(page, `<main><input id="trabado" readonly /></main>`)
  await debeFallar('el input es readonly: no se escribió nada', () =>
    typeControlledInput(page.locator('#trabado'), 'hola'),
  )
})

/**
 * CARACTERIZACIÓN, no sabotaje: `setControlledInput` escribe con el setter
 * nativo del prototipo para saltear la intercepción de React, y de paso saltea
 * el `readonly` del DOM. Eso es inherente a la técnica, no un defecto — pero
 * significa que este helper NO puede usarse para probar que un campo es
 * editable: llenaría uno que una persona no podría llenar.
 *
 * Hoy tiene CERO call sites. El caso queda fijando la conducta para que, si
 * alguien lo adopta, esta consecuencia esté escrita y medida.
 */
test('setControlledInput · CARACTERIZACIÓN: escribe incluso sobre un readonly', async ({
  page,
}) => {
  await montar(page, `<main><input id="trabado2" readonly /></main>`)
  await setControlledInput(page.locator('#trabado2'), 'hola')
  await expect(
    page.locator('#trabado2'),
    'el setter nativo saltea el readonly: el valor entra igual',
  ).toHaveValue('hola')
})

// ─────────────────────────────────────────────────────────────────────────────
// Las DOS aserciones sin filo del envío (01-flow:298 y corrida-1:313)
//
// No son un helper: son dos call sites que el sprint anterior midió y dejó
// anotados. Valen su propio par porque muestran algo que el arreglo de
// `expectToast` NO alcanzaba — un `.catch()` en el call site desarma cualquier
// aserción, por buena que sea.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Las dos ramas REALES del `successToast` de `envio-form.tsx`. El emoji del
 * original se omite a propósito: ninguno de los dos patrones lo mira, y así el
 * fixture no depende de cómo cada editor guarde el par subrogado.
 */
const AVISO_ENVIO_OK = 'Demo enviada registrada — ahora el objetivo es la reunión.'
const AVISO_ENVIO_YA_ESTABA = 'Ese envío ya estaba registrado — no se duplica nada.'

/**
 * El defecto DECISIVO de la forma vieja, y el que el arreglo de `expectToast` no
 * podía tocar: `.catch(() => undefined)`. Con el helper YA ARREGLADO y sin un
 * solo aviso en la pantalla, la línea igual resuelve. No es una aserción débil —
 * es una aserción que no puede fallar nunca.
 */
test('envío · SABOTAJE de la forma vieja: el .catch() se come la ausencia total de aviso', async ({
  page,
}) => {
  await montar(page, `<main><p>Nada. Ningún aviso.</p></main>${toaster([])}`)
  let lanzo = false
  try {
    // La forma exacta que tenían 01-flow:298 y corrida-1:313.
    await expectToast(page, /Demo enviada|enviada/i, { timeout: 2_000 }).catch(() => undefined)
  } catch {
    lanzo = true
  }
  expect(
    lanzo,
    'con el .catch() la línea pasa aunque no exista ningún aviso: no afirmaba nada',
  ).toBe(false)
})

/** CONDUCTA: el envío ocurrió ahora — la aserción nueva lo reconoce. */
test('envío · CONDUCTA: el aviso del envío recién registrado satisface el patrón nuevo', async ({
  page,
}) => {
  await montar(page, `<main></main>${toaster([AVISO_ENVIO_OK])}`)
  await expectToast(page, /Demo enviada registrada/i, { timeout: 3_000 })
})

/**
 * SABOTAJE: el claim fue IDEMPOTENTE — no se registró nada nuevo. B8 afirma que
 * el envío se registró en ESTE click; la otra rama del mismo `successToast` no
 * puede satisfacer esa promesa.
 */
test('envío · SABOTAJE: el aviso dice que YA estaba registrado, no que se registró ahora', async ({
  page,
}) => {
  await montar(page, `<main></main>${toaster([AVISO_ENVIO_YA_ESTABA])}`)
  await debeFallar('el envío no se registró en este click: ya estaba', () =>
    expectToast(page, /Demo enviada registrada/i, { timeout: 2_000 }),
  )
})

/**
 * El renombre `draft` → `borrador` (corrida-1:233). La etiqueta que la spec pedía
 * no existe en ninguna pantalla: el único «URL del draft» que queda en `src/` es
 * un COMENTARIO en `dossier.ts:277`. El xpath del helper busca un `<label>` — no
 * puede resolver, y el `.fill()` agota el timeout.
 */
test('fieldControl · SABOTAJE: la etiqueta renombrada no resuelve a ningún control', async ({
  page,
}) => {
  await montar(
    page,
    `<main><div><label>URL del borrador</label><input id="borrador" /></div></main>`,
  )
  expect(
    await fieldControl(page, 'URL del draft').count(),
    'la etiqueta vieja no matchea nada: la spec escribía al vacío',
  ).toBe(0)
  // Y con la etiqueta REAL sí resuelve — el arreglo del call site.
  await fieldControl(page, 'URL del borrador').fill('https://demo.netlify.app')
  await expect(page.locator('#borrador')).toHaveValue('https://demo.netlify.app')
})

import { test, expect } from '@playwright/test'
import { qaLogin } from '../helpers/setter-auth'
import { firstVisible } from '../helpers/setter-ui'
import {
  getSetterQa,
  createLead,
  getDossier,
  newTracker,
  teardown,
  disconnect,
  type SmokeTracker,
} from '../helpers/setter-db'

/**
 * P31 — DESPUÉS DE UNA ACCIÓN, LA PANTALLA MUESTRA EL ESTADO NUEVO.
 *
 * La prueba de CONDUCTA del reflejo. Su gemelo estático es
 * `check:invariant:reflejo`, y ninguno de los dos alcanza solo: el invariante
 * vigila la FORMA (que el `<Toaster>` esté montado, que dure lo suficiente, que
 * toda acción que revalida emita su cartel) y no puede ver si la pantalla
 * commitea; esta prueba ve exactamente eso, sobre una acción.
 *
 * ── Qué defecto fija, y por qué NINGUNA otra prueba lo veía (P29 · P30) ──────
 * El reflejo de estas pantallas depende de que el cartel de avisos se cierre
 * solo a los 4000 ms. La cadena está escrita en
 * `src/lib/leados/reflejo-del-arbol.invariant.ts`; el resumen es que la
 * respuesta de la server action llega con el árbol nuevo (~0,9 s) pero React la
 * dejó en un lane SUSPENDIDO y «warm» que no vuelve a elegir por su cuenta, y lo
 * destraba la próxima actualización de estado — hoy, el auto-cierre del cartel.
 *
 * Medido: sin cartel, `mc1` no refleja NUNCA (75 s con el dossier ya en
 * CONSTRUCCION en la base, y un solo ping a los 973 ms). Y las demás pruebas de
 * esta suite no lo veían porque esperan POR CONDICIÓN, y la condición se cumple
 * — gracias al cartel. El día que alguien le toque el `duration` al `<Toaster>`,
 * la suite entera sigue verde y las pantallas del setter dejan de actualizarse.
 *
 * ── Por qué el aserto es `toBeEnabled` y no `toBeVisible` ────────────────────
 * Medido antes de escribir el aserto: los tres tildes de fase YA ESTÁN EN
 * PANTALLA Y VISIBLES antes de arrancar la construcción — apagados, con su
 * motivo. Lo único que cambia es que se habilitan. Un `toBeVisible()` acá es
 * verdadero antes Y después: sería una aserción vacua, verde contra el defecto
 * que viene a cubrir. Se piden las dos cosas (visible y habilitado) porque un
 * control habilitado que no está en pantalla tampoco es reflejo.
 *
 * P42 — «Construir» tiene ahora UN tilde («La demo quedó construida») con la
 * misma forma: está en pantalla, apagado, antes de arrancar, y se habilita al
 * arrancar. El locator pasa a su nombre; el aserto no cambia.
 *
 * ── Por qué hay un tope de tiempo, si la regla es esperar por condición ──────
 * Se espera por CONDICIÓN — `toBeEnabled` reintenta hasta que se cumple. El tope
 * es lo que convierte «no se cumple» en rojo en vez de en una corrida colgada, y
 * tiene que existir: el modo roto no es lento, es que NO PASA NUNCA. Con el
 * mecanismo intacto la pantalla commitea a ~4,7 s (a veces a ~1 s, cuando le
 * gana a la carrera); el tope está muy por encima de eso para no volverse flake
 * en server frío, y muy por debajo de «para siempre».
 *
 * ── Demostrada fallando, de las dos formas (P31) ─────────────────────────────
 * Tres builds, cada una con su corrida:
 *
 *   · Sin el `successToast:` de `iniciarConstruccion`  →  ROJA
 *   · Con `duration={150}` en el `<Toaster>`           →  ROJA
 *   · Con `duration={800}` en el `<Toaster>`           →  VERDE, y está BIEN
 *
 * La tercera es la que le da valor a la segunda, y por poco no se descubre. El
 * primer intento de romperla fue `duration={800}` y la prueba pasó; la sonda
 * explicó por qué, y no era que la prueba fuera floja: con 800 ms el cartel
 * cierra a ~1,43 s, todavía por ENCIMA del punto donde el árbol ya resolvió, así
 * que el mecanismo sigue funcionando y la pantalla commitea — más rápido, no
 * peor. El acantilado está más abajo: con 150 ms el cierre cae adentro de la
 * ventana de la carrera y la pantalla no commitea nunca.
 *
 * Con el MISMO cartel presente en las dos, esta prueba da distinto según el
 * mecanismo ande o no. Eso es lo que dice que mira el mecanismo y no la
 * presencia del cartel — que era el riesgo declarado.
 */

/**
 * Tope del reflejo. No es un umbral de rendimiento —el producto tarda ~4,7 s y
 * este sprint no lo mejora— sino la línea entre «tarda» y «nunca».
 */
const TOPE_REFLEJO_MS = 20_000

const tracker: SmokeTracker = newTracker()
let setterId: string

test.beforeAll(async () => {
  setterId = (await getSetterQa()).id
})

test.afterAll(async () => {
  await teardown(tracker)
  await disconnect()
})

test('la pantalla refleja el estado nuevo después de arrancar la construcción', async ({
  page,
}) => {
  const { id: leadId } = await createLead(tracker, {
    setterId,
    businessName: 'P31 reflejo del arbol',
    stage: 'BRIEF',
    status: 'RESPONDIO',
  })

  await qaLogin(page, 'setter')
  await page.goto(`/setter/leads/${leadId}/manual/mc1`, { waitUntil: 'domcontentloaded' })

  // Los tildes ya están en pantalla y APAGADOS. Se afirma acá, y no sólo en el
  // comentario, porque es lo que hace que el aserto de abajo no sea vacuo: si un
  // día llegaran habilitados, este test pasaría sin probar nada y hay que
  // enterarse por rojo.
  const tilde = firstVisible(
    page.locator('main section[aria-label="Registro"]').getByRole('button', {
      name: 'La demo quedó construida',
    }),
  )
  await expect(tilde).toBeVisible()
  await expect(tilde).toBeDisabled()

  await firstVisible(page.getByRole('button', { name: 'Arrancar construcción' })).click()

  // 1. La acción corrió. Sin este paso, un rojo de abajo no distingue «la
  //    pantalla no refleja» de «la acción falló», que se arreglan en lugares
  //    distintos.
  await expect
    .poll(async () => (await getDossier(leadId))?.stage, {
      timeout: TOPE_REFLEJO_MS,
      message: 'la action iniciarConstruccion no dejó el dossier en CONSTRUCCION',
    })
    .toBe('CONSTRUCCION')

  // 2. Y la pantalla lo MUESTRA. Éste es el aserto del sprint: entre (1) y (2)
  //    hay una espera que no depende de los datos —ya están— sino de que algo
  //    destrabe el lane suspendido de React.
  await expect(
    tilde,
    'El dossier ya está en CONSTRUCCION pero la pantalla sigue mostrando el estado viejo: los ' +
      'tildes de fase nunca se habilitaron.\n' +
      '  Esto es el defecto de P29/P30: el árbol revalidado llegó (~0,9 s) y quedó en un lane ' +
      'suspendido y «warm» que React no vuelve a elegir solo. Lo destraba la próxima ' +
      'actualización de estado, y hoy la única que llega es el auto-cierre del cartel de sonner ' +
      '(4000 ms por default).\n' +
      '  Mirá, en este orden: ¿sigue montado el <Toaster> en app/layout.tsx? ¿le pusieron un ' +
      '`duration` corto? ¿la acción perdió su `successToast:`? Los tres rompen el reflejo de ' +
      'varias pantallas a la vez y ninguno se ve en el diff.\n' +
      '  Contexto completo: docs/perf-p30/REPORTE.md · check:invariant:reflejo',
  ).toBeEnabled({ timeout: TOPE_REFLEJO_MS })
  await expect(tilde).toBeVisible()
})

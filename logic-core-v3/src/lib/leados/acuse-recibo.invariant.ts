/**
 * Chequeo de invariante del ACUSE DE RECIBO del setter — corre sin DB.
 *
 *   npm run check:invariant:acuse
 *
 * F3. El patrón que el producto ya tenía bien hecho (`lead-card-actions`,
 * abstraído en `use-step-action.ts`) son DOS señales, y toda acción que escribe
 * las tiene que dar:
 *
 *   1. EL CONTROL RESPONDE EN EL ACTO — `useStepAction()` o `useTransition()`,
 *      que es lo que apaga el botón mientras el server trabaja.
 *   2. EL RESULTADO SE ANUNCIA DONDE SE LEE — `toast` (el `Toaster` de sonner
 *      del root layout monta una región `aria-live="polite"`), `successToast`
 *      del hook, o `<AutosaveStatus>` (`role="status"`) en la escritura continua.
 *
 * Qué protege. El daño real no fue una pantalla fea: «Postergar» no acusaba, el
 * recorrido no supo si había quedado, recargó y volvió a postergar — dos
 * registros duplicados en el historial (B-B2). Este invariante no re-verifica
 * esa acción puntual: fija el PATRÓN, así la próxima acción que alguien agregue
 * no puede entrar muda sin que esto se ponga en rojo.
 *
 * POR QUÉ MIRA EL CALL-SITE Y NO EL ARCHIVO. La granularidad importa y es lo
 * que hace la diferencia entre una red y un adorno: «Saltar» (foco) vivía en un
 * archivo LLENO de toasts —«Pausar», al lado, anunciaba— y era justo la única
 * acción muda de la superficie. Un chequeo por archivo lo habría dado por bueno.
 * Así que cada llamada se evalúa dentro de SU bloque de transición
 * (`startTransition(…)` / `run(…)`), no contra el archivo entero.
 *
 * Qué cuenta como señal 2 en un bloque, en orden de fuerza:
 *   a. Anuncia — `toast.*` / `successToast:` adentro del bloque.
 *   b. Navega — `router.push(` adentro del bloque: la pantalla entera cambia,
 *      y un cartel encima de eso sería ruido (regla 3 del sprint).
 *   c. Pinta en el lugar — sólo las de `EXIMIDAS`, con motivo escrito y con la
 *      `prueba` de que el motivo SIGUE siendo cierto en el archivo.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const SETTER_DIR = join(process.cwd(), 'src', 'app', '(protected)', 'setter')
const ACTIONS_DIR = join(SETTER_DIR, '_actions')

function tsxDelSetter(dir: string): string[] {
  const salida: string[] = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) salida.push(...tsxDelSetter(ruta))
    else if (entrada.name.endsWith('.tsx')) salida.push(ruta)
  }
  return salida
}

function corto(ruta: string): string {
  return ruta.slice(SETTER_DIR.length + 1).replace(/\\/g, '/')
}

/**
 * Desde el `(` en `desde`, devuelve el texto hasta su paréntesis de cierre.
 * Saltea strings ('/"/`) y comentarios para que un paréntesis dentro de un copy
 * —abundante en esta superficie— no descuadre el conteo.
 */
function bloqueBalanceado(fuente: string, desde: number): string {
  let profundidad = 0
  for (let i = desde; i < fuente.length; i++) {
    const c = fuente[i]!
    if (c === "'" || c === '"' || c === '`') {
      const comilla = c
      i++
      while (i < fuente.length && fuente[i] !== comilla) {
        if (fuente[i] === '\\') i++
        i++
      }
      continue
    }
    if (c === '/' && fuente[i + 1] === '/') {
      while (i < fuente.length && fuente[i] !== '\n') i++
      continue
    }
    if (c === '/' && fuente[i + 1] === '*') {
      i = fuente.indexOf('*/', i + 2)
      if (i === -1) break
      i++
      continue
    }
    if (c === '(') profundidad++
    else if (c === ')') {
      profundidad--
      if (profundidad === 0) return fuente.slice(desde, i + 1)
    }
  }
  return fuente.slice(desde)
}

/** Apertura del bloque que envuelve a la llamada: la más cercana hacia atrás. */
// `\brun(` toma las dos formas en uso: suelta (`run(…)`, con el hook
// desestructurado) y por objeto (`busqueda.run(…)`, `envio.run(…)`).
const APERTURAS = [/startTransition\s*\(/g, /\brun\s*\(/g, /useAutosave\s*(?:<[^>]*>)?\s*\(/g]

type Envoltorio = { tipo: 'transicion' | 'autosave'; texto: string }

function envoltorioDe(fuente: string, idxLlamada: number): Envoltorio | null {
  let mejor: { idx: number; parenIdx: number; tipo: Envoltorio['tipo'] } | null = null
  for (const patron of APERTURAS) {
    patron.lastIndex = 0
    for (const m of fuente.matchAll(patron)) {
      const idx = m.index!
      if (idx >= idxLlamada) break
      const parenIdx = idx + m[0]!.length - 1
      const tipo: Envoltorio['tipo'] = m[0]!.includes('useAutosave') ? 'autosave' : 'transicion'
      if (!mejor || idx > mejor.idx) mejor = { idx, parenIdx, tipo }
    }
  }
  if (!mejor) return null
  const texto = bloqueBalanceado(fuente, mejor.parenIdx)
  // El bloque tiene que CONTENER la llamada; si no, la apertura más cercana
  // hacia atrás era de otro handler ya cerrado y esta llamada quedó suelta.
  if (mejor.parenIdx + texto.length < idxLlamada) return null
  return { tipo: mejor.tipo, texto }
}

// ── 1. EL CONJUNTO DE LO QUE ESCRIBE, LEÍDO DE LA FUENTE ─────────────────────
const ACCIONES = new Set<string>()
for (const archivo of readdirSync(ACTIONS_DIR)) {
  if (!archivo.endsWith('.actions.ts')) continue
  const fuente = readFileSync(join(ACTIONS_DIR, archivo), 'utf8')
  for (const m of fuente.matchAll(/^export async function (\w+)/gm)) ACCIONES.add(m[1]!)
}

assert.ok(
  ACCIONES.size >= 20,
  `se esperaban ≥20 acciones de escritura en _actions/*.actions.ts, se leyeron ${ACCIONES.size} — ` +
    '¿cambió la forma de declararlas? El invariante quedaría vacío y no protegería nada',
)

// ── 2. LAS SEÑALES ───────────────────────────────────────────────────────────
const RESPONDE_EN_EL_ACTO = [/useStepAction\s*\(/, /useTransition\s*\(/]
/**
 * El acuse es el del ÉXITO — `toast.error` queda AFUERA a propósito. Casi todos
 * estos bloques avisan el fallo; contarlo como acuse hacía pasar en verde justo
 * el caso que este sprint arregló («Saltar» tenía su `toast.error` y el camino
 * feliz mudo). `warning`/`message` sí cuentan: son el resultado de una acción
 * que terminó (Telegram caído, CSV sin altas), no un rebote.
 */
const ANUNCIA = [/toast\s*\.\s*(success|warning|message)\s*\(/, /successToast\s*:/]
const NAVEGA = /router\s*\.\s*push\s*\(/

/**
 * Las que no anuncian NI navegan, a propósito: pintan el resultado en el lugar.
 * Clave `archivo::accion`. La `prueba` es lo que sostiene la excusa — si el
 * mecanismo in-place desaparece, la excusa deja de matchear y vuelve al patrón.
 */
const EXIMIDAS: Record<string, { motivo: string; prueba: RegExp }> = {
  'leads/[leadId]/manual/_components/agenda-form.tsx::ofrecerHorarios': {
    motivo: 'los horarios ofrecidos REEMPLAZAN el buscador en la misma pantalla (onSuccess → setOferta)',
    prueba: /onSuccess\s*:\s*\([^)]*\)\s*=>\s*setOferta\s*\(/,
  },
  'leads/[leadId]/manual/_components/fase-auto-reporte.tsx::guardarProgreso': {
    motivo: 'el tilde se pinta EN EL LUGAR (useOptimistic + aria-pressed): el acuse es el tilde mismo',
    prueba: /useOptimistic\s*</,
  },
}

// ── 3. TODA LLAMADA QUE ESCRIBE ACUSA RECIBO, EN SU PROPIO BLOQUE ────────────
const revisados = new Set<string>()
let callSites = 0
const eximidosVistos = new Set<string>()

for (const ruta of tsxDelSetter(SETTER_DIR)) {
  const fuente = readFileSync(ruta, 'utf8')
  const nombre = corto(ruta)

  for (const accion of ACCIONES) {
    // Un call-site de verdad: `accion(` en el cuerpo. El import solo no alcanza
    // (los módulos del manual re-exportan sin llamar).
    for (const m of fuente.matchAll(new RegExp(`(?<![\\w.])${accion}\\s*\\(`, 'g'))) {
      const idx = m.index!
      // Descarta el propio import y las menciones en comentarios de doc.
      const lineaInicio = fuente.lastIndexOf('\n', idx) + 1
      const linea = fuente.slice(lineaInicio, fuente.indexOf('\n', idx))
      if (/^\s*(\*|\/\/|import)/.test(linea)) continue

      callSites++
      revisados.add(nombre)

      assert.ok(
        RESPONDE_EN_EL_ACTO.some((patron) => patron.test(fuente)),
        `${nombre} llama a ${accion}() y NO tiene señal 1: sin useStepAction()/useTransition() el ` +
          'control no se apaga en el acto y el setter puede tocar dos veces',
      )

      const envoltorio = envoltorioDe(fuente, idx)
      assert.ok(
        envoltorio,
        `${nombre}: la llamada a ${accion}() no está dentro de startTransition()/run()/useAutosave() — ` +
          'sin bloque de transición no hay señal 1 en el acto',
      )

      // Escritura continua: su acuse es el indicador vivo, a nivel pantalla.
      if (envoltorio.tipo === 'autosave') {
        assert.ok(
          /<AutosaveStatus/.test(fuente),
          `${nombre}: ${accion}() autoguarda sin <AutosaveStatus> — el setter no tiene forma de ` +
            'saber si su trabajo quedó',
        )
        continue
      }

      const clave = `${nombre}::${accion}`
      const eximida = EXIMIDAS[clave]
      if (eximida) {
        eximidosVistos.add(clave)
        assert.ok(
          eximida.prueba.test(fuente),
          `${clave} está eximida del anuncio porque «${eximida.motivo}», pero eso ya no es cierto en ` +
            'el archivo: la prueba no matchea. O vuelve al patrón (toast) o se corrige el motivo',
        )
        continue
      }

      const anuncia = ANUNCIA.some((patron) => patron.test(envoltorio.texto))
      const navega = NAVEGA.test(envoltorio.texto)
      assert.ok(
        anuncia || navega,
        `${clave} escribe y NO acusa recibo: en su bloque no hay toast/successToast ni router.push. ` +
          'Ése es el bache que duplicó una postergación (B-B2) — el setter no sabe si quedó, recarga ' +
          'y lo hace de nuevo. Sumá el toast del patrón, o eximila en EXIMIDAS si la pantalla ya lo ' +
          'muestra sola (con el motivo y su prueba)',
      )
    }
  }
}

assert.ok(
  revisados.size >= 15 && callSites >= 20,
  `barrido flaco: ${revisados.size} componentes / ${callSites} call-sites — se esperaban ≥15 y ≥20. ` +
    'El invariante no está viendo la superficie y pasaría en verde sobre casi nada',
)

for (const clave of Object.keys(EXIMIDAS)) {
  assert.ok(
    eximidosVistos.has(clave),
    `${clave} figura en EXIMIDAS pero no se encontró esa llamada — sacala de la lista`,
  )
}

// ── 4. EL PATRÓN ES UNO SOLO, Y ESTÁ DONDE DICE ──────────────────────────────
{
  const hook = readFileSync(join(process.cwd(), 'src', 'lib', 'use-step-action.ts'), 'utf8')
  assert.ok(/useTransition\s*\(/.test(hook), 'el hook del patrón perdió la señal 1')
  assert.ok(/toast\s*\.\s*success\s*\(/.test(hook), 'el hook del patrón perdió la señal 2 (éxito)')
  assert.ok(/toast\s*\.\s*error\s*\(/.test(hook), 'el hook del patrón perdió el aviso de error')

  // La región donde se lee: sonner montado UNA vez en el root layout. Sin esto
  // los toasts no llegan a ningún `aria-live` y las dos señales son una sola.
  const layout = readFileSync(join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8')
  assert.ok(
    /<Toaster/.test(layout) && /from ["']sonner["']/.test(layout),
    'el Toaster de sonner no está montado en el root layout: sin su región aria-live, ningún ' +
      'toast del setter se anuncia y el patrón queda a media máquina',
  )
}

console.log(
  '✓ invariante OK: toda acción que escribe acusa recibo DONDE el setter hizo el clic — las ' +
    `${ACCIONES.size} acciones de _actions/*.actions.ts, en sus ${callSites} llamadas repartidas en ` +
    `${revisados.size} componentes, dan las dos señales del patrón. Se mide por CALL-SITE, no por ` +
    'archivo: cada llamada anuncia (toast/successToast) o navega (router.push) dentro de SU bloque ' +
    'de transición, y el autosave acusa con <AutosaveStatus>. Las 2 eximidas pintan el resultado en ' +
    'el lugar y su prueba sigue matcheando. El patrón es UNO: el hook conserva sus dos señales y el ' +
    'Toaster sigue montado.',
)

/**
 * D5' — Invariante del helper puro maskSecret, consolidado desde 2 copias
 * byte-idénticas (maskFromInput en settings-console.tsx, maskSecret en
 * settings.actions.ts — máscara del token de Telegram, cliente y server).
 * Corre: npx tsx src/lib/mask-secret.invariant.ts (o npm run check:invariant:mask-secret)
 */
import assert from 'node:assert/strict'
import { maskSecret } from './mask-secret'
import { archivosFuente, fuenteDe } from './invariant-call-site.ts'

/**
 * Los dos call-sites que la consolidación reemplazó. Congelados a mano: si
 * aparece un tercero, este censo no lo va a ver — y ese es el trabajo del
 * `no-relaja` de abajo, que barre el árbol entero buscando la máscara escrita
 * de nuevo.
 */
const CONSOLIDADOS: readonly (readonly string[])[] = [
  ['src', 'app', '(protected)', 'admin', 'settings', '_actions', 'settings.actions.ts'],
  ['src', 'app', '(protected)', 'admin', 'settings', '_components', 'settings-console.tsx'],
]

/** La máscara misma: ocho bullets. Es lo que una re-implementación tendría que escribir. */
const MASCARA = '•'.repeat(8)

function run() {
  assert.equal(
    maskSecret('123456:ABCDEF7890'),
    '••••••••7890',
    'token largo: 8 bullets + los últimos 4 caracteres',
  )
  assert.equal(
    maskSecret('abc'),
    '••••••••abc',
    'token corto (<4 chars): slice(-4) devuelve el string completo sin padding — comportamiento preservado de ambas copias originales',
  )
  assert.equal(maskSecret(''), null, 'string vacío -> null (falsy check)')
  assert.equal(maskSecret(null), null, 'null -> null (caso del server, settings.osTelegramBotToken sin configurar)')
  assert.equal(maskSecret(undefined), null, 'undefined -> null')

  // ── P27 — Y QUE LOS DOS CALL-SITES LO USEN ────────────────────────────────
  // Todo lo de arriba ejercita el helper nuevo. El censo de P26 lo listó como
  // sobre-satisfacible por eso: «sólo ejercita el helper nuevo: nada afirma que
  // los DOS call-sites que dice haber consolidado lo importen». La promesa del
  // encabezado no es «esta función enmascara bien» —eso es trivial— sino «hay
  // UNA sola copia de la máscara». Una copia que vuelva a aparecer deja las
  // cinco aserciones de arriba intactas y la consolidación deshecha en silencio.
  for (const partes of CONSOLIDADOS) {
    const fuente = fuenteDe(...partes)
    const ruta = partes.join('/')
    assert.ok(
      /import \{ maskSecret \} from '@\/lib\/mask-secret'/.test(fuente),
      `${ruta} dejó de importar \`maskSecret\` de @/lib/mask-secret. Es uno de los dos ` +
        'call-sites que la consolidación unificó (cliente y server enmascaraban el token de ' +
        'Telegram con copias byte-idénticas): si dejó de importarlo, o la máscara volvió a ' +
        'escribirse a mano acá, o el enmascarado se perdió y el token va entero al cliente.',
    )
    assert.ok(
      /maskSecret\(/.test(fuente.replace(/import \{ maskSecret \}[^\n]*\n/, '')),
      `${ruta} importa \`maskSecret\` pero no lo LLAMA: un import huérfano no enmascara nada.`,
    )
  }

  // Y la máscara vive en UN solo lugar. Barrer por el literal de bullets es el
  // discriminador: cualquier re-implementación tiene que escribirlo.
  const DUEÑOS_DE_LA_MASCARA = new Set([
    'src/lib/mask-secret.ts',
    'src/lib/mask-secret.invariant.ts',
    // Placeholder de un input (no enmascara: es texto de UI). Declarado para que
    // el barrido no lo confunda con una copia, y para que si deja de existir se
    // note en el diff.
    'src/modules/chatbot/components/admin/integrations/CrmConfigForm.tsx',
  ])
  const conMascara = archivosFuente('src').filter((a) => fuenteDe(a).includes(MASCARA))
  assert.ok(
    conMascara.length >= 2,
    `barrido vacío: ${conMascara.length} archivos con la máscara — se esperaban al menos el ` +
      'helper y este invariante. Si el literal cambió de forma, este censo dejó de ver nada ' +
      'y firmaría cualquier copia: arreglalo, no lo borres.',
  )
  for (const archivo of conMascara) {
    assert.ok(
      DUEÑOS_DE_LA_MASCARA.has(archivo),
      `${archivo} escribe la máscara (${MASCARA}) y no es ninguno de los dueños declarados.\n` +
        '  Eso es la consolidación deshecha: volvió a haber más de una copia de la máscara, y\n' +
        '  las copias divergen (fue exactamente el punto de partida de D5′). Si el archivo\n' +
        '  necesita mostrar bullets como PLACEHOLDER de UI —no enmascarar—, sumalo a\n' +
        '  DUEÑOS_DE_LA_MASCARA con esa aclaración; si enmascara, usá `maskSecret`.',
    )
  }

  console.log(
    '✓ mask-secret invariant OK — mismo output que maskFromInput/maskSecret originales, ' +
      'los dos call-sites consolidados lo importan y lo llaman, y la máscara sigue teniendo ' +
      'una sola copia en el árbol.',
  )
}


run()

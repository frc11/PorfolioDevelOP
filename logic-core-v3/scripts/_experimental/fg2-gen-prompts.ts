/**
 * 🧪 EXPERIMENTAL / DESCARTABLE — FG-2.0.
 *
 * Genera el doc con los 10 prompts del experimento (5 A = formulario, 5 B =
 * a-mano) desde la única fuente: CASOS_GASTRO + assembleGastroPrompt. Volcado:
 *
 *   npx ts-node --transpile-only scripts/_experimental/fg2-gen-prompts.ts > docs/experimentos/fg2-prompts-listos.md
 *
 * Imports relativos a propósito (sin alias @/) para que ts-node lo resuelva sin
 * tsconfig-paths. Borrar junto con el resto del prototipo tras la decisión.
 */
import { assembleGastroPrompt, estimarCostoPrompt } from '../../src/lib/leados/_experimental/fg2-brief-lab.ts'
import { CASOS_GASTRO } from '../../src/lib/leados/_experimental/fg2-casos-gastro.ts'

const ORIGEN_LABEL: Record<string, string> = {
  'seed-real': 'Real — ficha cargada en un seed del repo (verbatim).',
  'seed-lead': 'Lead real del seed; contenido de ficha representativo (el seed no lo carga).',
  representativo: 'REPRESENTATIVO — arquetipo realista, NO un cliente real.',
}

const out: string[] = []
const w = (s = '') => out.push(s)

w('# FG-2.0 — Los 10 prompts del experimento, listos para pegar')
w()
w('> 🤖 **Generado** por `scripts/_experimental/fg2-gen-prompts.ts` desde `CASOS_GASTRO`.')
w('> No editar a mano: si cambia un caso, regenerá con el comando del encabezado del script.')
w('>')
w('> **Cómo se usa:** por cada negocio hay un prompt **A (formulario)** y un prompt')
w('> **B (a mano)**. Pegá uno por vez en Claude Design, generá, cronometrá, mirá la')
w('> demo y registrá calidad + costo. El paso a paso está en `fg2-brief-experimento.md`.')
w('>')
w('> ⚠️ Los WhatsApp son números de ejemplo: la calidad de la demo no depende del')
w('> dígito. Reemplazalos por el real solo si querés probar que el link abre el chat.')
w()
w('---')
w()

CASOS_GASTRO.forEach((caso, idx) => {
  const n = idx + 1
  const promptA = assembleGastroPrompt(caso.input)
  const costoA = estimarCostoPrompt(promptA)
  const costoB = estimarCostoPrompt(caso.promptLibre)

  w(`## Negocio ${n} — ${caso.input.nombre} (${caso.input.zona})`)
  w()
  w(`- **Procedencia:** ${ORIGEN_LABEL[caso.origen] ?? caso.origen}`)
  w(`- **Nota de datos:** ${caso.nota}`)
  w(`- **Decisiones del formulario:** estilo \`${caso.input.estilo}\` · tono \`${caso.input.tono}\` · CTA \`${caso.input.cta}\` · ${caso.input.secciones.length} secciones`)
  w()
  w(`### A${n} · Prompt del FORMULARIO (~${costoA.tokensEstimados} tokens, ${costoA.palabras} palabras)`)
  w()
  w('```text')
  w(promptA)
  w('```')
  w()
  w(`### B${n} · Prompt LIBRE / a mano (~${costoB.tokensEstimados} tokens, ${costoB.palabras} palabras)`)
  w()
  w('```text')
  w(caso.promptLibre)
  w('```')
  w()
  w('---')
  w()
})

w('_Fin de los 10 prompts. El experimento NO se corrió: el gate de FG-2 sigue abierto._')

process.stdout.write(out.join('\n') + '\n')

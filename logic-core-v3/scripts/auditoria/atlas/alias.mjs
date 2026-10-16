// Atlas — resuelve un id de nodo citado (en un hallazgo, una tarjeta o a mano) al nodo real de atlas.json:
// 1) si es nodo, queda igual; 2) si está en 06-ATLAS/alias.json (curado), su destino; 3) si no, el prefijo existente
// más largo (lib.chatbot.avatar → lib.chatbot); 4) si nada existe, null. Portable: solo Node nativo.
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

export function cargarAlias(dirAtlas) {
  const f = path.join(dirAtlas, 'alias.json')
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).alias ?? {} : {}
}

export function resolverNodo(id, ids, alias) {
  const x = String(id ?? '').replace(/`/g, '').trim()
  if (!x) return null
  if (ids.has(x)) return x
  if (alias[x] && ids.has(alias[x])) return alias[x]
  const partes = x.split('.')
  for (let i = partes.length - 1; i > 0; i--) {
    const p = partes.slice(0, i).join('.')
    if (ids.has(p) && !/^(lib|int|doc|modelo|rama)$/.test(p)) return p
  }
  return null
}

export const resolverLista = (lista, ids, alias) => [...new Set((lista ?? []).map((n) => resolverNodo(n, ids, alias)).filter(Boolean))]

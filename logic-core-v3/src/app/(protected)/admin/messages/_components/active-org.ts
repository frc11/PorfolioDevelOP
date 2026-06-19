// Deriva el orgId activo del pathname (/admin/messages/<orgId>). La lista vive en
// un layout persistente que NO recibe el param, así que tanto la lista (highlight
// + badge optimista) como el shell (responsive índice vs detalle) lo leen del
// pathname desde un único lugar. Índice y trailing-slash devuelven null.
export function activeOrgIdFromPath(pathname: string): string | null {
  const prefix = '/admin/messages/'
  if (!pathname.startsWith(prefix)) return null
  const rest = pathname.slice(prefix.length)
  if (rest.length === 0) return null
  const segment = rest.split('/')[0]
  return segment && segment.length > 0 ? segment : null
}

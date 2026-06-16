/**
 * Clave canónica para comparación/dedup de ubicaciones: lowercase + sin diacríticos
 * (NFD + elimina marcas combinantes, Unicode-safe) + trim + espacios colapsados.
 *
 * "San Miguel de Tucumán", "san miguel de tucuman" y "SAN MIGUEL DE TUCUMAN"
 * producen la misma clave → son tratadas como la misma ubicación.
 */
export function normalizeZone(zone: string): string {
  return zone
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

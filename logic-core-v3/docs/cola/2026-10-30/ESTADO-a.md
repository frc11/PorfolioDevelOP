# ESTADO · carril A (L7, 2026-10-30)

Rama `l7/a`, worktree `C:\nocturno\cola3`, dev :3002. Un lote: L7a (las tres páginas de servicio).

| Lote | Modelo | Estado | Commits | Resultado |
|---|---|---|---|---|
| L7a | Opus alto | cerrado | 72ac5e3b..HEAD | L7a-resultado.md |

## Para el carril B (leer antes de mergear)
- **La intro de las páginas es de la base y L7a la acortó:** `PANTALLAS_DE_LA_INTRO` 2,5 → 1,8 y `TRAMO_DEL_TITULO` 1,6 → 1,4
  (`_lib/escena/ruta/pistaDeLaIntro.ts`, s78-b12a a la spec). Vale para todas las páginas (Nosotros, Portfolio, Blog). Si el carril B
  cambió lo mismo con otros números, el merge choca en esas dos líneas: gana uno, y el tramo del título tiene que pasar de 1,2.
- `SERVICIOS` de `acento.ts` dice «Integraciones con IA»; el desplegable de la navbar dice «Desarrollo web» e «Integraciones con IA».
- El pie (links a las páginas) es de L7d: L7a no lo tocó.

## L7-INT (2026-10-30, sobre el merge de l7/b, aa6be5b0)
- Cerrado: fuentes 3D con la unión de títulos (sin cambios de bytes), IdDePagina coherente, intro de 1,8 bien en las páginas de B. Arreglados: el pie con los nombres viejos de los servicios (INT-1), el `nav` del pie adentro del `main` (INT-2), s10-acceso y s8-chrome a la spec de L7d (INT-3). s6/s76/s77 ya estaban rojos en `rediseno/home`. Build de producción limpio. Ver `L7-INT-resultado.md`.

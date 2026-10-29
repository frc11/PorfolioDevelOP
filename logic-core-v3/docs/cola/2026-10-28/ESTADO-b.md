# ESTADO-b · carril b de la cola 3 (rama `cola3b/2026-10-28`, worktree `C:\nocturno\cola3b`)

| Lote | Estado | Commits | Resultado |
|---|---|---|---|
| L6 | terminado (3 decisiones frenadas para Valentino: D1 cierre de sesión, D2 error de Google, D3 el mail de recuperación) | 8732d787 … (ver `git log`) | `L6-resultado.md` |
| L5 | terminado (nada frenado; lo que tiene que mirar Valentino, en el resultado) | d3cafeb8, 469af329, c0b4e61e, 594dc704, 9912f6b7 | `L5-resultado.md` |

## Notas
- L5: la corrida posterior a la revisión esperó el candado (lo tuvo L2 del carril a de 18:20 a la noche); se corrió el 29/10 con 1,5 GB libres: tsc 0, s83 149/0, s88 30/0, lint limpio.
- El primer commit de L6 (`8732d787`) arrastró tres borrados que ya estaban en el índice (`FlechaDelSonido.tsx`, `trazado.ts`, `titulos-de-pagina/page.tsx`): el mensaje habla sólo del ítem 5. El árbol final es el que cuenta.
- El login real se prueba con `NEXTAUTH_URL` pisado por entorno al puerto del dev (el `.env.local` lo manda al 3000).

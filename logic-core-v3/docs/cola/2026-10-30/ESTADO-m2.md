# ESTADO · carril M2 (blog, nota, 404)

- 11:50 · arranque en `m/2` desde `3d89b628`. Sin fotos del blog en `l7-assets` → placeholders. Plan en `M2-plan.md`.
- 12:05 · construido y commiteado (bd6d4fb3); m2-blog 59/0; eslint limpio. Esperando el candado (L7g lo tiene desde 10:05, su :3002 responde).
- 12:54–12:55 · candado (tras L7g y M3). `tsc --noEmit`: 54 errores, TODOS de tipos generados viejos en `.next/dev/types` que apuntan a `laboratorio/` (de un dev anterior de este worktree con `l7/lab`); 0 en `src/`. Se cortó por límite de uso.
- PENDIENTE: borrar `.next/dev/types` y repetir tsc; `npm run build`; dev :3004 + `scripts-carga/m2-blog.ts` a 1440/1024/768/390 (y `REDUCIDO=si`, `HILO=barra`); revisión independiente; `M2-resultado.md`; push de `m/2`. Nada de esto corrió: el lote está SIN VERIFICAR en el navegador.

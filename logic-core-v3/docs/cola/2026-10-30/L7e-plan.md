# L7e · plan (lane C, el laboratorio)

Rama `l7/lab`, worktree `C:\nocturno\cola3c`, dev en el puerto 3004. Escribo sólo en `src/app/v3/laboratorio/**`, `docs/ideas/**`,
`public/v3/laboratorio/**` y, porque el lote lo pide por nombre, en los archivos de estado de esta lane (`ESTADO-c.md`, este plan,
`L7e-resultado.md`, `L7e-TERMINADO`): archivos nuevos que nadie más escribe, así que no chocan en el merge (decisión L7e-1).

## Pasos y cuándo cuentan como hechos
1. **VOZ-DEL-SITIO.md** — el inventario del home con nombres del código, tiempos y curvas leídos de las constantes (y medidos en el
   navegador donde la constante no alcanza), las reglas que se infieren, lo que nunca hace, lo que le falta y dónde se repite. Hecho cuando
   cada efecto citado tiene su `archivo:línea`.
2. **MOMENTOS.md** — 2–3 momentos por página (tres de servicio, Nosotros, Portfolio, Blog, la nota, legales, 404), cada uno con: qué ve,
   por qué es de esa página, de qué mecánica del home deriva, costo, riesgo. Ranking propio al final.
3. **Prototipos** — 8 a 12 rutas en `/v3/laboratorio/<slug>` + índice `/v3/laboratorio`. Cada una: importa piezas del home (nunca copia),
   leyenda en pantalla, sin errores de consola a 1440 y 390, sin dependencias nuevas. Commit después de cada una.
4. **COMO-MIRAR.md** (castellano) — recorrido de ~20 min, los que creo primero. Capturas 1440 y 390 en
   `C:\nocturno\cola3-fotos\L7\laboratorio\`.

## Gate
- `tsc --noEmit` sin errores nuevos (con `NODE_OPTIONS=--max-old-space-size=4096`), contra la base de esta rama.
- `eslint` sobre `src/app/v3/laboratorio/**`.
- Cada ruta carga a 1440 y 390 sin errores de consola; el índice enlaza a todas.
- Sin suites, sin build (lo dice el lote).

## Implicancias
- Las rutas nuevas viven bajo el layout de /v3: heredan la escena, la barra, el preloader y el velo. Hay que saber qué hace la escena en
  una ruta sin preset (lo mapea un Explore) antes de construir.
- Hay invariantes que recorren `src/app/v3/**` (frontera de S3, padrón de tokens, Tailwind que escanea todo): un prototipo puede romper
  una suite ajena sin tocarla. Clases arbitrarias: mínimas, y nunca deletreadas en comentarios.
- `noindex` en todas; nada fuera de `laboratorio/` importa de `laboratorio/`.

## Premortem
«A la mañana el laboratorio no sirvió»: (a) prototipos que no se mueven o que se ven como el home con otro texto → elijo los que sólo se
juzgan viéndolos; (b) una ruta rompe el build o una suite ajena por una clase arbitraria o un `.css` importado → nada de `.css` propio,
estilos con tokens y `style` inline sólo donde un valor es dinámico; (c) el lock retenido y las otras lanes trabadas → tomo el lock sólo
para tsc/dev/Chrome, en ráfagas; (d) la noche se corta sin commits → commit por prototipo y `ESTADO-c.md` al día; (e) Chrome se come la
memoria → lo cierro al terminar cada ráfaga.

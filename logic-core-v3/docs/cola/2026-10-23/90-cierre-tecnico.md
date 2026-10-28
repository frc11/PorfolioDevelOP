# 90 · El cierre técnico de la corrida

La hace el orquestador (o un subagente **sonnet** para las partes mecánicas), al final, con todo lo demás integrado.

## 1. El `next build` (lo que no corrió la otra noche)
- **Uno solo, en la integración, dentro del turno**, con el dev y Chrome cerrados y `NODE_OPTIONS=--max-old-space-size=6144`. Si se corta por memoria, reintentá una vez con el resto de la máquina libre; si vuelve a caer, anotalo y seguí.
- Con el build en `next start` (puerto 3000), medí lo que quedó pendiente:
  - la vía del velo hacia el home (cuál queda por defecto);
  - los 404 del barrido;
  - el fundido del login a 390 (objetivo ~200 ms);
  - el tiempo de formación de las grietas en el home (objetivo 1,5 s);
  - la velocidad de la píldora en las 4 vías de `velo.ts` (tope 3,96 px/ms);
  - el costo por cuadro de la escena en reposo y en las secciones nuevas.

## 2. Las matrices completas
- La matriz entera de escritorio y la del teléfono (390, 768 y 820×1180), contra el build.
- `npm run verificar`: comparado afirmación por afirmación contra la base (los grupos s1, s2, s3, s4, s5, s7, s8 y s17). **Cero fallas nuevas.**

## 3. Los controles ciegos del reporte anterior
Hacé que fallen de verdad cuando tienen que fallar (no solo "verde"):
- `preloader.ts` `CONTROL=en-recargas` (si lo hizo la 81, confirmalo);
- `viaje.ts` `CONTROL=sin-tapar`;
- `aro-legibilidad.ts`, el control al 30 %.

## 4. La skill `pagina-home-based`
Quedó vieja: su `CONTRATO.md` dice «el viaje todavía no construido» y «el pie provisorio». Actualizala con lo construido (el viaje, el cierre B13, el FAQ, las grietas nuevas, las piezas compartidas de la cola 2 y `B12a-API.md`), sin cambiar las reglas.

## 5. Limpieza
- Borrá `.next-b12` si sigue (ignorado por git).
- Los worktrees de las tareas integradas, borrados; sus ramas locales, borradas si están mergeadas.

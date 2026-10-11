# SPRINT PULIDO 17 — El plasma, de nuevo y en serio

Rama `rediseno/home`. Invariante nuevo: `npm run test:s68-pulido-17` (`src/app/v3/_lib/__tests__/s68-pulido-17.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base) y `~/.cache/b4-medicion/pulido-17/_scripts/` (los de este sprint).
Recibos: `docs/rediseno/entregas/pulido-17/`. Referencias: `docs/rediseno/REFERENCIAS-PLASMA.md`. El modelo: `docs/rediseno/PLASMA.md`.

Decisiones del humano (no se discuten):
- Nosotros queda como está (el plano a 0,8 que sigue el 70 % del giro). Se BORRA `?nosotros=fijo` («está re alejado»).
- El plasma de PULIDO 16 (átomos con órbitas, iones, electrones con estela, moléculas con resorte) NO gustó («tiene una forma muy
  definida, tampoco para tanto»). Se borra con su código. Se borran también `?plasma-sonido`, `?plasma-color` («sin sonido ni
  color, descartado») y `?plasma-campo`, con su código (y la chispa del sprite de sonido).
- Lo que SÍ le encantó: el plasma de PULIDO 15 (cargas sueltas + arcos, `ca63ff21`) y `plasma-y-polvo`. Ese es el espíritu, llevado
  a otro nivel: «algo un poco menos nítido, menos formado; que no sean literalmente átomos, que sean partículas de energía que
  brillan, vibran, se mueven». Monocromo (el de la escena), sin sonido.
- El polvo sigue siendo el default del sitio hasta que el humano apruebe. `lente.ts` (sólo fin de línea) fuera de los commits.

El humano no está: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Árbol limpio (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 80,5 GB libres; 6,8 GB de memoria disponibles; no paginado
  936 MB. Sin dev server, sin servidor de medición, sin Chrome del banco, sin `.next-probe`.

### O1 · Borrar `?nosotros=fijo`
- HECHO · VISTO: en la primera tanda del banco (la bandera pedida tiene que dar lo mismo que el producto).
- `PLANO_DE_NOSOTROS` es un solo plano (`{ alejamiento: 0.8, parteDelMouse: 0.7 }`); los dos títulos de Quiénes somos lo piden sin
  elegir (`...PLANO_DE_NOSOTROS`; `planoDeNosotros()` y la lectura del entorno se fueron); `nosotros` salió de `Pruebas`, de
  `PRUEBAS_APAGADAS`, de `PRUEBAS_SUELTAS` y del traductor.
- Tests: s67 (N1) afirma lo mismo del plano que queda (el modelo, lo medido, el cableado), sin la otra lectura ni su bandera; s41 y
  s52 (NOCTURNO FINAL) clavaban el texto de las dos llamadas: aceptan el nuevo, con lo demás igual; s52 (PULIDO 1) ya no la pide.
  s68 · O1: la bandera no vuelve (ni suelta ni en el pedido) y la sección no elige, con sus controles positivos.
- Compuerta: tsc en verde; lint de los tocados sin errores (los 3 avisos de `equipo.tsx` son imports sin usar de antes); las 46
  suites que leen lo tocado, en verde.

### O2 · Investigar y proponer (REFERENCIAS-PLASMA.md, tres direcciones)
- PENDIENTE.

### O3 · Borrar el plasma de PULIDO 16 y construir las tres direcciones (`?plasma=a|b|c`)
- PENDIENTE.

### O4 · Mirar, criticar, iterar (el banco de secuencias)
- PENDIENTE.

### O5 · Elegir, medir (en frío y en caliente), el modelo y el invariante
- PENDIENTE.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 80,5 GB | 6753 MB | 936 MB | |

## Crítica (lo que el banco mostró y qué se hizo)

(se completa con cada tanda)

## Lo que no quedó bien

(se completa al final)

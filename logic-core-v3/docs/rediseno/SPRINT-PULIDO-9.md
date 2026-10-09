# SPRINT PULIDO 9 — el polvo que no se levanta y los estados de envío de los dos formularios

Rama `rediseno/home`. Invariante nuevo: `npm run test:s60-pulido-9` (`src/app/v3/_lib/__tests__/s60-pulido-9.invariant.tsx`).

Aprobado por el humano: PULIDO 8 («HABLANOS» tocable y con su subrayado).

## H1 · El polvo se posa y no se vuelve a levantar

### La causa

No era un estado del golpe, del final, del pie ni de un viaje. Era el cableado entre la máquina de la quietud (`posarse.ts`) y la
simulación (`simulacion.ts`), en `Fisica.tsx`:

- La simulación levanta lo posado con un frente que sale del origen del despertar a 16 u/s (`despierta` en el shader: la mota se
  levanta si el despertar es posterior a cuando se soltó y el frente ya llegó a ella).
- La escena le pasaba ese despertar sólo si era el último y había encontrado el polvo posado (más de `empiezaS` de quietud). Si no,
  le pasaba un despertar de nunca (−1e9).
- Con la rueda, cada muesca llega después de la quietud mínima (`quietudS`, 0,25 s) y antes de `empiezaS` (4 s): es un despertar
  nuevo, sin polvo posado. Pasaba el −1e9 y apagaba el frente de la muesca anterior.
- Lo que ese frente todavía no había alcanzado (todo lo que estaba a más de ~10 u del origen) quedaba en el piso hasta otra quietud
  de más de 4 s. Y con esa quietud lo levantado se volvía a posar.

Un segundo estado sin salida: la mota levantada cuyo lugar en el aire está cerca de las caras de la caja (`cercaDeLasCaras`) sólo
dejaba de estar levantada al volver a posarse. Mientras hubiera movimiento seguía levantada, más visible que el polvo suspendido
(en el aire, cerca de las caras, la caja la apaga porque ahí se repite).

### El arreglo

- **`posarse.ts`:** el frente que levanta lo posado (`FrenteDelPolvo`, `tomarElFrente`) es el del último despertar que encontró el
  polvo posado, con su origen y si fue del cursor.
- **`Fisica.tsx`:** la simulación lee ese frente. Un despertar corto ya no lo apaga. El remolino sigue siendo sólo del despertar
  que encontró el polvo posado.
- **`simulacion.ts`:** la levantada de cerca de las caras, cuando llegó, baja su peso hasta como el aire la dibuja ahí (el fundido
  de salida, 1,5 s) y recién entonces es del aire, sin salto. Con la quietud se posa antes, como siempre.

### Medido en el banco (Portfolio de noche, 1440, `h1-polvo.ts`)

Quieto 14 s (todo en el piso), después 15 s de rueda (una muesca de 60 px y 500 ms de pausa), después quieto.

| | Antes | Ahora |
|---|---|---|
| En el piso durante la rueda | 11.810 de 14.000, los 15 s | 0 a los 2 s |
| Levantadas a los 15 s de rueda | 352 (y 11.810 en el piso) | 0: las 14.000 en el aire desde los 9 s |
| Con scroll continuo (6 px cada 50 ms), levantadas a los 15 s | 4.608 (con el mouse, 5.298) | 0: las 14.000 en el aire desde los 8,5 s |
| Quieto otra vez | se posa | se posa: es reversible |

### El invariante (`s60` H1)

1. Simula posarse (15 s quieto), la rueda (una muesca de 0,1 s cada 0,6 s) y a los 10 s compara la altura media y la dispersión
   con las del polvo suspendido (±0,3). Otra vez quieto se posa y con la rueda vuelve. Usa la máquina de la quietud real y las
   reglas del shader con sus constantes.
   - Control positivo: el cableado de antes falla (lo lejano queda en el piso).
2. El cableado de `Fisica.tsx` y la regla `despierta` del shader son los del modelo (por texto, con control).
3. La levantada de cerca de las caras vuelve al aire apagándose (por texto, con control).

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- s53 a s59, verdes. `s60` 7/0.
- También verdes: s30, s31, s32, s33, s34, s35, s41, s42 y s52, que leen los archivos del polvo.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s41` B3 · el estado recuerda de dónde salió el despertar | `p.remolino = despertar.delCursor ? 1 : 0` | `p.remolino = m.frente.delCursor ? 1 : 0`, y el frente copia `delCursor` del despertar (`f.delCursor = e.delCursor`) | El remolino es el del frente, que es ese despertar mientras no haya otro con polvo posado. Lo que fija, igual |
| `s34` B4 · cada salida de la simulación escribe el modo con su peso | 9 escrituras de `salida0` | 11 | Las dos de la vuelta al aire de cerca de las caras. Las dos escriben el modo con su peso (`modoConPeso`), que es lo que fija |

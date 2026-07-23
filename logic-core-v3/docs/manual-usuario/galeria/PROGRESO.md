# PROGRESO — corrida M0 (galería de estados del Panel del Setter)

Archivo de reanudación. Si esta corrida se corta, la próxima **lee esto primero**
y retoma donde quedó. No rehacer etapas marcadas CERRADA.

---

## Terreno (FASE 0)

- Rama `main`, HEAD al arrancar `6a88cbe` (sprint 6.2).
- **Sprint 6.2 SÍ está en el log** → los estados de m16 con horarios ofrecidos son enumerables y alcanzables.
- `npx tsc --noEmit` → **exit 0**.
- `npm run build` → **exit 0** (compiló en 68s).
- Sucio al arrancar: solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno). **No se toca, no se stagea.**

## Estado de las etapas

| Etapa | Estado | Nota |
|---|---|---|
| 0 — Terreno | CERRADA | tsc y build verdes |
| 1 — Enumeración | CERRADA | 36 estados desktop + 4 mobile en `INDICE.md` |
| 2 — Sembrador | pendiente | |
| 3 — Captura | pendiente | |
| 4 — Índice final e inalcanzables | pendiente | |

## Decisiones tomadas

1. **Nomenclatura de los estados**: `NN-nombre-del-estado` estable entre corridas — el número es el orden del índice, el nombre es el del estado en `INDICE.md`.
2. **Enumeración por variación, no por pantalla**: el registro `PANTALLAS` tiene 20 ids, pero el manual necesita las variaciones (cadencia viva vs agotada, mr N°1 vs N°2, m16 virgen/ofrecidos/agendada, tilde habilitado vs no). Por eso 36 estados sobre 20 pantallas.
3. **Aislamiento del sembrado**: se reusa el prefijo/patrón de los fixtures existentes (`tests/helpers/setter-db.ts`) — leads namespaced con prefijo identificable, owned por el setter de prueba, teardown por id exacto. Nada destructivo, nunca `migrate reset`.

## Pendientes / hallazgos abiertos

- (se completa al cerrar cada etapa)

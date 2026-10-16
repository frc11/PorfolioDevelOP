# Atlas de develOP — la puerta de entrada

> El mapa del sistema como datos (`atlas.json` + `atlas.curado.json`), con vistas `.md` que se generan desde ellos. Base: `origin/main` @ `57c421bc`. **Primera versión (F5).** Los enlaces «quiero hacer X → tarjeta» se completan cuando exista `07-BACKLOG.md` (F6.4), y F7 los valida.

## Quiero…

| Quiero… | Andá a |
|---|---|
| entender el sistema en cinco minutos | [arquitectura.md](arquitectura.md) |
| saber si una ruta exige sesión, qué rol y si filtra por organización | [rutas.md](rutas.md) |
| ver una tabla, sus relaciones y quién la lee o la escribe | [datos.md](datos.md) |
| saber qué se rompe si toco un módulo | [dependencias.md](dependencias.md) y la ficha del módulo |
| arrancar a trabajar en una pantalla o herramienta | la ficha en [modulos/](modulos/) (sección «Por dónde empezar») · índice abajo |
| saber qué ramas tienen trabajo sin mergear | [ramas.md](ramas.md) |
| saber qué está roto o pendiente en un módulo | su ficha (hallazgos vinculados), y `02-PENDIENTE.md` / `03-MEJORAS.md` |
| saber si puedo tocar un archivo congelado o de Franco | [../11-CONGELADOS.md](../11-CONGELADOS.md) y [../09-PARA-FRANCO.md](../09-PARA-FRANCO.md) |
| saber qué credencial vence y cómo se renueva | `01-INVENTARIO.md` §6.1 |
| decidir qué entra en la 1.0 | `atlas.curado.json` (`alcance`; la auditoría solo propuso `alcance_propuesto`) |
| regenerar todo esto después de un merge | [regenerar.md](regenerar.md) |

## Los datos

| Archivo | Qué es | Quién lo escribe |
|---|---|---|
| `atlas.schema.json` | El contrato (schemaVersion 1) | a mano |
| `atlas.json` | Nodos (áreas, herramientas, funcionalidades, libs, modelos, integraciones, ramas, docs) y aristas (contiene, importa, usa-modelo, llama-api, dispara, depende) | `generar.mjs` |
| `atlas.curado.json` | Madurez, veredicto, alcance y decisiones por nodo | personas (nunca un generador) |
| `funcionalidades.json` | Las 445 funcionalidades, la unidad de madurez | personas (sembrado por la auditoría) |
| `zonas.json` | Congelados y zona de Franco | personas |
| `entradas.json` | Auth, rol, tenant y validación de cada entrada, con evidencia | personas (sembrado por la auditoría) |
| `hallazgos.json` | Los hallazgos de 02/03/04/05/10 | `validar.mjs --emitir` |
| `historial.jsonl` | Una línea por corrida del generador: la curva de progreso | `generar.mjs` |

**Métrica de progreso** (la calcula un visor futuro; acá quedan los datos):
1. **Avance 1.0** = funcionalidades con `alcance: 1.0` y madurez ≥ L3, sobre las que tienen `alcance: 1.0`.
2. **Trabajo restante** = suma de tamaños de las tarjetas abiertas de nodos 1.0.
3. **Barrera** = cero CRÍTICA o ALTA abiertas en nodos 1.0.

## Módulos

El índice con dueño, madurez calculada, hallazgos y alcance propuesto está en [_indice-modulos.md](_indice-modulos.md). La madurez de una herramienta se calcula desde sus funcionalidades, nunca se carga a mano.

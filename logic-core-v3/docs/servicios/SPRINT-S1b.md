# SPRINT S1b — Template, bloques y ruta de /v3/paginas-web + medición de la escena

Borrador de trabajo · 2026-10-17 · Autor: CC (S1b) · Plan: `docs/servicios/SPRINT-S0.md` v2 (§3, §4, §7, §8, §10 y §12) · Contenido: `docs/servicios/SPEC.md` §5 y §7.1 · Pendiente heredado: `docs/servicios/SPRINT-S1a.md` §7.

Este archivo se completa al cierre del sprint. Lo que está acá abajo es lo que ya se decidió y no se puede perder.

---

## 0. Cambios del contrato v2 (reemplazan a D5 del plan)

Llegaron con el prompt del S1b ya pegado: el home publicó la v2 del contrato. Pisan lo que diga el prompt y el plan.

| # | Qué cambia | Cómo queda en el S1b |
|---|---|---|
| **P-S1** | `data-servicio` sale. | El CTA lleva **solo** `data-abre-contacto="panel"` y `data-precarga={idEnElHome}`. `data-servicio` queda **prohibido en toda la página** (es el contexto del acento del tema, con otro vocabulario). Reemplaza a D5 (que pedía los tres atributos). El acento llega solo por la custom property `--color-acento` en la raíz. |
| **P-S2** | Candado compartido `C:\develop-pesado.lock`. | Antes de cada proceso pesado (tsc completo, dev server, `verificar`, build): si existe y tiene menos de 3 h, se espera revisando cada 2 min hasta 20 min; si sigue, se reporta y se para. Si no existe o tiene más de 3 h, se escribe con «servicios», la tarea y la hora. Después, 3 GB libres o más; si no hay, se borra el candado y se para con «VERIFICAR TRAS REINICIO». Se borra al terminar, también si falla. El dev server lo retiene mientras esté prendido: en el FRENO queda puesto y se borra al apagar el dev, después del commit. |
| **P-S3** | La escena sale como tabla para el LOG. | Métrica · `/v3/paginas-web` · `/v3/tipografia`, a 1280 y a 390. Son el «antes» de P-H4. |
| **P-H4 y P-H6** | Ya aceptados para el sprint P-H del home. | La tapa queda igual, como red de seguridad. En 390 se anota cómo abre el modal; no hace falta abrir pedido. |

### Tests que cambian por P-S1

- El chequeo del CTA pasa a «lleva `data-abre-contacto` y `data-precarga`». Control: sin `data-precarga`.
- Se suma «no hay `data-servicio` en ninguna parte del marcado». Control: un `data-servicio` armado se detecta.

### El candado, como lo usa el home

Es un **directorio**, no un archivo: `C:\develop-pesado.lock\` con un `candado.txt` adentro (`worktree`, `tarea`, `hora`). Crear el directorio es atómico, así que se toma con `mkdir` y no con una escritura. Servicios usa la misma forma.

Estado al empezar el S1b (18:37): lo tenía el home, con `B1.2b - npm run verificar completo (arrancado 18:31, antes de la regla del candado)`.

### Algo pesado que corrió sin candado

El **tsc completo del Paso 0** (2026-10-17 ≈18:32, 18 s, con 4,6 GB libres y el pool no paginado en 608 MB) corrió **antes de recibir P-S2** y por lo tanto sin candado. Coincidió con el `verificar` del home, que había arrancado a las 18:31: **hubo dos procesos pesados a la vez entre los dos worktrees**, que es lo que la regla viene a evitar. Antes de lanzarlo miré los procesos por línea de comando y no vi ninguno pesado (los `node` de la lista eran los permanentes de `chrome-devtools-mcp`; el `verificar` recién arrancaba y no estaba entre los 15 de más memoria). Sin consecuencias visibles: el tsc terminó con 0 errores y la memoria no bajó de lo seguro. Queda dicho.

---

## 1. Paso 0 — el tsc completo del S1a

**Cerrado: 0 errores.** `node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit` salió con código 0 y sin una sola línea de salida, en 18 s (incremental: el `tsconfig.tsbuildinfo` que escribió lista los 11 archivos de `_servicios/`, o sea que los chequeó). La salida está en `C:\paginas-servicios-datos\tsc-S1b.txt` (vacía). Anotado también en `SPRINT-S1a.md` §4 y §7.

# Manifiesto — Diagnóstico visual del Panel del Setter (LeadOS)

> Generado POR la corrida, no escrito a mano. Cada fila sale del DOM y del PNG,
> no de mirar la imagen. Esta carpeta es **diagnóstico descartable**: no reemplaza
> a `docs/manual-usuario/galeria/`, que no se tocó.

## Cabecera

| | |
|---|---|
| Base (commit) | `cbfaa27f14121a294b7ad72565ab361072ecb166` — `leados/v1-integracion` |
| Worktree | `C:/tmp/wt-v1-integracion` (reusado; es el worktree de la rama base) |
| Build | producción, `E2E_DIST_DIR=.next-corrida-visual`, exit 0 |
| Puerto | `127.0.0.1:3021` (propio; no 3000/3001/3003/3004/3005/3006/3013) |
| Viewport | **1440 × 900**, desktop, `deviceScaleFactor: 1` — un solo ancho |
| Login | JWT minteado client-side, igual que `tests/helpers/setter-auth.ts` |
| Estado de datos al capturar | 76 leads del setter · novedades 3 total / 3 sin leer / 0 huérfanas |
| Animaciones | congeladas por CSS inyectado post-carga (no se tocó fetch) |

### Cómo se esquivó la trampa del fold

El shell es `fixed inset-0` y el scroller es el `<main>` interno
(`setter-shell.tsx:78`), así que `fullPage: true` capa la captura. **No se usó
`fullPage` en ninguna toma.** Para las `-full` se midió el alto real del `<main>`
y se agrandó el *viewport* a ese alto, de modo que el contenedor deja de scrollear
y entra entero en una toma normal. Las dimensiones de cada PNG se leen del **IHDR**
del archivo, no de lo que se pidió.

## Los tres chequeos obligatorios

**1 · md5 duplicados** — colisiones inesperadas: **0**.

Colisiones esperadas y declaradas (el «antes» de un par ES la pantalla limpia ya
capturada; su identidad byte a byte prueba que el render es determinista — es lo
contrario del bug de la galería, donde dos archivos decían mostrar cosas distintas):

- `01-panel-foco-full.png` ≡ `PAR-1-saltar-antes.png`
- `25-m14-gate-abierto-full.png` ≡ `PAR-3-enviar-a-revision-antes.png`

**2 · Cobertura de los 15 pasos** — cubiertos 15/15.
Sin huecos de pantalla.

**3 · `-full` con altura de viewport en pantalla que scrollea** — **0**.
Ninguna captura quedó capada por el fold.

## Cobertura por pantalla

| paso | capturas |
|---|---|
| `m1` | `07-m1-ficha-incompleta.png`, `08-m1-ficha-cargada.png` |
| `m2` | `09-m2-evaluacion-pendiente.png`, `10-m2-veredicto-descartado.png` |
| `m4` | `11-m4-opener-postergado-vencido.png`, `12-m4-opener-postergado-futuro.png` |
| `m5` | `13-m5-toque-vencido-fold.png`, `13-m5-toque-vencido-full.png`, `14-m5-cadencia-agotada.png`, `15-m5-post-opener.png` |
| `m6` | `16-m6-brief-abierto.png`, `17-m6-brief-guardado.png` |
| `mc1` | `18-mc1-municion-fold.png`, `18-mc1-municion-full.png`, `19-mc1-desde-brief.png` |
| `mc2` | `20-mc2-refinar.png` |
| `m13` | `21-m13-con-url.png`, `22-m13-virgen.png`, `23-m13-congelada-rechazada.png`, `24-m13-error-sin-confirmar.png` |
| `m14` | `25-m14-gate-abierto-fold.png`, `25-m14-gate-abierto-full.png`, `26-m14-gate-cerrado-fold.png`, `26-m14-gate-cerrado-full.png` |
| `m15` | `27-m15-envio-abierto.png`, `28-m15-consulta-cerrado.png` |
| `m16` | `29-m16-virgen.png`, `30-m16-ofrecidos.png`, `31-m16-agendada.png` |
| `mr` | `32-mr-rechazo-desplegado.png` |
| `espera` | `33-espera.png` |
| `revision` | `34-revision.png` |
| `archivo` | `35-archivo.png` |

### Huecos a nivel ESTADO (la pantalla está cubierta, ese estado suyo no)

La unidad de captura es pantalla × estado, así que la cobertura 15/15 de arriba no
cierra la historia. Estos dos estados obligatorios NO tienen foto, con su causa medida:

| estado | causa medida |
|---|---|
| `m5` postergado | El copy existe (`m5-seguimiento.tsx:87` ramifica por `status === POSTERGADO && reactivateAt`), pero llegar exige un lead `POSTERGADO` **con contactos > 0**. Los dos fixtures postergados tienen 0 contactos y derivan a `m4`. El único lead de la cartera que lo producía era `F3-PROBE Opener`, que el Paso 1 ordenaba borrar. |
| «panel sin nada para trabajar» | Son dos estados distintos: `HomeEmpty` («Tu cartera está vacía») exige un setter con **cero leads** — crear un fixture, prohibido por la Regla 13; `HomeEnEspera` («Nada para trabajar ahora mismo») exige tener leads pero ninguno en la cola de foco, imposible con 76 leads vivos. |

Y cuatro estados sólo se alcanzaron con leads **pre-existentes** (los 17 fixtures no
los producen): `archivo` (ningún fixture es `PERDIDO`), `m14` gate cerrado, `m13`
virgen y `m16` con horarios ofrecidos. Cada fila lo declara en su campo **fuente**.

`/setter/leads/[id]` no tiene captura porque **no es pantalla**: es un doble redirect
(`→ /manual → /manual/<actual>`). Fotografiarla daba un PNG idéntico al de la pantalla
actual del lead — el bug de la galería reproducido.

## Las capturas

### `01-panel-foco-fold.png`

- **Pantalla**: `(ruta) /setter` — foco + rechazo pendiente en cartera
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `558237380e9f7d2ea60b0df813da69ee`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76`

### `01-panel-foco-full.png`

- **Pantalla**: `(ruta) /setter` — foco + rechazo pendiente en cartera
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×1512 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `24e67e9296699e28e328e8a15c5dbf82`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76`

### `02-panel-novedades.png`

- **Pantalla**: `(ruta) /setter` — bloque de novedades (recorte del main)
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1120×788 · tipo `clip` · scroll interno: sí · mutante: no
- **md5**: `3ae35c774bfb67ac023377146310b061`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76`

### `03-cartera-desplegada-fold.png`

- **Pantalla**: `(ruta) /setter` — cartera abierta: filtros + orden + cards
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `e1b93664bb8c9fc71ed633c66ac95824`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76` · `Filtrar por estado` · `Ordenar la cartera` · `Quitar de fijados` · `Cambiar la pausa` · `Agregar nota` · `Reanudar` · `Pausar en tu cartera` · `Fijar arriba` · `QA-M5 AgotadaEvaluadaQA · Tucumán · hace 47 díasSe enfría — el cierre lo decide Franco`

### `03-cartera-desplegada-full.png`

- **Pantalla**: `(ruta) /setter` — cartera abierta: filtros + orden + cards
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×10085 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `134faabe5c8fe4a1f1b6104814e07ba3`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76` · `Filtrar por estado` · `Ordenar la cartera` · `Quitar de fijados` · `Cambiar la pausa` · `Agregar nota` · `Reanudar` · `Pausar en tu cartera` · `Fijar arriba` · `QA-M5 AgotadaEvaluadaQA · Tucumán · hace 47 díasSe enfría — el cierre lo decide Franco`

### `04-panel-atajos.png`

- **Pantalla**: `(ruta) /setter` — panel de atajos abierto
- **Ruta**: `/setter`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×1512 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `baae249d09b61ff652f83658a42c3c43`
- **Encabezados**: «Tu día» · «QA-W Evaluada Gate Abierto» · «Atajos de teclado» · «Novedades»
- **Instrucción**: «Un lead a la vez: el que toca ahora, con su próximo paso y por qué.»
- **Botones visibles**: `Ir a trabajarlo` · `Pausar` · `Saltar` · `Cerrar ayuda` · `Atajos de teclado` · `Marcar como vistas` · `Abrir` · `Ver toda la cartera76`

### `05-alta-propia.png`

- **Pantalla**: `(ruta) /setter/nuevo` — alta de un lead propio
- **Ruta**: `/setter/nuevo`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×1099 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `59dd39836b7f9bfa746a47a2bf99f686`
- **Encabezados**: «Cargar un prospecto»
- **Instrucción**: «Un negocio que encontraste vos. Arranca en Ficha, como cualquier otro — y aparece en tu foco para que lo evalúes.»
- **Botones visibles**: `Cargar prospecto` · `¿Tenés una lista? Importá varios de una`

### `06-import-masivo.png`

- **Pantalla**: `(ruta) /setter/nuevo/importar` — importacion masiva
- **Ruta**: `/setter/nuevo/importar`
- **Lead**: — · **fuente**: ruta
- **PNG**: 1440×912 · tipo `full` · scroll interno: no · mutante: no
- **md5**: `af5431f0e83320688f0d388bbf2bc561`
- **Encabezados**: «Importar una lista»
- **Instrucción**: «Subí un CSV con varios negocios de una — esa lista que te pasó Franco. Cada fila entra a tu cartera sin marca de caliente, lista para completar la Ficha: como si los cargaras uno por uno.»
- **Botones visibles**: `Elegí un archivo CSVUna fila por negocio. Columna nombre obligatoria.` · `Importar lista` · `Descargar plantilla` · `Cargar uno solo a mano`

### `07-m1-ficha-incompleta.png`

- **Pantalla**: `m1` — ficha sin senal minima
- **Ruta**: `/setter/leads/cmr035dy300019fl8kxejvrjm/manual/m1`
- **Lead**: `QA-W Ficha Incompleta` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=FICHA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×2536 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `1434dbea4732faaacc5c629aa61ff502`
- **Encabezados**: «QA-W Ficha Incompleta» · «Cargá los datos del negocio» · «Historial del lead»
- **Instrucción**: «Lucía · Bazar · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Quién maneja el Instagram` · `Guardar ficha`

### `08-m1-ficha-cargada.png`

- **Pantalla**: `m1` — ficha con senal (completada)
- **Ruta**: `/setter/leads/cmr035e6k00059fl8z3tykgak/manual/m1`
- **Lead**: `QA-W Ficha Completa` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=FICHA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×2682 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `cc429040738382d162004fd70e5bf766`
- **Encabezados**: «QA-W Ficha Completa» · «Cargá los datos del negocio» · «Historial del lead»
- **Instrucción**: «Marcos · Cafetería · San Miguel de Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Quién maneja el Instagram` · `Guardar ficha` · `Ir a tu paso actual` · `Ficha`

### `09-m2-evaluacion-pendiente.png`

- **Pantalla**: `m2` — listo para evaluar
- **Ruta**: `/setter/leads/cmr035e6k00059fl8z3tykgak/manual/m2`
- **Lead**: `QA-W Ficha Completa` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=FICHA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1932 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `8fa57d59cec3bf762dbb763e3047a1fd`
- **Encabezados**: «QA-W Ficha Completa» · «Llevá la ficha a evaluar y registrá el veredicto» · «Historial del lead»
- **Instrucción**: «Marcos · Cafetería · San Miguel de Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `1` · `2` · `3` · `4` · `5` · `Veredicto del Evaluador` · `Registrar evaluación` · `Ficha`

### `10-m2-veredicto-descartado.png`

- **Pantalla**: `m2` — DESCARTADA, terminal
- **Ruta**: `/setter/leads/cmr035fdf00159fl8083fsy52/manual/m2`
- **Lead**: `QA-W Descartada` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=DESCARTADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1735 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `4eaeb21e72ee576b22ff0f445cd1fc87`
- **Encabezados**: «QA-W Descartada» · «Llevá la ficha a evaluar y registrá el veredicto» · «Veredicto registrado» · «Historial del lead»
- **Instrucción**: «Rubén · Kiosco · San Miguel de Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Ficha` · `Evaluación`

### `11-m4-opener-postergado-vencido.png`

- **Pantalla**: `m4` — POSTERGADO vencido, sin contactos
- **Ruta**: `/setter/leads/cmr035fi500199fl8zhx4gpqx/manual/m4`
- **Lead**: `QA-W Postergado Vencido` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=POSTERGADO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1749 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `1414d5f7575f8c302372dc13aa9d7d1d`
- **Encabezados**: «QA-W Postergado Vencido» · «Mandá el opener» · «Historial del lead»
- **Instrucción**: «Carla · Heladería · Las Talitas»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Ya lo mandé en Instagram — registrar` · `Ficha` · `Evaluación`

### `12-m4-opener-postergado-futuro.png`

- **Pantalla**: `m4` — POSTERGADO futuro, sin contactos
- **Ruta**: `/setter/leads/cmr035fmu001d9fl896hq208m/manual/m4`
- **Lead**: `QA-W Postergado Futuro` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=POSTERGADO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1749 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `baa5a1c07a0295af08e5b6abcec0a794`
- **Encabezados**: «QA-W Postergado Futuro» · «Mandá el opener» · «Historial del lead»
- **Instrucción**: «Tomás · Librería · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Ya lo mandé en Instagram — registrar` · `Ficha` · `Evaluación`

### `13-m5-toque-vencido-fold.png`

- **Pantalla**: `m5` — toque vencido (2 SIN_RESPUESTA)
- **Ruta**: `/setter/leads/cmr5ofkjj00019fpkwc514e58/manual/m5`
- **Lead**: `QA-M5 Toque` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `cce3f314de9ba1cc360ffabd8f571f45`
- **Encabezados**: «QA-M5 Toque» · «Registrá lo que pasó» · «Historial del lead»
- **Instrucción**: «Rocío · +54 381 555-0100 · QA · Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `PostergarPausa el contacto hasta la fecha que elijas; el panel lo retoma ahí.` · `RechazóQueda registrado; el cierre del lead lo decide Franco.` · `Registrar resultado` · `Ficha` · `Evaluación` · `Opener`

### `13-m5-toque-vencido-full.png`

- **Pantalla**: `m5` — toque vencido (2 SIN_RESPUESTA)
- **Ruta**: `/setter/leads/cmr5ofkjj00019fpkwc514e58/manual/m5`
- **Lead**: `QA-M5 Toque` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1867 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `51743771b8435e4094c758c937ff79d3`
- **Encabezados**: «QA-M5 Toque» · «Registrá lo que pasó» · «Historial del lead»
- **Instrucción**: «Rocío · +54 381 555-0100 · QA · Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `PostergarPausa el contacto hasta la fecha que elijas; el panel lo retoma ahí.` · `RechazóQueda registrado; el cierre del lead lo decide Franco.` · `Registrar resultado` · `Ficha` · `Evaluación` · `Opener`

### `14-m5-cadencia-agotada.png`

- **Pantalla**: `m5` — cadencia agotada (4 SIN_RESPUESTA)
- **Ruta**: `/setter/leads/cmr5ofl1j00079fpk5no7mfx2/manual/m5`
- **Lead**: `QA-M5 Agotada` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1791 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `b685a5195491d9949d2c328f218c3a82`
- **Encabezados**: «QA-M5 Agotada» · «Registrá lo que pasó» · «Historial del lead»
- **Instrucción**: «Bruno · +54 381 555-0100 · QA · Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `PostergarPausa el contacto hasta la fecha que elijas; el panel lo retoma ahí.` · `RechazóQueda registrado; el cierre del lead lo decide Franco.` · `Registrar resultado` · `Ficha` · `Evaluación` · `Opener`

### `15-m5-post-opener.png`

- **Pantalla**: `m5` — gate cerrado, 6 contactos
- **Ruta**: `/setter/leads/cmr035eba00099fl8patqziox/manual/m5`
- **Lead**: `QA-W Evaluada Gate Cerrado` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1821 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `5a0c588be292db459c3578582f7c378b`
- **Encabezados**: «QA-W Evaluada Gate Cerrado» · «Registrá lo que pasó» · «Historial del lead»
- **Instrucción**: «Rosa · Panadería · Tafí Viejo»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `PostergarPausa el contacto hasta la fecha que elijas; el panel lo retoma ahí.` · `RechazóQueda registrado; el cierre del lead lo decide Franco.` · `Registrar resultado` · `Ficha` · `Evaluación` · `Opener`

### `16-m6-brief-abierto.png`

- **Pantalla**: `m6` — gate del brief ABIERTO (RESPONDIO)
- **Ruta**: `/setter/leads/cmr035efw000d9fl8j70m1301/manual/m6`
- **Lead**: `QA-W Evaluada Gate Abierto` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×2110 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `d651c74aa91fc7f8362b721bec08ad35`
- **Encabezados**: «QA-W Evaluada Gate Abierto» · «Decidí cómo va a ser la demo» · «Historial del lead»
- **Instrucción**: «Diego · Veterinaria · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Guardar brief` · `Ficha` · `Evaluación`

### `17-m6-brief-guardado.png`

- **Pantalla**: `m6` — brief ya guardado (completada)
- **Ruta**: `/setter/leads/cmr035ekl000h9fl8l7hn1j7r/manual/m6`
- **Lead**: `QA-W Brief` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=BRIEF draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1689 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `2083a03cafe80e039894621e3ad42007`
- **Encabezados**: «QA-W Brief» · «Decidí cómo va a ser la demo» · «Historial del lead»
- **Instrucción**: «Maxi · Barbería · Las Talitas»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Menciona lo concreto — está bien` · `Quedó genérico — re-pegar` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief`

### `18-mc1-municion-fold.png`

- **Pantalla**: `mc1` — construir con municion + brief
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/mc1`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `bd1c88acc018e9a8dedc707de497961a`
- **Encabezados**: «QA-W Construccion» · «Construí la demo en Claude Design» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Marcar «Estructura» como hecha` · `Marcar «Personalización con datos del negocio» como hecha` · `Marcar «Assets reales» como hecha` · `Me trabé — avisar a Franco` · `1Construir` · `2Refinar` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `18-mc1-municion-full.png`

- **Pantalla**: `mc1` — construir con municion + brief
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/mc1`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×2292 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `c825d62f870696176f70296ca8778437`
- **Encabezados**: «QA-W Construccion» · «Construí la demo en Claude Design» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Marcar «Estructura» como hecha` · `Marcar «Personalización con datos del negocio» como hecha` · `Marcar «Assets reales» como hecha` · `Me trabé — avisar a Franco` · `1Construir` · `2Refinar` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `19-mc1-desde-brief.png`

- **Pantalla**: `mc1` — stage BRIEF, checklist virgen
- **Ruta**: `/setter/leads/cmr035ekl000h9fl8l7hn1j7r/manual/mc1`
- **Lead**: `QA-W Brief` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=BRIEF draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×2382 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `638d0d3ff214621763d870a68df799f2`
- **Encabezados**: «QA-W Brief» · «Construí la demo en Claude Design» · «Historial del lead»
- **Instrucción**: «Maxi · Barbería · Las Talitas»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Arrancar construcción` · `Marcar «Estructura» como hecha` · `Marcar «Personalización con datos del negocio» como hecha` · `Marcar «Assets reales» como hecha` · `1Construir` · `2Refinar` · `Ficha` · `Evaluación` · `Brief`

### `20-mc2-refinar.png`

- **Pantalla**: `mc2` — refinar sobre la demo
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/mc2`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×3160 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `f176aa93eb85ca35ff45886163c447b6`
- **Encabezados**: «QA-W Construccion» · «Refiná la demo antes de publicarla» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Marcar «CTA de WhatsApp» como hecha` · `Marcar «Calidad y motion» como hecha` · `Marcar «Mobile» como hecha` · `Me trabé — avisar a Franco` · `Ir a tu paso actual` · `1Construir` · `2Refinar` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `21-m13-con-url.png`

- **Pantalla**: `m13` — borrador con URL registrada
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/m13`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×1524 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `61a1a540da0f40b3fdd93a62a187022a`
- **Encabezados**: «QA-W Construccion» · «Publicá y registrá el link del borrador» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Abrir Netlify Drop` · `https://qa-w-construccion-draft.example.com` · `Cambiar el link del borrador` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `22-m13-virgen.png`

- **Pantalla**: `m13` — sin URL, formulario vacio
- **Ruta**: `/setter/leads/cmsndn84100299f14u7gpv207/manual/m13`
- **Lead**: `M0-GAL 21-m13-borrador-vacio` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=CONSTRUCCION draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1545 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `994d4cdc456c35de9184d0fc6aa847a4`
- **Encabezados**: «M0-GAL 21-m13-borrador-vacio» · «Publicá y registrá el link del borrador» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `Abrir Netlify Drop` · `Confirmo que abrí el link y carga` · `Guardar borrador` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar`

### `23-m13-congelada-rechazada.png`

- **Pantalla**: `m13` — RECHAZADA: sin un solo boton
- **Ruta**: `/setter/leads/cmr035f8m00119fl8d87obbrh/manual/m13`
- **Lead**: `QA-W Rechazada` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=RECHAZADA draft=si final=no enviada=no rechazos=si`
- **PNG**: 1440×1642 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `5de3a06a5dd80d5aff975e45f4bbccf5`
- **Encabezados**: «QA-W Rechazada» · «Publicá y registrá el link del borrador» · «Historial del lead»
- **Instrucción**: «Valentina · Florería · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Abrir Netlify Drop` · `https://qa-w-rechazada-draft.example.com` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar` · `Borrador`

### `24-m13-error-sin-confirmar.png`

- **Pantalla**: `m13` — error: guardar sin confirmar el link
- **Ruta**: `/setter/leads/cmsndn84100299f14u7gpv207/manual/m13`
- **Lead**: `M0-GAL 21-m13-borrador-vacio` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=CONSTRUCCION draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×1545 · tipo `full` · scroll interno: sí · mutante: **sí**
- **md5**: `46407f85886e882013eb7ba6ea76bea8`
- **Encabezados**: «M0-GAL 21-m13-borrador-vacio» · «Publicá y registrá el link del borrador» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Avisos / errores en pantalla**: **«Invalid literal value, expected true»**
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `Abrir Netlify Drop` · `Confirmo que abrí el link y carga` · `Guardar borrador` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar`

### `25-m14-gate-abierto-fold.png`

- **Pantalla**: `m14` — chequeo 6/6, envio HABILITADO
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/m14`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `a012c8b29e2927089312fa120a94aa0d`
- **Encabezados**: «QA-W Construccion» · «Chequeá la demo antes de mandarla» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `https://qa-w-construccion-draft.example.com` · `La demo carga` · `Se ve bien en tu celular` · `No hay lorem ipsum ni textos de relleno` · `Los links y el botón de WhatsApp funcionan` · `Se entiende qué tiene que hacer el visitante` · `Usa los datos y assets reales del negocio` · `La demo dice lo que el brief pedía` · `No se nota que la hizo una IA` · `El texto es de este negocio y de ningún otro` · `Suena como habla el negocio` · `Tiene más de 3 colores` · `La fuente parece la default, sin intención` · `Efecto vidrio (blur) en la navbar` · `Hay imágenes deformadas o estiradas` · `Enviar a revisión` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `25-m14-gate-abierto-full.png`

- **Pantalla**: `m14` — chequeo 6/6, envio HABILITADO
- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/m14`
- **Lead**: `QA-W Construccion` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×2779 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `e0686f0ba911581a68d4751edf7a15d9`
- **Encabezados**: «QA-W Construccion» · «Chequeá la demo antes de mandarla» · «Historial del lead»
- **Instrucción**: «Sofía · Pilates · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `https://qa-w-construccion-draft.example.com` · `La demo carga` · `Se ve bien en tu celular` · `No hay lorem ipsum ni textos de relleno` · `Los links y el botón de WhatsApp funcionan` · `Se entiende qué tiene que hacer el visitante` · `Usa los datos y assets reales del negocio` · `La demo dice lo que el brief pedía` · `No se nota que la hizo una IA` · `El texto es de este negocio y de ningún otro` · `Suena como habla el negocio` · `Tiene más de 3 colores` · `La fuente parece la default, sin intención` · `Efecto vidrio (blur) en la navbar` · `Hay imágenes deformadas o estiradas` · `Enviar a revisión` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief` · `Borrador`

### `26-m14-gate-cerrado-fold.png`

- **Pantalla**: `m14` — chequeo incompleto, envio BLOQUEADO
- **Ruta**: `/setter/leads/cmsndn8ec002c9f14i7x0jeml/manual/m14`
- **Lead**: `M0-GAL 22-m14-chequeo` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×900 · tipo `fold` · scroll interno: sí · mutante: no
- **md5**: `c7ca0e0c057271317fb0900ffa813d23`
- **Encabezados**: «M0-GAL 22-m14-chequeo» · «Chequeá la demo antes de mandarla» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `https://m0-galeria-borrador.netlify.app` · `La demo carga` · `Se ve bien en tu celular` · `Copiar bloque` · `No hay lorem ipsum ni textos de relleno` · `Los links y el botón de WhatsApp funcionan` · `Se entiende qué tiene que hacer el visitante` · `Usa los datos y assets reales del negocio` · `La demo dice lo que el brief pedía` · `No se nota que la hizo una IA` · `El texto es de este negocio y de ningún otro` · `Suena como habla el negocio` · `Tiene más de 3 colores` · `La fuente parece la default, sin intención` · `Efecto vidrio (blur) en la navbar` · `Hay imágenes deformadas o estiradas` · `Enviar a revisión` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar` · `Borrador`

### `26-m14-gate-cerrado-full.png`

- **Pantalla**: `m14` — chequeo incompleto, envio BLOQUEADO
- **Ruta**: `/setter/leads/cmsndn8ec002c9f14i7x0jeml/manual/m14`
- **Lead**: `M0-GAL 22-m14-chequeo` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=CONSTRUCCION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×3247 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `0e70ba5a4d7b766bfc91382996d06ad5`
- **Encabezados**: «M0-GAL 22-m14-chequeo» · «Chequeá la demo antes de mandarla» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `https://m0-galeria-borrador.netlify.app` · `La demo carga` · `Se ve bien en tu celular` · `Copiar bloque` · `No hay lorem ipsum ni textos de relleno` · `Los links y el botón de WhatsApp funcionan` · `Se entiende qué tiene que hacer el visitante` · `Usa los datos y assets reales del negocio` · `La demo dice lo que el brief pedía` · `No se nota que la hizo una IA` · `El texto es de este negocio y de ningún otro` · `Suena como habla el negocio` · `Tiene más de 3 colores` · `La fuente parece la default, sin intención` · `Efecto vidrio (blur) en la navbar` · `Hay imágenes deformadas o estiradas` · `Enviar a revisión` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar` · `Borrador`

### `27-m15-envio-abierto.png`

- **Pantalla**: `m15` — finalUrl + RESPONDIO: se puede enviar
- **Ruta**: `/setter/leads/cmr035eyw000t9fl8qzhjluhh/manual/m15`
- **Lead**: `QA-W Aprobada Gate Abierto` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=APROBADA draft=si final=si enviada=no rechazos=no`
- **PNG**: 1440×1345 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `c48911a27c7f7f0ca75e0ffbf56b815f`
- **Encabezados**: «QA-W Aprobada Gate Abierto» · «Mandá el link al negocio» · «Historial del lead»
- **Instrucción**: «Mariana · Estética · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `https://qa-w-aprobada-abierto.example.com` · `Copiar bloque` · `Ya la envié — registrar` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final`

### `28-m15-consulta-cerrado.png`

- **Pantalla**: `m15` — sin finalUrl: consulta, no habilita
- **Ruta**: `/setter/leads/cmr035f3q000x9fl84hnv2s8b/manual/m15`
- **Lead**: `QA-W Aprobada Gate Cerrado` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=APROBADA draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×1208 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `5adc32b7474bdf8d302a4979fa0252fc`
- **Encabezados**: «QA-W Aprobada Gate Cerrado» · «Mandá el link al negocio» · «Historial del lead»
- **Instrucción**: «Hernán · Ferretería · Tafí Viejo»
- **Botones visibles**: `Volver a tu cartera` · `Seguí la cadencia — registrá un toque` · `Ir a tu paso actual` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final`

### `29-m16-virgen.png`

- **Pantalla**: `m16` — demo enviada, sin reunion
- **Ruta**: `/setter/leads/cmr5oflep000f9fpks86dxmwu/manual/m16`
- **Lead**: `QA-M16 Abierta` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=APROBADA draft=si final=si enviada=si rechazos=no`
- **PNG**: 1440×1163 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `c6d93868fe66e010ce86a18a35e3462a`
- **Encabezados**: «QA-M16 Abierta» · «Agendá la reunión» · «Historial del lead»
- **Instrucción**: «Sofía · +54 381 555-0100 · QA · Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Buscar horarios libres de Franco` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final` · `Envío`

### `30-m16-ofrecidos.png`

- **Pantalla**: `m16` — horarios ya ofrecidos
- **Ruta**: `/setter/leads/cmsndnbah00399f145839supy/manual/m16`
- **Lead**: `M0-GAL 31-m16-ofrecidos` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=APROBADA draft=si final=si enviada=si rechazos=no`
- **PNG**: 1440×1541 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `743bb31a92d193a687373828b110bd78`
- **Encabezados**: «M0-GAL 31-m16-ofrecidos» · «Agendá la reunión» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `Buscar de nuevo` · `Copiar bloque` · `mar 01-09, 14:00 h` · `mié 02-09, 16:30 h` · `jue 03-09, 11:00 h` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final` · `Envío`

### `31-m16-agendada.png`

- **Pantalla**: `m16` — reunion AGENDADA, traspaso
- **Ruta**: `/setter/leads/cmr5oflle000j9fpkf138gszr/manual/m16`
- **Lead**: `QA-M16 Agendada` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=CALL_AGENDADA stage=APROBADA draft=si final=si enviada=si rechazos=no`
- **PNG**: 1440×1243 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `0953edce0c0bd5aa84102478a37bb51d`
- **Encabezados**: «QA-M16 Agendada» · «Agendá la reunión» · «Historial del lead»
- **Instrucción**: «Diego · +54 381 555-0100 · QA · Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final` · `Envío` · `Agenda`

### `32-mr-rechazo-desplegado.png`

- **Pantalla**: `mr` — reentrada con la nota de Franco
- **Ruta**: `/setter/leads/cmr035f8m00119fl8d87obbrh/manual/mr`
- **Lead**: `QA-W Rechazada` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=RECHAZADA draft=si final=no enviada=no rechazos=si`
- **PNG**: 1440×1583 · tipo `full` · scroll interno: sí · mutante: no
- **md5**: `e28d33d5a442a6b0352c4a84b6fe2fc8`
- **Encabezados**: «QA-W Rechazada» · «Aplicá las correcciones de Franco» · «Historial del lead»
- **Instrucción**: «Valentina · Florería · Yerba Buena»
- **Botones visibles**: `Volver a tu cartera` · `Copiar bloque` · `Reabrir construcción` · `1Construir` · `2Refinar` · `Ficha` · `Evaluación` · `Brief` · `Construir` · `Refinar` · `Borrador`

### `33-espera.png`

- **Pantalla**: `espera` — turno del negocio
- **Ruta**: `/setter/leads/cmr035f3q000x9fl84hnv2s8b/manual/espera`
- **Lead**: `QA-W Aprobada Gate Cerrado` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=PROSPECTO stage=APROBADA draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×912 · tipo `full` · scroll interno: no · mutante: no
- **md5**: `7ab1be15e4fd4786885d62aaf3d7439f`
- **Encabezados**: «QA-W Aprobada Gate Cerrado» · «Le toca a Franco» · «Historial del lead»
- **Instrucción**: «Hernán · Ferretería · Tafí Viejo»
- **Botones visibles**: `Volver a tu cartera` · `¿Respondió o pasó algo antes? Registralo` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final`

### `34-revision.png`

- **Pantalla**: `revision` — turno de Franco
- **Ruta**: `/setter/leads/cmr035eu2000p9fl84dk0f450/manual/revision`
- **Lead**: `QA-W En Revision` · **fuente**: fixture (seeds del Paso 1)
- **Estado en la base al disparar**: `status=RESPONDIO stage=EN_REVISION draft=si final=no enviada=no rechazos=no`
- **PNG**: 1440×912 · tipo `full` · scroll interno: no · mutante: no
- **md5**: `b8765cb655970f7f8e3c2139876161d2`
- **Encabezados**: «QA-W En Revision» · «Le toca a Franco» · «Historial del lead»
- **Instrucción**: «Pablo · Gimnasio · San Miguel de Tucumán»
- **Botones visibles**: `Volver a tu cartera` · `Ficha` · `Evaluación` · `Brief` · `Borrador` · `Chequeo final`

### `35-archivo.png`

- **Pantalla**: `archivo` — PERDIDO, cerrado
- **Ruta**: `/setter/leads/cmsndncvy003k9f14jlfsz0ec/manual/archivo`
- **Lead**: `M0-GAL 34-archivo-perdido` · **fuente**: pre-existente (NO reproducible por los seeds del Paso 1)
- **Estado en la base al disparar**: `status=PERDIDO stage=EVALUADA draft=no final=no enviada=no rechazos=no`
- **PNG**: 1440×912 · tipo `full` · scroll interno: no · mutante: no
- **md5**: `dceaa452712def5e98b66767b55ea090`
- **Encabezados**: «M0-GAL 34-archivo-perdido» · «Este negocio quedó cerrado» · «Historial del lead»
- **Instrucción**: «5493815550000 · gastronomia · Centro»
- **Botones visibles**: `Volver a tu cartera` · `Instagram` · `Seguí con el próximo`

## Los tres pares antes/después (mutantes)

Capturados AL FINAL, cada uno en contexto de navegador fresco, con geometría fija
para los dos disparos (comparables pixel a pixel) y **sin recargar** entre medio.

### PAR-1 · Saltar (foco del panel)

- **Ruta**: `/setter` · **lead consumido**: — (ninguno)
- **Botón**: `Saltar` — habilitado antes del clic: **sí**
- **Qué muta**: solo COOKIE de foco (anclarFoco) — cero escritura en la base
- **Base antes**: `null`
- **Base después**: `null`
- **La pantalla cambió**: sí
- `PAR-1-saltar-antes.png` 1440×1512 md5 `24e67e9296699e28e328e8a15c5dbf82`
  - encabezados: «Tu día» · «QA-W Evaluada Gate Abierto» · «Novedades»
  - avisos: —
- `PAR-1-saltar-despues.png` 1440×1512 md5 `dddb34e29002239196dfbc02a11abd2f`
  - encabezados: «Tu día» · «QA-W Brief» · «Novedades»
  - avisos: —
  - botones que aparecen: **ninguno**
  - botones que desaparecen: **ninguno**

### PAR-2 · Registrar el opener (m4)

- **Ruta**: `/setter/leads/cmr035fi500199fl8zhx4gpqx/manual/m4` · **lead consumido**: `QA-W Postergado Vencido`
- **Botón**: `Ya lo mandé en Instagram — registrar` — habilitado antes del clic: **sí**
- **Qué muta**: crea OsLeadActivity — los seeds NO lo revierten, se limpia al cerrar
- **Base antes**: `{"status":"POSTERGADO","stage":"EVALUADA","actividades":0}`
- **Base después**: `{"status":"POSTERGADO","stage":"EVALUADA","actividades":1}`
- **La pantalla cambió**: sí
- `PAR-2-registrar-opener-antes.png` 1440×1893 md5 `ac09ccfbc213b946db8abb878f434110`
  - encabezados: «QA-W Postergado Vencido» · «Mandá el opener» · «Historial del lead»
  - avisos: —
- `PAR-2-registrar-opener-despues.png` 1440×1893 md5 `f88913636fc440886ade74a2c0b37681`
  - encabezados: «QA-W Postergado Vencido» · «Mandá el opener» · «Historial del lead»
  - avisos: —
  - botones que aparecen: **ninguno**
  - botones que desaparecen: **ninguno**

### PAR-3 · Enviar a revision (m14, gate abierto)

- **Ruta**: `/setter/leads/cmr035epe000l9fl87zbo742h/manual/m14` · **lead consumido**: `QA-W Construccion`
- **Botón**: `Enviar a revisión` — habilitado antes del clic: **sí**
- **Qué muta**: CONSTRUCCION -> EN_REVISION — el seed V-1 lo revierte
- **Base antes**: `{"status":"RESPONDIO","stage":"CONSTRUCCION","actividades":0,"draft":true}`
- **Base después**: `{"status":"RESPONDIO","stage":"EN_REVISION","actividades":0,"draft":true}`
- **La pantalla cambió**: sí
- `PAR-3-enviar-a-revision-antes.png` 1440×2779 md5 `e0686f0ba911581a68d4751edf7a15d9`
  - encabezados: «QA-W Construccion» · «Chequeá la demo antes de mandarla» · «Historial del lead»
  - avisos: —
- `PAR-3-enviar-a-revision-despues.png` 1440×2779 md5 `c438632de734a03164463b18b0347b60`
  - encabezados: «QA-W Construccion» · «Chequeá la demo antes de mandarla» · «Historial del lead»
  - avisos: **«Guardando…»**
  - botones que aparecen: **ninguno**
  - botones que desaparecen: **ninguno**

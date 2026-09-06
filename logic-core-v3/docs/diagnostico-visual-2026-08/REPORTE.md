# Corrida de experiencia — reporte

**Qué es esto.** El primer juego de capturas del Panel del Setter tal como está hoy.
47 PNG a un solo ancho (1440×900), con un [MANIFIESTO](MANIFIESTO.md) generado por la
propia corrida: cada fila trae el estado leído de la base en el momento de disparar, las
dimensiones leídas del IHDR del archivo, el md5, y el texto de la pantalla transcripto
desde el DOM.

**Esta corrida no opina.** Produce imágenes y declara qué fotografió. Jerarquía, densidad,
aglomeración y copy los decide Franco mirando. Tampoco concluye si un bache está vivo o
muerto: eso es la corrida siguiente.

---

## Terreno y línea base

| | |
|---|---|
| Base | `cbfaa27f14121a294b7ad72565ab361072ecb166` — verificado contra lo esperado |
| Worktree | `C:/tmp/wt-v1-integracion` — **reusado**, es el worktree de la rama base y estaba limpio |
| Build | producción, `E2E_DIST_DIR=.next-corrida-visual`, **exit 0** |
| Puerto | `127.0.0.1:3021` — propio; no se usó 3000/3001/3003/3004/3005/3006/3013 |
| Procesos | nada escuchaba en 3000-3100 al empezar; no se mató ningún proceso ajeno |
| Login | JWT minteado client-side, **leído de `tests/helpers/setter-auth.ts`**, no inventado |

Los 4 chequeos de Fase 0 dieron verde: hash correcto · árbol limpio · 2 stashes · worktrees
censados. `f1`, `f2`, `f3`, `main`, los stashes y los worktrees ajenos quedaron intactos.

### Paso 1 — el censo, antes y después

| | antes | después |
|---|---|---|
| Leads del setter | 78 | **76** |
| Novedades total / sin leer / huérfanas | 81 / 81 / 78 | **3 / 3 / 0** |
| Leads `F3-PROBE` | 2 | **0** |
| Fixtures declarados | 17 | 17 |

La referencia del 20/08 decía 78 leads y 80/80/77 novedades: los leads coinciden exacto,
las novedades traían **+1** en cada conteo.

**Se invirtió el orden de los pasos 3 y 4, a propósito.** `OsSetterNotice.lead` es
`onDelete: SetNull`: borrar un lead **convierte sus novedades en huérfanas**. Limpiar
primero y borrar después habría fabricado huérfanas nuevas justo después de limpiarlas. Se
borró F3-PROBE primero (arrastró 2 actividades por Cascade y, medido, 0 novedades) y se
limpió después.

### ⚠️ La limpieza ordenada borró el diagnóstico que se quería fotografiar

Las **78 novedades huérfanas eran el 96% del bloque** (81 → 3). El ítem obligatorio «el
bloque de novedades, entero — es el diagnóstico de aglomeración» quedó retratado con **3
novedades**, no con la masa que originó la observación *«el bloque de novedades ocupa más
pantalla que el foco, la cartera y los números juntos»*. Esa observación **no se puede
re-verificar contra estas fotos**. La limpieza estaba explícitamente ordenada y se ejecutó
como se pidió; la consecuencia se declara acá para que la decisión sea tuya.

---

## Paso 2 — la matriz se midió, no se adivinó

En vez de mapear 78 leads a mano, se importó la **`derivarPantalla` real del producto** y
se corrió sobre la cartera entera, replicando el ensamblado de input de
`cargarManualDelLead` (incluido el filtro `channel != SISTEMA` que define `contactos`).
La matriz de qué lead produce qué pantalla es una medición, no una suposición.

Eso cambió el plan en tres puntos que un mapeo a ojo habría errado:

1. **`QA-W Construccion` tiene `progresoJson` en `null`.** El seed dice «self-check 6/6»,
   pero eso es `selfCheckJson` (los hard-checks), no el checklist de las 6 fases. Su
   pantalla actual es **`mc1`**, no `m14`. `m14` igual es alcanzable (está en `habilitadas`)
   y `m13` también (está en `completadas`).
2. **Ninguno de los 17 fixtures es `PERDIDO`**, y `PERDIDO` es la única puerta a `archivo`.
3. **`QA-W Postergado Vencido/Futuro` caen en `m4`, no en `m5`**: no tienen contactos, así
   que `openerPendiente` es verdadero. Un lead postergado aterriza hoy en «Mandá el opener».

---

## Qué se capturó y qué no

**Las 15 pantallas del manual tienen al menos una captura.** Los tres chequeos obligatorios
del manifiesto dan: **0 colisiones de md5 inesperadas · 0 capturas capadas por el fold ·
0 pantallas sin cubrir.**

### Tres pantallas sólo se pudieron capturar con leads pre-existentes

Los 17 fixtures sembrados **no las producen**. Se usaron leads `M0-GAL` que ya estaban en
la base (read-only, no se sembraron ni se modificaron), y cada fila lo declara como
`pre-existente (NO reproducible por los seeds del Paso 1)`:

| pantalla / estado | por qué los 17 no alcanzan | lead usado |
|---|---|---|
| `archivo` | ningún fixture es `PERDIDO` | `M0-GAL 34-archivo-perdido` |
| `m14` gate **cerrado** | el único fixture que llega a m14 tiene el self-check completo → gate abierto | `M0-GAL 22-m14-chequeo` |
| `m13` **virgen** | el único fixture que llega a m13 ya tiene `draftUrl` | `M0-GAL 21-m13-borrador-vacio` |
| `m16` con horarios ofrecidos | los dos fixtures de m16 son «sin reunión» y «agendada» | `M0-GAL 31-m16-ofrecidos` |

Se respetó la Regla 13: **no se sembró ni se inventó ningún fixture**. Navegar un lead que
ya existía no es crearlo. El set `M0-GAL` es regenerable con `npm run seed:galeria`, que
**no se corrió** (habría sido una escritura fuera de las declaradas en el Paso 1).

### Dos ítems obligatorios quedaron como hueco, con causa medida

**`m5` en estado postergado.** El copy existe (`m5-seguimiento.tsx:87` ramifica por
`status === 'POSTERGADO' && reactivateAt`), pero llegar ahí exige un lead `POSTERGADO`
**con contactos > 0**. Los dos fixtures postergados tienen 0 contactos y derivan a `m4`.
El único lead de toda la cartera que producía ese estado era **`F3-PROBE Opener`** — que
el Paso 1 ordenaba borrar, y se borró. Se capturaron en cambio los dos `m4` de los leads
postergados, que muestran el comportamiento real de hoy.

**«El panel sin nada para trabajar».** Son **dos estados distintos** y el propio smoke los
separa (`tests/setter/05-empty-mobile-a11y.spec.ts`): `HomeEmpty` («Tu cartera está vacía»)
exige un setter con **cero leads** — o sea, crear un setter, que es exactamente lo que la
Regla 13 prohíbe; y `HomeEnEspera` («Nada para trabajar ahora mismo») exige tener leads pero
ninguno en la cola de foco, imposible con 76 leads vivos.

### Una ruta que no es pantalla

`/setter/leads/[id]` **no se capturó**: es un doble redirect (`→ /manual → /manual/<actual>`).
Fotografiarla producía un PNG **idéntico** al de la pantalla actual del lead — el mismo bug
de la galería, reproducido. Se sacó de la lista y se declara acá.

### Dos colisiones de md5, esperadas y declaradas

`PAR-1-saltar-antes.png ≡ 01-panel-foco-full.png` y
`PAR-3-enviar-a-revision-antes.png ≡ 25-m14-gate-abierto-full.png`. El «antes» de un par
**es** la pantalla limpia ya capturada. No es el bug de la galería (dos archivos que dicen
mostrar cosas distintas): es la misma escena capturada dos veces, en contextos de navegador
distintos y con minutos de diferencia, y su identidad byte a byte es **prueba de que el
render es determinista**.

---

## Cómo se esquivó la trampa del fold

El shell es `fixed inset-0` y el scroller es el `<main>` interno (`setter-shell.tsx:78`).
**No se usó `fullPage: true` en ninguna toma.** Para las `-full` se midió el alto real del
`<main>` y se agrandó el *viewport* a ese alto: el contenedor deja de scrollear y entra
entero en una toma normal. Las dimensiones se leen del **IHDR del PNG**, no de lo pedido.
El chequeo «ninguna `-full` con altura de viewport en pantalla que scrollea» pasa con 0.

Alturas reales: de 788 px (las tres pantallas de estado, que genuinamente no scrollean) a
**10.085 px** (la cartera desplegada). Con `fullPage` todas habrían salido de 900.

---

## Lo que las capturas ya dejaron medido

Sin opinar sobre estética, tres cosas quedaron registradas como dato:

**1 · El error de m13 es un mensaje de Zod en inglés.** Se provocó el estado: URL válida +
«Guardar borrador» sin tocar el interruptor de confirmación. El texto que le llega al
setter es, literal:

> **`Invalid literal value, expected true`**

Y se verificó contra la base que **el guardado no persiste nada** (`draftUrl` sigue `null`).
La afirmación del brief quedó medida, no supuesta.

**2 · `espera` y `revision` muestran el MISMO encabezado.** Las dos rutas salen por
`EstadoManual`, cuyo título es `TEXTO_TURNO[turno]`: ambas dicen **«Le toca a Franco»**.
Los títulos de `PANTALLAS` («Esperando respuesta» / «Franco está revisando tu demo») no
aparecen en pantalla — confirmado desde el DOM. `archivo` sí muestra el suyo
(«Este negocio quedó cerrado»), que hardcodea aparte.

**3 · El patrón «la pantalla no acompaña al dato», medido por primera vez.** Es lo que la
re-verificación había declarado NO VERIFICABLE con el instrumento viejo:

| par | la base | la pantalla, 3 s después, sin recargar |
|---|---|---|
| **PAR-2** registrar el opener | `actividades 0 → 1` | sigue diciendo **«Mandá el opener»**; 0 botones nuevos, 0 avisos |
| **PAR-3** enviar a revisión | `CONSTRUCCION → EN_REVISION` | sigue diciendo **«Chequeá la demo antes de mandarla»**, con un `Guardando…` flotante |

Y **PAR-1 (Saltar)**: el foco sí cambió de lead (`QA-W Evaluada Gate Abierto` →
`QA-W Brief`), el botón quedó **habilitado** (la nota previa decía que quedaba
deshabilitado — no se reprodujo), y no hubo **ninguna** región `aria-live`: cambia sin
anunciar. Se reporta como medición; esta corrida tiene prohibido dictaminar si el bache
está vivo.

---

## Estado de datos al cerrar

**Restaurado a la línea base del Paso 1, verificado por censo.** El censo de cierre es
idéntico al posterior al Paso 1: 76 leads, novedades 3/3/0, los 17 fixtures en su estado
declarado.

Los pares mutaron y se revirtió cada cosa:

- **PAR-1** — sólo una **cookie** de foco (`anclarFoco` no escribe en la base). Contexto de
  navegador descartado.
- **PAR-2** — creó 1 `OsLeadActivity` en `QA-W Postergado Vencido`. **Los seeds no revierten
  actividades de los leads QA-W**, así que se borró a mano (1 → 0, la línea base era 0). Sin
  esto el lead habría quedado con contactos > 0 y su pantalla derivada habría cambiado de
  `m4` a `m5`/`espera` en silencio.
- **PAR-3** — `QA-W Construccion` pasó a `EN_REVISION`; el seed V-1 lo devolvió a
  `CONSTRUCCION`.
- **m13 error** — se provocó sobre un lead pre-existente, no sobre los 17, y se verificó
  que no persistió nada.

---

## Salvedades de reproducibilidad

- **El seed V-1 no maneja actividades.** Las 6 de `QA-W Evaluada Gate Cerrado` son residuo
  de corridas viejas, y de ellas depende que ese lead derive a `m5`. En una base fresca
  caería en `m4` y la captura `15-m5-post-opener.png` no se reproduciría.
- **Cuatro capturas dependen de leads `M0-GAL`**, que los seeds del Paso 1 no crean.
- Las fechas relativas del seed (`hace 3 días`, `en 7 días`) se recalculan en cada corrida:
  el copy con fechas no es byte-estable entre días distintos.

## Hallazgos de higiene, fuera del scope de la corrida

- **`tsx` no está instalado ni declarado.** La Regla 9 asume que «funciona por
  `node_modules`»; medido, no está ahí, ni en `.bin`, ni en `package.json` (sí está
  `ts-node`). Los dos seeds del Paso 1 se invocan con `npx tsx`. Se resolvió **sin instalar
  nada**: `tsx` ya estaba en la caché de npx, y todo corrió con `npx --offline tsx`. En una
  máquina sin esa caché, o sin red, **los seeds no arrancan**.
- **`next build` edita `tsconfig.json`** (le agrega las rutas de tipos del `distDir`). Se
  revirtió; el diff final está limpio. Cualquier corrida futura con `E2E_DIST_DIR` propio
  va a reintroducirlo.
- **Fragmento de credencial en el transcript de la sesión.** Al enmascarar el
  `DATABASE_URL` de la branch dev, el comando cortó la cadena **antes** del `@`, así que el
  `sed` no tuvo qué tapar y un prefijo del password quedó impreso en el log de la sesión.
  Es la credencial de la branch Neon **dev**. Conviene rotarla.

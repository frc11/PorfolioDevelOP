# P35 · EL ALCANCE — ¿el defecto toca al setter, o sólo a las pruebas?

> **Probe de MEDICIÓN.** No arregla nada, no recomienda un camino, y no concluye que el
> defecto no importe. Produce el alcance y el re-costeo. La decisión es de Franco.
>
> Cero líneas de producto shippeadas. `git diff` sobre `src/` del árbol principal vuelve
> exactamente al WIP con el que arrancó la sesión (md5 pegado en §7).

---

## Resumen en cinco líneas

1. **Los cinco controles del panel son navegación BLANDA de punta a punta** — incluidos los
   dos `redirect()` de servidor que hay aguas abajo. Medido: **1 documento**, 30/30 pasadas.
2. **Un setter que entra por el camino real pierde el acuse en 0 de 30 pasadas**, y no por
   suerte: en esos caminos **no hay ningún documento en vuelo que pueda matar la promesa**.
3. **La entrada por URL sobre la RAÍZ es el único camino con cadena dura**: 3 documentos
   nuevos, uno por salto. Hoy 0 de 12 pasadas perdidas — pero con un margen de **170-612 ms**
   contra los **984-2954 ms** de los blandos. P34 lo midió en negativo en esta misma máquina.
4. **El instrumento sabe dar distinto de cero**: el control positivo forzado perdió el acuse
   **6 de 6**, con la firma exacta de P34 (`[despacho | dentro-transicion]` y nada más, y el
   dato igual escrito en la base).
5. **Un lead APROBADA+RESPONDIO+finalUrl no llega al foco ni a la cola** contra la cartera
   real. Sólo se alcanza desde la cartera (colapsada) y desde Novedades. Es un hallazgo, no
   un detalle de test: es lo que trabó el intento anterior.

---

## 0 · Terreno

| | |
|---|---|
| HEAD | `4f8c00a2` — *P28: un render de servidor por acción* |
| Rama del árbol principal | `p25/rafaga-tildes` (sin tocar) |
| Worktree propio | `C:/tmp/wt-p35-alcance`, rama `p35/alcance-entrada`, desde HEAD |
| Worktrees | 28 al arrancar → 29 durante el probe → **28 al cerrar** |
| Stashes | 2 — **no tocados**; `git stash` bare nunca se usó |
| Disco | 29 GB libres de 925 GB al arrancar · 25 GB tras los builds |
| Procesos node ajenos | censados por PID: 9304, 11660, 26776 (harness) · 8692, 14284, 27064 (chrome-devtools-mcp) — **no tocados** |
| Build/puerto propios | `E2E_DIST_DIR=.next-p35`, puerto 3007 |
| Servidores | levantados y bajados **por PID del socket** (`Get-NetTCPConnection -LocalPort`), nunca por nombre |
| Build | `npm run build` **exit 0** |

### El pozo del camino, que vale anotar

`npx next build` **falla** en este worktree, y no es un problema del repo: Next 16 usa
Turbopack por default y Turbopack **rechaza el junction** de `node_modules` que el worktree
usa para no duplicar 1,5 GB —
`Symlink [project]/node_modules is invalid, it points out of the filesystem root`.
El script del repo es `next build --webpack`, y webpack resuelve el junction sin drama.

**Regla:** en un worktree con `node_modules` junctioneado va `npm run build`, nunca
`npx next build` a secas.

### La instrumentación, y por qué no es un arreglo

La sonda necesita saber **hasta dónde llegó `run()`**, y eso no se ve desde el DOM. Igual que
P34, el probe corre contra una **variante diagnóstica** de `src/lib/use-step-action.ts` que
anota cada etapa (`despacho`, `dentro-transicion`, `resuelta:ok`, `post-onSuccess`,
`pidio-exito`) en `sessionStorage` — no en `window`, porque el camino cruza navegaciones
duras y un contador en `window` muere con el documento y publica un falso «acá no pasó nada».

Vive **sólo en el worktree descartable** y viaja con una baliza (`__p35Build`): si el build no
la tuviera, la tabla marcaría `SIN INSTRUMENTAR` en vez de dar un falso «el acuse no se pidió».
**60 de 60 pasadas salieron instrumentadas.**

---

## 1 · La reproducción por el camino conocido, y el control positivo

Fase 0 pide reproducir el defecto por el camino conocido «para confirmar que el instrumento
distingue». Se hizo de las dos maneras, porque una sola no alcanzaba.

### 1.1 · Reproducción natural — la forma exacta de P34

Login y de una `goto()` a la RAÍZ del lead, **sin pasar por el panel** (precalentar `/setter`
acorta la cadena: layout, sesión y pool de Prisma ya tibios). Server frío por ronda.

| pasada | docs | último doc | despacho | **margen** | acuse | en base |
|---|---|---|---|---|---|---|
| r1p1 | 3 | +1266 ms | +1850 ms | **+584 ms** | SÍ | SÍ |
| r1p2 | 3 | +599 ms | +791 ms | **+192 ms** | SÍ | SÍ |
| r1p3 | 3 | +648 ms | +835 ms | **+187 ms** | SÍ | SÍ |
| r2p1 | 3 | +1272 ms | +1883 ms | **+611 ms** | SÍ | SÍ |
| r2p2 | 3 | +615 ms | +785 ms | **+170 ms** | SÍ | SÍ |
| r2p3 | 3 | +607 ms | +785 ms | **+178 ms** | SÍ | SÍ |

Documentos, siempre los mismos tres: `+0ms …` · `+227ms …/manual` · `+607ms …/manual/m15`.

**El flake NO se dio: 0 de 6.** P34 lo vio 2/6 y 1/3 en esta misma máquina días atrás. Se
informa como lo que es — una carrera que hoy no salió — y no como «ya no pasa».

### 1.2 · Control positivo forzado — el acantilado que el cero tiene que cruzar

Un cero sólo vale si el instrumento sabe dar distinto de cero. Como la reproducción natural es
una carrera que puede no darse, se **fuerza** la condición que P34 aisló (21/21): entrada
canónica a m15 (sin cadena, el botón ya está), se despacha la acción, y a los N ms se fuerza
un documento nuevo.

| corte | docs | margen | **acuse** | carteles | **en base** | etapas de `run()` |
|---|---|---|---|---|---|---|
| +200 ms | 2 | −613 ms | **NO** | 0 | **SÍ** | `[despacho+45ms │ dentro-transicion+46ms]` |
| +200 ms | 2 | −471 ms | **NO** | 0 | **SÍ** | `[despacho+47ms │ dentro-transicion+47ms]` |
| +200 ms | 2 | −407 ms | **NO** | 0 | **SÍ** | `[despacho+28ms │ dentro-transicion+28ms]` |
| +600 ms | 2 | −1001 ms | **NO** | 0 | **SÍ** | `[despacho+49ms │ dentro-transicion+49ms]` |
| +600 ms | 2 | −807 ms | **NO** | 0 | **SÍ** | `[despacho+36ms │ dentro-transicion+36ms]` |
| +600 ms | 2 | −804 ms | **NO** | 0 | **SÍ** | `[despacho+28ms │ dentro-transicion+28ms]` |

**6 de 6, con la firma exacta de P34:** `run()` llega a `dentro-transicion` y ahí se corta —
no hay `resuelta:`, ni `post-onSuccess`, ni `pidio-exito`. `await action()` nunca vuelve. Cero
carteles en 14 s continuos de muestreo. **Y el dato igual quedó escrito en la base.**

Lo artificial es **cómo** nace el documento (un `goto`, no un redirect de la cadena). El
mecanismo bajo prueba —la promesa muere con el documento— es el mismo, y es lo único que este
control afirma. *(La columna `reflejo` no dice nada acá: el documento forzado re-renderiza del
servidor, así que la pantalla muestra el estado nuevo por recarga, no por commit.)*

**Conclusión de Fase 0: el instrumento distingue.** Los ceros de §3 son ceros medidos.

---

## 2 · El censo de caminos de entrada — medido, no deducido

### 2.1 · Los controles que el producto ofrece de verdad

Barrido de `src/app/(protected)/setter/**`. **Cinco** controles llevan a la pantalla de un lead
desde fuera del manual, y **los cinco apuntan a la RAÍZ** `/setter/leads/[id]` — ninguno a la
URL canónica. No hay un solo `<a href>` crudo, ni `window.location`, ni `form action` contra
`/setter/leads/`.

| # | Control | Copy visible | Mecanismo | archivo:línea |
|---|---|---|---|---|
| E1 | Foco del panel | «Ir a trabajarlo» | `router.push(raíz)` | `foco-surface.tsx:90` (texto `:236`) |
| E1b | Atajo de teclado | tecla `t` | idem E1 | `foco-surface.tsx:151` |
| E2 | Fila de la cola | «Trabajar» · a11y «Trabajar {negocio}» | `router.push(raíz)` | `trabajar-lead-button.tsx:31` (a11y `:40`) |
| E3 | Novedades | «Abrir» | `router.push(raíz)` | `novedades-abrir-foco.tsx:47` |
| E4 | Cartera | la tarjeta entera | `<Link href={raíz}>` | `home-sections.tsx:69` |
| E5 | Alta de prospecto | «Cargar prospecto» | `router.push(raíz)` | `nuevo-prospecto-form.tsx:98` |

Y **nueve** familias de enlaces internos del manual van a una subruta **ya canónica**
(`rutaManual(...)`), sin tocar la raíz: la franja del recorrido (`franja-recorrido.tsx:185`),
«Ir a tu paso actual» (`pantalla-manual.tsx:231`), los chips Construir/Refinar
(`manual-nav.tsx:218`), y seis enlaces puntuales entre pantallas (`estado-manual.tsx:148`,
`m14-chequeo.tsx:137`, `m15-envio.tsx:128`, `m16-agenda.tsx:221`, `enlace-pantalla.tsx:55`,
`enlace-chequeo.tsx:57/64`).

**Superficies que NO ofrecen entrada, y es deliberado:** el timeline (`lead-timeline.tsx`,
`historial-lead.tsx`: cero enlaces), el resumen de revisión de Novedades
(`novedades.ts:144-148` — dice «las ves en tu cartera»), y el pie de la cola
(`cola-del-dia.tsx:119-128` — nombra lo que no entra y no enlaza).

### 2.2 · La cadena dura, con sus líneas

```
/setter/leads/[id]            page.tsx:23        redirect(`.../manual`)                    incondicional
/setter/leads/[id]/manual     manual/page.tsx:20 notFound() si no es propio
                              manual/page.tsx:21 redirect(rutaManual(id, posicion.actual))
/setter/leads/[id]/manual/mN  [paso]/page.tsx:69 redirect si el paso no existe             condicional
                              [paso]/page.tsx:73 redirect si el paso no es accesible       condicional
```

Para un lead `APROBADA` + `RESPONDIO` + `finalUrl`, `posicionDe` (`manual.ts:656-663`) deriva
**m15** — la pantalla del envío, la del acuse que P34 vio perderse.

### 2.3 · Blando o duro: lo que dice la MEDICIÓN

La sonda lleva **dos series a la vez**, y ninguna alcanza sola:

- **`nac`** — un renglón por DOCUMENTO nuevo. El `addInitScript` corre una vez por documento;
  es la única señal de navegación dura.
- **`urls`** — un renglón por cambio de `location.pathname`, muestreado por `rAF`. Un cambio
  de ruta **sin** documento nuevo es navegación blanda.

Deducirlo del tipo de componente (`<Link>` ⇒ blando) era exactamente el error a evitar: los
cinco controles son blandos **hacia la raíz**, y la raíz encadena dos `redirect()` de servidor.
Si esos redirects nacieran documentos, el camino sería blando en el clic y duro dos saltos
más abajo.

**No nacen.** El mismo tramo de URLs, las dos formas de llegar:

```
C · cola (blanda)      documentos: +0ms /setter
                       rutas:      +5ms /setter | +583ms … | +616ms …/manual | +981ms …/manual/m15

A · URL a la raíz      documentos: +0ms /setter | +389ms … | +697ms …/manual | +1705ms …/manual/m15
    (dura)             rutas:      +7ms /setter | +408ms … | +715ms …/manual | +1711ms …/manual/m15
```

En el camino duro la serie de rutas y la de documentos **coinciden uno a uno**: cada salto es
un documento. En el blando, el pathname recorre los mismos tres destinos y la serie de
documentos **no se mueve**.

### 2.4 · El estado que no tiene camino desde el panel — el hallazgo que trabó al intento anterior

Medido contra la cartera real de `setter-qa` (**172 leads**): un lead
`APROBADA` + `RESPONDIO` + `finalUrl` **entra** a `grupos.trabajar` (`flow.ts:440`), pero con
`trabajoTier = CONTACTAR_CON_DEMO (2)` — por debajo de `CONSTRUIR (0)` y de
`ESPERA_TU_ACCION (1)`. Con el tope de 5 de la cola (`cola.ts:38`) **no llega al foco ni a
ninguna fila**.

De dónde SÍ se alcanza:

| Superficie | ¿Llega? | Fricción |
|---|---|---|
| Cartera (grupo «Para trabajar») | **Sí, siempre** | la cartera está **colapsada** por default (`cartera-view.tsx:42`): hay que tocar «Ver toda la cartera» |
| Novedades «Abrir» | **Sí**, si hay un aviso sin leer | el dedup lo saca si el lead ya está en la cola visible (`page.tsx:96`) |
| Foco «Ir a trabajarlo» | **No**, por tier | sólo con el sticky ya anclado, o pin del setter |
| Fila de la cola «Trabajar» | **No**, por tier | idem |

**Esto es lo que trabó el intento de P34** («no encontró el botón de entrada para un lead en
cierto estado»): no era un selector mal escrito, era que el control **no está**.

Para poder medir igual los caminos del foco y de la cola sin inventar un camino, el probe usa
**los dos mecanismos que el producto ya tiene** para decidir el orden — y ninguno cambia el
control ni la navegación:

- **Cola:** el `pinned` del propio setter, que es preferencia de ORDEN (`flow.ts:771`), sube el
  mismo botón a una fila.
- **Foco:** el **sticky** (`foco.ts:61`, cookie `leados-foco-v1`) que escribe `anclarFoco()` —
  la misma action que corren el botón del foco **y** el de la fila. Un setter que tocó
  «Trabajar X» y vuelve al panel ve X como foco: el probe reproduce ese estado.
  *(El pin solo no alcanzaba: la cartera de QA ya tiene leads pinchados que se quedan con el
  foco — medido en el recon.)*

---

## 3 · La tabla — 48 pasadas, 8 caminos × 6 rondas

**El diseño de la corrida, y por qué no es un detalle.** P26 dejó medido que el flake **sólo
existe con server FRÍO** (8 corridas tibias = 1.528 ejecuciones, 0 rojas). Correr las seis
pasadas del camino A y después las seis del B le habría dado al A toda la temperatura fría y
a los demás un verde ganado por tibios, no por sanos — un falso verde con forma de veredicto.

Por eso la unidad es la **RONDA**: server reiniciado, **una** pasada de cada camino, y el orden
de arranque **rotado** para que ningún camino se quede siempre con el turno más frío.
Verificable en la columna `trn` de la tabla: cada camino tomó el turno 1 al menos una vez.

| camino | rnd | trn | docs | despacho | docs POST-despacho | acuse | cartel | base | reflejo |
|---|---|---|---|---|---|---|---|---|---|
| A-raiz-url | 1 | **1** | 4 | +2317 ms | 0 | SÍ | 1 | SÍ | SÍ |
| A-raiz-url | 2 | 8 | 4 | +991 ms | 0 | SÍ | 1 | SÍ | SÍ |
| A-raiz-url | 3 | 7 | 4 | +960 ms | 0 | SÍ | 1 | SÍ | SÍ |
| A-raiz-url | 4 | 6 | 4 | +994 ms | 0 | SÍ | 1 | SÍ | SÍ |
| A-raiz-url | 5 | 5 | 4 | +1026 ms | 0 | SÍ | 1 | SÍ | SÍ |
| A-raiz-url | 6 | 4 | 4 | +1093 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 1 | 2 | **1** | +1925 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 2 | **1** | **1** | +2935 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 3 | 8 | **1** | +1936 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 4 | 7 | **1** | +1410 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 5 | 6 | **1** | +1424 ms | 0 | SÍ | 1 | SÍ | SÍ |
| B-foco | 6 | 5 | **1** | +2013 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 1 | 3 | **1** | +1901 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 2 | 2 | **1** | +1916 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 3 | **1** | **1** | +2943 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 4 | 8 | **1** | +1422 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 5 | 7 | **1** | +1400 ms | 0 | SÍ | 1 | SÍ | SÍ |
| C-cola | 6 | 6 | **1** | +1920 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 1 | 4 | **1** | +1488 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 2 | 3 | **1** | +1517 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 3 | 2 | **1** | +1517 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 4 | **1** | **1** | +1988 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 5 | 8 | **1** | +984 ms | 0 | SÍ | 1 | SÍ | SÍ |
| D-cartera | 6 | 7 | **1** | +1001 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 1 | 5 | **1** | +1404 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 2 | 4 | **1** | +1902 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 3 | 3 | **1** | +1418 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 4 | 2 | **1** | +1938 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 5 | **1** | **1** | +2954 ms | 0 | SÍ | 1 | SÍ | SÍ |
| E-novedades | 6 | 8 | **1** | +1917 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 1 | 6 | **1** | +887 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 2 | 5 | **1** | +909 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 3 | 4 | **1** | +921 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 4 | 3 | **1** | +916 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 5 | 2 | **1** | +407 ms | 0 | SÍ | 1 | SÍ | SÍ |
| F-franja | 6 | **1** | **1** | +919 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 1 | 7 | 2 | +430 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 2 | 6 | 2 | +477 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 3 | 5 | 2 | +484 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 4 | 4 | 2 | +466 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 5 | 3 | 2 | +394 ms | 0 | SÍ | 1 | SÍ | SÍ |
| G-canonica-url | 6 | 2 | 2 | +436 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 1 | 8 | 2 | +360 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 2 | 7 | 2 | +364 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 3 | 6 | 2 | +382 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 4 | 5 | 2 | +411 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 5 | 4 | 2 | +491 ms | 0 | SÍ | 1 | SÍ | SÍ |
| H-recarga | 6 | 3 | 2 | +492 ms | 0 | SÍ | 1 | SÍ | SÍ |

**48 de 48 medidas. 0 no medidas. 0 sin instrumentar.** El conteo de documentos por camino no
varió ni una vez en seis rondas: A=4, B..F=1, G=2, H=2.

### 3.1 · El margen — por qué los blandos no están a salvo por suerte

`margen = despacho − nacimiento del último documento`. Negativo significa que se despachó la
acción **antes** de que naciera el último documento: la condición del defecto.

| camino | márgenes de las 6 pasadas | **peor (mínimo)** |
|---|---|---|
| A-raiz-url | 612, 196, 194, 196, 191, 190 ms | **+190 ms** |
| B-foco | 1925, 2935, 1936, 1410, 1424, 2013 ms | +1410 ms |
| C-cola | 1901, 1916, 2943, 1422, 1400, 1920 ms | +1400 ms |
| D-cartera | 1488, 1517, 1517, 1988, 984, 1001 ms | +984 ms |
| E-novedades | 1404, 1902, 1418, 1938, 2954, 1917 ms | +1404 ms |
| F-franja | 887, 909, 921, 916, 407, 919 ms | +407 ms |
| G-canonica-url | 186, 271, 290, 261, 159, 203 ms | +159 ms |
| H-recarga | 156, 150, 170, 167, 124, 146 ms | +124 ms |

Y acá está la diferencia que importa, que **no es de milisegundos sino de forma**:

- En **B..F** el único documento es el de `/setter`, nacido **antes del clic**. No hay margen
  que se pueda achicar: **no hay nada en vuelo que pueda matar la promesa.**
- En **G** y **H** hay 2 documentos, pero **una sola navegación**: el documento nace, la
  pantalla renderiza, el botón aparece. Nada viene atrás. El margen chico es tiempo de render,
  no una carrera.
- En **A** hay una **CADENA de tres documentos**. El botón se dibuja cuando renderiza el
  último — y si por lo que sea se dibujara antes, la navegación que falta se lo lleva puesto.
  **Es el único camino donde el margen puede darse vuelta**, y es el que lo tiene más chico
  de los que tienen cadena.

---

## 4 · EL NÚMERO

> **¿En cuántas pasadas pierde el acuse un setter que entra por el camino real?**
>
> # 0 de 30
>
> Foco, cola, cartera, novedades y franja — seis pasadas cada uno, server frío por ronda.
> Y no por suerte: **en los cinco la navegación es blanda de punta a punta**, con
> `documentos = 1` en las 30. No nace ningún documento que pueda llevarse la promesa.

Los otros tres caminos, para tenerlos al lado:

| camino | acuse perdido | entrada dura | en base | reflejo |
|---|---|---|---|---|
| A · URL a la raíz (F5 / marcador / deep link) | **0/6** | 6/6 · **4 documentos** | 6/6 | 6/6 |
| G · URL a la canónica m15 | 0/6 | 6/6 · 2 documentos | 6/6 | 6/6 |
| H · Recarga (F5) sobre la canónica | 0/6 | 6/6 · 2 documentos | 6/6 | 6/6 |

Y el discriminador de P34, **recontado sobre las 60 pasadas** de este probe:

| | pasadas | acuse perdido |
|---|---|---|
| Nace documento **después** del despacho | 6 | **6** |
| **No** nace documento después | 54 | **0** |

**60 de 60.** El discriminador que P34 dejó en 21/21 se replica exacto, y esta vez con el lado
negativo provisto a propósito por el control forzado.

### Qué cambia esto, y qué no

**Cambia la urgencia.** El defecto **no es del camino principal**. Un setter que trabaja desde
el panel —que es como trabaja— no lo puede alcanzar por construcción, no por margen.

**No cambia que exista.** Queda acotado a **F5, marcador y deep link sobre la raíz del lead**.
Son caminos reales de un setter, no artefactos de test: la barra de direcciones existe, y un
setter que recarga con `Ctrl+R` estando en m15 cae en H (a salvo), pero uno que guardó el link
del lead en un marcador cae en A.

**Y explica el rojo de las suites.** Las pruebas entran con `page.goto()` a la raíz — el único
camino con cadena. **Ven el defecto porque entran por donde el setter casi nunca entra.**

---

## 5 · Los cuatro caminos, re-costeados con el alcance a la vista

> Sin recomendación. Cada uno con lo que cuesta, lo que cubre y lo que deja afuera.

### Camino 1 · Que la cadena no haga navegación dura

**¿Cuántas redirecciones son?** Dos incondicionales (`[leadId]/page.tsx:23` y
`manual/page.tsx:21`) más dos rebotes condicionales en `[paso]/page.tsx:69,73` que sólo
disparan con un paso inexistente o no accesible — en la entrada normal no corren.

**¿Se pueden hacer blandas?** Desde el panel **ya son blandas** (§2.3). El problema no es el
`redirect()`: es que cuando la primera navegación es dura, cada salto de la cadena nace **un
documento propio** en vez de que el browser siga un 307 dentro de la misma navegación.

**La hipótesis barata existía, se midió, y FALLÓ.** Cada escalón de la cadena tiene un
`loading.tsx` (`[leadId]/loading.tsx` y `[leadId]/manual/loading.tsx`). La teoría: el
`loading.tsx` obliga a Next a flushear el shell de Suspense **antes** de que el server
component llegue al `redirect()`; con los headers ya mandados el redirect no puede ser un 307 y
se ejecuta como navegación nueva. Sacando los dos, la cadena colapsaría a un documento.

Se sacaron los dos, se rebuildeó (`exit 0`) y se midió con la misma sonda y el mismo arm frío:

| | documentos | margen peor | `hastaBoton` mediana | `hastaBoton` peor | acuse |
|---|---|---|---|---|---|
| **CON** `loading.tsx` (baseline) | **3** | +170 ms | 1208 ms | 2928 ms | 6/6 SÍ |
| **SIN** `loading.tsx` | **3** | +185 ms | 1351 ms | 2969 ms | 6/6 SÍ |

**Sin cambio.** La cadena sigue naciendo tres documentos, y la latencia hasta el botón no
mejora (queda igual o levemente peor, dentro del ruido). **El `loading.tsx` no es la causa de
la dureza.** Los dos archivos quedaron restaurados (`git checkout` por lista explícita).

**Costo real, entonces:** Camino 1 **no tiene implementación conocida**. De dónde sale la
dureza de esta cadena en Next 16 no quedó aislado, y aislarlo es un probe propio — no una
tarde. Las alternativas que quedan, todas sin costear y todas caras:

| Alternativa | Qué rompe |
|---|---|
| Que la raíz **renderice** el manual en vez de redirigir | se pierde la URL canónica por paso — que es de lo que viven los nueve enlaces internos y los deep links |
| Rewrite en middleware | derivar `posicion.actual` necesita la base (`cargarManualDelLead`); el middleware no la tiene |
| Que los enlaces del panel apunten a la canónica | **no arregla nada acá**: los del panel ya son blandos. El caso que queda es el F5 y el marcador, que no pasan por ningún enlace |

**Qué cubre si se lograra:** el 100 % del alcance restante (A). **Qué deja afuera:** nada.

### Camino 2 · Que el control no se dibuje hasta que la ruta esté asentada

**¿Se puede saber cuándo está asentada, o es otro número mágico?** Hay una señal honesta:
comparar `usePathname()` contra la ruta canónica del paso que se está renderizando — si m15 se
pinta en un documento cuyo pathname todavía no es `…/manual/m15`, la ruta no asentó. No hace
falta un timeout. (Un timeout **sí** sería mágico: P30 midió que el umbral es una carrera de
800-1100 ms, no un número.)

**Pero el alcance le cambia la pregunta.** En las **12 pasadas de entrada dura** de este probe
el botón **nunca** apareció antes del último documento de la cadena: el margen fue positivo
12/12 (+170 a +612 ms). Este camino protegería de una condición que **acá no se observó**. La
pasada roja de P34 sí la tuvo (despacho +1093 ms, m15 +1521 ms) — pero **sobre qué documento
estaba dibujado ese botón no quedó aislado**, y eso es exactamente lo que decide si este camino
protege de algo real o de nada.

**Superficie:** `barra-accion.tsx:112` (`useAccionPrincipal`) lo comparten **10** call-sites;
`useStepAction` son **9 archivos / 15 usos**. Un gate ahí los toca a todos.

**El riesgo propio, y no es chico:** un control que aparece tarde es fricción nueva, y en el
peor caso un control que no aparece nunca. La barra fija de P18 existe justamente para que la
acción esté siempre a la vista; esto la vuelve condicional.

**Qué cubre:** sólo el caso de la cadena (A). **Qué deja afuera:** nada más, porque no hay
nada más. **Qué agrega:** una condición nueva en el único control de cada pantalla.

### Camino 3 · Que el acuse sobreviva al cambio de documento

**Lo que ya está construido y NO se shippeó:** `docs/perf-p34/acuse.ts.descartado.txt`, 98
líneas, misma API que `sonner` para no tocar call-sites. P34 lo midió: **2/6 antes, 2/6
después.** No movió el número, porque el problema no es *cuándo se programa* el cartel — es que
**la continuación que lo pide nunca corre**. Este probe lo confirma desde el otro lado: en las
6 pasadas del control positivo, `run()` muere en `dentro-transicion`, antes de cualquier
`toast`.

**Lo que haría falta de verdad es otra cosa:** anotar la intención **antes** del despacho (en
`sessionStorage`, que sí cruza documentos) y emitir el acuse en el documento siguiente.

**Y ahí está la pregunta que no es técnica.** Eso emite «se registró» sin haber visto la
respuesta del servidor: el cliente no sabe si entró. En este caso puntual el servidor **sí**
había persistido — **60 de 60 pasadas con `EN BASE: SÍ`, incluidas las 6 que perdieron el
acuse** — pero eso es una observación sobre este camino, no una garantía: un error del servidor
daría exactamente el mismo silencio, y el acuse mentiría.

**Superficie:** los **18** `successToast`, los **15** usos de `useStepAction`, más el
mecanismo de rehidratación que hoy no existe.

**Qué cubre:** el acuse en todos los caminos, incluidos los que todavía no se midieron.
**Qué deja afuera:** el **reflejo** — la pantalla seguiría sin actualizarse, que es el otro
problema y es el que documenta `reflejo-del-arbol.invariant.ts`.

### Camino 4 · No arreglarlo, documentarlo, y poner la marca de cuarentena

**Qué costaría:** cero producto. Un comentario en `tests/helpers/setter-ui.ts` —donde ya vive
la nota de P33 sobre el rojo que este defecto produce— y en `01-flow.spec.ts`, más la entrada
de bitácora.

**Qué cubre:** nada del defecto. Cubre la **confusión**: que el próximo rojo de `expectToast`
en B1/B3/B4/B8 se lea como «conocido, alcance medido» y no como una regresión nueva — y que
nadie afloje el aserto, que es hoy lo único que lo denuncia.

**Lo que la cuarentena tiene que decir explícitamente**, y es el aporte de este probe: **las
pruebas lo ven porque entran por donde el setter casi nunca entra.** Las suites hacen
`page.goto()` a la raíz — el único camino con cadena dura. El setter entra desde el panel, que
es blando de punta a punta.

**Lo que NO cubre, y hay que nombrarlo:** el F5, el marcador y el deep link sobre la raíz
siguen siendo caminos reales de un setter. No son artefactos de test.

---

## 6 · Lo que este probe NO puede afirmar

- **Que el defecto «ya no pasa».** La reproducción natural dio 0/6 hoy; P34 dio 2/6 y 1/3 en
  esta misma máquina. Es una carrera, y el peor de N es lo que vale, no el de hoy.
- **Sobre qué documento estaba dibujado el botón en las pasadas que P34 perdió.** En las 12
  pasadas de entrada dura de este probe el botón **nunca** apareció antes del último documento
  de la cadena. En la pasada roja de P34 sí (despacho +1093 ms, m15 +1521 ms). Ese mecanismo
  —cómo llega el botón a un documento que va a morir— **no quedó aislado**, y es lo que decide
  si el Camino 2 protege de algo real.
- **El alcance en otras pantallas.** Todo se midió sobre **una** acción (`Ya la envié —
  registrar`, m15). Hay 15 usos de `useStepAction` y 18 `successToast`; la forma de la cadena
  es la misma para todos, pero el número es de ésta.
- **El alcance con otra latencia.** Una máquina más lenta, una base más lejos o un setter con
  la red peor mueven la carrera. Los márgenes de §3.1 son de acá.

---

## 7 · Cierre

- **Producto intacto.** `git diff` sobre `logic-core-v3/src/` del árbol principal: md5
  `11986102e79daf9e07f7c8421eef6551` al arrancar y al cerrar — el WIP heredado, byte por byte.
- **Worktree destruido**, sin recursión ciega: junction de `node_modules` desarmada **antes**
  de borrar nada.
- **Servidores bajados por PID.** Ningún proceso ajeno tocado.
- **Escrituras en la base:** sólo leads y avisos sembrados por el probe, todos con
  `businessName` prefijado y borrados por `teardown` de cada corrida; barrido final de
  huérfanos por nombre.

### Qué queda para la verificación humana

Elegir el camino **con el alcance a la vista**. Hoy la decisión se tomaría sin saber si el
defecto toca al setter o sólo a las pruebas — y esa diferencia cambia cuál de los cuatro es el
correcto.

# MERGE-2 — Verificación del merge de B1.2c y B1.3 en la rama de servicios

Versión 1 · 2026-10-18 · Autor: CC (merge-2) · Viene de: `docs/servicios/SPRINT-M0.md`. El merge lo hizo Valentino; acá solo se verifica, sin tocar git (salvo el commit de este log) ni el código. Sin dev y sin build.

**Estado en una línea:** el merge `1541db74` entró limpio y no tocó el carril. Trajo B1.2c, **B1.3** (el teléfono, que la consigna no nombraba) y la skill. Cuatro de los cinco tests de servicios y los seis barridos dan lo mismo que antes. **`pagina` da 2 fallas** (§5), del mismo origen: B1.2c le sumó una declaración a las reglas `[data-servicio]` del tema y el detector del test, que las lee como texto, quedó ciego. `tsc` da 0 errores sobre el código, pero **el comando completo falla con 129** de dos archivos generados en `.next/` por un dev anterior al merge (§4.1). Lo que servicios importa del home sigue igual, salvo `acento.ts`, al que solo se le sumó. Las historias de B1.3 **no se pueden reusar tal cual** para el precio en el teléfono (§8). No se arregló nada.

---

## 1. Qué trajo el merge (pedido 1)

- `git log -4 --oneline`: `1541db74` (el merge), `d8b5795d` (docs: plan M0), `875e9d53` (chore(skill)) y `2774c590` (B1.3).
- `HEAD` es `1541db74`, con padres `d8b5795d` (el plan M0, de esta rama) y `875e9d53` (la skill, del home). Merge-base `490762c0` (B1.2b 3/3, el que el merge-1 ya había traído).
- Entraron **tres commits** del home: `233fd262` (B1.2c), `2774c590` (**B1.3**, el teléfono) y `875e9d53` (la skill `pagina-home-based`).
- 60 archivos, +2838 −392: 35 en `_secciones` (casi todo `trabajos/portfolio/`), 13 en `_lib` (10 tests y 3 de la escena), 1 en `_chrome` (`enlaces.ts`), 1 en `_archivo`, `theme-develop.css`, 3 en `scripts-carga`, `docs/rediseno/SPRINT-B1-PORTFOLIO.md` y los 5 de la skill. La lista, en `C:\paginas-servicios-datos\merge2-cambiados.txt`.
- **Sin conflictos:** el diff combinado del merge (`git show --cc`) es vacío.
- **El carril no se tocó:** el diff entre `d8b5795d` y `HEAD` sobre `src/app/v3/_servicios/`, `src/app/v3/[servicio]/`, `docs/servicios/`, `public/servicios/` y `scripts-servicios/` es vacío.
- `git status --short` antes y después de todo lo hecho acá: solo `SPEC.md` y `CONTRATO.md` sin trackear. La rama está en sync con `origin/paginas/servicios`: el merge ya estaba pusheado.

---

## 2. La skill (pedido 2)

- **Existe:** `.claude/skills/pagina-home-based/`, 5 archivos trackeados por `875e9d53`: `SKILL.md` (6598 B), `CONTRATO.md` (13 542 B), `GUSTO.md` (2062 B), `METODO.md` (2866 B) y `VARIANTES.md` (2229 B). Leídos enteros; no se editó nada.
- **Lo que desde ahora ordena el trabajo** (lo que el prompt del M0 no decía o refuerza):
  - **Reusar, no imitar:** «"Que esté como en el home" quiere decir que se reusa la pieza del home, no que se imita» (`GUSTO.md:33`). Pesa en P-H19 (§8).
  - **El gate** (`SKILL.md:65-75`): lint, `tsc` con `--max-old-space-size=4096`, `npm run verificar` comparando **la lista** de fallas contra la base y, «en el worktree de servicios, s38, s44 y s74 también fallan por los finales de línea» (`:73`). Esa base no la tenía: los sprints del carril solo corrieron los seis barridos de §5.1. Queda anotado para el próximo sprint grande (§9).
  - Nunca «debilitar un test para que pase» (`SKILL.md:60`), nada de contenido inventado (`:61`), `lente.ts` fuera de todo commit (`:63`).
  - Todo sprint visual termina en FRENO: commit, verificación y lista numerada de qué mira Valentino, con URL y ancho (`METODO.md:35-51`); después se para. El plan de Fase 0 lleva opciones, costo y recomendación (`METODO.md:12-19`): el M0 ya lo hace.
- **La skill quedó vieja en tres puntos** (la propia skill pide avisarlo y no arreglarlo, `SKILL.md:10`):
  1. `CONTRATO.md` es la **versión 1** (2026-10-17, `:3`): conserva los «[NO CONFIRMADO]» que el S0 ya respondió, pide que servicios ponga `data-servicio` en el CTA (`:47` y `:96`; hoy es `data-precarga`, y `data-servicio` es lo único que el carril tiene prohibido emitir) y deja P-H2 como «condicional» (`:97`; el home ya lo hizo).
  2. `SKILL.md:19` manda a «`CONTRATO.md` §Ranura» y `METODO.md:57` a «§Fronteras»: **ninguna de las dos secciones existe** (el archivo va de la §1 a la §8; lo equivalente a «Fronteras» es la §4).
  3. El commit `875e9d53` dice sumar «excepcion .claude/skills en .gitignore», pero no toca ningún `.gitignore`: `../.gitignore:2` sigue ignorando `.claude/`. Los 5 archivos están trackeados a pesar de esa regla, y uno nuevo en esa carpeta no aparecería en `git status`. De rebote, Tailwind (que respeta `.gitignore`) no los escanea.

---

## 3. P-H2: los tokens claros que trajo B1.2c (pedido 3)

| Token | Valor | `src/app/theme-develop.css` | Sobre `#0E0E0E` |
|---|---|---|---|
| `--color-acento-web-claro` | `#8FC0E8` | **:356** | 10,00:1 |
| `--color-acento-ia-automatizacion-claro` | `#7FCBA4` | **:357** | 10,09:1 |
| `--color-acento-software-claro` | `#AFA0E8` | **:358** | 8,29:1 |
| `--color-acento-claro` (alias; defecto = web) | `var(--color-acento-web-claro)` | :360 | — |
| el alias, retiñido por contexto | claro de web, IA y software | :1368, :1373 y :1378, dentro de las reglas `[data-servicio]` de :1366, :1371 y :1376 | — |

- Los nombres siguen el `IdDeServicio` (`web`, `ia-automatizacion`, `software`), así que se derivan igual que el oscuro: `--color-acento-<id>-claro`. Los tres valores son **idénticos** a los `acento.claro` de los datos (`paginas-web.ts:33`, `ia-y-automatizaciones.ts:27`, `software-a-medida.ts:27`): el reemplazo del M1 es uno a uno.
- El contrato los publica en `_contrato/acento.ts`: `ALIAS_DE_ACENTO_CLARO` (`:72`), `CLASES_DE_ACENTO.textoClaro` = `text-acento-claro` (`:87`), `FORMAS_PERMITIDAS_SOBRE_OSCURO` (`:94-97`) y `FORMAS_PROHIBIDAS_SOBRE_CLARO` (`:100`): el claro como texto **no va sobre papel** (1,80 · 1,78 · 2,17).
- **Todavía sin usar** (van en el M1). Dos formas, ambas sin `data-servicio`: (a) lo de hoy, `--color-acento` con `var(--color-acento-<id>-claro)` en el `style` de la intro; (b) fijar `--color-acento-claro` y usar `text-acento-claro`. Recomiendo (a): un solo alias por página, el que ya leen `bg-acento` y el CTA.
- Ninguna regla del home nos alcanza: nada fuera del carril nombra `_servicios/` ni `[servicio]/` (`git grep` sobre `src/`, `scripts*` y `package.json`). La que pide el acento claro como texto «sólo en la sección de noche» (`s5-codigo.invariant.ts`, §6) es la regla a seguir en la intro, no un test que corra sobre ella.

---

## 4. Gate (pedidos 4, 5 y 6)

### 4.1 `tsc`

- **Con el `tsconfig` del repo** (`tsc --noEmit`): **129 errores**, 15 s. Ninguno en código: 126 en `.next/dev/types/routes.d.ts` y 3 en `.next/dev/types/validator.ts`, dos archivos que Next genera.
- **Causa:** un dev server corrió en este worktree el 18/10 entre las 08:54 y las 08:56 (fechas de `.next/dev/`), antes del merge (09:02), y dejó los dos archivos corruptos: en `routes.d.ts:173-282` hay entradas de rutas fuera de su `interface`, y en `validator.ts:1250` una cadena sin cerrar. `next-env.d.ts:3` importa el primero y `tsconfig.json` incluye `.next/dev/types`. No viene del merge (no cambió rutas) ni del carril.
- **Sin esos tipos generados:** **0 errores** sobre 3054 archivos, 36 s. Con un `tsconfig` descartable fuera del repo (`C:\paginas-servicios-datos\merge2\tsconfig.sin-next.json`: el del repo, sin `next-env.d.ts` ni `.next*`, y los tipos de `next` por referencia directa). Es el mismo programa que el de antes, salvo los tipos de rutas.
- No se tocó `.next/`. Para que el comando del gate vuelva a dar 0, lo normal es borrar `.next/dev/types` y dejar que el próximo dev lo regenere (no se probó acá). Lo decide Valentino.

### 4.2 Tests de servicios

| Test | Ahora | Antes (S3b) | Controles positivos |
|---|---|---|---|
| `datos` | 48 / 0 | 48 / 0 | 15 de 15 `ok` |
| `precios` | 22 / 0 | 22 / 0 | 8 de 8 |
| `slots` | 44 / 0 | 44 / 0 | 8 de 8 |
| `seo` | 56 / 0 | 56 / 0 | 10 de 10 |
| **`pagina`** | **157 / 2** | 157 / 0 | 74 de 74 `ok`, **3 de ellos en vacío** (§5) |

El único cambio de `pagina` contra la salida del S3b son esas dos líneas, de `ok` a `FALLA`.

### 4.3 Los seis barridos de §5.1

Comparados línea por línea contra la salida de la base (`C:\paginas-servicios-datos\s3b\barridos\`, el código de `e75fe035`; `s40` contra su corrida posterior al commit).

| Barrido | Ahora | Base | Diferencia |
|---|---|---|---|
| `s4-paquete` | 21 / 0 | 21 / 0 | una línea: el escáner recorre 4053 archivos de texto en vez de 4028 |
| `s8-montaje` | 56 / **2** | 56 / 2 | tres líneas de conteo (2452 → 2469 y 944 → 961 archivos); el `stderr` es **idéntico**: las mismas dos fallas, con los mismos seis archivos del home (`s32-escena7`, `s34-calidad1`, `EscenaDelCta`, `cuadroDelFinal`, …) |
| `s8-escena` | 33 / 0 | 33 / 0 | una línea de conteo (2452 → 2469) |
| `s9-sentry` | 22 / 0 (2 fuera de ventana) | igual | ninguna; los mismos dos «NO CORRE» (falta un `.next` de build) |
| `s40-3d-sonido` | 38 / 0 | 38 / 0 | ninguna |
| `s53-pulido-2` | 54 / 0 | 54 / 0 | ninguna |

Los conteos suben porque el home sumó archivos (17 en `/v3`). **Ninguna falla nueva.**

### 4.4 Cómo se corrió

`npx tsx` sobre cada invariante (los de servicios en `src/app/v3/_servicios/__tests__/`, los barridos con la ruta de su script `test:` del `package.json`), uno por vez, con la memoria libre mirada antes de cada pesado. Memoria libre al empezar 6,15 GB y **la más baja medida antes de un pesado, 3,91 GB** (antes de `s8-montaje`); comprometido 14,85 de 31,9 GB al empezar. Nada murió y no hubo reintentos. Salidas en `C:\paginas-servicios-datos\merge2\` (`tests/`, `barridos/`, `tsc.txt`, `tsc2.txt`).

**No se corrió:** `npm run verificar` completo, lint, `npm run build`, el dev ni el navegador (no estaban pedidos). De ahí que lo que el merge cambió en la escena (la pose del Portfolio, los títulos 3D) no se midió en las páginas de servicio.

---

## 5. Las dos fallas de `pagina` (no se arreglaron)

- **Cuáles:** `pagina.invariant.tsx:162` («el token oscuro de cada servicio es el que el tema le da…») y `:167` («la raíz fija el acento del cuerpo con el token de SU servicio…»; las seis páginas, en los dos modos).
- **Causa.** `pagina-detectores.ts:91-95` (`acentosDelTemaPorServicio`) lee cada regla `[data-servicio="…"]` del tema con una expresión que espera **una sola** declaración, `--color-acento: var(…)`. B1.2c le sumó a cada regla `--color-acento-claro` (`theme-develop.css:1366-1379`), así que ya no encaja ninguna: el mapa queda vacío y el test compara contra «(el tema no lo dice)».
- **Medido, no supuesto.** Corrí el mismo detector contra el tema de `d8b5795d` y el de ahora: **3 reglas leídas antes, 0 ahora**; los tokens de `@theme static` pasan de 111 a 115 (los tres claros y el alias). Los tres oscuros siguen en `theme-develop.css:326-328` y el código de servicios no cambió: lo roto es el lugar donde el test busca su referencia, no la página.
- **Tres controles pasan en vacío** (imprimen `ok` y ya no discriminan nada): `:164` («un servicio que el tema no conoce»), `:168` («el token de otro servicio») y `:169` («el claro en la raíz»). Con el mapa vacío el predicado rechaza hasta la página sana (`:167` lo prueba: las seis fallan), así que rechaza también la torcida. Es el mismo patrón que dejó el merge-1.
- **Precedente en el home.** B1.3 tuvo que arreglar «los lectores de acentos» de s1, s6 y el túnel archivado por lo mismo (su commit lo dice): `_secciones/_invariantes/soporte.ts:269-278` separa los tokens que terminan en `-claro` de los demás y `_archivo/tunel-portfolio/trabajos-piezas.ts:197-198` filtra lo que termina en `-claro`. El de servicios es otro lector más con ese problema.
- **Propuesta para el M1 (sin aplicar; dentro del carril).** M1 ya toca esas líneas: sale `acento.claro` y la intro pasa a leer el token claro del tema. Primero, que el detector lea **todas** las declaraciones de cada regla y se quede con `--color-acento` (y con `--color-acento-claro`, que sirve para comparar el claro de la intro). Criterio: las 2 fallas a 0, los controles `:164`, `:168` y `:169` vuelven a discriminar, y un control nuevo: una regla con dos declaraciones se lee igual.

---

## 6. Lo que servicios importa del home (pedido 7)

El mapa de imports del carril contra el disco da **21 archivos del home** (`C:\paginas-servicios-datos\merge2-imports.txt`). Contra el merge-1, suma dos que el S3b incorporó (`_lib/superficies.ts` y `_contrato/Rotulo.tsx`) y deja uno (`src/lib/utils.ts`, que usaba el vidrio). De los 21, **uno cambió con el merge: `_contrato/acento.ts`**, y solo se le sumó.

| Pieza que toma servicios | Dónde | ¿Cambió? |
|---|---|---|
| Modal de contacto: `Contacto`, `PRECARGA_POR_SERVICIO`, y `data-precarga` (`apertura.ts:123`) | `[servicio]/page.tsx`, `bloques/Llamado.tsx:21` | No (`_chrome/contacto/` sin cambios) |
| `Cta`, `CtaEnlace` | `bloques/Llamado.tsx`, `bloques/Prueba.tsx` | No |
| `Titular`, `Textos`, `Envoltorio`, `Imagen` | los bloques | No |
| `LOGOTIPO` y la marca | `datos/*.ts`, `seo.ts`, `Encabezado.tsx` | No |
| **`IdDeServicio`, `ALIAS_DE_ACENTO`, `IDS_DE_SERVICIO`, `numeroEnLaSecuencia`** | `tipos.ts:10`, `estiloDelAcento.ts:16`, `pagina.invariant.tsx:26`, `bloques/Proceso.tsx:6` ← `_contrato/acento.ts` | **Solo aditivo (+23 −0).** Los cuatro siguen y con la misma firma, movidos de línea (`IdDeServicio` :48 → :57, `ALIAS_DE_ACENTO` :60 → :69, `IDS_DE_SERVICIO` :111 → :129, `numeroEnLaSecuencia` :126 → :149). Nuevo: `ALIAS_DE_ACENTO_CLARO` (:72), `textoClaro` (:87), `FORMAS_PERMITIDAS_SOBRE_OSCURO` (:94-97), `FORMAS_PROHIBIDAS_SOBRE_CLARO` (:100) e `idDelServicioLlamado` (:132) |
| Revelados: `coreografia`, `canales`, `cruce`, `asentamiento`, `bloqueAnimado`, `secuencia`, `marcaHomeQuieto`, `CompuertaDelHome` | `movimiento/*`, `[servicio]/page.tsx` | No (todos con 0 líneas de diff) |
| Superficie `papel-opaco` (`_lib/superficies.ts`) y `MarcaDeSeccion` (`Rotulo.tsx`) | `bloques/Bloque.tsx:21-22` | No |
| La llave (`llave.ts`, `inventado.ts`) | M0 §11 (la réplica) | No (`CONTENIDO_INVENTADO` sigue apagada) |
| `PROYECTOS`: `slug`, `nombre`, `rubro`, `url`, `medios.poster`, `alt` | `datos/fuenteDeProyectos.ts:10` → `bloques/Prueba.tsx` | No (`proyectos.ts` sin cambios) |
| **`theme-develop.css`, leído como texto por `pagina`** | `pagina.invariant.tsx:158` | **Sí:** es lo que rompió el detector (§5) |

**Cierre transitivo.** Desde las páginas de servicio se alcanzan 178 archivos y 4 los modificó el merge: `acento.ts` (directo) y tres de la escena (`portfolioEnLaEscena.ts`, `poseDelPortfolio.ts`, `titulos3d/colocacion.ts`), por la cadena que ya existía en el merge-1: la ruta → `CompuertaDelHome` → … → `_lib/diagnostico/publicar.ts`. Desde el layout de `/v3` se alcanzan 348 y los mismos 3 de la escena, por `EscenarioCompuerta` → `titulos3d`. Cambian la pose y el título 3D del Portfolio cuando el Portfolio está adentro; en las páginas de servicio no se midió (P-H4 sigue abierto).

---

## 7. Lo que el M0 cita y cambió con el merge (pedido 8)

De las citas `archivo:línea` del M0, 10 apuntan a un archivo que el merge tocó. **5 siguen iguales** (`theme-develop.css:179` y `:253-254`, `SPRINT-B1-PORTFOLIO.md:504-511`, citada dos veces, y `:727`) y **5 hay que corregir**:

| M0 | Dice | Ahora |
|---|---|---|
| :226 y :384 | `_contrato/acento.ts:89` (`CLASE_TINTA_SOBRE_ACENTO = 'text-fondo'`) | Se movió a **`:107`** |
| :243 y :610 | `EscenarioDelPortfolio.tsx:34`: «abajo de 768 lo reemplazan las historias (B1.3)», y de ahí que «hoy no existen» | Esa frase ya no está (`:34` es otro texto): **B1.3 existe**. Ver §8 |
| :550 | `usePortfolio.ts:221-239` (el ancla al cargar con `#portfolio-…`) | Salió a **`useAnclaDeLaCarga.ts:13-32`**, sin cambios de lógica |

Además, por prosa y sin número de línea:

- **§6 y §0 (punto 7), «P-H22»:** dicen que `233fd262` está «sin push» y piden pushearlo. **Ya no vale:** B1.2c está en esta rama y pusheado. P-H22 se cierra. Los tres nombres de token del M0 (`--color-acento-<id>-claro`) **coinciden** con los del tema (§3).
- **§9 y §6, el test del acento:** el M0 propone comparar el claro de la intro «igual que el oscuro» (`pagina.invariant.tsx:157-164`). Ese camino pasa por el detector roto de §5: hay que arreglarlo antes.
- **§3.5 y P-H19:** «las barras de progreso… son de B1.3, que todavía no existe». Las barras son de B1.2c (tablet) y B1.3 las reusa en el teléfono. P-H19 se reescribe en §8.
- **§4.6, el video «uno a la vez»:** el M0 propone un solo `<video>` que elige la versión por el ancho. B1.3 resolvió lo mismo con otra forma, ya medida por el arnés del home: los dos `<video>` en el marcado, el CSS esconde uno y un `ResizeObserver` lee cuál se ve, y solo ése pide su archivo (`MedioDeLaTira.tsx:25-26` y `:78-87`). Conviene alinear el M3 con esa (**reusar, no imitar**).
- Sin cambios: D9 (`#portfolio-el-garage` sigue siendo el ancla; `anclas.ts` no cambió), los patrones de revelado y los pedidos P-H18, P-H20, P-H21 y P-H23.

---

## 8. B1.3 y P-H19: ¿las historias del Portfolio sirven para el precio en el teléfono?

**Respuesta corta: la idea sí, las piezas no tal como están.** Las historias no son un componente: son *el mismo marcado de la tira, restilizado abajo de 768* (`SPRINT-B1-PORTFOLIO.md:1054`), y lo que las mueve cuelga de `PortfolioVivo` y de `[data-panel]`, que servicios no puede emitir.

### 8.1 Cómo están hechas

- La sección escribe `--modo-del-portfolio: historias` abajo de 768 (`Trabajos.tsx:58-59`) y el JS lo lee del CSS (`tramoDelSelector.ts:27-29`, `usePortfolio.ts:141`); no mide el ancho.
- La tira activa llena la pantalla: el lomo se esconde en el teléfono (`Tira.tsx:34`), el video va a pantalla completa (`:130`) y la ficha es una hoja que sube desde abajo (`:43-45` y `:136`).
- **Dos toques**, anterior (el tercio izquierdo) y siguiente (el resto): `ToquesDeLaHistoria` (`Tira.tsx:52-59`) llama a `vivo.irAl(±1)` (`usePortfolio.ts:68`).
- **Las barras** de arriba: `BarrasDelPortfolio` (`BarrasDelPortfolio.tsx:37-46`), cuatro, la activa con lo recorrido del paso (`vivo.avanceDelPaso`, `usePortfolio.ts:57`).
- **Deslizar es el scroll de la página;** quieta (160 ms), se asienta en el centro del proyecto, a lo sumo uno más allá: `asentamiento` (`deslizamiento.ts:17-22`) y `useDeslizamientoDelPortfolio` (`:23-69`).
- Todo corre sobre un escenario `sticky` (`EscenarioDelPortfolio.tsx:62`) adentro de la `Seccion` del home (`Trabajos.tsx:70`), medida contra `[data-panel]`.

### 8.2 Qué exporta cada pieza y si servicios la puede usar

Las piezas viven en `src/app/v3/_secciones/trabajos/portfolio/`.

| Pieza | Archivo:línea | Exporta | Atada a | ¿Reusable? |
|---|---|---|---|---|
| El asentamiento | `deslizamiento.ts:11`, `:17` | `DESLIZAMIENTO` (0,04 y 160 ms) y `asentamiento(desde, crudo, desvio)`, puras | `CANTIDAD_DE_PASOS`, `ANTES_DEL_PIN`, `EN_LA_COLA` de `pasos.ts` (`:8`): asume **4** pasos | Las constantes sí. La función no |
| El gancho del deslizamiento | `useDeslizamientoDelPortfolio.ts:10-16`, `:23` | `ControlDelDeslizamiento` (caja, `paso()`, `ocupado()`, `irAlPaso()`) y el hook | `medir()` (`:33`), que busca `[data-panel]` (`medida.ts:18`), y `PANTALLAS_POR_PASO`, `pasoEn`, `bordesDelPaso` (`:7`) | **No:** la interfaz es genérica, el cuerpo no |
| Las barras | `BarrasDelPortfolio.tsx:16`, `:18`, `:37` | `EstadoDeLaBarra`, `estadosDeLasBarras(tira, fase)` y el componente (props: `vivo`) | `PortfolioVivo`; `CANTIDAD_DE_TIRAS` = 4 (`estado.ts:34`); `Barra` ni se exporta (`:22`) | **No:** el número de barras es fijo |
| Los toques | `Tira.tsx:52` | `ToquesDeLaHistoria` (props: `vivo`) | `vivo.irAl`; rótulos «Proyecto anterior/siguiente» (`contenido.ts:95`) | **No** |
| La hoja | `Tira.tsx:43`, `:45` | `CLASE_DE_LA_HOJA`, `CLASE_DE_LA_HOJA_ABAJO` (cadenas) | el vidrio sobre el video: lenguaje del Portfolio | Importables, pero el precio no la necesita |
| El salto | `saltar.ts:14-22` | `SALTO`, `duracionDelSalto`, `curvaDelSalto`, `saltarA`: puras | nada del Portfolio | Técnicamente sí. Pero el home movió código de esa carpeta en este mismo merge (`medida.ts` y `useAnclaDeLaCarga.ts` salieron de `usePortfolio.ts`): importarlas es el acople frágil del merge-1 |
| La medición | `medida.ts:17`, `:28`, `:38`, `:82` | `medir`, `pegado`, `publicar`, `volarAlPx` | `[data-panel]` y el escenario pegado | **No** |
| El mapa de pasos | `pasos.ts:28`, `:31`, `:91-102`, `:117`, `:123` | `PANTALLAS_POR_PASO` (1,5), `CANTIDAD_DE_PASOS` (4), `pasoEn`, `bordesDelPaso`, `centroDelPaso`, `scrollDelPx` | la aproximación de 900 px y la cola de Demos | Reciben `paso` por parámetro, pero no la cantidad ni la aproximación |

Fuera de `portfolio/`, ningún código de producción consume estas piezas (`git grep`). Las atan tests del home, unos **importándolas** (`s76-portfolio-historias.tsx:13` `asentamiento` y `:18` la hoja y `CLASES_DE_LA_TIRA`; `s76-portfolio-b12c.tsx:25` `estadosDeLasBarras`) y otros **leyendo su código como texto** (`s76-portfolio-historias.tsx:60`, `:81` y `:95`; `s76-portfolio-b12c.tsx:220`; `trabajos.invariant.tsx:62`), además del padrón `s5-archivos.ts:107` y `:260`.

### 8.3 Qué habría que pedir (P-H19, reescrito)

Subir al contrato de secciones (`_secciones/_contrato/historias.ts` y `.tsx`, como se hizo con `cruce.ts`) lo que no depende del Portfolio, y dejar las piezas del Portfolio como adaptadores finos sobre eso:

1. `asentamiento(desde, crudo, desvio, cantidad)` y `DESLIZAMIENTO`: la cantidad de pasos por parámetro.
2. `useDeslizamientoDeHistorias({ activo, cantidad, medir, paso, ocupado, irAlPaso })`: la medición entra por parámetro (devuelve el paso crudo y el desvío del centro), sin `[data-panel]` ni `PANTALLAS_POR_PASO`.
3. `BarrasDeHistorias({ cantidad, indice, fase, avance })`, con `avance` como el `MotionValue` que ya usan, y `estadosDeLasBarras(cantidad, indice, fase)`.
4. `ToquesDeHistoria({ alAnterior, alSiguiente, rotuloAnterior, rotuloSiguiente })`.
5. *Opcional y lo más caro:* `pasoEn` y `bordesDelPaso` con `{ aproximacion, cantidad }`. Servicios no lo necesita: reparte el avance con `tramoDeSecuencia` (`_contrato/secuencia.ts:53`).

Qué tocaría el home: `deslizamiento.ts`, `useDeslizamientoDelPortfolio.ts`, `BarrasDelPortfolio.tsx`, `Tira.tsx` (los toques) y `usePortfolio.ts`, que ya está en 278 de 300 líneas; esta extracción le saca peso. Esos tests clavan el texto de las piezas (los toques, los escuchas del hook, el uso de `BarrasDelPortfolio`), así que la extracción los obliga a ajustarlos aunque se conserven las exportaciones de hoy. Los edita el home: servicios no edita ningún test del home.

### 8.4 Qué hace servicios mientras tanto

- **M2 hace el teléfono del precio con las hojas `sticky`** (M0 §3.5): CSS solo, una opción por pantalla con el corte diagonal, sin nada de lo de arriba. Queda **sin** las barras, los toques y el asentamiento.
- **P-H19 queda abierto, no bloqueante.** Cuando el home publique el módulo, un subsprint chico suma las tres piezas sobre las tres opciones.
- *No lo recomiendo:* importar hoy de `trabajos/portfolio/`. Habría que reescribir `PortfolioVivo` y emitir `data-panel`, que está prohibido, y el acople se rompe con el próximo cambio del home.
- **Decisión para Valentino (D15).** (a) M2 sin barras ni toques ni asentamiento y se suman con P-H19 *(recomendado: no frena el M2 y no imita)*; (b) esperar P-H19 para el teléfono del M2; (c) que servicios arme sus propias barras y toques (es imitar, no reusar: `GUSTO.md:33`).

### 8.5 No determinable leyendo

- Si el asentamiento anda bien en una sección de 300svh con un hijo `sticky` y cortes diagonales, y no en un escenario con `Seccion`: se mide en el M2 con tres muestras a 250 ms, con el dedo quieto.
- Si dos botones de pantalla completa (los toques) estorban al scroll táctil sobre los paneles del precio: se prueba en el teléfono de Valentino.

---

## 9. Pedidos y observaciones

- **P-H22 (pushear B1.2c): cerrado** por el merge. **P-H2: resuelto por el home** (§3); el M1 lo usa. **P-H9:** el M0 lo cierra al retirar `Prueba` (M1).
- **P-H19: reescrito** (§8.3). **P-H18, P-H20, P-H21 y P-H23:** sin cambios (`tu-panel/` no se tocó en el merge).
- **Para Valentino:**
  1. Borrar `.next/dev/types` (§4.1) para que el gate de `tsc` vuelva a dar 0 con el comando del repo.
  2. Decidir D15 (§8.4).
  3. Avisar al chat del home que `CONTRATO.md` de la skill quedó en la versión 1 (§2).
- **Para el M1** (además de lo del M0): arreglar primero el detector de §5; corregir en el M0 las 5 citas de §7 (o dejarlas anotadas en el log del M1).
- **Pendiente de un sprint grande:** correr `npm run verificar` completo y comparar la lista de fallas con la base, incluidos s38, s44 y s74 por los finales de línea (`SKILL.md:73`). Nadie lo corrió desde el S3b.
- **Abiertos sin cambios:** P-H4 (la escena debajo de la tapa; el merge toca la pose del Portfolio, que acá no se ve), P-H10 y P-H12.

---

## 10. Cierre

- **Un solo commit,** «docs: verificacion del merge de B1.2c», con este LOG como único archivo. Nada de código tocado; `SPEC.md` y `CONTRATO.md` siguen sin trackear a propósito. Nada fuera de `docs/servicios/`.
- **Cierre de recursos:** servicios no levantó dev ni navegador: el puerto 3001 está libre y no queda ningún proceso de esta sesión. Al terminar hay un `next dev` corriendo en el worktree del home (`C:\rediseno-home`, puerto 3000) que no es de esta sesión y no se tocó, además de los `node` permanentes de `chrome-devtools-mcp`.
- **Datos y scripts** en `C:\paginas-servicios-datos\merge2\` y `merge2-*.txt` (tsc, tests, barridos, mapa de imports, cierre transitivo, citas del M0, lista de cambiados) y en el scratchpad de la sesión (`merge2/citas.cjs`, `merge2/lector.ts`); ninguno en el repo.

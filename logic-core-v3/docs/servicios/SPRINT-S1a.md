# SPRINT S1a — La base, los tipos y los datos de los tres servicios (sin UI)

Versión 1 · 2026-10-17 · Autor: CC (S1a) · Plan: `docs/servicios/SPRINT-S0.md` v2 (§1, §5, §7, §8, §10 y §12) · Contenido: `docs/servicios/SPEC.md` §7.

Sin UI, sin ruta y sin dev. Un commit, con este log y el plan (D19). `SPEC.md` y `CONTRATO.md` no se commitean.

---

## 1. Estado

| Qué | Valor |
|---|---|
| Rama y HEAD | `paginas/servicios` en `54655181` (B1.2), el mismo del plan: no hubo que revalidar citas. |
| `git status --short` al empezar | `?? docs/servicios/` |
| Memoria libre | 4,67 GB a las ≈15:35 y 3,63 GB al lanzar la base (15:39), con Chrome abierto. El umbral es 3 GB. A las 16:00, ya con la base tomada, bajó a 0,5 GB (1,2 GB disponibles) con el pool no paginado en 3,7 GB: ver el tsc en la sección 4. |
| El home | Al empezar no corría nada pesado: solo los `node` permanentes de `chrome-devtools-mcp`. Después: un tsc a las 15:50 (por la hora del `tsconfig.tsbuildinfo` del home) y un `npm run verificar` a las 15:51:18, de la sesión del home (los shells que lo lanzaron tienen cwd `rediseno-home`), un segundo después de que terminó el mío. Por la regla de un solo proceso pesado, **el tsc del gate esperó a que terminara el suyo** (15:59:15). |
| `.next` | Había un `.next/dev` de 23 MB de las 15:31 (un `next dev` que alguien levantó y paró; sin `BUILD_ID`, o sea que no es un build) y un `next-env.d.ts` generado en el mismo momento. El prompt pedía la base «sin .next». **No los toqué:** no los creé yo, y `next-env.d.ts` importa `./.next/dev/types/routes.d.ts`, así que sacar el directorio metía un error falso de tsc. La base se tomó con ese estado. Si se la quiere sin ese directorio, se retoma (≈11 min). |

---

## 2. La base

Tomada **antes de crear un solo archivo en `src/`**: al terminar, `git status --short` seguía mostrando solo `?? docs/servicios/`.

- **Comando:** desde Git Bash, `npm run verificar > /c/paginas-servicios-datos/verificar-base.txt 2>&1`.
- **Duración:** 15:40:35 → 15:51:16, **641 s (10 min 41 s)**, con código de salida 1.
- **Pasos:** 83 (paso 1, 1b, 2 y 80 agregados). **11 grupos en rojo**.
- **tsc:** el paso 2 dio «sin errores de tipos» en 42,9 s. La base de tsc tiene **0 errores**: `tsc-base.lista.txt` está vacío, y el gate de tsc es «cero errores».
- **Fallas:** 17 invariantes en rojo, con **108 afirmaciones** fallidas. La lista (`verificar-base.lista.txt`) tiene una por línea, con la forma `grupo · invariante · afirmación`, sin el detalle que viene después de « — » (sus números cambian entre corridas sin que cambie la falla).

| Grupo | Invariante en rojo | Afirmaciones fallidas |
|---|---|---|
| s1 | `test:s1-bundle` | 12 |
| s17 | `test:s17-revelado` | 1 |
| s2 | `test:s2-bundle` | 16 |
| s2 | `test:s2-css` | 2 |
| s3 | `test:s3-peso` | 13 |
| s38 | `test:s38-interfaz2` | 1 |
| s4 | `test:s4-cobertura` | 1 |
| s4 | `test:s4-heredado` | 4 |
| s44 | `test:s44-pie` | 1 |
| s5 | `test:s5-compacto` | 1 |
| s5 | `test:s5-peso` | 8 |
| s7 | `test:s7-compuerta` | 18 |
| s74 | `test:s74-cierre-a-bis` | 1 |
| s8 | `test:s8-chrome` | 2 |
| s8 | `test:s8-montaje` | 2 |
| s8 | `test:s8-peso` | 14 |
| s8 | `test:s8-tres` | 11 |
| | **Total (11 grupos, 17 invariantes)** | **108** |

Por grupo: s1 12 · s17 1 · s2 18 · s3 13 · s38 1 · s4 5 · s44 1 · s5 9 · s7 18 · s74 1 · s8 29.

- **Diez de los 17 piden un build:** `s1-bundle`, `s2-bundle`, `s2-css`, `s3-peso`, `s4-heredado`, `s5-peso`, `s7-compuerta`, `s8-chrome`, `s8-peso` y `s8-tres` leen `.next` y fallan con «0 archivos», «0 chunks» o «0 hojas de CSS».
- **Los otros siete** (`s17-revelado`, `s38-interfaz2`, `s4-cobertura`, `s44-pie`, `s5-compacto`, `s74-cierre-a-bis` y `s8-montaje`) son rojos del home en `54655181`. No los analicé: están fuera del alcance de servicios.
- CONTRATO O-5 nombra 8 grupos rojos (s1, s2, s3, s4, s5, s7, s8 y s17). La base de hoy suma **s38, s44 y s74**.

**Archivos de la base**, todos en `C:\paginas-servicios-datos\` (fuera del worktree, D16):

| Archivo | Qué es |
|---|---|
| `verificar-base.txt` | La salida entera de `verificar` (146 KB). |
| `verificar-base.lista.txt` | Las 108 fallas, una por línea, ordenadas. |
| `tsc-base.lista.txt` | Los errores de tsc: **vacío** (0 errores). |
| `verificar-base.meta.txt` | Código de salida, hora de inicio y fin, y duración. |
| `extraer-lista.cjs` | El extractor que armó la lista: `node extraer-lista.cjs <salida.txt> <lista.txt>`. Los sprints siguientes lo usan para armar la lista de una corrida nueva. |

- **Los nombres de las listas** son los del prompt del S1a (`.lista.txt`), no los del plan (§12.4 decía `.fallas.txt` y `.errores.txt`). Desde acá valen estos.
- **Cómo se compara:** una falla es nueva si su línea no está en `verificar-base.lista.txt`. Con las dos listas ordenadas, `comm -13 verificar-base.lista.txt <lista-nueva>` imprime solo las nuevas. En tsc, cualquier error es nuevo, y todo error en `_servicios/` o en `[servicio]/` lo es por definición.
- **Si entra un merge de `rediseno/home`,** la base se vuelve a tomar (§12.4).

---

## 3. Archivos

Todos en `src/app/v3/_servicios/`. Ningún archivo más: no hizo falta una constante de marca, porque `LOGOTIPO` ya existe en el home.

| Archivo | Líneas | Qué es |
|---|---|---|
| `tipos.ts` | 138 | `SLUGS_DE_SERVICIO`, `ServicioSlug`, `esServicioSlug` y todos los tipos (plan §8.1). |
| `formato.ts` | 34 | `usd()`, `MARCADOR_A_DEFINIR`, `textoOMarcador` y `usdOMarcador` (modo inyectado). |
| `rutas.ts` | 18 | `RAIZ_DE_LAS_PAGINAS` y `hrefDe(slug)`. `PUBLICADOS` llega con la ruta, en el S1b. |
| `precios.ts` | 46 | `PRECIOS_DESDE`, `precioDesde(slug)` y `precioDesdeDe(precio)`. Derivado de los datos; sin componentes. |
| `datos/fuenteDeProyectos.ts` | 10 | La única línea que sabe de dónde salen los proyectos: `PROYECTOS as FUENTE_DE_PROYECTOS`. |
| `datos/paginas-web.ts` | 151 | SPEC §7.1. |
| `datos/software-a-medida.ts` | 92 | SPEC §7.2. |
| `datos/ia-y-automatizaciones.ts` | 133 | SPEC §7.3. |
| `datos/servicios.ts` | 27 | `SERVICIOS` (los tres, en el orden del SPEC) y `servicioDe(slug)`. |
| `__tests__/datos.invariant.ts` | 273 | Los datos contra el SPEC. |
| `__tests__/precios.invariant.ts` | 154 | Los precios, el grafo de imports y el formato. |

- Cero `any`. Todo `readonly`. `tipos`, `formato`, `rutas`, `precios` y `datos` no importan `.tsx`, react ni next.
- La marca sale de `LOGOTIPO` (`_componentes/marca/sistema.ts`): ninguna palabra de la marca está escrita en `datos/`.
- El único hex de `_servicios/` es `acento.claro` (tres líneas, cada una con `// P-H2`).
- Ningún test del home se editó, y no se tocó nada fuera de `src/app/v3/_servicios/` y `docs/servicios/`.

---

## 4. Gate

| Chequeo | Resultado |
|---|---|
| `datos.invariant.ts` | 48 afirmaciones, 0 fallas. |
| `precios.invariant.ts` | 22 afirmaciones, 0 fallas. |
| Controles positivos | Todos detectan: el detector de cada comprobación falla contra su entrada equivocada (calibre y software alterados, slug falso, calibres invertidos, un 0 en `implementacionDesde`, pregunta que falta, respuesta sin su línea del SPEC, texto que ofrece WhatsApp, marca suelta, hex suelto, `claro` sin `// P-H2`, botón sin `// C2`, cifra inventada, servicios cambiados de lugar, proceso de 4 pasos, null / 0 / infinito como precio, plan más barato, `.tsx` / `export *` a `proyectos.ts` / `next` en el grafo, número donde falta un dato). |
| Lint | `eslint.cmd` sobre los 11 archivos: salida limpia, código 0 (27 s). |
| Los 6 barridos de §5.1 | `s8-montaje`: 56 afirmaciones y **las mismas 2 fallas de la base** (idénticas, verificado contra la lista). `s8-escena` 33, `s40-3d-sonido` 38, `s53-pulido-2` 54, `s9-sentry` 22 (2 fuera de ventana, como en la base) y `s4-paquete` 21: 0 fallas. |
| Padrones que podrían mirar la carpeta nueva | Extra, no pedido: `s4-cobertura` (1 falla, **la misma de la base**), `s3-tokens`, `s3-codigo`, `s7-contrato`, `s10-acceso` y `s6-lane`: 0 fallas, con las mismas cifras que la base. |
| Clases arbitrarias de Tailwind | Ninguna deletreada en `_servicios/` (barrido con el patrón de la V2). |
| Marcadores de conflicto | Ninguno en `_servicios/` ni en `docs/servicios/`. |
| tsc completo | **Cerrado en el S1b: 0 errores** (sección 7). Había quedado pendiente (VERIFICAR TRAS REINICIO): desde las 16:00 la máquina tuvo entre 0,5 y 1,2 GB libres (1,2 GB disponibles) y el pool no paginado en 3,7 GB, y la regla de memoria pide 3 GB. La espera que dejé en segundo plano para correrlo fue **cortada por Claude Code por memoria crítica**; no se relanzó. No quedaron procesos huérfanos. Cómo cerrarlo en la sección 7. |
| tsc acotado a `_servicios/` | **0 errores** (3 s). `tsc -p` con una config fuera del repo que extiende el `tsconfig.json` del proyecto (mismas opciones) e incluye solo `src/app/v3/_servicios/**/*.ts`. El programa tomó los 11 archivos y su cierre de imports (`acento`, `llave`, `marcadores`, `inventado`, `proyectos`, `sistema` y `afirmar`). **Control de mutación:** la misma config, con un archivo de prueba que le asigna un `slug` inválido a un `Servicio` y un texto a un número, da 2 errores TS2322 (código 2). Como la base de tsc tiene 0 errores y los archivos nuevos no tocan tipos globales, el resultado esperado del completo es 0 errores. **No reemplaza al completo.** |

`verificar` completo no se corre: va en el S4.

---

## 5. Decisiones tomadas

Cada una es una decisión de CC, salvo que diga lo contrario. Valentino las revisa al mirar los datos.

**Sobre los datos**
1. **«Autogestionable» va en el campo, no en el texto.** El SPEC lo escribe dentro de «Qué es» de Mediana y Premium; en los datos esa palabra es `autogestionable: true`, y `descripcion` queda sin ella. Así hay una sola fuente del hecho, y la Simple puede ser `null` ([a definir]).
2. **El extra de web se parte con las palabras del SPEC.** Cada línea del mantenimiento es un ítem con `nombre`, `detalle` y `precio` tal como lo publica el SPEC: «Desde el panel», «Desde USD 50», «Desde USD 100» y «Siempre incluidos». El plan mensual es el único con `precio: null`.
3. **Los precios del mantenimiento salen de dos constantes** (`CAMBIO_MEDIANO_DESDE` y `CAMBIO_GRANDE_DESDE`) que usan el extra y la respuesta del FAQ, así no se desfasan.
4. **`proceso.plazo` es el valor sin la etiqueta:** «De 2–3 semanas a 2–3 meses según el calibre», «Depende de la complejidad» y «Unas 4 semanas». La etiqueta «Plazo de referencia» la pone el template (S1b), igual para los tres: plazos nunca prometidos (SPEC §5).
5. **`cta.texto` pasa a `string | null`.** Cambio respecto del plan (§8.1 decía `string`). El SPEC trae solo el título del CTA de IA («Que tu negocio atienda las 24 hs»), y la regla es no inventar: `null` y el bloque se arma sin párrafo. El plan no se editó; este punto es el que manda.
6. **Los botones del CTA** (copy provisorio, `// C2: provisorio`, patrón «Quiero mi …» del home): «Quiero mi página web», «Quiero mi software a medida» e «Quiero mi asistente con IA».
7. **Software, casos propios:** «Sistema de gestión» con rubro «Pollería» y «Sistema de boletas» sin rubro (el SPEC no lo da), los dos con `texto` e `imagen` en `null`. La nota «2 sistemas más en desarrollo» va en `prueba.nota`.
8. **IA:** `ctaPanel` = «Probá el panel» → `/login` (D11). `nota` del precio = «Implementación: pago único.»; `implementacionDesde` y las funcionalidades de los tres planes, en `null`. WhatsApp aparece solo en el título de un artículo del blog, que no se monta mientras no haya `href`.
9. **El FAQ sigue la tabla de D9** (§12.2), que Valentino ya confirmó. Cada respuesta escrita lleva `// SPEC §7.x` en la línea de arriba. Las tablas están en la sección 6.

**Sobre los tests**
10. **`precioDesdeDe(precio)` se exporta,** además de lo que pedía el plan, para probar la derivación con un precio armado a propósito (el control «un plan más barato cambia el mínimo»).
11. **Los tests de `formato.ts` viven en `precios.invariant.ts`:** es formato de precios, y así no hay un tercer archivo de tests.
12. **El recorrido del grafo de imports es propio** (regex sobre un sistema de archivos inyectable, que permite el control positivo con uno de mentira). No importa helpers de tests del home.
13. **Controles de más, no pedidos:** la lista exacta de preguntas del SPEC; que toda cifra escrita en un texto esté en el SPEC; que el botón, el `title` y la `description` lleven `// C2`; que `seo.title` sea `nombre · LOGOTIPO`; que cada proceso tenga 5 pasos; que `seo.description` sea `queHacemos.texto` (D10); y que los barridos «miren algo» (no pasan por vacío).

**Sobre el entorno**
14. **Los nombres de las listas** son los del prompt (`.lista.txt`) y no los del plan (sección 2).
15. **`.next/dev` y `next-env.d.ts` se dejaron donde estaban** (sección 1).
16. **El mensaje del commit va sin tilde** («paginas»), como todos los commits del repo y por el encoding de la consola de Windows.

---

## 6. Para revisar

### 6.1 El FAQ

| Servicio | Pregunta | Respuesta | Fuente |
|---|---|---|---|
| Páginas web | ¿Cuánto tarda una web? | Como referencia, de 2–3 semanas a 2–3 meses según el calibre. El proceso va de la charla a la propuesta, el diseño, el desarrollo y la entrega. | §7.1 Proceso |
| Páginas web | ¿Puedo editarla yo después? | Las webs Mediana y Premium son autogestionables: las ediciones chicas (textos, precios, fotos, horarios) se hacen desde el panel. | §7.1 Calibres y Extra |
| Páginas web | ¿Qué pasa después de la entrega? | Los arreglos de algo roto siempre están incluidos. Los cambios medianos (sumar sección o formulario, cambiar colores o tipografía) salen desde USD 50 y los grandes (página nueva, integración, módulo), desde USD 100. Todo extra se presupuesta antes. | §7.1 Extra |
| Páginas web | ¿Qué incluye el portal del cliente? | El portal del cliente incluye métricas, tickets y acceso a más servicios. | §7.1 Incluye |
| Páginas web | ¿El chatbot viene incluido? | No, el chatbot con IA va aparte. | §7.1 FAQ y Aparte |
| Software a medida | ¿Cómo sé si necesito un sistema propio? | Una señal son las planillas, los sistemas genéricos y los procesos a mano que no se adaptan a cómo trabaja tu negocio. Una charla corta alcanza para saber si te podemos ayudar. | §7.2 Problema y CTA |
| Software a medida | ¿Qué pasa si después necesito cambios? | `null` | El SPEC no dice cómo se tratan los cambios después de la entrega. |
| Software a medida | ¿El sistema es mío? | `null` | §7.2 y §11: «respuesta [a definir]». |
| Software a medida | ¿Cuánto soporte incluye? | Incluye 1 o 2 meses de soporte gratis después de entregar. | §7.2 Incluye y FAQ |
| IA y automatizaciones | ¿El bot reemplaza a mi equipo? | `null` | §7.3 dice que deriva a una persona, pero no da el sí o el no que la pregunta pide. |
| IA y automatizaciones | ¿Puedo ver las conversaciones? | Sí. Tenés un panel propio para ver y configurar todo. | §7.3 Incluye |
| IA y automatizaciones | ¿Qué pasa si no sabe responder? | Deriva. El asistente nunca inventa: si no sabe, deriva. | §7.3 Incluye y FAQ |
| IA y automatizaciones | ¿Qué cuenta como una conversación? | Una charla completa, sin importar cuántos mensajes tenga. | §7.3 FAQ |
| IA y automatizaciones | ¿Qué pasa si se agota la cuota del mes? | El asistente sigue en modo básico y derivando. | §7.3 FAQ |
| IA y automatizaciones | ¿Qué pasa con los datos de mis visitantes? | Se pide consentimiento antes de guardarlos. | §7.3 FAQ |

12 respuestas escritas y 3 en `null`.

### 6.2 Lo que quedó en `null` o vacío

| Servicio | Campo | Por qué |
|---|---|---|
| Páginas web | `calibres[Simple].autogestionable` | §7.1 y §11: «Si la Simple tiene panel: [a definir]». |
| Páginas web | `extra.items[Plan mensual].precio` | §7.1: «Plan mensual solo web: USD [a definir]». |
| Páginas web | `calibres[].incluye = []` | El SPEC no da lo propio de cada calibre. |
| Páginas web | `articulos[].href` (2) | Todavía no existe el blog. |
| Software a medida | `prueba.casos[Sistema de gestión].texto` e `imagen` | §7.2 y §11: capturas con datos ficticios pendientes. |
| Software a medida | `prueba.casos[Sistema de boletas].rubro`, `texto` e `imagen` | El SPEC no da el rubro de las boletas; capturas pendientes (§11). |
| Software a medida | FAQ: «¿Qué pasa si después necesito cambios?» y «¿El sistema es mío?» | Ver la tabla de arriba. |
| Software a medida | `articulos[].href` | Todavía no existe el blog. |
| IA y automatizaciones | `precio.planes[].funcionalidades` (3) | §7.3 y §11: «Qué funcionalidades trae cada plan: [a definir]». |
| IA y automatizaciones | `precio.implementacionDesde` | §7.3 y §11: «desde USD [a definir]». |
| IA y automatizaciones | `cta.texto` | El SPEC trae solo el título del CTA (decisión 5). |
| IA y automatizaciones | `prueba.casos = []` | §7.3: sin casos publicables todavía. |
| IA y automatizaciones | FAQ: «¿El bot reemplaza a mi equipo?» | Ver la tabla de arriba. |
| IA y automatizaciones | `articulos[].href` | Todavía no existe el blog. |

`prueba.ctaPanel.href` de IA ya no es `null`: es `/login` (D11). `aparte = []` en software e IA y `extra = null` en software e IA, porque el SPEC no los da.

---

## 7. Para el S1b

- **CERRADO al empezar el S1b (2026-10-17, 18:32): tsc completo, 0 errores.** Con 4,6 GB libres, el pool no paginado en 608 MB y nada pesado corriendo, `node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit` salió con código 0 y sin una sola línea de salida, en 18 s. Es incremental (`tsconfig.json:20`): el `tsconfig.tsbuildinfo` que escribió esa corrida lista los 11 archivos de `_servicios/`, o sea que los chequeó. La salida está en `C:\paginas-servicios-datos\tsc-S1b.txt` (vacía). Lo que sigue es el texto original de la nota.
- **Primero, cerrar el gate de tsc de este sprint.** Con 3 GB libres o más y nada más pesado corriendo (ni el home), desde `logic-core-v3\`: `.\node_modules\.bin\tsc.cmd --noEmit`. Si da OOM, `node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit` (la forma que usa `verificar`, ≈45 s). Cualquier línea de salida es un error nuevo, porque la base tiene 0. Si el resultado no es 0, se corrige antes de empezar el S1b.
- La base de tsc se tomó **con `.next/dev` y `next-env.d.ts` presentes**, y el S1b va a correr el dev (que regenera `.next/dev/types`, incluido por el `tsconfig`). Si tsc muestra errores nuevos por esos tipos generados, comparar contra esta nota antes de culpar al código.
- `PUBLICADOS` va en `rutas.ts` (`['paginas-web']`, aparte de `SERVICIOS`).
- `Precio.tsx` tiene que ser exhaustivo; los slots `proyecto` y `planes` devuelven `null` con `// S2`.
- La etiqueta «Plazo de referencia» y el modo `enDesarrollo` (`process.env.NODE_ENV`) los calcula el template una vez.
- P-H7 sigue abierto: los dos tests de este sprint se corren a mano con `npx tsx`.

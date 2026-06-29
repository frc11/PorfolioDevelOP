# FG-2.0 — Experimento: ¿el formulario estructurado mejora las demos?

> **Estado: 🟡 GATE ABIERTO.** El bloque FG-2 (2.1 → 2.3) NO se deriva hasta que
> Franco corra este experimento y registre el resultado. Sin este dato, no se
> construye el formulario definitivo para los 4 rubros.

Última actualización: 2026-06-21 · Rubro del experimento: **gastronomía**

---

## La hipótesis que se prueba

> «Un formulario estructurado produce mejores demos que el prompteo libre.»

Es el supuesto central de toda la fase FG-2 y **nadie lo probó en este stack**
(Claude Design + los rubros reales de develOP). Hoy es una apuesta. Este
experimento la pone a prueba con **un** rubro, de forma acotada y descartable,
**antes** de construir el formulario definitivo para los 4 rubros.

**Por qué gastronomía:** es el rubro más común para demos de PyME local y tiene
una estructura de landing muy canónica (hero del plato → menú → reseñas →
ubicación → CTA WhatsApp). Eso le da al formulario estructurado el mayor margen
de mejora sobre el prompteo libre — el mejor caso para ver señal clara.

---

## Qué construyó el prototipo

- **Lab:** `/admin/fg2-lab` (gated SUPER_ADMIN, no linkeado en el sidebar — se
  entra por URL). Formulario estructurado de gastronomía + vista del prompt +
  harness de medición.
- **Core puro:** `src/lib/leados/_experimental/fg2-brief-lab.ts` — catálogo del
  rubro (estilos, tonos, secciones, CTAs) + `assembleGastroPrompt` + estimador de
  tokens + armador de filas de log.
- **Casos precargados:** `src/lib/leados/_experimental/fg2-casos-gastro.ts` — los
  5 negocios del experimento, listos para cargar de un click en el lab (selector
  "Precargar un caso del experimento"). Llena TODO el formulario, sin tipear.
- **Prompts listos:** `docs/experimentos/fg2-prompts-listos.md` — los 10 prompts
  (5 A formulario + 5 B a-mano) ya armados, para copiar-pegar en Claude Design.
  Generado por `scripts/_experimental/fg2-gen-prompts.ts` desde los casos.
- Todo marcado **EXPERIMENTAL / DESCARTABLE**. No toca el flujo del setter, no
  escribe en el dossier, no toca gates. Solo LEE fichas para autocompletar.

**Qué datos del negocio entran al prompt (SENSIBLE-lite):** nombre, zona,
reseñas (ya públicas), tono/contenido, links de assets (IG/Maps/web) y el
WhatsApp **comercial público** — este último se carga a mano a propósito, no se
auto-toma del `phone` del lead (que puede ser privado). Nada más.

---

## Los 5 negocios — y de dónde salen (sin inventar nada como real)

No hay 5 fichas de gastronomía con contenido real cargadas en el sistema: el
seed tiene **1 completa** (Noir Dining), **1 parcial** (Don Carlo) y **1 lead sin
ficha de contenido** (Café La Esquina). Para llegar a 5 se sumaron **2 arquetipos
representativos**, marcados como tales. La regla que se respetó: **nunca se
inyecta una reseña inventada como "real"** — los casos sin reseñas reales viajan
sin sección de reseñas.

| # | Negocio | Rubro | Procedencia | Reseñas en el prompt |
|---|---|---|---|---|
| 1 | **Noir Dining** (Yerba Buena) | Restaurante de autor | **Real** — ficha seed verbatim (`demos-seed-review-queue.ts`) | Sí (reales del seed) |
| 2 | **Pizzería Don Carlo** (Barrio Norte) | Pizzería | **Real** — ficha QA seed (`b6-qa-outreach.ts`); sin `contenidoReal` | Sí (real del seed) |
| 3 | **Café La Esquina** (Yerba Buena) | Cafetería | **Lead real** del seed (`b3-qa-assign-leads.ts`); contenido representativo | No (el seed no carga reseñas) |
| 4 | **Parrilla El Fogón** (Tucumán) | Parrilla | **Representativo** — no es cliente real | No |
| 5 | **Verde Hoja** (Palermo) | Café saludable / brunch | **Representativo** — no es cliente real | No |

> Los WhatsApp de los 5 son **números de ejemplo** (la calidad de la demo no
> depende del dígito). Reemplazalos por el real solo si querés probar el link.

---

## Qué mide el harness — y qué no

| Métrica | Cómo se obtiene |
|---|---|
| Tokens del prompt (input) | **Auto** — estimación heurística (~4 car/token). No es exacta. |
| Tiempo de generación | **Auto** — cronómetro del lab (arrancar al mandar el prompt, frenar cuando la demo está lista). |
| Cuota / créditos consumidos | **Manual** — Claude Design es externo: no se puede instrumentar su medidor. Franco lo lee en la herramienta y lo carga. |
| Calidad de la demo | **Manual** — juicio humano (Franco + setter), 1 a 5. |

> El costo real por demo lo domina la **generación en Claude Design** (output),
> que es externa y se registra a mano. El token-estimate del prompt es el costo
> de **input** controlable, y sirve para correlacionar. Esto alimenta la economía
> unitaria que pedía el roadmap: **costo por demo = tiempo + cuota**.

---

## Checklist de ejecución — paso a paso literal

Todo está precargado: no hay que preparar nada más. Tenés dos fuentes para cada
prompt, usá la que te sea más cómoda:

- **Más rápido:** abrí `docs/experimentos/fg2-prompts-listos.md` y copiá el bloque
  de texto del prompt que toca (A1, B1, A2, …).
- **Desde el lab (para A):** entrá a `/admin/fg2-lab`, elegí el caso en el selector
  **"Precargar un caso del experimento"** (llena todo solo), y usá **Copiar prompt**.
  El lab además te da el cronómetro y la **fila de log** lista para pegar.

**Antes de arrancar:** copiá el encabezado de la tabla una vez (botón "Copiar
encabezado" del lab, o usá la tabla de más abajo que ya está armada).

Hacé los 10 en este orden (alterná A y B del mismo negocio para comparar fresco):

1. **A1 — Noir Dining (formulario).** Copiá el prompt A1 → pegalo en Claude Design
   ([claude.ai/design](https://claude.ai/design) o la herramienta que uses) →
   **arrancá el cronómetro** al mandar → generá → **frená el cronómetro** cuando la
   demo esté lista. Mirá la demo y puntuá calidad **1–5** (ver rúbrica abajo).
   Registrá **tiempo** (del cronómetro) + **cuota** (lo que muestra Claude Design)
   + **notas**. Anotá la fila en la tabla (método `formulario`).
2. **B1 — Noir Dining (a-mano).** Copiá el prompt **B1** → mismo procedimiento
   (cronómetro, generar, frenar, puntuar, registrar). Fila método `a-mano`.
3. **A2 — Pizzería Don Carlo (formulario).** Ídem con A2.
4. **B2 — Pizzería Don Carlo (a-mano).** Ídem con B2.
5. **A3 — Café La Esquina (formulario).** Ídem con A3.
6. **B3 — Café La Esquina (a-mano).** Ídem con B3.
7. **A4 — Parrilla El Fogón (formulario).** Ídem con A4.
8. **B4 — Parrilla El Fogón (a-mano).** Ídem con B4.
9. **A5 — Verde Hoja (formulario).** Ídem con A5.
10. **B5 — Verde Hoja (a-mano).** Ídem con B5.

Al terminar los 10: comparen las 5-formulario vs las 5-a-mano y **anotá la
decisión** al pie.

> **Variante más limpia (opcional):** que otra persona puntúe la calidad sin saber
> qué demo salió de qué método (tapá la columna). Reduce el sesgo a favor del
> formulario.

### Qué mirar al puntuar calidad (1–5)

Una sola nota por demo, mirando estas 4 cosas. 5 = las cumple todas y la mandarías
tal cual; 1 = no sirve, hay que rehacerla.

1. **¿Captura el negocio?** ¿Se entiende qué es, qué lo hace distinto, a quién le
   habla? ¿O es una landing genérica que serviría para cualquiera?
2. **¿Se ve profesional?** ¿Jerarquía, espaciados, tipografía y color cuidados? ¿O
   parece una plantilla sin terminar / con texto y fotos de relleno?
3. **¿Las secciones correctas, en buen orden?** Hero que enganche, menú claro,
   prueba social donde corresponde, CTA de WhatsApp visible y alcanzable en mobile.
4. **¿El setter la mandaría?** La prueba final: ¿la usarías como demo para cerrar a
   este negocio, o te daría vergüenza? Si dudás, es ≤ 3.

En **notas** escribí lo concreto: qué salió fuerte y qué quedó flojo (p. ej. "hero
top, menú genérico", "lindo pero no parece una parrilla", "metió lorem ipsum").

### Cómo registrar el costo de cada demo

- **Tiempo:** el cronómetro del lab (arranca al mandar el prompt, frená cuando la
  demo está lista). Si copiás el prompt del doc en vez del lab, cronometrá igual a
  mano. Es el costo de tu tiempo por demo.
- **Cuota / créditos:** lo que Claude Design descuenta por esa generación (mensajes
  / créditos / lo que muestre su medidor). Es externo, no se puede instrumentar:
  copiá el número que ves. Es el costo en plata por demo.
- El **token-estimate del prompt** (input) ya lo calcula el lab y está en el doc de
  prompts — sirve para correlacionar, no es el costo principal.

---

## Log del experimento

> La tabla ya tiene precargados los 5 negocios y, para el formulario, su estilo /
> nº de secciones / tokens del prompt (los emite el lab y el doc de prompts). Solo
> falta que completes **tiempo · cuota · calidad · notas** de cada demo. Las filas
> `a-mano` no tienen estilo/secciones (el prompteo libre no los fija).

```tsv
negocio	metodo	estilo	secciones	tokens_prompt	tiempo_gen_s	cuota_consumida	calidad_1a5	notas
```

| negocio | método | estilo | secc. | tokens prompt | tiempo gen (s) | cuota | calidad (1–5) | notas |
|---|---|---|---|---|---|---|---|---|
| Noir Dining | formulario | nocturno-premium | 7 | ~609 |  |  |  |  |
| Pizzería Don Carlo | formulario | apetitoso-calido | 5 | ~568 |  |  |  |  |
| Café La Esquina | formulario | rustico-artesanal | 6 | ~552 |  |  |  |  |
| Parrilla El Fogón | formulario | apetitoso-calido | 5 | ~542 |  |  |  |  |
| Verde Hoja | formulario | moderno-minimal | 5 | ~538 |  |  |  |  |
| Noir Dining | a-mano | — | — | ~93 |  |  |  |  |
| Pizzería Don Carlo | a-mano | — | — | ~70 |  |  |  |  |
| Café La Esquina | a-mano | — | — | ~87 |  |  |  |  |
| Parrilla El Fogón | a-mano | — | — | ~67 |  |  |  |  |
| Verde Hoja | a-mano | — | — | ~65 |  |  |  |  |

### Resumen (completar al cerrar)

- Calidad promedio — formulario: ___ / 5 · a-mano: ___ / 5
- Costo promedio por demo — formulario: ___ (tiempo + cuota) · a-mano: ___
- **¿El formulario mejora la calidad?** ___
- **¿Cuánto cuesta una demo?** ___

---

## Decisión (la toma Franco al cerrar el experimento)

- [ ] **El formulario mejora la calidad y el costo es viable** → construir 2.1+
      como está pensado (formulario productizado para los 4 rubros).
- [ ] **Mejora pero hay que ajustar** → anotar qué ajustar antes de 2.1.
- [ ] **No mejora / no compensa el costo** → replantear el enfoque de FG-2.

**Notas de la decisión:**

_(pendiente — completar tras correr las 5 vs 5)_

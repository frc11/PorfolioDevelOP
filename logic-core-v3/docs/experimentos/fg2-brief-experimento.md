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
- Todo marcado **EXPERIMENTAL / DESCARTABLE**. No toca el flujo del setter, no
  escribe en el dossier, no toca gates. Solo LEE fichas para autocompletar.

**Qué datos del negocio entran al prompt (SENSIBLE-lite):** nombre, zona,
reseñas (ya públicas), tono/contenido, links de assets (IG/Maps/web) y el
WhatsApp **comercial público** — este último se carga a mano a propósito, no se
auto-toma del `phone` del lead (que puede ser privado). Nada más.

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

## Protocolo para Franco

1. **Elegí 5 negocios reales de gastronomía** (idealmente con ficha cargada).
2. **Vía formulario (×5):** entrá a `/admin/fg2-lab`, autocompletá desde el lead
   (o cargá a mano), elegí estilo/tono/secciones/CTA, completá WhatsApp y
   diferencial. Copiá el prompt → pegalo en Claude Design.
   - Arrancá el cronómetro al mandar el prompt; frenalo cuando la demo esté lista.
   - Cargá cuota consumida + calidad (1–5) + notas → **Copiar fila de log** →
     pegala en la tabla de abajo.
3. **Vía a-mano (×5):** un setter capacitado genera las demos de los **mismos 5
   negocios** con prompteo libre (el camino actual: Gem de diseño → bloque). Para
   cada una, registrá tiempo, cuota y calidad a mano en la tabla (método `a-mano`).
4. **Comparen calidad** las 5-formulario vs las 5-a-mano (Franco + setter juzgan).
5. **Anotá la decisión** abajo.

---

## Log del experimento

> Pegá las filas que copiás del lab. El encabezado ya está. Las filas `a-mano`
> se cargan a mano (mismas columnas).

```tsv
negocio	metodo	estilo	secciones	tokens_prompt	tiempo_gen_s	cuota_consumida	calidad_1a5	notas
```

| negocio | método | estilo | secc. | tokens prompt | tiempo gen (s) | cuota | calidad (1–5) | notas |
|---|---|---|---|---|---|---|---|---|
|  | formulario |  |  |  |  |  |  |  |
|  | formulario |  |  |  |  |  |  |  |
|  | formulario |  |  |  |  |  |  |  |
|  | formulario |  |  |  |  |  |  |  |
|  | formulario |  |  |  |  |  |  |  |
|  | a-mano |  | — |  |  |  |  |  |
|  | a-mano |  | — |  |  |  |  |  |
|  | a-mano |  | — |  |  |  |  |  |
|  | a-mano |  | — |  |  |  |  |  |
|  | a-mano |  | — |  |  |  |  |  |

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

# PROGRESO — corrida M1 (manual de usuario del Panel del Setter)

Producto: [`00-INDICE.md`](00-INDICE.md) + los 10 capítulos.
Byproducto de auditoría: [`HALLAZGOS-MANUAL.md`](HALLAZGOS-MANUAL.md).

---

## FASE 0 — Terreno

| Chequeo | Resultado |
|---|---|
| Rama | `main` |
| HEAD al arrancar | `e7f81ab` — *docs(bitacora): cierre sprint P3.1* |
| **P3.1 en el log** | **Sí** (`e7f81ab`, `f45b81b`, `36d9095`, `786b357`, `4eb1b13`, `5fb6c58`, `5692380`, `7601f0a`) → el manual retrata copy **post-P3.1** |
| Sucio al arrancar | solo `docs/probe-01-censo-cosecha.md` (untracked, WIP ajeno) — **no se tocó** |
| Galería | 41 `.png` presentes, pero capturados en `6a88cbe` (**pre-P3.1**) → **regenerada** |
| Server de navegación viva | prod-QA en `:3001` (`npm run start:qa`), sembrado con `npm run seed:galeria` |

### Por qué se regeneró la galería

Los `.png` existían, pero eran de antes de P3.1 — el sprint que **cambió copy de
pantalla** (entre otras: «vencido visible en m5», que era el hallazgo #4 de la
corrida M0; `Parquear`→`Pausado`; pluralización de «Te paso N horarios»; retiro
de los placeholders «sin migrar»). Un manual escrito contra fotos viejas habría
citado texto que la app ya no dice. Se corrió `npm run seed:galeria` +
`SETTER_EXTERNAL_SERVER=1 npm run galeria:capturar` contra el mismo server QA que
se usó para navegar.

### Estado de las herramientas externas (`src/lib/leados/herramientas.ts`)

**4 de 5 siguen sin URL cargada** — igual que en M0. Sin cambios.

| Herramienta | URL | Se usa en |
|---|---|---|
| Evaluador | `null` → **PENDIENTE** | Evaluación (m2) |
| Gem de diseño | `null` → **PENDIENTE** | Brief (m6) |
| Claude Design | `null` → **PENDIENTE** | Construcción (m7–m12) |
| Netlify Drop | `https://app.netlify.com/drop` | Publicar el borrador (m13) |
| Gem de outreach | `null` → **PENDIENTE** | Primer contacto (m4) y Seguimiento (m5) |

Esto define cómo se escribe cada pantalla que las usa: el manual **nombra la
herramienta y dice que el acceso todavía no está cargado en el panel**, en vez de
fingir un link. Registrado como `H-01`.

---

## Estado de los capítulos

| Capítulo | Estado | Commit |
|---|---|---|
| 00 — Índice | **CERRADO** | `M1 cap 00-01` |
| 01 — Tu panel | **CERRADO** | `M1 cap 00-01` |
| 02 — Ficha y evaluación | **CERRADO** | `M1 cap 02` |
| 03 — Opener y seguimiento | **CERRADO** | `M1 cap 03` |
| 04 — Brief | **CERRADO** | `M1 cap 04` |
| 05 — Construcción | **CERRADO** | `M1 cap 05` |
| 06 — Borrador, chequeo y revisión | **CERRADO** | `M1 cap 06` |
| 07 — Cuando Franco dice no | **CERRADO** | `M1 cap 07` |
| 08 — Envío | **CERRADO** | `M1 cap 08` |
| 09 — Agenda | **CERRADO** | `M1 cap 09` |
| 10 — Cierres | **CERRADO** | `M1 cap 10` |
| HALLAZGOS | en curso | — |

---

## REPORTE FINAL

### (1) Capítulos

**11 de 11 completados** (índice + 10 capítulos) + `HALLAZGOS-MANUAL.md`. Ninguno
pendiente. Cada capítulo cita sus screenshots: **los 41 `.png` de la galería están
referenciados**, cero links rotos, cero anclas rotas (verificado con script).

### (2) Hallazgos — 18, y los 5 más severos

| | Hallazgo | La frase que lo delató |
|---|---|---|
| **me frena** | **H-01** · 4 de 5 herramientas sin acceso cargado (10 de 16 pantallas) | *«Cuando el manual te diga "pasalo por el Evaluador", ya sabés: la herramienta la abrís por tu cuenta, no desde el panel.»* |
| **me frena** | **H-12** · los 6 tildes del chequeo final se pierden sin «Guardar el chequeo» | *«Los tildes del chequeo NO se guardan solos»* — un recuadro de alarma dentro del paso |
| **me frena** | **H-16** · `Buscar horarios` devuelve jerga de sistema al setter | *«Eso no es algo que puedas resolver vos… mandale una captura a Franco»* — el manual reescribiendo un error |
| **me frena** | **H-15** · dos esperas opuestas con texto idéntico; en una es falso | *«en el caso 3 esa frase confunde: el negocio ya respondió»* |
| me confunde | **H-14** · «el historial de rechazos se conserva», pero no se ve | *«copiate la nota a algún lado tuyo antes de corregir»* — pedirle al usuario que guarde lo que la pantalla promete conservar |

**Patrón dominante** (5 hallazgos, 3 tramos): *acción sin acuse en el lugar del
clic* — H-03, H-06, H-11, H-12, H-13.

**Tres corrigen datos de M0:** H-13, H-14, H-15. Uno de ellos (H-13) corrige un
error **mío**: afirmé que el checkbox de m16 ya no existía y sí existe — mi
volcado de controles lo salteaba porque no tiene nombre accesible. Verificado
contra el DOM y corregido.

### (3) Tramos no documentados

**Uno solo**, declarado como tal en el capítulo 09 y en el índice (**H-17**):

| Tramo | Por qué |
|---|---|
| Cómo se ven los 3 horarios cuando Cal.com los trae de verdad | No se pudo ejecutar: falta `calComUsername` / `calComEmbedUrl` en la organización del entorno. Los horarios de la foto #31 los puso el sembrador |
| Qué pasa al tocar **Confirmar y agendar** | **No se ejecutó a propósito**: crea el evento en el calendario real de Franco y dispara el mail al prospecto |

### (4) Estado de las herramientas

**4 de 5 sin URL** — sin cambios respecto de M0. Afecta a **10 de las 16
pantallas** del recorrido: m2, m3 (Evaluador) · m6 (Gem de diseño) · m7–m12
(Claude Design) · m4, m5 (Gem de outreach). La única cargada es Netlify Drop
(m13).

### (5) Navegado en vivo vs sólo screenshot

**Navegado en vivo** (Playwright interactivo contra prod-QA :3001, camino feliz
ejecutado): home (foco, cartera desplegada, atajos, Pausar, Saltar, mobile) · m1 →
m2 → m3 → m4 · m4 → espera · m5 → espera · m6 → m7 · m7 (arrancar + tildar) · m13
(URL inválida y válida) → m14 (6 obligatorios) → revisión · m16 (casilla del dueño,
buscar horarios, marcar horario) · cartera filtrada por *Perdidos*.

**Sólo screenshot + copy renderizado:** m8–m12 (las fases se leyeron del volcado
vivo de cada pantalla, pero no se construyó una demo real), el estado agendada
(#32), el error persistente del chequeo (#24b), y las 4 vistas mobile.

**Consultas a la base** (para no afirmar causas por inferencia): las dos esperas
de m15 y el historial de rechazos del re-loop.

### (6) Prueba de inocuidad

```
git diff --stat e7f81ab..HEAD   →  13 archivos, 2.692 inserciones, 0 eliminaciones
                                   los 13 bajo docs/manual-usuario/
git diff --name-only | grep -v manual-usuario  →  (vacío)
```

**Cero `src/`, cero tests, cero config.** WIP ajeno
(`docs/probe-01-censo-cosecha.md`, untracked) **intacto, nunca stageado**.
`tsc` y las suites **no se corrieron**: no se tocó código.

### (7) Qué le falta al manual — lo que sólo Franco puede poner

El manual explica **la herramienta**. No explica **el oficio**. Lo que falta y no
sale de mirar pantallas:

1. **Las cuatro URLs de las herramientas.** Es lo primero. Sin eso el capítulo 02
   ya no se puede completar. → H-01
2. **Cómo suena un buen opener de verdad.** El manual dice «sin link, sin precio,
   menos de 300 caracteres, que nombre algo real». No dice qué tono funciona con
   un dueño de barrio de Tucumán, ni **3 o 4 openers reales que hayan cerrado**.
3. **Qué es "munición" en cada rubro.** Qué dolor sirve en gastronomía y cuál en
   estética; qué reseña vale y cuál es ruido.
4. **Dónde está el corte de calidad de una demo.** Los 6 obligatorios se verifican
   solos, pero *«¿está lo bastante buena?»* hoy sólo lo sabe Franco al revisar. Un
   par de ejemplos de demo aprobada y demo rechazada valdrían más que el capítulo
   05 entero.
5. **Qué contestar a las objeciones reales.** El guion de precio está escrito. El
   resto —«ya tengo quien me lo hace», «ahora no es momento», «mandame info»— no.
6. **Qué escribir en las notas de traspaso.** El campo pide *«qué le duele, qué
   espera, qué tono tiene, qué NO decirle»*. Dos ejemplos de traspaso que le
   sirvieron a Franco enseñarían más que la consigna.
7. **Los números que se esperan.** El panel muestra *«5% descarte»* sin decir si
   está bien. ¿Cuántos openers por día? ¿Qué ratio de respuesta es normal?
8. **Cuándo pedir ayuda.** «Me trabé» existe; a las cuántas horas de pelearla
   conviene usarlo, no.

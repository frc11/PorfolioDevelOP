# HANDOFF — LeadOS / Panel del Setter
### Cierre del chat de planificación y visión · julio 2026

Punto de entrada del proyecto. Si alguien llega sin contexto, lee esto primero y después el brief v3.

---

## 1 · Qué es LeadOS, en un párrafo

El Panel del Setter es un **manual interactivo** que guía a un setter no técnico, pantalla por pantalla, para producir demos de páginas web y contactar negocios. Nació de una observación: hacer una demo es un proceso mecánico, siempre igual, con mucha munición (prompts, bloques de texto, herramientas externas) — y por lo tanto lo puede ejecutar alguien que no tenga la experiencia de los fundadores, si algo lo va guiando. **La ley del producto es el brief v3.**

---

## 2 · Estado real, hoy

### Lo que está hecho

| Bloque | Qué cerró | Commits |
|---|---|---|
| B1 | Una sola lengua — barrido del vocabulario del wizard retirado | `612c4ee`, `b468ec6` |
| B2 | El foco no miente — cadencia agotada, postergado, rechazado; m5 estructural; terminales a archivo | `aed017e` `7425d2b` `b844208` |
| B3 | Fricciones — taxonomía "caliente", guardias de salida, a11y, tilde con motivo, residuos | `909ad8d` `79d3787` `db557e8` + 3.4a–d |
| B4 | Errores en criollo — mapa de 17 mensajes, código de slot ocupado, errores persistentes | `b6b2132` |
| B5 | Re-servido — la conversación a la vista, m15 consultable en la espera | `88b1f13` `65058fc` |
| B6 | Booking con memoria — red del claim, claim que acepta OFRECIDOS, UI re-entrante | `8b3ce80` `7d323ea` `6a88cbe` |
| P3.1 | Verdad visible — el vencido se ve vencido, clamps, verbos, placeholders | 8 commits atómicos |
| Forenses | Recuperación de terreno, main verde, timeout del harness | `612c4ee` `d0e8ef4` `fccbeb7` |
| Observación | Galería de 37 estados · destilación de método · manual del setter (11 docs, 18 hallazgos) | 6 + 4 + 11 commits |

**Suites en verde:** tipos, 25 tests de motor, 60 end-to-end del panel, 17 invariantes ejecutables. **Nada pusheado** — el push es de Franco.

### Lo que cambió después de todo eso

Se reescribió la ley. El **brief v3** invierte el recorrido a **demo-first**: se llega con la demo hecha, porque Claude Design la construye desde un prompt y construir dejó de ser el paso caro. El paso caro ahora es **elegir bien a quién**, porque cada demo son ~30 minutos y cierra una de cada cinco a siete.

Un **recon de factibilidad** ya verificó los siete supuestos del brief contra el código. Los veredictos están en **§20.1 del brief** y reemplazan a los supuestos: **no hace falta re-auditar para planificar.**

### El titular del recon, que define el próximo movimiento

**El orden del recorrido vive en el motor, no en la presentación.** El gate que abre el brief exige que el negocio haya respondido, y ese mismo gate se compone en el del envío: hoy no se puede construir una demo sin haber contactado y recibido respuesta. **Demo-first por defecto es rediseño de gate, no poda.**

**Pero ese gate tiene una llave:** acepta también la marca *caliente* que Franco pone al asignar. Un lead marcado caliente **recorre el flujo demo-first completo hoy, sin tocar una línea de código.** Eso permite **probar antes de decidir** — que es el paso 1 de la adopción (§23 del brief).

### La brecha que sigue abierta

**Nadie usó nunca esta herramienta para hacer una demo.** Ni Franco, ni Valentino, ni Toba. Todo lo construido, el brief y el plan de poda se apoyan en inferencia bien hecha, pero inferencia. El piloto la cierra en una hora.

---

## 3 · Mapa de artefactos

Diez documentos repartidos en dos chats. Qué es cada uno y cuándo se abre.

| Artefacto | Qué es | Cuándo se usa |
|---|---|---|
| **`BRIEF-VISION-FLUJO-SETTER-v3.md`** | **La ley.** Propósito, recorrido, inventario de las 16 pantallas con su destino, hallazgos recalibrados, reglas inviolables, riesgos, criterios de "listo", y los veredictos del recon. Autosuficiente. | **Siempre.** Toda discusión se resuelve contra esto. **Commitear a `docs/`.** |
| **`ARRANQUE-CHAT-CIERRE-LEADOS.md`** | El prompt que abre el chat de ejecución. | Al abrir el chat nuevo. |
| **`MUNICION-PROMPTS-Y-SKILL.md`** | La cadena completa de prompts (P0 dirección → P1 creación → P2 secciones → R1-R5 refinamiento → U unificadora), con modelo y esfuerzo por paso, modos de falla y economía de tokens. Borrador para curar. | Al hacer una demo. Y para curarlo con los `[FRANCO]`. |
| **`PILOTO-DEMO-FIRST.md`** | Protocolo para hacer una demo real recorriendo la herramienta, con la llave de caliente. Una hora, cero código. | **El próximo paso de mayor valor.** |
| **`HALLAZGOS-MANUAL.md`** *(en el repo)* | Los 18 hallazgos crudos del manual, con evidencia y screenshots. | Para el detalle. **La versión priorizada y recalibrada está en §10 del brief.** |
| **`SPRINT-M1-MANUAL-v2.md`** | El prompt para reescribir el manual después de la poda — que además valida la poda. | Cuando la poda cierre. |
| **`docs/manual-usuario/`** *(repo)* | El manual actual: índice + 10 capítulos. Documenta el producto **pre-poda**. | Referencia histórica hasta que se regenere. |
| **`docs/manual-usuario/galeria/`** *(repo)* | Galería de 37 estados + sembrador + captura. `npm run galeria`. | Antes de escribir o auditar cualquier cosa visual. |
| **`docs/metodo/`** *(repo)* | 20 lecciones con evidencia, 21 cambios de método propuestos, y un mapa del sistema. | En el chat de método. |
| **`PROMPT-PARA-CHAT-TRAIN-PETER.md`** | Extractor del flujo presencial, ya ejecutado. Su salida está resumida en §18 del brief. | Ya cumplió. |

---

## 4 · Las decisiones que dependen de Franco

Consolidadas en un solo lugar. **Ninguna necesita código, y tres de ellas traban trabajo.**

### Traban construcción

1. **La regla que prohíbe links en el opener.** El código la rechaza del lado del servidor, a propósito: *"el link viaja recién con la demo aprobada"*. El v3 dice que el primer contacto lleva el link. **Sin esta decisión, la etapa 5 del recorrido no se puede construir.** *El argumento a favor de cambiarla: esa regla protegía contra mandar una demo no aprobada; en demo-first, la demo ya pasó por la revisión de Franco antes del primer mensaje.*
2. **Derivar a Franco: qué significa.** Si es *sacarlo de mi cartera*, un setter escribiría el campo de ownership — que es el eje del aislamiento. Si es *sigue siendo mío pero fuera del flujo*, hace falta campo nuevo y migración. **Las dos son caras y hay que elegir cuál.**
3. **Los accesos de las herramientas** que sobreviven a la poda (§6.8 del brief) y **el modo correcto de Claude Design** antes de abrir un proyecto. Este último es el más peligroso de los pendientes: es el único paso donde el setter se puede equivocar sin darse cuenta y arruinar todo lo que sigue.

### Validaciones del brief

4. **§9 — la columna "destino"** de las 16 pantallas. Es una propuesta, no una decisión suya. Va a guiar sprints.
5. **§12 — el checklist de estética.** Cinco criterios destilados de "que se note que salió de un prompt". **Es lo que va a decidir si algún día puede soltar la revisión.**
6. **§21 — el 1 cada 5-7 demos.** El número más importante y el menos verificado del proyecto.
7. **§22 — el umbral para soltar la revisión** (tres demos seguidas sin correcciones de fondo).
8. **§6.3 — la asignación de modelos** en la construcción.

### Sin apuro

9. Los horarios para el booking: grilla fija declarada por él es la opción más barata.
10. Si el sitio real se hace de cero o se vende la demo (afecta qué conviene guardar de cada demo).
11. Cómo se sostiene Toba hasta su primer cierre.
12. Si la accesibilidad entra en la corrida unificadora, y si esa corrida puede tocar estética.

---

## 5 · Reglas de terreno — se ganaron a los golpes

Vigentes para cualquier sesión que ejecute sobre este repo. **Cada una costó un sprint.**

1. **Una sesión, un worktree.** Repartirse por archivos no es aislamiento: el índice de git, el directorio de build y los puertos son del checkout, no del archivo. Costó un sprint forense entero.
2. **Nada queda en el working tree al cerrar.** Un fix sin commitear se pierde — pasó dos veces con el mismo archivo, y la segunda después de haberlo recuperado.
3. **El exit code se lee del proceso, sin pipe.** Un `| tail` devuelve el exit del `tail`, no el de la herramienta.
4. **El autorreporte no es estado.** Ante lecturas contradictorias del mismo terreno, forense de solo lectura — no una tercera opinión.
5. **Red antes de tocar un guard sin cobertura.** Test de caracterización en sprint propio, diff cero en el código de producción. *Se hizo con el claim de la agenda y evitó un fallo silencioso que las suites no habrían visto.*
6. **El comentario de decisión es fuente**, a la par del backlog — y se actualiza en el mismo commit que cambia lo que describe.
7. **`npm run build` antes de validar end-to-end** (o el script de QA arreglado, que ya buildea).
8. **Lo que toque transiciones, gates, aislamiento o schema sale del sprint mecánico** y va con premortem. El schema es decisión de Franco aunque el cambio sea aditivo.

---

## 6 · El camino

```
DECISIONES DE FRANCO (§4)  →  PILOTO (1 hora, cero código)
                                      ↓
                              PODA contra el brief v3
                                      ↓
                    REGENERAR GALERÍA + REESCRIBIR MANUAL
                         (valida la poda, ver §7)
                                      ↓
                        DOGFOODING (Franco + Valentino)
                                      ↓
                                    TOBA
                                      ↓
                     SOLTAR LA REVISIÓN (criterio §22 del brief)
                                      ↓
                              PETER · más setters
```

**Los tres chats:**

- **Ejecución** — abre con `ARRANQUE-CHAT-CIERRE-LEADOS.md`. Juzga lo construido contra el v3 y planifica la poda.
- **Método** — el Cimiento y el Manual reales + `docs/metodo/`. Sale con la ley del método actualizada. *(El corte propuesto: lo portable al Cimiento, lo específico del repo a su documentación técnica.)*
- **El manual, con Franco adentro** — agregarle lo que solo él tiene: openers que cerraron, una demo aprobada y una rechazada con el porqué, notas de traspaso reales.

---

## 7 · Lo que este proyecto aprendió sobre auditar

El descubrimiento que no estaba planificado, y que vale para el próximo producto:

**Escribir el manual de usuario encontró lo que ninguna auditoría de código había visto.** Tres bloqueantes —trabajo que se descarta en silencio, dos pantallas de causas opuestas con el mismo texto, un error de configuración crudo en la cara del setter— no aparecieron en tres auditorías estáticas ni en 60 tests verdes. Aparecieron porque alguien tuvo que escribir *"paso 4: tocá acá"* y no pudo escribirlo honesto.

**El mecanismo es replicable: la instrucción que no se puede escribir derecha es el bug.** No hace falta buscar hallazgos; hace falta escribir el manual con honestidad y anotar cada vez que la frase sale torcida.

Por eso el manual se reescribe **después de la poda y antes del dogfooding** (§23 del brief): si vuelve a salir torcido en algún paso, la poda quedó a medias — y descubrirlo ahí es más barato que descubrirlo en la primera demo real.

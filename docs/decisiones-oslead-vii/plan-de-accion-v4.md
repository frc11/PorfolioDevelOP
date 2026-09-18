# PLAN DE ACCIÓN — OSLead VII · **v4**
### LeadOS / Panel del Setter · agosto 2026
*Reemplaza al v3. **Este es el roadmap macro cerrado.** De acá salen los sprints.*

---

## 0 · El estado

**La base:** `cbfaa27f` de `leados/v1-integracion` = `origin/main` + F1 + F2 + F3. Cuatro suites verdes.

**Cerrado:** el rescate, la integración, la corrida de 47 capturas, **las trece superficies del setter diseñadas**, el sistema de interacción, y el **brief v4** como ley.

**La línea de llegada:** lista para que Franco la verifique y para dogfooding. Toba fuera del alcance de esta versión.

**El principio que gobierna:** *la complejidad va al producto, no al setter.*

---

## 1 · FASE A · Cerrar el conocimiento — **las tres auditorías**

Van en este orden y ninguna se saltea. **Al terminar las tres, el roadmap no cambia más y empieza la construcción.**

### A1 · Auditoría del admin

**Por qué va primera:** una decisión ya cerrada depende de una pantalla que nunca vimos. El hueco **G4** —que el rechazo pueda señalar qué check estaba falsamente en verde— exige una superficie donde Franco lo marque, y vive en el admin. Si construimos el lado del setter y el admin no puede escribir ese dato, **la mitad del mecanismo de delegación queda muerta**.

**Mismo método que la del setter:** línea base declarable, capturas pantalla × estado, manifiesto generado, un solo ancho, carpeta propia y descartable.

**Qué tiene que cubrir, además de las pantallas:**

| Superficie | Por qué |
|---|---|
| **La cola de revisión de Franco**, en sus estados | Es donde él pasa su tiempo y **nadie la vio nunca** |
| **El formulario de rechazo** | Lo que Franco escribe es lo que el setter lee. Y es donde entra G4 |
| **Dónde se cargan las cuatro URLs y Cal.com** | Hoy: no existen como pantalla. Confirmarlo |
| **Asignación de leads a un setter** | El setter ve "te reasignaron un lead" y no sabe de dónde sale |
| **"Me trabé — avisar a Franco"** | Sale hacia Franco y **nadie sabe adónde llega** |
| **Impersonación y roles** | Toca aislamiento |

### A2 · Los huecos del setter

Lo que las 47 no cubrieron. **Es corrida de comportamiento, no de capturas**: necesita manejar la aplicación.

| # | Qué | Por qué importa |
|---|---|---|
| 1 | **El error crudo de Cal.com** en `m16` | Uno de los tres "me frena" y **no está en las 47** |
| 2 | **El estado de las ocho pantallas DESPUÉS de "Reabrir construcción"** | Es donde vivía el bug del motivo del rechazo. F2 dice haberlo arreglado; nadie lo vio |
| 3 | **Si la pantalla queda vieja cuando la acción termina** | Lo único que sobrevive del Patrón 1. Los tres pares se capturaron en vuelo |
| 4 | **Si el check del dueño gatea el buscador de horarios** | Se ofrecieron turnos con el check apagado |
| 5 | **Los 19 dictámenes de lectura estática** | Salieron de un método que erró 4 de 22 |

### A3 · La auditoría externa — **dos pasos con parada dura**

**Qué se le carga:** el brief v4, el registro de decisiones por pantalla, el paquete del Gem, los cinco prompts de `mc2` y el archivo de supuestos. **Sesión limpia, sin el historial de estas conversaciones.**

**Paso 1 · Viabilidad contra el código.** Read-only, con evidencia archivo:línea, **sin proponer nada**.

> *"De todo lo decidido: ¿qué no se puede construir sobre este código? ¿Qué va a costar bastante más de lo que estas decisiones asumen? ¿Qué rompe un invariante, una transición o el aislamiento? ¿Qué exige un cambio de schema que nadie declaró?"*

**PARADA. El paso 2 no arranca hasta que el paso 1 está entregado.**

**Paso 2 · Revisión adversarial del diseño.** Sin código.

> *"Leé el recorrido decidido como si fueras un setter sin experiencia haciendo su primera demo. ¿Dónde te trabás? ¿Qué necesitás saber que ninguna pantalla te dice? ¿Qué decisión suena bien escrita y no se puede ejecutar?"*

**Tres reglas que la hacen útil en vez de teatro** — este proyecto ya tiene precedentes de auditorías que confirmaron lo que ya se creía:

1. **La pregunta nunca es "¿está bien?"**. Eso devuelve que sí.
2. **Sesión limpia.** Si entra sabiendo lo que decidimos y por qué, lo confirma.
3. **Hallazgos y opinión separados**, con parada entre medio.

`ultracode` aplica acá: son ejes independientes que se paralelizan —motor, aislamiento, schema, superficies, tests—.

---

## 2 · FASE B · Construir

**Ordenada de menos a más irreversible**, con las dependencias que anulan ese orden marcadas.

### C1 · Transversales y baratos

Se hacen una vez y aplican a las catorce superficies. **No bloquean nada y desbloquean todo lo demás.**

- `tsx` como devDependency · línea base de datos limpia y declarable.
- **La regla de las municiones:** salidas nunca plegadas; ejemplos y fundamento sí, con títulos que prometan.
- **S1** un solo nivel de superficie · **S5** un acento reservado a la acción · **S7** menos rótulos y más contraste entre ellos.
- **Vocabulario unificado:** una palabra por concepto en las quince pantallas. Pausar/postergar, brief/decidir, construir/arrancar/reabrir.
- Copy: sacar duplicaciones, el eyebrow triple, los subtítulos que explican el producto todos los días.

### C2 · Defectos con daño reproducido

Cada uno es chico y aislado.

El error de Zod en español y colgado del interruptor · `m13` en RECHAZADA con su control visible · el link al chequeo final durante la construcción · la fecha de postergación guardada como el día elegido · el contador de DMs contando mensajes · el nombre accesible del textarea · el acuse de "Saltar" · `aria-expanded` en el disclosure de pausar · el aviso de que enviar también guarda.

### C3 · Que la información viaje

Aditivo, toca datos.

**El historial registra el trabajo**, no solo el contacto — hoy anota toques y cierres, y no anota ficha, brief, construcción, borrador, chequeo, envío, rechazo ni reunión. · El rechazo visible donde el setter mira · La fecha de postergación fuera de `m5` · **El ángulo wow viaja al opener, al toque y al envío** · `espera` y `revision` dicen qué está haciendo Franco.

### C4 · El esqueleto de interacción

El bloque más grande: toca todos los componentes de pantalla.

**S2** avance por completitud · **S3** acción principal fija con su motivo de bloqueo · **S4** orientación permanente con el recorrido entero.

### C5 · Las cinco pantallas de la cadena de calidad

**Depende de C4** (usan el esqueleto) **y de que los Gems existan.**

`m1` por fuente, con los dos umbrales y el corte de los diez minutos · `m6` en cuatro fases · `mc1` en un paso con las tres capas · `mc2` con los cinco prompts · `m14` con la primera mirada y los tres estados.

**El Evaluador se saca acá, con `m1`**, porque `m1` absorbe el veredicto. **Con premortem** (§3).

### C6 · Panel y cartera

Las demos aprobadas y los rechazos entran a la cola de trabajo, no a novedades · La cartera se agrupa por turno · El foco se suelta · Dos números, no cuatro · La navegación se arregla o se saca.

### C7 · Motor y schema · **último, con premortem cada uno**

La rama POSTERGADO en `derivarPantalla` · El gate del check del dueño en `m16` · **Los campos nuevos**: el check falsamente verde en el rechazo, las marcas de tiempo, y el tercer estado del checklist —hoy es booleano—.

**Todo cambio de schema es decisión de Franco aunque sea aditivo.**

---

## 3 · Los premortems obligatorios

| Qué | Por qué |
|---|---|
| **Sacar el Evaluador** | Elimina una etapa: toca `derivarPantalla`, las transiciones, la cartera y los filtros |
| **El tercer estado del checklist** | Cambia el tipo de un campo persistido. **Achicar o cambiar identificadores persistidos ya vació progreso guardado en silencio en este proyecto** |
| **Los campos nuevos del rechazo** | Toca el dossier, que es lo que viaja entre pantallas |

---

## 4 · Carriles paralelos

No dependen de nada y conviene que corran cuando Franco pueda.

| # | Qué | Nota |
|---|---|---|
| **P1** | **Probar el export de Claude Design → Netlify Drop** | **S-01.** Media hora. Si falla, `mc1`, `mc2` y `m13` describen un procedimiento que no cierra — y **C4 y C5 serían trabajo para rehacer** |
| **P2** | **Crear los cuatro Gems** | El de diseño ya está escrito entero |
| **P3** | **Instalar `webapp-testing`** | Prerrequisito de A2 |
| **P4** | **Mirar el fix de clickjacking** | Dos minutos. Es producción |
| **P5** | **Los links de páginas ya hechas** | La vara visual, y el insumo del hueco G5 |

---

## 5 · Frentes propios — fuera de este chat

**Seguridad del producto** (cinco hallazgos sobre lo que se vende a clientes) · **Las skills de la Etapa 4** (las pasadas de Franco en Claude Code) · **El Gem de outreach** · **La demo como producto vendible** · **La sesión ajena que pushea a `main`** · **La capacitación reescrita desde la herramienta**.

---

## 6 · Riesgos vivos

| Riesgo | Mitigación |
|---|---|
| **S-01 sin probar.** Y el alcance creció: C4 y C5 son un rediseño grande. **Rediseñar pantallas que después hay que rehacer es la única forma de gastar este trabajo dos veces** | P1 |
| **Todo el diseño es hipótesis redactada.** Ni un prompt se corrió nunca | A3 y la corrida de Franco |
| **Otra sesión pushea a `origin/main`** | Fase 0 de terreno en todo sprint; frena si el censo no coincide |
| **Los 19 dictámenes viejos no son lista de trabajo** | A2 los reemplaza |
| **Cinco corridas de refinamiento por demo, sin medir** | Cronómetro en la primera demo real |
| **`getCalConfigLeadOS` exige una sola organización con `calComUsername`**, compartido con el módulo cliente | Decisión explícita antes de tocar Cal.com |

---

## 7 · Qué pasa después de A3

Con las tres auditorías entregadas:

1. Se incorporan sus hallazgos a las decisiones por pantalla y al brief v4 → **v4.1**.
2. Se deriva **C1** como primer bloque de sprints.
3. **El roadmap no se vuelve a abrir** salvo que una auditoría refute algo cerrado.

---

*v4 · agosto 2026. Roadmap macro cerrado. Trece superficies del setter diseñadas, sistema de interacción definido, brief v4 escrito, tres auditorías pendientes antes de construir.*

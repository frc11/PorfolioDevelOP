# OBSERVACIONES VISUALES — ADMIN
### Tanda 1 · 16 capturas · el núcleo de LeadOS

> Continúa el método de las tres tandas del setter. Misma clasificación: **DEFECTO** · **PROPUESTA** · **DECISIÓN** · **CONFIRMA** · **RESUELTO**.
>
> **Capturas:** cola de revisión (fold/full) · detalle en revisión (fold/full) · modal de rechazo × 2 · modal de aprobación × 2 · detalle aprobada con y sin link · detalle rechazada · evaluaciones del setter · setter sin datos · pipeline comercial · inbound · ficha con asignación · los tres `PAR-1`.

---

## 1 · El hallazgo estructural — dos sistemas de leads que no se hablan

**`/admin/leados`** (LeadOS): Ficha → Evaluada → Brief → Construcción → En revisión → Aprobada / Rechazada.

**`/admin/leads`** (Pipeline comercial): Prospecto → Demo enviada → Vio video → Respondió → Call agendada → Cerrado / Perdido / Postergado.

**Son los mismos negocios.** `QA-M5 Agotada`, `Café de la Esquina`, `QA-B4 Barbería El Faro` y `QA-W Postergado Vencido` aparecen en las dos superficies, con estados distintos y vocabularios distintos.

**Y no se sincronizan:** en el pipeline comercial, leads que en LeadOS ya tienen demo construida y publicada figuran con **"0 demos enviadas"**.

**Consecuencias:**
- Franco tiene que mirar dos lugares para saber dónde está un negocio.
- El contador *"Leads activos 103"* del pipeline y el *"67 en producción"* de LeadOS miden cosas distintas sin decirlo.
- **Hay un puente y va en una sola dirección:** la ficha del lead tiene *"Ver revisión de la demo (LeadOS) →"*, pero desde LeadOS solo hay *"Ver ficha completa del lead →"*. Existen los dos, pero nada reconcilia los estados.

**Esto no se decide acá.** Es la pregunta de si el pipeline comercial y LeadOS son dos vistas de lo mismo o dos sistemas. **DECISIÓN de Franco**, y es de las grandes.

---

## 2 · La cola de revisión está enterrada bajo seis mil píxeles

La pantalla se llama **"Revisión demos"** en el menú. Su contenido, en orden:

1. Banner de Telegram sin configurar
2. Pipeline de producción — cinco tarjetas de etapa
3. Setters trabados
4. **Atascos — ~60 tarjetas idénticas, más de 6.000 px**
5. **Cola de revisión — 13 demos** ← *lo único que Franco tiene que hacer*
6. Filtro del setter — descarte vs avance

**La tarea está debajo del diagnóstico.** Para llegar a la primera demo que revisar hay que pasar sesenta tarjetas de leads que no requieren ninguna acción hoy.

**PROPUESTA:** la cola de revisión va primera y arriba del fold. Los atascos son diagnóstico —importan, pero se consultan— y van después, plegados o en su propia superficie.

**Y los atascos necesitan lo mismo que la cartera del setter:** hoy son ~60 filas idénticas sin agrupar, sin ordenar y sin filtrar. Un lead atascado hace 67 días se ve igual que uno de hace 10.

**Dato que la pantalla presenta como estadística neutra:** **61 atascadas de 67 en producción.** El 91% de todo lo que está en producción no se mueve. Es fixture, pero el diseño trata ese número como un contador más, al lado de "en producción".

---

## 3 · El self-check muestra lo que el setter marcó, no lo que omitió — **DEFECTO**

En `02-leados-detalle-en-revision` el bloque **"Self-check del setter"** lista **seis** puntos en verde. En `07`, `08` y `09` lista **diez**.

La diferencia no es de diseño: **el admin renderiza lo que el setter tildó y no muestra lo que dejó sin tildar.**

**Franco no puede distinguir "lo revisó y estaba bien" de "no lo miró".** Y esa distinción es justamente la que mide si el ojo del setter está calibrado.

*(Con los tres estados que decidimos para `m14` —sin revisar · bien · mal— el admin puede mostrar los tres. Hoy no tiene qué mostrar porque el dato no existe.)*

**Lo que sí funciona:** los delatores viajan. `02` muestra **"Flags del setter · Tiene más de 3 colores"** en ámbar, separado de los checks. La honestidad del setter llega a Franco, que es exactamente lo que el texto de `m14` promete.

---

## 4 · G4, hecho visible en una sola captura — **CONFIRMA**

`09-leados-detalle-rechazada` muestra, en la misma columna y a pocos centímetros:

- **Self-check del setter: los diez puntos en verde.** Incluido *"El texto es de este negocio y de ningún otro"*.
- **Rechazos previos (1):** *"Qué: La prueba social no es real. Dónde: Sección «Reseñas». Arreglo: Reemplazá los textos por las reseñas reales del negocio."*

**El setter declaró que el texto era de ese negocio. Franco rechazó porque la prueba social era genérica. Los dos hechos conviven en la pantalla sin ninguna conexión.**

Eso es un check falsamente verde, visible, y **el producto no lo registra, no lo cuenta y no se lo devuelve al setter**. Es la señal más valiosa que existe sobre la calibración y hoy se pierde en cada rechazo.

**La infraestructura ya existe** —`HARD_CHECKS`, `HARD_CHECK_PROMPT`, `guidance-content.checkId`— y el formulario de rechazo no la usa. **No hay que inventar el mecanismo: hay que conectarlo.**

---

## 5 · Los dos modales

### El de rechazo — **lo mejor escrito del admin**

*"El setter va a ver esto tal cual en su panel como guía de retrabajo de QA-B4 Barbería El Faro."* Fija la consecuencia antes de escribir.

Y los placeholders **enseñan el nivel de especificidad esperado**: *"El hero no dice qué hace el negocio"* · *"Hero, título principal"* · *"Cambiar el título por el rubro + zona, ej: «Panadería artesanal en Tafí Viejo»"*. Es la misma calidad de los textos de ayuda de la ficha del setter.

**Dos cosas que le faltan:**

- **El campo que señala el check falsamente verde** (§4).
- **El self-check desaparece mientras escribís.** El modal tapa la página. Si Franco rechaza justamente porque un punto estaba mal marcado, tiene que acordarse de cuál. **PROPUESTA:** que el modal muestre los checks del setter al costado, y que marcar uno sea la forma de escribir el rechazo.

### El de aprobación — el hueco donde vive la pasada en Claude Code

*"Publicaste la demo a mano (Netlify, bajo develOP). Pegá acá la URL permanente — el panel solo la registra."*

**Esto confirma la corrección al brief v4:** la pasada de Franco en Claude Code ocurre **antes** de aprobar, no después. El modal asume que ya publicó la versión elevada.

**Pero no lo ayuda a hacerlo.** No trae el link del borrador para exportarlo, ni recuerda qué pasada corresponde. **PROPUESTA:** el modal muestra el borrador vigente y el ángulo wow, que es lo que Franco necesita para su pasada.

---

## 6 · "Aprobada sin link permanente" es casi indistinguible de la completa — **DEFECTO**

| Captura | Lo que dice el banner |
|---|---|
| `07` (con link) | *"Esta demo ya no está en revisión — estado actual: **Aprobada · URL permanente**"* |
| `08` (sin link) | *"Esta demo ya no está en revisión — estado actual: **Aprobada**"* |

**La única diferencia es la ausencia de dos palabras.** Y ese es exactamente el estado que **traba al setter**: la demo está aprobada, el envío no se destraba, y el setter ve *"Franco aprobó pero todavía no cargó su link permanente"*.

Franco no tiene ninguna señal de que dejó algo a medias.

*(El agente reportó que el schema exige `finalUrl` para aprobar, así que el admin no puede producir este estado. Pero el fixture existe — o es dato legado, o hay otro camino. **A verificar**, porque si es alcanzable, es un lead frenado en silencio.)*

---

## 7 · Las evaluaciones del setter — 10.400 px de log donde el criterio está enterrado

La pantalla se presenta así: *"Las últimas evaluaciones de este setter — score, veredicto y el razonamiento detrás. **El criterio detrás del filtro**, sin buscar en la base."*

Lo que muestra: **69 filas cronológicas**, sin filtro, sin agrupación, sin búsqueda. Y el razonamiento es **idéntico en casi todas**: *"Negocio vivo con señal de demanda desatendida — una demo con CTA de WhatsApp tiene chance."*

**El criterio son los 3 descartes.** Los 66 avances con razonamiento repetido son ruido, y están mezclados.

**PROPUESTA — la pantalla se invierte:** arriba, los descartes con su motivo (que es donde el setter ejerció criterio). Después, la tasa y su evolución. Y al final, la lista completa, plegada.

*(La tasa **4% de descarte** aparece acá y en la carga del equipo de la ficha del lead. Es el número que decidimos que debería subir cuando el filtro se vuelva estructural.)*

---

## 8 · Lo que ya está construido y no sabíamos

### "Marcar como caliente" existe — **RESUELTO**

En la ficha del lead, dentro de "Setter asignado":

> **Marcar como caliente** — *"Tu criterio, no el score. Prioriza el lead y habilita la demo preventiva."*

**El gate del recorrido es construible tal como está decidido.** La marca existe, está en manos de Franco, y el copy dice exactamente lo que la decisión cerrada dice: es criterio de Franco, no del score, y habilita la demo preventiva.

### "Vio video" es una etapa del pipeline — el Loom ya está modelado

El pipeline comercial tiene una columna **"Vio video"** entre *Demo enviada* y *Respondió*. Y el bloque de Demos de la ficha dice: *"Historial de demos enviadas, **Looms y seguimiento de visualización**"*.

**La idea del Loom no es nueva: ya hay una etapa y un modelo de datos esperándola.** Cambia el costo de la decisión — es menos construir de lo que parecía.

### La carga del equipo, con la calibración al lado

En la asignación de setter, cada uno aparece con sus activos y su **% de descarte**. Es la calibración puesta donde se toma la decisión de a quién asignarle un lead. **Bien resuelto.**

---

## 9 · Lo que falla y es chico

- **Un setter escaló hace 30 días y sigue ahí.** *"Probé el shell pero no me cierra la sección de reseñas en mobile."* El bloque de setters trabados funciona y es prominente. Lo que no hay es ningún vencimiento ni recordatorio — y **cualquier cambio de stage borra el aviso**, según la auditoría. El setter pide ayuda, el lead avanza, y el pedido desaparece sin rastro.
- **La ficha del lead dice "Sin teléfono".** Es el dato del que depende el botón de la demo. Confirma por qué el contacto real tiene que entrar como campo de la ficha del setter.
- **El banner de Telegram ocupa el tope de la pantalla más importante, siempre.** Es config, no trabajo. Va a la superficie de configuración con un indicador chico acá.
- **La columna del preview deja mucho espacio muerto.** Es `sticky` con alto fijo al viewport, así que en las capturas completas hay ~800 px de columna derecha vacía debajo del contenido.
- **`11-setter-sin-datos` y `13-leads-inbound` son estados vacíos bien resueltos:** dicen qué falta y qué va a aparecer.

---

## 10 · Lo que esta tanda cambia en lo ya decidido

| Qué | Cambio |
|---|---|
| **Brief v4, Etapa 6** | La pasada de Franco en Claude Code va **antes de aprobar**, no en un hueco posterior. El modal de aprobación lo confirma |
| **G4** | Pasa de "hallazgo a construir" a **"conectar infraestructura que existe"**. Y hay evidencia visual del daño |
| **El gate del recorrido** | La marca de caliente **ya está construida** y su copy coincide con la decisión |
| **El Loom** | Ya tiene etapa en el pipeline y modelo de datos. **Cuesta menos de lo que asumimos** |
| **El sistema de interacción** | Aplica al admin con más urgencia que al setter: la cola de revisión muestra el 9% de su contenido sin scrollear |

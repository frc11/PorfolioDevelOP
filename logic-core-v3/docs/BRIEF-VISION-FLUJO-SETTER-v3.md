# BRIEF DE VISIÓN — EL FLUJO DEL SETTER · v3
### develOP · LeadOS / Panel del Setter · julio 2026

> **Qué es este documento.** La vara. Define para qué existe la herramienta, quién la usa, cuál es el recorrido y qué no se toca. Reemplaza al brief v2 (02/07/2026), que describía un flujo con el orden invertido.
>
> **Cómo leerlo.** Cada punto está marcado:
> - **DECIDIDO** — está resuelto, se construye así.
> - **HIPÓTESIS v1** — definido para arrancar, se corrige con datos de uso real.
> - **DIFERIDO** — nadie lo decidió. No inventar, no construir alrededor.
>
> **Cambio principal respecto de v2.** El v2 asumía: contactar → esperar respuesta → armar el brief → construir la demo → mandarla. El v3 invierte eso: **se llega con la demo hecha.** El motivo es externo al producto — Claude Design construye una demo entera desde un prompt, así que construir dejó de ser el paso caro. El paso caro ahora es *elegir bien a quién*.

---

## 1 · Para qué existe · DECIDIDO

Hacer una demo es un proceso mecánico. Se repite igual todas las veces, tiene muchos pasos, y cada paso tiene su munición (un prompt, un bloque de texto, una herramienta que abrir). Hecho a mano se olvidan cosas, se pierde el orden y hay que volver a pensar qué sigue.

**La herramienta es ese proceso convertido en recorrido guiado**, para que una persona sin nuestra experiencia técnica pueda producir demos de nivel, en serie, sin que se le caiga nada.

Tres valores, los tres necesarios y en su momento:

1. **No olvidarte de nada** — el checklist.
2. **No tener que pensar qué sigue** — la secuencia.
3. **Tener la munición a mano** — los prompts y bloques listos para copiar.

Lo que **no** es: no es un CRM, no es un panel de métricas, y no reemplaza el criterio de nadie. Es un manual que se ejecuta.

---

## 2 · Quién la usa · DECIDIDO

- **Toba** es el usuario para el que se diseña. Setter online, home office, no técnico. Se está capacitando; arranca a trabajar cuando la herramienta esté lista.
- **Franco y Valentino** la usan primero, haciendo demos reales, para refinarla: sacar pasos que no sirven, agregar los que faltan. Eso es dogfooding, no un cambio de usuario — **cada decisión de diseño se toma pensando en Toba, no en ellos.**
- **Peter** (setter presencial) entra más adelante. No construye demos: recibe material ya hecho. El recorrido tiene que poder aceptar una entrada presencial sin rehacerse. *(Ver §8.)*
- Más setters online si el modelo funciona. El aislamiento por setter ya está construido y se mantiene.

---

## 3 · El recorrido · DECIDIDO

### Etapa 1 — Elegir el negocio

**El paso más valioso de todo el flujo.** Cierra 1 de cada 5 a 7 demos, y cada demo cuesta 20-30 minutos: elegir mal es la única forma de tirar tiempo a la basura.

Se evalúa, antes de construir nada, si el negocio **invertiría**: cómo mantiene sus redes, si pone plata en publicidad, si tiene repercusión local, si hay dueño identificable. La herramienta acompaña ese juicio con la munición (qué mirar, qué preguntas hacerse) y registra el veredicto. **No lo automatiza:** es criterio, y el criterio es del setter.

Prioridad: los conocidos o los que ya mostraron interés van primero en la fila. Pero el camino es el mismo para todos — **una sola entrada, siempre demo-first.**

### Etapa 2 — Recolectar el material

Todo lo que hace que la demo no sea genérica:

- **Reseñas de Google** — doble valor: material para la página, y gancho para la conversación ("vimos tus reseñas").
- **Instagram** — screenshots, estética, paleta, cómo se muestra el negocio.
- **Logo** y cualquier activo visual.
- Datos reales: qué vende, precios si están, fotos propias.

Se entra por lo visual, porque la gente compra por lo visual. **Esta etapa reemplaza al "brief" del v2**: no es escribir un documento, es juntar material.

### Etapa 3 — Construir y refinar

1. **Un chat de Sonnet 5** recibe todo el material recolectado y produce la orientación para construir: qué estilo, qué paleta, qué estructura, y el prompt inicial. *(Reemplaza al Gem Evaluador de Gemini: más capaz y sin límite práctico con el plan actual.)*
2. **Claude Design** — se elige la configuración correcta antes de abrir el proyecto (no es indistinta). El primer prompt ya llega con logo, paleta y estética definidas.
3. Sonnet genera un **roadmap macro** y el setter va pegando prompt por prompt. El primero puede ir en Opus 5; los siguientes en Sonnet con esfuerzo alto. **HIPÓTESIS v1** — se ajusta con uso.
4. **Prompts prefijados de refinamiento**, que son munición de la herramienta, no improvisación del setter: optimización mobile, animaciones, preloader, detalles que hacen que se sienta premium.

**Este es el tramo donde más se define si la demo cierra**, y es el que más énfasis necesita: corrección de errores y corrección de estética. Acá entra el ojo del setter — lo que la capacitación construye y los prompts prefijados apuntalan.

### Etapa 4 — Unificar y publicar

Una **corrida final en Claude Code** (Opus o Sonnet, esfuerzo alto) que toma la página construida y la eleva: unifica el trabajo de todos los prompts anteriores, pule la estética, y la deja con nivel de trabajo de muchas horas en vez de nivel "salió de un prompt".

Dos reglas de esa corrida — **DECIDIDO**:
- **Es aditiva y verificable.** Agrega capas sobre lo que hay; no reescribe de cero. Al terminar se comprueba que la página sigue abriendo y no perdió secciones. Toba no va a tener criterio para detectar una regresión, así que la comprobación no puede depender de su ojo.
- **Vive empaquetada como skill**, no como prompt pegado a mano: es un procedimiento repetible con sus reglas adentro.

Después, **Netlify**: se publica y queda el link.

### Etapa 5 — Contactar con la demo hecha

El primer contacto ya lleva el link. Y lleva **dos cosas, no una**:

- **La demo personalizada** — el gancho.
- **La librería de páginas reales** — la prueba. Sin ella, la demo sola se lee como poca cosa; la librería muestra el trabajo verdadero y la distancia entre una demo rápida y un sitio hecho.

**Canal — DECIDIDO:** uno primario, elegido por dónde el negocio está más activo (dato que la recolección ya reveló). Instagram, WhatsApp o mail. **No se dispara por los tres a la vez**: molesta, y perdés el rastro de dónde va a contestar.

### Etapa 6 — Seguir y agendar

- **Cadencia de 3 toques**, y cada toque **registra por qué canal salió** — porque los canales se alternan a propósito: si el primario no responde, el toque siguiente prueba otro.
- **Derivar a Franco**: cuando un lead se pone caliente, sale del recorrido del setter hacia Franco. Es una salida lateral explícita, no un final del flujo.
- Agotada la cadencia sin respuesta, el negocio **se enfría** — pero la demo queda hecha y publicada. Ese es material para que Peter la lleve en persona.
- El setter **agenda**; Franco cierra. Toba puede estar en la reunión para ganar experiencia, no es obligatorio.

---

## 4 · Reglas inviolables · DECIDIDO

1. **El precio lo habla Franco.** El setter no cotiza, no arma combos, no da descuentos, no compromete plazos.
2. **La revisión de Franco no se automatiza.** Mira estética: que la página venda, que no se note que salió de un prompt. Se sostiene hasta que confíe en Toba, y aun después queda una pasada. *(§5 la convierte en checklist para que sea delegable algún día — convertirla no es eliminarla.)*
3. **El ojo no se proceduraliza.** Se puede apuntalar con prompts y checklists; no se reemplaza con reglas automáticas.
4. **Aislamiento por setter.** Un setter no ve ni toca los negocios de otro, en ninguna consulta.
5. **El motor no se toca sin premortem**: transiciones, gates, claims de concurrencia, schema.

---

## 5 · Qué hace que una demo se rechace · HIPÓTESIS v1

La razón de rechazo, en palabras de Franco: **"que se note que salió de un prompt"**. Desglosada en lo verificable:

- Suena robótico; el texto no habla como el negocio.
- No apunta al marketing: no hay call to action, no hay recorrido pensado para que el visitante haga algo.
- Falta el análisis premium — los detalles que hacen que se sienta cuidada.
- El hero no tiene los datos reales del negocio.
- Fotos genéricas donde deberían ir las propias.

**Esto es la vara de la revisión y le falta a la herramienta.** Hoy el chequeo previo al envío verifica **mecánica** (que el link abra, que no haya texto de relleno, que el CTA se vea en mobile) — pero nadie verifica lo que Franco realmente mira. Cuando se delegue, esa es la parte que se cae. **DIFERIDO:** convertir esta lista en el checklist del chequeo.

Corrección: Franco le explica a Toba por audio qué arreglaría y por qué, para que aprenda. No lo arregla él en silencio.

---

## 6 · Restricciones de diseño · DECIDIDO

1. **Fluidez por encima de todo.** "Pluma, pluma, pluma. Observaciones, checklist, chau." Hacer clickear de más es el peor pecado posible: la herramienta existe para no perder tiempo generando demos. Cada clic que no aporta información es un clic que sobra.
2. **Pedirle registrar cosas que ya sabe está bien** — es necesario, porque el usuario no tiene el procedimiento en la cabeza. La fricción tolerable es la que enseña; la intolerable es la que solo hace ruido.
3. **Que entienda qué está haciendo.** Cada prompt y cada paso dicen para qué sirven. No es un botón que se aprieta a ciegas.
4. **Un negocio a la vez** en la construcción (Claude Design no permite varios proyectos simultáneos). El panel puede mostrar varios; el recorrido se trabaja de uno.
5. **El panel: escritorio primero**, mobile usable.
6. **La demo: mobile-first y desktop-first las dos.** Mobile porque el prospecto la va a abrir del celular cuando llegue por Instagram. Desktop porque cuando Peter la muestre en la notebook, vende mucho más.
7. **Vocabulario del oficio, no del sistema.** El setter lee palabras de su trabajo. Ningún mensaje de error ni de estado le habla en jerga técnica ni le pide hacer algo que no puede hacer.

---

## 7 · Qué se elimina del v2, y por qué

Lo que más se pierde cuando no queda escrito:

| Qué | Por qué se va |
|---|---|
| **Las 6 fases de construcción como pantallas** (estructura, personalización, assets, CTA, calidad, mobile) | Existían porque construir era artesanal y había que trocearlo. Claude Design lo hace en un prompt. Su contenido **no se pierde**: pasa a ser el checklist de verificación (§5) y los prompts prefijados de refinamiento. |
| **El tilde de auto-reporte por fase** | Sin fases, no hay qué tildar. Además nunca fue un gate, y su falta de acuse visual era una de las fricciones más repetidas. |
| **El envío del link como pantalla propia** | Con la inversión, el primer contacto ya lleva el link. Se funde con el contacto. |
| **El brief como documento a escribir** | Se convierte en recolección de material (§3, etapa 2). Escribir un brief para uno mismo era trabajo sin destinatario. |
| **El Gem de diseño** | Reemplazado por el chat de Sonnet + Claude Design. |
| **Cal.com como fuente de horarios** | La agenda no está tan cargada como para justificar la integración. **DIFERIDO:** cómo sabe el setter cuándo puede Franco — grilla fija declarada por Franco es la opción más barata que no lo mete en el camino crítico. La memoria de horarios ofrecidos y el claim atómico ya construidos sirven igual con cualquier fuente. |

---

## 8 · Qué se agrega

| Qué | Para qué |
|---|---|
| **La librería de páginas** | Páginas reales ya cerradas, por estilo y por rubro, para mostrar (prueba del trabajo verdadero) y para que el prospecto elija de qué inspirarse, tipo catálogo de temas. **Se inspira, no se reusa**: el sitio real se construye con más nivel que la referencia. Hay tres cosas distintas y no se confunden: demos rápidas · demos reales · páginas de clientes. **HIPÓTESIS v1:** hace falta producir más páginas para llenarla. |
| **Prompts prefijados como munición de primera clase** | Los prompts de refinamiento (mobile, animaciones, premium) y el unificador final son parte de la herramienta, no algo que el setter improvise. |
| **Derivar a Franco** | Salida lateral desde cualquier punto cuando el lead se pone caliente. Hoy no existe: un lead solo avanza, se enfría o se archiva. |
| **Canal por toque** | Cada toque registra por dónde salió, porque la cadencia alterna canales a propósito. |
| **El checklist de estética** (§5) | La vara de la revisión de Franco, escrita. |

---

## 9 · Qué queda fuera · DIFERIDO — no construir alrededor de esto

1. **Si el sitio real se hace de cero o se vende la demo.** Se decide en la reunión, hablando, según lo que el cliente entienda y quiera. **La herramienta no lo modela ni lo evalúa.** *(Preferencia de Franco, no decisión: empezar el proyecto de cero con mejor stack, tomando detalles de la demo y de otras páginas.)*
2. **El chatbot.** Es conversación de Franco en la reunión, no parte del recorrido del setter. La página funciona como gancho para engancharlo — esa es estrategia comercial, no flujo.
3. **La entrada presencial de Peter.** Su flujo está diseñado aparte y no construye demos. La conexión concreta ya identificada: las demos de quienes no contestaron online son material para que las lleve en persona. No se construye todavía.
4. **Volumen y cuota.** No hay número de demos por día ni por semana que la herramienta deba exigir o mostrar.
5. **Cómo se sostiene Toba hasta su primer cierre.** Cobra por cierre, y el primer cierre puede tardar. Riesgo registrado, sin resolver — y con el mismo efecto secundario que se anotó para Peter: pagar por cierre y medir actividad empuja a agendar cualquier cosa.

---

## 10 · Números de realidad · HIPÓTESIS v1

Para calibrar decisiones, no para exhibir en un panel:

- **20-30 minutos** por demo punta a punta, de los cuales ~15 son trabajo humano neto; el resto es esperar al modelo.
- **1 cierre cada 5-7 demos.**
- **Un negocio a la vez** en construcción.
- La revisión de Franco: ~20 minutos, más si hay que corregir.

---

## 11 · Cómo se adopta

1. **Franco y Valentino** hacen demos reales con la herramienta abierta. De ahí sale la poda fina: qué paso sobra, qué falta, dónde molesta.
2. **Toba** entra con la herramienta ya refinada y su capacitación hecha. Franco revisa cada demo.
3. **Franco suelta progresivamente** — cuando el checklist de estética (§5) esté en la herramienta y Toba lo cumpla sin ayuda. Queda siempre una pasada.
4. **Más setters** si el modelo cierra.

---

*v3 · julio 2026 · Reemplaza al brief v2 del 02/07/2026. Escrito a partir de la remediación completa del backlog de la auditoría de cierre, la galería de 37 estados, el manual del setter y sus 18 hallazgos, y la definición del proceso real de construcción de demos.*

# Estándar de documentos del manual — Guía de estilo

Documento de referencia para escribir/editar cualquier `.md` del manual de usuario del setter. Define la estructura, las reglas de contenido, cómo integrar la capa NotebookLM y el checklist de cierre.

---

## 1. Estructura fija (igual en todos — esto es lo que los hace familia)

- **Header:** nombre del módulo + nivel.
- **Propósito de este documento:** 3-4 líneas. Qué vas a poder hacer después de leerlo. No "de qué trata": qué habilita.
- **Una escena para empezar** (opcional pero potente): una situación concreta y reconocible que instala el problema antes de la teoría.
- **Capítulos numerados** (7 a 10). Cada uno un concepto, no un tema paraguas.
- **"Cómo se traduce a tu trabajo":** capítulo penúltimo, obligatorio. Baja todo lo anterior a acciones concretas del setter.
- **Síntesis:** las ideas madre en pocas líneas. Es el cierre conceptual real del doc.
- **Próximos pasos:** bloque de cierre con video (principal + secundario opcional) anclado a un capítulo, y card "Siguiente en tu ruta".
- **Footer:** `develOP · Documento interno · [nombre] v[x]`.

**Largo objetivo:** 140–180 líneas de `.md`. Si se pasa mucho, sobra relleno. Si baja de 120, está flaco.

---

## 2. Reglas de contenido (las que hicieron la diferencia)

- **Español rioplatense, voseo.** Registro profesional pero hablado, sin acartonar. Le hablás a un amigo que va a laburar, no a un alumno.
- **Cada capítulo termina en aplicación.** Concepto → ejemplo concreto → qué hacés vos con esto. Un capítulo que termina en teoría es un capítulo a medio hacer.
- **Ejemplos locales y reales:** rubros de Tucumán/NOA (concesionaria, inmobiliaria, clínica, gimnasio, restaurante), plataformas reales (MercadoLibre, Zonaprop, Doctoralia, PedidosYa), montos y tiempos verosímiles. Nada de "la empresa X".
- **Analogías para lo abstracto.** Funcionó muy bien (ej. explicar el LLM como "texto predictivo con esteroides"). Una buena analogía vale más que tres párrafos.
- **Observación antes que diagnóstico.** Al setter se le pide mirar y registrar, no dictaminar. El razonamiento se muestra explícito: observación → inferencia → ángulo.
- **Anti-slop de contenido:** cero relleno, cero frases de motivación vacías, cero listas que repiten lo dicho. Si un párrafo no agrega, se corta.
- **Anti-Matsu:** nada de prometer lo que el producto no entrega. Todo lo que roce producto/precio se ancla al estado REAL del negocio, nunca a los docs de marketing V3.
- **Definí el vocabulario** la primera vez que aparece (lead, prospecto, outreach, follow-up). El lector no es técnico ni viene del mundo de ventas.

---

## 3. La capa NotebookLM (el insumo nuevo)

El objetivo: que los documentos no sean "lo que sabe la IA" sino que estén **anclados a autores reconocidos**, con profundidad real y sin inventar.

### Cómo armar el notebook

- Un notebook **por track** (no uno por documento): ej. "Venta presencial / cara a cara".
- Fuentes: libros, transcripciones, cursos y charlas de autores reconocidos del tema. Pocas y buenas, no veinte mediocres.
- **Cruzá antes de sumar:** el knowledge base de Hormozi ya está extraído. Si un concepto ya está cubierto ahí, no dupliques — reusá.

### Candidatos para venta presencial

(validar cuáles sirven, no meter todos)

- Neil Rackham (*SPIN Selling* — venta consultiva por preguntas, probablemente el más pertinente al cara a cara B2B)
- Robert Cialdini (persuasión, ya usado en N1)
- Chris Voss (*Never Split the Difference* — manejo de la conversación y objeciones)
- Jürgen Klarić (neuroventas, LATAM)
- Blair Enns (*Win Without Pitching* — posicionamiento y no regalar trabajo)
- Matthew Dixon (*The Challenger Sale*)

### Cómo extraer (por documento, no en bloque)

1. Tenés el outline del doc aprobado.
2. Por cada capítulo, preguntale al notebook algo específico: *"¿Qué dice [autor/fuente] sobre [concepto del capítulo]? Dame el principio, el mecanismo por el que funciona, y un ejemplo."*
3. Pedile siempre **el porqué**, no solo la técnica. El "por qué funciona" es lo que hace que el setter lo aplique bien en una situación nueva.
4. Anotá de qué fuente salió cada insumo.

### Cómo integrarlo (clave — esto separa un doc bueno de un resumen de libro)

- El insumo se **traduce al mundo del setter**, no se transcribe. Nada de "según Rackham, existen cuatro tipos de preguntas": va como "antes de proponer nada, hacés estas preguntas — y esto es lo que cada una destraba".
- **El autor se menciona cuando aporta autoridad**, no en cada párrafo. Un doc que cita todo el tiempo se lee como monografía, no como manual de trabajo.
- **Adaptación argentina obligatoria:** el material US asume otro contexto (formalidad, ciclos, confianza institucional, moneda estable). Marcá y adaptá: acá el dueño desconfía del vendedor, decide solo, y el precio se piensa en dos monedas.
- **Un concepto por capítulo.** Si el notebook devuelve cinco ideas jugosas para un capítulo, elegís una y las otras van a otro capítulo o se descartan. La profundidad es enemiga del bloat solo si se acumula sin criterio.
- **Verificar, no afirmar:** si no estás seguro de que un autor dijo algo, no se lo atribuís. Se dice el principio sin firma antes que inventar una cita.

---

## 4. Bloqueante que aplica también acá

Los documentos de **conocimiento de producto** y **quiénes somos / posicionamiento** siguen bloqueados hasta que esté respondido el cuestionario de producto (qué es vendible y entregable hoy con precio real, resultado de negocio por producto, brecha demo↔producto, objeción por producto, historia de origen, prueba real). Todo lo demás se puede escribir sin eso.

---

## 5. Checklist antes de dar un `.md` por cerrado

- [ ] Tiene propósito, capítulos numerados, "cómo se traduce a tu trabajo", síntesis y próximos pasos.
- [ ] Cada capítulo cierra en aplicación concreta, no en teoría.
- [ ] Los ejemplos son locales, específicos y verosímiles.
- [ ] Está anclado a fuente reconocida donde corresponde, traducido (no transcripto) y adaptado a Argentina.
- [ ] Vocabulario definido la primera vez que aparece.
- [ ] Nada prometido que el producto no entregue.
- [ ] Sin relleno: si sacás un párrafo y no se pierde nada, sobraba.
- [ ] Versión bumpeada en el footer.

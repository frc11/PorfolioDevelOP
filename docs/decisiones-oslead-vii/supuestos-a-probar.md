# SUPUESTOS A PROBAR — LeadOS
### Lo que se dio por cierto y nadie verificó · archivo vivo

> **Para qué existe.** Cuando Franco corra el flujo completo haciendo una demo real, esta es la lista de lo que hay que mirar. Cada ítem dice **qué se asume**, **por qué importa** y **cómo se comprueba**.
>
> **Cómo se usa.** Append-only. Lo confirmado se marca ✅ con lo que se midió; lo refutado se marca ❌ con lo que pasó en su lugar. Nada se borra: un supuesto refutado es más valioso que uno que nunca se anotó.
>
> **Regla de fondo del proyecto:** nadie usó nunca esta herramienta para hacer una demo real. Todo lo que sigue es inferencia bien hecha, no dato.

---

## 1 · La cadena de construcción — lo más caro si falla

### S-01 · Claude Design exporta un HTML que Netlify Drop levanta y anda **⚠️ CRÍTICO**

**Se asume porque** `m13` se lo dice al setter: *"En Claude Design: Export → HTML standalone (o el .zip si lo ofrece)"* y después *"arrastrá el archivo (o la carpeta) ahí"*.

**Por qué importa:** si el export no produce un HTML autónomo que funcione, **toda la cadena de construcción está apoyada en aire** y las pantallas `mc1`, `mc2` y `m13` describen un procedimiento que no cierra.

**Cómo se comprueba:** media hora. Landing cualquiera en Claude Design → Export → Netlify Drop → abrir el link en el celular. Mirar: ¿se ve igual?, ¿las imágenes cargan?, ¿los links andan?, ¿el botón de WhatsApp abre el chat correcto?

**Es el supuesto número uno de toda la lista.** Todo lo demás depende de que este sea verdad.

### S-02 · El export es editable después, para la pasada en Claude Code

**Se asume porque** la Etapa 4 del brief define una corrida en Claude Code que eleva la demo construida.

**Qué mirar:** ¿es un solo archivo o un árbol?, ¿el HTML es legible o está minificado?, ¿el CSS está inline o aparte?, ¿los assets vienen embebidos o referenciados? Un HTML minificado de un solo archivo es mucho más caro de mejorar que un proyecto ordenado.

### S-03 · Un prompt denso con documento gana a una cadena de prompts

**Se asume porque** Franco probó la cadena *"hace bastante"* y no funcionó bien.

**Matiz honesto:** lo que se probó fue la cadena. **El prompt único con `.md` completo no se probó nunca** — es hipótesis, no conclusión.

**Cómo se comprueba:** dos demos del mismo negocio, una por cada camino. Comparar el resultado y el tiempo.

### S-04 · Claude Design respeta un `.md` largo sin perder instrucciones

**Por qué importa:** si a partir de cierto largo empieza a ignorar partes, el piso anti-slop se cae en silencio — y en silencio es lo peor, porque el setter no tiene cómo notarlo.

**Cómo se comprueba:** meter en el `.md` tres instrucciones verificables y raras (una tipografía concreta, un orden de secciones inusual, un texto exacto en el botón) y ver si las tres llegan.

### S-05 · El Gem lee imágenes y saca dirección estética útil

**Se asume porque** el paso 1 del Gem depende de que el setter pegue capturas del Instagram y el logo.

**Qué mirar:** ¿la lectura es específica de ese negocio o es genérica de rubro? Si a dos negocios distintos les devuelve la misma lectura, **el paso no sirve y todas las demos van a salir iguales** — que es exactamente el riesgo que hay que descartar.

### S-06 · Las cuatro vueltas del Gem caben en el presupuesto de tiempo

**Se asume** que leer la estética, decidir, especificar y cazar gaps entran en los 20-30 minutos del brief.

**Cómo se comprueba:** cronómetro real. Si el Gem se come quince minutos, la etapa hay que recortarla o el número del brief hay que corregirlo.

---

## 2 · El recorrido del setter

### S-07 · Los nueve prompts de munición nunca se corrieron

Ni una vez, ninguno. Están escritos y nunca se ejecutaron contra un negocio real. **Cada uno es un supuesto propio.**

### S-08 · 20-30 minutos por demo

Estimación oral sobre un proceso que nadie cronometró. Una corrida operando la herramienta midió **30 minutos el recorrido completo** — pero **sin las herramientas externas cargadas**, así que no incluye construir la demo. El número real es desconocido.

### S-09 · Un cierre cada cinco a siete demos

**Es una aspiración, no una estimación.** Franco dijo *"me gustaría creer que"*. **No calibra nada** y no se usa para decidir.

### S-10 · La ficha se completa en ~10 minutos con información suficiente

El corte de la capacitación dice que si en ~10 minutos no hay material para personalizar, el lead pasa al final de la lista. **Ese corte no está en el producto** y nunca se midió cuánto lleva de verdad.

### S-11 · Netlify Drop no pide cuenta y el link dura lo suficiente

Si el link expira antes de que el negocio conteste, la demo se cae después de mandada. Nadie lo verificó.

### S-12 · El setter puede juntar el material visual del negocio

Bajar el logo, tres a cinco fotos del Instagram o Maps, y pegarlas en el chat del Gem. **Se asume que es trivial y puede no serlo** — perfiles privados, fotos de baja resolución, negocios sin logo.

---

## 3 · Configuración que bloquea

### S-13 · Las cuatro URLs de herramientas

**Los cuatro Gems no existen todavía.** No es que falte el link: falta el Gem. Y el de diseño es el que estamos definiendo.

### S-14 · Cal.com sin configurar en las 16 organizaciones

`calComUsername` y `calComEmbedUrl` en `null`. La búsqueda de horarios falla con jerga cruda. Y ojo: el campo es **compartido** con el módulo cliente — cargarlo en un cliente rompe el agendado de LeadOS.

---

## 4 · Comportamiento del producto — para la corrida con navegador

| # | Supuesto | Cómo se comprueba |
|---|---|---|
| **S-15** | La pantalla se actualiza sola cuando la acción termina | Registrar el opener y esperar sin recargar |
| **S-16** | El motivo del rechazo sobrevive a "Reabrir construcción" | Apretarlo y recorrer las ocho pantallas |
| **S-17** | El check del dueño gatea la búsqueda de horarios | Buscar con el check apagado |
| **S-18** | El error de Cal.com llega crudo al setter | Apretar "Buscar horarios" con la config vacía |

---

## 5 · Gaps de la capacitación — a corregir cuando la herramienta cierre

> **Principio, fijado por Franco:** *"la herramienta define la capacitación, no la capacitación la herramienta"*. Los ocho documentos se escribieron antes; donde no coinciden, manda la herramienta.

### Reescribir desde la herramienta

- **Onboarding §9 · el flujo completo.** Describe un pipeline anterior. Concretamente: los tres "asistentes" del §4 no son los cuatro Gems actuales; el **video de Loom** del paso 7 no existe en el producto; el **aviso de lead caliente** del paso 3 y el **escalado al equipo** del paso 8 no tienen salida construida.
- **Onboarding §4 · tres marcas de "pendiente de detalle"** sobre construcción y publicación. **La herramienta ya las llena** — se reemplazan por lo que el producto hace hoy.

### Alinear en una dirección u otra

- **Los diez criterios del §7 contra el chequeo final.** No son los mismos diez. Faltan en el producto: **espacio en blanco**, **jerarquía visual**, **Fricción de Prestigio en el CTA**, alineación y consistencia. Y **tipografía y paleta son criterio de aceptación en la capacitación y delator opcional en el producto.** Hay que decidir cuál manda — y el chequeo final es la vara que se delega algún día, así que la decisión no es menor.
- **El corte de los 10 minutos** existe en la capacitación y no en `m1`.

### Decisiones pendientes que la capacitación ya prometió

- **El Loom.** Franco lo quiere (*"leí que así cerrás mucho más"*), va después de la pasada en Claude Code, y no está construido. Si entra, cambia `m15` y cambia lo que Franco hace al aprobar.
- **El aviso de lead caliente.** La capacitación lo instruye dos veces; el producto lo tiene diferido. Toba va a salir de la formación buscando un botón que no existe.

### Lo que NO se toca

**Ojo de diseño**, **Dominar la IA**, **Cómo piensa el dueño**, **Comportamiento por rubro** y **Juego mental** describen el oficio y el mundo, no nuestro procedimiento. **Son durables y siguen siendo la vara.** El piso anti-slop sale de *Ojo de diseño*, traducido a instrucción, sin reescribirlo.

### A revisar

**El cuaderno de ejercicios** entrena contra un flujo que va a cambiar. Cuando la herramienta cierre, conviene que los ejercicios apunten a las pantallas reales.

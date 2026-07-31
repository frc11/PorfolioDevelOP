# PILOTO DEMO-FIRST — una demo real, hoy, sin tocar código

> **Qué es esto.** El protocolo para hacer **una demo de verdad recorriendo la herramienta**, con el flujo del brief v3, aprovechando que el recon encontró que ese recorrido ya es legal hoy para un lead marcado caliente.
>
> **Por qué importa más que cualquier sprint.** El brief v3 §19.6 lo dice sin adornos: nadie usó nunca esta herramienta para hacer una demo. Todo lo construido y toda la poda planeada se apoyan en inferencia. **Este piloto es la primera vez que el proyecto toca la realidad**, y además prueba la cadena de prompts de la munición en la misma pasada.
>
> **Costo:** una hora, contando las notas. **Cero código.**

---

## Por qué se puede hacer hoy

El recon encontró que el gate que abre el brief (`gateBriefAbierto`) acepta dos llaves: que el negocio haya respondido **o** que el lead esté marcado **caliente**. Ese mismo gate se compone en el del envío.

**Consecuencia:** un lead marcado caliente al asignarlo puede recorrer `FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA → envío` **sin ningún contacto previo**. Que es exactamente el recorrido del v3.

**La limitación honesta, y hay que tenerla presente al leer los resultados:** marcar caliente es una acción de Franco desde el panel de admin. En el flujo real que propone el v3, **el setter llegaría solo**, sin que nadie le abra la puerta. Así que el piloto prueba **el recorrido y la munición**, no la entrada. Si el piloto sale bien, esa diferencia es exactamente lo que decide si hay que cambiar el gate o no.

---

## Preparación (10 minutos, Franco)

1. **Elegí un negocio real** de Tucumán al que le harías una demo de verdad. No uno de prueba: el valor del piloto está en que el material sea real y las decisiones cuesten.
2. **Creá el lead** desde el panel de admin.
3. **Marcalo caliente** al asignarlo. Esta es la llave.
4. **Asignátelo a vos o a Valentino.**
5. Tené a mano el `.md` de la munición y un bloc de notas abierto. **El bloc es la mitad del ejercicio.**

---

## El recorrido

Seguí lo que la herramienta te diga, **incluso cuando te parezca que está equivocada**. Que te mande al lugar equivocado es dato, no un problema a esquivar.

| Etapa | Qué hacés | Qué anotás |
|---|---|---|
| **1 · Elegir** | Ya elegiste. Registrá en la herramienta por qué este negocio califica. | ¿La herramienta te dio con qué juzgar, o lo pusiste de tu cabeza? |
| **2 · Recolectar** | Juntá el material real: screenshots del Instagram, logo, reseñas de Google, precios si están. | **¿Dónde lo pusiste?** El panel guarda texto, no archivos. ¿Te faltó un lugar para el material? |
| **3 · P0 dirección** | Pegá el prompt P0 de la munición con todo el material, en un chat de Claude con Opus. | ¿La ficha que devolvió nombra activos **concretos** de este negocio, o podría ser de cualquier peluquería? ¿El prompt de creación vino cargado con contenido real o con instrucciones genéricas? |
| **4 · P1 creación** | Abrí Claude Design, elegí el modo, pegá el prompt que te dio P0. | **¿Cuál modo elegiste y por qué?** (Ese dato es el hueco `[FRANCO]` de la munición.) ¿La primera versión salió específica o genérica? |
| **5 · P2 secciones** | Pedile el roadmap y andá pegando los pasos. | ¿Cuántos pasos hicieron falta de verdad? ¿Alguno salió inútil? |
| **6 · R1 a R5** | Los cinco refinamientos, en orden. | **Uno por uno:** ¿mejoró, no hizo nada, o empeoró? ¿Tuviste que reescribir el prompt en el momento? |
| **7 · U unificadora** | Si se puede exportar a archivos, corré el skill. Si no, anotá que no se pudo — eso responde la pregunta de plomería. | ¿Se pudo exportar? ¿La corrida mejoró o rompió algo? |
| **8 · Publicar** | Netlify. | ¿Cuántos pasos reales son? ¿Podría hacerlo alguien que nunca lo hizo? |
| **9 · Chequeo** | Pasá el chequeo de la herramienta. | **¿Los tildes se perdieron?** (Es el hallazgo H-12; confirmalo en vivo.) ¿El chequeo te hizo mirar lo que vos realmente mirás? |
| **10 · Revisión** | Miralo con el checklist de estética del brief §12 al lado. | **¿Los cinco criterios alcanzaron?** ¿Qué rechazarías que no está en la lista? Esto valida o corrige §12. |
| **11 · Contacto** | No lo mandes si no querés. Pero **abrí la pantalla del opener e intentá pegar el link**. | El schema rechaza links a propósito. **Confirmá que te rebota** — es la contradicción que hay que decidir. |

---

## Las cinco preguntas que el piloto tiene que contestar

Todo lo demás es color. Estas cinco son las que mueven decisiones:

1. **¿Cuánto tardó de verdad?** Cronometralo por etapa. El brief dice 20-30 minutos y ~15 de trabajo humano. Si son 60, varias cosas cambian.
2. **¿En cuántos momentos la herramienta te estorbó o te mandó al lugar equivocado?** Cada uno es un ítem del plan de poda, y sale de la realidad en vez de mi inferencia.
3. **¿La cadena de prompts aguanta?** Cuáles funcionaron, cuáles reescribiste, cuál sobra, cuál falta.
4. **¿Se puede exportar de Claude Design a archivos?** De esto depende que el skill unificador exista.
5. **¿El checklist de estética (§12) describe lo que realmente mirás?** Es lo que decide si algún día podés soltar la revisión.

---

## Reglas del piloto

- **No arregles nada en el momento.** Si algo está roto o molesta, se anota y se sigue. Arreglarlo sobre la marcha destruye el dato: después no vas a poder distinguir lo que estaba mal de lo que ajustaste sin darte cuenta.
- **No optimices el recorrido.** Si la herramienta te hace dar una vuelta larga, dala. La vuelta larga es el hallazgo.
- **Anotá los tiempos aunque te dé fiaca.** Es el número que menos se puede reconstruir después.
- **Si algo del brief o de la munición resulta falso, gana el piloto.** Es la única parte de todo este proyecto que no es inferencia.

---

## Qué pasa después

Con las notas del piloto y el recon ya hecho, cierro tres cosas de una sola pasada:

1. **El brief v3 actualizado** — con los supuestos resueltos por el recon y lo que el piloto haya corregido. *(No lo actualizo antes a propósito: reescribir la ley dos veces en un día es desperdicio, y el piloto puede cambiar más cosas que el recon.)*
2. **La munición, específica de develOP** — corregida por lo que pasó de verdad, más los links de la librería.
3. **El plan de poda**, pantalla por pantalla, apoyado en lo que te estorbó y no en lo que yo supuse que te iba a estorbar.

Y ahí sí se deriva al chat de ejecución.

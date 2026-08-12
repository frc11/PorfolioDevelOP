# BACHES — corrida de experiencia del Panel del Setter

**Qué es esto.** No es una auditoría. Es el registro de cinco recorridos usando el panel
y anotando **cada cosa que hizo falta saber y la pantalla no dijo**. El criterio no es
"está mal", es "no me lo dijeron".

**Cuándo.** 11 de agosto de 2026, 11:50 → 13:00.
**Contra qué.** Commit `4dadd274` (`main`), build de producción aislado en un worktree
propio (`C:/tmp/corrida-exp`), servidor en `:3005`. Ningún servidor ajeno tocado.
**Quiénes.** El camino principal, entero y en secuencia, por el agente padre. Después
cuatro barridos en paralelo: **A** la demo rechazada · **B** el negocio que no contesta ·
**C** nombres accesibles · **D** celular.

---

## Terreno

| | |
|---|---|
| `git status --porcelain` al arrancar | `?? logic-core-v3/.next-galeria/` · `?? logic-core-v3/.next-setter/` — dos directorios de build sin versionar, de otra sesión |
| Commit recorrido | `4dadd274` — *Merge remote-tracking branch 'origin/main'* |
| Aislamiento | Worktree propio en `C:/tmp/corrida-exp`, `node_modules` enlazado, build de producción propio, puerto **3005**, `AUTH_URL` alineado al puerto |
| Negocio sembrado | **Gimnasio Nova Fit** (`cmsoscikq00019fuof3t8xut8`) — `OsLead` asignado al setter, **sin dossier**: el estado real de "recién llegó" |
| Cartera del setter al arrancar | 76 leads |

**Por qué un worktree y no el checkout compartido.** Había otra sesión corriendo
`npm run start:setter` en `:3003`, y el working tree había cambiado por debajo de ese
proceso (`package.json` ya no tiene ese script y `next.config.ts` ya no tiene el knob
`distDir` que el proceso estaba usando). Con el árbol mutando en vivo, buildear encima
habría hecho que la corrida midiera un árbol que no es `4dadd274`.

### Una limitación del instrumento que hay que conocer antes de leer nada

**El panel del navegador no compone frames.** Consecuencias, todas identificadas y
sorteadas durante la corrida:

1. **No hubo capturas.** Todo se verificó por DOM y geometría.
2. **React 19 difiere el reveal de los boundaries de Suspense** en un buffer que se vacía
   desde `requestAnimationFrame`. Sin frames, ese buffer no se vacía nunca y el contenido
   queda colgado en un `<div hidden>`. Parece "la app se quedó cargando para siempre".
   **No lo es.**
3. **Las transiciones CSS quedan congeladas en el frame 0**, así que una barra lateral que
   está entrando mide como si estuviera fuera de pantalla.

Los tres produjeron falsos positivos que se refutaron antes de escribirlos, y quedan
listados abajo. **Un hallazgo propio quedó anulado por esto:** marqué como sospechoso que
el detalle de revisión del admin no expusiera un "Aprobar" funcional. Era el punto 2. El
panel de admin no tiene ese problema; **lo retiro**.

---

## 1 · El recorrido, pantalla por pantalla

Las cinco cosas: **qué entendí** leyendo solo la pantalla · **qué hice** · **qué me faltó
saber** · **cuánto tardé** · **si dudé**.

### P1 · `/setter` — el panel ("Tu día")

| | |
|---|---|
| **Qué entendí** | Hay un negocio que toca ahora, con su próximo paso y el motivo. Abajo: novedades, demos esperando a Franco, mis números, mi semana. |
| **Qué hice** | Leí el foco y apreté "Ir a trabajarlo". |
| **Qué me faltó saber** | Qué separa los **tres números** que conviven: *1 de 48 para trabajar*, *74 activos*, *76 en cartera*. El 74 está explicado ("sin los cerrados ni los perdidos"); el **48 no**. Quedan 26 leads vivos que no son "para trabajar" y la pantalla nunca dice por qué. · Que "Ver toda la cartera" es lo que abre la lista — la nav lateral tiene un ítem llamado "Cartera" que **no** lleva ahí. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí: qué hace "Pausar" y por cuánto. Se resuelve al tocarlo (despliega "Sacarlo de tu vista hasta… 3 días / 1 semana / 2 semanas / O elegí una fecha"), pero la duda existió. |

### P2 · La cartera (desplegable dentro de `/setter`)

| | |
|---|---|
| **Qué entendí** | Lista completa con buscador, ocho filtros de estado y cuatro órdenes. Cada tarjeta trae estado, motivo de prioridad y próximo paso. |
| **Qué hice** | Busqué "Nova" y entré a mi negocio nuevo. |
| **Qué me faltó saber** | Nada para buscar: el buscador dice bien qué busca. Lo que faltó fue **antes**: que la cartera vive acá y no detrás del ítem "Cartera". |
| **Cuánto tardé** | ~2 min |
| **Dudé** | No. |

### P3 · `m1` — la ficha

| | |
|---|---|
| **Qué entendí** | Cargar la ficha de observación. Cada campo explica qué mirar y el pie lista **qué falta** para que el Evaluador pueda puntuar. |
| **Qué hice** | Completé los seis campos. El link al Instagram del negocio está en el encabezado y abre en pestaña nueva — bien. |
| **Qué me faltó saber** | Si tenía que apretar "Guardar ficha": al lado del botón dice **"Guardado"** y debajo **"Se guarda solo mientras escribís"**, pero el cartel de arriba sigue diciendo **"guardá y pasala por el Evaluador"**. Lo apreté por las dudas. |
| **Cuánto tardé** | ~5 min |
| **Dudé** | Sí, exactamente en eso. *(Es H-06 del manual — sigue igual.)* |

### P4 · `m2` — "Llevá la ficha al Evaluador"

| | |
|---|---|
| **Qué entendí** | Copiar el bloque de la ficha, pasarlo por el Evaluador y volver con el resultado. |
| **Qué hice** | Copié el bloque (el botón responde "Copiado"). **No pude hacer el paso**: la munición dice "Evaluador — *Link pendiente*". |
| **Qué me faltó saber** | Dónde está el Evaluador. La salida existe —*"Todavía no tenés el link cargado — pedíselo a Franco y lo vas a poder abrir desde acá"*— pero está **plegada dentro de "Qué es y cómo se usa"**, un título que no promete eso. |
| **Cuánto tardé** | ~3 min |
| **Dudé** | Sí: si "Link pendiente" era un error mío o del sistema. |

### P5 · `m3` — "Registrá el veredicto"

| | |
|---|---|
| **Qué entendí** | Transcribir score, veredicto y razonamiento del Evaluador. |
| **Qué hice** | Inventé el veredicto (no podía correr el Evaluador) y lo registré. Score 3 · AVANZAR. |
| **Qué me faltó saber** | Que **sí estaba en el lugar correcto**. La pantalla dice *"Esta pantalla está disponible — tu paso de ahora es otro"* y ofrece "Ir a tu paso actual", que apunta a **`m2`** — la pantalla de la que venía, y cuyo único botón de avance vuelve a `m3`. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí, y fuerte: llegué a pensar que no debía completar el formulario. |

### P6 · `m4` — el opener

| | |
|---|---|
| **Qué entendí** | El primer mensaje sale **sin link**; se escribe acá, se manda a mano por Instagram y se registra. Hay control de ritmo ("0 / 30 DMs · hasta 6 por hora"). |
| **Qué hice** | Escribí el opener y apreté "Ya lo mandé en Instagram — registrar". |
| **Qué me faltó saber** | Que ya había avanzado. El aviso dijo *"Opener registrado — próximo toque el 13/8"* y la pantalla **siguió diciendo "TU PASO AHORA — Mandá el opener"**, sin puntero hacia adelante. Recién al recargar apareció el estado real. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí: si el registro había quedado. |

### P7 · `/manual/espera` — esperando al negocio

| | |
|---|---|
| **Qué entendí** | *"Esperando respuesta del negocio · Próximo toque el 13/8 — el foco te lo trae cuando llegue"* y una salida: "¿Respondió o pasó algo antes? Registralo". |
| **Qué hice** | Fui a registrar. |
| **Qué me faltó saber** | Nada. Es de las pantallas más claras: dice de quién es el turno, cuándo vuelve, y que **no tengo que acordarme yo**. |
| **Cuánto tardé** | ~1 min |
| **Dudé** | No. |

### P8 · `m5` — seguimiento

| | |
|---|---|
| **Qué entendí** | Registrar qué pasó. Cuatro opciones, cada una con su consecuencia. Y la regla de la cadencia escrita entera. |
| **Qué hice** | Marqué "Respondió", puse una nota y registré. Acá **sí** me llevó solo al paso siguiente. |
| **Qué me faltó saber** | Otra vez, que estaba donde debía: *"tu paso de ahora es otro"* → apunta a `espera`, que a su vez solo ofrece volver a `m5`. Segundo bucle, en otro tramo. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí, por el mismo cartel. |

### P9 · `m6` — el brief

| | |
|---|---|
| **Qué entendí** | Copiar ficha+evaluación, pasarlas por el Gem de diseño, y traer el brief a seis campos. |
| **Qué hice** | Cargué los seis y guardé. |
| **Qué me faltó saber** | Dónde está el Gem de diseño (**"Link pendiente"**). · Y otra vez el estado: *"Brief guardado"* mientras la pantalla seguía en *"TU PASO AHORA — Armá el brief"*. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí: si el brief se había guardado. |

### P10 · `m7`–`m12` — la construcción

| | |
|---|---|
| **Qué entendí** | **Seis** pantallas, una por fase. *"Las seis fases son auto-reporte: entrá y salí en el orden que te sirva — ninguna bloquea a otra. El único chequeo que gatea es el final."* Cada una: guía de 3 puntos, el bloque del brief, un tilde y un "Me trabé — avisar a Franco". |
| **Qué hice** | Arranqué la construcción y tildé las seis. |
| **Qué me faltó saber** | Dónde está Claude Design (**"Link pendiente"**, repetido en las seis). · Que "Arrancar construcción" ya había funcionado: el aviso decía *"Construcción arrancada"* y a diez centímetros la pantalla decía **"Primero arrancá la construcción — el botón está arriba"**. · Al terminar la sexta fase, **qué seguía**: no hay puntero a "publicá el borrador". |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí, en el arranque. El **tilde de fase sí se acusa** en el lugar del clic (pasa a "Fase marcada como hecha") — mejoró respecto de H-11. |

### P11 · `m13` — el borrador

| | |
|---|---|
| **Qué entendí** | Publicar en Netlify Drop y registrar el link. Cuatro pasos numerados, y una aclaración muy buena: *"Publicar acá NO es enviárselo al negocio."* |
| **Qué hice** | Pegué la URL y apreté "Guardar borrador". **Me frenó.** |
| **Qué me faltó saber** | Que *"Abrí el link en otra pestaña y confirmá que la demo carga bien antes de guardar"* **no era un consejo sino un interruptor obligatorio**. El error fue **`Invalid literal value, expected true`**, en inglés, crudo, colgado del campo **URL**. Tuve que abrir el DOM para descubrir el `role="switch"`. |
| **Cuánto tardé** | ~5 min, de los cuales 3 trabado |
| **Dudé** | No dudé: me frené. |

### P12 · `m14` — el chequeo final

| | |
|---|---|
| **Qué entendí** | Dos grupos rotulados sin ambigüedad: **"OBLIGATORIOS — BLOQUEAN EL ENVÍO"** (6, cada uno con qué mirar *y* el arreglo concreto) y **"OJO DE DISEÑO — NO BLOQUEAN, LOS VE FRANCO"** (4). |
| **Qué hice** | Tildé los seis obligatorios y una marca de diseño, y apreté "Enviar a revisión". |
| **Qué me faltó saber** | Si "Enviar a revisión" también guarda, habiendo un "Guardar el chequeo" al lado. (Verificado contra la base: **sí guarda**, incluidas las marcas de diseño. La pantalla no lo dice.) |
| **Cuánto tardé** | ~4 min |
| **Dudé** | Sí: cuál de los dos botones apretar. |

### P13 · `/manual/revision` — esperando a Franco

| | |
|---|---|
| **Qué entendí** | *"Franco está revisando tu demo — No hay nada que hacer ahora."* |
| **Qué hice** | Nada. No hay nada que hacer, y está bien dicho. |
| **Qué me faltó saber** | **Cuánto suele tardar.** El panel me había dicho que hay demos esperando hace 59 días; esta pantalla no tiene ninguna referencia de tiempo, ni el link del borrador que mandé. |
| **Cuánto tardé** | ~1 min |
| **Dudé** | No en el momento. |

### P14 · `m15` — el envío

| | |
|---|---|
| **Qué entendí** | *"El link de la demo sale acá y solo acá — nunca en el opener, nunca antes de que Franco la apruebe."* Trae el mensaje armado con el link adentro. |
| **Qué hice** | Documenté. No registré el envío para no mover un fixture sembrado. |
| **Qué me faltó saber** | Nada. Explica por qué se habilita sola: *"se destraba solo, sin que tengas que hacer nada"*. |
| **Cuánto tardé** | ~3 min |
| **Dudé** | No. |

### P15 · `m16` — la agenda

| | |
|---|---|
| **Qué entendí** | Cuatro pasos numerados: confirmar que hablás con quien decide, buscar 3 horarios, pasárselos, confirmar el elegido con nombre, email y notas de traspaso. |
| **Qué hice** | Marqué un horario para que apareciera el formulario y lo documenté. **No confirmé.** |
| **Qué me faltó saber** | Nada: la pantalla avisa sola —*"el evento se crea en el calendario real de Franco y Cal.com le manda la confirmación al prospecto"*— justo encima del botón. Es el mejor aviso de consecuencia de todo el recorrido. |
| **Cuánto tardé** | ~4 min |
| **Dudé** | No. |

---

## 2 · Los baches, ordenados por severidad

Origen: **P** = camino principal · **A/B/C/D** = barridos.
Los que ya estaban en [`HALLAZGOS-MANUAL.md`](HALLAZGOS-MANUAL.md) se **confirman**, no se
re-reportan.

### ME FRENA — y bloquea a quien trabaja solo

```
B-A1 · "Reabrir construcción" borra la única copia de lo que Franco pidió
· Dónde: mr — /setter/leads/<id>/manual/mr
· Qué necesitaba saber y no me dijeron: que apretar el único botón de acción de la
  pantalla destruye el motivo del rechazo. Antes decía «Qué: La prueba social no es real /
  Dónde: Sección "Reseñas" / Arreglo: Reemplazá los textos por las reseñas reales».
  Después: stage RECHAZADA→CONSTRUCCIÓN, /manual/mr redirige a m7, y un barrido por m1, m3,
  m6, m7–m12, m13 y m14 da 0 coincidencias de "Guía de retrabajo" ni "Franco pidió". La
  tarjeta de cartera también lo perdió. Y mr promete textualmente «el historial de rechazos
  se conserva», mientras "Ver historial del lead" dice «sin movimientos».
· Qué hice para salir: nada — no hay salida. Sin copiarlo antes, se corrige de memoria.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que la nota del rechazo sobreviva a la reapertura.
```

```
B-P1 / B-C2 · "Invalid literal value, expected true" — crudo, en inglés, en el campo equivocado
· Dónde: m13 — cargar una URL válida y guardar sin tocar el interruptor de confirmación
· Qué necesitaba saber y no me dijeron: que faltaba activar un interruptor. El
  aria-invalid="true" y el aria-describedby van sobre el <input type=url>, que es válido
  (checkValidity() → true); el interruptor que realmente falla queda con aria-invalid null
  y aria-describedby null. El foco no se mueve. Un lector de pantalla manda al setter a
  arreglar un campo que está bien.
· Qué hice para salir: abrí el DOM y encontré el role="switch". Tres minutos trabado.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: mensaje en español colgado del interruptor.
```

```
B-B1 · La postergación se guarda un día ANTES de la que elegiste
· Dónde: m5 → "Postergar"
· Qué necesitaba saber y no me dijeron: que la fecha que elijo no es la que queda.
  Elegí 25/8 → quedó "se retoma el 24/8". Repetido para refutarlo: elegí 1/9 → "31/8".
  Dos de dos, un día antes.
· Qué hice para salir: nada — volver a postergar vuelve a correrse.
· Severidad: me confunde (por el efecto: me frena) · ¿Bloquea a quien trabaja solo?: sí —
  si le dijiste al negocio "te escribo el 25", el panel te lo trae el 24
· Qué habría hecho falta: que la fecha que muestra sea la que elegí.
```

```
B-C7 · "Pausar en tu cartera" no hace nada y no avisa nada
· Dónde: /setter → cartera → botón "Pausar en tu cartera" de cualquier tarjeta
· Qué necesitaba saber y no me dijeron: si pasó algo. Cero acuse: el label no cambia, no
  hay estado pending, no se abre nada, la región aria-live queda vacía. Probado 4 veces
  (click directo, MouseEvent real, sobre leads en Ficha y en Brief). El "Fijar arriba" de
  al lado sí se deshabilita al instante y anuncia "Lo sacaste de fijados" — el patrón
  correcto EXISTE en el mismo componente.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que pausar cambie el label y anuncie, igual que el pin.
```

```
B-A4 · El chequeo final se nombra tres veces y no se linkea ninguna
· Dónde: mr, m13 y m7–m12 · el destino es /manual/m14
· Qué necesitaba saber y no me dijeron: cómo llegar. Censados todos los <a> de mr, m1, m3,
  m6, m7, m12, m13 y m14: ninguno apunta a m14. Con el lead en RECHAZADA, escribir la URL a
  mano redirige a mr. Recién al tildar la 6ª fase el link "Ir a tu paso actual" apunta a
  m14 — y las mismas pantallas dicen "tildar no bloquea nada ni te hace avanzar".
· Qué hice para salir: escribí /manual/m14 a mano — conocimiento que no salió de ninguna pantalla.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que cada mención del chequeo final sea un link.
```

```
B-A8 · Nadie te avisa que te rechazaron la demo
· Dónde: /setter y la cartera
· Qué necesitaba saber y no me dijeron: que había una demo devuelta. La raíz "rechaz"
  aparece **0 veces** en el DOM renderizado de /setter. El foco era otro lead. Las 12
  novedades visibles son todas "Te reasignaron un lead". El bloque "Tus demos esperando a
  Franco" cuenta las 11 en revisión y no menciona rechazos. En los 8 filtros de la cartera
  no hay "Rechazadas": el lead cae en "Para trabajar", mezclado con leads que nunca se enviaron.
· Qué hice para salir: scrollear ~2.700px dentro de la cartera hasta la tarjeta.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que un rechazo se anuncie donde el setter mira primero.
```

```
B-B5 · Un lead postergado no muestra la fecha en ningún lado salvo dentro de m5
· Dónde: la ficha de un postergado (abre en m4) y su tarjeta de cartera
· Qué necesitaba saber y no me dijeron: hasta cuándo está postergado. Barrido el texto
  entero de las dos pantallas: lo único con forma de fecha es "3/5" (el score). Solo el chip
  "Postergado". La tarjeta dice "se retoma cuando se reactive", sin fecha.
· Qué hice para salir: no pude. La supe recién al postergar yo otro lead y caer en m5.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: la fecha al lado del chip, en la ficha y en la tarjeta.
```

```
B-B8 · m5 manda a abrir el Gem y no trae la aclaración que sí está en m4
· Dónde: m5, bloque "Bloque para el Gem de outreach — objeciones"
· Qué necesitaba saber y no me dijeron: qué hacer sin el link. Dice «Abrí el Gem para
  pegarlo:» + pill "Link pendiente" (<span> sin href) y **nada más**. En m4 el mismo caso SÍ
  está explicado ("pedíselo a Franco y lo vas a poder abrir desde acá").
· Qué hice para salir: nada. Y es el peor momento: te tiraron una objeción.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: la misma aclaración que ya está en m4.
```

```
B-A6 · El rechazo pide "re-publicá el draft" y m13 está congelada sin un solo botón
· Dónde: m13, linkeada desde mr, con el lead en RECHAZADA
· Qué necesitaba saber y no me dijeron: que ahí todavía no se puede hacer nada. Censo de
  botones: []. Dice "El borrador ya quedó publicado" y "Esta pantalla ya quedó hecha". Es el
  destino literal del "Arreglo" que escribió Franco. "Cambiar el link del borrador" aparece
  recién después de reabrir la construcción.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que la pantalla congelada diga qué hay que hacer antes para tocarla.
```

```
B-C1 · La nota privada de cada tarjeta es un campo mudo
· Dónde: /setter → cartera → "Agregar nota" → el <textarea> que se abre
· Qué necesitaba saber y no me dijeron: qué escribo ahí. Sin aria-label, sin id (o sea sin
  label[for]), sin <label> envolvente, sin aria-labelledby. El único texto es el placeholder.
  El título visible "Tu nota privada" existe pero no está asociado, y el contador "0/240"
  tampoco. Es **el único control sin nombre de toda la corrida** (verificado: labelEls = []).
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: un id en el textarea y "Tu nota privada" como <label for>.
```

```
B-D3 · Los 6 interruptores que BLOQUEAN el envío son el blanco táctil más chico de la app
· Dónde: m14 en celular — 390px y 320px
· Qué necesitaba saber y no me dijeron: los 10 switches comparten `w-11` (44px) pero no
  tienen `shrink-0`. A 390px: los 6 obligatorios miden 30, 30, **26**, 27, 27, 27 × 24px;
  los 4 opcionales, 44 × 24px. A 320px los obligatorios bajan a **20–22px**, por debajo del
  mínimo 24×24 de WCAG 2.2 SC 2.5.8. Y los 4 opcionales están envueltos en <label> (toda la
  fila de 298×32 es tappeable); los 6 obligatorios **no** (verificado con closest('label')).
  El blanco más chico y sin affordance es el de los checks que deciden si la demo sale.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí — errar el toque a 320px
  significa mandar una demo con un obligatorio sin verificar
· Qué habría hecho falta: `shrink-0` y envolver la fila del grupo 1 en el mismo <label>.
```

```
B-D9 · A 320px el selector de orden de la cartera queda fuera de pantalla e inalcanzable
· Dónde: /setter → cartera expandida, 320px (rompe por debajo de 360)
· Qué necesitaba saber y no me dijeron: la fila de filtros es flex-nowrap y los wrappers de
  select no tienen min-w-0, así que no se achican. Necesita 331px. A 390 → entra con 30px de
  aire. A **360 (Android mayoritario) → 0px de aire, pegado al borde**. A **320 → el botón va
  de x=200 a x=360: 40px fuera**, chevron entero afuera, y documentElement.scrollWidth === 320
  → no hay scroll horizontal para llegar.
· Qué hice para salir: nada. Me frené ahí.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: flex-wrap + min-w-0 en la fila de filtros por debajo de 400px.
```

```
B-D2 · En celular, "Cartera" del menú te deja a 2.277px de la cartera, cerrada
· Dónde: menú hamburguesa → "Cartera", 390px
· Qué necesitaba saber y no me dijeron: que navega a /setter pelado, scrollTop 0. La cartera
  vive en un botón con aria-expanded="false" a **2.277px del tope** (3,3 pantallas), después
  del foco, 12 novedades y el bloque de demos. No auto-scrollea ni auto-expande.
· Qué hice para salir: scrollear a ciegas. La primera vez pensé que el ítem estaba roto.
· Severidad: me frena · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: que "Cartera" abra la sección ya desplegada y scrolleada.
```

```
B-B7 · Tres palabras para lo mismo, y el filtro que las nombra está vacío
· Dónde: /setter ("Pausar" en el foco, "Pausar en tu cartera" en la tarjeta, "Pausados por
  vos" en el filtro, atajo "Pausar (posponer) · p") vs m5 ("Postergar")
· Qué necesitaba saber y no me dijeron: dónde queda un lead que posterguée. Posterguée uno
  hasta el 31/8 y fui a "Pausados por vos": «0 leads en la lista». Estaba en "En seguimiento".
· Qué hice para salir: probé los 7 filtros uno por uno.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: sí — el vocabulario te manda al
  lugar equivocado y ahí no hay nada
· Qué habría hecho falta: una sola palabra para el concepto, y que su filtro lo contenga.
```

```
B-B3 · Postergar consume tu cupo diario de DMs sin mandar ningún DM
· Dónde: m5, caja "Canal Instagram — hoy N / 30 DMs"
· Qué necesitaba saber y no me dijeron: que el contador sube con CUALQUIER registro.
  Medido: 2/30 → opener → 3/30 → tres toques → 6/30 → postergar → 7/30 → postergar → 8/30.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: sí — postergás 10 leads a la
  mañana y el panel te dice que gastaste un tercio del día
· Qué habría hecho falta: que el contador cuente mensajes mandados, no registros.
```

```
B-B2 · Registrar "Postergar" no acusa recibo: lo registré dos veces
· Dónde: m5
· Qué necesitaba saber y no me dijeron: si se guardó. El formulario se limpió solo y nada
  más cambió: seguía "Toques: 3 de 3", el chip en "Prospecto", el historial en 4 movimientos.
  Esperé 19 s: igual. Solo al recargar apareció. Contraste: los toques SÍ refrescaban en el acto.
· Qué hice para salir: recargué — y como no había acuse, volví a postergar. **Quedaron dos
  postergaciones duplicadas en el historial (12:45 y 12:47).**
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: sí — te lleva a duplicar el registro
· Qué habría hecho falta: que después de guardar la pantalla diga qué quedó guardado.
```

```
B-A5 · "el botón está arriba" — y arriba no hay ningún botón
· Dónde: m7, bloque REGISTRO, con el lead en RECHAZADA
· Qué necesitaba saber y no me dijeron: dónde está ese botón. El tilde venía disabled con
  "Primero arrancá la construcción — el botón está arriba." Censo de m7: solo dos botones,
  "Copiar bloque" (y=608) y el tilde deshabilitado (y=1296). El botón real se llama
  **"Reabrir construcción"**, no "arrancar", y vive en **otra pantalla** (mr).
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: sí
· Qué habría hecho falta: nombrar el botón como se llama y decir en qué pantalla está.
```

```
B-C6 · Los 4 checks de "ojo de diseño" llegan sueltos y con la polaridad invertida
· Dónde: m14
· Qué necesitaba saber y no me dijeron: qué significa prenderlos. Ninguno de los 10 switches
  tiene aria-describedby, así que el instructivo de cada fila ("Abrí la URL en otra pestaña…"
  / "Si no carga, volvé a Borrador y re-publicá…") no llega. Y
  querySelectorAll('fieldset,legend,[role=group]').length === 0: los 4 últimos no están
  agrupados bajo "Ojo de diseño — no bloquean, los ve Franco", así que "Tiene más de 3
  colores, interruptor, desactivado" no dice si desactivado es bueno o malo.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: sí, en los 4 de ojo de diseño
· Qué habría hecho falta: aria-describedby por check y un role=group con nombre para el bloque.
```

### ME CONFUNDE — no bloquea, pero te deja sin saber si hiciste bien

```
B-P2 · "Ir a tu paso actual" te manda a la pantalla de la que venís
· Dónde: m3 → apunta a m2 · m5 → apunta a espera
· Qué necesitaba saber y no me dijeron: que estaba en el lugar correcto. m2 solo avanza a m3
  y m3 dice "tu paso de ahora es otro" → m2. Bucle cerrado. Lo mismo entre espera y m5, en un
  tramo que no comparte código.
· Qué hice para salir: ignoré el cartel y completé el formulario igual.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que una pantalla a la que la app te acaba de mandar no te diga que
  estás en otro lado.
```

```
B-P3 · Las acciones que mueven de etapa no se acusan donde hiciste el clic
· Dónde: m4 (registrar opener), m6 (guardar brief), m7 (arrancar construcción), m13 (guardar
  borrador), m14 (enviar a revisión) — cinco veces en un recorrido
· Qué necesitaba saber y no me dijeron: si quedó. En los cinco casos el aviso flotante
  confirma («Construcción arrancada — seguí la guía») y la pantalla sigue mostrando la
  instrucción anterior («Primero arrancá la construcción — el botón está arriba»), sin
  puntero hacia adelante. El estado sí avanzó: aparece al recargar.
· Qué hice para salir: recargar cada vez. Es lo que hay que saber y la pantalla no dice.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no, pero ver B-B2 (produjo un
  registro duplicado) — es el mismo síntoma con daño
· Qué habría hecho falta: que la pantalla se actualice donde se hizo el clic.
  *(Es el patrón que el manual ya nombró en H-03/H-06/H-11/H-12 — sigue, y ahora con más casos.)*
```

```
B-A2 · Te reabre la construcción en la fase equivocada
· Dónde: mr → m7 (Estructura)
· Qué necesitaba saber y no me dijeron: en qué fase se arregla «Dónde: Sección "Reseñas"».
  Me depositó en "Estructura · Generá el esqueleto", que es lo único que NO falla. La app SÍ
  tiene ese vocabulario: m14 escribe "(Construcción, fase Personalización)", "(fase Assets
  reales)", "(fase CTA)" debajo de cada check. mr no lo usa.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que el "Dónde" del rechazo apunte a la fase concreta.
```

```
B-A3 · "Checklist y borrador quedaron como estaban" — y el checklist estaba vacío
· Dónde: mr (lo dice dos veces)
· Qué necesitaba saber y no me dijeron: que las 6 fases iban a estar sin tildar. m7 a m12
  daban aria-pressed="false" las seis. Verificado contra el toggle (al marcar una pasó a
  "true" y el botón cambió a "Desmarcar"), o sea que estaban genuinamente apagadas.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que la frase describa lo que la pantalla de al lado va a mostrar.
```

```
B-B4 / B-B10 · La cabecera dice "Tu paso ahora" cuando no hay ningún paso
· Dónde: un lead postergado hasta el 31/8 abre en m5 con "Tu paso ahora — Registrá lo que
  pasó" · un lead con la cadencia agotada insiste con "Tu paso ahora" mientras el cuerpo dice
  "Cadencia completa — sin más toques" · los postergados fixture abren en m4 con "Mandá el opener"
· Qué necesitaba saber y no me dijeron: que no tengo nada que hacer. La pantalla /manual/espera
  existe y dice exactamente eso, pero para un postergado no se usa: entrar a mano redirige a m5.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que un lead pausado abra en la pantalla de espera, como los demás.
```

```
B-B6 · Postergado vencido y futuro se ven idénticos, y los dos dicen "se venció"
· Dónde: cartera → filtro "Para trabajar"
· Qué necesitaba saber y no me dijeron: cuál venció de verdad. Las dos tarjetas dicen palabra
  por palabra "Se venció la postergación — retomá el contacto", mismo chip, misma razón de orden.
· Refutación honesta: la lógica SÍ distingue — al postergar yo a fecha futura, ese lead quedó
  fuera de "para trabajar". Lo más probable es que la fecha del fixture "Futuro" ya haya pasado.
  El bache que queda es que **no hay cómo saberlo**: sin fecha en pantalla, un rótulo
  equivocado sería indetectable.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: mostrar la fecha, para que el rótulo sea verificable.
```

```
B-C3 / B-C4 / B-C5 · Los selects custom no dicen qué está elegido, y el radiogroup no se maneja como uno
· Dónde: cuatro selects (filtro y orden de la cartera, "Quién maneja el Instagram" en m1,
  "Veredicto" en m3) y el score de m3
· Qué necesitaba saber y no me dijeron: (a) el valor actual — el aria-label gana sobre el
  contenido, así que se anuncia "Filtrar por estado, botón, contraído" y el valor elegido nunca;
  (b) sobre qué opción estoy al abrir — el aria-activedescendant está en el listbox, que tiene
  tabindex="-1" y nunca recibe foco; (c) cómo moverme en el score — role=radiogroup invita a
  usar flechas, las flechas no hacen nada, y los 5 radios tienen tabIndex 0 (sin roving).
  El estado sí está expuesto (aria-checked).
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: nombrar el select con etiqueta + valor, y roving tabindex en el score.
```

```
B-A11 · mr te da "Copiar bloque" para Claude Design y no dice adónde pegarlo
· Dónde: mr, "Contexto del lead"
· Qué necesitaba saber y no me dijeron: dónde va ese bloque. mr no tiene ninguna tarjeta de
  herramienta: 0 coincidencias de "Link pendiente" en esa pantalla, así que ni siquiera sale
  el "pedíselo a Franco" que sí aparece en m7.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que el bloque copiable venga con su destino al lado.
```

```
B-A7 · El historial dice "sin movimientos" con un rechazo encima
· Dónde: pie de todas las pantallas del lead
· Qué necesitaba saber y no me dijeron: dónde está el "historial de rechazos" que mr promete.
  Abierto tres veces (al entrar, tras reabrir la construcción, tras tildar las 6 fases):
  siempre "Todavía sin movimientos registrados". No registró ni el rechazo, ni la reapertura,
  ni los seis tildes.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: que el rechazo y la reapertura sean movimientos del lead.
  *(Confirma H-14 del manual, y lo agrava: con B-A1 el dato no está en ningún lado.)*
```

```
B-D4 · La munición muestra entre el 20% y el 56% de su contenido, a 11px, en un scroll anidado
· Dónde: m2, m3, m6, m7, m13, m16 en celular
· Qué necesitaba saber y no me dijeron: qué estoy por pegar. El <pre> tiene max-h-56 (224px)
  con overflow-y auto y font-size 11px, adentro de un main que también scrollea. m7 (el paso
  más cargado, con las reseñas y el brief entero) muestra **20%** (1114/222). m6, 45%. m2, 56%.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no (el botón copia todo igual),
  pero verificar lo que pegás es impracticable
· Qué habría hecho falta: sacar el max-h en <768px o un "Ver completo".
```

```
B-D6 · El nombre del lead pierde hasta el 45% del ancho contra dos chips que no se achican
· Dónde: cartera en celular
· Qué necesitaba saber y no me dijeron: de quién es cada tarjeta. El cluster de badges es
  shrink-0 y se queda con 180px fijos; al <h3 truncate> le quedan 115. A 390px: **23 de 76**
  nombres truncados, el peor al 55%. A **320px: 61 de 76**, el peor al **18%** (29px de 159).
  Con nombres que comparten prefijo, los primeros 115px son todos iguales.
· Severidad: me frena en 320 / me confunde en 390 · ¿Bloquea a quien trabaja solo?: sí a 320px
· Qué habría hecho falta: bajar los badges a una segunda línea en <768px.
```

```
B-D1 · La X de cerrar el menú se come el tercio derecho de "Cargar prospecto"
· Dónde: drawer del menú, 390px y 320px
· Qué necesitaba saber y no me dijeron: que "Cerrar menú" (36×36) está absoluto encima del
  CTA (215×40). Se superponen en 35×32px — el 16% del ancho del botón primario.
  elementFromPoint(210,30) devuelve "Cerrar menú". El label termina en x=158, así que el
  botón SE VE entero y tappeable de punta a punta.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: bajar la X fuera del área del CTA.
```

```
B-D11 · m4 y m5 redirigen a m6 sin decir nada
· Dónde: cualquier paso que el lead todavía no alcanzó (confirmado también por el barrido C)
· Qué necesitaba saber y no me dijeron: que ese paso no está disponible. redirectCount: 0
  (redirect de servidor, la URL llega reescrita). Sin cartel, sin aviso.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no
· Qué habría hecho falta: un cartel de una línea diciendo por qué te trajo acá.
```

```
B-D10 · Texto de 10–11px con contraste de 1,8:1 a 2,7:1 en todo el chasis
· Dónde: transversal — drawer, /setter, todas las pantallas del manual
· Qué necesitaba saber y no me dijeron: nada — se trata de poder leerlo. Medido componiendo
  fondos reales sobre canvas (los colores son oklch, no se resuelven parseando rgb). Fallos
  contra el 4,5:1 de AA: sublabels de "Tus herramientas" 10px → **1,82:1** · nombres de las
  herramientas 14px → 2,46:1 · timestamps de Novedades 11px → 2,52:1 · "Después: QA-W Brief ·
  +45 más en la cola" 12px → 2,67:1. Entre 28 y 30 nodos con font-size < 12px por pantalla,
  piso en 9px.
· Severidad: me confunde · ¿Bloquea a quien trabaja solo?: no, pero incumple el mínimo AA
  que fija el propio CLAUDE.md
· Qué habría hecho falta: piso de 12px y subir los textos secundarios un escalón de gris.
```

### ME HACE RUIDO

```
B-P4 · La nav lateral tiene un ítem "Cartera" que lleva a "Tu día"
· Dónde: barra lateral, todas las pantallas. En celular cuesta 2.277px de scroll (B-D2).
· Severidad: me hace ruido en desktop / me frena en celular · ¿Bloquea?: no en desktop
· Qué habría hecho falta: que "Cartera" abra la cartera.
```

```
B-P5 · El foco queda fijado en un negocio que nunca trabajé
· Dónde: /setter. Apreté "Ir a trabajarlo" en un lead, no lo trabajé, trabajé otro durante
  media hora, y al volver el foco seguía clavado en el primero con la etiqueta "Fijado
  mientras lo trabajás". Nunca notó que estuve en otra cosa.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: que el fijado caduque o siga al lead que estás abriendo.
```

```
B-P6 · Tres números en el panel y solo dos explicados
· Dónde: /setter — "1 de 48 para trabajar" / "74 activos de 76" / "Ver toda la cartera 76".
  El 74 está explicado ("sin los cerrados ni los perdidos"); el 48 no.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: una línea que diga qué deja afuera "para trabajar".
```

```
B-P7 · Dos botones al pie del chequeo y ninguna pista de si enviar también guarda
· Dónde: m14 — "Guardar el chequeo" y "Enviar a revisión". (Verificado contra la base:
  enviar SÍ guarda, incluidas las marcas de "ojo de diseño". La pantalla no lo dice.)
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: decir que enviar guarda, o dejar un solo botón.
```

```
B-P8 · La pantalla de revisión no muestra el borrador ni cuánto suele tardar
· Dónde: /manual/revision. El panel dice que hay demos esperando hace 59 días; acá no hay
  ninguna referencia de tiempo ni el link de lo que mandé.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: el link del borrador y una referencia de plazo.
```

```
B-B11 · El panel resume las esperas de Franco pero no las del negocio
· Dónde: /setter. Hay un bloque "Tus demos esperando a Franco · 11 demos"; no hay equivalente
  para los 12 en seguimiento (esperando respuesta / enfriándose / postergados). Las novedades
  tampoco avisan "hoy te toca un toque" ni "se venció una postergación".
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: una línea de esperas del negocio al lado de la de Franco.
```

```
B-B9 · La pantalla de espera nunca dice cuántos toques quedan
· Dónde: /manual/espera. Con 0 toques decía "Próximo toque el 13/8"; con 2, "el 14/8".
  Idéntica. El contador "Toques: N de 3" solo existe dentro de m5.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: el "N de 3" en la misma línea que la fecha.
```

```
B-A9 · Novedades: el número dice 76, la lista muestra 12, no hay "ver más"
· Dónde: /setter. La <ul> tiene 12 <li> y scrollHeight === clientHeight (no hay scroll oculto).
  El único botón es "Marcar como vistas".
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: o paginar, o que el número diga lo que se muestra.
  *(Confirma H-04 del manual.)*
```

```
B-A10 · El rechazo no tiene fecha ni número de vuelta
· Dónde: mr y la tarjeta de cartera. Solo Qué/Dónde/Arreglo. La única fecha visible es la del
  lead ("hace 42 días"), que no es la del rechazo. Y mr habla en plural ("el historial de rechazos").
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: fecha y contador junto al motivo.
```

```
B-C8 · Los chips de fases no dicen cuáles ya hiciste
· Dónde: nav "Fases de la construcción". Con las fases 1, 2 y 3 hechas, sus chips tienen
  exactamente el mismo markup y las mismas clases que las pendientes: mismo nombre accesible,
  sin aria-label, sin title, sin aria-current. El número va en un <span aria-hidden="true">.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: aria-label="Fase 1, Estructura — hecha" en las completadas.
```

```
B-C9 · "Enviar a revisión" está apagado y no explica por qué
· Dónde: m14. <button disabled> pelado, sin aria-describedby ni title. Con `disabled` nativo
  sale del tab order, así que navegando por controles ni te enterás de que existe. La
  explicación ("Quedan 6 obligatorios en rojo…") está como texto suelto un párrafo más arriba.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: aria-describedby del botón al párrafo que explica el gate.
```

```
B-C10 · Los 4 botones de resultado de m5 no forman un grupo con nombre
· Dónde: m5. Viven en un <div class="grid"> sin role ni aria-label; el ancestro con nombre
  más cercano es un <section aria-label="Registro"> tres niveles arriba. Se anuncian como 4
  botones sueltos, sin decir que contestan la misma pregunta.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: role="group" con aria-label alrededor de los cuatro.
```

```
B-C11 · El panel de atajos es un role=dialog que nunca recibe el foco
· Dónde: /setter, botón "?". El disparador pone aria-expanded="true" (bien) pero no tiene
  aria-controls; el panel es role="dialog" sin aria-modal, sin tabindex, y el foco se queda
  en el botón.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: aria-controls, o mover el foco al panel al abrir.
```

```
B-C12 · "Copiar bloque" avisa cambiándose el propio nombre, sin live region
· Dónde: m2, m4, m5, m6, m7, m14, m15, m16 (hasta 3 por pantalla en m5). El único acuse es
  que el texto pasa a "Copiado" ~1s. Como ocurre en el elemento enfocado, algunos lectores lo
  dicen y otros no. La región polite del layout queda vacía.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: anunciar "Bloque copiado" en la live region que ya existe.
```

```
B-D5 · "Volver a tu cartera" mide 16px de alto — el escape de cada pantalla del manual
· Dónde: m1, m2, m3, m6, m7, m13, m14, revision, m16 en celular. 119×16px, padding 0,
  font-size 12px. Por debajo del mínimo 24×24 de WCAG 2.2 SC 2.5.8. Es el único camino de
  vuelta que no pasa por el hamburguesa. Misma familia: "Ver respuesta completa del Gem"
  298×16 y el link del borrador 228×20.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: py-2 -my-2 para llevar el blanco a 32–40px sin cambiar cómo se ve.
```

```
B-D7 · Las 3 acciones de cada tarjeta son de 28×28 con 4px entre ellas — 228 blancos chicos
· Dónde: cartera en celular. "Fijar arriba", "Pausar en tu cartera" y "Agregar nota" miden
  28×28 con 4px de separación, repetidos en las 76 tarjetas. La tarjeta entera es un <a> al
  lead, así que errar el toque te navega fuera. "Pausar" está pegado a "Fijar" y hacen cosas
  opuestas sobre el mismo lead.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: 40×40 con 8px de gap en <768px.
```

```
B-D8 · Todos los campos de formulario están a 14px → iOS Safari hace zoom al enfocarlos
· Dónde: m6 (6 campos), m14, m16, buscador de la cartera. El viewport meta es correcto (sin
  maximum-scale), pero por debajo de 16px Safari iOS hace auto-zoom al enfocar. El brief
  tiene 6 campos → 6 zoom-outs manuales por lead. Los inputs de 38px también quedan bajo 44.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: font-size 16px en inputs y textareas por debajo de 768px.
```

```
B-D12 · La escalera de "Completadas": 13 chips de 31px con 8px de aire
· Dónde: pie de m7, m13, m14, revision, m16 en celular. Se envuelve en 4–5 filas con 8px
  vertical entre blancos de 31px.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: 40px de alto y 12px de gap en <768px.
```

```
B-P9 / B-A12 / B-B12 · "la más vieja hace hace N días"
· Dónde: /setter, "Tus demos esperando a Franco". Confirmado por tres recorridos
  independientes, con 59 y 60 días. Y la línea de al lado —"Las ves en tu cartera → filtro
  «Esperando revisión»"— no es link ni botón: hay que abrir la cartera y buscar el filtro a mano.
· Severidad: me hace ruido · ¿Bloquea?: no
· Qué habría hecho falta: sacar el "hace" duplicado y que la flecha lleve al filtro.
  *(Es H-02 del manual — sigue, y el número creció.)*
```

---

## 3 · Los patrones

**Esto es lo que más vale del reporte.** Un bache que aparece en varias pantallas que no
comparten código no son varios bugs: es un concepto que falta. Salieron seis.

### Patrón 1 · No hay un acuse de recibo estándar en el lugar del clic

**Diez casos, al menos seis caminos de código distintos:** registrar el opener (m4), guardar
el brief (m6), arrancar la construcción (m7), guardar el borrador (m13), enviar a revisión
(m14), postergar (m5), "Pausar en tu cartera" (cartera), "Saltar" (foco, H-03), los tildes
del chequeo (H-12), el tilde de fase (H-11).

**Lo que tienen en común:** el aviso flotante confirma, y la pantalla donde el setter tiene
puesto el ojo sigue mostrando el estado anterior — a veces contradiciendo al aviso en la
misma pantalla ("Construcción arrancada" arriba, "Primero arrancá la construcción" abajo).

**Lo que lo vuelve un concepto y no una serie de bugs:** el patrón correcto **ya existe en
el producto**. "Fijar arriba" se deshabilita al instante y anuncia en la región aria-live.
El tilde de fase, que en el manual figuraba como mudo, hoy sí cambia a "Fase marcada como
hecha". O sea: la casa sabe hacerlo y no lo aplica parejo.

**Y ya produjo daño medible:** el barrido B, sin acuse, registró la misma postergación dos
veces. Quedaron dos filas en el historial.

### Patrón 2 · El puntero de "dónde estoy y a dónde voy" miente

**Ocho casos, en tramos que no se tocan entre sí:**

| Dónde | Qué dice | Qué pasa |
|---|---|---|
| m3 | "tu paso de ahora es otro" | manda a m2, que solo avanza a m3 |
| m5 | "tu paso de ahora es otro" | manda a `espera`, que solo ofrece volver a m5 |
| m7 (rechazado) | "el botón está arriba" | el botón se llama distinto y está en otra pantalla |
| lead postergado | "Tu paso ahora — Registrá lo que pasó" | no hay nada que registrar hasta el 31/8 |
| cadencia agotada | "Tu paso ahora" | el cuerpo dice "sin más toques" |
| m4, m5 no disponibles | — | redirige a m6 en silencio |
| chequeo final | nombrado 3 veces | ninguna es link; no hay forma de llegar |
| nav "Cartera" | "Cartera" | lleva a "Tu día" |

**El concepto que falta:** una sola fuente de verdad sobre el paso actual, y la regla de que
**todo destino que la pantalla nombra tiene que ser alcanzable desde ahí**.

### Patrón 3 · El dato que necesitás para trabajar vive en una sola pantalla y no viaja

**Siete casos:** el motivo del rechazo se destruye al reabrir (B-A1) · el historial de
rechazos se promete y no existe (B-A7, H-14) · la fecha de postergación solo existe dentro
de m5 (B-B5) · el contador "N de 3 toques" solo existe dentro de m5 (B-B9) · la pantalla de
revisión no muestra el borrador que mandaste (B-P8) · la salida "pedíselo a Franco" está en
m4 y no en m5 (B-B8) · los chips de fases no dicen cuáles hiciste (B-C8).

**El concepto que falta:** el estado del negocio tiene que viajar **con el negocio**, no
quedarse en la pantalla donde se produjo. Hoy el setter tiene que estar parado en el lugar
exacto para enterarse de cosas que necesita en otros cuatro.

### Patrón 4 · Los mensajes de sistema salen crudos a la cara del setter

**Dos casos, dos pantallas, y el producto tiene el traductor:** `Invalid literal value,
expected true` en m13 (inglés, jerga de Zod, colgado del campo equivocado) y `Setup B7.0
pendiente: cargá en la organización develOP el username de Cal.com (calComUsername)…` en
m16 (H-16). Los dos esquivan el traductor de errores que el resto del panel sí usa.

**El concepto que falta:** que ningún mensaje llegue al setter sin pasar por el traductor —
y que el error se cuelgue del control que falla, no del que está al lado.

### Patrón 5 · El vocabulario cambia entre pantallas para la misma cosa

**Pausar / Posponer / Postergar / "Pausados por vos"** — cuatro palabras, y el filtro que
lleva una de ellas está vacío porque el lead cae en otro (B-B7). **Arrancar / Reabrir**
construcción (B-A5). **Tres controles distintos para tildar** (H-13). **"Cartera" / "Ver
toda la cartera" / "Volver a tu cartera"** — tres nombres, dos destinos, ninguno la cartera
en el primer caso.

**El concepto que falta:** un glosario único. Cada sinónimo obliga a aprender la pantalla
de nuevo, y en el caso del filtro manda al lugar equivocado.

### Patrón 6 · Lo que decide más tiene menos peso que lo accesorio

**Cuatro casos:** los 6 checks que **bloquean el envío** miden 26px y no tienen fila
tappeable; los 4 que **no bloquean nada** miden 44px y sí la tienen (B-D3) · "Volver a tu
cartera", el único escape de cada pantalla del manual, mide 16px (B-D5) · el bloque de
Novedades ocupa más que foco + cartera + números juntos (H-04) mientras un rechazo no
aparece en ningún lado del panel (B-A8) · la munición del paso más cargado se lee al 20%
(B-D4).

**El concepto que falta:** jerarquía por consecuencia, no por tipo de componente.

---

## 4 · Los seis momentos

### 1. La pantalla de evaluación fusionada — ¿dos movimientos en un lugar, o falta algo?

**No hay tal pantalla en `4dadd274`.** La evaluación son **dos**, y la app las numera así:
`m2` = **"EVALUACIÓN — PASO 1 DE 2"** ("Llevá la ficha al Evaluador") y `m3` = **"PASO 2 DE 2"**
("Registrá el veredicto"). `m2` cierra con *"¿Volviste con la respuesta del Evaluador? El
veredicto se registra en la pantalla siguiente"* y un botón que navega a `m3`.

Lo que sí se puede responder es cómo se lee el corte en dos: **se lee bien como secuencia y
mal como ubicación.** El traspaso está explicado con todas las letras, y una vez en `m3` la
app te dice que estás en el lugar equivocado y te ofrece volver a `m2`. El corte está bien
narrado; el puntero lo contradice.

### 2. Las dos pantallas de construcción — ¿un paso de trabajo o tres cosas apiladas?

**Tampoco existen.** La construcción son **seis** pantallas, `m7`–`m12`, con **un** tilde
cada una. La app lo dice dos veces: **"CONSTRUCCIÓN — PASO 1 DE 6"** en el encabezado y
**"Las seis fases son auto-reporte"** al pie, con la tira 1-Estructura · 2-Personalización ·
3-Assets · 4-CTA · 5-Calidad · 6-Mobile.

Verificado por dos vías: los enlaces de la tira apuntan a `m7`…`m12`, y las rutas `mc1`/`mc2`
devuelven **la misma página que un paso inexistente** (`mzz`): 49.965 y 49.885 bytes contra
49.885, frente a 105.656 de `m7`.

Sobre la versión que sí existe: **se lee como un paso de trabajo.** Cada pantalla tiene un
objetivo, una guía de tres puntos concretos, el bloque del brief a mano y un solo tilde. El
riesgo de apilamiento que la fusión iba a introducir no está porque la fusión no está.

### 3. El chequeo con sus dos grupos — ¿queda claro cuáles revisás vos y cuáles mira Franco?

**Sí, sin ambigüedad. Es la pantalla mejor resuelta del recorrido.** Los rótulos hacen todo:
**"OBLIGATORIOS — BLOQUEAN EL ENVÍO"**, seis, cada uno con qué mirar **y** el arreglo
concreto con la fase exacta a la que volver; **"OJO DE DISEÑO — NO BLOQUEAN, LOS VE FRANCO"**,
cuatro, con la regla social escrita: *"Ser honesto acá juega a favor: Franco las revisa igual."*
Y el gate se explica en vivo: "Quedan 6 obligatorios en rojo" → "Todos en verde — podés enviar".

**Para la pregunta de fondo —qué revisión se puede delegar algún día— la partición está
lista.** Lo que la enturbia son tres cosas, todas de forma y no de concepto: dentro del
segundo obligatorio hay incrustado un bloque de munición que parte visualmente la lista
(B-P7); en celular el grupo que bloquea tiene blancos táctiles más chicos que el que no
bloquea (B-D3); y para un lector de pantalla los cuatro de "ojo de diseño" llegan sueltos,
sin su encabezado, así que no se sabe si prenderlos es bueno o malo (B-C6).

### 4. El panel de inicio — ¿te dice qué hacer ahora y por qué ese negocio y no otro?

**Sí a las dos, y bien.** El foco trae el negocio, el próximo paso en imperativo ("Generá el
brief") y **el motivo en la misma tarjeta**: *"Respondió — va primero"*. Adelanta la cola
("Después: QA-W Brief · +46 más"). Los motivos son legibles y distintos entre sí ("Por orden
de llegada", "Esperando revisión de Franco").

Lo empañan cuatro cosas, ninguna sobre el "qué" ni el "por qué": el foco se fija y **no se
entera de lo que estás haciendo** (B-P5); hay tres números y solo dos explicados (B-P6); **un
rechazo no aparece en ninguna parte** del panel (B-A8); y las esperas del negocio no tienen
resumen aunque las de Franco sí (B-B11).

### 5. Las esperas — ¿sabés de quién es el turno sin leer nada al costado?

**Sí, y es lo mejor resuelto después del chequeo.** *"Esperando respuesta del negocio ·
Próximo toque el 13/8 — **el foco te lo trae cuando llegue**"* — esa última cláusula es la
que saca el peso de encima. Y del otro lado: *"Franco está revisando tu demo · **No hay nada
que hacer ahora**"*. Verificado que la promesa se cumple: hay leads en la cola con la leyenda
"Te toca un toque — mandalo y registralo".

La regla de insistir-o-soltar está escrita entera y no hay que deducirla: *"Tres toques y
para… Si tras los tres no contesta, el lead se enfría — sin más insistencia."* Y se cumple:
al tercer toque **el botón desaparece** y queda "Los 3 toques ya se cumplieron — si no
respondió, se enfría solo". Quién cierra también está dicho, tres veces con la misma frase:
"el cierre del lead lo decide Franco".

Lo que falta: la fecha va sin año, sin día de la semana y sin "en N días" (hubo que mirar el
reloj); la espera no dice en qué toque vas (B-B9); la espera de revisión no da ninguna noción
de cuánto es normal (B-P8); y **la pantalla de espera no se usa para los postergados ni para
la cadencia agotada**, que abren diciendo "Tu paso ahora" sin tener ninguno (B-B4, B-B10).

### 6. La munición — ¿sabés qué hacer con cada bloque, dónde pegarlo, y qué mirar cuando vuelve?

**Qué hacer y qué mirar cuando vuelve: sí. Dónde pegarlo: no, en 4 de 5 casos.**

Los bloques están bien construidos: llevan el pedido adentro (`m4` abre con *"Pedido:
redactá un primer DM de Instagram dolor-first. Corto, humano… SIN link, SIN precio"*), el
botón acusa recibo, y varios explican qué esperar de vuelta (`m2`: *"Qué te devuelve: un
score del 1 al 5, un veredicto… Eso es lo que transcribís acá abajo"*).

El hueco es **dónde**: la munición de `m2`, `m4`, `m6` y `m7`–`m12` termina en una
herramienta que dice "Link pendiente". Tenés el bloque en el portapapeles y ningún lugar
donde pegarlo. Peor en `mr`, que da un "Copiar bloque" y ni siquiera nombra la herramienta
(B-A11), y en `m5`, que manda a abrirla sin la aclaración que sí está en m4 (B-B8).

`m15` es el caso modelo: el bloque trae el link ya adentro y la pantalla dice dónde va y
dónde no — *"El link va acá y solo acá."*

---

## 5 · Las herramientas sin dirección

Cuatro de las cinco no tienen dirección cargada. **Es H-01 del manual y sigue igual.** Lo
que agrega esta corrida es el conteo y un matiz que cambia el diagnóstico.

**Conteo de choques, sumando los cinco recorridos: 24.**

| Recorrido | Choques | Dónde |
|---|---|---|
| Camino principal | **10** | m6 (×2), m2, m4, y m7–m12 (seis veces seguidas, Claude Design) |
| A · rechazada | **8** | m3, m6, m7, m8, m9, m10, m11, m12 |
| B · no contesta | **6** | m4 y m5, en los tres leads |
| C · nombres | — | censó la barra lateral: 4 de 5 son `<li>` inertes con badge "pendiente" |
| D · celular | — | ídem, verificado a 390 y 320px |

La única con dirección real es **Netlify Drop** → `https://app.netlify.com/drop`, en `m13`
y en la barra lateral, y ahí el botón dice **"Abrir Netlify Drop"**.

**Qué le pasa a un setter ahí.** El recorrido entero depende de estas herramientas: el
segundo paso de su primer negocio es "pegalo en el Evaluador", y las seis fases de
construcción arrancan con "pegalo en Claude Design como primer mensaje". Uno que ya las
conoce sigue solo desde otra pestaña. **Uno nuevo se frena y tiene que preguntarle a
Franco** — que es, literalmente, lo que el texto le indica.

**El matiz que cambia el diagnóstico.** El manual dice que la pantalla *"no se lo dice, sólo
dice «pendiente»"*. Hoy **sí se lo dice**: dentro del desplegable hay una frase exacta y
accionable — *"Todavía no tenés el link cargado — pedíselo a Franco y lo vas a poder abrir
desde acá."* Pero está **plegada bajo un título que no la anuncia** ("Qué es y cómo se
usa"), **falta por completo en `m5`** (B-B8) y **la herramienta ni aparece en `mr`** (B-A11).

O sea: la parte de configuración sigue rota (Franco tiene que cargar 4 URLs), pero la parte
de producto ya casi está — solo está guardada en el cajón equivocado, y no en todas las
pantallas.

---

## 6 · Los tiempos

| Tramo | Reloj | Duración |
|---|---|---|
| Terreno: git, aislamiento, worktree, build, siembra | 11:50 → 12:03 | **13 min** |
| P1–P2 · panel + cartera + encontrar mi negocio | 12:03 → 12:09 | 6 min |
| P3–P5 · ficha + evaluación (dos pantallas) | 12:09 → 12:15 | 6 min |
| P6–P9 · opener + espera + seguimiento + brief | 12:15 → 12:20 | 5 min |
| P10–P11 · seis fases de construcción + borrador | 12:20 → 12:24 | 4 min |
| P12 · chequeo final + envío a revisión | 12:24 → 12:28 | 4 min |
| P13–P15 · revisión + envío + agenda | 12:28 → 12:33 | 5 min |
| **Camino principal** | **12:03 → 12:33** | **30 min** |
| Barridos en paralelo | 12:35 → 13:00 | A 50′ · B 22′ · C 72′ · D 60′ |
| **Total de la corrida** | **11:50 → 13:00** | **70 min** |

**El tramo desproporcionado es el terreno: 13 minutos, casi la mitad del camino principal
entero**, y ninguno se fue en el producto. Se fueron en descubrir que el checkout estaba
siendo mutado por otra sesión y en montar un worktree aislado con su propio build. Es costo
de tener dos frentes sobre el mismo repo, no del panel.

Del lado del producto, el tramo más caro por pantalla fue **`m13`, el borrador: 5 minutos,
de los cuales 3 trabado** contra un mensaje de error que no decía qué hacer. Es una sola
pantalla y se llevó más que las seis de construcción juntas.

---

## 7 · Los cuatro barridos paralelos

| | Qué buscaba | Baches | El más caro |
|---|---|---|---|
| **A** | la reentrada por rechazo | 12 | "Reabrir construcción" borra el motivo del rechazo |
| **B** | el negocio que no contesta | 12 | la postergación se guarda un día antes de la elegida |
| **C** | nombres accesibles | 12 | "Pausar en tu cartera" no hace nada y no avisa nada |
| **D** | celular (390 / 360 / 320) | 12 | a 320px el orden de la cartera queda fuera de pantalla |

**A — la demo rechazada.** El motivo se lee **completo y desplegado** mientras el lead está
en RECHAZADA, en tres campos separados (Qué / Dónde / Arreglo), y también en la tarjeta de
cartera. Eso está bien. Lo que está mal es todo lo que pasa después: apretar el único botón
de la pantalla lo destruye, te deposita en la fase equivocada, promete que el checklist
quedó como estaba cuando quedó vacío, y el camino de vuelta a "enviar a revisión" no está
enlazado desde ningún lado. **El trabajo anterior se conserva a medias**: ficha, veredicto,
brief y URL del borrador siguen; los 6 tildes de fase y los 10 checks del chequeo están en
cero — y de esos, los 10 del chequeo **sí estaban anunciados** ("el chequeo final se
resetea"), los 6 tildes no.

**B — el negocio que no contesta.** La cadencia está muy bien resuelta y **el sistema no te
deja insistir de más**: al tercer toque el botón desaparece. La espera dice de quién es el
turno y promete traértelo, y lo cumple. Lo que falla es la postergación: se guarda un día
antes, no acusa recibo (y por eso se duplicó), consume el cupo de DMs sin mandar ninguno, y
la fecha elegida no se ve en ningún lado fuera de m5.

**C — nombres accesibles.** El resultado es mejor de lo esperado: **un solo control sin
nombre en toda la corrida** (la nota privada de la tarjeta). Los otros once baches no son de
nombre faltante sino de **estado no expuesto** o **mensaje mal atado**. Descartó once falsos
positivos, y dos de ellos corrigen cosas escritas antes — ver abajo.

**D — celular.** **Cero desbordes horizontales de documento en las 14 pantallas a 390px.**
El layout de 390 aguanta. Lo que falla es el tamaño de los blancos táctiles, el contraste, y
**todo lo que hay por debajo de 360px**. La escala de la ruptura del control de orden de la
cartera es nítida: 390 entra con 30px de aire · 360 queda a 0px del borde · 320 sale 40px
fuera y no hay forma de alcanzarlo.

### Falsos positivos descartados — y dos correcciones

Se refutaron antes de escribirlos, y se listan para que nadie los re-reporte:

1. **"La barra lateral está fuera de pantalla en el detalle del lead"** (padre) — era la
   transición CSS congelada en el frame 0 por el panel que no compone. Con la página
   asentada está en x=0.
2. **"Dos botones de la nav sin nombre accesible"** (padre) — el volcado no los mostraba;
   el DOM tiene `<span>Cartera</span>`. Nombrados.
3. **"El select de m1 no tiene nombre"** (padre) — el control visible tiene
   `aria-label="Quién maneja el Instagram"`. El `<select>` nativo detrás está correctamente
   oculto del árbol.
4. **"La app se queda para siempre en los skeletons"** y **"el menú no abre"** (D) — buffer
   de reveal de React 19 sin `requestAnimationFrame`. Artefacto del instrumento.
5. **"El formulario de m16 aparece 189px debajo del horario"** (D) — medido con la sección
   scrolleada a tope, los 649px entran enteros en el viewport.
6. **"El detalle de revisión del admin no tiene un Aprobar funcional"** (padre) — **retirado**.
   Mismo artefacto del punto 4: el contenido nunca se reveló, así que los handlers no se
   montaron.

**Dos correcciones a cosas escritas antes de esta corrida:**

- **Los cuatro botones de resultado de `m5` SÍ tienen `aria-pressed`.** El agente padre
  afirmó lo contrario a mitad de la corrida; C lo verificó en el `outerHTML` de los cuatro y
  clickeando dos: pasan a `"true"` con los otros tres en `false`. **La selección se anuncia.**
- **El checkbox de `m16` SÍ tiene nombre accesible.** El cierre de M1 en la bitácora y el
  hallazgo **H-13** registran que queda sin nombre por no tener `id`, `name` ni `aria-label`.
  Está **envuelto en un `<label>` con texto** ("Estoy hablando con el dueño / quien decide…"),
  y el label envolvente da nombre. Verificado de forma independiente por el padre y por C.
  **Ese punto de H-13 conviene corregirlo** — el resto del hallazgo (tres controles distintos
  para la misma idea) sigue en pie.

---

## 8 · La pregunta de fondo

> ¿Podría alguien que nunca vio esta herramienta recorrerla entera guiándose solo por lo que
> dice?

**No.** Y el punto de frenada es identificable porque me pasó a mí.

**Se habría frenado en `m2`, el segundo paso de su primer negocio**, en "Evaluador · Link
pendiente". Tiene el bloque copiado, la pantalla le dice "pegalo en el Evaluador", y el
Evaluador no existe como lugar al que ir. La salida está escrita pero plegada bajo un título
que no la promete.

Ese es un bache de **configuración**: Franco carga las URLs y desaparece. Si se resuelve, hay
un **segundo** punto de frenada, y ese sí es de producto:

**`m13`, el borrador.** Carga la URL de Netlify, aprieta "Guardar borrador", y recibe
**`Invalid literal value, expected true`** colgado del campo URL. Nada en esa frase dice que
falta activar un interruptor tres renglones más abajo. Hubo que abrir el DOM para
descubrirlo.

Y hay un **tercero**, para quien reciba un rechazo: aprieta el único botón de la pantalla de
reentrada y pierde el motivo del rechazo, sin forma de recuperarlo.

Todo lo que está **entre** esos puntos —la ficha con su gate en vivo, la cadencia escrita
entera, el chequeo con sus dos grupos rotulados, las esperas que dicen de quién es el turno—
**sí se recorre solo**. El recorrido está mucho mejor contado de lo que está destrabado.

---

## 9 · Qué hacer con esto

### Se arregla antes de que alguien la use

Los que bloquean a quien trabaja solo. En orden de daño:

1. **B-A1** — que el motivo del rechazo sobreviva a "Reabrir construcción". Hoy se destruye
   y no queda en ningún lado.
2. **B-P1 / B-C2** — el error de `m13` en español, colgado del interruptor que falla.
3. **B-B1** — la postergación se guarda un día antes de la fecha elegida. Es un bug de datos.
4. **B-C7** — "Pausar en tu cartera" no hace nada.
5. **B-A4** — enlazar el chequeo final desde las tres pantallas que lo nombran.
6. **B-A8** — que un rechazo se anuncie en el panel.
7. **B-B5** — la fecha de postergación en la ficha y en la tarjeta.
8. **B-D3** — `shrink-0` y fila tappeable en los seis obligatorios del chequeo.
9. **B-D9** — `flex-wrap` + `min-w-0` en los filtros de la cartera por debajo de 400px.
10. **B-C1** — nombre para el textarea de la nota privada.
11. **B-B8** — la aclaración de "pedíselo a Franco" también en `m5`.
12. **B-A6** — que `m13` congelada diga qué hay que hacer antes para poder tocarla.
13. **B-B7** — una sola palabra para pausar/postergar, y que el filtro la contenga.
14. **B-B3** — que el contador de DMs cuente mensajes, no registros.
15. **B-A5** — nombrar "Reabrir construcción" como se llama y decir dónde está.
16. **B-C6** — `role=group` con nombre para "Ojo de diseño".

Y, transversal a casi todos: **el Patrón 1**. Un acuse de recibo estándar en el lugar del
clic para toda acción que escribe cierra de un saque B-B2, B-P3 y buena parte de H-03, H-11
y H-12. El producto ya tiene el patrón implementado en "Fijar arriba" — es replicarlo.

### Espera al uso real

Pueden ser teóricos; una persona usándola los confirma o los descarta en una semana:

- **B-P2** — los bucles del puntero (`m3`↔`m2`, `m5`↔`espera`). A mí me hicieron dudar
  fuerte, pero no me frenaron: puede ser que con dos días de uso se ignore el cartel.
- **B-P5** — el foco fijado en un negocio que no estás trabajando.
- **B-B4 / B-B10** — "Tu paso ahora" en leads que no tienen ningún paso.
- **B-B6** — vencido vs futuro indistinguibles (la lógica funciona; falta poder verificarla).
- **B-D4** — la munición al 20% en celular. Depende de si el setter trabaja en celular o no.
- **B-D6** — nombres truncados: depende de cuántos leads comparten prefijo en producción.
- **B-D8 / B-D10 / B-D5 / B-D7 / B-D12** — zoom de iOS, contraste, blancos táctiles chicos.
  Todos medidos y ciertos; cuánto molestan depende del uso real en celular.
- **B-C3 / B-C4 / B-C5 / B-C8 / B-C9 / B-C10 / B-C11 / B-C12** — estado no expuesto en
  selects, radiogroup, chips de fase, botón deshabilitado, grupo de m5, diálogo de atajos y
  "Copiar bloque". Ninguno frena a alguien que ve la pantalla; todos frenan a quien no.
- **B-P6 / B-P7 / B-P8 / B-B9 / B-B11 / B-A9 / B-A10** — números sin explicar, dos botones
  sin desempatar, esperas sin plazo, novedades sin techo.

### Es de Franco, no de código

- **Las cuatro URLs de herramientas** (Evaluador, Gem de diseño, Claude Design, Gem de
  outreach). Es H-01, es el techo real del recorrido, **24 choques en esta corrida**, y se
  resuelve cargando cuatro campos. Con esto solo, el primer punto de frenada desaparece.
- **`calComUsername` y `calComEmbedUrl`** en la organización develOP, para que el último paso
  se pueda ejecutar (H-16, H-17).
- **El ruido de la base de desarrollo**: 76 novedades de las cuales 12 visibles y todas
  iguales, demos esperando hace 60 días, leads `SMOKE-SETTER` y `QA-W` mezclados con los
  reales. No es un bache del panel, pero **distorsiona cualquier lectura del panel de inicio**.
- **Re-seedear el fixture `QA-W Rechazada`**: el barrido A lo consumió (ver abajo). Hoy no
  reproduce la pantalla de reentrada.

---

## Lo que esta corrida movió, y lo que no disparó

### Ninguna acción hacia afuera fue disparada

- **`m16` · "Confirmar y agendar"** — documentado el formulario completo (nombre del
  prospecto, email del prospecto, notas de traspaso obligatorias) **sin apretarlo**. La
  pantalla avisa sola: *"el evento se crea en el calendario real de Franco y Cal.com le manda
  la confirmación al prospecto"*. Los cuatro recorridos lo respetaron.
- **`m16` · "Buscar de nuevo"** — tampoco. Reemplazaría los horarios que el prospecto ya
  tiene en la mano.
- **"Me trabé — avisar a Franco"** — declarado como acción que sale hacia Franco, no disparado.
- **"Enviar a revisión" sí se apretó**, una vez, sobre el negocio sembrado. La propia app
  declara que es cola interna: *"Franco la ve en su cola"*. No manda correo.
- Ningún link externo abierto.

### Escrituras en la base (todas en la Neon de desarrollo)

| Lead | Qué se movió | Quién |
|---|---|---|
| `cmsoscikq…` **Gimnasio Nova Fit** (sembrado para la corrida) | recorrido completo: ficha, evaluación, opener, respuesta, brief, construcción arrancada + 6 fases, borrador, chequeo 6/6 + 1 marca de diseño, enviado a revisión. Quedó en `EN_REVISION` | padre |
| `cmr035f8m…` **QA-W Rechazada** | "Reabrir construcción" (`RECHAZADA → CONSTRUCCION`) + las 6 fases tildadas. **El fixture ya no reproduce la pantalla de reentrada** | A |
| `cmr035eba…` **QA-W Evaluada Gate Cerrado** | opener + 3 toques + 2 postergaciones (la segunda, duplicada por B-B2). Quedó `POSTERGADO` | B |
| `cmr035efw…`, `cmsndn*` (galería M0-GAL) | fijar/desfijar un lead, un horario elegido y un checkbox tildado en m16 — **ambos revertidos** | C, D |

Los fixtures `QA-W Postergado Vencido` y `QA-W Postergado Futuro` quedaron intactos
(solo lectura).

### El diff

Cero código, cero tests, cero configuración. El único archivo nuevo bajo control de
versiones es este reporte. El worktree de la corrida y los scripts de navegación vivieron
fuera del repo y se limpian al terminar.

---

*(Cerrado el 11 de agosto de 2026, 13:00.)*

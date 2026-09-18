# `mc2` — LOS CINCO PROMPTS DE REFINAMIENTO
### Corrida secuencial en Claude Design, después de la construcción
**Borrador para que Franco corrija · agosto 2026**

> **Qué es esto.** Cinco prompts que el setter pega **en orden, uno tras otro, sin esperar a evaluar nada**. Es una corrida automática: sube el piso de calidad antes de que el ojo humano entre a mirar.
>
> **Dónde NO va el criterio.** El setter no juzga acá. Detecta y corrige con su ojo en el chequeo final. Acá solo ejecuta, para que después tenga menos cosas que arreglar.
>
> **El orden importa y tiene fundamento en cada salto.** No se reordena sin razón.

---

## El orden, y por qué

| # | Prompt | Por qué va acá |
|---|---|---|
| **1** | **Copy** | Cambia el largo de los textos, y el largo cambia el layout. Pulir el layout antes sería pulir algo que se va a mover |
| **2** | **Estética y jerarquía** | Responde al contenido definitivo. Es el prompt con más libertad creativa |
| **3** | **Motion y estados** | Se anima un layout que ya no se mueve |
| **4** | **Mobile** | Va tarde porque es donde el prospecto la abre: **es lo último que se toca y lo que queda fresco** |
| **5** | **Verificación** | Después de mobile, porque el ajuste responsive es lo más probable que rompa algo |

**Un tilde por prompt: cinco fases, cinco tildes.** Hoy hay tres fases y cuatro prompts, y el setter tilda "Calidad y motion" habiendo aplicado uno solo.

---

## Prompt 1 · El texto

```
REFINAMIENTO 1 DE 5 — EL TEXTO

Esta demo la vas a mostrar a un dueño de negocio local argentino que no
la pidió. Los textos que escribiste están correctos pero probablemente
suenen a especificación, no a este negocio hablando.

Reescribí el texto de toda la página, sin cambiar el contenido ni las
secciones:

- Que suene como habla el negocio, no como habla una agencia. Si en su
  Instagram tutea y es cercano, la página tutea y es cercana. Si es
  formal, es formal.
- El título principal dice qué gana el visitante, no qué es el negocio.
  "Turnos sin esperar" le gana a "Bienvenidos a nuestra peluquería".
- Sacá todo lo que le serviría igual a cualquier otro negocio del rubro.
  Frases como "calidad y compromiso", "años de experiencia", "atención
  personalizada": si no dicen nada específico, no van.
- Usá los datos reales que están en el documento: nombres, servicios,
  precios si están, frases de las reseñas. Si una reseña dice algo bueno
  del negocio, esa frase vale más que cualquier cosa que escribas vos.
- Español rioplatense, voseo. Frases cortas. Nada de "tú".
- El botón principal mantiene el texto exacto que dice el documento. Ese
  no se toca.

NO hagas: no agregues secciones, no saques secciones, no cambies el
orden, no toques el diseño todavía.

Prohibido inventar: si no tenés un dato, no lo pongas. Un precio o un
horario inventado es lo primero que el dueño detecta.

Cuando termines, decime en dos líneas qué cambiaste y por qué.
```

---

## Prompt 2 · La estética

```
REFINAMIENTO 2 DE 5 — LA ESTÉTICA

Ahora subí el nivel visual de esta página. Con los textos ya definitivos,
acomodá el diseño.

Acá quiero tu criterio, no solo obediencia: mirá la página como diseñador
y elevala. Tenés libertad para proponer, siempre que respetes el piso de
calidad del documento y la paleta y la tipografía que ya están definidas.

Lo que tiene que quedar resuelto:

JERARQUÍA
En cada sección manda una sola cosa. El título del inicio es lo más
grande y fuerte de la página. El botón principal resalta del resto.
Lo secundario baja de peso y de tamaño.
Prueba: si mirás la página entrecerrando los ojos, tiene que entenderse
qué es lo importante de cada sección. Si todo se vuelve una masa pareja,
falta jerarquía.

AIRE
Más espacio del que te parece necesario. Entre secciones, alrededor de
los títulos, en los márgenes laterales. Nada pegado al borde. Ante la
duda entre más contenido y más aire, va el aire.

RITMO
Que las secciones no sean todas iguales. Alterná: una a ancho completo,
otra con dos columnas, otra centrada y angosta. Un bloque destacado que
rompa la monotonía. Que el ojo tenga dónde apoyarse mientras baja.

TIPOGRAFÍA
Diferencia evidente entre título, subtítulo y cuerpo. Líneas de texto
que no crucen toda la pantalla. Espacio entre renglones cómodo.

COLOR
El acento se reserva para el botón principal y para nada más. Si todo
lleva color, nada resalta. Contraste real entre texto y fondo.

DETALLE
Alineá todo a una grilla. Márgenes iguales entre secciones. Todos los
botones idénticos entre sí. El mismo radio de esquinas en toda la página.

NO hagas: no cambies los textos, no agregues ni saques secciones, no
cambies la paleta ni las tipografías definidas, no pongas efecto vidrio
o blur en la barra de navegación, no repartas sombras sin criterio.

Cuando termines, decime en dos líneas qué elevaste.
```

---

## Prompt 3 · Motion y estados

```
REFINAMIENTO 3 DE 5 — MOTION Y ESTADOS

Sumá movimiento e interactividad a esta página. El objetivo es que se
sienta viva y cuidada, no que llame la atención sobre sí misma.

ENTRADAS
Que los bloques aparezcan al hacer scroll, con transiciones suaves y
cortas. Nada que tarde, nada que rebote, nada que maree. Un desplazamiento
mínimo y una aparición gradual alcanzan.

ESTADOS
Que se note que los elementos responden. Los botones cambian al pasar el
mouse y al tocarlos. Los links se distinguen. Todo lo que se puede tocar
se ve tocable, también con el teclado.

MENÚ
Los links del menú llevan suavemente a su sección de esta misma página.
Ninguno lleva a otro lado.

REGLAS TÉCNICAS
Animá solo desplazamiento y transparencia, nunca el tamaño ni la posición
de los bloques: eso corta y se ve mal en celulares lentos.
Respetá la preferencia del sistema de reducir movimiento: si el visitante
la tiene activada, las animaciones se apagan.
Nada que arranque solo y se repita en loop.

LA VARA
El movimiento tiene que aclarar el recorrido, no decorarlo. Si una
animación no ayuda a entender la página, sacala.

NO hagas: no toques los textos, no toques el layout, no agregues
carruseles ni sliders automáticos, no pongas un preloader.

Cuando termines, decime qué animaste.
```

*(El preloader queda excluido a propósito: es de la pasada de Franco en Claude Code.)*

---

## Prompt 4 · Celular

```
REFINAMIENTO 4 DE 5 — CELULAR

Este es el paso más importante de los cinco. La mayoría de los dueños
abre el link desde el teléfono, por Instagram. Si se ve mal ahí, no hay
segunda oportunidad.

Revisá y arreglá la versión de celular, ancho de 390 y también de 360.

LO PRIMERO QUE SE VE
Sin scrollear, en un celular, tienen que entrar: el título principal,
la línea que explica qué es, y el botón principal. Si el botón queda
abajo del corte, subilo. Esa primera pantalla es lo que decide si el
dueño sigue bajando.

LEGIBILIDAD
Nada cortado, nada que se desborde a los costados, ningún scroll
horizontal. Textos legibles sin agrandar: el cuerpo no baja de 16px.
Títulos que no se partan de forma rara.

TOQUE
Todo lo que se toca mide al menos 44 por 44 píxeles, con separación
entre elementos. El botón principal alcanzable con el pulgar. El menú
de celular abre y cierra bien y no tapa el contenido.

IMÁGENES
Que escalen sin estirarse ni deformarse. Que no empujen el layout
mientras cargan.

ESPACIO
El aire de escritorio suele ser demasiado en celular. Ajustá los
espaciados verticales para que la página no se vuelva eterna, sin
apretar el contenido.

NO hagas: no cambies el contenido, no cambies el orden de las secciones,
no saques nada de la versión de celular. Es solo el ajuste responsive.

Cuando termines, decime qué ajustaste y si algo no entraba.
```

---

## Prompt 5 · Verificación

```
REFINAMIENTO 5 DE 5 — VERIFICACIÓN

Último paso. Revisá la página entera buscando lo que quedó roto o a
medias, y arreglalo. No agregues nada nuevo.

LINKS Y BOTONES
Probá cada link y cada botón. El botón principal tiene que llevar al
link real del documento, completo y funcionando. Si en algún lado quedó
un link de ejemplo, un "#" o un placeholder, reemplazalo por el real.
Si no tenés el link real de algo, decímelo en vez de inventarlo.

TEXTO
Buscá en toda la página cualquier texto de relleno, cualquier "lorem
ipsum", cualquier frase de ejemplo que haya sobrevivido. No debería
quedar ninguna.

IMÁGENES
Ninguna deformada, estirada ni pixelada. Ninguna rota. Todas con texto
alternativo que describa lo que muestran.

CONSISTENCIA
Los botones iguales entre sí. Los espaciados entre secciones parejos.
La misma tipografía en toda la página. Nada desalineado.

ERRORES
Revisá que no queden errores en la consola del navegador y que la página
cargue sin fallas.

QUE NADA SE HAYA ROTO
El ajuste de celular pudo haber afectado alguna animación o algún
espaciado del escritorio. Revisá que las dos versiones sigan bien.

Cuando termines, dame una lista corta de:
  - Qué arreglaste.
  - Qué encontraste que NO pudiste arreglar y por qué.
  - Qué datos te faltan y tengo que conseguir yo.
```

**La última pregunta del prompt 5 es la más valiosa de las cinco:** es lo único del recorrido que le hace decir al modelo qué le faltó, en vez de esperar a que el setter lo descubra mirando.

---

## Lo que cambia en la pantalla

**El bloque de arriba deja de ser copiable.** Hoy `mc2` ofrece el mismo `BRIEF DE DEMO` con "Copiar bloque" que `mc1`. Pero el setter está en la misma conversación de Claude Design, que ya lo tiene: ofrecerlo de nuevo invita a empezar de cero. Pasa a ser **una referencia plegada de solo lectura** —*"Lo que la demo tenía que entregar"*— con una salida explícita: *"¿Perdiste el chat de Claude Design? Volvé a Construir."*

**Cinco fases y cinco tildes**, uno por prompt.

**Se va el badge "GUÍA PRELIMINAR — EN VALIDACIÓN".** Le dice al setter que desconfíe de las instrucciones que le estás dando.

**Se va la explicación duplicada del auto-reporte**, que hoy aparece dos veces en la misma pantalla.

**Y una línea nueva arriba de los cinco:** *"Estos cinco van seguidos, sin evaluar nada en el medio. Tu ojo entra después, en el chequeo final."* Es lo que evita que el setter se ponga a juzgar acá y pierda tiempo.

---

## Costo y modelo — a definir con datos

Cinco corridas por demo, más la construcción. **Es la parte más cara del pipeline y hoy no está medida.**

La hipótesis del brief v3 —*"el primero puede ir en Opus; los siguientes en Sonnet con esfuerzo alto"*— sigue siendo razonable por criterio: **la construcción inventa la página entera; el refinamiento aplica instrucciones concretas sobre algo que ya existe.** Inventar pide más capacidad que ejecutar.

**Pero no sé qué opciones de modelo ofrece Claude Design y no las voy a inventar.** Es lo primero que conviene mirar cuando corras la demo de prueba, junto con S-01.

Y un tope práctico: **cinco es el techo.** Cada prompt más es tiempo del setter y costo por demo, y a partir de cierto punto el modelo empieza a deshacer lo que hizo antes.

---

## Supuestos que suma esta pantalla

- **S-25** · Que Claude Design aplique cinco prompts seguidos sin degradar lo anterior.
- **S-26** · Que el ajuste de celular no rompa el motion aplicado antes. *(El prompt 5 existe en parte para cazar esto.)*
- **S-27** · Que el prompt de estética con libertad creativa mejore y no empeore. **Es el de mayor varianza de los cinco.**
- **S-28** · Que cinco corridas entren en el presupuesto de tiempo y de costo por demo.
- **S-29** · Qué modelos ofrece Claude Design y cuál conviene en cada prompt.

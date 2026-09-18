# EL GEM DE DISEÑO — paquete completo
### Base de conocimiento · inicialización · cuatro prompts · piso anti-slop
**Borrador para que Franco corrija · agosto 2026**

> **Qué es.** Todo lo que el Gem de diseño necesita para existir, más lo que el producto inyecta. Es la pieza que decide si una demo sale bespoke o sale slop.
>
> **Cómo se lee.** Los textos entre líneas son **para copiar tal cual**. Lo de afuera es la explicación de por qué está así.
>
> **Estado:** ninguno de estos textos se probó nunca contra un negocio real. Son hipótesis redactadas, no procedimiento validado.

---

## 0 · El diseño del ciclo, y por qué es así

**Cuatro vueltas, cada una con un trabajo cognitivo distinto:**

| Fase | Qué hace | Por qué va separada |
|---|---|---|
| **1 · Estética** | Lee el mundo visual del negocio desde las imágenes | Es percepción. Si el Gem lee mal el negocio, todo lo que sigue está torcido — y corregirlo acá cuesta treinta segundos |
| **2 · Decisiones** | Ángulo wow, secciones, CTA, tono, paleta, tipografía | Es estrategia. Sale corto y leíble, y **acá va el chequeo de genérico** antes de que se expanda |
| **3 · Especificación** | El documento de construcción para Claude Design | Es redacción densa. Nadie verifica bien dos mil palabras: por eso lo que importa ya se aprobó en la fase 2 |
| **4 · Gaps** | Adversarial: qué quedó sin definir | **Lo que la spec no dice, el modelo lo llena con su default.** Es el paso que más protege contra el slop |

**Tres reglas de diseño del ciclo:**

1. **El setter pega de vuelta la fase aprobada.** No por necesidad técnica —el Gem recuerda— sino porque **para pegarla tiene que haberla leído**, y si corrigió algo la corrección viaja. Gate de calidad disfrazado de paso mecánico.
2. **La fase 1 tiene tope de largo.** Si no se lee en treinta segundos, el setter no la verifica y el paso deja de servir.
3. **El Gem para al final de cada fase.** Va como regla dura en la inicialización, porque librado a su criterio hace las cuatro de una.

---

## 1 · Base de conocimiento del Gem

Lo que se carga una vez y no cambia por negocio:

| Documento | Para qué |
|---|---|
| **Ojo de diseño para no diseñadores** (módulo N2, entero) | Es la vara. El Gem tiene que juzgar con los mismos criterios con los que juzga Franco |
| **El piso anti-slop** (§6 de este documento) | Para que lo respete al especificar, aunque el producto lo inyecte igual |
| **Comportamiento por rubro** (módulo N2) | Contexto de qué espera un cliente de cada rubro |
| **Cómo piensa el dueño** (módulo N2) | Para que el copy le hable al decisor, no al visitante genérico |
| **Fricción de Prestigio** (Onboarding §6) | El principio del CTA |
| **Qué es una demo develOP** (§2 de este documento) | El encuadre: qué es, qué no es, para qué existe |

---

## 2 · Qué es una demo develOP — el encuadre para el Gem

```
QUÉ ES UNA DEMO DEVELOP

Una demo es una página de una sola pantalla (one-page) que le mostramos
a un negocio local argentino que todavía no es cliente, para que vea cómo
podría verse su negocio online.

Se construye ANTES de hablarle. El dueño la abre desde el celular, por
Instagram, sin habernos pedido nada. Tiene que verse tan bien que su
primera reacción sea "¿quién hizo esto?".

QUÉ NO ES

No es el sitio final. Es la puerta de entrada a una conversación de venta.
Le faltan cosas a propósito: no tiene todas las secciones, no tiene sistema
de reservas, no tiene blog. Eso está bien.

Lo que NO le puede faltar es calidad. Una demo fea no es neutra: resta.
Le confirma al dueño que lo digital "no es para él" y se cierra.

LA VARA

La demo tiene que verse como si alguien se hubiera sentado a pensarla para
ESE negocio. Si el mismo diseño le serviría igual a cualquier otro del
rubro, no está terminada.

EL FORMATO

Una sola página, con menú que scrollea a las secciones de esa misma página.
El menú funciona; nunca lleva a páginas que no existen.
Mobile-first: la mayoría la abre del celular.
```

---

## 3 · Prompt de inicialización del Gem

Va como instrucción permanente del Gem, no como mensaje del setter.

```
Sos el asistente de diseño de develOP. Tu trabajo es convertir la
observación de un negocio local argentino en un documento de construcción
para que un agente de IA (Claude Design) arme una demo web de una página.

Trabajás con un setter: una persona no técnica, capacitada en criterio
comercial y ojo de diseño, que no diseña ni programa. Tu salida tiene que
ser usable por él sin traducción.

CÓMO TRABAJÁS — cuatro fases, una por vez

  Fase 1 — Lectura estética del negocio
  Fase 2 — Decisiones de la demo
  Fase 3 — Documento de construcción
  Fase 4 — Caza de huecos

REGLA DURA, LA MÁS IMPORTANTE DE TODAS

Al terminar cada fase PARÁS y esperás. No adelantás la fase siguiente,
no la resumís, no la anticipás "por si sirve". Terminás tu entrega y
cerrás con una línea que diga qué fase terminaste y que estás esperando.

Si el setter te pide algo que corresponde a una fase posterior, se lo
decís y no lo hacés.

PROHIBIDO INVENTAR

No completás datos que no te dieron. Ni nombres, ni precios, ni horarios,
ni reseñas, ni servicios. Si falta algo que necesitás, lo declarás así:

  FALTA: [qué falta] — [por qué lo necesitás] — [dónde lo consigue el setter]

Una demo con un dato inventado es peor que una demo incompleta: el dueño
lo detecta al instante y pierde la confianza.

CÓMO ESCRIBÍS

Español rioplatense, voseo. Frases cortas. Cero jerga de diseño sin
explicar. Si usás una palabra técnica, la aclarás entre paréntesis la
primera vez.

Nunca decís que algo "quedó espectacular" ni te felicitás. Si algo del
material que te dieron es flojo, lo decís.

LO QUE NUNCA PROPONÉS

- Más de una página.
- Un menú que lleve a páginas inexistentes.
- Formularios de contacto que necesiten servidor. El contacto va por
  WhatsApp, teléfono o el link real que tenga el negocio.
- Reservas, pagos, login, carrito.
- Texto de relleno de ningún tipo.
```

---

## 4 · Los cuatro prompts

### P1 · Lectura estética

**El setter pega esto junto con las imágenes y el bloque de la ficha.**

```
FASE 1 — LECTURA ESTÉTICA

Te paso el material visual de un negocio y su ficha de observación.

Quiero que me digas cómo se ve ESTE negocio hoy, no cómo debería verse.
Miralo como si fueras un cliente que lo encuentra por primera vez.

Devolveme, en no más de 15 líneas:

  MUNDO VISUAL      Qué colores usa de verdad (nombralos, y el hex si lo
                    podés estimar del logo o las fotos). Qué tipo de
                    imágenes tiene. Qué sensación transmite hoy.

  NIVEL             ¿Se ve prolijo o improvisado? ¿Cuidado o descuidado?
                    ¿Formal o de barrio? Sé específico, no diplomático.

  ENERGÍA           ¿Cómo se siente el negocio? Tranquilo, activo,
                    familiar, técnico, premium, popular.

  CÓMO HABLA        Tuteo o usted. Formal o cercano. Con emojis o sin.
                    Largo o cortito. Citá una frase real de ejemplo.

  QUÉ LE QUEDA BIEN Una dirección estética concreta para la demo, que
                    salga de lo anterior y no de una plantilla de rubro.

  QUÉ NO            Qué dirección estética sería un error para ESTE
                    negocio, y por qué.

Regla: si tu lectura le serviría igual a cualquier otro negocio del mismo
rubro, no la mandes — volvé a mirar el material y buscá lo que lo hace
distinto.

Si el material no alcanza para leer la estética, decilo con el formato
FALTA y no inventes.

Terminá y esperá. No pases a la fase 2.
```

**Por qué el tope de 15 líneas:** para que el setter la lea de verdad. Una lectura de tres párrafos se acepta sin mirar, y este es el paso que evita que todas las demos salgan iguales.

---

### P2 · Decisiones

```
FASE 2 — DECISIONES DE LA DEMO

Esta es la lectura estética, ya revisada por mí:

[PEGAR LA FASE 1 APROBADA — con tus correcciones si hiciste alguna]

Con eso más la ficha y la evaluación, decidí la demo. Devolveme:

  ÁNGULO WOW        Qué le mostramos para que piense "esto es exactamente
                    lo que necesito". Una o dos oraciones. Tiene que salir
                    de un dolor concreto de la ficha o de las reseñas, no
                    de una idea general del rubro.

  SECCIONES         Una por línea, en el orden en que van. Entre cuatro y
                    seis. Cada una con una línea de qué va adentro.

  CTA               El texto exacto del botón principal. Fricción de
                    Prestigio: "Reservá tu lugar", "Pedí tu turno",
                    "Solicitá tu presupuesto". Nunca "Contactanos" ni
                    "Más información".
                    Y decime a dónde lleva (WhatsApp, teléfono, el link real).

  TONO              Cómo escribe la demo, en una línea, coherente con
                    cómo habla el negocio.

  PALETA            Un neutro dominante, un acento, y a lo sumo un apoyo.
                    Con los hex. El acento se reserva para el botón.
                    Que salgan de los colores reales del negocio.

  TIPOGRAFÍA        Una para títulos, con carácter, nombre concreto de
                    Google Fonts. Una para cuerpo, legible y neutra.
                    Y una línea de por qué esas y no otras, atada a la
                    lectura de la fase 1.

Antes de mandar, chequeate: ¿esto menciona el negocio real y sus dolores
concretos, o serviría para cualquiera del rubro? Si es lo segundo, no
está listo.

Terminá y esperá. No pases a la fase 3.
```

**Por qué acá está el chequeo de genérico:** es lo que hoy hace `m6` al final, movido al lugar donde es barato — sobre seis campos, no sobre un documento entero.

---

### P3 · Documento de construcción

```
FASE 3 — DOCUMENTO DE CONSTRUCCIÓN

Estas son las decisiones, ya revisadas por mí:

[PEGAR LA FASE 2 APROBADA — con tus correcciones si hiciste alguna]

Armá el documento que le voy a pegar a Claude Design como primer y único
mensaje. Tiene que alcanzar para que construya la demo entera sin
preguntarme nada.

Empezá con este encabezado exacto, en este orden y con estas etiquetas:

  ANGULO: [una línea]
  SECCIONES: [separadas por · en orden]
  CTA: [texto exacto del botón]
  TONO: [una línea]
  PALETA: [neutro / acento / apoyo, con hex]
  TIPOGRAFIA: [títulos / cuerpo]

Y después, en texto libre y todo lo detallado que haga falta:

  EL NEGOCIO        Nombre, rubro, zona, a quién le vende, qué lo hace
                    distinto. Con los datos REALES de la ficha.

  CONTACTO REAL     El link exacto al que lleva el botón. Si es WhatsApp,
                    el wa.me completo con el número real y el mensaje
                    pre-cargado. Si no tenés el número, va como FALTA.
                    Nunca un placeholder, nunca un número de ejemplo.

  LO PRIMERO QUE SE VE   Qué entra en la primera pantalla de un celular,
                    sin scrollear: qué dice el título, qué dice la línea
                    de abajo, y que el botón esté ahí. Es la decisión más
                    importante de la página: si eso no convence, no hay
                    scroll.

  SECCIÓN POR SECCIÓN   Para cada una: qué muestra, qué texto va (escribilo
                    vos, no describas que "va un texto"), qué imagen va y
                    de dónde sale, y qué tiene que sentir el visitante.
                    Los textos que escribas usan los datos reales: nombres,
                    precios si los hay, frases de las reseñas.

  DIRECCIÓN VISUAL  Cómo se aplica la paleta y la tipografía. Dónde va el
                    acento y dónde no. Cuánto aire entre secciones.
                    Qué manda en cada sección.

  LO QUE NO VA      Lo que Claude Design pondría por default y en este
                    negocio sería un error. Sé concreto: si el default
                    sería una foto de stock genérica del rubro, decilo y
                    decí qué va en su lugar.

  LO QUE SE DEJA AFUERA A PROPÓSITO
                    Qué NO lleva esta demo y por qué. Es una demo, no el
                    sitio final: dejar cosas afuera es una decisión, no un
                    olvido. Sirve para que después nadie las "arregle".

Regla sobre las imágenes: no describas imágenes genéricas. Si el negocio
tiene fotos reales, indicá cuál va en cada lugar. Si no las tiene, decilo
con el formato FALTA en vez de proponer stock.

Largo: apuntá a entre 800 y 1.200 palabras. Más corto no alcanza para que
construya sin preguntar; mucho más largo hace que se pierdan instrucciones
en el medio.

Esto es un BORRADOR. El documento definitivo sale de la fase 4.

Terminá y esperá. No pases a la fase 4.
```

**Por qué el encabezado con etiquetas fijas:** el producto lo lee para mostrar *"El brief pedía: Hero · Qué ofrecen…"* en `m13` y `m14`. **El setter pega una sola cosa y el producto extrae lo que necesita — cero transcripción manual.**

---

### P4 · Caza de huecos

```
FASE 4 — CAZA DE HUECOS

Leé el documento que acabás de escribir como si fueras Claude Design y
tuvieras que construir con eso y nada más.

Buscá todo lo que quedó sin definir y que vas a tener que resolver por
tu cuenta. Para cada hueco:

  HUECO       Qué no está dicho.
  DEFAULT     Qué harías vos si nadie te lo aclara.
  RIESGO      Por qué ese default sería un problema para ESTE negocio.
  ARREGLO     La línea exacta que hay que agregar al documento.

Buscá especialmente en: qué pasa cuando no hay una foto para un lugar;
qué dice el pie de página; qué pasa al tocar el menú; qué información va
en el hero además del título; qué pasa si un texto queda muy largo en
celular; qué hace un botón secundario si lo hubiera; y sobre todo, si el
link del botón principal es real y completo o quedó a medias.

Sé duro. Un hueco que no encontrás acá lo va a llenar Claude Design con
lo primero que se le ocurra, y eso es exactamente lo que hace que una
demo se note salida de un prompt.

Al final, devolveme el DOCUMENTO DEFINITIVO completo, con los arreglos ya
incorporados. **Ese es el único que se usa** — el borrador de la fase 3 se
descarta.
```

**Por qué esta fase existe:** en este mismo proyecto, una pasada adversarial sobre un triage cambió cuatro dictámenes de veintidós. **Lo que la especificación no dice, el modelo lo inventa** — y ese es el mecanismo del slop, no un descuido.

---

## 5 · Qué junta el setter antes de empezar

El producto se lo tiene que decir con esta precisión, no como "juntá material":

```
ANTES DE ABRIR EL GEM, TENÉ A MANO:

  1. El bloque de la ficha (lo copiás de acá abajo).
  2. Tres a cinco capturas del Instagram del negocio: el perfil completo
     y las publicaciones que mejor se vean.
  3. El logo, si tiene. Si no tiene, decilo.
  4. Dos o tres fotos del local o del producto, las mejores que
     encuentres.
  5. Si tiene web, una captura de cómo se ve hoy.

Las imágenes las arrastrás al chat del Gem, junto con el primer mensaje.
Sin imágenes, el Gem va a inventar una estética de rubro y la demo va a
salir igual a cualquier otra.
```

**Esto resuelve la tensión de la subida de archivos: el setter arrastra al chat del Gem, no a LeadOS. Cero infraestructura nueva.**

---

## 6 · El piso anti-slop — lo inyecta el producto

Va **al final del documento de construcción**, agregado por el producto, no por el Gem. Es idéntico en cada demo y nadie lo puede saltear.

**Sale del módulo de Ojo de diseño, traducido de material de lectura a instrucción de agente.** Si el módulo cambia, esto cambia con él.

**Y el producto agrega una línea arriba de todo**, antes del encabezado etiquetado, porque un agente pesa más lo que lee primero:

```
Antes de construir: al final de este documento hay un PISO DE CALIDAD
no negociable. Leelo entero antes de escribir una línea de código.
Si algo de arriba lo contradice, gana el piso.
```

Y el bloque completo, al final:

```
─────────────────────────────────────────────────────────
PISO DE CALIDAD — NO NEGOCIABLE
Esto aplica siempre, aunque no se mencione arriba.
─────────────────────────────────────────────────────────

IDIOMA
Todo el texto en español rioplatense, con voseo. Es un negocio argentino
y su cliente también. Nada de "tú", nada de español neutro.

JERARQUÍA
En cada sección manda UNA sola cosa. El título del hero es lo más grande
y fuerte de la página. El botón principal resalta del resto. Lo secundario
es más chico y más discreto. Si tres cosas compiten, ninguna gana.
Prueba: mirando la pantalla borrosa, tiene que entenderse qué es lo
importante.

AIRE
Espacio generoso entre secciones y alrededor de cada bloque. Márgenes
laterales amplios. Nada pegado al borde. Ante la duda entre más aire y
más contenido, va más aire: es lo que más separa lo profesional de lo
amateur.

TIPOGRAFÍA
Dos fuentes, nunca más: una con carácter para títulos, una neutra y
legible para el cuerpo. NUNCA la fuente por defecto del sistema.
Diferencia de tamaño evidente entre título, subtítulo y cuerpo.
Líneas de cuerpo que no crucen toda la pantalla, con espacio entre
renglones.

COLOR
Un neutro dominante, un acento, un apoyo como techo. Tres colores máximo.
El acento se reserva para el botón principal: si todo lleva color, nada
resalta. Contraste real entre texto y fondo — nunca gris claro sobre
blanco.

ALINEACIÓN Y CONSISTENCIA
Todo alineado a una grilla, con márgenes iguales entre secciones. Todos
los botones con el mismo estilo, el mismo radio y el mismo tamaño. El
mismo espaciado entre secciones en toda la página. Lo desprolijo se nota
aunque nadie sepa explicar por qué.

IMÁGENES
Nítidas, coherentes con el rubro, y NUNCA deformadas ni estiradas.
Cuando hay fotos reales del negocio, van esas antes que cualquier otra
cosa. Prohibido el stock genérico.
Si el negocio no tiene logo, va el nombre tipografiado con la fuente de
títulos. NUNCA un logo inventado: un logo falso es lo primero que el
dueño detecta.

CONTENIDO
Todo el texto habla de ESTE negocio: su nombre, sus servicios, sus
precios si están, frases de sus reseñas. Cero texto de relleno, cero
lorem ipsum, cero frases que le servirían igual a cualquier otro.

BOTÓN PRINCIPAL
El texto invita, no ruega. "Reservá tu lugar", "Pedí tu turno",
"Solicitá tu presupuesto". Nunca "Contactanos" ni "Más información".
Visible sin scrollear, y repetido al final de la página.

MENÚ
Sólido, sin efecto vidrio ni blur. Los links llevan a secciones de esta
misma página y funcionan todos. Ninguno lleva a una página que no existe.

CELULAR
La mayoría la abre del teléfono. Nada cortado, nada desbordado, textos
legibles sin agrandar, y el botón de contacto alcanzable con el pulgar.

PROHIBIDO — los delatores
  · Efecto vidrio (blur) en la barra de navegación
  · Sombras y efectos repartidos sin criterio
  · Todo centrado y del mismo tamaño
  · Más de dos fuentes, o la fuente por defecto
  · Cuatro o más colores fuertes
  · Imágenes pixeladas, deformadas o de banco genérico
  · Muros de texto sin aire ni jerarquía
  · Animaciones que mareen o tarden
─────────────────────────────────────────────────────────
```

---

## 7 · En qué se convierte `m6`

Deja de ser un formulario de cuatro campos y pasa a ser **el acompañante de cuatro vueltas cortas**.

**Lo que se va:** "Título del brief" (venía prellenado con el nombre del lead y no aportaba nada). Los cuatro campos estructurados de transcripción manual — el encabezado etiquetado de la fase 3 los reemplaza.

**Lo que se queda:** el pegado completo, como fuente de verdad. Y el chequeo de genérico, **movido a la fase 2**, donde es barato.

**Lo que aparece:**
- **La lista de material a juntar**, antes de todo (§5).
- **Los cuatro prompts, uno por vez**, con revelado progresivo: solo el actual visible y copiable. Los anteriores colapsados, el siguiente no aparece hasta que el actual se completó. **Le da la sensación de paso a paso que Franco pide, sin agregar una sola pantalla.**
- **Un lugar para pegar la respuesta de cada fase**, porque pegarla es el gate de que la leyó.
- **El documento final**, que es lo que viaja a `mc1`.

**Y el vocabulario se unifica.** La pantalla se llama "Decidí cómo va a ser la demo" y adentro todo dice `BRIEF`, "Guardar brief", "Título del brief". El retítulo quedó a medias y esto lo cierra.

---

## 8 · Lo que este documento asume y nadie probó

Todo lo de acá es hipótesis redactada. Va al registro de supuestos:

- **S-19** · Que el Gem respete la regla de parada entre fases.
- **S-20** · Que la lectura estética salga distinta para dos negocios del mismo rubro. *(Si sale igual, el paso no sirve y todas las demos se van a parecer.)*
- **S-21** · Que el documento de la fase 3 alcance para que Claude Design construya sin preguntar.
- **S-22** · Que la fase 4 encuentre huecos reales y no invente problemas.
- **S-23** · Que las cuatro vueltas entren en el presupuesto de tiempo por demo.
- **S-24** · Que el Gem lea imágenes arrastradas y saque color y estética de ahí.

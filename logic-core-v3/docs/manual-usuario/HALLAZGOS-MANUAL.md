# HALLAZGOS — byproducto de escribir el manual (corrida M1)

**Qué es esto.** No es una auditoría de código ni una lista de bugs buscados a
propósito. Es lo que apareció solo al escribir las instrucciones honestas: cada
vez que la frase del manual salía incómoda, torcida o defensiva, quedó anotada
acá.

**Cómo leerlo.** La **severidad** está en términos del setter, no del código:

| | |
|---|---|
| **me frena** | no puedo seguir trabajando |
| **me confunde** | sigo, pero no sé si hice bien |
| **me hace ruido** | no me frena, pero la pantalla queda rara |

Cada entrada trae **la frase del manual que lo delató**: la oración que no se pudo
escribir derecha.

---

## H-01 · Cuatro de las cinco herramientas no se pueden abrir desde el panel

**Dónde.** La barra lateral, en **todas** las pantallas
([`35-home-foco.png`](galeria/png/35-home-foco.png)), y dentro de cada paso que
las usa, donde el acceso dice **«Link pendiente»**
(visto en vivo en m7, [`15-m7-estructura.png`](galeria/png/15-m7-estructura.png)).

| Herramienta | Estado | Pantallas afectadas |
|---|---|---|
| Evaluador | PENDIENTE | m2, m3 |
| Gem de diseño | PENDIENTE | m6 |
| Claude Design | PENDIENTE | m7, m8, m9, m10, m11, m12 |
| Gem de outreach | PENDIENTE | m4, m5 |
| Netlify Drop | **cargada** | m13 |

**Total: 10 de las 16 pantallas del recorrido** mandan a una herramienta que no se
puede abrir desde el panel.

**Qué lo hace fricción.** El panel te da una instrucción («copiá el bloque y
pasalo por el Gem Evaluador») y al lado te pone el acceso que no lleva a ningún
lado. Un setter que arranca de cero se traba en el **segundo paso de su primer
negocio** y no tiene forma de saber que lo que falta es un link que Franco tiene
que cargar — la pantalla no se lo dice, sólo dice «pendiente».

**Severidad. Me frena.** Es el hallazgo más importante de la corrida: el
recorrido está entero en la app y roto en las herramientas. Ya estaba registrado
en M0 y sigue igual.

**La frase que lo delató.** *«Cuando el manual te diga "pasalo por el Evaluador",
ya sabés: la herramienta la abrís por tu cuenta, no desde el panel.»* — tener que
escribir una excepción global en el índice, antes del capítulo 01, para que el
resto del manual no mienta.

---

## H-02 · «la más vieja hace hace 45 días»

**Dónde.** Home, bloque **TUS DEMOS ESPERANDO A FRANCO**
([`35-home-foco.png`](galeria/png/35-home-foco.png)).

**Qué lo hace fricción.** Dice literalmente *«10 demos esperando revisión de
Franco · la más vieja hace **hace** 45 días.»* — «hace» dos veces. No impide
nada, pero es lo primero que se le va a notar a alguien que abre el panel por
primera vez, y en una pantalla que además le está dando una mala noticia (diez
demos trabadas).

**Severidad. Me hace ruido.**

**La frase que lo delató.** Al citar el bloque textual en el capítulo 01 hubo que
decidir entre copiar el error o corregirlo en silencio. Se copió tal cual: el
manual cita lo que la pantalla dice.

---

## H-03 · «Saltar» no da señal de que lo tocaste, y tocarlo dos veces te devuelve al principio

**Dónde.** Home, recuadro **TU FOCO AHORA**, botón **Saltar**
([`35-home-foco.png`](galeria/png/35-home-foco.png)).

**Qué lo hace fricción.** Verificado en vivo: al tocar **Saltar**, el recuadro
sigue mostrando el mismo negocio durante varios segundos (a 1,5 s todavía no
cambió; a 5 s sí). No hay spinner ni ningún cambio visible mientras tanto. El
reflejo natural es volver a tocarlo — y como **Saltar** alterna entre el negocio
actual y el siguiente, el segundo toque te deja **de nuevo en el negocio del que
querías escaparte**, sin ningún aviso de que pasó algo.

**Severidad. Me confunde.** No perdés trabajo, pero te deja con la sensación de
que el botón no anda.

**La frase que lo delató.** *«Si lo tocás y el recuadro todavía muestra el mismo
negocio, esperá — no lo toques de nuevo.»* — una instrucción del manual que
existe sólo para tapar la falta de feedback de un botón.

> **Contraste útil, para no confundir el diagnóstico:** el botón **Pausar**, al
> lado, sí responde al instante — despliega «Sacarlo de tu vista hasta…» con las
> opciones. La diferencia entre los dos botones es lo que hace que **Saltar** se
> lea como roto.

---

## H-04 · Las novedades se acumulan sin techo ni resumen

**Dónde.** Home, bloque **Novedades**
([`35-home-foco.png`](galeria/png/35-home-foco.png)): campanita con `9+` y **62
novedades sin ver**, once de ellas idénticas («Te reasignaron un lead»).

**Qué lo hace fricción.** El bloque ocupa más pantalla que el foco, la cartera y
los números **juntos**. Para llegar a *TUS DEMOS ESPERANDO A FRANCO* — que sí es
información accionable — hay que pasar doce tarjetas repetidas. Y lo único que
importaba entre las 62 (*«Franco aprobó tu demo … Enviá el link ya»*) está al
final, después de once avisos de negocios que ya **no** son tuyos.

**Severidad. Me hace ruido** (roza *me confunde*: lo urgente queda enterrado bajo
lo irrelevante).

**La frase que lo delató.** *«Tocá Marcar como vistas y seguí — no se pierde
trabajo.»* — el manual tiene que enseñarte a ignorar una sección entera de la
pantalla principal.

> **Aclaración honesta:** esto es la base de datos de desarrollo, con ruido de
> pruebas viejas. En producción los números serán otros. Lo que el hallazgo
> muestra no es el número, sino que **no hay ni tope, ni agrupación de repetidos,
> ni resumen** cuando se acumulan.

---

## H-05 · La galería no tiene ninguna foto de la cartera desplegada

**Dónde.** [`galeria/INDICE.md`](galeria/INDICE.md), entrada **#36 — «home — tu
cartera / Mirás toda tu cartera, subordinada al foco»**.

**Qué lo hace fricción.** `35-home-foco.png` y `36-home-cartera.png` son **el
mismo archivo byte a byte** (mismo md5). La captura del #36 espera la sección
`Tu cartera completa` — que existe en la página aunque esté **plegada** — y
dispara la foto sin desplegarla nunca. La galería promete una vista de la cartera
que no fotografió.

**Severidad.** No afecta al setter (es una herramienta interna). Afecta a
**quien escriba documentación a partir de la galería**: el capítulo 01 tuvo que
documentar la cartera —buscador, los ocho filtros de estado, los cuatro órdenes,
los botones *Fijar arriba / Pausar en tu cartera / Agregar nota*— navegando en
vivo, porque la foto que debía mostrarla no la muestra.

**La frase que lo delató.** *«Tocala y se despliega la lista completa»* — una
afirmación que el screenshot citado no respalda, y que hubo que verificar
haciendo el clic a mano.

---

## H-06 · «Se guarda solo» al lado de un botón «Guardar ficha»

**Dónde.** m1 — la ficha
([`01-m1-ficha-vacia.png`](galeria/png/01-m1-ficha-vacia.png)), al pie del
formulario.

**Qué lo hace fricción.** El botón dice **Guardar ficha**. Justo debajo, la
leyenda dice *«Se guarda solo mientras escribís. Podés cerrar y seguir después.»*
Las dos cosas juntas dejan al setter sin saber lo único que le importa: **¿si
cierro sin tocar el botón, pierdo lo que escribí o no?** Y como este es el primer
formulario que toca en su vida dentro del panel, es exactamente el momento en que
menos margen tiene para arriesgarse.

El cartel de arriba tampoco lo desempata: dice *«guardá y pasala por el
Evaluador»* — o sea, pide guardar.

**Severidad. Me confunde.**

**La frase que lo delató.** El capítulo 02 terminó instruyendo *«7. Tocá Guardar
ficha»* sin poder explicar para qué, porque la pantalla afirma que no hace falta.
La instrucción honesta habría sido «tocalo por las dudas», que no es una
instrucción.

---

## H-07 · En la foto del descarte, el razonamiento dice lo contrario del veredicto

**Dónde.** m3 con veredicto Descartar
([`05-m3-veredicto-descartado.png`](galeria/png/05-m3-veredicto-descartado.png)).

**Qué lo hace fricción.** La pantalla muestra **SCORE 2/5 · DESCARTAR**, motivo
*«Sin presencia ni materia prima suficiente»* — y arriba, bajo **RAZONAMIENTO DEL
EVALUADOR**, el texto dice *«Negocio con presencia digital y reseñas reales —
buen fit para una demo.»* Justo lo opuesto.

**Severidad.** No afecta al setter en producción: el razonamiento lo pega él, así
que en un caso real va a ser coherente. **Afecta a la enseñanza**: es la única
foto de un descarte que existe, y es la que se usaría para mostrarle a alguien
nuevo cómo se lee un veredicto negativo. El dato viene del sembrador de la
galería, que usa el mismo razonamiento genérico para todos los estados.

**La frase que lo delató.** Al escribir «la pantalla queda de sólo lectura, con
el score, el veredicto, el razonamiento y el motivo» hubo que evitar
deliberadamente citar el razonamiento, porque citarlo hacía incomprensible el
ejemplo.

---

## H-08 · Dos numeraciones de toque distintas en la misma pantalla

**Dónde.** m5 — seguimiento
([`09-m5-toque-vencido.png`](galeria/png/09-m5-toque-vencido.png)).

**Qué lo hace fricción.** Arriba, en el contexto, dice **«Toques: 1 de 3»**. Unos
centímetros más abajo, en la munición, el bloque a copiar se llama **«Mensaje base
del toque 2 de 3»**. Las dos son correctas —una cuenta los toques *hechos*, la
otra numera el que *vas a mandar*— pero la pantalla nunca dice cuál es cuál, y
quedan a la vista al mismo tiempo.

Para alguien que arranca, la lectura natural es «¿voy por el 1 o por el 2?», y de
eso depende algo concreto: cuántos le quedan antes de que el negocio se enfríe.

**Severidad. Me confunde.**

**La frase que lo delató.** El capítulo 03 tuvo que poner los dos números en
tablas separadas y explicar el contador antes de nombrar el mensaje base, para
que el lector no los cruzara. Escribirlos en el orden en que aparecen en la
pantalla no se entendía.

---

## H-09 · Con la cadencia agotada, la opción deshabilitada se llama «toque 4»

**Dónde.** m5 con 3 de 3 toques
([`10-m5-cadencia-agotada.png`](galeria/png/10-m5-cadencia-agotada.png)), primera
opción del registro.

**Qué lo hace fricción.** Las otras tres opciones son acciones en el idioma del
setter: **Respondió**, **Postergar**, **Rechazó**. La primera, en cambio, dice
**«toque 4»** — en minúscula, sin verbo, y nombrando algo que justamente **no
existe**. Se lee como si fuera una opción disponible («mandar el toque 4») cuando
es exactamente lo contrario.

En la variante normal esa misma opción se llama *«No respondió — mandé un
toque»*, que sí es una frase.

**Severidad. Me confunde.** Es el momento más delicado de la cadencia —el setter
está decidiendo si insiste o suelta— y es donde el label es más pobre.

**La frase que lo delató.** *«donde antes decía "No respondió — mandé un toque"
ahora dice **toque 4**»* — hubo que citarlo en negrita y explicarlo con la
subfrase de al lado, porque el label solo no comunica que está bloqueado.

---

## H-10 · La tira COMPLETADAS de un negocio terminado no muestra la construcción

**Dónde.** Cualquier pantalla de un negocio que pasó la construcción; se ve
crudo en [`31-m16-ofrecidos.png`](galeria/png/31-m16-ofrecidos.png) — un negocio
que llegó hasta ofrecer horarios de reunión.

**Qué lo hace fricción.** La tira **COMPLETADAS — PODÉS VOLVER CUANDO QUIERAS**
lista *Ficha · Al Evaluador · Veredicto · Brief · Borrador · Chequeo final ·
Envío*, y **ninguna de las seis fases de construcción** — de un negocio cuya demo
evidentemente se construyó, se publicó, pasó el chequeo y se envió.

Es coherente con el diseño (la tira refleja el auto-reporte, no el recorrido), y
el panel avisa que tildar es opcional. Pero **la tira no se llama «lo que
tildaste», se llama «completadas»**, y queda al lado de pasos que sí aparecen
solos. El setter que no tildó ve un hueco donde hubo horas de trabajo.

**Severidad. Me hace ruido.** Nada se rompe; lo que se distorsiona es el rastro
de trabajo propio.

**La frase que lo delató.** Hizo falta un recuadro entero —*«Por qué la lista
COMPLETADAS a veces "miente"»*— para explicar un hueco que la pantalla no
explica. Es el caso exacto de «para explicar esto necesito tres párrafos porque la
pantalla no lo dice».

> Registrado también en M0 (punto 3 del índice de la galería). **Sigue vigente
> después de P3.1.**

---

## H-11 · El tilde de fase no se anuncia como tilde

**Dónde.** m7–m12, bloque **REGISTRO**
([`15-m7-estructura.png`](galeria/png/15-m7-estructura.png)).

**Qué lo hace fricción.** Lo que el setter lee es *«Marcá esta fase cuando la
termines»*, pero el control **no es una casilla**: es un botón cuyo nombre real
es *«Marcar «Estructura» como hecha»* y que no se presenta como algo tildado o
sin tildar. En la misma pantalla, la única señal de que una fase quedó hecha
aparece **en otro lugar** — la tira COMPLETADAS del fondo, y los números de la
navegación de fases.

El resultado: el setter toca, no ve una tilde aparecer donde tocó, y no sabe si
quedó registrado. Es el mismo patrón de H-03 (acción sin acuse en el lugar del
clic).

**Severidad. Me confunde.** Se agrava porque el propio panel dice que tildar no
sirve para avanzar: si además no se ve el efecto, la pregunta natural es para qué
está el botón.

**La frase que lo delató.** *«el botón se llama Marcar «Estructura» como hecha,
con el nombre de la fase que estés»* — hubo que aclarar que el nombre del control
cambia solo, porque no coincide con el texto que el setter tiene delante.

---

## H-12 · Los seis tildes del chequeo final se pierden si no tocás «Guardar el chequeo»

**Dónde.** m14 — chequeo final
([`22-m14-chequeo.png`](galeria/png/22-m14-chequeo.png)).

**Qué lo hace fricción.** **Verificado en vivo.** Se marcaron los seis
obligatorios, se salió de la pantalla sin tocar **Guardar el chequeo**, y al
volver el cartel decía otra vez *«Quedan 6 obligatorios en rojo»*: **los seis
tildes se perdieron**.

Lo caro no son los seis clics: es lo que hay detrás de cada uno. La propia
pantalla exige abrir el borrador *«mejor en incógnito y en tu celular»*, recorrer
la página entera buscando textos de relleno y **tocar cada link y el botón de
WhatsApp**. Eso es un rato largo de trabajo real que se descarta sin ningún aviso.

Y hay un agravante de aprendizaje: **el panel ya le enseñó al setter lo
contrario**. En la ficha (m1) dice, textual, *«Se guarda solo mientras escribís.
Podés cerrar y seguir después»*. El setter llega al chequeo con esa expectativa
instalada, y acá no vale — sin que nada en la pantalla se lo advierta.

**Severidad. Me frena.** Es la pérdida de trabajo más concreta que encontró la
corrida.

**La frase que lo delató.** Hizo falta un recuadro de advertencia entero —*«Los
tildes del chequeo NO se guardan solos»*— dentro del paso, y repetir la
instrucción **Guardar el chequeo** dos veces en la misma página. Cuando el manual
tiene que gritar, es que la pantalla está callada.

> **Relacionado con H-06:** el problema no es que un formulario guarde solo y otro
> no, sino que **los dos usan el mismo lenguaje** y no se distinguen.

---

## H-13 · Tres controles distintos para la misma idea de «tildar algo»

**Dónde.** A lo largo del recorrido:

| Pantalla | Control | Cómo se ve |
|---|---|---|
| m7–m12, tilde de fase | `button` | Sin estado tildado visible en el lugar del clic (H-11) |
| m13, *Confirmo que abrí el link y carga* | `switch` | Interruptor |
| m14, los 6 obligatorios + los 4 de diseño | `switch` | Interruptores ([`24b`](galeria/png/24b-error-persistente-chequeo.png)) |
| m16, *Estoy hablando con el dueño / quien decide* | `<input type="checkbox">` nativo | Cuadradito ([`30`](galeria/png/30-m16-virgen.png)) |

**Qué lo hace fricción.** Cuatro pantallas del mismo recorrido le piden al setter
exactamente lo mismo —«confirmá que hiciste esto»— con tres controles que se ven y
se comportan distinto. Nada se rompe, pero cada pantalla se aprende de nuevo, y
justo donde el control **menos** parece un tilde (la fase) es donde además el
efecto no se ve en el lugar del clic.

**Severidad. Me hace ruido.**

**Detalle extra, verificado en el DOM.** El checkbox de m16 es
`<input class="mt-0.5 h-4 w-4 shrink-0 accent-cyan-500" type="checkbox">` — **sin
`id`, sin `name` y sin `aria-label`**, y sin `<label for>` que lo asocie a su
texto. Queda sin nombre accesible: un lector de pantalla anuncia una casilla sin
decir qué confirma, y es la casilla que decide si se le quema un turno de agenda
a Franco.

**La frase que lo delató.** El manual terminó llamándolos *«interruptor»* en m13 y
m14, *«tilde»* en las fases y *«casilla»* en m16 — tres palabras para una sola
acción, porque usar una sola habría descrito mal alguna de las pantallas.

> Registrado parcialmente en M0 (punto 6). Se amplía acá con el caso de las fases,
> que en M0 figuraba como `role="switch"` y hoy es un `button`, y con la falta de
> nombre accesible del checkbox de m16.

---

## H-14 · «El historial de rechazos se conserva» — pero el setter no lo puede ver

**Dónde.** `mr` — reentrada por rechazo, bloque **REGISTRO**
([`26-mr-correccion-2.png`](galeria/png/26-mr-correccion-2.png)).

**Qué lo hace fricción.** El texto del registro afirma, literal: *«el historial de
rechazos se conserva»*. **Se conserva en la base, pero no se muestra en ninguna
parte de la pantalla.**

Comprobado sobre un negocio con **dos** rechazos guardados:

| # | Fecha | Dónde | Qué pidió Franco | ¿Se ve? |
|---|---|---|---|---|
| 1 | 25/7 | Contacto | «faltan fotos propias y el CTA no se ve en mobile» | **No** |
| 2 | 26/7 | Hero | «el hero sigue sin los datos reales del negocio» | Sí |

La pantalla del segundo rechazo es **idéntica** a la del primero: un solo recuadro
rojo con la corrección más reciente. El rechazo anterior no aparece desplegado, ni
plegado, ni bajo *Ver historial del lead* (que en estos negocios dice *«— sin
movimientos»*).

**Por qué importa de verdad:** en la segunda vuelta el setter está corrigiendo el
hero **sin poder ver** que la vuelta anterior era sobre las fotos y el botón de
WhatsApp. No tiene cómo confirmar que lo de antes sigue arreglado, ni cómo darse
cuenta de si le están pidiendo dos veces lo mismo.

**Severidad. Me confunde**, y a partir del segundo rechazo empuja a *me frena*: es
información que el setter necesita para trabajar y que el sistema tiene pero no le
entrega.

**La frase que lo delató.** El manual tuvo que escribir un consejo que compensa a
mano una función que el panel dice tener: *«cuando te llegue el primer rechazo,
copiate la nota a algún lado tuyo antes de corregir»*. Decirle al usuario que
guarde por su cuenta lo que la pantalla promete conservar es la definición de
fricción.

> **Corrección respecto de M0.** El índice de la galería describía el estado #26
> como *«Segundo rechazo: la corrección nueva al frente y las anteriores
> colapsadas»*. Eso **no ocurre**: las anteriores no están, ni colapsadas ni de
> ninguna otra forma. Las capturas #25 y #26 se diferencian sólo en el nombre del
> negocio.

---

## H-15 · Dos esperas con causas opuestas muestran el mismo texto — y en una es falso

**Dónde.** La pantalla de espera del tramo de envío, en sus dos variantes:
[`28-m15-espera-sin-respuesta.png`](galeria/png/28-m15-espera-sin-respuesta.png) y
[`29-m15-espera-sin-final-url.png`](galeria/png/29-m15-espera-sin-final-url.png).

**Qué lo hace fricción.** Las dos pantallas dicen **exactamente lo mismo**:

> **Esperando respuesta del negocio**
> Sin próximo toque agendado — **si el negocio responde, registralo** y el flujo
> sigue solo.

Pero las causas son opuestas. Verificado contra la base:

| Caso | `status` | Link permanente | Qué falta de verdad | ¿El texto aplica? |
|---|---|---|---|---|
| #28 | `PROSPECTO` | cargado | que el **negocio** conteste | Sí |
| #29 | `RESPONDIO` | **`null`** | que **Franco** cargue el link | **No** |

En el caso #29 el negocio **ya respondió**, así que la única instrucción que da la
pantalla —*«si el negocio responde, registralo»*— es una acción que ya ocurrió y
que no va a destrabar nada. Lo que falta es de Franco, y **la pantalla no lo
nombra en ningún lado**. El setter queda esperando algo que no va a pasar y sin
saber a quién reclamarle.

La única señal que los distingue es la etiqueta de estado del encabezado
(**PROSPECTO** vs **RESPONDIÓ**), que no está puesta ahí para eso y que nadie
mira como diagnóstico.

**Severidad. Me frena.** No en el sentido de que no pueda seguir con otro negocio,
sino en que este negocio queda parado por tiempo indefinido sin que el setter
tenga forma de saber que hay algo pendiente del lado de Franco. Es exactamente el
caso que el manual tiene que cubrir con honestidad —«acá esperás, y a quién»— y la
pantalla no da el dato.

**La frase que lo delató.** El manual tuvo que agregar un recuadro entero para
enseñar a leer una etiqueta como si fuera un diagnóstico: *«Cómo distinguirlas de
un vistazo: mirá la etiqueta al lado del nombre del negocio»*. Y después admitir
que la pantalla dice algo que no aplica: *«en el caso 3 esa frase confunde: el
negocio ya respondió»*.

> **Corrección respecto de M0.** El índice de la galería describía #28 como
> *«espera con m15 consultable, que nombra la causa real (5.3)»*. La causa real
> **no se nombra** en ninguna de las dos variantes: el texto es idéntico.

---

## H-16 · «Buscar horarios libres de Franco» devuelve un mensaje de configuración técnica al setter

**Dónde.** m16 — agenda, al tocar **Buscar horarios libres de Franco**
([`30-m16-virgen.png`](galeria/png/30-m16-virgen.png)).

**Qué lo hace fricción.** El botón no trae horarios: devuelve, en la pantalla del
setter, este texto:

> Setup B7.0 pendiente: cargá en la organización develOP el username de Cal.com
> (`calComUsername`) y el slug del event type (`calComEmbedUrl`, vale el slug
> pelado o la URL `https://cal.com/usuario/slug`).

Es la única pantalla de todo el recorrido que le habla al setter en jerga de
sistema: *setup B7.0*, *organización*, *username*, *slug*, *event type*, y dos
nombres de variables. Está redactada para quien configura la aplicación, y quien
la lee es una persona que vende y que acaba de conseguir la reunión.

Peor: **está escrita en imperativo** («cargá en la organización develOP…»), o sea
que le pide al setter que haga algo que no puede hacer y que ni siquiera le
corresponde. La reacción previsible es reintentar, recargar y perder tiempo en el
momento más caliente del recorrido — con el prospecto esperando del otro lado.

Contrasta con el resto del panel, que tiene un traductor de errores completo para
justamente esto (*«Algo falló al guardar — probá de nuevo; si sigue, avisale a
Franco»*). Acá el mensaje crudo pasa de largo.

**Severidad. Me frena.** Es la pared del último paso: sin horarios no hay reunión,
y el mensaje no dice ni a quién avisarle.

**La frase que lo delató.** El manual tuvo que **traducir el error** para que
sirviera: *«Eso no es algo que puedas resolver vos… mandale una captura a Franco y
decile que falta configurar Cal.com»*. Cuando el manual tiene que reescribir un
mensaje de error para volverlo accionable, el mensaje está mal dirigido.

---

## H-17 · TRAMO NO DOCUMENTADO · La búsqueda real de horarios y la confirmación del booking

**Dónde.** m16 — el corazón del último paso.

**Qué quedó sin documentar y por qué:**

| Tramo | Motivo |
|---|---|
| Cómo se ven los 3 horarios cuando Cal.com los trae de verdad | **No se pudo ejecutar**: la búsqueda devuelve el error de H-16 (Cal.com sin configurar en el entorno). Los horarios de [`31-m16-ofrecidos.png`](galeria/png/31-m16-ofrecidos.png) fueron cargados por el sembrador, no por la herramienta |
| Qué pasa al tocar **Confirmar y agendar** | **No se ejecutó a propósito**: la pantalla avisa que *«el evento se crea en el calendario real de Franco y Cal.com le manda la confirmación al prospecto»*. Es una acción que sale hacia afuera y toca la agenda de una persona real — no se dispara para documentar |

**Lo que sí quedó documentado del tramo**, por observación directa: la casilla del
dueño y su efecto sobre el botón, la pantalla con los horarios ya ofrecidos, el
formulario de confirmación completo (los tres campos obligatorios y sus ayudas), y
el estado final de reunión agendada.

**Qué haría falta para cerrarlo.** Cargar `calComUsername` y `calComEmbedUrl` en
la organización develOP del entorno de prueba, y hacer una corrida contra un
event type descartable de Cal.com.

---

## H-18 · El filtro «Perdidos (post-reunión)» lista negocios que nunca tuvieron reunión

**Dónde.** Home → **Ver toda la cartera** → **Filtrar por estado** → *Perdidos
(post-reunión)*.

**Qué lo hace fricción.** Verificado en vivo: con ese filtro aplicado aparece un
negocio cerrado **en la etapa de evaluación**, que nunca pasó por el opener, ni
por la demo, ni por ninguna reunión. La cartera lo muestra como *«Perdido — sin
acción pendiente»*, correctamente; lo que no encaja es el nombre del filtro que lo
trajo.

El par de filtros está pensado como una dicotomía —*Descartados (antes de la
demo)* vs *Perdidos (post-reunión)*— pero la segunda mitad no describe a sus
integrantes: **«perdido» es todo lo que cierra Franco, en el punto del recorrido
que sea.**

**Severidad. Me hace ruido.** El setter que busca un negocio cerrado en la etapa
temprana no lo va a buscar bajo «post-reunión», y puede concluir que se perdió del
sistema.

**La frase que lo delató.** El capítulo 10 tuvo que agregar una advertencia para
que el filtro se pueda usar: *«Leelo como "los que cerró Franco", sin importar
hasta dónde habían llegado»*. Cuando el manual tiene que enseñar a desconfiar de
una etiqueta, la etiqueta está mal.

---

*(Cerrado al terminar el capítulo 10.)*

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

*(Se sigue completando a medida que avanzan los capítulos.)*

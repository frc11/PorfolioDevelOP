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

*(Se sigue completando a medida que avanzan los capítulos.)*

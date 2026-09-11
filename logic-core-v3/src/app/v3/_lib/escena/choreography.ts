import type { ChoreoKeyframe, ChoreoTramo, LightStop } from './choreographyTypes'

/**
 * LA COREOGRAFÍA DEFINITIVA — datos, no lógica.
 *
 * Este archivo es el que se abre para calibrar el movimiento: los keyframes de
 * cámara y los tramos; la curva de luz vive en `lightArc.ts` desde B8. El
 * vocabulario que los describe está en
 * `choreographyTypes.ts`, la matemática que los consume en
 * `choreographySampler.ts` y la física que los modula en
 * `choreographyPhysics.ts`. Ninguno de los tres hay que tocarlo para mover la
 * cámara o la luz.
 *
 * ── Qué decidió S9 ─────────────────────────────────────────────────────────
 *
 * Hasta S7 acá vivía **la coreografía calibrada a mano**: 30 keyframes, 21
 * capturados con el editor y 9 derivados. El dueño del proyecto miró los cuatro
 * recorridos candidatos y eligió **un mix de la arquitectónica y la dramática**:
 *
 * - **la distancia y el encuadre, de la arquitectónica** — el espacio es el
 *   protagonista y el logo no llena el cuadro salvo en Demos;
 * - **la altura y el contraste entre tramos, de la dramática** — picados y
 *   contrapicados francos, con el salto de altura más grande de las cuatro;
 * - **el target y la composición, compuestos para este recorrido.**
 *
 * Y con esa elección **se borraron los nueve derivados**. Existían para guiarle
 * el camino a la cámara mientras el recorrido no estaba definido; ya está
 * definido. El recorrido calibrado no se perdió: vive entero en
 * `variantCalibrada.ts` y se sigue eligiendo desde el panel.
 *
 * ── Seis poses, siete entradas, cero relleno ───────────────────────────────
 *
 * Una pose por tramo. La entrada que sobra es un **sostén**: una copia exacta
 * de la pose del cierre, más adelante en el progreso. No es relleno y no
 * amortigua nada — dos keyframes con la misma pose no mueven la cámara, la
 * dejan quieta, que es exactamente lo que la pantalla del cierre necesita.
 *
 * ⚠️ **`hero · sostén` SE SACÓ EN V3-B, y su ausencia es una decisión medida.**
 * Existía para que la cámara no se moviera en la primera pantalla —el punto de
 * llegada del preloader— y el dueño lo retiró mirando: *«el fondo no scrollea con
 * el mouse en un principio»*. Lo que se llevó puesto lo publica
 * `s13b-escena.invariant.ts` §1: la primera pantalla pasa de **0,0000 a 3,4643
 * alturas de cuadro por pantalla de scroll** y de 0° a **59,4° de azimut**; a
 * cambio el tramo siguiente BAJA de 5,1959 a 3,3054 —los 130° dejan de estar
 * apretados en dos pantallas—, el salto entre los dos primeros tramos se hace ×33
 * más chico y el pico del recorrido (7,8303, el cierre) no se mueve.
 *
 * **Con puntos lejanos el rig interpola de verdad y la cámara recorre.** Es lo
 * que produce el movimiento grande, y se mide: el pico de velocidad
 * instantánea bajó de **193,8 a 75,3** alturas de cuadro por unidad de
 * progreso, y el mayor tirón entre segmentos de **70,4 a 31,2** — sin un solo
 * intermedio.
 *
 * ⚠️ **El contrapeso, escrito para que nadie lo descubra mirando:** la amplitud
 * REAL sube (el salto de altura entre poses vecinas es 12,6, el mayor de las
 * cuatro coreografías; las distancias van de 9 a 27, el rango más grande), pero
 * lo que se PERCIBE es velocidad instantánea. Si en la grabación se siente lento,
 * **la salida no es volver a meter tirones: es reducir pantallas de scroll.**
 *
 * ── La regla de amplitud de los 90°, anulada ───────────────────────────────
 *
 * S9 pedía que ningún tramo moviera la cámara menos de 90° de órbita. Es
 * aritméticamente imposible: cinco tramos que se mueven × 90° son 450°, y el
 * recorrido da una vuelta de 360. **La regla quedó anulada por decisión del
 * dueño del proyecto y no se verifica en ningún lado.**
 *
 * La alternativa de **dos vueltas (720°)** se descartó con el número: las poses
 * caerían en azimut 210, 330, 65 y 240, y ahí el anillo de planos suspendidos
 * de S5 le pone techo a la cámara en **13 a 15 de distancia** — o sea que se
 * perdería exactamente lo que el mix hereda de la arquitectónica. Si algún día
 * se quieren las dos vueltas, **la salida es abrirle un hueco al anillo, no
 * acortar la cámara.**
 *
 * ── Cómo se edita esto ─────────────────────────────────────────────────────
 *
 * A mano, o con el **editor de keyframes** del propio probe (modo `editor` en
 * `/probe-escena`): se elige un keyframe de la lista, se lo ajusta con los
 * sliders mirando la escena, y el botón de exportar devuelve este bloque
 * entero, actualizado y con estos mismos comentarios, para pegarlo acá.
 *
 * Un detalle que importa si se edita a mano: **los comentarios de adentro del
 * array se editan en `choreographyNotes.ts`**, que es de donde el exportador
 * los saca. Cambiar uno acá y no allá se pierde en el próximo pegado. Todo lo
 * demás de este archivo —este doc, los tramos, el arco de luz— es comentario de
 * verdad y el editor no lo toca.
 *
 * ⚠️ **Exportar no es guardar.** El botón copia al portapapeles; la calibración
 * solo existe cuando ese texto se pega acá. Ya costó una sesión entera de
 * trabajo humano. Ver el aviso grande en `choreographyEditor.ts`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠️ B13 · DOS POSES SE ALEJARON — Y EL PORQUÉ VIVE ACÁ, NO AL LADO DE ELLAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **`quiénes somos` pasa de 11,5 a 14 y `demos` de 9 a 14.** Es lo único que
 * B13 cambió de este archivo: ni un ángulo, ni una altura, ni un encuadre.
 *
 * ⚠️ **Por qué el porqué está en esta cabecera y no adentro del array.** Los
 * comentarios de adentro los emite el exportador desde `choreographyNotes.ts`
 * —lo dice el bloque de arriba— y `s7-export.invariant.ts` compara el
 * round-trip **byte por byte** contra este archivo. Escribir ahí obligaría a
 * tocar `/probe-escena/_components/`, que está fuera de lo autorizado. Esta
 * cabecera es «comentario de verdad» y el editor no la toca: es el único lugar
 * donde una decisión de sprint puede vivir sin pelearse con el exportador.
 *
 * ── Qué lo pidió, y con qué número ─────────────────────────────────────────
 *
 * *«En los tramos donde el logo compite con el texto, la cámara se aleja: de
 * ~40 % del cuadro a ~15 %.»* El 40 % existe y está localizado: medido sobre el
 * cuadro más angosto donde la escena existe (1025×900) y sobre la ventana
 * ENTERA de cada sección, el logo llega al **36,10 % del cuadro en p≈0,746**,
 * que es el máximo de todo el recorrido y es la pose `demos`
 * (`scripts-b13/d-tamano.ts`). Con las dos poses a 14:
 *
 * | sección | antes | después |
 * |---|---:|---:|
 * | hero | 11,85 % | 10,68 % |
 * | quiénes somos | 21,97 % | **15,17 %** |
 * | números | 22,06 % | **15,50 %** |
 * | trabajos | 8,70 % | 8,64 % |
 * | el diferencial | **36,10 %** | **15,40 %** |
 * | cierre | 6,26 % | 5,80 % |
 *
 * ── ⚠️ LAS DOS RESTRICCIONES QUE FIJABAN ESOS NÚMEROS ESTÁN VENCIDAS ───────
 *
 * - **11,5 lo imponía el anillo de planos suspendidos** (radio 11,8–22): fuera
 *   de la cuña frontal, una cámara más lejos siempre tenía un plano por delante.
 *   **S10 borró ese anillo entero**, archivo incluido (`probeScene.ts`, «Lo que
 *   S10 borró»). La restricción quedó vencida tres sprints antes de que a
 *   alguien le sirviera.
 * - **9 lo imponía «sol visible en cuadro»**, que pedía `altura ≤ −0,214 ×
 *   distancia`. **S11 borró el cuerpo del sol** —sus dos sprites, el disco y su
 *   washout (`lightRig.ts`)—: no hay sol que encuadrar y la desigualdad no
 *   aplica. La altura no se toca igual; sólo la distancia estaba autorizada.
 *
 * ── Lo que se llevó puesto, con su cifra ───────────────────────────────────
 *
 * - **«`demos` llena el cuadro» quedó REVOCADO.** SITIO-S11 lo había declarado
 *   como decisión —y con él el recorte por arriba del 0,9 % del área—. A 14 el
 *   logo entra ENTERO en las 32 muestras. `s10-logo.invariant.ts` §3 y §6 lo
 *   afirman ahora al revés, y su control positivo usa la distancia VIEJA.
 * - **Ningún tramo se aceleró.** El pico de velocidad del recorrido BAJA de
 *   4,6198 a **3,4126** alturas de cuadro por pantalla de scroll; el hero baja
 *   de 3,4643 a 3,4126 y el cierre de 4,62 a 2,74. El arranque queda como el
 *   tramo más rápido porque los otros se frenaron, no porque él subiera
 *   (`s13b-escena.invariant.ts` §1, con la pista de antes al lado).
 * - **El aterrizaje del preloader no se movió**: la pose del hero no se tocó,
 *   así que `scene-framing` sigue dando 445 × 310 px en 1440×810.
 * - **El censo de B9 no se movió**: 1,33 a 1920 y 1,20 a 1440. La cámara no
 *   mueve una caja de texto.
 *
 * ── ⚠️ EL MARGEN QUE QUEDA, para el próximo que venga a mover esto ─────────
 *
 * `quiénes somos` es la pose que roza el piso. La altura mínima segura es
 * `FLOOR_Y + 0,045 × distancia`, así que con la altura de −3,60 **la distancia
 * a la que la cámara TOCA el papel con el puntero en el extremo es
 * `(−3,60 − FLOOR_Y) / 0,045` = 15,64**. A 11,5 la holgura era 0,187 de mundo
 * (**×1,360** sobre `MOUSE_HEIGHT_FACTOR`); a 14 es **0,074** (**×1,118**).
 * Sigue del lado bueno y `s18-azimut.invariant.ts` §4 lo recalcula y lo publica,
 * pero el margen es la mitad: **quedan 1,64 de distancia**, y ni un centímetro
 * más sin mover también la altura o `MOUSE_HEIGHT_FACTOR`. Pasado ese número el
 * invariante se pone en rojo; no se degrada en silencio. **La alternativa
 * medida, por si se prefiere el margen: 13,0 deja ×1,203 y el logo en
 * 16,3–16,7 %.**
 *
 * ── Lo que este recorrido le entrega al preloader ──────────────────────────
 *
 * `scene-framing.ts` proyecta **el primer keyframe** para saber a qué tamaño y
 * en qué lugar tiene que aterrizar el logo del preloader. Mover la pose del hero
 * mueve ese destino: hoy da **445 × 310 px** en 1440×810 y una elevación de
 * **18,6°** — V3-E movió `frameX` y corrió el destino 78,7 px; la elevación no
 * la toca. Ver `scene-framing.invariant.ts`.
 */

// ── Los tramos ──────────────────────────────────────────────────────────────

/** Pantallas de scroll que cubre el recorrido completo. */
export const CHOREO_SCREENS = 8

/**
 * Los seis tramos. `from`/`to` son múltiplos exactos de 1/8 y cubren [0, 1] sin
 * huecos ni solapes — el sampler se apoya en eso para la lectura del tramo
 * actual.
 *
 * S9 renombró dos: `portfolio` pasó a **`trabajos`** y
 * `movimiento final + cierre` a **`cierre`**, que son los nombres con los que
 * el recorrido quedó decidido.
 */
export const CHOREO_TRAMOS: readonly ChoreoTramo[] = [
  { name: 'hero', screens: 1, from: 0, to: 0.125 },
  { name: 'quiénes somos', screens: 2, from: 0.125, to: 0.375 },
  { name: 'números', screens: 1, from: 0.375, to: 0.5 },
  { name: 'trabajos', screens: 1, from: 0.5, to: 0.625 },
  { name: 'demos', screens: 1, from: 0.625, to: 0.75 },
  { name: 'cierre', screens: 2, from: 0.75, to: 1 },
]

// ── Los keyframes ───────────────────────────────────────────────────────────

/**
 * El recorrido. 7 keyframes: 7 capturados + 0 derivados.
 *
 * ⚠️ El censo de arriba dice "7 capturados" porque el exportador llama así a
 * todo lo que viene del archivo. **Ninguna de estas siete se capturó con el
 * editor**: seis son poses compuestas y una es un sostén. Lo que sí es literal
 * es el "0 derivados" — este recorrido no tiene un solo keyframe de relleno.
 *
 * Una pose por tramo, más un sostén: el cierre se clava desde 0,950 porque ahí
 * van "develOP" y el slogan, y el texto sobre una cámara que todavía deriva se
 * lee peor. El hero **ya no** tiene el suyo — ver el aviso de la cabecera.
 *
 * Los cinco tramos que se mueven van `turn: 'literal'`: la vuelta se acumula
 * 130 + 55 + 10 + 115 + 50 = **360 exacto**. Con los ángulos de hoy `short`
 * daría lo mismo —ningún salto pasa de 180°— pero la marca está para que la
 * vuelta SOBREVIVA a que se editen los ángulos.
 *
 * La pose son CINCO canales: ángulo, altura, distancia y los dos de encuadre.
 * `frameY` queda en cero en las seis, igual que en todo el recorrido anterior:
 * el canal solo tiene recorrido por encima de una distancia de 11,4 y la
 * composición de este track se resuelve con `frameX` y con la altura de cámara.
 * La luz no entra en la pose desde S6: vive en `LIGHT_ARC`, abajo.
 */
export const CHOREO_KEYFRAMES: readonly ChoreoKeyframe[] = [
  // ── Tramo 1 · Hero ───────────────────────────────────────────────────────
  //
  // "Reposo. Solo vira e inercia del mouse. Es el punto de llegada del
  // preloader: la cámara no se mueve apenas entrás."
  {
    // Sin `ease`: es el primer keyframe, no se llega a él desde ningún lado. **Esta
    // pose es el destino del preloader**: `scene-framing.ts` la proyecta para saber
    // dónde y de qué tamaño aterriza el logo 2D — 445 px de ancho de tinta en
    // 1440×810, contra los 523 que daba la calibrada, un 15% más chico.
    //
    // ⚠️ **V3-E bajó `frameX` de 0,68 a 0,5, y la premisa —«el logo queda
    // cortado»— está REFUTADA:** con 0,68 entraba ENTERO en los siete cuadros. Lo
    // que fallaba era la puntería: el eje óptico caía 0,0953 AFUERA de su caja y el
    // margen derecho, 0,1317 del ancho, era el más chico de los cuatro. Con 0,5 el eje
    // entra y ese margen ya no es el más chico. Lo mide `s16-encuadre.invariant.ts`.
    //
    // La distancia es de la arquitectónica (su hero está en 20 y da el mismo 57% de
    // caja); 6,40 de altura deja los 10,0 de caída del tramo siguiente sin gastar el
    // techo del rango, que Números necesita entero; y el azimut 0 vive en la cuña
    // frontal libre, donde la cámara puede irse lejos sin un plano por delante.
    //
    // ⚠️ **Perilla de reserva, NO aplicada:** la elevación de entrada —18,6°, contra
    // 31,0° de la calibrada— es la que el preloader usa para rotar su mesh; subir la
    // altura a ~7,50 la lleva a 23,2° y cuesta 1,1 de caída. Se juzga por grabación.
    at: 0,
    name: 'hero',
    pose: { angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 },
  },

  // ── Tramo 2 · Quiénes somos (dos personas) ───────────────────────────────
  {
    // "El recorrido más largo. La cámara baja y se mete entre los planos
    // suspendidos — el entorno pasa por delante del logo."
    //
    // 130° de azimut y 132,6° de barrido 3D: es el tramo más amplio del recorrido.
    // La altura cae 10,0 hasta el piso del rango útil y la distancia se cierra de
    // 19 a 11,5.
    //
    // ── Los dos números que no se eligieron, se calcularon ─────────────────
    //
    // **11,5 lo impone la escena de S5.** El anillo de planos suspendidos vive
    // entre radio 11,8 y 22, y fuera de la cuña frontal de ±40° una cámara más
    // lejos que 11,8 siempre tiene un plano entre ella y el logo. 11,5 es el mismo
    // número que la arquitectónica usa para todas sus poses fuera de la cuña, y
    // acá deja el logo limpio EN la pose aunque el camino hasta ella no lo esté.
    //
    // **−3,60 lo impone el piso.** El offset de mouse baja la cámara
    // `0,045 × distancia`, así que la altura mínima segura es
    // `−4,304 + 0,045 × 11,5 = −3,787`. El −3,89 que S9 traía escrito era el
    // margen a distancia 9 y acá no vale: a 11,5 la cámara se iría abajo del papel.
    // −3,60 deja **0,187 de holgura**, verificada además simulando la inercia.
    //
    // ── El entorno por delante, que acá es la intención ────────────────────
    //
    // Camino a esta pose la cámara pasa por detrás de dos planos —el de azimut 60°
    // (p 0,198→0,222) y el de 118° (p 0,286→0,313)— y cada uno barre el logo
    // entero por menos de una tercera parte de pantalla. Es lo que el sprint pide
    // con "el entorno pasa por delante del logo", y es lo que hace que se lea que
    // hay un LUGAR y no un objeto flotando.
    at: 0.375,
    name: 'quiénes somos',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 130, height: -3.6, distance: 14, frameX: -0.8, frameY: 0 },
  },

  // ── Tramo 3 · Números ────────────────────────────────────────────────────
  {
    // "La cámara sube y se aleja: vista cenital parcial, la retícula aérea y las
    // marcas de replanteo se leen como plano. Órbita corta pero desplazamiento
    // vertical fuerte."
    //
    // Altura 9,00 —el techo del rango— desde los −3,60 anteriores: **12,6 de salto
    // entre poses vecinas, el más grande de las cuatro coreografías** (la base
    // tiene 7,8 y la dramática 11,4). Ésa es la contribución de la dramática, y es
    // toda la razón por la que la órbita puede ser corta: 55° de azimut, pero
    // **68,8° de barrido 3D** contando el vertical.
    //
    // ── Por qué 185 y no los 200 de la tabla ───────────────────────────────
    //
    // Fuera de la cuña frontal hay exactamente **una** ventana donde la cámara
    // puede alejarse: la que abre el plano grande de azimut 187° a radio 20,5.
    // Ahí el tope limpio es 20,5; en 200 baja a 17,8 y en 210 a 16,0. 185 es el
    // centro de esa ventana, y de paso deja el FONDO en la cuña libre —el fondo de
    // una pose es su azimut opuesto— así que el cuadro se abre hacia el vacío
    // justo cuando la cámara sube a leer el piso.
    at: 0.5,
    name: 'números',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 185, height: 9, distance: 18.5, frameX: -0.45, frameY: 0 },
  },

  // ── Tramo 4 · Trabajos ───────────────────────────────────────────────────
  {
    // "La cámara casi se detiene y mira hacia el fondo profundo. Encuadre
    // despejado."
    //
    // 10° de azimut: "casi se detiene" son diez grados, no cincuenta. Lo que sí se
    // mueve es la altura —de 9,00 a 4,50, la cámara se NIVELA— y con eso el eje
    // óptico deja de mirar el piso y se mete en la profundidad.
    //
    // ── Es la plataforma del efecto Star Wars, y queda medida ──────────────
    //
    // El sprint que construya los proyectos emergiendo desde el fondo hereda esto,
    // verificado sobre todo el tramo (p 0,500 a 0,625):
    //
    //   · cono libre de ±29° horizontal × ±17,5° vertical — **el cuadro entero**;
    //   · **34 unidades de mundo de profundidad libre** sobre el eje;
    //   · cero oclusión del logo en toda la pantalla.
    //
    // Ningún plano suspendido entra en ese corredor. Es el único tramo junto con
    // Números que tiene el cuadro completamente despejado hacia atrás — el hero
    // tiene ±10°, y Quiénes somos, Demos y el cierre tienen 0°, que es la masa
    // oscura de fondo que la escena quiere ahí.
    //
    // `frameX` −0,85 empuja el logo contra el borde izquierdo justamente para eso:
    // el corredor por donde vienen los proyectos es el resto del cuadro.
    at: 0.625,
    name: 'trabajos',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 195, height: 4.5, distance: 20, frameX: -0.85, frameY: 0 },
  },

  // ── Tramo 5 · Demos ──────────────────────────────────────────────────────
  {
    // "Vuelve a bajar al nivel del logo y se acerca. El momento más íntimo del
    // recorrido."
    //
    // 115° de órbita y la distancia de 20 a 9: es el tramo que más mueve la cámara
    // en el espacio, y el pico de velocidad del recorrido (75,3) vive acá, a mitad
    // de camino. **Es la única pose donde el logo llena el cuadro** —81% del alto
    // en tinta— y es la excepción que la arquitectónica se reserva.
    //
    // ── Por qué −2,60 y no 0 ───────────────────────────────────────────────
    //
    // La tabla pide además "sol visible en cuadro". El sol vive a elevación 29,6°
    // en este punto del arco, así que para que entre en el encuadre la cámara
    // tiene que estar MIRANDO HACIA ARRIBA lo suficiente: con media altura de
    // cuadro de 17,5°, hace falta `altura ≤ −0,214 × distancia`, o sea −1,93 a
    // distancia 9. −2,60 lo cumple con margen y sigue siendo "el nivel del logo"
    // (la tinta va de −2,39 a +2,39): es un contrapicado de 16°, no un picado.
    //
    // Holgura contra el piso: 1,299.
    //
    // ── ⚠️ EL RECORTE POR ARRIBA ES DECISIÓN (SITIO-S11, defecto 18) ───────
    //
    // Llenar el cuadro y salirse de él NO son lo mismo, y hasta S10 acá sólo
    // estaba escrito lo primero: a p=0,750 la caja llega a y=+1,05 con el borde en
    // +1,00 y el logo entra al 98,9% en el peor cuadro — cerca del 1% del área
    // queda afuera. **El valor no se toca:** lo que se recorta es el filo superior
    // del trazo, no la forma, y un recorte por arriba que nadie declaró se lee como
    // un error. Lo midió `s10-logo.invariant.ts` §3, y su §6 lo custodia.
    at: 0.75,
    name: 'demos',
    ease: 'shift',
    turn: 'literal',
    pose: { angleDeg: 310, height: -2.6, distance: 14, frameX: 1, frameY: 0 },
  },

  // ── Tramo 6 · Cierre ─────────────────────────────────────────────────────
  {
    // "Retroceso largo. La cámara se va, el entorno se abre. Cierra en el mismo
    // azimut que el hero pero mucho más lejos."
    //
    // De 9 a 27 de distancia: **el alejamiento más largo del recorrido**, y el que
    // fija el rango completo de distancias del track (9 a 27, contra 7–16 de la
    // base y 11,5–29 de la arquitectónica). El ángulo dice 360 y no 0 porque este
    // archivo guarda el ángulo ACUMULADO; el panel lo publica envuelto y ahí se
    // lee 0,0°, o sea el mismo azimut del hero.
    //
    // La altura −1,40 es el cierre de la dramática tal cual: un contrapicado de 3°
    // que mira la marca desde apenas abajo, con el sol ya poniéndose detrás.
    //
    // El logo ocupa el 28% del alto del cuadro en tinta, así que quedan ~36% de
    // aire arriba y abajo — sobra para el wordmark y una línea de slogan.
    //
    // `arrive` es la curva del sistema para lo que llega: el alejamiento resuelve
    // temprano y después se demora, que es lo que deja la última pantalla quieta.
    at: 0.95,
    name: 'cierre',
    ease: 'arrive',
    turn: 'literal',
    pose: { angleDeg: 360, height: -1.4, distance: 27, frameX: 0, frameY: 0 },
  },
  {
    // Sostén de verdad: pose idéntica a la anterior. **La cámara se clava.**
    //
    // Sin él, la curva `arrive` seguía derivando a 0,77 alturas de cuadro por
    // unidad de progreso en el último frame del recorrido, y el texto del cierre
    // se apoya sobre una imagen que todavía se mueve. Con la llegada en 0,950 la
    // velocidad medida es **0,00 desde p = 0,96 hasta el final**.
    //
    // El precio está medido y es chico: el retroceso pasa a repartirse en 0,20 de
    // progreso en vez de 0,25, así que el mayor tirón del recorrido sube de 25,0 a
    // **31,2** — todavía menos de la mitad de los 70,4 de la base.
    at: 1,
    name: 'cierre · sostén',
    ease: 'arrive',
    turn: 'literal',
    pose: { angleDeg: 360, height: -1.4, distance: 27, frameX: 0, frameY: 0 },
  },
]

// ── El arco del sol ─────────────────────────────────────────────────────────

/**
 * **Desde B8 el arco vive en `lightArc.ts` y acá sólo se re-exporta.** Salió
 * por la regla de las 300 líneas —este archivo está en su base heredada exacta
 * y el arco creció de seis a ocho paradas— y porque dejó de ser una tarde: es
 * una tarde, una noche en Trabajos y la mañana siguiente. La relación
 * `nivel = sin(elevación)/sin(36°)`, el porqué de cada parada y lo que la noche
 * obligó a cambiar fuera del arco están allá. Ningún consumidor cambió de
 * import: `sampleLightArc`, `s7-sol` y el rig lo siguen leyendo de acá.
 */
export { LIGHT_ARC } from './lightArc'

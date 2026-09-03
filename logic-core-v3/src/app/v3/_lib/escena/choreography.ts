import type { ChoreoKeyframe, ChoreoTramo, LightStop } from './choreographyTypes'

/**
 * LA COREOGRAFÍA DEFINITIVA — datos, no lógica.
 *
 * Este archivo es el que se abre para calibrar el movimiento: los keyframes de
 * cámara, los tramos y la curva de luz. El vocabulario que los describe está en
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
    pose: { angleDeg: 130, height: -3.6, distance: 11.5, frameX: -0.8, frameY: 0 },
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
    pose: { angleDeg: 310, height: -2.6, distance: 9, frameX: 1, frameY: 0 },
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

// ── El arco del sol (S6 · reescrito en S7 · reapuntado en S9) ───────────────

/**
 * EL SOL Y LA LUZ PRINCIPAL SON LA MISMA COSA, Y ESTA ES SU TABLA.
 *
 * `probeSun.ts` dibuja el cuerpo; `lightRig.ts` coloca la luz; los dos leen de
 * acá. Lo que ilumina, lo que proyecta la sombra y lo que se ve en el cuadro
 * son el mismo objeto en la misma posición: un sol dibujado por un lado y una
 * key por el otro son **dos soles**, y en cuanto uno se mueve el espacio deja
 * de ser creíble.
 *
 * ── La relación que ata el nivel con la elevación ──────────────────────────
 *
 * > **`level` = sin(elevación) / sin(36°)**
 *
 * No es una coincidencia bonita: es la definición. La irradiancia que una
 * fuente lejana deposita sobre una superficie horizontal es proporcional al
 * seno de su elevación, así que **la sala no se apaga porque bajamos un
 * número: se apaga porque el sol baja.** Los cinco niveles —1 · 1 · 0,84 ·
 * 0,60 · 0,34— salen de las cinco elevaciones, y 36° es la que S6 había
 * calibrado para la principal.
 *
 * ⚠️ Si se mueve un `level` hay que mover su `elevationDeg`, y al revés.
 *
 * ── Qué cambió en S9, y qué NO ─────────────────────────────────────────────
 *
 * **Solo el azimut, más un stop nuevo en 0,125.** Nivel, kelvin y elevación
 * quedaron exactamente como los dejó S7, así que la relación de arriba sigue
 * valiendo carácter por carácter y el descenso sigue coincidiendo con el arco
 * de luz: cuando la intensidad baja hacia el cierre, el sol está bajo.
 *
 * El recorrido nuevo obligó: con las poses de S9 y el azimut viejo, el
 * contraluz caía sobre **Quiénes somos (γ 157°) y Trabajos (γ 133°)** —dos
 * pantallas que se leen— y Demos se quedaba sin él (γ 71–77°), justo donde el
 * sprint lo pide. El azimut se reapuntó para dar vuelta esas dos cosas:
 *
 * | | S7 | S9 |
 * |---|---:|---:|
 * | azimut | −42 → −32 → +6 → +38 → +50 | **−42 → −42 → 115 → 132 → 136 → 138** |
 * | barrido total | 92° | **180°** |
 * | γ mínimo de todo el track | 29° | **35,5°** |
 * | sol en cuadro | 4,2% | **33,4%** (núcleo 32,0%) |
 * | ventana | p = [0,684 → 0,726] | **p = [0,666 → 1,000]** |
 *
 * ── Por qué 180° de barrido, cuando S7 lo había acotado a 92° ──────────────
 *
 * El límite de S7 tenía una razón concreta: en el recorrido viejo **la cámara
 * vivía en azimut 0 durante más de medio track**, y un sol que barriera de más
 * dejaba tramos con la cara vista a oscuras. Ese recorrido ya no existe: el
 * definitivo lee contenido en seis azimuts repartidos por toda la vuelta.
 *
 * Con la cámara barriendo 360° y el sol barriendo 180°, **el ángulo relativo
 * tiene que recorrer 180° sí o sí**, así que el contraluz cae en algún lado. Se
 * lo puso donde el sprint lo pide —el fondo de Demos, con la cámara abajo
 * mirando hacia arriba— y el precio es que a partir de ahí el recorrido va cada
 * vez más a contraluz hasta el final. Eso es exactamente atardecer.
 *
 * 180° no es una vuelta: es un día, de un horizonte al otro.
 *
 * ── Lo que el arco NO es, y hay que decirlo ────────────────────────────────
 *
 * La tabla de S9 describía la luz como un día entero —bajo al hero, alto en
 * Números, poniéndose al cierre—. **Este arco es una tarde**, con descenso
 * monótono. La diferencia no es de gusto: con `level = sin(elev)/sin(36°)`, un
 * sol rasante en el hero da **nivel 0,26–0,35**, o sea que el home arrancaría
 * más oscuro que su propio cierre. Se frenó y quedó registrado.
 *
 * ── El γ que se protege ────────────────────────────────────────────────────
 *
 * γ es el ángulo entre la luz y el observador medido desde el objeto: 0 = luz
 * plana desde atrás de la cámara, 45–70 = tres cuartos, ≈90 = lateral, >130 =
 * contraluz. Con este arco, las cinco ventanas que llevan contenido quedan en
 * **41° · 83–90° · 60–66° · 64–66° · 137°**, y Demos —la única que no lleva
 * texto— en **155–166°**, que es el contraluz pedido. El mínimo de todo el
 * track es 35,5°: **no hay un solo punto con luz plana.**
 *
 * ── La temperatura ────────────────────────────────────────────────────────
 *
 * Sigue subiendo hacia el azul y sigue siendo la decisión más opinable del rig.
 * **Para el cierre ámbar: cambiar el 7700 de abajo por ~2200.** Un número.
 *
 * ── Lo que NO está acá ─────────────────────────────────────────────────────
 *
 * Cómo se reparte el nivel entre las tres luces, el hemisférico, la niebla y el
 * cuerpo del sol está en `probeLighting.ts`, y no es un reparto plano: el
 * ambiente se apaga más rápido que la principal y el contraluz se resiste. Es
 * lo que hace que la escena gane contraste al oscurecerse en vez de volverse
 * gris.
 */
export const LIGHT_ARC: readonly LightStop[] = [
  // Mediodía. La elevación es la que S6 calibró para la key: el arco arranca ahí.
  { at: 0, level: 1, kelvin: 6500, azimuthDeg: -42, elevationDeg: 36 },
  // S9 · el sol se queda quieto en la primera pantalla. Sin este stop el barrido
  // arranca en p=0 y el sol se corre hacia el lado de la cámara: γ se caía a 17°,
  // o sea luz plana en la primera pantalla del sitio.
  //
  // ⚠️ V3-B · **el VALOR no se tocó y la razón se re-midió**: la que estaba escrita
  // —«el sol se queda quieto mientras el hero se queda quieto»— dejó de ser cierta
  // al sacar `hero · sostén`. El stop sigue ganándose el lugar con otro número: γ
  // en la ventana del hero da **40,8–95,2°** con él y **34,3–63,7°** sin él. Lo
  // mide `s7-modelado.invariant.ts`, donde además el γ mínimo de TODO el track
  // sube de 35,5° a 40,8°: la cámara que se mueve en la primera pantalla MEJORA
  // el modelado.
  { at: 0.125, level: 1, kelvin: 6500, azimuthDeg: -42, elevationDeg: 36, ease: 'linear' },
  // Meseta de luz: el nivel y la elevación no se mueven hasta el final de Números.
  // El azimut sí, y ahora rápido — la cámara está dando media vuelta debajo y el
  // sol tiene que quedarse de su lado para seguir modelando.
  { at: 0.5, level: 1, kelvin: 6500, azimuthDeg: 115, elevationDeg: 36, ease: 'linear' },
  // Trabajos y Demos. El nivel baja apenas: al giro no se le apaga la luz. El
  // azimut termina de cruzarse detrás del logo — acá es donde el sol entra en
  // cuadro y ya no se va.
  { at: 0.75, level: 0.84, kelvin: 6850, azimuthDeg: 132, elevationDeg: 29.6, ease: 'shift' },
  // El cierre empieza, ya en penumbra y con la sombra alargándose.
  { at: 0.875, level: 0.6, kelvin: 7300, azimuthDeg: 136, elevationDeg: 20.7, ease: 'linear' },
  // El cierre. `arrive` = llega apagado temprano y sostiene. El sol se pone dentro
  // del cuadro: a esta altura queda a 42° del eje óptico, así que el núcleo sale
  // del encuadre (necesita 35,2°) y solo asoma el halo por el borde.
  { at: 1, level: 0.34, kelvin: 7700, azimuthDeg: 138, elevationDeg: 11.5, ease: 'arrive' },
]

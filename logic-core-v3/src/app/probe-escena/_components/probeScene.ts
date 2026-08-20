import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

/**
 * EL OBJETO, LA PALETA, EL PISO Y LA CÁMARA.
 *
 * Era "un solo lugar para todos los números de la escena" hasta S6, y dejó de
 * serlo porque el archivo se hizo largo: la luz salió a `probeLighting.ts`, la
 * niebla y la sombra a `probeAtmosphere.ts`, las partículas y sus generadores de
 * sprite a `probeParticles.ts`, y las marcas y la arquitectura ya vivían en
 * `floorMarks.ts` y `probeArchitecture.ts` desde S5. Lo que queda acá es la
 * escena en su sentido más literal: **qué hay, de qué color, apoyado sobre qué y
 * mirado con qué lente.**
 *
 * NO se toca `logo-footprint.ts`: de ahí solo se LEE `LOGO_BOX_WORLD`, que es
 * el tamaño en unidades de mundo de la caja 1024 del SVG (0.007 × 1024). Las
 * dos calibraciones que viven en ese archivo resuelven otro problema —encuadrar
 * el logo dentro de una caja cuadrada del layout— y acá la cámara no está
 * encuadrando una caja: está orbitando un objeto en un estudio.
 */

// ── El logo ────────────────────────────────────────────────────────────────

/**
 * Escala del SVG a mundo. Es EXACTAMENTE la del artefacto frozen
 * (`HeroArtifact.tsx`: `<group scale={0.007}>`), y tiene que serlo: el probe
 * existe para juzgar el objeto real, no una versión mejorada del objeto.
 */
export const PROBE_SVG_SCALE = 0.007

/**
 * Profundidad de extrusión del logo, en unidades del viewBox de 1024.
 *
 * **Cambió en S4: era 15 (la del frozen), ahora es 78.** El probe midió que con
 * 15 el canto es el **1,73% del ancho** (0,119 de espesor contra 6,86 de ancho)
 * y por eso el logo desaparece en las dos ventanas de perfil: a 90° y 270° no
 * queda más que una línea de 14 px. El §5 de ese reporte identificó la banda
 * 7–10% como la que da "un canto que se lee de perfil".
 *
 * Con 78: espesor de mundo **0,56**, o sea el **8,2% del ancho** — en el medio
 * de esa banda. La pieza deja de ser una lámina.
 *
 * **Cuesta cero triángulos.** La profundidad de una extrusión es una traslación
 * de la tapa trasera, no geometría nueva: los triángulos los ponen `bevelSegments`
 * y la cantidad de puntos del contorno, y ninguno de los dos se tocó.
 *
 * Es la constante editable que pide el sprint: subirlo o bajarlo es un número, y
 * el espesor real resultante se publica en pantalla (`ProbeStats.logoD`).
 */
export const PROBE_EXTRUDE_DEPTH = 78

/**
 * El resto de la extrusión, idéntico al del frozen (`HeroArtifact.tsx`): el
 * bisel de 1/1/5 es lo que le da al canto el filo que agarra luz.
 */
export const PROBE_EXTRUDE = {
  depth: PROBE_EXTRUDE_DEPTH,
  bevelEnabled: true,
  bevelThickness: 1,
  bevelSize: 1,
  bevelSegments: 5,
} as const

// ── Paleta del estudio ─────────────────────────────────────────────────────

/** Papel. Es `--color-ds-light-bg` del sistema (S1), el mismo del hero claro. */
export const PAPER_COLOR = '#F7F7F5'
/** Tinta del logo. Mate, no cromado: negro casi puro con un pelo de vida. */
export const INK_COLOR = '#0F0F0F'
/**
 * ── LA RUGOSIDAD DE LA TINTA (S6) ──────────────────────────────────────────
 *
 * **Bajó de 0,52 a 0,34, y es lo que hace que el logo tenga forma.**
 *
 * Un negro de albedo casi nulo no se describe con luz difusa: por más que se
 * suba la intensidad, `0,0046 × lo que sea` sigue siendo negro. Lo único que
 * dibuja la forma de una pieza negra es el **reflejo especular**, que no depende
 * del albedo (con `metalness` 0, three usa el 4% de un dieléctrico), y cuya
 * fuerza la maneja este número: a rugosidad alta el lóbulo se abre y se apaga —
 * la pieza queda plana— y a rugosidad baja se cierra y brilla.
 *
 * 0,34 es la banda donde la cara y el canto se separan por un degradé
 * especular ancho pero legible, sin volverse un plástico. Es el número que hay
 * que mover si al mirarlo el logo se ve cromado (subirlo) o todavía plano
 * (bajarlo), y es el que le da al contraluz una superficie donde dibujarse.
 */
export const INK_ROUGHNESS = 0.34
/** Marcas de registro sobre el papel: `--color-ds-light-border`. */
export const MARK_COLOR = '#D7D7D5'
/** Marco exterior: más claro, se va hacia el fondo y no compite con el interior. */
export const MARK_SOFT_COLOR = '#E6E6E3'
/** Cintas de posición: más oscuras. Una cinta es cinta, no una línea trazada. */
export const MARK_TAPE_COLOR = '#CFCFCC'
/** Rebote del papel hacia arriba (piso del hemisférico). Cálido apenas. */
export const BOUNCE_COLOR = '#EDEAE3'
/**
 * ── EL NEGRO DE LA ESCENA (S5) ─────────────────────────────────────────────
 *
 * Los planos suspendidos son la fuente principal de masa oscura, y son la razón
 * por la que la escena deja de ser toda clara. Dos familias:
 *
 * - **Oscuro.** Negro mate, y **más claro que la tinta del logo a propósito**:
 *   en lineal `#191917` es del orden de tres veces más luminoso que `#0F0F0F`,
 *   así que hay masa oscura de verdad sin que nada le dispute al logo el punto
 *   más negro del cuadro. Es la perilla del balance: subirlo aclara la masa,
 *   bajarlo la acerca al logo.
 * - **Claro.** Apenas por encima del papel. Es el mismo valor que tenían los
 *   softboxes de S4, elegido para lo mismo: que el plano se separe del fondo por
 *   el sombreado y no por el color.
 */
export const PLANE_DARK_COLOR = '#191917'
export const PLANE_PALE_COLOR = '#FCFCFA'
/** Retícula del techo: oscura, un escalón por encima de los planos. */
export const AERIAL_COLOR = '#3A3A35'
/** Las vigas altas de la retícula: más oscuras, se leen detrás de la trama fina. */
export const AERIAL_BEAM_COLOR = '#2A2A26'
/** Pilares lejanos. Muy tenues: apenas se despegan del papel. */
export const PILLAR_COLOR = '#E9E9E6'
/**
 * Arcos sueltos del logo — las piezas que todavía no se ensamblaron.
 *
 * **Cambió en S5: eran `#E2E2DF`, apenas separados del papel.** Con esa lectura
 * el tono claro los volvía el fantasma de otra cosa; en material oscuro se leen
 * como pedazos del mismo objeto que el logo, que es lo que son. Quedan varios
 * escalones por encima de la tinta y por encima también de los planos, así que
 * suman masa sin disputar.
 *
 * Volver a la lectura fantasma es este único número.
 */
export const FRAGMENT_COLOR = '#3C3C38'
/** Partículas grandes desenfocadas. Ver `BOKEH_*`. */
export const BOKEH_COLOR = '#B9B9B4'

// ── El piso ────────────────────────────────────────────────────────────────

/**
 * Altura de la cara superior del papel. El logo está centrado en el origen, así
 * que su borde inferior cae en `-LOGO_BOX_WORLD / 2`; el papel va 0,72 más
 * abajo para que el objeto FLOTE sobre él y la sombra se despegue.
 *
 * ⚠️ **Ese 0,72 no es estético y no se puede achicar sin cambiar otra cosa.**
 * S6 lo revisó, porque "el logo tiene que apoyar en el piso" pedía justamente
 * eso, y el número está tomado por abajo:
 *
 * - El keyframe más bajo del recorrido deja la cámara en **−3,50** (y el rango
 *   del slider llega a −3,90), contra un piso en **−4,304**.
 * - Encima de eso, el offset de mouse mueve la altura ±`0,045 × distancia ×
 *   escala`, que a la distancia de ese keyframe (6,3) y con el multiplicador en
 *   1 son ±0,28.
 *
 * O sea que la holgura real entre la cámara más baja y el papel es de ~0,12.
 * Subir el piso para que el logo apoye mete a la cámara ABAJO de la hoja en el
 * tramo de Demos, donde no hay escena. **Bajar el logo tampoco sirve**: la
 * órbita y el encuadre están centrados en el origen, así que correrlo
 * descentraría el pivote y el objeto se bambolearía en cuadro al girar.
 *
 * Así que el apoyo se resuelve donde se ve y no donde se mide: con la **oclusión
 * de contacto** (`probeLighting.ts`), que es lo que le dice al ojo que el objeto
 * pertenece al piso. Si igual se quiere el contacto geométrico, es un sprint con
 * tres números atados — este, el mínimo del slider de altura y el keyframe de
 * Demos — y no un cambio suelto.
 */
export const FLOOR_Y = -LOGO_BOX_WORLD / 2 - 0.72

/**
 * ── EL CICLORAMA (S4) ──────────────────────────────────────────────────────
 *
 * El disco plano de radio 110 se partió en dos piezas: una **losa plana con
 * espesor** hasta el radio 34, y un **ciclorama** que arranca ahí y curva hacia
 * arriba hasta convertirse en pared, como la cove de un estudio real.
 *
 * **Por qué.** Un disco plano, por grande que sea, termina en un borde, y ese
 * borde se lee como una línea de horizonte dura. Un ciclorama no tiene ese
 * borde: el piso se convierte en fondo sin transición.
 *
 * Sigue siendo una **superficie de revolución**, así que se conservan las dos
 * propiedades por las que el disco había reemplazado al cuadrado: no tiene
 * esquinas que entren en cuadro al abrir la vista más de 45°, y el fondo es
 * idéntico en todos los ángulos de la órbita.
 *
 * **La geometría, y por qué estos números.** El arco arranca TANGENTE al piso:
 * su centro está en (`FLOOR_RADIUS`, `CYC_COVE_RADIUS`), o sea justo encima del
 * punto donde empieza, y por eso el radio en ese punto es vertical y la tangente
 * horizontal. Empalme con normales coincidentes = costura invisible, sin
 * solape y sin z-fighting.
 *
 * **La altura de la pared no es capricho.** El peor caso del recorrido es el
 * keyframe "demos · giro ¾": cámara a altura −3,50 y distancia 6,3, mirando
 * HACIA ARRIBA. Con medio campo vertical de 17,5° el rayo superior del cuadro
 * sale a ~46,6° y, para cuando llega al borde opuesto (a 82 unidades de
 * distancia horizontal), va **~88 unidades por encima del piso**. Con el disco
 * de hoy ahí se vería el vacío. En un lathe la altura es gratis —dos triángulos
 * por segmento radial—, así que la pared sube a 150 y sobra margen para
 * cualquier pose que se componga después.
 */
export const FLOOR_RADIUS = 34
export const FLOOR_SEGMENTS = 128
export const FLOOR_THICKNESS = 0.14
/** Radio del cuarto de arco que sube del piso a la pared. */
export const CYC_COVE_RADIUS = 42
/** Alto total de la pared sobre el piso, medido desde `FLOOR_Y`. */
export const CYC_WALL_TOP = 150
/** Puntos del arco. 16 alcanza: es una curva enorme y suave, sin silueta cercana. */
export const CYC_COVE_STEPS = 16

/**
 * ── LAS MARCAS DE PISO ─────────────────────────────────────────────────────
 *
 * Las medidas y el armado del set completo viven en `floorMarks.ts`. Se movieron
 * ahí en S5, cuando el set pasó de "marcas de estudio" a **lenguaje de plano**:
 * a las esquinas de encuadre, las cruces de registro y las cintas se les
 * sumaron los ejes, dos cotas y una escala graduada. Son treinta líneas de
 * geometría con su porqué, y viven al lado del código que las arma.
 *
 * Acá quedan los colores, que son paleta: `MARK_COLOR`, `MARK_SOFT_COLOR` y
 * `MARK_TAPE_COLOR`, más arriba.
 */

// ── La cámara ──────────────────────────────────────────────────────────────

/**
 * FOV vertical. Más abierto que el `HERO_INBOX_CAMERA` (30) a propósito: acá la
 * escena tiene profundidad y el paralaje de las partículas depende de la
 * perspectiva. Con teleobjetivo el volumen se aplana.
 */
export const CAMERA_FOV = 35
export const CAMERA_NEAR = 0.1
// Tiene que cubrir el papel entero (FLOOR_SIZE/2 + la distancia de camara), o
// el far plane le vuelve a cortar el borde y reaparece el horizonte.
export const CAMERA_FAR = 400
/** Centro de la órbita: el centro del logo. El encuadre re-apunta desde ahí. */
export const ORBIT_TARGET_Y = 0

/**
 * Fracción del recorrido disponible que los controles de encuadre llegan a
 * usar. El resto es margen, y hace falta por dos motivos concretos:
 *
 * 1. **Perspectiva fuera de eje.** El cálculo del recorrido es lineal (cuánto
 *    entra de la caja del logo en el alto visible), pero la proyección no lo
 *    es: un objeto corrido al borde del cuadro se estira. Con la caja del logo
 *    (semiancho 3,43) y un paneo al máximo, el borde sale ~8% más afuera de lo
 *    que predice la cuenta lineal.
 * 2. Sin margen, "pegado al costado" sería "tocando el borde", y el logo
 *    quedaría cortado al mínimo cambio de aspecto de la ventana.
 *
 * 0,88 cubre el 8% con algo de aire: en ±1 el logo queda contra el costado, con
 * una franja de papel visible, y adentro de cuadro en todo el rango.
 */
export const FRAME_TRAVEL_SAFETY = 0.88
/** Vuelta completa en 15 s. */
export const AUTO_ORBIT_DEG_PER_S = 24

// ── Las luces ──────────────────────────────────────────────────────────────

/**
 * **Se fueron a `probeLighting.ts` en S6.** Dejaron de ser tres constantes de
 * posición para ser un sistema con reglas propias: un rig de tres puntos donde
 * la principal y el relleno son del ESPACIO (fijos al mundo, así que orbitar
 * cambia la iluminación) y el contraluz es del OBSERVADOR (solidario a la
 * cámara en azimut y en altura, así que el filo existe en toda la órbita).
 *
 * Ahí viven también la niebla, la sombra y la oclusión de contacto. La curva que
 * sube y baja el nivel general a lo largo del recorrido es `LIGHT_ARC`, en
 * `choreography.ts`, junto al resto de lo que se calibra.
 */

// ── Geometría instanciada ───────────────────────────────────────────────────

/**
 * Una caja con posición, tamaño, giro y color propios, para dibujarse junto a
 * muchas otras en un solo draw call (ver `InstancedBars.tsx`).
 *
 * **Es el vocabulario compartido de casi toda la escena nueva.** Las marcas de
 * piso, los planos suspendidos, la retícula del techo y los pilares son todos
 * cajas: cambia la escala, el giro y el tono, no la forma. Una sola primitiva
 * para las cuatro familias es lo que hace que cada una cueste un draw call en
 * vez de uno por pieza.
 *
 * `rotation` se interpreta en orden **YXZ**: primero el azimut, y la
 * inclinación DESPUÉS, adentro del marco ya girado. Con el XYZ que three usa
 * por default, la inclinación se aplicaría sobre el eje X del padre y cada
 * pieza se inclinaría en una dirección distinta según su azimut — el mismo
 * problema que los softboxes de S4 resolvían con dos grupos anidados.
 */
export type BarPlacement = {
  readonly position: readonly [number, number, number]
  readonly scale: readonly [number, number, number]
  readonly rotation?: readonly [number, number, number]
  readonly color: string
}

// ── El espacio arquitectónico (S5) ──────────────────────────────────────────

/**
 * Los planos suspendidos, la retícula aérea y los pilares viven en
 * `probeArchitecture.ts`.
 *
 * **Reemplazan a los softboxes de S4.** La idea que se conserva es la del panel
 * suspendido —masa de tamaño conocido a media distancia, que genera paralaje y
 * tapa cosas al orbitar, que es la señal de profundidad más fuerte que hay—; lo
 * que se va es la referencia al estudio de fotos. Un softbox tiene marco, tela y
 * una razón de ser: iluminar. Un plano arquitectónico no explica nada, solo
 * ocupa espacio con intención, que es lo que esta escena necesita.
 */

// ── Las partículas ─────────────────────────────────────────────────────────

/**
 * Los dos campos y los tres generadores de máscara viven en
 * `probeParticles.ts`. Se mudaron en S6, cuando el rediseño —**pocas y grandes
 * en vez de muchas y chicas**— los convirtió en una decisión con sus cuentas en
 * vez de dos bloques de constantes.
 *
 * Acá queda solo su color: `BOKEH_COLOR`, más arriba, que es paleta.
 */

// ── Los fragmentos del logo (S4) ────────────────────────────────────────────

/**
 * Arcos sueltos flotando lejos: **las piezas de la marca que todavía no se
 * ensamblaron** (S5). **Es el único elemento de la escena que no podría estar en
 * el espacio de otro**: todo lo demás (piso, marcas, planos, polvo) es
 * vocabulario genérico; esto es lo que la hace de develOP.
 *
 * Los radios salen del propio SVG: el `path` del logo está construido con dos
 * arcos, uno de 153 y otro de 257 unidades del viewBox de 1024. Escalados por
 * `PROBE_SVG_SCALE` dan 1,07 y 1,80 de mundo; acá van amplificados ~2,2× para
 * que se lean a la distancia a la que flotan. O sea: no son "unos arcos", son
 * LOS arcos de la marca.
 *
 * **Con moderación: tres.** Es un acento, no un motivo.
 */
export type FragmentPlacement = {
  /** Radio del anillo. */
  readonly ringRadius: number
  /** Grosor del trazo (radio del tubo). */
  readonly tube: number
  /** Porción del anillo que existe, en radianes. */
  readonly arc: number
  readonly position: readonly [number, number, number]
  readonly rotation: readonly [number, number, number]
}

export const LOGO_FRAGMENTS: readonly FragmentPlacement[] = [
  // El arco grande (257 → 1,80 × 2,2), atrás a la izquierda.
  {
    ringRadius: 3.96,
    tube: 0.34,
    arc: 2.35,
    position: [-24, 7.2, -18],
    rotation: [0.42, 0.9, -0.35],
  },
  // El chico (153 → 1,07 × 2,2), casi de canto, atrás a la derecha.
  {
    ringRadius: 2.36,
    tube: 0.28,
    arc: 3.1,
    position: [27, 4.4, -21],
    rotation: [-0.3, -0.6, 0.8],
  },
  // Uno intermedio, alto y adelante: el único que puede cruzarse con la cámara.
  {
    ringRadius: 3.2,
    tube: 0.31,
    arc: 1.7,
    position: [12, 9.5, 30],
    rotation: [1.1, 0.25, 0.55],
  },
]

export const FRAGMENT_RADIAL_SEGMENTS = 10
export const FRAGMENT_TUBULAR_SEGMENTS = 44

// ── Utilidades ─────────────────────────────────────────────────────────────

/** Recorte a [0,1]. Lo comparten los generadores de sprite y la curva de kelvin. */
export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

/**
 * Kelvin → sRGB (aproximación de Tanner Helland sobre la curva de cuerpo
 * negro). Suficiente para juzgar: da el vuelco naranja abajo de 3000 K y el
 * azul arriba de 7000 K, con 6500 K prácticamente blanco.
 *
 * Devuelve componentes 0..1 en espacio sRGB — hay que entregárselos a
 * `Color.setRGB(r, g, b, SRGBColorSpace)` para que three los convierta al
 * espacio de trabajo. Pasarlos como lineales lava el color.
 */
export function kelvinToSrgb(kelvin: number): { r: number; g: number; b: number } {
  const t = Math.min(40000, Math.max(1000, kelvin)) / 100

  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592)
  const g =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307

  return { r: clamp01(r / 255), g: clamp01(g / 255), b: clamp01(b / 255) }
}

/**
 * Mascara circular para las particulas, como RGBA crudo.
 *
 * `PointsMaterial` sin `map` dibuja CUADRADOS, y a corta distancia se leen como
 * artefactos de render en vez de motas de polvo (verificado en captura). Se
 * calcula a mano en vez de pintarla en un `<canvas>` porque asi la funcion es
 * pura: puede vivir en un `useMemo` sin violar `react-hooks/purity` ni tocar el
 * DOM.
 *
 * Blanca con alfa en degrade: el color de cada particula lo pone el atributo
 * de vertice, la textura solo aporta la forma.
 */

import { LOGO_BOX_WORLD } from '@/lib/logo-footprint'

/**
 * Constantes y matemática de la escena del probe. Un solo lugar para todos los
 * números que el sprint de coreografía va a querer mover.
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
/** Marcas de registro sobre el papel: `--color-ds-light-border`. */
export const MARK_COLOR = '#D7D7D5'
/** Marco exterior: más claro, se va hacia el fondo y no compite con el interior. */
export const MARK_SOFT_COLOR = '#E6E6E3'
/** Cintas de posición: más oscuras. Una cinta es cinta, no una línea trazada. */
export const MARK_TAPE_COLOR = '#CFCFCC'
/** Rebote del papel hacia arriba (piso del hemisférico). Cálido apenas. */
export const BOUNCE_COLOR = '#EDEAE3'
/** Cuerpo del softbox: apenas por encima del papel. */
export const SOFTBOX_COLOR = '#FCFCFA'
/** Marco del softbox: lo que hace que el panel se lea como un objeto y no como una mancha. */
export const SOFTBOX_FRAME_COLOR = '#DFDFDC'
/** Arcos sueltos del logo. Muy tenues: apenas separados del papel. */
export const FRAGMENT_COLOR = '#E2E2DF'
/** Partículas grandes desenfocadas. Ver `BOKEH_*`. */
export const BOKEH_COLOR = '#B9B9B4'

// ── El piso ────────────────────────────────────────────────────────────────

/**
 * Altura de la cara superior del papel. El logo está centrado en el origen, así
 * que su borde inferior cae en `-LOGO_BOX_WORLD / 2`; el papel va un poco más
 * abajo para que el objeto FLOTE sobre él y la sombra se despegue.
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
 * ── LAS MARCAS DE PISO (S4) ────────────────────────────────────────────────
 *
 * Las cuatro esquinas de registro pasaron a ser un **sistema de marcas de set**:
 * marco de encuadre, cruces y cintas de posición. El piso deja de estar vacío y
 * pasa a ser un lugar donde se trabaja — que es el lenguaje de precisión de la
 * dirección, y de paso multiplica los objetos de tamaño conocido apoyados en el
 * suelo, que es lo que da la lectura de perspectiva al orbitar.
 *
 * Las 32 barras van en **un solo `<instancedMesh>`**: un draw call, contra los
 * ocho que costaban las cuatro esquinas de antes.
 *
 * Tres tonos, por `instanceColor`, y cada uno dice algo distinto: el marco
 * interior y las cruces son línea fina de registro; el marco exterior es más
 * claro y se va hacia el fondo; las cintas son más anchas y más oscuras, porque
 * una cinta de piso es cinta y no una línea trazada.
 */
export const MARK_HEIGHT = 0.012
/** Semi-lado del cuadro interior. Encierra la huella del logo. */
export const MARK_SPAN = 4.7
export const MARK_LENGTH = 1.15
export const MARK_WIDTH = 0.05
/** Ticks a media cara del cuadro interior, apuntando hacia adentro. */
export const MARK_TICK_LENGTH = 0.5
/** Cruz de centro, debajo del logo. */
export const MARK_CENTER_ARM = 1
/** Dos cruces de registro en cuadrantes opuestos. */
export const MARK_CROSS_OFFSET = 3.1
export const MARK_CROSS_ARM = 0.62
/** Marco exterior: el doble de span, brazos más largos. Da una segunda escala. */
export const MARK_OUTER_SPAN = 9.4
export const MARK_OUTER_LENGTH = 1.9
/** Cintas de posición en T, donde se pararía alguien en un set. */
export const TAPE_RADIUS = 7.6
export const TAPE_WIDTH = 0.14
export const TAPE_BAR = 0.9
export const TAPE_STEM = 0.55
export const TAPE_AZIMUTHS_DEG: readonly number[] = [30, 150, 270]

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
 * Rig FIJO al mundo, no a la cámara. Es la decisión de diseño del probe y hay
 * que tenerla presente al mirar:
 *
 * Con las luces fijas, orbitar cambia la iluminación además del punto de vista
 * — que es exactamente lo que va a pasar en la escena final ("iluminación que
 * cambia en el recorrido") y lo que hace que los cuatro tramos puedan ser
 * distintos entre sí. Si la luz viajara con la cámara, todos los ángulos se
 * verían igual de bien y el probe daría un falso positivo.
 *
 * El costo es que confunde dos variables: un ángulo puede verse pobre por la
 * GEOMETRÍA o por quedar a contraluz. Para separarlas está el toggle "la luz
 * sigue a la cámara", que fija la relación luz-observador y deja sola a la
 * geometría bajo prueba.
 */
export const KEY_LIGHT_POSITION: readonly [number, number, number] = [-11, 12, 10]
/** Contraluz fijo: le da canto al logo cuando la cámara pasa por atrás. */
export const RIM_LIGHT_POSITION: readonly [number, number, number] = [10, 7, -15]
export const RIM_LIGHT_INTENSITY = 1.15
/** Cielo/piso del hemisférico: el papel rebotando hacia arriba. */
export const HEMI_INTENSITY = 1.5

/**
 * Cuando la luz sigue a la cámara: 3/4 clásico, arriba y a la izquierda del
 * observador.
 */
export const KEY_FOLLOW = { azimuthOffsetDeg: -38, height: 13, distance: 20 } as const

/** Ortográfica del shadow map. Cubre el logo y el largo de su sombra sobre el papel. */
export const SHADOW_ORTHO = 13
export const SHADOW_MAP_SIZE = 2048

// ── Los softboxes (S4) ──────────────────────────────────────────────────────

/**
 * Paneles rectangulares suspendidos alrededor del logo. Es lo que más espacio
 * aporta por menos costo: son objetos de tamaño y forma conocidos a media
 * distancia, así que al orbitar generan **paralaje y ocultamientos** — y un
 * ocultamiento es la señal de profundidad más fuerte que hay.
 *
 * **No brillan por sí mismos.** Van con `meshStandardMaterial`, no `basic`: la
 * regla del sprint es que nada se ilumine solo, y además así se apagan con la
 * sala cuando la luz muere en el cierre. Lo que los hace "apenas más luminosos
 * que el fondo" es el color, medio punto por encima del papel, no una emisión.
 *
 * **Dos de los tres están donde están las luces**: el primero en el azimut de
 * `KEY_LIGHT_POSITION` (−48°), el segundo en el de `RIM_LIGHT_POSITION` (146°).
 * No es decorativo — hace que la escena EXPLIQUE su propia iluminación, que es
 * exactamente lo que un estudio deja ver.
 *
 * `tiltDeg` positivo = el panel mira hacia abajo. El de arriba apunta al logo,
 * el de abajo apunta apenas hacia arriba.
 */
export type SoftboxPlacement = {
  readonly azimuthDeg: number
  readonly radius: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly tiltDeg: number
}

export const SOFTBOXES: readonly SoftboxPlacement[] = [
  // El key: alto, vertical, inclinado hacia el logo.
  { azimuthDeg: -48, radius: 12.6, y: 6.4, width: 5.4, height: 7.6, tiltDeg: 18 },
  // El contraluz: apaisado, a media altura, casi de canto.
  { azimuthDeg: 146, radius: 13.8, y: 3.2, width: 8.6, height: 5, tiltDeg: 8 },
  // Un panel bajo, casi apoyado en el piso: es el que ancla la escala.
  { azimuthDeg: 62, radius: 10.4, y: -0.9, width: 4.6, height: 6.4, tiltDeg: -6 },
]

/** Cuánto asoma el marco por detrás del cuerpo, en unidades de mundo. */
export const SOFTBOX_FRAME_MARGIN = 0.16

// ── Las partículas ─────────────────────────────────────────────────────────

/**
 * Se reserva el buffer del máximo una sola vez y el slider mueve el
 * `drawRange`. Cambiar la cantidad no reasigna ni recalcula nada.
 */
export const PARTICLES_MAX = 4000
/**
 * Media esfera de radio `PARTICLE_R_MIN..PARTICLE_R_MAX` alrededor del logo,
 * recortada por el papel. El mínimo deja libre el volumen del logo; el máximo
 * pasa la órbita más lejana (30), así que siempre hay partículas MÁS CERCA y
 * MÁS LEJOS que la cámara — que es la condición para que haya paralaje real
 * entre ellas y no una calcomanía de fondo.
 */
export const PARTICLE_R_MIN = 5
export const PARTICLE_R_MAX = 34
export const PARTICLE_SIZE = 0.055
/** Cerca oscuras, lejos claras: perspectiva atmosférica sobre papel blanco. */
export const PARTICLE_NEAR_COLOR = '#6E6E6B'
export const PARTICLE_FAR_COLOR = '#C9C9C6'
/** Semilla fija: el campo es idéntico en cada carga, así dos capturas se comparan. */
export const PARTICLE_SEED = 0x5eed1a

// ── La segunda escala de partículas (S4) ────────────────────────────────────

/**
 * Pocas partículas **grandes y desenfocadas**, cerca de la cámara. El desenfoque
 * es lo que más profundidad da por menos polígonos: no hay forma más barata de
 * decirle al ojo "esto está adelante del plano de foco" que un disco blando.
 *
 * **Van fijas al mundo, no pegadas a la cámara.** Pegadas al lente serían una
 * calcomanía que no se mueve: fijas al mundo barren rápido al orbitar, que es
 * de dónde sale la sensación de volumen.
 *
 * El §7.8 del reporte del probe anotaba como defecto que "a distancias cortas
 * alguna partícula pasa a menos de dos unidades de la cámara y se lee como un
 * disco grande". **Acá eso es el efecto, deliberado.**
 *
 * `BOKEH_R_MIN` y `BOKEH_SIZE` son la perilla de costo: son sprites grandes y
 * transparentes, o sea el único overdraw nuevo de esta escena. Con 4,2 y 1,0 un
 * sprite en el radio mínimo ocupa ~38% del alto del cuadro. Subir el tamaño o
 * bajar el radio mínimo lo multiplica rápido.
 */
export const BOKEH_COUNT = 70
export const BOKEH_R_MIN = 4.2
export const BOKEH_R_MAX = 30
/**
 * Exponente de la distribución radial. Por debajo de 1 carga el campo hacia la
 * cámara — que es donde el desenfoque se ve. Uniforme en volumen (r³) dejaría
 * casi todas lejos, justo donde no sirven.
 */
export const BOKEH_RADIUS_BIAS = 0.85
export const BOKEH_SIZE = 1
export const BOKEH_OPACITY = 0.14
/** Semilla propia: no puede compartir la del polvo o los dos campos coincidirían. */
export const BOKEH_SEED = 0xb04e12
export const BOKEH_SPRITE_SIZE = 64

// ── Los fragmentos del logo (S4) ────────────────────────────────────────────

/**
 * Arcos sueltos flotando lejos, muy tenues. **Es el único elemento de la escena
 * que no podría estar en el estudio de otro**: todo lo demás (papel, marcas,
 * softboxes, polvo) es genérico de un set; esto es lo que la hace de develOP.
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

function clamp01(value: number): number {
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
export function createDotSpriteData(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      // Borde suave en el ultimo 25% del radio: sin eso el disco aliasa igual
      // que el cuadrado que vino a reemplazar.
      const alpha = clamp01((1 - distance) / 0.25)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }

  return data
}

export const PARTICLE_SPRITE_SIZE = 64

/**
 * La forma de una particula DESENFOCADA.
 *
 * Difiere del sprite de polvo en una sola cosa, y es la que importa: el polvo
 * es opaco en el centro y se ablanda en el ultimo 25% del radio; este se ablanda
 * en el 55% exterior y deja una meseta plana adentro. Esa meseta es lo que
 * distingue un disco fuera de foco de una mancha gaussiana — un lente
 * desenfocado reparte la luz de un punto sobre un DISCO, no sobre una campana.
 *
 * Pura, igual que la otra: puede vivir en un `useMemo` sin violar
 * `react-hooks/purity`.
 */
export function createBokehSpriteData(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4)
  const center = (size - 1) / 2
  const radius = size / 2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x - center) / radius
      const dy = (y - center) / radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      const alpha = clamp01((1 - distance) / 0.55)
      const i = (y * size + x) * 4
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = Math.round(alpha * 255)
    }
  }

  return data
}

/**
 * PRNG determinista (mulberry32). `Math.random()` no puede ir en un `useMemo`
 * —la regla `react-hooks/purity` lo prohíbe, y con razón: el render dejaría de
 * ser puro— y además un campo de partículas irrepetible haría incomparables dos
 * capturas del mismo ángulo.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let x = Math.imul(state ^ (state >>> 15), 1 | state)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * EL BANCO DE MEDICIÓN DE B4 — LOS SIETE PERFILES, COMO DATO.
 *
 * Los tres frentes de la Fase 1 miden sobre ESTE archivo o sus números no se
 * pueden comparar entre sí. Un frente que emula «375 de ancho» a ojo y otro que
 * emula «un iPhone» producen dos tablas que parecen la misma y no lo son.
 *
 * ── ⚠️ TODO LO DE ACÁ ES EMULADO, Y ESA PALABRA ES LITERAL ────────────────
 *
 * Un perfil es un **viewport de layout y un modelo de entrada**, aplicados con
 * `Emulation.setDeviceMetricsOverride` sobre el Chrome de esta máquina. No es un
 * teléfono. Lo que un perfil NO reproduce, y hay que tenerlo escrito porque es
 * exactamente lo que un lector apurado va a suponer que sí:
 *
 *   · **El motor.** Abajo corre Blink. Un iPhone corre WebKit. Nada de lo que
 *     dependa del motor —la resolución de `svh` cuando la barra del navegador
 *     entra y sale, el momento en que se dispara `scroll`, el redondeo
 *     subpíxel del texto— se está midiendo acá.
 *   · **El `devicePixelRatio`.** Los siete perfiles van en **1**. El SE real es
 *     2 y el 15 real es 3. Es la regla de `MEDICION-NAVEGADOR.md` §1 paso 2 y
 *     no se afloja: con `x2` la captura pesa cuatro veces y el canvas 3D cambia
 *     su resolución de render, con lo cual ninguna cifra tomada de la captura
 *     sería comparable con las de `x1` que este proyecto ya publicó. La
 *     consecuencia es que **la nitidez del glifo y el costo de GPU no se
 *     miden**; el layout sí, y el layout es lo que estos frentes vienen a ver.
 *   · **La GPU y la térmica.** Una caída de cuadros de un teléfono real que
 *     baja de reloj no aparece en ningún número de este banco.
 *
 * ── ⚠️ Y POR QUÉ NINGÚN PERFIL PISA EL `userAgent` ────────────────────────
 *
 * Porque sería el modo de falla de arriba, pero disfrazado. Poner el UA de
 * Safari sobre Blink produce una página que **dice** ser WebKit y no lo es, y
 * el lector del reporte no tiene cómo detectarlo. El banco emula el viewport y
 * el modelo de puntero —`mobile` y `touch` en la cadena de `emulate`—, que es lo
 * único que cambia lo que la página hace.
 *
 * Y no cambia lo que se sirve, lo cual está verificado contra el fuente y no
 * supuesto: `_lib/compuerta.ts` dice, textual, «**Por ancho, no por táctil.** No
 * a `(hover: none)`, no a `(pointer: coarse)`, no al user-agent». La compuerta
 * de 1025 responde al ancho del viewport y a nada más.
 */

/** Los presets de estrangulamiento que ofrece `emulate` de `chrome-devtools-mcp`. */
export type CondicionDeRed = 'Offline' | 'Slow 3G' | 'Fast 3G' | 'Slow 4G' | 'Fast 4G'

export interface Perfil {
  /** Va en el nombre del archivo de captura. Sin espacios, sin acentos. */
  readonly id: string
  /** Lo que se escribe en una tabla del reporte. */
  readonly nombre: string
  /** De dónde sale el tamaño. Un perfil sin procedencia es un número inventado. */
  readonly procedencia: string
  readonly ancho: number
  readonly alto: number
  /** Siempre 1. Ver el docblock del archivo. */
  readonly dpr: 1
  /** `mobile` en la cadena de `emulate`: cambia cómo se resuelve el viewport visual. */
  readonly movil: boolean
  /** `touch` en la cadena de `emulate`: `pointer: coarse` y `hover: none`. */
  readonly tactil: boolean
  /** `< 1025`, o sea del lado donde no hay escenario ni coreografía. */
  readonly debajoDelUmbral: boolean
}

/**
 * La cadena exacta que se le pasa a `emulate` en `viewport`. Se deriva y no se
 * escribe: un perfil cuyo `ancho` y cuya cadena se pudieran desincronizar sería
 * un perfil que miente sobre lo que midió.
 */
export function cadenaDeViewport(p: Perfil): string {
  const banderas = [p.movil ? 'mobile' : null, p.tactil ? 'touch' : null].filter(
    (b): b is string => b !== null,
  )
  return [`${p.ancho}x${p.alto}x${p.dpr}`, ...banderas].join(',')
}

/**
 * LOS SIETE. El orden es de menor a mayor ancho, que es el orden en el que se
 * cruza la compuerta.
 *
 * ⚠️ **`1024` y `1025` comparten el alto A PROPÓSITO.** Son el par que straddlea
 * el umbral de `ESCENARIO_MIN_ANCHO_PX`, y si además cambiara el alto, cualquier
 * diferencia entre los dos tendría dos causas posibles y ninguna medición podría
 * atribuirla. Con el alto clavado, **la única variable es el ancho**, que es lo
 * que la compuerta lee.
 *
 * ⚠️ **`ipad` va en retrato (768×1024) y no en apaisado.** En apaisado un iPad
 * mide 1024 de ancho y cae del lado de `1024`, que ya está en la tabla: sería el
 * mismo perfil dos veces. El retrato es el que agrega un ancho que ningún otro
 * perfil cubre.
 */
export const PERFILES: readonly Perfil[] = [
  {
    id: '375',
    nombre: 'iPhone SE',
    procedencia:
      'viewport de layout del iPhone SE (2.ª y 3.ª gen), 375×667 CSS px. Es además `--fluido-piso`, el ancla de abajo de la banda tipográfica del sistema.',
    ancho: 375,
    alto: 667,
    dpr: 1,
    movil: true,
    tactil: true,
    debajoDelUmbral: true,
  },
  {
    id: '393',
    nombre: 'iPhone 15',
    procedencia: 'viewport de layout del iPhone 15, 393×852 CSS px.',
    ancho: 393,
    alto: 852,
    dpr: 1,
    movil: true,
    tactil: true,
    debajoDelUmbral: true,
  },
  {
    id: '768',
    nombre: 'iPad (retrato)',
    procedencia: 'viewport de layout del iPad mini / iPad 9.ª gen en retrato, 768×1024 CSS px.',
    ancho: 768,
    alto: 1024,
    dpr: 1,
    movil: true,
    tactil: true,
    debajoDelUmbral: true,
  },
  {
    id: '1024',
    nombre: '1024 — justo abajo del umbral',
    procedencia:
      'un píxel abajo de `ESCENARIO_MIN_ANCHO_PX` (1025). El alto 768 es el del iPad apaisado y está clavado igual que el de `1025`.',
    ancho: 1024,
    alto: 768,
    dpr: 1,
    movil: false,
    tactil: false,
    debajoDelUmbral: true,
  },
  {
    id: '1025',
    nombre: '1025 — justo arriba del umbral',
    procedencia:
      '`ESCENARIO_MIN_ANCHO_PX` exacto, que es donde la compuerta abre. Mismo alto que `1024` para que la única variable sea el ancho.',
    ancho: 1025,
    alto: 768,
    dpr: 1,
    movil: false,
    tactil: false,
    debajoDelUmbral: false,
  },
  {
    id: '1440',
    nombre: '1440',
    procedencia:
      'el ancho donde el proyecto define el ritmo (`MEDICION-NAVEGADOR.md` §1). Es además `--fluido-techo`, el ancla de arriba de la banda tipográfica.',
    ancho: 1440,
    alto: 900,
    dpr: 1,
    movil: false,
    tactil: false,
    debajoDelUmbral: false,
  },
  {
    id: '1920',
    nombre: '1920',
    procedencia:
      'el ancho de las capturas del reporte (`MEDICION-NAVEGADOR.md` §1), y el ancho en el que B1 y B2 publicaron sus tablas. Es además `--container-tope`.',
    ancho: 1920,
    alto: 1080,
    dpr: 1,
    movil: false,
    tactil: false,
    debajoDelUmbral: false,
  },
]

/** El umbral, repetido acá para que este archivo se pueda leer solo. Lo custodia `banco.invariant.ts` contra `_lib/compuerta.ts`. */
export const UMBRAL_DEL_ESCENARIO_PX = 1025

export function perfilPorId(id: string): Perfil {
  const p = PERFILES.find((x) => x.id === id)
  if (p === undefined) throw new Error(`perfil desconocido: ${id}`)
  return p
}

/** Los cuatro de abajo del umbral, que son el scope del frente B. */
export const PERFILES_DEBAJO_DEL_UMBRAL: readonly Perfil[] = PERFILES.filter((p) => p.debajoDelUmbral)

/**
 * EL ESTRANGULAMIENTO, que es un EJE APARTE del viewport y no una propiedad suya.
 *
 * ⚠️ **Sólo el frente A (rendimiento) estrangula.** Los frentes B y C miden
 * layout, scroll y píxel: con la CPU a 1/4 una medición de scroll se vuelve
 * lenta y —peor— empieza a depender de cuándo el motor alcanzó a pintar, que es
 * ruido que no describe al sitio. Layout y captura corren **sin estrangular**, y
 * eso se declara en cada tabla.
 *
 * ⚠️ **Y son los presets del panel de DevTools, no los de Lighthouse.** Lo que
 * Lighthouse llama «mobile» es 1,6 Mbps de bajada con 150 ms de RTT y la CPU a
 * 4×; `emulate` de esta herramienta sólo ofrece la lista de abajo. Se toma el
 * preset más cercano y **se declara cuál se usó**, que es lo que permite que
 * alguien lo repita.
 */
export interface Estrangulamiento {
  readonly id: 'movil' | 'escritorio' | 'ninguno'
  /** El nombre del preset del panel de DevTools al que corresponde. `null` = sin estrangular. */
  readonly red: CondicionDeRed | null
  /** Latencia agregada, en ms. Va tal cual a `Network.emulateNetworkConditions`. */
  readonly latenciaMs: number
  /** Bajada en BYTES por segundo, que es la unidad del protocolo (no bits). */
  readonly bajadaBps: number
  readonly subidaBps: number
  /** Factor de ralentización de CPU. 1 = sin estrangular. */
  readonly cpu: number
  readonly equivalencia: string
}

/**
 * ⚠️ **Los números están ESCRITOS, no nombrados.** Un reporte que dice «se midió
 * con Slow 4G» no se puede repetir: el preset del panel cambió de nombre y de
 * valores más de una vez —lo que hoy es «Slow 4G» era «Fast 3G»—. Lo que se
 * declara es la terna que se le pasó al protocolo.
 */
export const ESTRANGULAMIENTOS: readonly Estrangulamiento[] = [
  {
    id: 'movil',
    red: 'Slow 4G',
    latenciaMs: 562.5,
    bajadaBps: 204_800,
    subidaBps: 96_000,
    cpu: 4,
    equivalencia:
      'aproxima el preset «mobile» de Lighthouse (1,6 Mbps de bajada, 150 ms de RTT, CPU 4×). El 4× de CPU es exacto y la bajada coincide; la LATENCIA es la del preset del panel (562,5 ms) y es casi cuatro veces la de Lighthouse, así que toda cifra de carga móvil de este bloque es CONSERVADORA — el sitio real carga más rápido que esto, no más lento.',
  },
  {
    id: 'escritorio',
    red: 'Fast 4G',
    latenciaMs: 85,
    bajadaBps: 1_125_000,
    subidaBps: 187_500,
    cpu: 1,
    equivalencia:
      'aproxima el preset «desktop» de Lighthouse (10 Mbps de bajada, 40 ms de RTT, CPU 1×). El 1× de CPU es exacto; la red es más lenta que la de Lighthouse en las dos variables, así que también es conservadora.',
  },
  {
    id: 'ninguno',
    red: null,
    latenciaMs: 0,
    bajadaBps: -1,
    subidaBps: -1,
    cpu: 1,
    equivalencia:
      'sin estrangular (`-1` es «sin límite» en el protocolo). Es el modo de los frentes B y C: layout, scroll y píxel, donde estrangular agregaría ruido que no describe al sitio.',
  },
]

export function estrangulamientoPorId(id: Estrangulamiento['id']): Estrangulamiento {
  const e = ESTRANGULAMIENTOS.find((x) => x.id === id)
  if (e === undefined) throw new Error(`estrangulamiento desconocido: ${id}`)
  return e
}

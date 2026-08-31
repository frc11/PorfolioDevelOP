/**
 * LOS LARGOS DE SITIO-S8 — lo propio se afirma, lo heredado se publica y se
 * vigila.
 *
 * ⚠ **Este archivo existe por la regla 13 del proyecto**, y por un hallazgo de
 * este mismo sprint. La primera versión de la comprobación de las 300 líneas
 * miraba sólo los enchufes y los entregables declarados; extenderla a todo lo
 * que los frentes dejaron en disco la puso **en rojo por seis archivos que este
 * sprint no escribió y tiene PROHIBIDO tocar**.
 *
 * Esos seis son la deuda de §7.13 de `DIRECCION-ESCENA.md`, que llegó con la
 * mudanza: los archivos se movieron de `probe-escena/_components/` a
 * `_lib/escena/` **sin cambiar una línea que no fuera un import** —verificado
 * contra los blobs de `HEAD`— así que sus largos son los de siempre. Partirlos
 * es reescribirlos, y la instrucción del sprint lo prohíbe explícitamente:
 * *mudar no es reescribir, ni un valor cambia*. Además §7.13 ya decidió que los
 * tres principales van **juntos, en un sprint de limpieza**, porque `lightRig`
 * y `OrbitRig` son las dos mitades de un frame y `probeStore` es el contrato
 * entre el panel y ese loop.
 *
 * **Un check puesto a fallar por algo que su sprint no produce ni puede
 * arreglar no protege: entrena a ignorarlo.** Así que se parte en dos:
 *
 *   · **lo propio** —lo que S8 escribió— se AFIRMA contra las 300 líneas;
 *   · **lo heredado** se PUBLICA con atribución y se VIGILA con una línea de
 *     base de regresión, que no es un objetivo: existe para que la deuda no
 *     engorde en silencio mientras se espera al sprint de limpieza.
 *
 * ── Por qué la vigilancia es «≤ el largo declarado» y no «= el declarado» ──
 *
 * Porque las dos direcciones tienen que comportarse distinto. Si alguien
 * AGRANDA uno, falla: la deuda creció. Si alguien lo PARTE, el archivo baja de
 * 300, sale de la tabla por su cuenta y no falla — que es exactamente lo que
 * tiene que pasar el día que el sprint de limpieza haga su trabajo. Una
 * igualdad exacta pondría en rojo al que pague la deuda.
 */

/**
 * ⚠️ **DEUDA HEREDADA, NO DE ESTE SPRINT.** Los seis archivos de la escena que
 * ya pasaban las 300 líneas antes de la mudanza, con el largo con el que
 * llegaron. La atribución está en §7.13 de `DIRECCION-ESCENA.md`, que los
 * describe —y hay que decirlo— con su ruta VIEJA: la mudanza de S8 los cambió
 * de carpeta y esa parte del pendiente quedó vencida.
 *
 * Los tres que §7.13 nombra por su nombre son `OrbitRig`, `probeStore` y
 * `lightRig`; los otros tres (`choreography`, `probeScene`, `probeMoire`) el
 * mismo pendiente los declara como «heredados sin delta» y los deja entrar al
 * mismo sprint de limpieza.
 */
export const LARGOS_HEREDADOS: Readonly<Record<string, number>> = {
  'src/app/v3/_lib/escena/OrbitRig.tsx': 651,
  'src/app/v3/_lib/escena/choreography.ts': 462,
  'src/app/v3/_lib/escena/probeStore.ts': 406,
  'src/app/v3/_lib/escena/lightRig.ts': 357,
  'src/app/v3/_lib/escena/probeScene.ts': 348,
  'src/app/v3/_lib/escena/probeMoire.ts': 300,
}

/** El límite del repo. Una sola definición. */
export const LIMITE_DE_LINEAS = 300

export interface Largo {
  readonly archivo: string
  readonly lineas: number
}

export interface Reparto {
  /** Lo que S8 escribió. Se afirma contra el límite. */
  readonly propios: readonly Largo[]
  /** Lo que llegó con la mudanza. Se publica y se vigila. */
  readonly heredados: readonly Largo[]
}

/**
 * Cuántas líneas tiene un texto — **las mismas que cuenta `wc -l`**.
 *
 * ⚠ `split('\n').length` NO es la cuenta de líneas: un archivo que termina en
 * salto —o sea todos— deja un elemento vacío al final, así que el número sale
 * uno de más. Con el límite en 300 eso lo vuelve 299 en la práctica, y el
 * primer archivo que quedó justo en el borde lo destapó: se reportaba `301` un
 * archivo de 300 líneas. Se corrige la MEDICIÓN, que estaba mal por uno; el
 * límite no se toca. Es la misma cuenta que `s6-lane` declara —«cuenta SALTOS
 * igual que `wc`»—, así que además deja de haber dos varas en el repo.
 */
export function contarLineas(texto: string): number {
  const partes = texto.split('\n')
  return partes.length > 0 && partes[partes.length - 1] === '' ? partes.length - 1 : partes.length
}

/** Mide los `.ts`/`.tsx` de una lista de rutas que existan en disco. */
export function medirLargos(
  rutas: readonly string[],
  existe: (a: string) => boolean,
  leer: (a: string) => string,
): Largo[] {
  return [...new Set(rutas)]
    .filter((a) => /\.tsx?$/.test(a) && existe(a))
    .sort()
    .map((archivo) => ({ archivo, lineas: contarLineas(leer(archivo)) }))
}

/** Parte una lista de archivos medidos en lo propio y lo heredado. */
export function repartir(medidos: readonly Largo[]): Reparto {
  return {
    propios: medidos.filter((m) => !(m.archivo in LARGOS_HEREDADOS)),
    heredados: medidos.filter((m) => m.archivo in LARGOS_HEREDADOS),
  }
}

/** Los propios que pasan el límite. Vacío o el invariante falla. */
export function propiosQuePasan(reparto: Reparto): string[] {
  return reparto.propios
    .filter((m) => m.lineas > LIMITE_DE_LINEAS)
    .map((m) => `${m.archivo}:${m.lineas}`)
}

/**
 * Los heredados que ENGORDARON contra su línea de base, y los que aparecieron
 * sin estar declarados. Las dos cosas son la misma falla —la deuda creció— y
 * por eso salen juntas.
 */
export function heredadosQueCrecieron(medidos: readonly Largo[]): string[] {
  const crecidos = medidos
    .filter((m) => m.archivo in LARGOS_HEREDADOS && m.lineas > LARGOS_HEREDADOS[m.archivo])
    .map((m) => `${m.archivo}:${m.lineas} (base ${LARGOS_HEREDADOS[m.archivo]})`)
  const nuevos = medidos
    .filter((m) => m.lineas > LIMITE_DE_LINEAS && !(m.archivo in LARGOS_HEREDADOS))
    .map((m) => `${m.archivo}:${m.lineas} (sin declarar)`)
  return [...crecidos, ...nuevos].sort()
}

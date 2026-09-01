/**
 * Corrida M0/G — GENERADOR del índice de la galería de estados.
 *
 * Por qué existe: hasta la corrida G el índice declaraba su total A MANO
 * («37 estados enumerados, 37 alcanzados») y ese número dejó de coincidir con su
 * propia tabla. Un índice que miente sobre cuánto cubre es peor que no tenerlo:
 * el manual de usuario cita estas capturas capítulo por capítulo, así que un
 * conteo inflado se lee como cobertura que no existe.
 *
 * Ahora el conteo, las dimensiones y el cruce salen del DIRECTORIO de capturas:
 *   · el catálogo de abajo describe cada estado (tramo, pantalla, cómo se llega);
 *   · los `.png` reales de `docs/manual-usuario/galeria/png/` son la evidencia;
 *   · el cruce marca HUECOS (catalogado y sin foto) y RESIDUOS (foto sin entrada
 *     en el catálogo — típicamente un estado retirado cuyo png quedó de una
 *     corrida vieja).
 * Nada de eso se puede escribir a mano en el markdown: se regenera.
 *
 * Las dimensiones se leen del header IHDR del PNG (bytes 16..23), no de una
 * librería: alcanzan para lo que se publica acá — el alto real de cada captura,
 * que es lo que permite ver de un vistazo si una pantalla larga entró entera.
 *
 * OJO con la tentación de inferir recortes desde acá: un alto igual al del
 * viewport NO prueba recorte (hay pantallas que sí entran en una pantalla), y la
 * primera versión de este script marcaba ocho falsos positivos por eso. Lo que
 * prueba que ninguna quedó cortada se mide contra el DOM ANTES de disparar, en
 * `tests/galeria/captura.spec.ts` (`ajustarYVerificar`): el portal no scrollea el
 * documento sino un `<main>` interno, así que `fullPage: true` por sí solo no
 * alcanza y la aserción del desborde es la garantía real.
 *
 * Uso: npx tsx scripts/dev/m0-galeria-indice.ts
 */
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DIR_GALERIA = path.join('docs', 'manual-usuario', 'galeria')
const DIR_PNG = path.join(DIR_GALERIA, 'png')
const SALIDA = path.join(DIR_GALERIA, 'INDICE.md')

/** Alto de los dos viewports de captura — un png con ESTE alto exacto es sospechoso. */
const ALTO_VIEWPORT = { desktop: 900, mobile: 844 }

type Modo = 'directo' | 'flujo' | 'interacción'

type EntradaDoc = {
  /** Nombre del archivo SIN `.png` (el mismo del sembrador y de la captura). */
  archivo: string
  tramo: string
  titulo: string
  /** Pantalla del registro `PANTALLAS`, o la ruta cuando no es del manual. */
  pantalla: string
  comoSeLlega: string
  modo: Modo
}

const TRAMOS = [
  'Ficha y Evaluación',
  'Opener y Seguimiento',
  'Brief',
  'Construcción',
  'Borrador, Chequeo y Revisión',
  'Re-loop',
  'Envío',
  'Agenda',
  'Terminal',
  'Panel de inicio',
] as const

const CATALOGO: EntradaDoc[] = [
  // ── Ficha y Evaluación ────────────────────────────────────────────────────
  {
    archivo: '01-m1-ficha-vacia',
    tramo: 'Ficha y Evaluación',
    titulo: 'm1 ficha vacía',
    pantalla: 'm1',
    comoSeLlega: 'Te asignan un negocio nuevo y todavía no cargaste nada de la ficha.',
    modo: 'directo',
  },
  {
    archivo: '02-m1-ficha-cargada',
    tramo: 'Ficha y Evaluación',
    titulo: 'm1 ficha cargada',
    pantalla: 'm1',
    comoSeLlega: 'Ya cargaste la ficha y volvés a mirarla — queda navegable, no se resetea.',
    modo: 'directo',
  },
  {
    archivo: '04-m1-veredicto-registrado',
    tramo: 'Ficha y Evaluación',
    titulo: 'm1 con el veredicto ya registrado',
    pantalla: 'm1',
    comoSeLlega:
      'Dejaste tu veredicto y volvés a mirar la pantalla — la ficha queda congelada, el veredicto a la vista, y la pantalla navegable.',
    modo: 'directo',
  },
  {
    archivo: '05-archivo-descartado',
    tramo: 'Ficha y Evaluación',
    titulo: 'archivo — descartado',
    pantalla: 'archivo',
    comoSeLlega: 'Tu veredicto fue DESCARTAR: el lead cae al archivo, con el motivo a la vista y nada por delante.',
    modo: 'directo',
  },
  // ── Opener y Seguimiento ──────────────────────────────────────────────────
  {
    archivo: '06-m4-opener-pendiente',
    tramo: 'Opener y Seguimiento',
    titulo: 'm4 opener pendiente',
    pantalla: 'm4',
    comoSeLlega: 'El negocio quedó AVANZAR pero todavía no le escribiste el primer mensaje.',
    modo: 'directo',
  },
  {
    archivo: '07-m4-opener-enviado',
    tramo: 'Opener y Seguimiento',
    titulo: 'm4 opener enviado',
    pantalla: 'm4',
    comoSeLlega: 'Ya mandaste el opener y volvés a mirar la pantalla.',
    modo: 'flujo',
  },
  {
    archivo: '08-espera-post-opener',
    tramo: 'Opener y Seguimiento',
    titulo: 'espera post-opener',
    pantalla: 'espera',
    comoSeLlega:
      'Mandaste el opener y el próximo toque no vence todavía: la pelota la tiene el negocio.',
    modo: 'flujo',
  },
  {
    archivo: '09-m5-toque-vencido',
    tramo: 'Opener y Seguimiento',
    titulo: 'm5 toque vencido',
    pantalla: 'm5',
    comoSeLlega: 'Venció el toque de la cadencia y te toca registrar qué pasó.',
    modo: 'flujo',
  },
  {
    archivo: '10-m5-cadencia-agotada',
    tramo: 'Opener y Seguimiento',
    titulo: 'm5 cadencia agotada',
    pantalla: 'm5',
    comoSeLlega: 'Hiciste todos los toques y nadie contestó: la cadencia se agotó (2.2).',
    modo: 'flujo',
  },
  {
    archivo: '11-m5-charla-poblada',
    tramo: 'Opener y Seguimiento',
    titulo: 'm5 charla poblada',
    pantalla: 'm5',
    comoSeLlega:
      'Hubo ida y vuelta: «Lo último de la charla» muestra el último toque con su nota (5.1).',
    modo: 'flujo',
  },
  // ── Brief ─────────────────────────────────────────────────────────────────
  {
    archivo: '12-m6-brief-abierto',
    tramo: 'Brief',
    titulo: 'm6 «Decidí cómo va a ser la demo» — abierto',
    pantalla: 'm6',
    comoSeLlega:
      'El negocio respondió: se destrabó la pantalla donde decidís cómo va a ser la demo (secciones, qué cuenta, a qué invita).',
    modo: 'directo',
  },
  {
    archivo: '13-m6-brief-guardado',
    tramo: 'Brief',
    titulo: 'm6 decisión guardada',
    pantalla: 'm6',
    comoSeLlega: 'Ya cerraste cómo va a ser la demo y volvés a leerlo.',
    modo: 'directo',
  },
  // ── Construcción (P6-B: dos pantallas) ────────────────────────────────────
  {
    archivo: '14-mc1-tilde-deshabilitado',
    tramo: 'Construcción',
    titulo: 'mc1 con el tilde deshabilitado',
    pantalla: 'mc1',
    comoSeLlega:
      'Estás en Construcción pero todavía no la arrancaste: el tilde no se ofrece y dice por qué (3.3).',
    modo: 'directo',
  },
  {
    archivo: '15-mc1-construir',
    tramo: 'Construcción',
    titulo: 'mc1 «Construí la demo» — sin avance',
    pantalla: 'mc1',
    comoSeLlega:
      'Arrancaste la construcción: la pantalla junta estructura, personalización y assets, y ninguna está tildada.',
    modo: 'directo',
  },
  {
    archivo: '16-mc1-parcial',
    tramo: 'Construcción',
    titulo: 'mc1 a medio hacer',
    pantalla: 'mc1',
    comoSeLlega: 'Tildaste una de las tres cosas de esta pantalla; las otras dos siguen abiertas.',
    modo: 'directo',
  },
  {
    archivo: '17-mc1-completa',
    tramo: 'Construcción',
    titulo: 'mc1 completa',
    pantalla: 'mc1',
    comoSeLlega:
      'Tildaste las tres: la pantalla figura completada (hace falta que TODAS sus fases lo estén) y volvés a mirarla.',
    modo: 'directo',
  },
  {
    archivo: '18-mc2-refinar',
    tramo: 'Construcción',
    titulo: 'mc2 «Refiná la demo» — sin avance',
    pantalla: 'mc2',
    comoSeLlega:
      'Terminaste de construir y pasás a refinar: CTA, calidad y mobile, con la demo ya en pantalla.',
    modo: 'directo',
  },
  {
    archivo: '19-mc2-parcial',
    tramo: 'Construcción',
    titulo: 'mc2 a medio hacer',
    pantalla: 'mc2',
    comoSeLlega: 'Tildaste una de las tres de refinado; faltan dos.',
    modo: 'directo',
  },
  {
    archivo: '20-mc2-completa',
    tramo: 'Construcción',
    titulo: 'mc2 completa (las seis tildadas)',
    pantalla: 'mc2',
    comoSeLlega:
      'Las seis del checklist tildadas: la construcción quedó cerrada y lo que sigue es publicar el borrador.',
    modo: 'directo',
  },
  // ── Borrador, Chequeo y Revisión ──────────────────────────────────────────
  {
    archivo: '21-m13-borrador-vacio',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'm13 borrador vacío',
    pantalla: 'm13',
    comoSeLlega: 'Terminaste de construir y te toca publicar en Netlify Drop y pegar el link.',
    modo: 'directo',
  },
  {
    archivo: '22-m14-chequeo',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'm14 chequeo sin tildar',
    pantalla: 'm14',
    comoSeLlega:
      'Ya hay borrador publicado: la grilla de los diez obligatorios, en sus dos grupos («esto lo revisás vos» / «esto lo mira Franco»), toda en cero.',
    modo: 'directo',
  },
  {
    archivo: '22b-m14-chequeo-parcial',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'm14 chequeo a medias',
    pantalla: 'm14',
    comoSeLlega:
      'Cerraste tu grupo y te falta el de Franco: el botón de mandar a revisión sigue trabado y dice cuántos faltan.',
    modo: 'directo',
  },
  {
    archivo: '22c-m14-chequeo-completo',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'm14 chequeo completo',
    pantalla: 'm14',
    comoSeLlega: 'Los diez en verde: recién ahí se destraba «Enviar a revisión».',
    modo: 'directo',
  },
  {
    archivo: '23-revision-franco',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'revisión de Franco',
    pantalla: 'revision',
    comoSeLlega: 'Mandaste la demo: Franco la está revisando y no hay nada que hacer.',
    modo: 'directo',
  },
  {
    archivo: '24a-error-borrador-url-invalida',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'error de URL del borrador',
    pantalla: 'm13',
    comoSeLlega:
      'Pegás cualquier cosa en el campo del link y guardás: el error queda fijo, no se va como un toast.',
    modo: 'interacción',
  },
  {
    archivo: '24b-error-persistente-chequeo',
    tramo: 'Borrador, Chequeo y Revisión',
    titulo: 'error persistente del chequeo',
    pantalla: 'm14',
    comoSeLlega:
      'Tenías el chequeo abierto y el lead se movió por detrás: al mandar, el server rebota y el motivo queda a la vista, en criollo (4.1).',
    modo: 'interacción',
  },
  // ── Re-loop ───────────────────────────────────────────────────────────────
  {
    archivo: '25-mr-correccion-1',
    tramo: 'Re-loop',
    titulo: 'mr corrección N°1',
    pantalla: 'mr',
    comoSeLlega: 'Franco rechazó la demo por primera vez: la nota está al frente.',
    modo: 'directo',
  },
  {
    archivo: '26-mr-correccion-2',
    tramo: 'Re-loop',
    titulo: 'mr corrección N°2',
    pantalla: 'mr',
    comoSeLlega: 'Segundo rechazo: la corrección nueva al frente y las anteriores colapsadas (5.2).',
    modo: 'directo',
  },
  // ── Envío ─────────────────────────────────────────────────────────────────
  {
    archivo: '27-m15-envio-abierto',
    tramo: 'Envío',
    titulo: 'm15 envío abierto',
    pantalla: 'm15',
    comoSeLlega: 'Franco aprobó y el negocio está respondiendo: se destrabó el envío del link.',
    modo: 'directo',
  },
  {
    archivo: '28-m15-espera-sin-respuesta',
    tramo: 'Envío',
    titulo: 'espera sin respuesta',
    pantalla: 'espera',
    comoSeLlega:
      'Está aprobada pero el negocio no respondió: espera con m15 consultable, que nombra la causa real (5.3).',
    modo: 'directo',
  },
  {
    archivo: '29-m15-espera-sin-final-url',
    tramo: 'Envío',
    titulo: 'espera sin URL final',
    pantalla: 'espera',
    comoSeLlega: 'Aprobada y el negocio respondió, pero falta la URL final que carga el admin.',
    modo: 'directo',
  },
  // ── Agenda ────────────────────────────────────────────────────────────────
  {
    archivo: '30-m16-virgen',
    tramo: 'Agenda',
    titulo: 'm16 virgen',
    pantalla: 'm16',
    comoSeLlega:
      'Mandaste el link, el negocio dijo «sí, reunámonos» y todavía no ofreciste horarios.',
    modo: 'directo',
  },
  {
    archivo: '31-m16-ofrecidos',
    tramo: 'Agenda',
    titulo: 'm16 con horarios ofrecidos',
    pantalla: 'm16',
    comoSeLlega: 'Ya le pasaste 3 horarios y volvés a entrar: los mismos horarios siguen ahí (6.1/6.2).',
    modo: 'flujo',
  },
  {
    archivo: '32-m16-agendada',
    tramo: 'Agenda',
    titulo: 'm16 agendada',
    pantalla: 'm16',
    comoSeLlega: 'La reunión quedó agendada: resumen del traspaso, nada por delante.',
    modo: 'directo',
  },
  {
    archivo: '33-m5-post-envio',
    tramo: 'Agenda',
    titulo: 'm5 post-envío',
    pantalla: 'm5',
    comoSeLlega:
      'Mandaste el link y venció el toque: registrás el seguimiento post-envío con m16 al lado.',
    modo: 'flujo',
  },
  // ── Terminal ──────────────────────────────────────────────────────────────
  {
    archivo: '34-archivo-perdido',
    tramo: 'Terminal',
    titulo: 'archivo (perdido)',
    pantalla: 'archivo',
    comoSeLlega:
      'El negocio se cerró sin avanzar (Franco lo marcó PERDIDO): vista de archivo, read-only (2.3).',
    modo: 'flujo',
  },
  // ── Panel de inicio ───────────────────────────────────────────────────────
  {
    archivo: '35-home-foco',
    tramo: 'Panel de inicio',
    titulo: 'el foco, con cartera cargada',
    pantalla: '/setter',
    comoSeLlega:
      'Entrás al panel con trabajo acumulado: el foco te dice con qué negocio seguir. Sale de la cartera REAL del setter de prueba.',
    modo: 'directo',
  },
  {
    archivo: '36-home-cartera',
    tramo: 'Panel de inicio',
    titulo: 'la cartera completa',
    pantalla: '/setter',
    comoSeLlega: 'Mirás toda tu cartera, subordinada al foco.',
    modo: 'directo',
  },
  {
    archivo: '37-home-foco-construir',
    tramo: 'Panel de inicio',
    titulo: 'el foco manda a construir',
    pantalla: '/setter',
    comoSeLlega:
      'Tenés un negocio que pasó el filtro y le falta la demo: es lo primero que el foco pone adelante (P8).',
    modo: 'directo',
  },
  {
    archivo: '38-home-foco-espera-accion',
    tramo: 'Panel de inicio',
    titulo: 'el foco dice «te está esperando a vos»',
    pantalla: '/setter',
    comoSeLlega:
      'No hay nada para construir pero sí algo trabado esperándote: una demo que Franco rechazó.',
    modo: 'directo',
  },
  {
    archivo: '39-home-vacio',
    tramo: 'Panel de inicio',
    titulo: 'cartera vacía',
    pantalla: '/setter',
    comoSeLlega: 'Sos setter nuevo y todavía no te asignaron ni cargaste ningún negocio.',
    modo: 'directo',
  },
  {
    archivo: '40-home-nada-para-trabajar',
    tramo: 'Panel de inicio',
    titulo: 'nada para trabajar ahora',
    pantalla: '/setter',
    comoSeLlega:
      'Tenés cartera pero está toda en vuelo (esperando a Franco o al negocio): el panel muestra dónde quedó el trabajo en vez de un foco.',
    modo: 'directo',
  },
]

/** Las mobile son variantes del mismo estado: `M-<archivo>`. */
const MOBILE_DE: Record<string, string> = {
  'M-09-m5-toque-vencido': 'El registro de toque en el celular — lo que más se usa fuera del escritorio.',
  'M-15-mc1-construir': '«Construí la demo» en el celular: la navegación de la construcción cambia de forma.',
  'M-18-mc2-refinar': '«Refiná la demo» en el celular — la segunda mitad de la construcción.',
  'M-22b-m14-chequeo-parcial': 'El chequeo final en el celular: los dos grupos, uno cerrado y otro abierto.',
  'M-31-m16-ofrecidos': 'La agenda en el celular (la pantalla con más form).',
  'M-35-home-foco': 'El panel en el celular: el drawer (botón hamburguesa) reemplaza la barra lateral.',
  'M-37-home-foco-construir': 'El foco que manda a construir, en el celular.',
}

type Png = { archivo: string; ancho: number; alto: number; bytes: number }

/** Dimensiones desde el header IHDR (bytes 16..23) — sin librería de imágenes. */
async function leerPng(nombre: string): Promise<Png> {
  const buf = await readFile(path.join(DIR_PNG, nombre))
  return {
    archivo: nombre.replace(/\.png$/, ''),
    ancho: buf.readUInt32BE(16),
    alto: buf.readUInt32BE(20),
    bytes: buf.length,
  }
}

function tabla(filas: string[][], encabezado: string[]): string {
  const sep = encabezado.map(() => '---')
  return [encabezado, sep, ...filas].map((f) => `| ${f.join(' | ')} |`).join('\n')
}

async function main() {
  let nombres: string[]
  try {
    nombres = (await readdir(DIR_PNG)).filter((n) => n.toLowerCase().endsWith('.png')).sort()
  } catch {
    console.error(
      `ABORT: no existe ${DIR_PNG}. Corré la captura primero:\n  npm run galeria`,
    )
    process.exit(1)
  }
  if (nombres.length === 0) {
    console.error(`ABORT: ${DIR_PNG} está vacío — no hay nada que indexar.`)
    process.exit(1)
  }

  const pngs = await Promise.all(nombres.map(leerPng))
  const porArchivo = new Map(pngs.map((p) => [p.archivo, p]))

  const desktop = pngs.filter((p) => !p.archivo.startsWith('M-'))
  const mobile = pngs.filter((p) => p.archivo.startsWith('M-'))

  // Cruce catálogo ↔ evidencia.
  const huecos = CATALOGO.filter((e) => !porArchivo.has(e.archivo)).map((e) => e.archivo)
  const catalogados = new Set(CATALOGO.map((e) => e.archivo))
  const residuos = pngs
    .filter((p) => !p.archivo.startsWith('M-') && !catalogados.has(p.archivo))
    .map((p) => p.archivo)
  const residuosMobile = mobile.filter((p) => !(p.archivo in MOBILE_DE)).map((p) => p.archivo)
  const huecosMobile = Object.keys(MOBILE_DE).filter((n) => !porArchivo.has(n))

  // Informativo (NO una alarma de recorte — ver la cabecera): cuáles entraron en
  // una sola pantalla y cuál es la más larga que hubo que estirar.
  const enUnaPantalla = pngs.filter(
    (p) => p.alto === ALTO_VIEWPORT.desktop || p.alto === ALTO_VIEWPORT.mobile,
  )
  const masLarga = pngs.reduce((a, p) => (p.alto > a.alto ? p : a), pngs[0])

  const capturados = CATALOGO.filter((e) => porArchivo.has(e.archivo))
  const porModo = (m: Modo) => capturados.filter((e) => e.modo === m).length
  const pantallas = new Set(capturados.map((e) => e.pantalla))

  const lineas: string[] = []
  const push = (s = '') => lineas.push(s)

  push('# Galería de estados — Panel del Setter (corrida M0/G)')
  push()
  push('> **Archivo GENERADO.** No editar a mano: se regenera con')
  push('> `npx tsx scripts/dev/m0-galeria-indice.ts`, que deriva el conteo y las')
  push('> dimensiones de los `.png` que hay en `png/`. El texto de cada estado vive')
  push('> en el catálogo de ese script.')
  push()
  push('Base observacional del manual de usuario. Cada fila es **un estado del recorrido')
  push('del setter**: una pantalla del registro `PANTALLAS` (`src/lib/leados/manual.ts`)')
  push('en una **variación** concreta — porque la mitad del manual vive en las variaciones,')
  push('no en las pantallas.')
  push()
  push(
    `**Resultado: ${capturados.length} estados capturados** sobre ${CATALOGO.length} catalogados, ` +
      `en ${pantallas.size} pantallas distintas. Más ${mobile.length} capturas mobile. ` +
      `${desktop.length + mobile.length} archivos en total ` +
      `(${(pngs.reduce((a, p) => a + p.bytes, 0) / 1024 / 1024).toFixed(1)} MB).`,
  )
  push()
  push(
    `Huecos (catalogados sin foto): **${huecos.length + huecosMobile.length}**. ` +
      `Residuos (fotos sin entrada en el catálogo): **${residuos.length + residuosMobile.length}**.`,
  )
  push()
  push('---')
  push()
  push('## Cómo se regenera')
  push()
  push('Desde `logic-core-v3/`, con la DB de dev sembrable:')
  push()
  push('```bash')
  push('npm run galeria')
  push('```')
  push()
  push('Equivale a `npm run seed:galeria && npm run galeria:capturar && npm run galeria:indice`.')
  push('La captura levanta su PROPIO servidor: `npm run start:galeria` buildea en')
  push('`.next-galeria/` y sirve en `:3004`, y el config NO reutiliza lo que haya en el')
  push('puerto. Es a propósito — compartir `.next/` con el `next dev`/`next start` del')
  push('checkout hace que la corrida lea artefactos mezclados y le reconstruya el build')
  push('por debajo al otro frente. Para reusar un server ya levantado, a propósito:')
  push()
  push('```bash')
  push('SETTER_EXTERNAL_SERVER=1 npm run galeria:capturar')
  push('```')
  push()
  push('**Los `.png` NO están en el repo** — ver [.gitignore](.gitignore). La fuente de')
  push('verdad de la galería es este índice + el sembrador + la captura; los binarios se')
  push('regeneran enteros. Salen en `docs/manual-usuario/galeria/png/`.')
  push()
  push('Piezas:')
  push('- Sembrado — [`scripts/dev/m0-galeria-seed.ts`](../../../scripts/dev/m0-galeria-seed.ts)')
  push('- Captura — [`tests/galeria/captura.spec.ts`](../../../tests/galeria/captura.spec.ts) + [`playwright.galeria.config.ts`](../../../playwright.galeria.config.ts)')
  push('- Índice — [`scripts/dev/m0-galeria-indice.ts`](../../../scripts/dev/m0-galeria-indice.ts)')
  push('- Fixtures reusados — [`tests/helpers/setter-db.ts`](../../../tests/helpers/setter-db.ts)')
  push()
  push('## Flujo real vs sembrado directo')
  push()
  push(
    tabla(
      [
        [
          '**Flujo real (parcial)**',
          String(porModo('flujo')),
          'Los toques de la cadencia son `OsLeadActivity` reales — las mismas filas que escribe el motor. La oferta de horarios de #31 pasa por `guardarHorariosOfrecidosOwned`, el write-path exacto de la action `ofrecerHorarios`.',
        ],
        [
          '**Interacción real**',
          String(porModo('interacción')),
          'Se provocan **desde la UI**: se escribe en el form y se manda, no se siembra nada.',
        ],
        [
          '**Sembrado directo**',
          String(porModo('directo')),
          'Se coloca el lead por `stage` + blobs del dossier.',
        ],
      ],
      ['Modo', 'Cuántos', 'Qué significa'],
    ),
  )
  push()
  push('**Por qué sembrado directo en la mayoría.** Llevar 40 leads hasta su estado por')
  push('la UI real exigiría encadenar el recorrido completo por cada uno. Varios pasos no')
  push('los puede dar el setter solo: la **aprobación / rechazo de la demo es de Franco')
  push('desde admin** y la **`finalUrl` la carga el admin**, así que APROBADA y RECHAZADA')
  push('no son alcanzables desde el panel del setter por definición. Ninguna combinación')
  push('sembrada es imposible para el flujo real: son todas posiciones que el motor produce.')
  push()
  push('---')
  push()
  push('## Los estados capturados')

  for (const tramo of TRAMOS) {
    const delTramo = CATALOGO.filter((e) => e.tramo === tramo)
    if (delTramo.length === 0) continue
    push()
    push(`### Tramo ${tramo}`)
    push()
    push(
      tabla(
        delTramo.map((e) => {
          const png = porArchivo.get(e.archivo)
          return [
            e.titulo,
            png ? `\`${e.archivo}.png\`` : '**FALTA**',
            `\`${e.pantalla}\``,
            png ? `${png.ancho}×${png.alto}` : '—',
            e.comoSeLlega,
            e.modo,
          ]
        }),
        ['Estado', 'Screenshot', 'Pantalla', 'Dimensiones', 'Cómo se llega (palabras del setter)', 'Modo'],
      ),
    )
  }

  push()
  push('### Mobile')
  push()
  push(
    tabla(
      Object.entries(MOBILE_DE).map(([nombre, que]) => {
        const png = porArchivo.get(nombre)
        return [png ? `\`${nombre}.png\`` : `**FALTA** \`${nombre}.png\``, png ? `${png.ancho}×${png.alto}` : '—', que]
      }),
      ['Screenshot', 'Dimensiones', 'Qué muestra'],
    ),
  )

  push()
  push('---')
  push()
  push('## Huecos y residuos (derivado del cruce)')
  push()
  if (huecos.length === 0 && huecosMobile.length === 0) {
    push('**Huecos: ninguno.** Cada estado del catálogo tiene su `.png`.')
  } else {
    push('**Huecos** — catalogados y sin foto (la captura no llegó al estado):')
    push()
    for (const h of [...huecos, ...huecosMobile]) push(`- \`${h}.png\``)
  }
  push()
  if (residuos.length === 0 && residuosMobile.length === 0) {
    push('**Residuos: ninguno.** No quedó ningún `.png` de un estado que ya no existe.')
  } else {
    push('**Residuos** — `.png` sin entrada en el catálogo. Normalmente son estados')
    push('retirados cuya foto quedó de una corrida vieja: borrar el archivo o catalogarlo.')
    push()
    for (const r of [...residuos, ...residuosMobile]) push(`- \`${r}.png\``)
  }
  push()
  push('## Altos de captura')
  push()
  push('El portal **no scrollea el documento**: scrollea un `<main class="overflow-y-auto">`,')
  push('y el `document` mide siempre el viewport. Por eso `fullPage: true` por sí solo NO')
  push('alcanza acá — la primera vuelta de esta galería salió recortada así. La captura')
  push('agranda el viewport hasta que el `<main>` deja de desbordar y **afirma contra el DOM**')
  push('que no quedó nada fuera de cuadro antes de disparar (`ajustarYVerificar`): si alguna')
  push('quedara cortada, la corrida falla en vez de guardar una foto que miente.')
  push()
  push(
    `Altos: de ${Math.min(...pngs.map((p) => p.alto))}px a ${masLarga.alto}px ` +
      `(la más larga es \`${masLarga.archivo}.png\`). ${enUnaPantalla.length} de ${pngs.length} ` +
      `entraron en una sola pantalla (${ALTO_VIEWPORT.desktop}px desktop / ${ALTO_VIEWPORT.mobile}px mobile) — ` +
      'eso es contenido corto, no recorte.',
  )
  push()

  await writeFile(SALIDA, lineas.join('\n') + '\n', 'utf8')

  console.log(`Índice regenerado: ${SALIDA}`)
  console.log(
    `  ${capturados.length}/${CATALOGO.length} estados · ${mobile.length} mobile · ` +
      `${pngs.length} archivos · ${huecos.length + huecosMobile.length} huecos · ` +
      `${residuos.length + residuosMobile.length} residuos · alto máx ${masLarga.alto}px`,
  )
  for (const h of [...huecos, ...huecosMobile]) console.log(`  HUECO   ${h}.png`)
  for (const r of [...residuos, ...residuosMobile]) console.log(`  RESIDUO ${r}.png`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

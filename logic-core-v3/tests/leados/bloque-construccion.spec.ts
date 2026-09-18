import { test, expect } from '@playwright/test'
import {
  armarBloqueConstruccion,
  avisoParaElSetter,
  estadoDelDocumento,
} from '../../src/lib/leados/bloque-construccion'
import { buildConstruccionBlock, type CopyBlockLead } from '../../src/lib/leados/copy-blocks'
import { FASE_IDS, ProgresoSchema, type Brief, type FaseId, type Ficha } from '../../src/lib/leados/contracts'
import { parseBrief, parseProgreso } from '../../src/lib/leados/flow'
import {
  derivarPantalla,
  fasesDePantallaConstruccion,
  PANTALLAS_CONSTRUCCION,
  type DerivacionManualInput,
} from '../../src/lib/leados/manual'
import { alternarPantalla, pantallaMarcada } from '../../src/lib/leados/progreso-pantalla'
import {
  PISO_DE_CALIDAD,
  PROMPT_BASE,
  ROTULOS_DE_CAPAS,
  SEPARADOR_DE_CAPAS,
} from '../../src/lib/leados/prompt-construccion'
import {
  DOCUMENTO_COMPLETO,
  DOCUMENTO_SIN_ENCABEZADO,
  DOCUMENTO_SIN_PALETA,
  ENCABEZADO_EXACTO,
  VALORES_ENCABEZADO,
} from '../helpers/documento-construccion-fixtures'

/**
 * P42 — «CONSTRUIR» EN UN PASO: el bloque de tres capas y el tilde único.
 *
 * Lo que la pantalla promete y no depende de una pantalla:
 *   §1 · el bloque son tres capas, en orden, con el documento en el medio; las
 *        dos fijas son las mismas para todo lead, y lo que se copia es la suma
 *        exacta de las tres;
 *   §2 · si el documento trae encabezado, sus campos viajan —tono, paleta y
 *        tipografía incluidos—; si no lo trae, o le falta algo, el bloque se
 *        arma igual y lo dice;
 *   §3 · un brief viejo (sin documento) no rompe: arma el bloque y lo dice;
 *   §4 · el tilde único marca y desmarca las tres fases de «Construir» con el
 *        MISMO criterio con el que la derivación da la pantalla por completa, sin
 *        tocar las de «Refinar», y lo guardado se sigue leyendo igual.
 * La prueba de la pantalla es `tests/setter/33-construir-un-paso`.
 *
 * Contra el código de partida este archivo NO CARGA: `bloque-construccion`,
 * `progreso-pantalla` y `prompt-construccion` no existen. Los dientes de cada
 * aserto se prueban con sabotajes, anotados en el reporte de P42.
 */

const LEAD: CopyBlockLead = {
  businessName: 'Barbería El Faro',
  industry: 'peluqueria',
  zone: 'Yerba Buena',
  instagramUrl: 'https://instagram.com/barberiaelfaro',
  currentWebUrl: null,
  googleMapsUrl: 'https://maps.google.com/?q=barberia+el+faro',
}

const FICHA: Ficha = {
  resenas: '★★★★★ "Marcos es un crack." — Julián R.',
  senalesOperativas: 'Martes a sábados de 10 a 20 h.',
  materiales: { imagenesUrl: 'https://instagram.com/barberiaelfaro', queVende: 'Corte clásico $9.000' },
}

/** El brief de las cuatro vueltas: los campos que el documento completó, y el documento. */
const BRIEF_CON_ENCABEZADO: Brief = {
  titulo: 'Barbería El Faro',
  concepto: VALORES_ENCABEZADO.ANGULO,
  secciones: [...VALORES_ENCABEZADO.SECCIONES],
  cta: VALORES_ENCABEZADO.CTA,
  tono: VALORES_ENCABEZADO.TONO,
  paleta: VALORES_ENCABEZADO.PALETA,
  tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
  documento: DOCUMENTO_COMPLETO,
}

/** Las formas de brief que hay hoy en la base, ninguna con documento (censo de P40 y P42). */
const BRIEFS_VIEJOS: Record<string, unknown> = {
  'con pegado del Gem': {
    titulo: 'Landing demo — negocio local',
    concepto: 'One-page mobile-first con CTA de WhatsApp',
    secciones: ['Hero', 'Servicios', 'Reseñas', 'Contacto'],
    pegadoGem: 'Respuesta cruda del Gem de diseño (seed).',
  },
  'sin pegado ni CTA': {
    titulo: 'Landing demo — negocio local',
    concepto: 'One-page mobile-first con CTA de WhatsApp',
    secciones: ['Hero', 'Productos', 'Cómo pedir'],
  },
  'con notas de marca y CTA': {
    titulo: 'Pizzería Doña Clara',
    concepto: 'Pedidos por WhatsApp',
    cta: 'Pedí por WhatsApp',
    notasMarca: 'Rojo y crema, tipografía redondeada',
    secciones: ['Hero', 'Menú', 'Reseñas'],
  },
  'con referencias de la ficha': {
    titulo: 'Estudio Contable',
    concepto: 'Confianza',
    cta: 'Pedí tu turno',
    notasMarca: 'Azul marino',
    referenciasFicha: 'Ver ficha',
    secciones: ['Hero', 'Servicios'],
  },
}

/** Lo que hay entre el rótulo de una capa y el de la siguiente, en el texto copiado. */
function tramoDeCapa(texto: string, desde: string, hasta: string | null): string {
  const inicio = texto.indexOf(desde)
  const fin = hasta ? texto.indexOf(hasta) : texto.length
  return texto.slice(inicio, fin)
}

// ── §1 · Las tres capas ──────────────────────────────────────────────────────

test('1a · tres capas, en orden, y lo que se copia es la suma exacta de las tres', () => {
  const bloque = armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  expect(bloque.capas.map((capa) => capa.id)).toEqual(['promptBase', 'documento', 'piso'])
  expect(bloque.capas.map((capa) => capa.fija)).toEqual([true, false, true])
  for (const capa of bloque.capas) {
    expect(capa.texto, `la capa «${capa.id}» lleva su rótulo adentro`).toBe(`${capa.rotulo}\n\n${capa.cuerpo}`)
  }
  expect(bloque.texto).toBe(bloque.capas.map((capa) => capa.texto).join(SEPARADOR_DE_CAPAS))

  // Cada rótulo, una sola vez, y en orden.
  const rotulos = [ROTULOS_DE_CAPAS.promptBase, ROTULOS_DE_CAPAS.documento, ROTULOS_DE_CAPAS.piso]
  const posiciones = rotulos.map((rotulo) => bloque.texto.indexOf(rotulo))
  for (const [i, rotulo] of rotulos.entries()) {
    expect(posiciones[i], `«${rotulo}» está`).toBeGreaterThanOrEqual(0)
    expect(bloque.texto.lastIndexOf(rotulo), `«${rotulo}» una sola vez`).toBe(posiciones[i])
  }
  expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones)
  expect(bloque.texto.startsWith(ROTULOS_DE_CAPAS.promptBase), 'el mensaje arranca por las instrucciones').toBe(true)
  expect(bloque.texto.endsWith(PISO_DE_CALIDAD), 'y termina con el piso').toBe(true)
})

test('1b · el documento va en el medio: la capa 2 es el bloque de construcción de siempre, entero', () => {
  const bloque = armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  const deSiempre = buildConstruccionBlock(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  const [, documento] = bloque.capas
  expect(documento.cuerpo, 'con el encabezado completo no hay aviso: el cuerpo ES el bloque').toBe(deSiempre)
  const medio = tramoDeCapa(bloque.texto, ROTULOS_DE_CAPAS.documento, ROTULOS_DE_CAPAS.piso)
  expect(medio).toContain(deSiempre)
})

test('1c · las dos capas fijas son las mismas para cualquier lead y cualquier brief', () => {
  const uno = armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  const otro = armarBloqueConstruccion(
    { ...LEAD, businessName: 'Panadería San Cayetano', industry: 'gastronomia' },
    parseBrief(BRIEFS_VIEJOS['con pegado del Gem'])!,
    null,
  )
  expect(uno.capas[0].cuerpo).toBe(PROMPT_BASE)
  expect(otro.capas[0].cuerpo).toBe(PROMPT_BASE)
  expect(uno.capas[2].cuerpo).toBe(PISO_DE_CALIDAD)
  expect(otro.capas[2].cuerpo).toBe(PISO_DE_CALIDAD)
  expect(uno.capas[1].cuerpo, 'la del medio sí cambia con el lead').not.toBe(otro.capas[1].cuerpo)
})

test('1d · el prompt base prohíbe preguntar, pide decidir por lo conservador y declararse al terminar', () => {
  expect(PROMPT_BASE).toContain('No me hagas preguntas.')
  expect(PROMPT_BASE).toContain('tomá la decisión más conservadora, seguí adelante y anotala al final')
  expect(PROMPT_BASE).toContain('No inventes datos.')
  // La lista de cierre: las cuatro cosas que convierten la verificación en comparación.
  const cierre = PROMPT_BASE.slice(PROMPT_BASE.indexOf('CUANDO TERMINES'))
  expect(cierre).toContain('- Las secciones que construiste, en orden.')
  expect(cierre).toContain('- Lo que el documento pedía y no pudiste hacer, con el motivo.')
  expect(cierre).toContain('- Los datos que te faltaron.')
  expect(cierre).toContain('- Las decisiones que tomaste vos porque el documento no las definía.')
  // Lo que el prompt base nombra existe en el mensaje, con ese nombre.
  expect(PROMPT_BASE).toContain('PISO DE CALIDAD')
  expect(ROTULOS_DE_CAPAS.piso).toContain('PISO DE CALIDAD')
  expect(ROTULOS_DE_CAPAS.documento).toContain('EL DOCUMENTO')
  // Y manda la decisión confirmada sobre el texto largo.
  expect(PROMPT_BASE).toContain('manda la decisión')
})

test('1f · los nueve puntos que «Construir» mostraba viajan adentro del bloque, con un brief nuevo y con uno viejo', () => {
  const nuevo = armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  const viejo = armarBloqueConstruccion(LEAD, parseBrief(BRIEFS_VIEJOS['con pegado del Gem'])!, FICHA)
  for (const [nombre, bloque] of [
    ['nuevo', nuevo],
    ['viejo', viejo],
  ] as const) {
    const [base, documento, piso] = bloque.capas.map((capa) => capa.cuerpo)
    // Estructura: una sola página, las secciones del brief en su orden, y ninguna más.
    expect(base, `${nombre}: una sola página`).toContain('una sola página (one-page)')
    expect(base, `${nombre}: las secciones en su orden, ninguna más`).toContain(
      'Construí las secciones que pide el documento, en ese orden, y ninguna más.',
    )
    expect(documento, `${nombre}: las secciones, numeradas`).toContain('SECCIONES (en este orden)\n1. ')
    // Personalización: nombre, rubro y zona donde se ven; reseñas; datos reales.
    expect(documento, `${nombre}: el nombre del negocio`).toContain(`BRIEF DE DEMO — ${LEAD.businessName}`)
    expect(documento, `${nombre}: rubro y zona`).toContain(`Rubro: ${LEAD.industry} · Zona: ${LEAD.zone}`)
    expect(piso, `${nombre}: el nombre en la primera pantalla y en el pie`).toContain(
      'El nombre del negocio va en la primera pantalla y en el pie, con su rubro y su zona.',
    )
    expect(documento, `${nombre}: las reseñas reales`).toContain('RESEÑAS REALES (usalas textuales como prueba social)')
    expect(documento, `${nombre}: horarios y turnos`).toContain('SEÑALES OPERATIVAS (horarios, delivery, turnos — reflejalos en la demo)')
    expect(base, `${nombre}: no inventar horarios ni precios`).toContain('Un precio, un horario o una reseña inventada')
    // Assets reales: de dónde bajarlos, nada de stock, y el nombre si no hay logo.
    expect(documento, `${nombre}: de dónde bajar logo y fotos`).toContain('DE DÓNDE BAJAR EL LOGO Y LAS FOTOS REALES')
    expect(piso, `${nombre}: las fotos reales primero`).toContain('Primero las fotos reales del negocio')
    expect(piso, `${nombre}: nada de stock`).toContain('Nunca fotos de banco, ilustraciones genéricas ni imágenes generadas.')
    expect(piso, `${nombre}: sin logo, el nombre`).toContain(
      'Si el negocio no tiene logo, va el nombre del negocio escrito con la fuente de los títulos. Nunca un logo inventado.',
    )
  }
})

test('1e · el piso trae el criterio de rechazo como instrucción, y la regla del menú', () => {
  for (const titulo of ['IDIOMA', 'JERARQUÍA', 'AIRE', 'TIPOGRAFÍA', 'COLOR', 'IMÁGENES', 'BOTÓN PRINCIPAL', 'MENÚ', 'CELULAR']) {
    expect(PISO_DE_CALIDAD, `el piso tiene «${titulo}»`).toMatch(new RegExp(`^${titulo}$`, 'm'))
  }
  expect(PISO_DE_CALIDAD).toContain('un único elemento con el tamaño más grande')
  expect(PISO_DE_CALIDAD).toContain('Tres colores como máximo')
  expect(PISO_DE_CALIDAD).toContain('Nunca la fuente por defecto del sistema')
  expect(PISO_DE_CALIDAD).toContain('Nunca «Contactanos», «Más información», «Enviar» ni «Click acá».')
  expect(PISO_DE_CALIDAD).toContain('cada link lleva a una sección de esta misma página, y esa sección existe')
  expect(PISO_DE_CALIDAD).toContain('Nunca un logo inventado.')
  expect(PISO_DE_CALIDAD).toContain('con voseo')
  // El acento: una sola regla, dicha igual en JERARQUÍA y en COLOR. La primera
  // versión decía «el único elemento» en una y «y sus repeticiones» en la otra,
  // con el botón repetido al pie: una herramienta que no puede preguntar tenía que
  // elegir cuál obedecer (revisión de código de P42).
  expect(PISO_DE_CALIDAD).toContain('es lo único que lleva el color de acento, también donde se repite.')
  expect(PISO_DE_CALIDAD).toContain('El acento va solo en el botón principal y en sus repeticiones.')
  expect(PISO_DE_CALIDAD).toContain('repetido al final de la página')
  expect(PISO_DE_CALIDAD).not.toContain('el único elemento con el color de acento')
})

// ── §2 · El encabezado del documento ────────────────────────────────────────

test('2a · con encabezado, sus seis campos viajan: los de las decisiones y las líneas del documento', () => {
  const bloque = armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA)
  expect(estadoDelDocumento(BRIEF_CON_ENCABEZADO)).toEqual({ tipo: 'completo' })
  expect(bloque.aviso, 'nada que avisar').toBeNull()
  expect(bloque.decisionesFaltantes).toEqual([])

  const medio = tramoDeCapa(bloque.texto, ROTULOS_DE_CAPAS.documento, ROTULOS_DE_CAPAS.piso)
  expect(medio).toContain(`TONO (así escriben los textos de la demo)\n${VALORES_ENCABEZADO.TONO}`)
  expect(medio).toContain(VALORES_ENCABEZADO.PALETA)
  expect(medio).toContain(`TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)\n${VALORES_ENCABEZADO.TIPOGRAFIA}`)
  expect(medio, 'el encabezado del documento, tal cual').toContain(ENCABEZADO_EXACTO)
})

test('2b · los campos del encabezado viajan aunque el brief no los tenga cargados como decisión', () => {
  const soloDocumento: Brief = { titulo: 'Barbería El Faro', secciones: ['Hero'], documento: DOCUMENTO_COMPLETO }
  const bloque = armarBloqueConstruccion(LEAD, soloDocumento, null)
  const medio = tramoDeCapa(bloque.texto, ROTULOS_DE_CAPAS.documento, ROTULOS_DE_CAPAS.piso)
  expect(medio).toContain(`TONO: ${VALORES_ENCABEZADO.TONO}`)
  expect(medio).toContain(`PALETA: ${VALORES_ENCABEZADO.PALETA}`)
  expect(medio).toContain(`TIPOGRAFIA: ${VALORES_ENCABEZADO.TIPOGRAFIA}`)
  expect(bloque.decisionesFaltantes, 'el encabezado las trae: no falta ninguna').toEqual([])
  expect(bloque.aviso).toBeNull()
})

test('2c · sin la línea PALETA: el bloque se arma igual y lo dice; si el brief tampoco la trae, pide decidirla', () => {
  const sinPaleta: Brief = { ...BRIEF_CON_ENCABEZADO, paleta: undefined, documento: DOCUMENTO_SIN_PALETA }
  expect(estadoDelDocumento(sinPaleta)).toEqual({ tipo: 'incompleto', faltanEnEncabezado: ['PALETA'] })
  const bloque = armarBloqueConstruccion(LEAD, sinPaleta, FICHA)
  expect(bloque.capas).toHaveLength(3)
  expect(bloque.decisionesFaltantes).toEqual(['PALETA'])
  expect(bloque.aviso).toContain('PALETA')
  expect(bloque.aviso).toContain('camino más conservador')
  const medio = tramoDeCapa(bloque.texto, ROTULOS_DE_CAPAS.documento, ROTULOS_DE_CAPAS.piso)
  expect(medio.indexOf(bloque.aviso!), 'el aviso va adentro del documento, antes que nada').toBe(
    ROTULOS_DE_CAPAS.documento.length + 2,
  )

  // Con la paleta escrita a mano en el brief, la decisión existe: se avisa la línea, no se pide decidir.
  const conPaletaEnElBrief = armarBloqueConstruccion(LEAD, { ...sinPaleta, paleta: VALORES_ENCABEZADO.PALETA }, FICHA)
  expect(conPaletaEnElBrief.decisionesFaltantes).toEqual([])
  expect(conPaletaEnElBrief.aviso).toContain('PALETA')
  expect(conPaletaEnElBrief.aviso).not.toContain('camino más conservador')
})

test('2d · un documento sin encabezado: el bloque va entero, lo dice, y nombra lo que hay que decidir', () => {
  const sinEncabezado: Brief = { titulo: 'Barbería El Faro', secciones: ['Hero', 'Servicios'], documento: DOCUMENTO_SIN_ENCABEZADO }
  expect(estadoDelDocumento(sinEncabezado)).toEqual({ tipo: 'sin-encabezado' })
  const bloque = armarBloqueConstruccion(LEAD, sinEncabezado, null)
  expect(bloque.aviso).toContain('no trae el encabezado')
  expect(bloque.decisionesFaltantes).toEqual(['PALETA', 'TIPOGRAFIA'])
  expect(bloque.texto, 'el documento viaja entero igual').toContain(DOCUMENTO_SIN_ENCABEZADO)
  expect(avisoParaElSetter(bloque)).toContain('no trae el encabezado')
})

// ── §3 · Un brief viejo no rompe ────────────────────────────────────────────

for (const [forma, guardado] of Object.entries(BRIEFS_VIEJOS)) {
  test(`3a · un brief viejo (${forma}) arma el bloque de tres capas y dice que no trae documento`, () => {
    const brief = parseBrief(guardado)
    expect(brief, 'el brief guardado se sigue leyendo').not.toBeNull()
    expect(estadoDelDocumento(brief!)).toEqual({ tipo: 'sin-documento' })

    const bloque = armarBloqueConstruccion(LEAD, brief!, null)
    expect(bloque.capas.map((capa) => capa.id)).toEqual(['promptBase', 'documento', 'piso'])
    expect(bloque.aviso).toContain('no trae el documento de construcción')
    expect(bloque.capas[1].cuerpo.endsWith(buildConstruccionBlock(LEAD, brief!, null)), 'y lleva el bloque de siempre').toBe(true)
    // Los briefs viejos no tienen dirección visual: se nombra lo que la herramienta va a decidir sola.
    expect(bloque.decisionesFaltantes).toEqual(['PALETA', 'TIPOGRAFIA'])
    expect(bloque.aviso).toContain('la paleta y la tipografía')
    expect(avisoParaElSetter(bloque)).toContain('no trae el documento del Gem de diseño')
  })
}

test('3b · con el documento completo, el aviso al setter no existe', () => {
  expect(avisoParaElSetter(armarBloqueConstruccion(LEAD, BRIEF_CON_ENCABEZADO, FICHA))).toBeNull()
})

// ── §4 · El tilde único y el progreso guardado ───────────────────────────────

const MC1 = fasesDePantallaConstruccion('mc1')
const MC2 = fasesDePantallaConstruccion('mc2')

/** Los 64 subconjuntos de fases, en el orden de `FASE_IDS`. */
const SUBCONJUNTOS: FaseId[][] = Array.from({ length: 2 ** FASE_IDS.length }, (_, mascara) =>
  FASE_IDS.filter((_, i) => (mascara >> i) & 1),
)

function derivacion(completadas: FaseId[]): DerivacionManualInput {
  return {
    stage: 'CONSTRUCCION',
    status: 'PROSPECTO',
    caliente: false,
    ficha: null,
    draftUrl: null,
    progreso: { completadas },
    agenda: null,
    contactos: 0,
    postergadoVencido: false,
    hayRechazo: false,
    followUpCount: 0,
    followUpVencido: false,
    finalUrl: null,
    demoEnviada: false,
  }
}

test('4a · el tilde está marcado exactamente cuando la derivación da la pantalla por completa (64 de 64)', () => {
  expect(MC1).toEqual(['estructura', 'personalizacion', 'assets'])
  for (const completadas of SUBCONJUNTOS) {
    const posicion = derivarPantalla(derivacion(completadas))
    for (const pantalla of PANTALLAS_CONSTRUCCION) {
      expect(
        pantallaMarcada(completadas, fasesDePantallaConstruccion(pantalla)),
        `${pantalla} con [${completadas.join(', ')}]`,
      ).toBe(posicion.completadas.includes(pantalla))
    }
  }
})

test('4b · tildar suma las tres de «Construir»; destildar las saca; «Refinar» no se toca nunca', () => {
  for (const completadas of SUBCONJUNTOS) {
    const siguiente = alternarPantalla(completadas, MC1)
    const refinarAntes = completadas.filter((fase) => MC2.includes(fase))
    expect(siguiente.filter((fase) => MC2.includes(fase)), `Refinar intacto con [${completadas.join(', ')}]`).toEqual(
      refinarAntes,
    )
    const estaba = pantallaMarcada(completadas, MC1)
    expect(pantallaMarcada(siguiente, MC1), `un clic invierte el tilde con [${completadas.join(', ')}]`).toBe(!estaba)
    if (estaba) expect(siguiente.some((fase) => MC1.includes(fase))).toBe(false)
    else expect(MC1.every((fase) => siguiente.includes(fase))).toBe(true)
    // Lo que escribe es un progreso válido, en el orden canónico de la llave.
    expect(ProgresoSchema.safeParse({ completadas: siguiente }).success).toBe(true)
    expect(siguiente).toEqual(FASE_IDS.filter((fase) => siguiente.includes(fase)))
  }
})

test('4c · un «Construir» a medias se lee sin marcar, y el primer clic completa sin borrar lo que había', () => {
  const aMedias: FaseId[] = ['estructura', 'cta', 'calidad']
  expect(pantallaMarcada(aMedias, MC1)).toBe(false)
  expect(alternarPantalla(aMedias, MC1)).toEqual(['estructura', 'personalizacion', 'assets', 'cta', 'calidad'])
})

test('4d · lo guardado se sigue leyendo igual: las formas de progreso que hay en la base', () => {
  // Las cinco formas de `progresoJson` del censo de P42 (15 dossiers): orden
  // canónico, orden de clic, «Construir» a medias, «Construir» sola y las seis.
  const GUARDADOS: FaseId[][] = [
    ['estructura', 'personalizacion', 'assets', 'cta', 'calidad', 'mobile'],
    ['assets', 'personalizacion', 'estructura', 'calidad', 'mobile', 'cta'],
    ['estructura'],
    ['estructura', 'personalizacion', 'assets'],
    ['estructura', 'personalizacion', 'assets', 'cta'],
  ]
  for (const completadas of GUARDADOS) {
    const leido = parseProgreso({ completadas })
    expect(leido.completadas, `se lee tal cual [${completadas.join(', ')}]`).toEqual(completadas)
    const posicion = derivarPantalla(derivacion(leido.completadas))
    expect(pantallaMarcada(leido.completadas, MC1)).toBe(posicion.completadas.includes('mc1'))
  }
})

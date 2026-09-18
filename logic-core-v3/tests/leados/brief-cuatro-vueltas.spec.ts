import { test, expect } from '@playwright/test'
import { briefInputSchemaPara } from '../../src/app/(protected)/setter/_actions/dossier.schemas'
import {
  autollenar,
  campoDeError,
  diferenciasConLoLeido,
  faltaLaSalidaDelGem,
  valoresDeVueltas,
  vueltaCompleta,
  vueltaInicial,
  vueltasParaGuardar,
  vueltaSiguiente,
  type CamposLeidos,
  type ValoresVueltas,
} from '../../src/lib/leados/brief-vueltas'
import { buildConstruccionBlock, type CopyBlockLead } from '../../src/lib/leados/copy-blocks'
import { BriefSchema, TEXTO_DOCUMENTO_MAX, TEXTO_LIBRE_MAX, type Brief } from '../../src/lib/leados/contracts'
import { leerEncabezado } from '../../src/lib/leados/encabezado-documento'
import { parseBrief } from '../../src/lib/leados/flow'
import { GUIA_BRIEF } from '../../src/lib/leados/guidance-content'
import { mensajeDeVuelta } from '../../src/lib/leados/prompts-gem-diseno'
import {
  DOCUMENTO_COMPLETO,
  DOCUMENTO_CON_HUECOS_ANTES,
  VALORES_ENCABEZADO,
  VUELTA_DECISIONES,
  VUELTA_ESPECIFICACION,
  VUELTA_LECTURA,
} from '../helpers/documento-construccion-fixtures'

/**
 * P40 — EL BRIEF DE LAS CUATRO VUELTAS: lo que se guarda, lo que viaja a la
 * construcción, y que nada de lo que ya estaba guardado cambie.
 *
 * Tres promesas del sprint que no dependen de una pantalla:
 *   §1 · ningún brief guardado deja de parsear (las formas que hay HOY en la base);
 *   §2 · el bloque de construcción lleva tono, paleta y tipografía — y sus otras
 *        secciones no se mueven;
 *   §3 · lo que se guarda de las vueltas es la decisión 2, y vuelve igual.
 * Y la mecánica pura que usa la pantalla: el recorrido, el autollenado, los
 * mensajes. La prueba de la pantalla es `tests/setter/32-brief-cuatro-vueltas`.
 *
 * Contra el código de partida: §2a/§2b/§2d/§2e se ponen rojos en su aserto (el
 * builder viejo ignora los campos nuevos y el documento), y §3/§4 no cargan (no
 * existen las vueltas). §1, §2c y §2f pasan en las dos versiones A PROPÓSITO: son
 * las guardias de que el cambio no rompió lo que ya estaba. Sus dientes se
 * prueban con sabotajes (un campo nuevo obligatorio pone roja §1; una sección
 * vieja movida, §2c), anotados en la bitácora de P40.
 */

const LEAD: CopyBlockLead = {
  businessName: 'Barbería El Faro',
  industry: 'peluqueria',
  zone: 'Yerba Buena',
  instagramUrl: 'https://instagram.com/barberiaelfaro',
  currentWebUrl: null,
  googleMapsUrl: 'https://maps.google.com/?q=barberia+el+faro',
}

/** Las SIETE formas de brief que hay hoy en la base (censo de P40, 49 briefs). */
const FORMAS_GUARDADAS: Record<string, unknown> = {
  'concepto,notasMarca,pegadoGem,secciones,titulo': {
    titulo: 'Landing demo',
    concepto: 'One-page mobile-first',
    notasMarca: 'Tono cercano',
    pegadoGem: 'Respuesta cruda del Gem',
    secciones: ['Hero', 'Servicios'],
  },
  'concepto,secciones,titulo': {
    titulo: 'Landing demo — negocio local',
    concepto: 'One-page mobile-first con CTA de WhatsApp',
    secciones: ['Hero', 'Productos', 'Cómo pedir'],
  },
  'concepto,cta,notasMarca,secciones,titulo': {
    titulo: 'Pizzería Doña Clara',
    concepto: 'Pedidos por WhatsApp',
    cta: 'Pedí por WhatsApp',
    notasMarca: 'Rojo y crema, tipografía redondeada',
    secciones: ['Hero', 'Menú', 'Reseñas'],
  },
  'concepto,pegadoGem,secciones,titulo': {
    titulo: 'Landing demo — negocio local',
    concepto: 'One-page mobile-first con CTA de WhatsApp',
    secciones: ['Hero', 'Servicios', 'Reseñas', 'Contacto'],
    pegadoGem: 'Respuesta cruda del Gem de diseño (seed).',
  },
  'concepto,cta,notasMarca,pegadoGem,secciones,titulo': {
    titulo: 'Panadería San Cayetano',
    concepto: 'Barrio y horno propio',
    cta: 'Pedí por WhatsApp',
    notasMarca: 'Madera y crema',
    pegadoGem: 'BRIEF DEL GEM: hero, productos…',
    secciones: ['Hero', 'Productos'],
  },
  'concepto,cta,pegadoGem,secciones,titulo': {
    titulo: 'Gimnasio Norte',
    concepto: 'Clases grupales',
    cta: 'Reservá tu clase',
    pegadoGem: 'Respuesta del Gem',
    secciones: ['Hero', 'Clases'],
  },
  'concepto,cta,notasMarca,referenciasFicha,secciones,titulo': {
    titulo: 'Estudio Contable',
    concepto: 'Confianza',
    cta: 'Pedí tu turno',
    notasMarca: 'Azul marino',
    referenciasFicha: 'Ver ficha',
    secciones: ['Hero', 'Servicios'],
  },
}

const CLAVES_NUEVAS = ['tono', 'paleta', 'tipografia', 'documento', 'vueltas'] as const

function valores(parcial: Partial<ValoresVueltas> = {}): ValoresVueltas {
  return { ...valoresDeVueltas(null), ...parcial }
}

// ── §1 · Ningún brief guardado deja de parsear ──────────────────────────────

for (const [forma, guardado] of Object.entries(FORMAS_GUARDADAS)) {
  test(`1a · el brief guardado con la forma {${forma}} sigue parseando, igual`, () => {
    const leido = parseBrief(guardado)
    expect(leido, 'la lectura del producto no lo pierde').not.toBeNull()
    // Lo que tenía, lo sigue teniendo; y no le aparece ninguna clave nueva.
    for (const [clave, valor] of Object.entries(guardado as Record<string, unknown>)) {
      expect((leido as Record<string, unknown>)[clave], `conserva «${clave}»`).toEqual(valor)
    }
    for (const clave of CLAVES_NUEVAS) {
      expect(leido, `no inventa «${clave}»`).not.toHaveProperty(clave)
    }
  })
}

test('1b · el guardado de un brief viejo, re-editado, sigue validando con lo mismo de siempre', () => {
  // El payload que arma la pantalla para un brief viejo: sin vueltas, sin documento.
  const sinLink = briefInputSchemaPara(false)
  const viejo = { titulo: 'Landing demo', secciones: ['Hero'], pegadoGem: '' }
  expect(sinLink.safeParse(viejo).success).toBe(true)
  // Y lo que se exigía se sigue exigiendo: sin título o sin secciones, no.
  expect(sinLink.safeParse({ ...viejo, titulo: '' }).success).toBe(false)
  expect(sinLink.safeParse({ ...viejo, secciones: [] }).success).toBe(false)
  // Los campos nuevos no se exigen nunca, con link o sin él.
  const conLink = briefInputSchemaPara(true)
  const resultado = conLink.safeParse({ ...viejo, pegadoGem: 'lo que devolvió el Gem' })
  expect(resultado.success, 'con link, lo único que se suma es el pegado de siempre').toBe(true)
})

// ── §2 · El bloque de construcción ──────────────────────────────────────────

const BRIEF_BASE: Brief = {
  titulo: 'Barbería El Faro',
  concepto: VALORES_ENCABEZADO.ANGULO,
  secciones: [...VALORES_ENCABEZADO.SECCIONES],
  cta: VALORES_ENCABEZADO.CTA,
  notasMarca: 'Faro blanco sobre negro',
}

const BRIEF_CON_DIRECCION: Brief = {
  ...BRIEF_BASE,
  tono: VALORES_ENCABEZADO.TONO,
  paleta: VALORES_ENCABEZADO.PALETA,
  tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
}

/** Las partes del bloque, por su título (la primera línea de cada párrafo). */
const titulos = (bloque: string) => bloque.split('\n\n').map((parte) => parte.split('\n')[0]!)

test('2a · el bloque lleva TONO, PALETA y TIPOGRAFÍA, con lo que dice el brief', () => {
  const bloque = buildConstruccionBlock(LEAD, BRIEF_CON_DIRECCION, null)
  expect(bloque).toContain(`TONO (así escriben los textos de la demo)\n${VALORES_ENCABEZADO.TONO}`)
  expect(bloque).toContain(
    `PALETA (usá estos colores y ningún otro; el acento, solo en el botón principal)\n${VALORES_ENCABEZADO.PALETA}`,
  )
  expect(bloque).toContain(`TIPOGRAFÍA (usá estas fuentes, nunca la del sistema)\n${VALORES_ENCABEZADO.TIPOGRAFIA}`)
})

test('2b · y van con las decisiones de la demo: después del CTA, antes de lo que sale de la ficha', () => {
  const orden = titulos(buildConstruccionBlock(LEAD, BRIEF_CON_DIRECCION, { resenas: 'Buenísimo' }))
  const indice = (prefijo: string) => orden.findIndex((t) => t.startsWith(prefijo))
  expect(indice('LLAMADO A LA ACCIÓN')).toBeLessThan(indice('TONO'))
  expect(indice('TONO')).toBeLessThan(indice('PALETA'))
  expect(indice('PALETA')).toBeLessThan(indice('TIPOGRAFÍA'))
  expect(indice('TIPOGRAFÍA')).toBeLessThan(indice('NOTAS DE MARCA'))
  expect(indice('NOTAS DE MARCA')).toBeLessThan(indice('RESEÑAS REALES'))
})

test('2c · las otras secciones no se mueven: sacando las tres nuevas, el bloque es el de siempre', () => {
  const ficha = { resenas: 'Buenísimo', contenidoReal: 'Logo propio', senalesOperativas: 'Martes a sábados' }
  const conDireccion = buildConstruccionBlock(LEAD, BRIEF_CON_DIRECCION, ficha)
  const sinDireccion = buildConstruccionBlock(LEAD, BRIEF_BASE, ficha)
  const nuevas = /^(TONO|PALETA|TIPOGRAFÍA) \(/
  const quitadas = conDireccion
    .split('\n\n')
    .filter((parte) => !nuevas.test(parte))
    .join('\n\n')
  expect(quitadas).toBe(sinDireccion)
})

test('2d · el documento de la vuelta 4 viaja ENTERO, tal cual se pegó, y ya no se anuncia el faltante', () => {
  // Pegado con la caza de huecos antes: lo que no matchea el encabezado también viaja.
  const bloque = buildConstruccionBlock(LEAD, { ...BRIEF_CON_DIRECCION, documento: DOCUMENTO_CON_HUECOS_ANTES }, null)
  expect(bloque).toContain(`BRIEF COMPLETO DEL GEM DE DISEÑO\n${DOCUMENTO_CON_HUECOS_ANTES}`)
  expect(bloque).not.toContain(GUIA_BRIEF.campos.pegadoGem.faltante)
})

test('2e · con documento y pegado viejo, va el documento; la corrección de la vuelta 4 va solo con documento', () => {
  const conAmbos: Brief = {
    ...BRIEF_BASE,
    pegadoGem: 'Pegado de una sola vuelta',
    documento: DOCUMENTO_COMPLETO,
    vueltas: { huecos: { correccion: 'El botón va en naranja, no en negro.' } },
  }
  const bloque = buildConstruccionBlock(LEAD, conAmbos, null)
  expect(bloque).toContain(`BRIEF COMPLETO DEL GEM DE DISEÑO\n${DOCUMENTO_COMPLETO}`)
  expect(bloque).not.toContain('Pegado de una sola vuelta')
  expect(bloque).toContain('CORRECCIONES DEL SETTER AL DOCUMENTO')
  expect(bloque).toContain('El botón va en naranja, no en negro.')

  const sinDocumento = buildConstruccionBlock(
    LEAD,
    { ...BRIEF_BASE, vueltas: { huecos: { correccion: 'suelta' } } },
    null,
  )
  expect(sinDocumento, 'una corrección sin documento no tiene a qué corregir').not.toContain('CORRECCIONES')
})

test('2f · un brief sin lo del Gem sigue nombrando el faltante, y uno vacío de dirección no anuncia nada', () => {
  const bloque = buildConstruccionBlock(LEAD, BRIEF_BASE, null)
  expect(bloque).toContain(GUIA_BRIEF.campos.pegadoGem.faltante)
  expect(bloque).not.toContain('TONO (')
  expect(bloque).not.toContain('PALETA (')
  expect(bloque).not.toContain('TIPOGRAFÍA (')
  expect(faltaLaSalidaDelGem({ pegadoGem: undefined, documento: undefined })).toBe(true)
  expect(faltaLaSalidaDelGem({ pegadoGem: undefined, documento: DOCUMENTO_COMPLETO })).toBe(false)
})

// ── §3 · Lo que se guarda de las vueltas (decisión 2) ───────────────────────

const LAS_CUATRO = valores({
  lecturaRespuesta: VUELTA_LECTURA,
  lecturaCorreccion: 'El logo es blanco, no crema.',
  decisionesRespuesta: VUELTA_DECISIONES,
  decisionesCorreccion: '',
  especificacionRespuesta: VUELTA_ESPECIFICACION,
  especificacionCorreccion: 'Sacá la galería.',
  documento: DOCUMENTO_COMPLETO,
  documentoCorreccion: 'El botón va en naranja.',
})

test('3a · con documento: se guardan la lectura, las decisiones y las correcciones — el borrador no', () => {
  expect(vueltasParaGuardar(LAS_CUATRO)).toEqual({
    lectura: { respuesta: VUELTA_LECTURA, correccion: 'El logo es blanco, no crema.' },
    decisiones: { respuesta: VUELTA_DECISIONES },
    especificacion: { correccion: 'Sacá la galería.' },
    huecos: { correccion: 'El botón va en naranja.' },
  })
})

test('3b · sin documento todavía, el borrador SÍ se guarda: es lo único escrito', () => {
  const guardado = vueltasParaGuardar({ ...LAS_CUATRO, documento: '', documentoCorreccion: '' })
  expect(guardado?.especificacion?.respuesta).toBe(VUELTA_ESPECIFICACION)
})

test('3c · sin nada escrito, no hay clave de vueltas', () => {
  expect(vueltasParaGuardar(valores())).toBeUndefined()
  expect(vueltasParaGuardar(valores({ lecturaRespuesta: '   ' }))).toBeUndefined()
})

test('3d · ida y vuelta: lo que la pantalla guarda es lo que vuelve a leer', () => {
  const payload = {
    titulo: 'Barbería El Faro',
    secciones: [...VALORES_ENCABEZADO.SECCIONES],
    pegadoGem: '',
    tono: VALORES_ENCABEZADO.TONO,
    paleta: VALORES_ENCABEZADO.PALETA,
    tipografia: VALORES_ENCABEZADO.TIPOGRAFIA,
    documento: LAS_CUATRO.documento,
    vueltas: vueltasParaGuardar(LAS_CUATRO),
  }
  const entrada = briefInputSchemaPara(false).safeParse(payload)
  expect(entrada.success, 'el input valida').toBe(true)
  if (!entrada.success) return
  const guardado = BriefSchema.parse(entrada.data) // lo que hace `saveOwnedBrief`
  const leido = parseBrief(JSON.parse(JSON.stringify(guardado)))
  expect(leido).not.toBeNull()
  expect(valoresDeVueltas(leido)).toEqual({ ...LAS_CUATRO, especificacionRespuesta: '' })
  expect(leido?.paleta).toBe(VALORES_ENCABEZADO.PALETA)
})

test('3e · el documento tiene techo propio; el techo general de los otros diecinueve campos no se movió', () => {
  const base = { titulo: 'x', secciones: ['Hero'] }
  expect(TEXTO_LIBRE_MAX, 'el techo compartido sigue donde estaba').toBe(5000)
  expect(BriefSchema.safeParse({ ...base, documento: 'a'.repeat(TEXTO_DOCUMENTO_MAX) }).success).toBe(true)
  expect(BriefSchema.safeParse({ ...base, documento: 'a'.repeat(TEXTO_DOCUMENTO_MAX + 1) }).success).toBe(false)
  expect(BriefSchema.safeParse({ ...base, pegadoGem: 'a'.repeat(5001) }).success, 'el pegado conserva su techo').toBe(false)

  const largo = briefInputSchemaPara(false).safeParse({ ...base, pegadoGem: '', documento: 'a'.repeat(TEXTO_DOCUMENTO_MAX + 1) })
  expect(largo.success).toBe(false)
  if (largo.success) return
  const mensaje = largo.error.issues.find((i) => i.path[0] === 'documento')?.message ?? ''
  expect(mensaje, 'y el setter lee qué hacer, no «No se pudo guardar»').toMatch(/Pegá solo el documento definitivo/)
})

// ── §4 · La mecánica de la pantalla ─────────────────────────────────────────

test('4a · el recorrido: arranca en la primera vuelta sin pegar y avanza a la siguiente sin pegar', () => {
  expect(vueltaInicial(valores())).toBe('lectura')
  const dos = valores({ lecturaRespuesta: VUELTA_LECTURA, decisionesRespuesta: VUELTA_DECISIONES })
  expect(vueltaInicial(dos)).toBe('especificacion')
  expect(vueltaSiguiente('lectura', dos), 'saltea la que ya está').toBe('especificacion')
  expect(vueltaSiguiente('huecos', LAS_CUATRO), 'no hay a dónde ir: se queda').toBeNull()
  expect(vueltaInicial(LAS_CUATRO), 'con las cuatro, la del documento').toBe('huecos')
})

test('4b · la vuelta 3 queda cumplida por el documento que la reemplaza (el borrador no se guarda)', () => {
  const reabierto = valores({ documento: DOCUMENTO_COMPLETO })
  expect(vueltaCompleta('especificacion', reabierto)).toBe(true)
  expect(vueltaCompleta('lectura', reabierto)).toBe(false)
})

test('4c · autollenado: completa lo vacío, no pisa lo del setter, y se actualiza si el setter no lo tocó', () => {
  const vacios: CamposLeidos = { concepto: '', seccionesTexto: '', cta: 'Escribime', tono: '', paleta: '', tipografia: '' }
  const primera = autollenar(vacios, leerEncabezado(DOCUMENTO_COMPLETO), {})
  expect(primera.campos.seccionesTexto).toBe(VALORES_ENCABEZADO.SECCIONES.join('\n'))
  expect(primera.campos.paleta).toBe(VALORES_ENCABEZADO.PALETA)
  expect(primera.campos.cta, 'lo que escribió el setter queda').toBe('Escribime')
  expect(primera.completados).toEqual(['concepto', 'seccionesTexto', 'tono', 'paleta', 'tipografia'])

  // El setter corrige la paleta a mano; el Gem manda un documento con otra tipografía.
  const editado = { ...primera.campos, paleta: 'la mía' }
  const corregido = DOCUMENTO_COMPLETO.replace(VALORES_ENCABEZADO.TIPOGRAFIA, 'títulos Anton / cuerpo Inter').replace(
    VALORES_ENCABEZADO.PALETA,
    'otra paleta',
  )
  const segunda = autollenar(editado, leerEncabezado(corregido), primera.puestos)
  expect(segunda.campos.tipografia, 'lo que puso el lector se actualiza').toBe('títulos Anton / cuerpo Inter')
  expect(segunda.campos.paleta, 'lo que editó el setter, no').toBe('la mía')
  expect(diferenciasConLoLeido(segunda.campos, leerEncabezado(corregido)).map((d) => d.campo)).toEqual([
    'cta',
    'paleta',
  ])
})

test('4d · el mensaje de cada vuelta trae lo que el setter pegó en la anterior, con su corrección', () => {
  expect(mensajeDeVuelta('lectura', valores(), 'FICHA DE OBSERVACIÓN — Barbería El Faro')).toContain(
    'FICHA DE OBSERVACIÓN — Barbería El Faro',
  )
  const conLectura = valores({ lecturaRespuesta: VUELTA_LECTURA, lecturaCorreccion: 'El logo es blanco.' })
  const mensaje2 = mensajeDeVuelta('decisiones', conLectura, null)
  expect(mensaje2).toContain(VUELTA_LECTURA)
  expect(mensaje2).toContain('Mis correcciones:\nEl logo es blanco.')
  expect(mensajeDeVuelta('decisiones', valores(), null), 'sin la vuelta 1, el lugar queda marcado').toMatch(
    /\[Todavía no pegaste la lectura de la vuelta 1/,
  )
  expect(mensajeDeVuelta('huecos', valores({ especificacionCorreccion: 'Sacá la galería.' }), null)).toContain(
    'Sacá la galería.',
  )
})

test('4e · el mensaje de la vuelta 3 enseña EXACTAMENTE las seis etiquetas que lee el producto, y la 4 las pide', () => {
  const lectura = leerEncabezado(mensajeDeVuelta('especificacion', valores(), null))
  expect(lectura.estado, 'el propio molde del encabezado se lee completo').toBe('completo')
  if (lectura.estado !== 'completo') return
  expect(Object.keys(lectura.valores).sort()).toEqual(['ANGULO', 'CTA', 'PALETA', 'SECCIONES', 'TIPOGRAFIA', 'TONO'])
  expect(mensajeDeVuelta('huecos', valores(), null)).toMatch(
    /empezando con el mismo encabezado de seis líneas \(ANGULO,\s+SECCIONES, CTA, TONO, PALETA, TIPOGRAFIA\)/,
  )
})

test('4f · un error adentro de una vuelta se cuelga de su campo', () => {
  expect(campoDeError(['vueltas', 'lectura', 'respuesta'])).toBe('lecturaRespuesta')
  expect(campoDeError(['vueltas', 'huecos', 'correccion'])).toBe('documentoCorreccion')
  expect(campoDeError(['documento'])).toBe('documento')
  expect(campoDeError(['titulo'])).toBeNull()
  expect(campoDeError(['vueltas', 'inventada', 'respuesta'])).toBeNull()
})

import { test, expect } from '@playwright/test'
import { briefInputSchemaPara } from '../../src/app/(protected)/setter/_actions/dossier.schemas'
import { buildConstruccionBlock } from '../../src/lib/leados/copy-blocks'
import { GUIA_BRIEF } from '../../src/lib/leados/guidance-content'
import {
  HERRAMIENTAS,
  faltaPorHerramientaSinLink,
  herramientaSinLink,
} from '../../src/lib/leados/herramientas'
import type { Brief, Ficha } from '../../src/lib/leados/contracts'
import type { CopyBlockLead } from '../../src/lib/leados/copy-blocks'

/**
 * LA REGLA: un campo que pide TRANSCRIBIR la salida de una herramienta se exige
 * solo si esa herramienta se puede abrir.
 *
 * Por qué acá y no en el browser. El estado «con link» no se alcanza en una
 * corrida: `HERRAMIENTAS` es una constante de módulo, y cambiarla pide un build
 * nuevo. La suite de browser puede probar UN solo lado (el real de hoy: los
 * cuatro Gems sin URL). Los DOS lados se prueban acá, contra el schema y los
 * helpers REALES — no contra una copia que se desincroniza.
 *
 * Contra el código viejo el primer caso falla: `pegadoGem` era
 * `z.string().trim().min(1, …)` clavado, así que un brief sin el pegado rebotaba
 * SIEMPRE — también cuando el Gem no se podía abrir, que es cuando el único modo
 * de completarlo era inventarlo.
 */

const BRIEF_BASE = {
  titulo: 'Panadería San Cayetano',
  concepto: 'Barrio, horno propio, pedidos por WhatsApp',
  secciones: ['Hero', 'Productos', 'Reseñas', 'Cómo pedir'],
  cta: 'Pedí por WhatsApp',
}

const LEAD: CopyBlockLead = {
  businessName: 'Panadería San Cayetano',
  industry: 'gastronomia',
  zone: 'Centro',
  instagramUrl: 'https://instagram.com/panaderia',
  currentWebUrl: null,
  googleMapsUrl: null,
}

const FICHA: Ficha = { contenidoReal: 'logo en el IG, fotos propias' }

function briefCon(pegadoGem: string | undefined): Brief {
  return { ...BRIEF_BASE, pegadoGem } as Brief
}

// ── El terreno que estos casos asumen ───────────────────────────────────────

test('guard · el Gem de diseño sigue sin link y Netlify Drop sigue con link', () => {
  // Los dos lados de la regla necesitan una herramienta de cada clase para poder
  // afirmarse contra el registro real. El día que Franco cargue el Gem, este
  // guard falla ruidoso pidiendo actualizar el spec, en vez de dejar que los
  // casos de abajo pasen en verde sobre un sujeto que cambió de estado.
  expect(HERRAMIENTAS.gemDiseno.url, 'el Gem de diseño todavía no tiene link').toBeNull()
  expect(HERRAMIENTAS.netlifyDrop.url, 'Netlify Drop sí tiene link').toBeTruthy()
  expect(herramientaSinLink('gemDiseno')).toBe(true)
  expect(herramientaSinLink('netlifyDrop')).toBe(false)
})

// ── 1 · La obligatoriedad SIGUE al registro, en los dos sentidos ────────────

test('1a · sin link, el brief se guarda con el pegado del Gem vacío', () => {
  const sinLink = briefInputSchemaPara(false)
  const resultado = sinLink.safeParse({ ...BRIEF_BASE, pegadoGem: '' })
  expect(
    resultado.success,
    'obedecer la pantalla era imposible: pedía transcribir lo que devuelve algo que no se puede abrir',
  ).toBe(true)
})

test('1b · con link cargado, el mismo brief vacío vuelve a rebotar — y en castellano', () => {
  const conLink = briefInputSchemaPara(true)
  const resultado = conLink.safeParse({ ...BRIEF_BASE, pegadoGem: '' })
  expect(resultado.success, 'con la herramienta a mano el pegado se exige de nuevo').toBe(false)
  if (resultado.success) return
  const mensaje = resultado.error.issues.find((i) => i.path[0] === 'pegadoGem')?.message
  expect(mensaje).toBe('Pegá la respuesta completa del Gem de diseño')
})

test('1c · aflojar el pegado NO aflojó el resto del brief', () => {
  // El asterisco que se saca es UNO. `titulo` y `secciones` no se transcriben del
  // Gem: son el plano que el setter escribe solo, y sin secciones la demo no se
  // puede construir. Si un día alguien los arrastra en la misma pasada, acá se ve.
  const sinLink = briefInputSchemaPara(false)
  expect(sinLink.safeParse({ ...BRIEF_BASE, titulo: '', pegadoGem: '' }).success).toBe(false)
  expect(sinLink.safeParse({ ...BRIEF_BASE, secciones: [], pegadoGem: '' }).success).toBe(false)
})

// ── 2 · El dato que no está se trata como FALTANTE, no como vacío legítimo ──

test('2a · el faltante se deriva del link, no del vacío', () => {
  // Vacío + herramienta inalcanzable = falta. Vacío + herramienta a mano = el
  // setter lo dejó así, y eso no se marca. Netlify Drop es el contra-ejemplo con
  // URL real: prueba que el discriminador es el link y no la ausencia de texto.
  expect(faltaPorHerramientaSinLink('gemDiseno', '')).toBe(true)
  expect(faltaPorHerramientaSinLink('gemDiseno', '   ')).toBe(true)
  expect(faltaPorHerramientaSinLink('gemDiseno', undefined)).toBe(true)
  expect(faltaPorHerramientaSinLink('gemDiseno', 'el brief que devolvió el Gem')).toBe(false)
  expect(faltaPorHerramientaSinLink('netlifyDrop', '')).toBe(false)
})

test('2b · el bloque de Construcción NOMBRA el pegado que falta en vez de omitirlo', () => {
  // Éste es el assert que falla contra el código viejo: `seccion()` devuelve null
  // con el texto vacío, así que el bloque que se pega en Claude Design salía más
  // corto, sin decir que le faltaba la pieza. El setter lee ese mismo bloque.
  const bloque = buildConstruccionBlock(LEAD, briefCon(undefined), FICHA)
  expect(bloque).toContain('BRIEF COMPLETO DEL GEM DE DISEÑO')
  expect(bloque).toContain(GUIA_BRIEF.campos.pegadoGem.faltante)
})

test('2c · con el pegado presente el bloque lleva el pegado, no la marca', () => {
  const bloque = buildConstruccionBlock(LEAD, briefCon('BRIEF DEL GEM: hero, productos…'), FICHA)
  expect(bloque).toContain('BRIEF DEL GEM: hero, productos…')
  expect(bloque).not.toContain(GUIA_BRIEF.campos.pegadoGem.faltante)
})

test('2d · un campo que el setter dejó vacío A PROPÓSITO se sigue omitiendo', () => {
  // El bloque no se llenó de avisos: la regla vieja del builder («lo que está
  // vacío se OMITE; nunca se rellena ni se anuncia como faltante») sigue
  // valiendo para todo lo demás. El pegado del Gem es la ÚNICA excepción, y lo
  // es porque su vacío no lo eligió nadie. Un CTA sin escribir no anuncia nada.
  const sinCta = { ...briefCon(undefined), cta: undefined } as Brief
  const bloque = buildConstruccionBlock(LEAD, sinCta, FICHA)
  expect(bloque).toContain(GUIA_BRIEF.campos.pegadoGem.faltante)
  expect(bloque).not.toContain('LLAMADO A LA ACCIÓN')
})

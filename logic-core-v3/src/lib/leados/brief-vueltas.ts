/**
 * LeadOS · P40 — LAS CUATRO VUELTAS CON EL GEM DE DISEÑO, como lógica pura.
 *
 * La pantalla del brief (m6) deja de ser un solo pegado: el setter hace cuatro
 * vueltas cortas con el Gem, con parada entre cada una, y pega de vuelta lo que
 * aprobó. Este módulo es el MAPA de eso —qué campo es de qué vuelta, qué es una
 * vuelta completa, a cuál avanza el recorrido, qué se guarda— y el puente entre
 * el encabezado leído del documento y los campos del brief. El mismo patrón que
 * `ficha-bloques.ts`: las palabras viven en `guidance-content.ts`, la mecánica
 * del acordeón en `bloques-secuenciales.tsx`, y acá ninguna de las dos.
 *
 * ── Qué NO hace ──────────────────────────────────────────────────────────────
 * No bloquea nada. «Incompleta» solo significa «el recorrido no avanza solo desde
 * acá»: las cuatro cabeceras abren con un click, y el guardado del brief exige lo
 * mismo que exigía antes de este sprint (`briefInputSchemaPara`). Que las vueltas
 * gatearan el guardado sería un gate nuevo, y además hoy el Gem no tiene link: la
 * única forma de cumplirlo sería inventar lo que devuelve.
 *
 * Sin React, sin Prisma: importable desde el cliente y desde las pruebas.
 */
import type { Brief, VueltasBrief } from '@/lib/leados/contracts'
import {
  ETIQUETAS,
  type Etiqueta,
  type LecturaEncabezado,
  type ValoresEncabezado,
} from '@/lib/leados/encabezado-documento'
import { GUIA_BRIEF, GUIA_LECTURA_DOCUMENTO } from '@/lib/leados/guidance-content'
import { faltaPorHerramientaSinLink } from '@/lib/leados/herramientas'

// ── Las vueltas, en orden ────────────────────────────────────────────────────

/** Llaves estables de las vueltas: se persisten en `brief.vueltas`. */
export const VUELTA_IDS = ['lectura', 'decisiones', 'especificacion', 'huecos'] as const
export type VueltaId = (typeof VUELTA_IDS)[number]

/** Los textos de las cuatro vueltas tal como los tiene el formulario. */
export type ValoresVueltas = {
  lecturaRespuesta: string
  lecturaCorreccion: string
  decisionesRespuesta: string
  decisionesCorreccion: string
  especificacionRespuesta: string
  especificacionCorreccion: string
  /** La respuesta de la vuelta 4 es el documento de construcción. */
  documento: string
  documentoCorreccion: string
}

export type CampoVuelta = keyof ValoresVueltas

/** Qué campo del formulario es la respuesta y cuál la corrección de cada vuelta. */
export const CAMPOS_DE_VUELTA: Record<VueltaId, { respuesta: CampoVuelta; correccion: CampoVuelta }> = {
  lectura: { respuesta: 'lecturaRespuesta', correccion: 'lecturaCorreccion' },
  decisiones: { respuesta: 'decisionesRespuesta', correccion: 'decisionesCorreccion' },
  especificacion: { respuesta: 'especificacionRespuesta', correccion: 'especificacionCorreccion' },
  huecos: { respuesta: 'documento', correccion: 'documentoCorreccion' },
}

const conTexto = (valor: string | undefined | null): boolean => Boolean(valor?.trim())

/**
 * COMPLETA = el setter pegó lo que devolvió el Gem en esa vuelta.
 *
 * La corrección no cuenta: es opcional. Y la vuelta 3 también queda cumplida
 * cuando llegó el documento de la 4, que la reemplaza — el borrador no se guarda
 * una vez que existe el definitivo, así que un brief que se vuelve a abrir no
 * puede pedir de nuevo un borrador que ya se usó.
 */
export function vueltaCompleta(vuelta: VueltaId, valores: ValoresVueltas): boolean {
  if (conTexto(valores[CAMPOS_DE_VUELTA[vuelta].respuesta])) return true
  return vuelta === 'especificacion' && conTexto(valores.documento)
}

/** Cuántas de las cuatro vueltas están completas. */
export function vueltasCompletas(valores: ValoresVueltas): number {
  return VUELTA_IDS.filter((vuelta) => vueltaCompleta(vuelta, valores)).length
}

/**
 * La vuelta que se despliega AL ENTRAR: la primera incompleta, que es donde quedó
 * el trabajo. Con las cuatro completas, la última — la del documento, que es la
 * que viaja a la construcción.
 */
export function vueltaInicial(valores: ValoresVueltas): VueltaId {
  return VUELTA_IDS.find((vuelta) => !vueltaCompleta(vuelta, valores)) ?? 'huecos'
}

/**
 * A dónde avanza solo el recorrido cuando la vuelta abierta quedó completa: a la
 * primera incompleta DESPUÉS de ella. `null` si no queda ninguna: el recorrido se
 * queda donde está, nunca retrocede ni le cierra al setter lo que abrió a mano.
 */
export function vueltaSiguiente(desde: VueltaId, valores: ValoresVueltas): VueltaId | null {
  const posteriores = VUELTA_IDS.slice(VUELTA_IDS.indexOf(desde) + 1)
  return posteriores.find((vuelta) => !vueltaCompleta(vuelta, valores)) ?? null
}

// ── Puente con el brief guardado ─────────────────────────────────────────────

/** El brief guardado, aplanado a los textos del formulario. */
export function valoresDeVueltas(brief: Brief | null | undefined): ValoresVueltas {
  const vueltas = brief?.vueltas
  return {
    lecturaRespuesta: vueltas?.lectura?.respuesta ?? '',
    lecturaCorreccion: vueltas?.lectura?.correccion ?? '',
    decisionesRespuesta: vueltas?.decisiones?.respuesta ?? '',
    decisionesCorreccion: vueltas?.decisiones?.correccion ?? '',
    especificacionRespuesta: vueltas?.especificacion?.respuesta ?? '',
    especificacionCorreccion: vueltas?.especificacion?.correccion ?? '',
    documento: brief?.documento ?? '',
    documentoCorreccion: vueltas?.huecos?.correccion ?? '',
  }
}

/**
 * El campo del formulario al que pertenece un error de validación de las
 * vueltas (`['vueltas', 'lectura', 'respuesta']` → `lecturaRespuesta`). `null`
 * si el error no es de una vuelta. Sirve para colgar el mensaje del campo que lo
 * causó y abrir su vuelta — un error en una vuelta plegada no se ve.
 */
export function campoDeError(ruta: readonly PropertyKey[]): CampoVuelta | null {
  const [raiz, vuelta, parte] = ruta
  if (raiz === 'documento') return 'documento'
  if (raiz !== 'vueltas' || typeof vuelta !== 'string' || !(VUELTA_IDS as readonly string[]).includes(vuelta)) {
    return null
  }
  if (parte !== 'respuesta' && parte !== 'correccion') return null
  return CAMPOS_DE_VUELTA[vuelta as VueltaId][parte]
}

/** La vuelta en la que vive cada campo del formulario (completa por tipo). */
export const VUELTA_DE_CAMPO: Record<CampoVuelta, VueltaId> = {
  lecturaRespuesta: 'lectura',
  lecturaCorreccion: 'lectura',
  decisionesRespuesta: 'decisiones',
  decisionesCorreccion: 'decisiones',
  especificacionRespuesta: 'especificacion',
  especificacionCorreccion: 'especificacion',
  documento: 'huecos',
  documentoCorreccion: 'huecos',
}

/** Saca las claves vacías; si no queda ninguna, no hay objeto. */
function podar<T extends Record<string, string | undefined>>(objeto: T): Partial<T> | undefined {
  const lleno = Object.fromEntries(
    Object.entries(objeto)
      .map(([clave, valor]) => [clave, valor?.trim()])
      .filter(([, valor]) => Boolean(valor)),
  ) as Partial<T>
  return Object.keys(lleno).length > 0 ? lleno : undefined
}

/**
 * LO QUE SE GUARDA de las vueltas — la decisión 2 del sprint, aplicada en un
 * solo lugar (ver `VueltasBriefSchema` en `contracts.ts`):
 *   · lectura y decisiones, enteras;
 *   · el borrador de la 3 SOLO si todavía no hay documento;
 *   · de la 4, la corrección (el documento viaja en su propio campo).
 * Devuelve `undefined` si no hay nada escrito: un brief sin vueltas no carga una
 * clave vacía.
 */
export function vueltasParaGuardar(valores: ValoresVueltas): VueltasBrief | undefined {
  const hayDocumento = conTexto(valores.documento)
  const vueltas = {
    lectura: podar({ respuesta: valores.lecturaRespuesta, correccion: valores.lecturaCorreccion }),
    decisiones: podar({
      respuesta: valores.decisionesRespuesta,
      correccion: valores.decisionesCorreccion,
    }),
    especificacion: podar({
      respuesta: hayDocumento ? undefined : valores.especificacionRespuesta,
      correccion: valores.especificacionCorreccion,
    }),
    huecos: podar({ correccion: valores.documentoCorreccion }),
  }
  return sinVueltasVacias(vueltas)
}

function sinVueltasVacias(vueltas: VueltasBrief): VueltasBrief | undefined {
  const llenas = Object.fromEntries(
    Object.entries(vueltas).filter(([, vuelta]) => vuelta !== undefined),
  ) as VueltasBrief
  return Object.keys(llenas).length > 0 ? llenas : undefined
}

/**
 * ¿Falta lo que devuelve el Gem PORQUE el Gem no se puede abrir? Es la regla del
 * faltante de siempre (`faltaPorHerramientaSinLink` sobre el pegado) con una
 * condición más: un brief armado con las cuatro vueltas trae el documento, y
 * decir «sin la respuesta del Gem» sobre ese brief sería mentir. Una sola copia
 * para las tres superficies que lo dicen: el resumen del setter, la revisión de
 * Franco y el bloque de construcción.
 */
export function faltaLaSalidaDelGem(brief: Pick<Brief, 'pegadoGem' | 'documento'>): boolean {
  return !conTexto(brief.documento) && faltaPorHerramientaSinLink('gemDiseno', brief.pegadoGem)
}

// ── Lo leído del encabezado, en los campos del brief ─────────────────────────

/** Los campos del formulario del brief que el encabezado del documento llena. */
export type CampoLeido = 'concepto' | 'seccionesTexto' | 'cta' | 'tono' | 'paleta' | 'tipografia'

/** A qué campo va cada etiqueta del contrato. */
export const CAMPO_DE_ETIQUETA: Record<Etiqueta, CampoLeido> = {
  ANGULO: 'concepto',
  SECCIONES: 'seccionesTexto',
  CTA: 'cta',
  TONO: 'tono',
  PALETA: 'paleta',
  TIPOGRAFIA: 'tipografia',
}

export type CamposLeidos = Record<CampoLeido, string>

/** El valor de una etiqueta dicho como lo escribe el formulario (secciones: una por línea). */
export function textoDeEtiqueta(etiqueta: Etiqueta, valores: ValoresEncabezado): string | null {
  if (etiqueta === 'SECCIONES') {
    return valores.SECCIONES && valores.SECCIONES.length > 0 ? valores.SECCIONES.join('\n') : null
  }
  return valores[etiqueta] ?? null
}

export type Autollenado = {
  campos: CamposLeidos
  /** El último valor que el lector puso en cada campo (para saber si el setter lo tocó). */
  puestos: Partial<CamposLeidos>
  /** Los campos que cambiaron en esta pasada. */
  completados: CampoLeido[]
}

/**
 * Pasa lo leído del encabezado a los campos del brief, SIN pisar lo del setter.
 *
 * Un campo se llena si está vacío, o si todavía tiene exactamente lo que el
 * lector le puso la vez anterior (el setter no lo tocó): así, si el setter pega
 * un documento corregido, lo leído se actualiza solo. Un campo que el setter
 * escribió o editó a mano no se toca nunca — la diferencia se muestra, no se
 * resuelve por él.
 */
export function autollenar(
  campos: CamposLeidos,
  lectura: LecturaEncabezado,
  puestos: Partial<CamposLeidos>,
): Autollenado {
  if (lectura.estado !== 'completo' && lectura.estado !== 'incompleto') {
    return { campos, puestos, completados: [] }
  }
  const nuevos: CamposLeidos = { ...campos }
  const nuevosPuestos: Partial<CamposLeidos> = { ...puestos }
  const completados: CampoLeido[] = []
  for (const etiqueta of ETIQUETAS) {
    const texto = textoDeEtiqueta(etiqueta, lectura.valores)
    if (texto === null) continue
    const campo = CAMPO_DE_ETIQUETA[etiqueta]
    const actual = campos[campo]
    const libre = !actual.trim() || actual === puestos[campo]
    if (!libre || actual === texto) continue
    nuevos[campo] = texto
    nuevosPuestos[campo] = texto
    completados.push(campo)
  }
  return { campos: nuevos, puestos: nuevosPuestos, completados }
}

export type DiferenciaConLoLeido = { etiqueta: Etiqueta; campo: CampoLeido; documento: string }

/**
 * Los campos donde lo que tiene el setter NO coincide con lo que dice el
 * documento. Solo los que el setter escribió a mano: los que llenó el lector
 * coinciden por construcción.
 */
export function diferenciasConLoLeido(
  campos: CamposLeidos,
  lectura: LecturaEncabezado,
): DiferenciaConLoLeido[] {
  if (lectura.estado !== 'completo' && lectura.estado !== 'incompleto') return []
  return ETIQUETAS.flatMap((etiqueta) => {
    const texto = textoDeEtiqueta(etiqueta, lectura.valores)
    const campo = CAMPO_DE_ETIQUETA[etiqueta]
    const actual = campos[campo].trim()
    if (texto === null || !actual || actual === texto.trim()) return []
    return [{ etiqueta, campo, documento: texto }]
  })
}

// ── Lo que la pantalla le dice al setter ─────────────────────────────────────

export type ExplicacionLectura = {
  /** `listo`: se leyó lo que la construcción necesita. `aviso`: falta algo. */
  tono: 'listo' | 'aviso'
  titulo: string
  lineas: string[]
  /** Qué hacer, cuando hay algo para hacer. */
  queHacer: string | null
}

/** «a», «a y b», «a, b y c». */
function enLista(items: readonly string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

const nombreDeCampo = (campo: CampoLeido) => `«${GUIA_BRIEF.campos[campo].label}»`

/**
 * La lectura del encabezado, dicha en idioma del setter: qué se leyó, qué falta,
 * por qué importa y qué hacer. `null` si todavía no hay documento — no hay nada
 * que decir. Nunca dice que algo se frena: el brief se guarda igual en los tres
 * casos, y cada mensaje de aviso lo aclara.
 */
export function explicarLectura(
  lectura: LecturaEncabezado,
  extras: {
    completados?: readonly CampoLeido[]
    diferencias?: readonly DiferenciaConLoLeido[]
  } = {},
): ExplicacionLectura | null {
  const textos = GUIA_LECTURA_DOCUMENTO
  if (lectura.estado === 'vacio') return null
  if (lectura.estado === 'sin-encabezado') {
    return {
      tono: 'aviso',
      titulo: textos.titulo.sinEncabezado,
      lineas: [textos.sinEncabezado],
      queHacer: textos.queHacerSinEncabezado,
    }
  }

  const lineas: string[] = []
  if (lectura.estado === 'completo') lineas.push(textos.completo)
  for (const etiqueta of lectura.faltanObligatorias) {
    lineas.push(`${textos.faltaPrefijo}${etiqueta}: ${textos.porQueImporta[etiqueta]}.`)
  }
  if (lectura.faltanOpcionales.length > 0) {
    lineas.push(`${textos.opcionalesPrefijo}${enLista(lectura.faltanOpcionales)}${textos.opcionalesSufijo}`)
  }
  if (extras.completados && extras.completados.length > 0) {
    lineas.push(`${textos.completadosPrefijo}${enLista(extras.completados.map(nombreDeCampo))}.`)
  }
  for (const diferencia of extras.diferencias ?? []) {
    lineas.push(
      `${textos.diferenciaPrefijo}${nombreDeCampo(diferencia.campo)}${textos.diferenciaMedio}` +
        `«${diferencia.documento.replace(/\n/g, ' · ')}»${textos.diferenciaSufijo}`,
    )
  }
  if (lectura.antes > 0) {
    const renglones = lectura.antes === 1 ? '1 renglón' : `${lectura.antes} renglones`
    lineas.push(`${textos.antesPrefijo}${renglones}${textos.antesSufijo}`)
  }
  if (lectura.otras.length > 0) {
    lineas.push(`${textos.otrasPrefijo}${lectura.otras.map((o) => `«${o.texto}»`).join(' · ')}.`)
  }
  if (lectura.repetidas.length > 0) {
    lineas.push(`${textos.repetidasPrefijo}${lectura.repetidas.map((r) => `«${r.texto}»`).join(' · ')}.`)
  }

  return lectura.estado === 'completo'
    ? { tono: 'listo', titulo: textos.titulo.completo, lineas, queHacer: null }
    : { tono: 'aviso', titulo: textos.titulo.incompleto, lineas, queHacer: textos.queHacerIncompleto }
}

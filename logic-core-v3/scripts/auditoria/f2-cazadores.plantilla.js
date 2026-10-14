export const meta = {
  name: 'f2-ciclo-cazadores',
  description: 'F2 ciclos 2-3: cazadores de huecos con lente por tramo + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Caza', detail: 'un cazador general-purpose por tramo, con la lente del ciclo' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del tramo' },
  ],
}

// Plantilla de los ciclos 2 y 3 de F2 (auditoría de renovación 2026-10, DEC-26). La completa
// f2-construir.mjs igual que la de lectores. Un cazador por tramo de <= 16k LOC: el dominio ya
// se leyó completo en el ciclo 1; el cazador busca lo que se pasó con la lente del ciclo y
// recibe los títulos ya registrados para no repetirlos. El meta tiene que ser lo primero.

// args: { dominio, nombre, ciclo, lente, foco, contexto, lotes: [{id, archivos, loc, titulos_existentes, planeado, alertas_pendientes}] }
const A = args
const APP = 'C:\\auditoria-2026-10\\logic-core-v3'

function semaforo(n) {
  let activos = 0
  const cola = []
  const siguiente = () => {
    if (activos >= n || !cola.length) return
    activos++
    const { fn, resolver } = cola.shift()
    Promise.resolve().then(fn).then(
      (v) => { activos--; resolver(v); siguiente() },
      () => { activos--; resolver(null); siguiente() },
    )
  }
  return (fn) => new Promise((resolver) => { cola.push({ fn, resolver }); siguiente() })
}
const sem = semaforo(3)

const SCHEMA_CAZADOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    cobertura_lente: { type: 'array', items: { type: 'object', properties: { que: { type: 'string' }, resultado: { type: 'string' } }, required: ['que', 'resultado'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
  },
  required: ['archivos_leidos', 'cobertura_lente', 'hallazgos', 'planeado_cruzado', 'alertas_verificadas', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptCazador = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU TRAMO: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}. SOS UN CAZADOR DE HUECOS CON LENTE: ${A.lente}
El ciclo 1 ya leyo completo este dominio y registro los hallazgos de abajo. Tu trabajo es encontrar lo que se le paso, mirando con la lente. No repitas un titulo existente: si lo que encontras es la misma causa raiz, no va; si es otra causa o el mismo patron en otro lugar no citado, si va (con su propia evidencia).
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL TRAMO (${l.archivos.length} archivos, ${l.loc} lineas; rutas relativas a ${APP}). Lee todos los que importan para la lente (las entradas: pages, layouts, route handlers y server actions, siempre); en cobertura_lente deci que revisaste y con que resultado (por entrada o por grupo de archivos):
${l.archivos.map((f) => '- ' + f).join('\n')}

TITULOS YA REGISTRADOS EN ESTE DOMINIO (no repetir):
${l.titulos_existentes && l.titulos_existentes.length ? l.titulos_existentes.map((t) => '- ' + t).join('\n') : '- (ninguno)'}

LO PLANEADO QUE QUEDO SIN CRUZAR (devolve una entrada por item en planeado_cruzado, con id y clave; evidencia ruta:linea o git grep con control positivo):
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado})`).join('\n') : '- (ninguno)'}

ALERTAS QUE QUEDARON SIN RESOLVER (una entrada por alerta en alertas_verificadas):
${l.alertas_pendientes && l.alertas_pendientes.length ? l.alertas_pendientes.map((a) => '- ' + a).join('\n') : '- (ninguna)'}

${A.herramientas}

QUE DEVOLVES (StructuredOutput): hallazgos nuevos en el formato pedido (evidencia ruta:linea REAL con fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas; si hace falta runtime, base o navegador: requiere_verificacion_humana=true y el caso en casos_prueba_manual); cobertura_lente; planeado_cruzado; alertas_verificadas; ausencias (toda afirmacion 'no existe X' con su git grep sobre origin/main y control positivo); patrones_a_cruzar. Si con la lente no encontras nada nuevo, devolve hallazgos vacio: es un resultado valido y cuenta para cerrar el dominio.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un cazador reporto estos hallazgos CRITICA/ALTA sobre el tramo ${l.id} (dominio ${A.dominio}, lente: ${A.lente}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Caza')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptCazador(l), { label: `cazador:${l.id}`, phase: 'Caza', schema: SCHEMA_CAZADOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos nuevos (${graves.length} CRITICA/ALTA)`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }

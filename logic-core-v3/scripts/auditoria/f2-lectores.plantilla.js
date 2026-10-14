export const meta = {
  name: 'f2-ciclo-lectores',
  description: 'F2: lectores por lote de un dominio + verificador adversarial solo para CRITICA/ALTA (tope 3 agentes)',
  phases: [
    { title: 'Lectura', detail: 'un lector general-purpose por lote' },
    { title: 'Verificacion', detail: 'verificador adversarial de CRITICA/ALTA del lote' },
  ],
}

// Plantilla del workflow de F2 (auditoría de renovación 2026-10). La completa f2-construir.mjs:
// reemplaza la línea de la constante A por los argumentos del ciclo, el preámbulo, el PROMPT textual,
// la rúbrica y las herramientas. Lectores por lote (semáforo de 3) + verificador adversarial
// solo para CRÍTICA/ALTA (DEC-37). El meta tiene que ser lo primero del archivo.

// args: { dominio, nombre, ciclo, lente, foco, contexto, prompt_textual, herramientas, lotes: [{id, archivos, carpetas, loc, previas, planeado, insumos}] }
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

const CUMPLE = { type: 'object', properties: { cumple: { type: 'string', enum: ['si', 'no', 'parcial', 'n/a'] }, evidencia: { type: 'string' } }, required: ['cumple', 'evidencia'] }
const SCHEMA_LECTOR = {
  type: 'object',
  properties: {
    archivos_leidos: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, lineas_total: { type: 'number' }, leido_completo: { type: 'boolean' }, rangos: { type: 'string' } }, required: ['ruta', 'lineas_total', 'leido_completo'] } },
    entradas: { type: 'array', items: { type: 'object', properties: {
      archivo: { type: 'string' }, simbolo: { type: 'string' }, tipo: { type: 'string', enum: ['page', 'layout', 'route-handler', 'server-action'] }, url: { type: 'string' },
      auth: { type: 'string', enum: ['si', 'no', 'parcial', 'heredado'] }, evidencia_auth: { type: 'string' },
      rol: { type: 'string' }, evidencia_rol: { type: 'string' },
      org_de: { type: 'string', enum: ['sesion', 'parametro', 'mixto', 'no-aplica', 'no-filtra'] }, evidencia_org: { type: 'string' },
      validacion: { type: 'string', enum: ['zod', 'manual', 'parcial', 'no', 'no-aplica'] }, evidencia_validacion: { type: 'string' },
      rate_limit: { type: 'string', enum: ['si', 'no', 'no-aplica'] }, notas: { type: 'string' },
    }, required: ['archivo', 'simbolo', 'tipo', 'auth', 'evidencia_auth', 'rol', 'org_de', 'evidencia_org', 'validacion', 'rate_limit'] } },
    flujos: { type: 'array', items: { type: 'object', properties: { nombre: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } } }, required: ['nombre', 'pasos'] } },
    hallazgos: { type: 'array', items: { type: 'object', properties: {
      titulo: { type: 'string' }, prefijo: { type: 'string', enum: ['SEC', 'BUG', 'TEC', 'PERF', 'DEU', 'A11Y', 'UX', 'FAL'] },
      severidad: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA'] }, tipo: { type: 'string' },
      confianza: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] },
      evidencia: { type: 'array', items: { type: 'object', properties: { ruta: { type: 'string' }, linea: { type: 'number' }, fragmento: { type: 'string' } }, required: ['ruta', 'linea', 'fragmento'] } },
      impacto: { type: 'string' }, propuesta: { type: 'string' }, esfuerzo: { type: 'string', enum: ['S', 'M', 'L'] },
      zona: { type: 'string', enum: ['libre', 'ZONA-FRANCO', 'FROZEN', 'FROZEN + ZONA-FRANCO'] }, nodos: { type: 'array', items: { type: 'string' } },
      relacionados: { type: 'string' }, requiere_verificacion_humana: { type: 'boolean' },
    }, required: ['titulo', 'prefijo', 'severidad', 'tipo', 'confianza', 'evidencia', 'impacto', 'propuesta', 'esfuerzo', 'zona', 'nodos', 'requiere_verificacion_humana'] } },
    funcionalidades: { type: 'array', items: { type: 'object', properties: {
      herramienta: { type: 'string' }, id: { type: 'string' }, nombre: { type: 'string' }, descripcion: { type: 'string' },
      archivos: { type: 'array', items: { type: 'string' } }, entradas: { type: 'array', items: { type: 'string' } },
      madurez: { type: 'string', enum: ['L0', 'L1', 'L2', 'L3', 'L4', 'L?'] }, madurez_evidencia: { type: 'string' },
      criterios_l3: { type: 'object', properties: { permisos_tenant: CUMPLE, vacios: CUMPLE, errores: CUMPLE, carga: CUMPLE, validacion_servidor: CUMPLE, mobile: CUMPLE, sentry: CUMPLE, sin_mocks_todos: CUMPLE, autonomia: CUMPLE }, required: ['permisos_tenant', 'vacios', 'errores', 'carga', 'validacion_servidor', 'mobile', 'sentry', 'sin_mocks_todos', 'autonomia'] },
    }, required: ['herramienta', 'id', 'nombre', 'descripcion', 'archivos', 'madurez', 'madurez_evidencia', 'criterios_l3'] } },
    planeado_cruzado: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, clave: { type: 'string' }, estado_en_codigo: { type: 'string', enum: ['hecho', 'parcial', 'no empezado', 'abandonado', 'contradicho'] }, evidencia: { type: 'string' }, sigue_teniendo_sentido: { type: 'string', enum: ['si', 'no', 'decidir'] }, nota: { type: 'string' } }, required: ['id', 'clave', 'estado_en_codigo', 'evidencia', 'sigue_teniendo_sentido'] } },
    alertas_verificadas: { type: 'array', items: { type: 'object', properties: { alerta: { type: 'string' }, resultado: { type: 'string', enum: ['confirmada', 'descartada', 'parcial', 'fuera-de-mi-lote'] }, evidencia: { type: 'string' }, hallazgo_titulo: { type: 'string' } }, required: ['alerta', 'resultado', 'evidencia'] } },
    candidatos_poda: { type: 'array', items: { type: 'object', properties: { archivo: { type: 'string' }, senales: { type: 'array', items: { type: 'string' } }, que_rompe: { type: 'string' } }, required: ['archivo', 'senales', 'que_rompe'] } },
    casos_prueba_manual: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, hallazgos: { type: 'string' }, entorno: { type: 'string' }, precondiciones: { type: 'string' }, pasos: { type: 'array', items: { type: 'string' } }, esperado: { type: 'string' }, senal_falla: { type: 'string' }, escribe_db_o_email: { type: 'boolean' } }, required: ['titulo', 'entorno', 'pasos', 'esperado', 'senal_falla', 'escribe_db_o_email'] } },
    ausencias: { type: 'array', items: { type: 'object', properties: { afirmacion: { type: 'string' }, comando: { type: 'string' }, control_positivo: { type: 'string' } }, required: ['afirmacion', 'comando', 'control_positivo'] } },
    patrones_a_cruzar: { type: 'array', items: { type: 'object', properties: { patron: { type: 'string' }, como_buscarlo: { type: 'string' }, donde_aparecio: { type: 'string' } }, required: ['patron', 'como_buscarlo', 'donde_aparecio'] } },
    previas_reverificadas: { type: 'array', items: { type: 'object', properties: { doc: { type: 'string' }, id_previo: { type: 'string' }, estado: { type: 'string', enum: ['abierto', 'cerrado', 'no-reproducible', 'parcial'] }, evidencia: { type: 'string' } }, required: ['doc', 'id_previo', 'estado', 'evidencia'] } },
  },
  required: ['archivos_leidos', 'entradas', 'flujos', 'hallazgos', 'funcionalidades', 'planeado_cruzado', 'alertas_verificadas', 'candidatos_poda', 'casos_prueba_manual', 'ausencias', 'patrones_a_cruzar', 'previas_reverificadas'],
}
const SCHEMA_VERIF = {
  type: 'object',
  properties: { veredictos: { type: 'array', items: { type: 'object', properties: { titulo: { type: 'string' }, se_sostiene: { type: 'boolean' }, severidad_ajustada: { type: 'string', enum: ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'DESCARTAR'] }, confianza_ajustada: { type: 'string', enum: ['VERIFICADO-POR-LECTURA', 'PROBABLE', 'HIPÓTESIS'] }, motivo: { type: 'string' }, evidencia_contra: { type: 'array', items: { type: 'string' } } }, required: ['titulo', 'se_sostiene', 'severidad_ajustada', 'confianza_ajustada', 'motivo', 'evidencia_contra'] } } },
  required: ['veredictos'],
}

const promptLector = (l) => `${A.preambulo}

=== PROMPT DE LA AUDITORIA (textual, §2, §3 y §5.1) ===
${A.prompt_textual}
=== FIN DEL TEXTO DEL PROMPT ===

${A.rubrica}

TU LOTE: ${l.id} — dominio ${A.dominio} (${A.nombre}), ciclo ${A.ciclo}${A.lente ? `, lente: ${A.lente}` : ''}.
FOCO DEL DOMINIO: ${A.foco}
${A.contexto}

ARCHIVOS DEL LOTE (${l.archivos.length} archivos, ${l.loc} lineas). Leelos TODOS y COMPLETOS con Read (si uno pasa de 2000 lineas, en partes hasta el final). Rutas relativas a ${APP}:
${l.archivos.map((f) => '- ' + f).join('\n')}

Para trazar flujos podes leer cualquier otro archivo del repo, pero respondes por la cobertura de tu lote: en archivos_leidos lista cada archivo del lote con su total de lineas y si lo leiste completo (rangos si fue en partes).

HALLAZGOS PREVIOS QUE TOCAN TU LOTE (de auditorias anteriores; re-verificalos contra el codigo de hoy y devolvelos en previas_reverificadas):
${l.previas && l.previas.length ? l.previas.map((p) => `- ${p.doc}:${p.linea} [${p.id_previo}] (${p.severidad_original}) ${p.titulo} — archivos citados: ${(p.archivos_citados || []).join(', ')}`).join('\n') : '- (ninguno)'}

LO PLANEADO QUE TE TOCA CRUZAR (de docs e insumos de Drive: son plan, historia u opinion, NUNCA evidencia). Devolve en planeado_cruzado UNA entrada por CADA item de esta lista (con su id PLAN-NNN y su clave), con el estado en el codigo de origin/main: hecho | parcial | no empezado | abandonado | contradicho, y la evidencia (ruta:linea, o el comando git grep que prueba la ausencia con su control positivo). Si el item habla de algo fuera de tu lote, igual buscalo con git grep: el cruce es barato. 'sigue_teniendo_sentido': si | no | decidir.
${l.planeado && l.planeado.length ? l.planeado.map((p) => `- ${p.id} (${p.clave}) [${p.tipo}${p.zona_franco ? ', ZONA-FRANCO' : ''}] ${p.titulo} — ${p.descripcion} (estado declarado: ${p.estado_declarado}${p.refs && p.refs.length ? `; refs: ${p.refs.join(' · ')}` : ''})`).join('\n') : '- (ninguno)'}
${l.insumos ? `\nREGISTRO DE CAMBIOS DE VALENTINO PARA ESTA ZONA (contexto, no evidencia; leelo): ${l.insumos}` : ''}

${A.herramientas}

QUE DEVOLVES (StructuredOutput):
- entradas: CADA page.tsx, layout.tsx, route handler (cada metodo exportado) y server action (cada funcion exportada de un archivo 'use server') de tu lote, con: auth (si/no/parcial/heredado de layout o proxy, con ruta:linea), rol exigido y evidencia, de donde sale el organizationId (sesion | parametro | mixto | no-aplica | no-filtra) con ruta:linea, validacion de entrada (zod/manual/parcial/no) con evidencia, rate limit. Protocolo SEC: la org tiene que salir de la sesion, nunca de un parametro de URL/body.
- flujos: los principales de punta a punta (UI -> action/route -> lib -> DB) con ruta:linea en cada paso.
- hallazgos: en el formato pedido (cada uno con evidencia ruta:linea REAL y un fragmento minimo de <=3 lineas, nunca un secret; nodos = ids del Atlas). Sin evidencia no hay hallazgo. Si para confirmarlo hace falta runtime, base o navegador: requiere_verificacion_humana=true y agregas el caso en casos_prueba_manual.
- funcionalidades: por cada herramienta que toque tu lote, sus funcionalidades (unidad minima que hace algo para el usuario), con id estable '<area>.<herramienta>.<slug-en-kebab>' (ej. h2.cli-inicio.resumen-semanal), madurez L0-L4 o L? con su evidencia (L2+ exige el camino feliz trazado con ruta:linea; si no, L?) y los nueve criterios L3 con la rubrica.
- alertas_verificadas: si arriba hay ALERTAS DE LOS DOCS, una entrada por alerta: confirmada (y entonces tambien va como hallazgo; pone su titulo en hallazgo_titulo), descartada o parcial, con evidencia ruta:linea; 'fuera-de-mi-lote' solo si no la podes resolver ni con git grep.
- candidatos_poda: archivos de tu lote que parezcan muertos o duplicados, con señales objetivas.
- ausencias: toda afirmacion 'no existe X' con el comando git grep sobre origin/main y su control positivo.
- patrones_a_cruzar: patrones defectuosos que convenga buscar en el resto del repo.`

const promptVerif = (l, hs) => `${A.preambulo}

${A.rubrica}

TAREA: sos un VERIFICADOR ADVERSARIAL. Un auditor reporto estos hallazgos CRITICA/ALTA sobre el lote ${l.id} (dominio ${A.dominio}). Tu trabajo es REFUTARLOS. Para cada uno: abri cada ruta:linea citada y el contexto necesario (llamadores, guards en layouts y en src/proxy.ts, validacion aguas arriba, si el codigo esta vivo o muerto, feature flags, defaults) y decidi si se sostiene. Por defecto, si no lo podes confirmar leyendo, se_sostiene=false. Ajusta severidad (o DESCARTAR) y confianza con la rubrica. Rutas relativas a ${APP}.

HALLAZGOS:
${hs.map((h, i) => `${i + 1}. [${h.severidad}] ${h.titulo}\n   evidencia: ${h.evidencia.map((e) => `${e.ruta}:${e.linea}`).join(', ')}\n   impacto: ${h.impacto}`).join('\n')}`

phase('Lectura')
const resultados = await Promise.all(A.lotes.map((l) => (async () => {
  const lectura = await sem(() => agent(promptLector(l), { label: `lector:${l.id}`, phase: 'Lectura', schema: SCHEMA_LECTOR, agentType: 'general-purpose' }))
  if (!lectura) return { lote: l.id, lectura: null, verificacion: null }
  const graves = (lectura.hallazgos || []).filter((h) => h.severidad === 'CRÍTICA' || h.severidad === 'ALTA')
  let verificacion = null
  if (graves.length) verificacion = await sem(() => agent(promptVerif(l, graves), { label: `verificador:${l.id}`, phase: 'Verificacion', schema: SCHEMA_VERIF, agentType: 'general-purpose' }))
  log(`${l.id}: ${lectura.hallazgos.length} hallazgos (${graves.length} CRITICA/ALTA), ${lectura.archivos_leidos.filter((a) => a.leido_completo).length}/${l.archivos.length} archivos completos`)
  return { lote: l.id, lectura, verificacion }
})()))
return { dominio: A.dominio, ciclo: A.ciclo, resultados }

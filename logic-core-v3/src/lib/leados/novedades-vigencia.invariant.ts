/**
 * P23 — Chequeo de invariante: UN AVISO NO MANDA LO CONTRARIO QUE LA COLA.
 *
 *   npm run check:invariant:novedades-vigencia
 *
 * Los dos defectos que fija, los dos medidos en la cartera real del setter de QA:
 *
 *  N5 · El aviso decía «Enviá el link ya, recién aprobada» sobre un lead que la
 *       cola mandaba a esperar, mientras el foco apuntaba a otros cinco negocios.
 *       Nadie estaba equivocado salvo el aviso: es un SNAPSHOT congelado en el
 *       handoff, y el lead se había movido.
 *
 *  N6 · Dos avisos del MISMO lead contradiciéndose — un DEMO_RECHAZADA de la
 *       primera revisión debajo de un DEMO_APROBADA del re-loop, los dos con su
 *       «Abrir», y el viejo pidiendo retrabajo sobre una demo ya aprobada. En la
 *       cartera medida había además un «Enviá el link ya» sobre un lead cuyo
 *       dossier estaba en FICHA.
 *
 * Los dos son el mismo defecto —una orden que caducó y nadie retiró— y por eso
 * los cierra un solo predicado, `vigenciaDeAviso`.
 *
 * ── La afirmación fuerte (§3) ───────────────────────────────────────────────
 * No alcanza con casos elegidos a mano: lo que hay que garantizar es que las dos
 * superficies del panel no puedan discrepar. Se barre el espacio de estados y se
 * exige, para CADA uno: si un aviso sigue dando su orden, el lead tiene que estar
 * en «trabajar» y ser accionable según `clasificarLead` — la MISMA función que
 * arma la cola y el foco. Un aviso vigente sobre un lead que la cola manda a
 * esperar es, literalmente, las dos superficies mandando cosas distintas.
 *
 * ── Por qué no puede pasar en verde sobre nada ──────────────────────────────
 * §0 es el par CONDUCTA/SABOTAJE (un predicado que devolviera siempre `false`
 * haría caducar avisos correctos, y uno que devolviera siempre `true` no
 * arreglaría nada: los dos tienen que fallar). §3 lleva su piso de barrido y
 * exige que el eje visite las dos respuestas.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus, OsSetterNoticeKind } from '@prisma/client'
import { clasificarLead, type HomeLeadInput } from './flow.ts'
import { vigenciaDeAviso, type EstadoDelLead } from './novedades-vigencia.ts'

const STAGES: (DossierStage | null)[] = [
  null,
  'FICHA',
  'EVALUADA',
  'DESCARTADA',
  'BRIEF',
  'CONSTRUCCION',
  'RECHAZADA',
  'EN_REVISION',
  'APROBADA',
]

const STATUSES: LeadStatus[] = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
  'PERDIDO',
  'POSTERGADO',
]

const KINDS: OsSetterNoticeKind[] = [
  'LEAD_ASIGNADO',
  'DEMO_APROBADA',
  'DEMO_RECHAZADA',
  'LEAD_REASIGNADO_SALIENTE',
]

/** Un lead del home completo, para poder llamar a `clasificarLead` de verdad. */
function leadCon(parcial: Partial<HomeLeadInput>): HomeLeadInput {
  return {
    id: 'lead-1',
    businessName: 'Negocio de prueba',
    industry: null,
    zone: null,
    status: 'PROSPECTO',
    caliente: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    stage: null,
    ficha: null,
    evaluacion: null,
    ultimoRechazo: null,
    agenda: null,
    contactos: 0,
    followUpVencido: false,
    sinProximoToque: false,
    postergadoVencido: false,
    reactivateAt: null,
    finalUrl: null,
    demoEnviada: false,
    pinned: false,
    snoozed: false,
    snoozedUntil: null,
    note: null,
    ...parcial,
  }
}

function estadoDe(parcial: Partial<HomeLeadInput>): EstadoDelLead {
  const lead = clasificarLead(leadCon(parcial))
  return {
    stage: lead.stage,
    status: lead.status,
    caliente: lead.caliente,
    finalUrl: lead.finalUrl,
    demoEnviada: lead.demoEnviada,
    proximaAccion: lead.proximaAccion,
    grupo: lead.grupo,
    accionable: lead.accionable,
  }
}

// ── §0 · CONDUCTA / SABOTAJE ────────────────────────────────────────────────
{
  // N5 exacto: aprobada con el gate CERRADO (el negocio no contestó y no es
  // caliente). El envío no se puede hacer, así que el aviso no lo puede pedir.
  const gateCerrado = estadoDe({
    stage: 'APROBADA',
    status: 'PROSPECTO',
    caliente: false,
    finalUrl: 'https://demo.develop.ar',
  })
  const v1 = vigenciaDeAviso('DEMO_APROBADA', gateCerrado)
  assert.equal(
    v1.vigente,
    false,
    'CONDUCTA N5: «Enviá el link ya» sobre una aprobada con el gate cerrado tiene que caducar — ' +
      'es el aviso que el panel mostraba mientras la cola mandaba a esperar',
  )
  assert.equal(
    v1.vigente === false && v1.enSuLugar,
    gateCerrado.proximaAccion,
    'lo que el aviso dice EN SU LUGAR tiene que salir de `proximaAccion` — el mismo dato que ' +
      'ordena la cola. Si sale de otro lado, las dos superficies pueden volver a discrepar',
  )

  // N6: el rechazo viejo, sobre un lead que ya está aprobado.
  const yaAprobada = estadoDe({
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: 'https://demo.develop.ar',
  })
  assert.equal(
    vigenciaDeAviso('DEMO_RECHAZADA', yaAprobada).vigente,
    false,
    'CONDUCTA N6: «Reabrí la construcción» sobre un dossier ya APROBADA tiene que caducar',
  )
  assert.equal(
    vigenciaDeAviso('DEMO_APROBADA', yaAprobada).vigente,
    true,
    'SABOTAJE N6: y el aviso NUEVO del mismo lead tiene que seguir vigente — si caducaran los ' +
      'dos, el setter se queda sin la orden que sí corresponde',
  )

  // El caso de la cartera medida: «Enviá el link ya» sobre un dossier en FICHA.
  assert.equal(
    vigenciaDeAviso('DEMO_APROBADA', estadoDe({ stage: 'FICHA', status: 'RESPONDIO' })).vigente,
    false,
    'CONDUCTA: «Enviá el link ya» sobre un dossier en FICHA tiene que caducar',
  )

  // SABOTAJE — no gritar donde la orden SÍ corre: un predicado que caduque todo
  // "arregla" la contradicción tapando el trabajo real.
  const enviable = estadoDe({
    stage: 'APROBADA',
    status: 'RESPONDIO',
    finalUrl: 'https://demo.develop.ar',
  })
  assert.equal(
    vigenciaDeAviso('DEMO_APROBADA', enviable).vigente,
    true,
    'SABOTAJE: con el gate ABIERTO y el link cargado, «Enviá el link ya» es la orden correcta ' +
      'y tiene que seguir dando la orden',
  )
  assert.equal(
    vigenciaDeAviso('DEMO_RECHAZADA', estadoDe({ stage: 'RECHAZADA', status: 'RESPONDIO' }))
      .vigente,
    true,
    'SABOTAJE: sobre un dossier en RECHAZADA, «Reabrí la construcción» es exactamente lo que toca',
  )
  assert.equal(
    vigenciaDeAviso('LEAD_ASIGNADO', estadoDe({ stage: null })).vigente,
    true,
    'SABOTAJE: «Arrancá por la ficha» sobre un lead recién asignado es la orden correcta',
  )

  // La reasignación-saliente no da órdenes: informa. No caduca ni con el lead ido.
  assert.equal(
    vigenciaDeAviso('LEAD_REASIGNADO_SALIENTE', null).vigente,
    true,
    'un aviso de salida no da ninguna orden: no tiene nada que caducar',
  )
  // Y un lead que ya no está en la cartera no puede seguir mandando.
  assert.equal(
    vigenciaDeAviso('DEMO_APROBADA', null).vigente,
    false,
    'un aviso cuyo lead ya no está en la cartera del setter no puede seguir dando su orden',
  )
}

// ── §3 · Un aviso vigente y la cola no pueden discrepar ─────────────────────
{
  let barridos = 0
  let vigentes = 0
  let caducados = 0
  const discrepan: string[] = []

  for (const stage of STAGES) {
    for (const status of STATUSES) {
      for (const caliente of [false, true]) {
        for (const finalUrl of [null, 'https://demo.develop.ar']) {
          for (const demoEnviada of [false, true]) {
            for (const kind of KINDS) {
              barridos += 1
              const lead = clasificarLead(
                leadCon({ stage, status, caliente, finalUrl, demoEnviada }),
              )
              const estado: EstadoDelLead = {
                stage: lead.stage,
                status: lead.status,
                caliente: lead.caliente,
                finalUrl: lead.finalUrl,
                demoEnviada: lead.demoEnviada,
                proximaAccion: lead.proximaAccion,
                grupo: lead.grupo,
                accionable: lead.accionable,
              }
              const v = vigenciaDeAviso(kind, estado)
              // El saliente informa una salida: no manda nada, y por eso no se
              // le puede exigir que el lead esté en la cola.
              if (kind === 'LEAD_REASIGNADO_SALIENTE') continue
              if (!v.vigente) {
                caducados += 1
                continue
              }
              vigentes += 1
              if (lead.grupo === 'trabajar' && lead.accionable) continue
              discrepan.push(
                `${kind} sigue dando su orden pero la cola manda el lead a "${lead.grupo}" ` +
                  `(accionable=${lead.accionable}): stage=${String(stage)} status=${status} ` +
                  `caliente=${caliente} finalUrl=${finalUrl ? 'si' : 'no'} enviada=${demoEnviada}` +
                  ` — la cola dice «${lead.proximaAccion}»`,
              )
            }
          }
        }
      }
    }
  }

  assert.ok(barridos > 1000, `el barrido se quedó corto (${barridos})`)
  assert.ok(
    vigentes > 0 && caducados > 0,
    `el eje no visitó las dos respuestas (vigentes=${vigentes}, caducados=${caducados}): un ` +
      'predicado constante pasaría en verde. Con todo vigente no se arregla nada; con todo ' +
      'caducado se tapa el trabajo real',
  )

  assert.deepEqual(
    discrepan.slice(0, 6),
    [],
    'hay avisos que siguen dando una orden que la cola no da. Las dos superficies del panel ' +
      'salen del MISMO lead: si el aviso manda a hacer algo, la cola tiene que tener ese lead ' +
      'como trabajo de hoy — si no, el setter lee dos órdenes distintas en la misma pantalla y ' +
      `no hay forma de saber cuál vale.\n  ${discrepan.slice(0, 6).join('\n  ')}`,
  )

  console.log(
    `✓ vigencia de avisos — ${barridos} combinaciones, ${vigentes} órdenes en pie, ` +
      `${caducados} caducadas, 0 discrepancias con la cola`,
  )
}

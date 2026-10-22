import * as THREE from 'three'

import type { Pedido } from '../../sonido/catalogo'
import { sonar } from '../../sonido/bus'
import { hayBanco } from '../entorno'
import { FLOOR_Y } from '../probeScene'
import { presetActual, type IdDePagina } from '../ruta/preset'
import { trazarLasGrietas } from './formas'
import { GRIETAS, GRIETAS_EN_VIVO, avanzarLasGrietas, dispararLasGrietas, faseDeLasGrietas, formacionVisible, grietasCerradas, luzVisible, varianteDeLasGrietas, type FaseDeLasGrietas, type SentidoDeLasGrietas, type VarianteDeLasGrietas } from './grietas'
import { texturasDeLasGrietas, type uniformesDeLasGrietas } from './grietasDelVidrio'
import type { Celda } from './muro'
import { TEXELES_DE_LAS_CELDAS, TEXELES_DE_LOS_TRAMOS, empaquetar, ventanaEnElMuro, type RejillaDeLasGrietas, type Ventana } from './trazado'

/**
 * [NOCTURNO B9] LAS GRIETAS EN EL CUADRO DEL CRISTAL (`CristalDeLaEscena.tsx` las crea al montarse y las llama en su cuadro, aunque el
 * cristal no se vea: su reloj sigue). Cada cuadro:
 *
 *   · si la página cambió, las que eran de la otra se borran en el acto (pasa tapado: el velo o el viaje);
 *   · un pedido nuevo del disparador (`GRIETAS_EN_VIVO`) para ESTA página: con las grietas cerradas y hacia adelante, las traza donde la
 *     cámara mira el muro (la ventana, `?grietas=` elige la variante; compacta abajo de 1024) con la luz neutra en el home y el acento
 *     claro de la página en las otras; después, el sentido;
 *   · el reloj (`avanzarLasGrietas`) y las uniformes.
 *
 * EL SONIDO, preparado sin archivo: `SONIDO_DE_LAS_GRIETAS.pedido` (hoy `null`: no hay un crujido CC0 en el repo). Con un sonido del
 * sprite, suena al empezar a formarse, por el bus (`sonido/bus.ts`): con el parlante apagado no hay motor y no suena nada.
 */
export const SONIDO_DE_LAS_GRIETAS: { pedido: Pedido | null } = { pedido: null }

type UniformesDeLasGrietas = ReturnType<typeof uniformesDeLasGrietas>

export interface EstadoDeLasGrietasDelBanco {
  readonly fase: FaseDeLasGrietas
  readonly formacion: number
  readonly espera: number
  readonly luz: number
  readonly variante: VarianteDeLasGrietas
  readonly duena: IdDePagina | null
  readonly tramos: number
  readonly rejilla: RejillaDeLasGrietas | null
  readonly ventana: Ventana | null
  readonly color: string
  readonly compacta: boolean
}

export interface GrietasEnVivo {
  readonly cuadro: (camara: THREE.Camera, dt: number, compacta: boolean) => void
  readonly estado: () => EstadoDeLasGrietasDelBanco
  readonly soltar: () => void
}

type VentanaDelBanco = Window & { __grietasDelBanco?: { readonly estado: () => EstadoDeLasGrietasDelBanco; readonly disparar: (sentido: SentidoDeLasGrietas) => void } }

/** La grilla del cuadro (en coordenadas normalizadas) cuyos rayos miden la ventana: el centro primero. */
const GRILLA: readonly (readonly [number, number])[] = [[0, 0], ...[-0.92, -0.46, 0.46, 0.92].flatMap((x) => [-0.9, -0.45, 0, 0.45, 0.9].map((y) => [x, y] as const)), [0, -0.9], [0, -0.45], [0, 0.45], [0, 0.9]]
const BLANCO = new THREE.Color(1, 1, 1)
const RAYO = new THREE.Vector3()
const OJO = new THREE.Vector3()

const paginaDeAhora = (): IdDePagina => presetActual()?.id ?? 'home'
const consulta = (nombre: string): string | null => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(nombre))

/** Donde la cámara mira el muro, con su matriz al día. */
export function ventanaDeLaCamara(camara: THREE.Camera): Ventana | null {
  camara.updateMatrixWorld()
  camara.getWorldPosition(OJO)
  const rayos = GRILLA.map(([x, y]) => {
    RAYO.set(x, y, 0.5).unproject(camara).sub(OJO).normalize()
    return [RAYO.x, RAYO.y, RAYO.z] as const
  })
  return ventanaEnElMuro([OJO.x, OJO.y, OJO.z], rayos, FLOOR_Y)
}

export function crearLasGrietas(u: UniformesDeLasGrietas, celdas: readonly Celda[], leerAcento: (acento: string | null) => THREE.Color, reducido = false): GrietasEnVivo {
  const datosDeLasCeldas = new Float32Array(TEXELES_DE_LAS_CELDAS)
  const tabla = new Float32Array(TEXELES_DE_LOS_TRAMOS)
  const texturas = texturasDeLasGrietas(datosDeLasCeldas, tabla)
  u.uGrietasCeldas.value = texturas.celdas
  u.uGrietasTramos.value = texturas.tramos
  u.uGrietas.value.set(0, 0, 0, 0)
  const vivo = GRIETAS_EN_VIVO
  // Un lienzo que se rehace (cruzar 1024) con las grietas de esta página pedidas: las vuelve a armar.
  const pendiente = vivo.vez > 0 && vivo.sentido === 'avance' && vivo.donde === paginaDeAhora()
  const m = {
    estado: grietasCerradas(),
    vista: pendiente ? vivo.vez - 1 : vivo.vez,
    duena: null as IdDePagina | null,
    variante: varianteDeLasGrietas(consulta('grietas')),
    tramos: 0,
    rejilla: null as RejillaDeLasGrietas | null,
    ventana: null as Ventana | null,
    compacta: false,
  }

  const armar = (camara: THREE.Camera, compacta: boolean, aqui: IdDePagina): void => {
    m.variante = varianteDeLasGrietas(consulta('grietas'))
    m.ventana = ventanaDeLaCamara(camara)
    m.compacta = compacta
    const tramos = m.ventana === null ? [] : trazarLasGrietas(m.variante, m.ventana, compacta, celdas)
    m.tramos = tramos.length
    m.rejilla = empaquetar(tramos, datosDeLasCeldas, tabla)
    texturas.celdas.needsUpdate = true
    texturas.tramos.needsUpdate = true
    u.uGrietasMarco.value.set(m.ventana?.centro ?? 0, m.rejilla.esquina[0], m.rejilla.esquina[1], 0)
    u.uGrietasRejilla.value.set(m.rejilla.ladoDeLaCelda[0], m.rejilla.ladoDeLaCelda[1], m.rejilla.nx, m.rejilla.ny)
    u.uGrietasColor.value.copy(aqui === 'home' ? BLANCO : leerAcento(presetActual()?.acento ?? null))
    if (SONIDO_DE_LAS_GRIETAS.pedido !== null && m.tramos > 0) sonar(SONIDO_DE_LAS_GRIETAS.pedido)
  }

  const cuadro = (camara: THREE.Camera, dt: number, compacta: boolean): void => {
    const aqui = paginaDeAhora()
    if (m.duena !== null && m.duena !== aqui) {
      m.estado = grietasCerradas()
      m.duena = null
    }
    if (vivo.vez !== m.vista) {
      m.vista = vivo.vez
      if (vivo.donde === aqui) {
        if (vivo.sentido === 'avance' && m.estado.formacion <= 0) armar(camara, compacta, aqui)
        m.estado.sentido = vivo.sentido
        m.duena = aqui
      }
    }
    avanzarLasGrietas(m.estado, dt, reducido)
    const g = u.uGrietas.value
    g.x = formacionVisible(m.estado.formacion)
    g.y = luzVisible(m.estado.luz)
    g.z = m.tramos > 0 && m.estado.formacion > 0 ? 1 : 0
  }

  const estado = (): EstadoDeLasGrietasDelBanco => ({
    fase: faseDeLasGrietas(m.estado),
    formacion: m.estado.formacion,
    espera: m.estado.espera,
    luz: m.estado.luz,
    variante: m.variante,
    duena: m.duena,
    tramos: m.tramos,
    rejilla: m.rejilla,
    ventana: m.ventana,
    color: u.uGrietasColor.value.getHexString(),
    compacta: m.compacta,
  })

  // `?grietas-prueba=si`: verlas solas, en un ciclo (se forman, quedan encendidas, se cierran, y otra vez), en cualquier página de /v3.
  const P = GRIETAS.prueba
  const T = GRIETAS.tiempos
  let reloj: ReturnType<typeof setTimeout> | null = null
  const ciclo = (sentido: SentidoDeLasGrietas, esperaS: number): void => {
    reloj = setTimeout(() => {
      dispararLasGrietas(sentido, paginaDeAhora())
      if (sentido === 'avance') ciclo('reversa', T.formarseS + T.oscurasS + T.encenderseS + P.encendidasS)
      else ciclo('avance', T.apagarseS + T.cerrarseS + P.cerradasS)
    }, esperaS * 1000)
  }
  if (consulta('grietas-prueba') === 'si') ciclo('avance', P.arrancaS)

  const ventana = typeof window === 'undefined' ? null : (window as VentanaDelBanco)
  if (ventana !== null && hayBanco()) ventana.__grietasDelBanco = { estado, disparar: (sentido) => dispararLasGrietas(sentido, paginaDeAhora()) }

  return {
    cuadro,
    estado,
    soltar: () => {
      if (reloj !== null) clearTimeout(reloj)
      if (ventana !== null) delete ventana.__grietasDelBanco
      u.uGrietas.value.set(0, 0, 0, 0)
      u.uGrietasCeldas.value = null
      u.uGrietasTramos.value = null
      texturas.celdas.dispose()
      texturas.tramos.dispose()
    },
  }
}

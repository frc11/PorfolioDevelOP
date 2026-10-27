import * as THREE from 'three'

import type { Pedido } from '../../sonido/catalogo'
import { sonar } from '../../sonido/bus'
import { VELO_EN_CURSO } from '../../veloDeNavegacion'
import { hayBanco } from '../entorno'
import { FLOOR_Y } from '../probeScene'
import { presetActual, type IdDePagina } from '../ruta/preset'
import { CRISTAL } from './cristal'
import { GRIETAS, GRIETAS_EN_VIVO, avanzarLasGrietas, brillanLasGrietas, dispararLasGrietas, faseDeLasGrietas, formacionVisible, grietasCerradas, luzVisible, origenDeLasGrietas, type FaseDeLasGrietas, type OrigenDeLasGrietas, type SentidoDeLasGrietas } from './grietas'
import type { uniformesDeLasGrietas } from './grietasDelVidrio'

/**
 * [NOCTURNO B9] LAS GRIETAS EN EL CUADRO DEL CRISTAL (`CristalDeLaEscena.tsx` las crea al montarse y las llama en su cuadro, aunque el
 * cristal no se vea: su reloj sigue). Cada cuadro:
 *
 *   · si la página cambió, las que eran de la otra se borran en el acto (pasa tapado: el velo o el viaje);
 *   · un pedido nuevo del disparador (`GRIETAS_EN_VIVO`) para ESTA página: con las grietas cerradas y hacia adelante, lee de dónde
 *     arrancan ([C2-31g] `?grietas=centro|borde`) y si brillan (sólo una página con acento: en el home, nunca); después, el sentido;
 *   · el reloj (`avanzarLasGrietas`) y las uniformes.
 *
 * [C2-31g] La telaraña de cada celda está en el sombreador (la geometría ya sabe dónde está cada punto en su celda): acá no se traza nada.
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
  readonly origen: OrigenDeLasGrietas
  readonly brillo: boolean
  readonly duena: IdDePagina | null
  readonly color: string
  /** Las uniformes de este cuadro: la formación que se ve, la luz que se ve (0 sin brillo), si hay y desde dónde. */
  readonly uniformes: readonly [number, number, number, number]
}

export interface GrietasEnVivo {
  readonly cuadro: (camara: THREE.Camera, dt: number) => void
  readonly estado: () => EstadoDeLasGrietasDelBanco
  readonly soltar: () => void
}

/** [C2-31g] Lo que fija el banco para sacar las fotos (la formación y la luz del reloj, quietas); `null` suelta el reloj. */
type Fijada = { readonly formacion: number; readonly luz: number } | null

type VentanaDelBanco = Window & {
  __grietasDelBanco?: {
    readonly estado: () => EstadoDeLasGrietasDelBanco
    readonly disparar: (sentido: SentidoDeLasGrietas) => void
    readonly fijar: (fijada: Fijada) => void
    /** La vista de la cámara de este cuadro (proyección por vista, por columnas): el banco proyecta las celdas en la foto. */
    readonly vista: () => readonly number[] | null
  }
  /** [C2-31g] Los defectos de los controles del banco (`scripts-carga/grietas.ts`; nunca la URL). */
  __defectosDeLasGrietas?: unknown
}

const NEGRO = new THREE.Color(0, 0, 0)
const OJO = new THREE.Vector3()
const MIRA = new THREE.Vector3()
const VISTA = new THREE.Matrix4()

const paginaDeAhora = (): IdDePagina => presetActual()?.id ?? 'home'
/** [C2-21] El defecto del control de `velo.ts` (`CONTROL=grietas-sin-esperar`, por `window.__defectosDelVelo`; nunca la URL). */
const sinEsperarAlVelo = (): boolean => typeof window !== 'undefined' && (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'grietas-sin-esperar'
/** [C2-31g] El defecto de un control de `grietas.ts` (`general`: una grieta para todo el muro; `brillo-en-el-home`). */
const defecto = (nombre: string): boolean => typeof window !== 'undefined' && (window as VentanaDelBanco).__defectosDeLasGrietas === nombre

const consulta = (nombre: string): string | null => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(nombre))

/** [C2-31g] Para el control `general`: dónde la cámara mira el muro (u del muro y altura desde el piso), por el rayo del medio. */
function dondeMiraLaCamara(camara: THREE.Camera): readonly [number, number] {
  camara.updateMatrixWorld()
  camara.getWorldPosition(OJO)
  camara.getWorldDirection(MIRA)
  const R = CRISTAL.muro.radio
  const a = MIRA.x * MIRA.x + MIRA.z * MIRA.z
  const b = 2 * (OJO.x * MIRA.x + OJO.z * MIRA.z)
  const c = OJO.x * OJO.x + OJO.z * OJO.z - R * R
  const t = a < 1e-9 ? 0 : (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a)
  return [Math.atan2(OJO.x + MIRA.x * t, OJO.z + MIRA.z * t) * R, OJO.y + MIRA.y * t - FLOOR_Y]
}

export function crearLasGrietas(u: UniformesDeLasGrietas, leerAcento: (acento: string | null) => THREE.Color, reducido = false): GrietasEnVivo {
  u.uGrietas.value.set(0, 0, 0, 0)
  u.uGrietasGeneral.value.set(0, 0, 0, 0)
  const vivo = GRIETAS_EN_VIVO
  // Un lienzo que se rehace (cruzar 1024) con las grietas de esta página pedidas: las vuelve a armar.
  const pendiente = vivo.vez > 0 && vivo.sentido === 'avance' && vivo.donde === paginaDeAhora()
  const m = {
    estado: grietasCerradas(),
    vista: pendiente ? vivo.vez - 1 : vivo.vez,
    duena: null as IdDePagina | null,
    origen: origenDeLasGrietas(consulta('grietas')),
    brillo: false,
    fijada: null as Fijada,
    camara: null as THREE.Camera | null,
  }

  const armar = (camara: THREE.Camera, aqui: IdDePagina): void => {
    m.origen = origenDeLasGrietas(consulta('grietas'))
    const acento = presetActual()?.acento ?? null
    m.brillo = brillanLasGrietas(aqui, acento) || defecto('brillo-en-el-home')
    u.uGrietasColor.value.copy(m.brillo ? leerAcento(aqui === 'home' ? null : acento) : NEGRO)
    if (defecto('general')) {
      const [centro, alto] = dondeMiraLaCamara(camara)
      u.uGrietasGeneral.value.set(1, centro, alto, GRIETAS.general.radio)
    }
    if (SONIDO_DE_LAS_GRIETAS.pedido !== null) sonar(SONIDO_DE_LAS_GRIETAS.pedido)
  }

  const cuadro = (camara: THREE.Camera, dt: number): void => {
    m.camara = camara
    const aqui = paginaDeAhora()
    if (m.duena !== null && m.duena !== aqui) {
      m.estado = grietasCerradas()
      m.duena = null
    }
    // [C2-21] Espera al velo quieto, como las del home (`veloDeNavegacion.ts`): llegando a una página no arranca en medio del deslizamiento.
    if (vivo.vez !== m.vista && !(VELO_EN_CURSO.activo && !sinEsperarAlVelo())) {
      m.vista = vivo.vez
      if (vivo.donde === aqui) {
        if (vivo.sentido === 'avance' && m.estado.formacion <= 0) armar(camara, aqui)
        m.estado.sentido = vivo.sentido
        m.duena = aqui
      }
    }
    if (m.fijada === null) avanzarLasGrietas(m.estado, dt, reducido)
    else {
      m.estado.formacion = m.fijada.formacion
      m.estado.luz = m.fijada.luz
    }
    const g = u.uGrietas.value
    g.x = formacionVisible(m.estado.formacion)
    g.y = m.brillo ? luzVisible(m.estado.luz) : 0
    g.z = m.estado.formacion > 0 ? 1 : 0
    g.w = m.origen === 'borde' ? 1 : 0
  }

  const estado = (): EstadoDeLasGrietasDelBanco => {
    const g = u.uGrietas.value
    return {
      fase: faseDeLasGrietas(m.estado),
      formacion: m.estado.formacion,
      espera: m.estado.espera,
      luz: m.estado.luz,
      origen: m.origen,
      brillo: m.brillo,
      duena: m.duena,
      color: u.uGrietasColor.value.getHexString(),
      uniformes: [g.x, g.y, g.z, g.w],
    }
  }

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
  if (ventana !== null && hayBanco()) {
    ventana.__grietasDelBanco = {
      estado,
      disparar: (sentido) => dispararLasGrietas(sentido, paginaDeAhora()),
      fijar: (fijada) => {
        m.fijada = fijada
      },
      vista: () => {
        const c = m.camara
        if (c === null) return null
        c.updateMatrixWorld()
        return VISTA.multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse).toArray()
      },
    }
  }

  return {
    cuadro,
    estado,
    soltar: () => {
      if (reloj !== null) clearTimeout(reloj)
      if (ventana !== null) delete ventana.__grietasDelBanco
      u.uGrietas.value.set(0, 0, 0, 0)
      u.uGrietasGeneral.value.set(0, 0, 0, 0)
    },
  }
}

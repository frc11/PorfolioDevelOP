import * as THREE from 'three'

import { PASE_EN_VIVO, PEDIDOS_DEL_PASE } from '../pase/pase'
import { crearEcos, cuadroDeLosEcos, soltarEcos, tomarElLogo, type Ecos } from './ecos'
import { ESPEJO, crearDisparador, crearEntradaDelDisparador, pasoDelDisparador, type Disparador, type Disparo, type Efecto, type EntradaDelDisparador } from './espejo'
import { ORDEN_DEL_ESPEJO, PANTALLA, armarLaZona, uniformesDeLaZona, type EfectoDePantalla } from './pantalla'
import { PLIEGUE_EN_VIVO } from './pliegue'

/**
 * [PULIDO 18] P2 · EL ESPEJO ARMADO: el efecto pedido (su zona de la pantalla, sus ecos o el pliegue de la trama), el disparador y lo
 * que se escribe en cada cuadro (sin reservas). El componente (`EspejoDeLaEscena.tsx`) le pasa la escena y el puntero.
 */
export interface ArmadoDelEspejo {
  readonly efecto: Efecto
  readonly disparador: Disparador
  readonly entrada: EntradaDelDisparador
  readonly grupo: THREE.Group
  readonly zona: THREE.Mesh | null
  readonly uniformes: ReturnType<typeof uniformesDeLaZona> & typeof PASE_EN_VIVO
  readonly ecos: Ecos | null
  /** El primer cuadro de los ecos se dibuja entero (alfa 0): su programa se arma al cargar, no al moverse el logo. */
  ecosPrecalentados: boolean
  /** El tramo de la vuelta del pliegue (se elige al empezar: el de enfrente de la cámara). */
  pliegueEnCurso: boolean
}

const esDePantalla = (e: Efecto): e is EfectoDePantalla => e === 'cristal' || e === 'caleidoscopio' || e === 'espiral'

export function armarElEspejo(efecto: Efecto, disparo: Disparo, prisma: boolean): ArmadoDelEspejo {
  const grupo = new THREE.Group()
  grupo.name = 'espejo'
  const uniformes = { ...uniformesDeLaZona(), ...PASE_EN_VIVO }
  uniformes.uPrisma.value = prisma ? 1 : 0
  const zona = esDePantalla(efecto) ? armarLaZona(efecto, uniformes) : null
  if (zona !== null) {
    zona.renderOrder = ORDEN_DEL_ESPEJO
    grupo.add(zona)
  }
  const ecos = efecto === 'ecos' ? crearEcos() : null
  if (ecos !== null) grupo.add(ecos.grupo)
  return { efecto, disparador: crearDisparador(efecto, disparo), entrada: crearEntradaDelDisparador(), grupo, zona, uniformes, ecos, ecosPrecalentados: false, pliegueEnCurso: false }
}

/** Lo que el cuadro le pasa al espejo (un solo objeto, reescrito). */
export interface DeLaEscenaAlEspejo {
  dt: number
  camara: THREE.Camera
  logo: THREE.Object3D | null
  noche: number
  /** El búfer de dibujo (px) y la razón de píxeles; el alto de la página (px de CSS). */
  readonly resolucion: THREE.Vector2
  pixel: number
  alto: number
}

const CENTRO = new THREE.Vector3()
const BORDE = new THREE.Vector3()

/** El logo en la pantalla: su centro (NDC) y su radio (fracción del alto), para que la zona se aleje de él. */
function elLogoEnLaPantalla(a: ArmadoDelEspejo, f: DeLaEscenaAlEspejo): void {
  if (f.logo === null) return
  f.logo.getWorldPosition(CENTRO)
  BORDE.setFromMatrixColumn(f.camara.matrixWorld, 0).multiplyScalar(3.6).add(CENTRO)
  CENTRO.project(f.camara)
  BORDE.project(f.camara)
  a.entrada.logoX = CENTRO.x
  a.entrada.logoY = CENTRO.y
  a.entrada.logoRadio = Math.hypot(BORDE.x - CENTRO.x, BORDE.y - CENTRO.y) * 0.5
}

/** Un cuadro del espejo: el disparador y lo que pinta cada efecto. */
export function cuadroDelEspejo(a: ArmadoDelEspejo, f: DeLaEscenaAlEspejo): void {
  elLogoEnLaPantalla(a, f)
  const d = a.disparador
  pasoDelDisparador(d, a.entrada)
  const u = a.uniformes
  if (a.zona !== null) {
    u.uZona.value.set(d.zonaX, d.zonaY, d.zonaRadio * f.alto, d.amplitud)
    u.uResolucion.value.copy(f.resolucion)
    u.uPixel.value = f.pixel
    u.uTiempo.value = a.entrada.tiempo
    u.uNoche.value = f.noche
    // El fondo empieza más lejos que el logo: nada de lo que está a su distancia o más cerca se toca.
    u.uFondo.value.x = f.logo === null ? PANTALLA.fondo[0] : f.camara.position.distanceTo(f.logo.getWorldPosition(CENTRO)) + PANTALLA.fondo[0]
    if (d.amplitud > 0.002) PEDIDOS_DEL_PASE.colorEsteCuadro = true
  }
  if (a.efecto === 'pliegue') {
    // El tramo: el de enfrente de la cámara (detrás del logo), elegido al empezar cada pliegue.
    if (d.amplitud > 0.002 && !a.pliegueEnCurso) PLIEGUE_EN_VIVO.uPliegue.value.y = Math.atan2(-f.camara.position.z, -f.camara.position.x)
    a.pliegueEnCurso = d.amplitud > 0.002
    PLIEGUE_EN_VIVO.uPliegue.value.x = d.amplitud
  }
  const e = a.ecos
  if (e !== null && f.logo !== null && tomarElLogo(e, f.logo)) {
    cuadroDeLosEcos(e, f.logo, f.camara, f.dt, f.noche, d.amplitud, ESPEJO.ciclo.ecos)
    if (!a.ecosPrecalentados) {
      for (const c of e.copias) for (const m of c.mallas) m.visible = true
      a.ecosPrecalentados = true
    }
  }
}

export function soltarElEspejo(a: ArmadoDelEspejo): void {
  if (a.zona !== null) {
    a.zona.geometry.dispose()
    if (a.zona.material instanceof THREE.Material) a.zona.material.dispose()
  }
  if (a.ecos !== null) soltarEcos(a.ecos)
  PLIEGUE_EN_VIVO.uPliegue.value.x = 0
}


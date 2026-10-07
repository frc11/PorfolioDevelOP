'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { hayBanco } from '../entorno'
import { HAZ } from '../entorno/vivo'
import { CAMERA_FOV, FLOOR_Y } from '../probeScene'
import { CTA_EN_EL_PISO } from './enElPiso'
import { CTA_DEL_FINAL, CTA_EN_VIVO, gestoDelToque, hazDelCta, varianteDelCta } from './estado'
import { PORTAL_EN_VIVO } from './portal'

/**
 * [PULIDO 1] P17-B · LO QUE LAS VARIANTES DEL CTA TIENEN EN LA ESCENA (sólo con `?cta=`: sin bandera no se monta): b, el haz
 * que baja sobre el CTA; c, el escalón de bloques y su pulso (las cuentas en `enElPiso.ts`); d, el tirón del moiré hacia el
 * cursor (`portal.ts`). La a (la losa) es toda del DOM. Leen `CTA_EN_VIVO`, que escribe el CTA en cada cuadro. Con movimiento
 * reducido, quietas: el haz prendido y parejo, el escalón armado, sin pulso ni tirón.
 */
/** Lo que mide el banco: el estado del CTA y hasta dónde baja el haz (mundo). */
const MEDIDO = { fondoDelHaz: Number.NaN }

export function PiezaDelCta({ quieto }: { readonly quieto: boolean }): React.JSX.Element | null {
  const variante = useMemo(() => varianteDelCta(), [])
  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as Window & { __ctaDelBanco?: () => unknown }
    ventana.__ctaDelBanco = () => ({ ...CTA_EN_VIVO, ...MEDIDO })
    return () => {
      delete ventana.__ctaDelBanco
    }
  }, [])
  if (variante === 'b') return <HazDelCta quieto={quieto} />
  if (variante === 'c') return <EscalonDelCta quieto={quieto} />
  if (variante === 'd') return <TironDelPortal quieto={quieto} />
  return null
}

/** El reloj de la llegada: los segundos desde que el CTA terminó de llegar (−1 sin llegar). */
function useRelojDeLaLlegada(): { readonly segundos: (t: number) => number } {
  const desde = useRef<number | null>(null)
  return useMemo(
    () => ({
      segundos: (t: number): number => {
        const l = CTA_EN_VIVO.llegada
        if (l >= 0.98 && desde.current === null) desde.current = t
        if (l < 0.3) desde.current = null
        return desde.current === null ? -1 : t - desde.current
      },
    }),
    [],
  )
}

/** Lo que un toque suma (el gesto del hover una vez, con el dedo). */
const toque = (): number => gestoDelToque((performance.now() - CTA_EN_VIVO.toqueEn) / 1000)

const VERTEX_DEL_HAZ = /* glsl */ `
varying float vAlto;
varying vec3 vNormalDelHaz;
varying vec3 vVistaDelHaz;
void main() {
	vAlto = uv.y;
	vec4 mv = modelViewMatrix * vec4( position, 1.0 );
	vNormalDelHaz = normalize( normalMatrix * normal );
	vVistaDelHaz = normalize( - mv.xyz );
	gl_Position = projectionMatrix * mv;
}
`
const FRAGMENT_DEL_HAZ = /* glsl */ `
uniform float uLuz;
uniform float uBaja;
varying float vAlto;
varying vec3 vNormalDelHaz;
varying vec3 vVistaDelHaz;
void main() {
	// Brilla donde se lo ve de frente (donde la luz cruza más aire) y se apaga en la silueta; baja desde arriba (uBaja) con
	// un frente blando, y se funde en sus dos puntas.
	float frente = pow( abs( dot( normalize( vNormalDelHaz ), normalize( vVistaDelHaz ) ) ), 2.2 );
	float baja = smoothstep( 1.0 - uBaja - 0.06, 1.0 - uBaja + 0.02, vAlto );
	float puntas = smoothstep( 0.0, 0.08, vAlto ) * ( 1.0 - smoothstep( 0.7, 1.0, vAlto ) * 0.6 );
	gl_FragColor = vec4( vec3( 1.0, 0.94, 0.82 ) * frente * baja * puntas * uLuz * 0.2, 1.0 );
}
`

/**
 * b · EL HAZ SOBRE EL CTA: una columna de luz por el eje del logo (en la pose del CTA pasa justo detrás de él, en el centro
 * de la pantalla) que baja del óculo hasta el botón con el parpadeo del encendido del haz (`hazDelCta`), ancha como el botón.
 * En hover sube un poco; al abrir Contacto desde el CTA se apaga.
 */
/** b · los uniformes del haz y un punto de trabajo (uno solo: hay un CTA), de módulo como los de `VIVO`. */
const HAZ_DEL_CTA = { uLuz: { value: 0 }, uBaja: { value: 0 } }
const PUNTO = new THREE.Vector3()

function HazDelCta({ quieto }: { readonly quieto: boolean }): React.JSX.Element {
  const reloj = useRelojDeLaLlegada()
  const piezas = useMemo(
    () => ({
      geometria: new THREE.CylinderGeometry(0.55, 1, 1, 48, 1, true),
      material: new THREE.ShaderMaterial({
        uniforms: HAZ_DEL_CTA,
        vertexShader: VERTEX_DEL_HAZ,
        fragmentShader: FRAGMENT_DEL_HAZ,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    }),
    [],
  )
  useEffect(
    () => () => {
      piezas.geometria.dispose()
      piezas.material.dispose()
    },
    [piezas],
  )
  const malla = useRef<THREE.Mesh>(null)
  const estado = useRef({ prendido: 0, hover: 0 })
  useFrame((state, delta) => {
    const m = malla.current
    if (m === null) return
    const dt = Math.min(0.1, Math.max(0, delta))
    const s = reloj.segundos(state.clock.elapsedTime)
    const e = estado.current
    const H = CTA_DEL_FINAL.haz
    // Prendido: 0 a 1 en la llegada; al abrir Contacto se apaga en `apagaS`.
    e.prendido = CTA_EN_VIVO.abierto ? Math.max(0, e.prendido - dt / H.apagaS) : s >= 0 ? 1 : Math.max(0, e.prendido - dt / H.apagaS)
    e.hover += ((CTA_EN_VIVO.hover ? 1 : 0) - e.hover) * (1 - Math.exp(-dt / 0.18))
    const { baja, luz } = quieto ? { baja: 1, luz: 1 } : hazDelCta(Math.max(0, s))
    const intensidad = (s < 0 && !CTA_EN_VIVO.abierto ? 0 : luz) * e.prendido * (1 + H.hover * Math.max(e.hover, toque()))
    m.visible = intensidad > 0.001 && CTA_EN_VIVO.variante === 'b'
    if (!m.visible) return
    // Hasta dónde baja: el punto del eje que se ve en el borde de abajo del botón (búsqueda por bisección en la pantalla).
    // Con la cámara de este cuadro: el rig la orientó después de la última vez que se actualizaron sus matrices.
    const cam = state.camera
    cam.updateMatrixWorld()
    const meta = 1 - 2 * (CTA_EN_VIVO.boton.y + CTA_EN_VIVO.boton.alto)
    let [abajo, arriba]: [number, number] = [FLOOR_Y, HAZ.arriba]
    for (let i = 0; i < 24; i += 1) {
      const medio = (abajo + arriba) / 2
      PUNTO.set(0, medio, 0).project(cam)
      if (PUNTO.y < meta) abajo = medio
      else arriba = medio
    }
    const fondo = (abajo + arriba) / 2
    MEDIDO.fondoDelHaz = fondo
    // Ancho como el botón: su medio ancho en el mundo, a la distancia del eje.
    const distancia = cam.position.length()
    const altoDelCuadro = 2 * distancia * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2)
    const aspecto = state.size.width / Math.max(1, state.size.height)
    const radio = Math.max(0.6, 0.42 * CTA_EN_VIVO.boton.ancho * altoDelCuadro * aspecto)
    const largo = HAZ.arriba - fondo
    m.position.set(0, fondo + largo / 2, 0)
    m.scale.set(radio, largo, radio)
    HAZ_DEL_CTA.uLuz.value = intensidad
    HAZ_DEL_CTA.uBaja.value = baja
  })
  return <mesh ref={malla} name="haz del cta" geometry={piezas.geometria} material={piezas.material} renderOrder={3} frustumCulled={false} visible={false} />
}

/**
 * c · EL ESCALÓN: se arma con la llegada (en `armaS`, del centro a los bordes) y baja al abrir Contacto (en `bajaS`); en
 * hover, los bloques de cerca pulsan en blanco (y una vez con un toque).
 */
function EscalonDelCta({ quieto }: { readonly quieto: boolean }): null {
  const reloj = useRelojDeLaLlegada()
  const armado = useRef(0)
  const pulso = useRef(0)
  useEffect(
    () => () => {
      CTA_EN_EL_PISO.uArmadoDelEscalon.value = 0
      CTA_EN_EL_PISO.uPulsoDelCta.value.w = 0
    },
    [],
  )
  useFrame((state, delta) => {
    const dt = Math.min(0.1, Math.max(0, delta))
    const t = state.clock.elapsedTime
    const s = reloj.segundos(t)
    const B = CTA_DEL_FINAL.bloques
    const pedido = s >= 0 && !CTA_EN_VIVO.abierto ? 1 : 0
    armado.current = quieto ? pedido : pedido > armado.current ? Math.min(1, armado.current + dt / B.armaS) : Math.max(0, armado.current - dt / B.bajaS)
    CTA_EN_EL_PISO.uArmadoDelEscalon.value = armado.current
    // El pulso: con hover, un anillo cada `pulsoS` (y uno con un toque), que se abre desde el escalón.
    const tocado = (performance.now() - CTA_EN_VIVO.toqueEn) / 1000
    const conToque = !quieto && tocado >= 0 && tocado < B.pulsoS
    const fase = conToque ? tocado / B.pulsoS : (t / B.pulsoS) % 1
    pulso.current += ((CTA_EN_VIVO.hover || conToque) && !quieto ? 1 : 0) - pulso.current > 0 ? Math.min(1 - pulso.current, dt / 0.25) : -Math.min(pulso.current, dt / 0.4)
    CTA_EN_EL_PISO.uPulsoDelCta.value.w = armado.current * pulso.current
    CTA_EN_EL_PISO.uFaseDelPulso.value = fase
  })
  return null
}

/** d · EL TIRÓN DEL MOIRÉ hacia el cursor, con el hover (y una vez con un toque); se suelta al abrir Contacto. */
function TironDelPortal({ quieto }: { readonly quieto: boolean }): null {
  const fuerza = useRef(0)
  const tamano = useMemo(() => new THREE.Vector2(), [])
  useEffect(
    () => () => {
      PORTAL_EN_VIVO.uPortal.value.z = 0
    },
    [],
  )
  useFrame((state, delta) => {
    const dt = Math.min(0.1, Math.max(0, delta))
    const pedido = quieto || CTA_EN_VIVO.abierto ? 0 : Math.max(CTA_EN_VIVO.hover ? 1 : 0, toque())
    fuerza.current += (pedido - fuerza.current) * (1 - Math.exp(-dt / (CTA_DEL_FINAL.portal.entraS / 3)))
    state.gl.getDrawingBufferSize(tamano)
    const u = PORTAL_EN_VIVO.uPortal.value
    u.set(CTA_EN_VIVO.puntero.x * tamano.x, (1 - CTA_EN_VIVO.puntero.y) * tamano.y, fuerza.current < 1e-3 ? 0 : fuerza.current, CTA_DEL_FINAL.portal.radio * tamano.y)
  })
  return null
}

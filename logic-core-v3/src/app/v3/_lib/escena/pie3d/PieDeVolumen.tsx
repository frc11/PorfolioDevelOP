'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { anotarLasPiezas } from '../../diagnostico/anotar'
import { alCargarseLasFuentes, conReimpresion } from '../../fuentes'
import { PIEZAS_DEL_PIE, PROGRESO_DEL_PIE, marcarElPieListo, suscribirALasPiezas, versionDeLasPiezas } from '../../pie3d/registro'
import { SALIDA_EN_VIVO, pasoDelHundimiento } from '../../pie3d/salidas'
import { esperaAlVelo } from '../../veloDeNavegacion'
import { viajeEnCurso } from '../viaje'
import { contextoPerdido, useVersionDelContexto } from '../contextoDelLienzo'
import { hayBanco } from '../entorno'
import { crearElEstudio } from '../estudio'
import { calentar } from '../gpu/Precompilar'
import { EN_VIVO } from '../final/recorridoDelFinal'
import { ONDA_PEDIDA } from '../interfaz/pedidos'
import { alCuadro, prepararLasTransformaciones, rearmar, soltar, type EstadoDelPie } from './armadas'
import { crearLaCaidaDelPie } from './caida'
import { CAJAS_DEL_PIE } from './cajasDelPolvo'
import { HUECOS_DEL_PIE, QUIETUD_DEL_PIE } from './huecos'
import { crearLosPozosDelPie } from './pozos'
import { SOMBRAS_DEL_PIE } from './sombras'
import { imprimirLasTarjetas } from './tarjetaImpresa'
import { PLATAFORMA_EN_VIVO } from './transformacionDelPie'

/**
 * [RETOQUE DEL PIE] P2 · EL PIE DE VOLUMEN EN LA ESCENA — en un módulo que se descarga aparte, desde 1025 (como los
 * títulos). Cada pieza que anota el pie (`_lib/pie3d/registro.ts`) se mide en el DOM (`medida.ts`), se arma en WebGL
 * (`geometria.ts`: el texto extruido, las placas con su texto en relieve, el formulario con sus pozos y su tecla) y en
 * cada cuadro se pone donde la cámara sin el mouse la ve en su lugar del DOM (`colocacion.ts`): fija en el mundo y de
 * frente; lo único que se mueve es la cámara, y el paralaje le deja ver la perspectiva y los costados.
 *
 * **Lo interactivo sigue a su pieza.** El DOM de verdad (el enlace, el botón, el formulario con sus campos) queda donde
 * la cámara viva ve la cara de su pieza: cada cuadro se le escribe la homografía (`homografia.ts`) como `transform`, sin
 * `setState` (y sólo si cambió). Se enfoca, se escribe y lo anuncia el lector; el anillo de foco cae sobre la placa.
 *
 * **Se hunde** en su eje (sin girar): con el mouse encima o el foco del teclado, `encima` px; apretada, `apretada` px
 * (los escuchas del DOM escriben `HUNDIDOS`; el tic y el pestillo, los del sonido). **Sombras de contacto** en el piso
 * vivo (`sombras.ts`). Se arma con las fuentes cargadas, al anotarse y cuando cambia una caja (el formulario con sus
 * errores, «Enviando…»); se compila una vez y recién ahí el DOM apaga lo que el 3D dibuja (`marcarElPieListo`). Lo que se arma y lo que pasa en cada cuadro, en `armadas.ts`.
 *
 * [PASADA FINAL] C2 · **Llega por columnas** (`coreografia.ts`), con el progreso de la última pantalla: cada pieza con su
 * material (sus uniformes), un solo programa.
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
}

type VentanaDelBanco = Window & { __pieDelBanco?: { piezas: () => unknown; ondas: () => number; coreografia: () => { readonly mostrado: number; readonly pedido: number | null }; enPantalla: () => unknown; punto: (x: number, y: number, z: number) => number[]; plataforma: () => { readonly hundido: number; readonly cerrado: number } } }

/** [PULIDO 26] X1 · para el banco: un punto del mundo en la pantalla (px de CSS) con la cámara de este cuadro. */
const EN_PANTALLA = new THREE.Vector3()
function alCuadroDelBanco(camara: THREE.Camera | null, x: number, y: number, z: number): number[] {
  if (camara === null) return []
  EN_PANTALLA.set(x, y, z).project(camara)
  return [Math.round(((EN_PANTALLA.x + 1) / 2) * innerWidth), Math.round(((1 - EN_PANTALLA.y) / 2) * innerHeight)]
}

export default function PieDeVolumen({ keyLightRef }: Props) {
  const version = useSyncExternalStore(suscribirALasPiezas, versionDeLasPiezas, versionDeLasPiezas)
  const gl = useThree((s) => s.gl)
  // [CIERRE A-ter] A13 · el contexto perdido y repuesto: todo lo armado se suelta (el DOM a la vista) y se rehace con un estudio nuevo.
  const contexto = useVersionDelContexto(gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  // [PULIDO 26] X1 · la cámara de este cuadro, para el banco (`enPantalla`).
  const vivaDelBanco = useRef<THREE.Camera | null>(null)
  // [PULIDO 27] Y2 a · el pozo liso de cada hueco del final (`pozos.ts`).
  const pozos = useRef<ReturnType<typeof crearLosPozosDelPie> | null>(null)
  const m = useRef<EstadoDelPie>({ armadas: [], estudio: null, quieto: false, fuentes: false, compilando: false, listo: false, montado: false, cuadrilatero: [], matriz: [], coreografia: { mostrado: 0, y: -1, cuando: 0 }, caida: crearLaCaidaDelPie() })

  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const leer = (): void => {
      m.current.quieto = q.matches
    }
    leer()
    q.addEventListener('change', leer)
    return () => q.removeEventListener('change', leer)
  }, [])

  // El estudio de los reflejos (como los de los títulos; el material, uno por pieza); al irse, todo lo armado y el DOM como estaba.
  useEffect(() => {
    const s = m.current
    const rt = crearElEstudio(gl)
    s.estudio = rt.texture
    s.montado = true
    const losPozos = crearLosPozosDelPie()
    pozos.current = losPozos
    raiz.current?.add(losPozos.grupo)
    return () => {
      losPozos.grupo.removeFromParent()
      losPozos.soltar()
      pozos.current = null
      s.montado = false
      s.listo = false
      // [PULIDO 28] AA7 · sin el pie de volumen no hay pie a la vista (la salida vuelve a la de siempre).
      SALIDA_EN_VIVO.aLaVista = false
      SALIDA_EN_VIVO.fase = 'presente'
      for (const a of s.armadas) soltar(a)
      s.armadas = []
      imprimirLasTarjetas(s.armadas)
      s.estudio = null
      SOMBRAS_DEL_PIE.uCuantasSombrasDelPie.value = 0
      HUECOS_DEL_PIE.uCuantosHuecosDelPie.value = 0
      QUIETUD_DEL_PIE.uCuantasQuietudes.value = 0
      CAJAS_DEL_PIE.uCuantasCajasDelPie.value = 0
      // [RETOQUE DEL ENCASTRE] 1D · sin pie de volumen, el final no espera nada.
      EN_VIVO.pieEntero = true
      marcarElPieListo(false)
      rt.dispose()
    }
  }, [gl, contexto])

  // Se arma (y se rearma lo que cambió) con las fuentes cargadas: al anotarse, al cambiar el cuadro o una caja.
  useEffect(() => {
    void version
    const g = raiz.current
    const s = m.current
    if (g === null) return undefined
    let vivo = true
    let reloj = 0
    const armarYa = (): void => {
      if (!vivo || !s.fuentes || s.estudio === null || contextoPerdido()) return
      // [B12a.8] (4) Llegando con el velo, lejos del pie: espera al velo quieto (armarlo tapado demoraba el destape ~165 ms).
      if (esperaAlVelo([...PIEZAS_DEL_PIE.values()].map((p) => p.elemento))) {
        pedir()
        return
      }
      rearmar(s, g, s.estudio)
      // [CIERRE A-bis] A11 · la tarjeta de gracias o de error, impresa en su placa (se compila con la entrante).
      imprimirLasTarjetas(s.armadas)
      // [PULIDO 10] J4 · la placa de una transformación (la tarjeta de gracias), compilada antes de girar.
      prepararLasTransformaciones(s, gl, escena, camara)
      anotarLasPiezas(s.armadas) // [CIERRE A-ter] A13 · el diagnóstico de la carga (`?diag=carga`).
      if (s.listo || s.compilando || s.armadas.length === 0) return
      s.compilando = true
      void gl.compileAsync(escena, camara).then(() => {
        s.compilando = false
        if (!s.montado) return
        calentar(gl, escena, camara)
        s.listo = true
        marcarElPieListo(true)
      })
    }
    const pedir = (): void => {
      window.clearTimeout(reloj)
      reloj = window.setTimeout(armarYa, 80)
    }
    const tamanos = new ResizeObserver(pedir)
    const textos = new MutationObserver(pedir)
    tamanos.observe(document.body)
    for (const p of PIEZAS_DEL_PIE.values()) {
      tamanos.observe(p.elemento)
      if (p.forma === 'formulario') textos.observe(p.elemento, { childList: true, subtree: true, characterData: true })
    }
    void document.fonts.ready.then(() => {
      s.fuentes = true
      if (vivo) pedir()
    })
    // [CIERRE A-ter] A13 · una fuente que carga después (la red lenta) cambia lo medido: se rearma lo que cambió (`rearmar` compara la firma).
    const sinLasFuentes = conReimpresion() ? alCargarseLasFuentes(pedir) : () => undefined
    return () => {
      vivo = false
      window.clearTimeout(reloj)
      tamanos.disconnect()
      textos.disconnect()
      sinLasFuentes()
    }
  }, [version, tam.width, tam.height, gl, escena, camara, contexto])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    ventana.__pieDelBanco = {
      piezas: () =>
        m.current.armadas.map((a) => {
          const r = a.pieza.elemento.getBoundingClientRect()
          return { id: a.pieza.id, forma: a.pieza.forma, llegada: a.pieza.llegada, espesor: a.espesor, orden: a.orden, llego: a.llego, aparece: a.uniformes.uApareceDelPie.value, tocable: a.tocable, visible: a.grupo.visible, d: a.d, mundoPorPx: a.mundoPorPx, hundido: a.hundido, css: a.css, dom: [r.left, r.top, r.right, r.bottom].map(Math.round), caja: [a.medida.caja.x, a.medida.caja.y - scrollY, a.medida.caja.ancho, a.medida.caja.alto].map(Math.round), letras: a.medida.letras.length, trazos: a.medida.trazos.length, pozos: a.medida.pozos.length }
        }),
      // [RETOQUE DEL PIE] P3 · cuántas ondas pidió el piso ([NOCTURNO] A2: la onda, en el producto).
      ondas: () => ONDA_PEDIDA.n,
      // [PASADA FINAL] C2 · lo mostrado de la coreografía y lo que pide el scroll.
      coreografia: () => ({ mostrado: m.current.coreografia.mostrado, pedido: PROGRESO_DEL_PIE.valor?.get() ?? null }),
      // [PULIDO 26] X1 · la cara de cada pieza en la pantalla (sus cuatro esquinas, con la cámara de este cuadro) y un punto cualquiera.
      enPantalla: () =>
        m.current.armadas.map((a) => {
          a.grupo.updateMatrixWorld(true)
          const { ancho, alto } = a.medida.caja
          const esquinas = [[0, 0], [ancho, 0], [ancho, -alto], [0, -alto]].map(([x, y]) => {
            const v = new THREE.Vector3(x, y, 0).applyMatrix4(a.grupo.matrixWorld)
            return alCuadroDelBanco(vivaDelBanco.current, v.x, v.y, v.z)
          })
          return { id: a.pieza.id, forma: a.pieza.forma, visible: a.grupo.visible, esquinas }
        }),
      punto: (x, y, z) => alCuadroDelBanco(vivaDelBanco.current, x, y, z),
      // [CIERRE A] A8 · la plataforma del cambio de gracias o error: cuánto bajó la placa y cuánto cerró el piso.
      plataforma: () => ({ ...PLATAFORMA_EN_VIVO }),
    }
    return () => {
      delete ventana.__pieDelBanco
    }
  }, [])

  useFrame((state, delta) => {
    vivaDelBanco.current = state.camera
    // [PULIDO 27] Y4 b · el hundimiento antes de un viaje desde el pie acostado (lo leen la caída y los huecos); acostado, lo escribe la caída.
    SALIDA_EN_VIVO.hunde = pasoDelHundimiento(performance.now(), viajeEnCurso() !== null)
    SALIDA_EN_VIVO.acostado = false
    alCuadro(m.current, state.camera, keyLightRef.current, { ancho: tam.width, alto: tam.height }, Math.min(delta, 0.1))
    imprimirLasTarjetas(m.current.armadas)
    pozos.current?.alCuadro()
  })

  return <group ref={raiz} name="pie de volumen" />
}

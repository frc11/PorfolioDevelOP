'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import * as THREE from 'three'

import { acotar01 } from '../../acotar'
import { cargaLista } from '../../carga'
import { RELEVO_DE_LOS_TITULOS, TITULOS_DE_VOLUMEN, suscribirALosTitulos, versionDeLosTitulos } from '../../titulos3d/registro'
import { entornoDeLaEscena, hayBanco } from '../entorno'
import { crearElEstudio } from '../estudio'
import { KEY_INTENSITY } from '../probeLighting'
import type { ProbeRigStore, ProbeStatsStore } from '../probeStore'
import { CAMARA_SIN_EL_MOUSE } from '../sinElMouse'
import { viajeEnCurso } from '../viaje'
import { camaraDeLaLectura, colocar, corrimiento, lugarDeLectura, pinDelLugar } from './colocacion'
import { avancesDeLasRayas, despinteDelTitulo, ponerElEstudio, type Armado, type Variante } from './armado'
import { ASIENTO, mostradoDelScroll, persigue } from './llegada'
import { REPETICIONES } from '../../titulos3d/repeticiones'
import { IDS_DEL_TITULAR_DEL_HERO, TITULAR_EN_VIVO } from '../../titulos3d/titular'
import { llevarLosAcompanantes } from './acompanantes'
import { sincronizar, soltarTodos } from './sincronia'
import { SombraDeLosTitulos } from './SombraDeLosTitulos'

/**
 * [ESCENA 10] T3 · LOS TÍTULOS DE VOLUMEN EN LA ESCENA — [3D Y SONIDO] T1: en el producto, el negro (`titulos=blanco`
 * para comparar), en un módulo que se descarga aparte y sólo desde 1024. Cada título que anota una sección
 * (`_lib/titulos3d/registro.ts`) se arma extruido con la
 * Chivo (`geometria.ts`), se pone quieto en el mundo (`colocacion.ts`) y sus letras llegan y se van con el progreso de
 * la pieza (`llegada.ts`). Una malla (una llamada) por título.
 *
 * **Los dos materiales.** `negro`: el negro satinado del logo (la tinta, su rugosidad y los reflejos del mismo estudio,
 * que siguen a la luz de la sala). `blanco`: el papel, con la misma rugosidad y el mismo estudio.
 *
 * **De noche** (Portfolio es de noche) la sala está apagada y un título sin luz no se lee. Se iluminan como el logo, que
 * ya resolvió su noche (ESCENA 9 T2, ESCENA 10 T1): emiten con la MISMA noche (su emisiva es la del logo, en el mismo
 * cuadro) y llevan su dibujo: los costados negros y las tapas claras con un filo más claro en el contorno. El negro, con
 * el gris de las tapas del logo; el blanco, con tapas casi blancas. Y el amanecer los oscurece como al resto de la sala
 * hasta que su frente los alcanza.
 *
 * **Cuándo se arma.** Con las fuentes del DOM cargadas y la página ociosa (la x de cada letra se lee del DOM: el
 * interletrado y el kerning del navegador), nunca en medio de la llegada; al montarse se compila y se calienta (regla 2:
 * el módulo llega después del precompilado). Se coloca al empezar cada llegada y al cambiar el tamaño del cuadro. Recién
 * compilado y calentado avisa al DOM (`marcarListo`), que entonces esconde su texto. [PASADA FINAL] A1: el registro se
 * sincroniza por diferencia (`sincronia.ts`): el hero, que llega una vez por carga, se arma apenas están las fuentes (su
 * texto 2D no se pinta hasta que él llega) y nada de lo armado se rearma porque otro título entre o salga.
 *
 * **Con los viajes del menú** ([3D Y SONIDO] T1): mientras dura un viaje, ningún título llega (lo pedido es 0: si uno se
 * veía, se va como siempre); al terminar, el viaje a Portfolio o a Por qué develOP repite la llegada del título
 * (`llegadaDelTitulo.ts`) y las letras llegan desde la profundidad con ese progreso, con la cámara ya quieta en el nudo.
 *
 * [RETOQUE PANEL] T4 · cómo se arma cada uno (la geometría con sus rayas y el material), en `armado.ts`.
 */

interface Props {
  readonly keyLightRef: RefObject<THREE.DirectionalLight | null>
  readonly logoMaterialRef: RefObject<THREE.MeshStandardMaterial | null>
  readonly stats: ProbeStatsStore
  readonly rig: ProbeRigStore
}

type VentanaDelBanco = Window & { __titulosDelBanco?: { titulos: () => unknown; camara: () => unknown; progreso: () => number } }

export default function TitulosDeVolumen({ keyLightRef, logoMaterialRef, stats, rig }: Props) {
  const variante: Variante = entornoDeLaEscena().titulos === 'blanco' ? 'blanco' : 'negro'
  const version = useSyncExternalStore(suscribirALosTitulos, versionDeLosTitulos, versionDeLosTitulos)
  const gl = useThree((s) => s.gl)
  const escena = useThree((s) => s.scene)
  const camara = useThree((s) => s.camera)
  const tam = useThree((s) => s.size)
  const raiz = useRef<THREE.Group>(null)
  // [RONDA 2] F2 · `scroll`: dónde estaba la página y desde cuándo (el asiento, con el scroll quieto).
  const m = useRef({ armados: [] as Armado[], quieto: false, nudo: new THREE.PerspectiveCamera(), scroll: { y: Number.NaN, cuando: 0 }, ultimoCuadro: 0 })

  // Movimiento reducido: sin llegada (se disuelven en su lugar). Se lee al cambiar, no por cuadro.
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)')
    const leer = (): void => {
      m.current.quieto = q.matches
    }
    leer()
    q.addEventListener('change', leer)
    return () => q.removeEventListener('change', leer)
  }, [])

  // El estudio de los reflejos, uno para todos los títulos.
  const estudio = useRef<THREE.WebGLRenderTarget | null>(null)
  useEffect(() => {
    const rt = crearElEstudio(gl)
    estudio.current = rt
    for (const a of m.current.armados) ponerElEstudio(a.material, rt)
    return () => {
      estudio.current = null
      rt.dispose()
    }
  }, [gl])

  // [PASADA FINAL] A1 · los títulos anotados, en sincronía con el registro (`sincronia.ts`): lo nuevo se arma (el hero ya;
  // los demás con la página ociosa), lo que se fue se suelta y un título remontado sólo cambia de lugar. Al irse, todo.
  const vivo = useRef(true)
  useEffect(() => {
    const g = raiz.current
    const s = m.current
    vivo.current = true
    return () => {
      vivo.current = false
      TITULAR_EN_VIVO.armado = false
      if (g !== null) soltarTodos({ gl, escena, camara, raiz: g, variante, estudio: () => estudio.current }, s.armados)
    }
  }, [variante, gl, escena, camara])
  useEffect(() => {
    void version
    const g = raiz.current
    if (g === null) return undefined
    return sincronizar({ gl, escena, camara, raiz: g, variante, estudio: () => estudio.current }, m.current.armados, TITULOS_DE_VOLUMEN.values(), () => vivo.current)
  }, [version, variante, gl, escena, camara])

  // Al cambiar el tamaño del cuadro, cada título se vuelve a colocar en su próxima llegada (o ya, si está a la vista).
  useEffect(() => descolocar(m.current.armados, tam.width), [tam.width, tam.height])

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    const v = new THREE.Vector3() // banco
    ventana.__titulosDelBanco = {
      titulos: () =>
        m.current.armados.map((a) => {
          // La caja del título en el cuadro (px), con su llegada de ahora: para compararla con la del DOM.
          a.malla.geometry.computeBoundingBox()
          const b = a.malla.geometry.boundingBox ?? new THREE.Box3() // banco
          const esquinas = [b.min.x, b.max.x].flatMap((x) => [b.min.y, b.max.y].map((y) => v.set(x, y, 0).applyMatrix4(a.malla.matrixWorld).project(camara).clone())) // banco
          const px = esquinas.map((p) => [((p.x + 1) / 2) * tam.width, ((1 - p.y) / 2) * tam.height]) // banco
          const lugar = a.titulo.lugar.getBoundingClientRect()
          return {
            id: a.titulo.id,
            llegada: a.titulo.llegada,
            salida: a.titulo.salida,
            mostrado: { ...a.mostrado },
            visible: a.malla.visible,
            colocado: a.colocado,
            triangulos: (a.malla.geometry.getAttribute('position').count / 3) | 0,
            enElCuadro: { izquierda: Math.min(...px.map((p) => p[0])), derecha: Math.max(...px.map((p) => p[0])), arriba: Math.min(...px.map((p) => p[1])), abajo: Math.max(...px.map((p) => p[1])) },
            dom: { izquierda: lugar.left, derecha: lugar.right, arriba: lugar.top, abajo: lugar.bottom },
          }
        }),
      // La cámara viva y la que la colocación calcula para el mismo progreso (sin el mouse ni la inercia).
      camara: () => {
        const calculada = camaraDeLaLectura(rig.current.progress, tam.width / Math.max(1, tam.height), stats.current.logoW, stats.current.logoH, new THREE.PerspectiveCamera()) // banco
        return { viva: [...camara.position.toArray(), ...camara.quaternion.toArray()], calculada: [...calculada.position.toArray(), ...calculada.quaternion.toArray()] }
      },
      progreso: () => rig.current.progress,
    }
    return () => {
      delete ventana.__titulosDelBanco
    }
  }, [camara, rig, stats, tam.width, tam.height])

  // [CIERRE RETOQUE 3D] D1 · los que van con la página se colocan con la cámara SIN el mouse: fijos en el mundo, el paralaje les
  // deja ver la perspectiva y los costados (con la viva, mouse incluido, acompañaban a la cámara). [NOCTURNO] A1: y su texto
  // 2D (la bajada, los CTA, los valores), en el plano de cada uno con la cámara viva (`acompanantes.ts`).
  useFrame((state, delta) => {
    alCuadro(m.current, logoMaterialRef.current, keyLightRef.current, tam.width / Math.max(1, tam.height), stats, Math.min(delta, 0.1), CAMARA_SIN_EL_MOUSE)
    llevarLosAcompanantes(m.current.armados, state.camera, { ancho: tam.width, alto: tam.height }, stats.current)
  })

  // [AJUSTES FINALES] A2 · su sombra en el piso vivo (`sombra/deLosTitulos.ts`; era la prueba de PASADA FINAL C3).
  return (
    <>
      <group ref={raiz} name="titulos de volumen" />
      <SombraDeLosTitulos armados={() => m.current.armados} keyLightRef={keyLightRef} />
    </>
  )
}

/** Al cambiar el tamaño del cuadro, cada título se vuelve a colocar en su próxima llegada (o ya, si está a la vista). */
function descolocar(armados: readonly Armado[], ancho: number): void {
  void ancho
  for (const a of armados) a.colocado = false
}

/**
 * [PASADA FINAL] A3 · El lazo de la escena se para detrás de un panel opaco (`visibilidad.ts`) y lo mostrado de cada título
 * queda congelado donde iba; si al reanudarse persiguiera desde ahí con su mínimo, se vería un estado viejo deshaciéndose
 * (la frase a medio armar retrocediendo al volver de Tu panel). Un hueco mayor que esto entre dos cuadros es una
 * reanudación: lo mostrado vuelve a ser lo que dice el scroll, y desde ahí sigue. Función del scroll, también al volver.
 */
const PAUSA_DEL_LAZO_MS = 250

/** [PULIDO 1] P6 · lo que deja `alCuadroDelQueQueda` además de si se dibuja: si su llegada sigue su camino (una vez). */
const DEL_QUE_QUEDA = { enCamino: false }

/** Un cuadro: la llegada y la salida de cada título (perseguidas), si se dibuja, dónde va (al empezar a llegar) y su luz. */
function alCuadro(s: { readonly armados: readonly Armado[]; readonly quieto: boolean; readonly nudo: THREE.PerspectiveCamera; readonly scroll: { y: number; cuando: number }; ultimoCuadro: number }, logo: THREE.MeshStandardMaterial | null, principal: THREE.DirectionalLight | null, aspecto: number, stats: ProbeStatsStore, dt: number, viva: THREE.Camera): void {
  // [PULIDO 1] P6 · lo que se muestra del titular del hero, para el logo del intro (que lo sigue): el menor de sus registros.
  let llegadaDelTitular = 1
  let registrosDelTitular = 0
  let titularEnCamino = true
  if (s.armados.length === 0) {
    TITULAR_EN_VIVO.armado = false
    return
  }
  const nivel = principal === null ? 1 : Math.min(1, principal.intensity / KEY_INTENSITY)
  // [3D Y SONIDO] T1: en un viaje del menú no llega ninguno; al terminar, la llegada repetida del destino.
  const enViaje = viajeEnCurso() !== null
  const y = window.scrollY
  // [RONDA 2] F2 · el asiento: con el scroll quieto (y sin viaje ni llegada repetida corriendo), lo que quedó a mitad se
  // completa o se deshace. Lo demás es función del scroll.
  const ahora = performance.now()
  if (y !== s.scroll.y) {
    s.scroll.y = y
    s.scroll.cuando = ahora
  }
  const asentar = !enViaje && REPETICIONES.activas === 0 && ahora - s.scroll.cuando > ASIENTO.quietoMs
  const reanudado = s.ultimoCuadro > 0 && ahora - s.ultimoCuadro > PAUSA_DEL_LAZO_MS
  s.ultimoCuadro = ahora
  for (const a of s.armados) {
    if (a.titulo.queda) {
      if (!a.colocado) colocarElArmado(a, s.nudo, aspecto, stats, viva)
      a.uniforms.uQuieto.value = s.quieto ? 1 : 0
      avancesDeLasRayas(a.titulo, a.uniforms.uTrazos.value)
      a.uniforms.uDespinte.value = despinteDelTitulo(a.titulo)
      a.malla.visible = alCuadroDelQueQueda(a, enViaje, asentar, reanudado, y, dt, viva)
      if (a.malla.visible) iluminar(a, logo, nivel)
      if ((IDS_DEL_TITULAR_DEL_HERO as readonly string[]).includes(a.titulo.id)) {
        llegadaDelTitular = Math.min(llegadaDelTitular, a.mostrado.llegada)
        registrosDelTitular += 1
        titularEnCamino = titularEnCamino && DEL_QUE_QUEDA.enCamino
      }
      continue
    }
    // [RONDA 2] F2 · función del scroll (la llegada y la salida), con el asiento al frenar; en un viaje, desarmado.
    if (reanudado) {
      a.mostrado.llegada = acotar01(enViaje ? 0 : a.titulo.llegada)
      a.mostrado.salida = acotar01(a.titulo.salida)
    }
    a.mostrado.llegada = mostradoDelScroll(a.mostrado.llegada, enViaje ? 0 : a.titulo.llegada, asentar, dt, enViaje ? null : a.titulo.minimoS, a.titulo.asiento)
    a.mostrado.salida = mostradoDelScroll(a.mostrado.salida, a.titulo.salida, asentar, dt, a.titulo.salidaMinimaS)
    const { llegada, salida } = a.mostrado
    a.uniforms.uLlegada.value = llegada
    a.uniforms.uSalida.value = salida
    a.uniforms.uQuieto.value = s.quieto ? 1 : 0
    // Regla 5: sin ninguna letra en camino, no se dibuja; al empezar la próxima llegada se vuelve a colocar. [RETOQUE PANEL]
    // T4: el que no tiene letras (el ≠), sólo con alguna raya empezada.
    const conRaya = avancesDeLasRayas(a.titulo, a.uniforms.uTrazos.value)
    a.uniforms.uDespinte.value = despinteDelTitulo(a.titulo)
    // [PULIDO 2] 2f · el que no tiene letras llega como los demás: con su llegada (en un viaje, desarmado; después, la del
    // destino) y sus rayas crecen con ella. Antes se dibujaba con cualquier raya empezada: desde el menú, en el viaje.
    if (a.sinLetras) a.uniforms.uTrazos.value.multiplyScalar(llegada * (1 - salida))
    a.malla.visible = a.sinLetras ? conRaya && llegada > 0 && salida < 1 : llegada > 0 && salida < 1
    // [PULIDO 2] 5 · relevado (el CTA del final lo dibuja en su lugar): no se dibuja, pero lo mostrado sigue al scroll.
    if (RELEVO_DE_LOS_TITULOS.relevado(a.titulo.id)) a.malla.visible = false
    if (!a.malla.visible) {
      if (llegada <= 0) a.colocado = false
      continue
    }
    if (!a.colocado) colocarElArmado(a, s.nudo, aspecto, stats, viva)
    // [RETOQUE 3D] El de `pantalla` (3C) va con la página: fuera del cuadro no se dibuja.
    const d = a.titulo.colocacion === 'pantalla' ? corrimiento(a.pin, y) : 0
    if (fueraDelCuadro(a, d)) {
      a.malla.visible = false
      continue
    }
    ubicar(a, d, viva)
    iluminar(a, logo, nivel)
  }
  TITULAR_EN_VIVO.armado = registrosDelTitular === IDS_DEL_TITULAR_DEL_HERO.length
  TITULAR_EN_VIVO.llegada = TITULAR_EN_VIVO.armado ? llegadaDelTitular : 0
  TITULAR_EN_VIVO.enCamino = TITULAR_EN_VIVO.armado && titularEnCamino
}

/** [RETOQUE 3D] ¿Su renglón, corrido `d` px, quedó entero fuera del cuadro? */
function fueraDelCuadro(a: Armado, d: number): boolean {
  const l = a.lugar
  return l !== null && (l.arriba + d > l.alto || l.arriba + l.linea + d < 0)
}

/**
 * [RETOQUE 3D] Dónde va en este cuadro: `lectura`, corrido desde donde lo colocó la cámara de su lectura; `pantalla`, donde
 * la cámara de ahora lo ve en su lugar del DOM de ahora (sin leer el DOM: su lugar al colocarse, corrido con la página).
 */
function ubicar(a: Armado, d: number, viva: THREE.Camera): void {
  const l = a.lugar
  if (a.titulo.colocacion === 'pantalla' && l !== null && viva instanceof THREE.PerspectiveCamera) {
    a.ahora.arriba = l.arriba + d + a.titulo.corrida * l.alto
    colocar(a.grupo, viva, a.ahora, a.fuente.data)
    return
  }
  correr(a, d)
}

/** [RETOQUE 3D] B5 · el título, corrido desde donde se colocó: `d` px (su escenario) más la corrida de su pieza del DOM. */
function correr(a: Armado, d: number): void {
  const alto = a.lugar === null ? 0 : a.lugar.alto
  a.grupo.position.copy(a.base).addScaledVector(a.arriba, -(d + a.titulo.corrida * alto) * a.mundoPorPx)
}

/**
 * Una vez por llegada (y al cambiar el cuadro): el título donde la cámara de su lectura lo ve en su lugar del DOM. El de
 * `pantalla`, con la cámara de ahora (la de su lectura es ésa: lo que se ve ahora es lo que reemplaza).
 */
function colocarElArmado(a: Armado, camara: THREE.PerspectiveCamera, aspecto: number, stats: ProbeStatsStore, viva: THREE.Camera): void {
  const nudo = a.titulo.colocacion === 'pantalla' && viva instanceof THREE.PerspectiveCamera ? viva : camaraDeLaLectura(a.titulo.lectura, aspecto, stats.current.logoW, stats.current.logoH, camara)
  const lugar = lugarDeLectura(a.titulo.lugar, a.titulo.subida)
  a.mundoPorPx = colocar(a.grupo, nudo, lugar, a.fuente.data) // una vez por llegada
  a.lugar = lugar
  Object.assign(a.ahora, lugar)
  a.base.copy(a.grupo.position)
  a.arriba.set(0, 1, 0).applyQuaternion(nudo.quaternion)
  if (a.titulo.queda || a.titulo.colocacion === 'pantalla') a.pin = pinDelLugar(a.titulo.lugar)
  a.colocado = true
}

/** La noche del logo, en el mismo cuadro; y los reflejos, con la luz de la sala. */
function iluminar(a: Armado, logo: THREE.MeshStandardMaterial | null, nivel: number): void {
  if (logo !== null) a.material.emissive.copy(logo.emissive)
  a.material.envMapIntensity = nivel
}

/**
 * [RETOQUE 3D] B1 · EL QUE SE QUEDA (Portfolio, el hero): sin salida propia; va corrido con su escenario (sale con la
 * sección, sin animación propia). `salida` entera lo esconde sin moverlo (el túnel lo tapa). Devuelve si se dibuja.
 *
 * [RONDA 2] F2 · Portfolio ya no «termina lo que empezó» (eso, con el scroll rápido, lo dejaba en «Portfoli»): su llegada
 * es función del scroll, con el asiento al frenar, como la de todos. El hero (no se rearma: llega una vez por carga) sigue
 * con su llegada por tiempo, que converge sola. [NOCTURNO] A4: con su `minimoS`, la llegada larga de ESCENA 10.
 * [AJUSTES FINALES] A4: y arranca recién cuando la carga se abre (`_lib/carga.ts`: el velo terminó de fundirse).
 */
function alCuadroDelQueQueda(a: Armado, enViaje: boolean, asentar: boolean, reanudado: boolean, y: number, dt: number, viva: THREE.Camera): boolean {
  const m = a.mostrado
  const d = corrimiento(a.pin, y)
  const fuera = fueraDelCuadro(a, d)
  const tapado = a.titulo.salida >= 0.999
  // [PASADA FINAL] A3 · al reanudarse el lazo, el que se rearma vuelve a lo que dice el scroll (el hero llega una vez, por tiempo).
  if (reanudado && a.titulo.rearma) m.llegada = acotar01(enViaje ? 0 : a.titulo.llegada)
  if (a.titulo.rearma) m.llegada = mostradoDelScroll(m.llegada, enViaje ? 0 : a.titulo.llegada, asentar, dt, enViaje ? null : a.titulo.minimoS)
  // [AJUSTES FINALES] A4 · el que llega una vez por carga (el hero) espera a que la carga se abra (el velo terminó de fundirse).
  else if (!fuera && !tapado) m.llegada = persigue(m.llegada, cargaLista() ? a.titulo.llegada : 0, dt, a.titulo.minimoS ?? undefined)
  DEL_QUE_QUEDA.enCamino = !fuera && !tapado
  m.salida = 0
  a.uniforms.uLlegada.value = m.llegada
  a.uniforms.uSalida.value = 0
  const visible = m.llegada > 0 && !fuera && !tapado
  if (visible) ubicar(a, d, viva)
  return visible
}


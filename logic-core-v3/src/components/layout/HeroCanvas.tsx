"use client"

import { Canvas, useLoader } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { SVGLoader } from 'three-stdlib'
import { Environment, Lightformer } from '@react-three/drei'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { HERO_INBOX_CAMERA, heroInboxLogoScale } from '@/lib/logo-footprint'

// HDRI self-hosteado (public/hdri): el preset 'studio' de drei lo bajaba de
// raw.githubusercontent.com en cada visita. Mismo archivo, mismo look, servido
// desde el propio origen.
//
// No es opcional: el material del artefacto es `metalness={1}` / `roughness={0}`
// / `clearcoat={1}` — un espejo. Sin entorno que reflejar se renderiza negro
// plano. `ambientLight` sola no lo resuelve.
const HDRI_STUDIO_PATH = '/hdri/studio_small_03_1k.hdr'

/*
 * ── Mouse-follow: DESACTIVADO (S3b) ─────────────────────────────────────────
 *
 * Acá vivía `PointerSync`, un feed que escuchaba `pointermove` en toda la
 * ventana y escribía `state.pointer` de r3f (hace falta un feed propio porque
 * el canvas va con `pointer-events: none` y r3f no lo actualiza solo).
 *
 * Se eliminó: el logo va a obedecer al SCROLL y a nada más.
 *
 * Dónde quedó cada mitad, que importa para el sprint de coreografía:
 *   · La ROTACIÓN por puntero vive dentro de `HeroArtifact.tsx`, que está
 *     FROZEN — sigue ahí, leyendo `state.pointer` en cada frame.
 *   · Su ENTRADA vivía acá. Sin el feed, `state.pointer` se queda en (0,0) y el
 *     componente frozen amortigua la rotación hacia 0: el logo queda de frente,
 *     quieto. O sea que el follow queda neutralizado SIN tocar el frozen.
 *
 * Consecuencia para quien construya la coreografía: la única entrada de
 * rotación que el componente frozen expone es `state.pointer`. Para rotar con
 * el scroll hay dos caminos — escribir `state.pointer` desde el progreso (usar
 * la entrada que ya existe), o rotar el `<group>` padre desde afuera. La
 * segunda no pelea con la amortiguación interna del frozen; la primera sí.
 */

/**
 * Señal de "listo". Comparte el cache de `useLoader` con `HeroArtifact` (mismo
 * SVG) → suspende hasta que está cargado. Al montar (post-Suspense) espera dos
 * frames — logo extruido y pintado — y recién ahí avisa, para que el fade de
 * entrada no revele una caja vacía.
 */
function ReadySignal({ onReady }: { onReady: () => void }) {
  useLoader(SVGLoader, '/logodevelOP.svg')

  useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => onReady())
    })

    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [onReady])

  return null
}

/**
 * El logo, siempre en su estado final (`phase='done'`: escala 1, opacidad 1,
 * orientado al puntero). `HeroArtifact` está congelado — se consume tal cual.
 *
 * La escala sale de `heroInboxLogoScale()` (calibración B de
 * `logo-footprint.ts`) y no de una fórmula propia sobre el aspecto: define qué
 * fracción de su caja ocupa el logo, derivada de la MISMA cámara que se le pasa
 * al `<Canvas>`. El slot es cuadrado y r3f ajusta el aspect solo, así que la
 * relación se conserva en todo viewport — por eso este componente ya no lee
 * `size`.
 *
 * `position` en el origen: el mesh flota perpetuamente dentro del componente
 * frozen (`sin(t·0.65)·0.08`), así que oscila alrededor del centro de su caja.
 */
function HeroLogo() {
  return (
    <group scale={heroInboxLogoScale()}>
      <HeroArtifact phase="done" />
    </group>
  )
}

/**
 * Canvas del artefacto del hero. Se monta SOLO desde `HeroArtifactLayer`
 * (desktop, diferido) y llena la caja de su wrapper — r3f lo dimensiona solo,
 * sin sincronización manual de tamaño.
 *
 * **Sin EffectComposer**, a diferencia del hero anterior, por dos razones que
 * apuntan al mismo lado:
 *
 * 1. La dirección es monocroma. `ChromaticAberration` es, literalmente, meter
 *    color: parte los bordes en RGB. Contra "instrumento de precisión" no va.
 * 2. La lección aprendida del repo dice que en canvas chicos y transparentes el
 *    composer pinta un cuadrado oscuro del tamaño del canvas (Windows/ANGLE,
 *    inalcanzable desde shaders), y que ahí NO se usa. El hero viejo se salvaba
 *    por ser un canvas de página full-bleed; este es in-box, o sea exactamente
 *    el caso prohibido.
 *
 * De paso, saca `@react-three/postprocessing` del set de chunks que el home
 * llega a pedir, y con él se va el gate `postFxReady` que existía solo para
 * esquivar ese cuadrado.
 *
 * `DotMatrixMesh` tampoco se monta más acá: la grilla de puntos se desconectó
 * del home (B2-S2). El archivo `canvas/DotMatrix.tsx` sigue vivo — lo usan
 * `/login`, `/forgot-password` y `/accept-invite`.
 */
export default function HeroCanvas({
  frameloop,
  onReady,
}: {
  // 'always' con el artefacto en viewport; 'demand' fuera de él (el gate vive
  // en HeroArtifactLayer). Fuera de pantalla no se renderiza ni un frame.
  frameloop: 'always' | 'demand'
  onReady: () => void
}) {
  return (
    <Canvas
      className="h-full w-full"
      frameloop={frameloop}
      // Desde `logo-footprint.ts` (calibración B) y no literales acá: la
      // escala del logo se deriva de ESTA misma cámara, así que si divergen el
      // 2D y el 3D dejan de calzar sin que nada falle a la vista.
      camera={{ position: [0, 0, HERO_INBOX_CAMERA.z], fov: HERO_INBOX_CAMERA.fov }}
      gl={{
        alpha: true,
        powerPreference: 'high-performance',
        antialias: false,
        stencil: false,
        depth: true,
      }}
      dpr={[1, 1.5]}
    >
      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />

        {/*
          Rig de luz del artefacto (B2-S4). El objeto se leía como un fantasma:
          negro metálico sobre `#0D0B09`, con el flanco izquierdo indistinguible
          del fondo y la lectura colgada del filo especular del HDRI.

          La causa es el MATERIAL, que está congelado (`HeroArtifact.tsx`):
          `color=#000000` con `metalness=1` deja F0 = 0, así que como metal el
          objeto no refleja NADA salvo en ángulos rasantes. Lo único que sí
          responde de frente es el `clearcoat` (capa dieléctrica, F0 = 0.04): el
          barrido brillante que ya tenía la panza de la "p" es el clearcoat
          espejando un softbox del HDRI al 4%.

          Se descartaron, en el orden que fija el sprint:

          - **Encuadre.** Medido en las dos direcciones (yaw −0.4 y +0.5): rotar
            solo MUEVE el único parche iluminado de un flanco al otro. Con F0 = 0
            no hay orientación que ilumine una cara frontal plana.
          - **Material.** Congelado. No se toca.

          Queda la luz, y el rig es de dos piezas:

          1. `environmentIntensity` sube el HDRI y con él el barrido de la "p" —
             es un degradé fotográfico, sin bordes, que es lo que da el carácter
             metálico.
          2. Los tres `Lightformer` concéntricos son el relleno del flanco muerto.
             Van SOLO a la izquierda y con `z` positivo (detrás de la cámara)
             porque es la dirección que espejan las caras frontales. Dos
             restricciones los fijan: si tapan el lóbulo brillante del HDRI el
             barrido desaparece (medido), y como las caras planas comparten
             normal, una fuente de borde duro se espeja como un corte recto sobre
             el objeto — de ahí los tres círculos en escalones, que aproximan una
             caída suave.

          Las intensidades son bajas a propósito: la cara plana tiene que quedar
          en grafito oscuro, apenas despegada del lienzo. El objeto se lee como
          instrumento iluminado, no como objeto con luz propia.

          Todo blanco: la dirección es monocroma y una luz de color la rompería.

          Sin `ambientLight`: la que había (intensity 1.5) no aportaba un solo
          fotón a este material. La luz ambiente solo alimenta el término difuso,
          y con `metalness=1` el difuso es 0; el clearcoat es puramente especular.
          Verificado sacándola: el render queda indistinguible.
        */}
        <Environment files={HDRI_STUDIO_PATH} environmentIntensity={2.2} frames={1} resolution={512}>
          <Lightformer form="circle" intensity={0.3} position={[-9, -2, 12]} scale={[26, 26, 1]} />
          <Lightformer form="circle" intensity={0.42} position={[-8, 1, 12]} scale={[16, 16, 1]} />
          <Lightformer form="circle" intensity={0.6} position={[-7, 3, 12]} scale={[9, 9, 1]} />
        </Environment>

        <HeroLogo />
      </Suspense>
    </Canvas>
  )
}

"use client"

import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { type MotionValue } from 'motion/react'
import * as THREE from 'three'
import { SVGLoader } from 'three-stdlib'
import { Environment } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { HeroArtifact } from '@/components/3d/HeroArtifact'
import { DotMatrixMesh } from '@/components/canvas/DotMatrix'

// HDRI self-hosteado (public/hdri): el preset 'studio' de drei lo bajaba de
// raw.githubusercontent.com en cada visita. Mismo archivo, mismo look, servido
// desde el propio origen.
const HDRI_STUDIO_PATH = '/hdri/studio_small_03_1k.hdr'

// Fracción del ancho que el logo se traslada del centro → columna derecha.
// La comparten: targetX del logo, la sombra (que lo sigue) y la normalización
// relativa del puntero. Single source.
const LOGO_RIGHT_FRACTION = 0.25

// Sombra del logo (drop-shadow radial que SIGUE su X). Tunables.
const SHADOW_WIDTH = 4.6
const SHADOW_HEIGHT = 1.5
const SHADOW_Y = -1.7
const SHADOW_Z = -0.35
const SHADOW_OPACITY = 0.5

// Aberración cromática: bajada para que los puntos (chicos) no se partan en RGB,
// conservando una aberración SUTIL en el logo. Tunable.
const CHROMATIC_ABERRATION_OFFSET: [number, number] = [0.0006, 0.0006]

function MobileInputHandler() {
    const { pointer } = useThree()
    const lastTouchRef = useRef(0)
    const orientationEnabledRef = useRef(false)

    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                lastTouchRef.current = Date.now()
                const touch = e.touches[0]
                pointer.x = (touch.clientX / window.innerWidth) * 2 - 1
                pointer.y = -(touch.clientY / window.innerHeight) * 2 + 1
            }
        }

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (Date.now() - lastTouchRef.current < 900) return
            const gamma = e.gamma ?? 0
            const beta = e.beta ?? 45
            pointer.x = Math.max(-1, Math.min(1, gamma / 28))
            pointer.y = Math.max(-1, Math.min(1, (beta - 45) / 34))
        }

        const enableOrientation = () => {
            if (orientationEnabledRef.current) return
            orientationEnabledRef.current = true
            window.addEventListener('deviceorientation', handleOrientation, { passive: true })
        }

        const requestOrientationPermission = () => {
            if (typeof window.DeviceOrientationEvent === 'undefined') return

            const orientationEvent = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
                requestPermission?: () => Promise<PermissionState>
            }

            if (typeof orientationEvent?.requestPermission !== 'function') {
                enableOrientation()
                return
            }

            void orientationEvent.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') enableOrientation()
                })
                .catch(() => undefined)
        }

        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('touchstart', requestOrientationPermission, { once: true, passive: true })
        window.addEventListener('pointerdown', requestOrientationPermission, { once: true, passive: true })
        requestOrientationPermission()

        return () => {
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchstart', requestOrientationPermission)
            window.removeEventListener('pointerdown', requestOrientationPermission)
            window.removeEventListener('deviceorientation', handleOrientation)
        }
    }, [pointer])

    return null
}

// Feed global de puntero para desktop. El canvas full-bleed va con
// pointer-events:none, así que r3f no actualiza state.pointer por sí solo; esto
// deja al logo (HeroArtifact en 'done') siguiendo al mouse en TODA la pantalla.
// No se monta en reduced-motion (sin parallax).
function DesktopPointerSync({ introProgress, layerOpacity }: { introProgress: MotionValue<number>; layerOpacity: MotionValue<number> }) {
    const { pointer } = useThree()

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            // Normalizar RELATIVO al centro-X actual del logo en pantalla (no al del
            // viewport): el logo va de centro → columna derecha según introProgress,
            // su centro en px es innerWidth*(0.5 + LOGO_RIGHT_FRACTION*p). Restarlo
            // antes de normalizar hace que oriente hacia el cursor desde donde está.
            const p = introProgress.get()
            const logoCenterX = window.innerWidth * (0.5 + LOGO_RIGHT_FRACTION * p)
            pointer.x = (event.clientX - logoCenterX) / (window.innerWidth / 2)
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
        }

        window.addEventListener('pointermove', handlePointerMove, { passive: true })
        return () => window.removeEventListener('pointermove', handlePointerMove)
    }, [pointer, introProgress])

    // R3: mientras la overlay 2D tapa (layerOpacity>0), forzar el 3D HEAD-ON
    // (state.pointer 0,0) → su silueta inclinada no asoma por los huecos del trazo.
    // Este useFrame corre ANTES que el de HeroArtifact (montado luego, en Suspense).
    // Se muta el state.pointer del callback (no el `pointer` del hook → lint-clean).
    useFrame((state) => {
        if (layerOpacity.get() > 0.001) {
            state.pointer.x = 0
            state.pointer.y = 0
        }
    })

    return null
}

// Señal de readiness del logo: comparte el cache de useLoader con HeroArtifact
// (mismo SVG) → suspende hasta que está cargado. Al montar (post-Suspense) espera
// 2 frames (logo extruido + pintado) y avisa al orquestador vía onReady.
function LogoReadySignal({ onReady }: { onReady: () => void }) {
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

function HeroCanvasSizeSync({
    active,
    targetRef,
    onSized,
}: {
    active: boolean
    targetRef: RefObject<HTMLDivElement | null>
    // FIX-GHOST-BOX: se dispara UNA vez, cuando el canvas deja el default 300×150
    // de R3F y toma su tamaño real. El caller lo usa para no pintar post-fx antes.
    onSized?: () => void
}) {
    const { invalidate, setSize } = useThree()
    // Guard: onSized dispara exactamente una vez por vida del componente.
    const sizedRef = useRef(false)

    useLayoutEffect(() => {
        if (!active) return

        const frameIds: number[] = []

        const syncSize = () => {
            const target = targetRef.current
            if (!target) return

            const rect = target.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return

            setSize(rect.width, rect.height, rect.top, rect.left)
            invalidate()
            // FIX-GHOST-BOX: recién acá el canvas dejó el 300×150 default. Avisar
            // una sola vez para habilitar el EffectComposer sin ventana de cuadrado.
            if (!sizedRef.current) {
                sizedRef.current = true
                onSized?.()
            }
        }

        const syncAcrossFrames = () => {
            syncSize()
            const firstFrame = window.requestAnimationFrame(() => {
                syncSize()
                const secondFrame = window.requestAnimationFrame(syncSize)
                frameIds.push(secondFrame)
            })
            frameIds.push(firstFrame)
        }

        syncAcrossFrames()

        const resizeObserver =
            typeof ResizeObserver !== 'undefined' && targetRef.current
                ? new ResizeObserver(syncAcrossFrames)
                : null

        if (resizeObserver && targetRef.current) {
            resizeObserver.observe(targetRef.current)
        }

        window.addEventListener('resize', syncAcrossFrames)
        window.addEventListener('orientationchange', syncAcrossFrames)

        return () => {
            resizeObserver?.disconnect()
            frameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
            window.removeEventListener('resize', syncAcrossFrames)
            window.removeEventListener('orientationchange', syncAcrossFrames)
        }
    }, [active, invalidate, setSize, targetRef, onSized])

    return null
}

// Logo: SIEMPRE phase='done' (escala 1 constante + sigue al mouse, sin escalar).
// La escala exterior se DESACOPLA del ancho usando la referencia de columna
// derecha ((width/2)/height en desktop) para que el tamaño sea idéntico al actual
// aunque el canvas sea full-bleed (la altura no cambia entre layouts). El group
// exterior traslada en X de centro→derecha según introProgress — solo desktop
// (mobile targetX=0, el logo solo aparece en su lugar). La sombra es un mesh
// aparte (HeroLogoShadow) que sigue la misma X.
function HeroLogo({
    isSplitLayout,
    introProgress,
}: {
    isSplitLayout: boolean
    introProgress: MotionValue<number>
}) {
    const { size, viewport } = useThree()
    const outerRef = useRef<THREE.Group>(null)

    const refWidth = isSplitLayout ? size.width / 2 : size.width
    const aspect = refWidth / Math.max(size.height, 1)
    const scale = isSplitLayout
        ? aspect < 0.8
            ? Math.max(0.52, aspect * 0.96)
            : Math.min(1.12, aspect * 1.02)
        : Math.min(1.28, Math.max(1.02, aspect * 0.78))
    const y = isSplitLayout ? 0.08 : 0.02

    useFrame(() => {
        if (!outerRef.current) return
        const targetX = isSplitLayout ? viewport.width * LOGO_RIGHT_FRACTION : 0
        outerRef.current.position.x = introProgress.get() * targetX
    })

    return (
        <group ref={outerRef}>
            <group scale={scale} position={[0, y, 0]}>
                <HeroArtifact phase="done" />
            </group>
        </group>
    )
}

// Textura radial (oscuro al centro → transparente) para la sombra. Se crea una
// vez en cliente (el canvas r3f no corre en SSR, así que `document` existe).
function createRadialShadowTexture(): THREE.CanvasTexture {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        gradient.addColorStop(0, 'rgba(0,0,0,0.6)')
        gradient.addColorStop(0.55, 'rgba(0,0,0,0.2)')
        gradient.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, size, size)
    }
    return new THREE.CanvasTexture(canvas)
}

// UNA sola sombra del logo: plano radial (encarado a cámara) DEBAJO del logo, que
// sigue su X cada frame con el MISMO valor (introProgress * viewport.width *
// LOGO_RIGHT_FRACTION). Mesh independiente → NO hereda la rotación del mouse-follow.
// No usa drei ContactShadows: su shadow no trackeaba el traslado y además capturaba
// los puntos (sombra fantasma al centro/izquierda).
function HeroLogoShadow({ introProgress }: { introProgress: MotionValue<number> }) {
    const { viewport } = useThree()
    const meshRef = useRef<THREE.Mesh>(null)
    const texture = useMemo(() => createRadialShadowTexture(), [])

    useEffect(() => () => texture.dispose(), [texture])

    useFrame(() => {
        if (!meshRef.current) return
        meshRef.current.position.x = introProgress.get() * viewport.width * LOGO_RIGHT_FRACTION
    })

    return (
        <mesh ref={meshRef} position={[0, SHADOW_Y, SHADOW_Z]}>
            <planeGeometry args={[SHADOW_WIDTH, SHADOW_HEIGHT]} />
            <meshBasicMaterial map={texture} transparent opacity={SHADOW_OPACITY} depthWrite={false} />
        </mesh>
    )
}

// Único canvas del Hero (logo + puntos). Full-bleed en desktop, in-box en mobile
// (lo decide quién lo monta vía targetRef). dpr estático, sin toggles.
// Vive en su propio módulo (default export) para que Hero.tsx lo cargue con
// next/dynamic ssr:false → three/fiber/drei/postprocessing quedan fuera del
// bundle inicial del home.
export default function HeroCanvas({
    active,
    isSplitLayout,
    targetRef,
    introProgress,
    layerOpacity,
    dotsReveal,
    prefersReducedMotion,
    frameloop,
    onLogoReady,
}: {
    active: boolean
    isSplitLayout: boolean
    targetRef: RefObject<HTMLDivElement | null>
    introProgress: MotionValue<number>
    layerOpacity: MotionValue<number>
    dotsReveal: MotionValue<number>
    prefersReducedMotion: boolean
    // 'always' con el hero en viewport; 'demand' fuera de él (ver gate en Hero()).
    frameloop: 'always' | 'demand'
    onLogoReady: () => void
}) {
    // FIX-GHOST-BOX — El EffectComposer (incl. Vignette darkness) sobre este canvas
    // transparente (gl.alpha:true) pinta un cuadrado OSCURO del tamaño del canvas
    // (lesson-learned del repo). Al montar, R3F arranca en su default 300×150 y
    // HeroCanvasSizeSync recién sincroniza el tamaño real un par de frames después.
    // Si `canvasReveal` (la opacidad del wrapper) sube en esa ventana, el composer
    // se ve como un recuadro oscuro 300×150 arriba-izquierda ("recuadro fantasma").
    // Gateamos el composer hasta el primer sizing real: sin composer, R3F pinta
    // directo al canvas transparente → cero cuadrado. Una vez dimensionado (a los
    // pocos frames, normalmente todavía bajo la opacidad del reveal) el post-fx
    // entra idéntico a antes. Degradación segura: si nunca dimensionara, se pierde
    // el post-fx pero jamás aparece el cuadrado.
    const [postFxReady, setPostFxReady] = useState(false)
    const handleSized = useCallback(() => setPostFxReady(true), [])
    return (
        <Canvas className="relative z-10 h-full w-full" frameloop={frameloop} camera={{ position: [0, 0, isSplitLayout ? 15 : 13], fov: isSplitLayout ? 35 : 30 }} gl={{ alpha: true, powerPreference: "high-performance", antialias: false, stencil: false, depth: true }} dpr={[1, 1.5]}>
            <HeroCanvasSizeSync active={active} targetRef={targetRef} onSized={handleSized} />
            <MobileInputHandler />
            {isSplitLayout && !prefersReducedMotion ? <DesktopPointerSync introProgress={introProgress} layerOpacity={layerOpacity} /> : null}
            <Suspense fallback={null}>
                {/* Readiness gate: avisa al orquestador cuando el SVG está listo */}
                <LogoReadySignal onReady={onLogoReady} />

                {/* Background Dot Matrix — solo desktop y sin reduced-motion.
                    progress = introProgress (migración); revealProgress = dotsReveal
                    (aparición random R3). Componen: ambos multiplican el scale. */}
                {isSplitLayout && !prefersReducedMotion ? <DotMatrixMesh progress={introProgress} revealProgress={dotsReveal} /> : null}

                {/* Lighting Setup */}
                <ambientLight intensity={1.5} />
                <Environment files={HDRI_STUDIO_PATH} />

                {/* 3D Logo (siempre 'done') */}
                <HeroLogo isSplitLayout={isSplitLayout} introProgress={introProgress} />

                {/* Sombra del logo que lo sigue en X (solo desktop) */}
                {isSplitLayout ? <HeroLogoShadow introProgress={introProgress} /> : null}

                {/* Post-Processing Effects — FIX-GHOST-BOX: gateado a que el canvas
                    ya tenga tamaño real (postFxReady), para no pintar el cuadrado
                    oscuro 300×150 durante la ventana de sizing. Ver nota en HeroCanvas. */}
                {postFxReady && (
                    <EffectComposer enableNormalPass={false}>
                        <ChromaticAberration offset={CHROMATIC_ABERRATION_OFFSET} />
                        <Noise opacity={0.05} premultiply />
                        <Vignette eskil={false} offset={0.1} darkness={0.5} />
                    </EffectComposer>
                )}
            </Suspense>
        </Canvas>
    )
}

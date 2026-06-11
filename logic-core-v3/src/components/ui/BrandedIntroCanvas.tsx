"use client";

import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { SVGLoader } from "three-stdlib";
import { Environment, Lightformer } from "@react-three/drei";
import {
    EffectComposer,
    ChromaticAberration,
    Noise,
    Vignette,
} from "@react-three/postprocessing";
import { useMotionValue, type MotionValue } from "motion/react";

import { BrandedLogoWhite } from "@/components/3d/BrandedLogoWhite";
import { DotMatrixMesh } from "@/components/canvas/DotMatrix";
import { computeLogoOuterScale } from "@/lib/logo-footprint";

// ── Tunables (Route B · B4 calibra) ───────────────────────────────────────────
const BRANDED_AMBIENT_INTENSITY = 1.2; // luz pareja para el blanco del material (no mirror)
// El logo es BrandedLogoWhite (material BLANCO). El env suave (Lightformers) solo
// aporta SHEEN al clearcoat — NO es el mecanismo del blanco. Tunables (tono vs 2D).
const BRANDED_LIGHT_FRONT = 1.2; // panel frontal (sheen del clearcoat)
const BRANDED_LIGHT_SIDE = 0.6; // paneles laterales/superior (sheen en biseles)
// B4(b): el campo de puntos es FULL-SCREEN acá → bajado fuerte vs el home (0.0006)
// para que no se partan en RGB. Favorece puntos limpios; el logo conserva una
// aberración mínima. Subir si se quiere más aberración en el logo, o (a futuro)
// separar el post-proceso para excluir los puntos.
const BRANDED_CHROMATIC_ABERRATION_OFFSET: [number, number] = [0.0002, 0.0002];
// ──────────────────────────────────────────────────────────────────────────────

// Feed global de puntero (desktop, no reduced): el overlay va con pointer-events:none,
// así que r3f no actualiza state.pointer solo. Normalizado al centro del viewport
// (el logo está CENTRADO, sin traslación).
function DesktopPointerSync() {
    const { pointer } = useThree();

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [pointer]);

    return null;
}

// Readiness LOCAL: comparte el cache de useLoader del SVG (suspende hasta cargar);
// al montar (post-Suspense) espera 2 frames y avisa vía callback. NO usa los helpers
// del contexto (aislado del flujo del home).
function LogoReadySignal({ onReady }: { onReady: () => void }) {
    useLoader(SVGLoader, "/logodevelOP.svg");

    useEffect(() => {
        let raf1 = 0;
        let raf2 = 0;
        raf1 = window.requestAnimationFrame(() => {
            raf2 = window.requestAnimationFrame(() => onReady());
        });
        return () => {
            window.cancelAnimationFrame(raf1);
            window.cancelAnimationFrame(raf2);
        };
    }, [onReady]);

    return null;
}

// Logo CENTRADO (sin traslación). Escala con la referencia de columna derecha
// (mismo tamaño que el logo en reposo del home). HeroArtifact (FROZEN) en 'done'.
function CenteredLogo({
    isSplitLayout,
    mouseFollowEnabled,
}: {
    isSplitLayout: boolean;
    mouseFollowEnabled: boolean;
}) {
    const { size } = useThree();
    // Misma escala que el LogoStrokeOverlay (footprint compartido) + clamp width-fit
    // → en mobile el logo ENTRA en el ancho del viewport (no rebalsa).
    const scale = computeLogoOuterScale(size.width, size.height, isSplitLayout);
    const y = isSplitLayout ? 0.08 : 0.02;

    return (
        <group scale={scale} position={[0, y, 0]}>
            <BrandedLogoWhite mouseFollowEnabled={mouseFollowEnabled} />
        </group>
    );
}

/**
 * Route B — canvas del intro branded de marketing (su PROPIO Canvas; sin handoff).
 * Logo centrado + campo de puntos FULL-SCREEN ESTÁTICO (DotMatrixMesh con `progress`
 * fijo en 0 → grilla grande, sparse, centrada, sin cull). Mobile: sin puntos.
 * reduced-motion: sin puntos ni parallax. dpr estático.
 */
export function BrandedIntroCanvas({
    isSplitLayout,
    prefersReducedMotion,
    mouseFollowEnabled,
    dotsRevealProgress,
    onLogoReady,
}: {
    isSplitLayout: boolean;
    prefersReducedMotion: boolean;
    mouseFollowEnabled: boolean;
    /** Driver 0→1 para el reveal aleatorio de puntos. Omitir = todos visibles. */
    dotsRevealProgress?: MotionValue<number>;
    onLogoReady: () => void;
}) {
    // Fijo en 0 → campo full-screen estático (nunca se anima): sparse, centrado, sin cull.
    const dotsProgress = useMotionValue(0);

    return (
        <Canvas
            className="h-full w-full"
            camera={{ position: [0, 0, isSplitLayout ? 15 : 13], fov: isSplitLayout ? 35 : 30 }}
            gl={{ alpha: true, powerPreference: "high-performance", antialias: false, stencil: false, depth: true }}
            dpr={[1, 1.5]}
        >
            {isSplitLayout && !prefersReducedMotion && mouseFollowEnabled ? <DesktopPointerSync /> : null}
            <Suspense fallback={null}>
                {/* Readiness LOCAL */}
                <LogoReadySignal onReady={onLogoReady} />

                {/* Puntos full-screen — solo desktop y sin reduced-motion.
                    revealProgress: reveal aleatorio (R2); omitido → todos visibles. */}
                {isSplitLayout && !prefersReducedMotion ? (
                    <DotMatrixMesh
                        progress={dotsProgress}
                        revealProgress={dotsRevealProgress}
                    />
                ) : null}

                {/* Iluminación: lightbox BLANCO para que el chrome lea blanco
                    sobre el velo oscuro (calibrable acá, NO toca el frozen). */}
                <ambientLight intensity={BRANDED_AMBIENT_INTENSITY} />
                <Environment resolution={256}>
                    <Lightformer
                        form="rect"
                        intensity={BRANDED_LIGHT_FRONT}
                        color="#ffffff"
                        position={[0, 0, 8]}
                        scale={[18, 18, 1]}
                    />
                    <Lightformer
                        form="rect"
                        intensity={BRANDED_LIGHT_SIDE}
                        color="#ffffff"
                        position={[-7, 1, 2]}
                        rotation={[0, Math.PI / 2, 0]}
                        scale={[12, 12, 1]}
                    />
                    <Lightformer
                        form="rect"
                        intensity={BRANDED_LIGHT_SIDE}
                        color="#ffffff"
                        position={[7, 1, 2]}
                        rotation={[0, -Math.PI / 2, 0]}
                        scale={[12, 12, 1]}
                    />
                    <Lightformer
                        form="rect"
                        intensity={BRANDED_LIGHT_SIDE}
                        color="#ffffff"
                        position={[0, 7, 2]}
                        rotation={[Math.PI / 2, 0, 0]}
                        scale={[14, 8, 1]}
                    />
                    <Lightformer
                        form="rect"
                        intensity={BRANDED_LIGHT_SIDE * 0.7}
                        color="#ffffff"
                        position={[0, -7, 2]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={[14, 8, 1]}
                    />
                </Environment>

                {/* Logo centrado (material blanco; head-on hasta el crossfade) */}
                <CenteredLogo
                    isSplitLayout={isSplitLayout}
                    mouseFollowEnabled={mouseFollowEnabled}
                />

                {/* Post-procesado */}
                <EffectComposer enableNormalPass={false}>
                    <ChromaticAberration offset={BRANDED_CHROMATIC_ABERRATION_OFFSET} />
                    <Noise opacity={0.05} premultiply />
                    <Vignette eskil={false} offset={0.1} darkness={0.5} />
                </EffectComposer>
            </Suspense>
        </Canvas>
    );
}

export default BrandedIntroCanvas;

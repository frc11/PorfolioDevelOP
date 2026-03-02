'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer as EffectComposerOriginal, Bloom, ChromaticAberration, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
const EffectComposer = EffectComposerOriginal as any;
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

interface NeuroAvatarProps {
    isThinking?: boolean;
}

// Reusable color instances for emissive lerping
const _cyanColor = new THREE.Color('#06b6d4');
const _violetColor = new THREE.Color('#8b5cf6');
const _lerpColor = new THREE.Color();

function TesseractCore({ isThinking }: { isThinking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);
    const glowShellRef = useRef<any>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Smooth rotation
        const rotationSpeed = isThinking ? 0.3 : 0.05;
        meshRef.current.rotation.x += rotationSpeed * delta;
        meshRef.current.rotation.y += rotationSpeed * delta * 0.7;
        meshRef.current.rotation.z += rotationSpeed * delta * 0.4;

        // Scale animation with smooth lerp transitions
        const currentScale = meshRef.current.scale.x;
        let targetScale = hovered ? 1.05 : 1.0;
        if (isThinking) {
            targetScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
        }
        meshRef.current.scale.setScalar(
            THREE.MathUtils.lerp(currentScale, targetScale, delta * 4)
        );

        if (materialRef.current) {
            // Smoothly animate emissive intensity based on thinking state
            const targetEmissive = isThinking ? 1.2 : 0.7;
            materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                materialRef.current.emissiveIntensity || 0.7,
                targetEmissive,
                delta * 3
            );

            // Dynamic emissive color shift: cyan ↔ violet oscillation
            const t = (Math.sin(state.clock.elapsedTime * 0.6) + 1) * 0.5; // 0→1 slow sine
            _lerpColor.copy(_cyanColor).lerp(_violetColor, t);
            materialRef.current.emissive = _lerpColor;
        }

        // Atmospheric glow shell: counter-rotate for parallax depth
        if (glowShellRef.current) {
            const targetGlowIntensity = isThinking ? 1.0 : 0.4;
            glowShellRef.current.emissiveIntensity = THREE.MathUtils.lerp(
                glowShellRef.current.emissiveIntensity || 0.4,
                targetGlowIntensity,
                delta * 2
            );
        }

        // Inner core animation — always visible, brighter when thinking
        if (innerCoreRef.current) {
            const corePulse = isThinking
                ? 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.1
                : 0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
            innerCoreRef.current.scale.setScalar(corePulse);
            innerCoreRef.current.rotation.x += (isThinking ? 0.08 : 0.02) * delta * 60;
            innerCoreRef.current.rotation.y += (isThinking ? 0.06 : 0.015) * delta * 60;
        }
    });

    return (
        <group>
            {/* Main liquid-metal core */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#09090b"
                    emissive="#06b6d4"
                    emissiveIntensity={0.7}
                    distort={isThinking ? 0.6 : 0.4}
                    speed={isThinking ? 4 : 2.5}
                    roughness={0.05}
                    metalness={0.95}
                    envMapIntensity={1.5}
                />
            </mesh>

            {/* Atmospheric glow shell — violet Fresnel-like halo */}
            <mesh>
                <sphereGeometry args={[1.35, 48, 48]} />
                <MeshDistortMaterial
                    ref={glowShellRef}
                    color="#000000"
                    emissive="#8b5cf6"
                    emissiveIntensity={0.4}
                    distort={0.25}
                    speed={1.8}
                    roughness={0.3}
                    metalness={0.1}
                    transparent
                    opacity={0.12}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Inner energy core — always subtly visible */}
            <mesh ref={innerCoreRef}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial
                    color={isThinking ? '#00ffff' : '#0e7490'}
                    transparent
                    opacity={isThinking ? 1 : 0.4}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

// ─────────────────────────────────────────────────────────
// Cinematic Lighting System
// ─────────────────────────────────────────────────────────

function CinematicLights({ isThinking }: { isThinking: boolean }) {
    const keyLightRef = useRef<THREE.PointLight>(null);
    const accentLightRef = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        // Key light: intensity lerps 8 → 20 when thinking
        if (keyLightRef.current) {
            const targetIntensity = isThinking ? 20 : 8;
            keyLightRef.current.intensity = THREE.MathUtils.lerp(
                keyLightRef.current.intensity,
                targetIntensity,
                delta * 3
            );
        }

        // Accent light: orbits circularly around the subject
        if (accentLightRef.current) {
            const time = state.clock.elapsedTime;
            accentLightRef.current.position.x = Math.sin(time * 0.5) * 4;
            accentLightRef.current.position.z = Math.cos(time * 0.5) * 4;
            accentLightRef.current.position.y = 2 + Math.sin(time * 0.3) * 0.5;

            // Intensity pulses more when thinking
            const targetAccent = isThinking ? 8 : 4;
            accentLightRef.current.intensity = THREE.MathUtils.lerp(
                accentLightRef.current.intensity,
                targetAccent,
                delta * 3
            );
        }
    });

    return (
        <group>
            {/* Ambient Base */}
            <ambientLight intensity={0.3} color="#1a1a2e" />

            {/* Key Light - Main cyan illumination */}
            <pointLight
                ref={keyLightRef}
                position={[3, 3, 3]}
                intensity={8}
                color="#22d3ee"
                decay={2}
            />

            {/* Fill Light - Indigo counter-balance */}
            <pointLight
                position={[-3, 1, -2]}
                intensity={3}
                color="#6366f1"
                decay={2}
            />

            {/* Accent Light - Orbiting magenta highlight */}
            <pointLight
                ref={accentLightRef}
                position={[4, 2, 0]}
                intensity={4}
                color="#c026d3"
                decay={2}
            />

            {/* Directional - Subtle top-down fill */}
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.5}
                color="#ffffff"
            />
        </group>
    );
}

// ─────────────────────────────────────────────────────────
// useVisibility - IntersectionObserver for render gating
// ─────────────────────────────────────────────────────────

function useVisibility(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

export function NeuroAvatar({ isThinking = false }: NeuroAvatarProps) {
    const { ref: containerRef, isVisible } = useVisibility(0.1);

    return (
        /* 
         * FIX: Added overflow-hidden and rounded-full to the main container.
         * This physically forces any square artifacts into a circular shape, 
         * making them invisible against the background.
         */
        <div
            ref={containerRef}
            className="fixed bottom-0 right-0 z-[100] w-72 h-72 pointer-events-none flex items-center justify-center translate-x-12 translate-y-12 overflow-hidden rounded-full"
            aria-label="AI Assistant Avatar"
        >
            {/* 3D Canvas */}
            <Canvas
                className="pointer-events-auto cursor-pointer"
                style={{ background: 'transparent' }}
                camera={{ position: [0, 0, 5], fov: 45 }}
                frameloop={isVisible ? 'always' : 'demand'}
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    stencil: false,
                    depth: true,
                    premultipliedAlpha: false,
                    powerPreference: 'high-performance',
                }}
            >
                <CinematicLights isThinking={isThinking} />
                <Environment preset="city" />

                <Float
                    speed={isThinking ? 4 : 2}
                    rotationIntensity={isThinking ? 1.0 : 0.5}
                    floatIntensity={isThinking ? 1.5 : 1}
                >
                    <TesseractCore isThinking={isThinking} />
                </Float>

                <EffectComposer multisampling={0} disableNormalPass>
                    <SMAA />
                    <Bloom
                        luminanceThreshold={0.4}
                        luminanceSmoothing={0.9}
                        height={300}
                        intensity={isThinking ? 2.5 : 1.5}
                        mipmapBlur
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(
                            isThinking ? 0.001 : 0.0002,
                            isThinking ? 0.001 : 0.0002
                        ) as any}
                    />
                    <Vignette
                        blendFunction={BlendFunction.NORMAL}
                        offset={0.3}
                        darkness={0.6}
                    />
                </EffectComposer>
            </Canvas>

            {/* Status indicator dot */}
            <div className="absolute top-1/4 right-1/4 z-10 pointer-events-none">
                <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${isThinking
                        ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50'
                        : 'bg-zinc-600'
                        }`}
                />
            </div>

            {/* Tooltip on hover */}
            <div className="absolute -top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-zinc-900/95 backdrop-blur-sm text-zinc-100 px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-zinc-700/50 shadow-xl">
                    {isThinking ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            Pensando...
                        </span>
                    ) : (
                        'Logic AI Assistant'
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface NeuroAvatarProps {
    isThinking?: boolean;
    messages?: any[];
    showPrompt?: boolean;
    isBooped?: boolean;
    isOpen?: boolean;
}

// ─────────────────────────────────────────────────────────
// Palette & Color Cycle
// ─────────────────────────────────────────────────────────
const PALETTE = {
    cyan: new THREE.Color('#06b6d4'),
    violet: new THREE.Color('#7c3aed'),
    emerald: new THREE.Color('#059669'),
    frantic: new THREE.Color('#a78bfa'),
    white: new THREE.Color('#ffffff'),
};

/** Shared mutable color ref — written by ColorController, read by all components */
const activeColorRef = { current: new THREE.Color('#06b6d4') };

/**
 * Calculates a slow, elegant color cycle (Cyan -> Violet -> Emerald -> Cyan)
 * Uses lerpHSL to maintain saturation (prevents gray muddle).
 * 30 second full cycle (10 seconds per phase).
 */
function computeCycleColor(time: number, result: THREE.Color) {
    const cycle = (time * 0.1) % 3.0;
    if (cycle < 1) {
        const t = (1 - Math.cos(cycle * Math.PI)) / 2;
        result.copy(PALETTE.cyan).lerpHSL(PALETTE.violet, t);
    } else if (cycle < 2) {
        const t = (1 - Math.cos((cycle - 1) * Math.PI)) / 2;
        result.copy(PALETTE.violet).lerpHSL(PALETTE.emerald, t);
    } else {
        const t = (1 - Math.cos((cycle - 2) * Math.PI)) / 2;
        result.copy(PALETTE.emerald).lerpHSL(PALETTE.cyan, t);
    }
}

// ─────────────────────────────────────────────────────────
// Spring Physics Constants
// ─────────────────────────────────────────────────────────
const BODY_SPRING = { stiffness: 400, damping: 12, mass: 1.2 };
const EYE_SPRING = { stiffness: 400, damping: 14, mass: 1.0 };
const FACE_SPRING = { stiffness: 300, damping: 20, mass: 1.0 };

function springLerp(current: number, target: number, delta: number, spring = BODY_SPRING): number {
    const factor = 1 - Math.exp((-spring.stiffness / (spring.damping * spring.mass)) * delta);
    return THREE.MathUtils.lerp(current, target, factor);
}

// ─────────────────────────────────────────────────────────
// ColorController — Computes active color + syncs key light
// ─────────────────────────────────────────────────────────

function ColorController({ isThinking, isBooped, keyLightRef }: {
    isThinking: boolean;
    isBooped: boolean;
    keyLightRef: React.RefObject<THREE.PointLight | null>;
}) {
    const targetColor = useRef(new THREE.Color('#06b6d4'));

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        if (isBooped) {
            targetColor.current.copy(PALETTE.white);
        } else if (isThinking) {
            targetColor.current.copy(PALETTE.frantic);
        } else {
            computeCycleColor(time, targetColor.current);
        }

        // Smoothly transition the shared color
        activeColorRef.current.lerp(targetColor.current, delta * 4);

        // Sync key light color
        if (keyLightRef.current) {
            keyLightRef.current.color.lerp(activeColorRef.current, delta * 3);
        }
    });

    return null;
}

// ─────────────────────────────────────────────────────────
// QuantumEye — Emissive orb with spring-driven expressions
// ─────────────────────────────────────────────────────────

function QuantumEye({ positionX, isThinking, showPrompt, isBooped, isRight }: {
    positionX: number;
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    isRight?: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const winkTimeRef = useRef(0);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        let targetSX = 1, targetSY = 1, targetSZ = 1;

        if (isBooped) {
            targetSX = 1.4; targetSY = 1.4; targetSZ = 1.4;
            winkTimeRef.current = 0; // Reset wink if interrupted
        } else if (showPrompt) {
            // Wink sequence for right eye
            if (isRight) {
                winkTimeRef.current += delta;
                const t = winkTimeRef.current;

                // Double wink timing (fast)
                if (t < 0.1) targetSY = 0.1;       // Close 1
                else if (t < 0.2) targetSY = 1;    // Open 1
                else if (t < 0.3) targetSY = 0.1;  // Close 2
                else targetSY = 1;                 // Settle Open
            } else {
                targetSX = 1; targetSY = 1; targetSZ = 1; // Left eye stays open
            }
        } else {
            winkTimeRef.current = 0; // Reset when prompt hides
            if (isThinking) {
                // Gentle pulse — curious wide eyes
                targetSX = 1.05; targetSY = 1.1; targetSZ = 1;
            } else {
                targetSX = 1.1; targetSY = 0.75; targetSZ = 1; // Kawaii idle
            }
        }

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta, EYE_SPRING);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta, EYE_SPRING);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta, EYE_SPRING);

        // Sync emissive color from shared ref
        if (matRef.current) {
            matRef.current.emissive.lerp(activeColorRef.current, delta * 6);
        }
    });

    return (
        <mesh ref={meshRef} position={[positionX, 0, 0]} renderOrder={999}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial
                ref={matRef}
                color="#fff"
                emissive="#06b6d4"
                emissiveIntensity={3}
                toneMapped={false}
                depthTest={false}
            />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────
// Eyebrow — Capsule geometry with spring-driven rotation/position
// ─────────────────────────────────────────────────────────

function Eyebrow({ side, isThinking, showPrompt, isBooped }: {
    side: 'left' | 'right';
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const isLeft = side === 'left';
    const baseX = isLeft ? -0.20 : 0.20;
    const baseRotZ = Math.PI / 2;

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        let targetY = 0.20;
        let expressionRot = 0;

        if (isBooped) {
            targetY = 0.26;
            expressionRot = isLeft ? 0.35 : -0.35;
        } else if (showPrompt) {
            // Rhythmic wiggle: slightly raised matching the wink vibe
            targetY = 0.15 + Math.sin(time * 6) * 0.03;
            expressionRot = isLeft ? 0.1 : -0.1;
        } else if (isThinking) {
            // Curious: slightly raised, neutral tilt
            targetY = 0.22;
            expressionRot = 0;
        }

        meshRef.current.position.y = springLerp(meshRef.current.position.y, targetY, delta, FACE_SPRING);
        meshRef.current.rotation.z = springLerp(meshRef.current.rotation.z, baseRotZ + expressionRot, delta, FACE_SPRING);

        // Sync emissive color
        if (matRef.current) {
            matRef.current.emissive.lerp(activeColorRef.current, delta * 6);
        }
    });

    return (
        <mesh ref={meshRef} position={[baseX, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} renderOrder={999}>
            <capsuleGeometry args={[0.018, 0.1, 4, 8]} />
            <meshStandardMaterial
                ref={matRef}
                color="#fff"
                emissive="#06b6d4"
                emissiveIntensity={2.5}
                toneMapped={false}
                depthTest={false}
            />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────
// Mouth — Torus arc with spring-driven scale expressions
// ─────────────────────────────────────────────────────────

function Mouth({ isThinking, showPrompt, isBooped }: {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        let targetSX = 0.7, targetSY = 0.7, targetSZ = 0.7;

        if (isBooped) {
            targetSX = 1.4; targetSY = 1.4; targetSZ = 1.4;
        } else if (showPrompt) {
            targetSX = 0.5; targetSY = 0.5; targetSZ = 0.5;
        } else if (isThinking) {
            targetSX = 0.8; targetSY = 0.15; targetSZ = 0.8;
        }

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta, FACE_SPRING);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta, FACE_SPRING);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta, FACE_SPRING);

        // Sync emissive color
        if (matRef.current) {
            matRef.current.emissive.lerp(activeColorRef.current, delta * 6);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]} scale={[0.7, 0.7, 0.7]} renderOrder={999}>
            <torusGeometry args={[0.08, 0.018, 16, 32, Math.PI]} />
            <meshStandardMaterial
                ref={matRef}
                color="#fff"
                emissive="#06b6d4"
                emissiveIntensity={2.5}
                toneMapped={false}
                depthTest={false}
            />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────
// JellyBody — Animated distorted sphere with spring physics
// ─────────────────────────────────────────────────────────

interface JellyBodyProps {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    isOpen: boolean;
}

function JellyBody({ isThinking, showPrompt, isBooped, isOpen }: JellyBodyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const faceGroupRef = useRef<THREE.Group>(null);
    const bodyMatRef = useRef<any>(null);
    const boopTimeRef = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;

        // ── Sync body material emissive with color cycle ──
        if (bodyMatRef.current && bodyMatRef.current.emissive) {
            bodyMatRef.current.emissive.lerp(activeColorRef.current, delta * 3);
        }

        // ── Elite Boop: Multi-stage keyframe bounce ──
        if (isBooped) {
            boopTimeRef.current += delta;
            const t = boopTimeRef.current;

            let targetSX: number, targetSY: number, targetSZ: number, targetPY: number;

            if (t < 0.08) {
                targetSX = 1.5; targetSY = 0.35; targetSZ = 1.5; targetPY = -0.35;
                meshRef.current.scale.set(targetSX, targetSY, targetSZ);
                meshRef.current.position.y = targetPY;
                return;
            } else if (t < 0.25) {
                targetSX = 0.7; targetSY = 1.45; targetSZ = 0.7; targetPY = 0.15;
            } else if (t < 0.4) {
                targetSX = 1.15; targetSY = 0.85; targetSZ = 1.15; targetPY = -0.05;
            } else {
                targetSX = 1; targetSY = 1; targetSZ = 1; targetPY = 0;
            }

            const boopLerp = delta * 18;
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetSX, boopLerp);
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetSY, boopLerp);
            meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetSZ, boopLerp);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPY, boopLerp);
            return;
        } else {
            boopTimeRef.current = 0;
        }

        // ── Normal state scale targets ──
        let targetSX = 1, targetSY = 1, targetSZ = 1;
        let targetPY = 0;

        if (showPrompt) {
            targetSX = 1.1; targetSY = 0.85; targetSZ = 1.1;
            targetPY = -0.1;
        } else if (isThinking) {
            // Gentle breathing pulse instead of stretch
            targetSX = 1; targetSY = 1.03; targetSZ = 1;
            targetPY = 0.05;
        }

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta);
        meshRef.current.position.y = springLerp(meshRef.current.position.y, targetPY, delta);

        // ── Face Group: Chat awareness ──
        if (faceGroupRef.current) {
            let gazeTargetY = 0;
            let gazeTargetX = 0;
            let gazeOffsetX = 0;

            if (showPrompt) {
                // Look at tooltip (up and to the left from avatar's perspective)
                gazeTargetY = -0.5;
                gazeTargetX = 0.3;
                gazeOffsetX = -0.05;
            } else if (isOpen) {
                // Chat open: gaze toward the chat window (left/up)
                gazeTargetY = -0.4;
                gazeTargetX = 0.1;
                gazeOffsetX = -0.08;
            }

            faceGroupRef.current.rotation.y = springLerp(faceGroupRef.current.rotation.y, gazeTargetY, delta, FACE_SPRING);
            faceGroupRef.current.rotation.x = springLerp(faceGroupRef.current.rotation.x, gazeTargetX, delta, FACE_SPRING);

            // Smooth position — no jitter, just clean tracking
            faceGroupRef.current.position.x = springLerp(faceGroupRef.current.position.x, gazeOffsetX, delta, FACE_SPRING);
            faceGroupRef.current.position.y = springLerp(faceGroupRef.current.position.y, 0.12, delta, FACE_SPRING);
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.85, 64, 64]} />
            <MeshDistortMaterial
                ref={bodyMatRef}
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.4}
                envMapIntensity={2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                metalness={0.2}
                roughness={0.1}
                distort={isThinking ? 0.35 : showPrompt ? 0.15 : 0.3}
                speed={isThinking ? 2.5 : showPrompt ? 1 : 2}
            />

            {/* ── Face Group — hereda squash & stretch del cuerpo ── */}
            <group ref={faceGroupRef} position={[0, 0.12, 1.0]}>
                <QuantumEye positionX={-0.22} isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <QuantumEye positionX={0.22} isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} isRight />
                <Eyebrow side="left" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <Eyebrow side="right" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <Mouth isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
            </group>
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────
// Exported NeuroAvatar
// ─────────────────────────────────────────────────────────

export function NeuroAvatar({ isThinking = false, messages = [], showPrompt = false, isBooped = false, isOpen = false }: NeuroAvatarProps) {
    const keyLightRef = useRef<THREE.PointLight>(null);

    return (
        <div
            className="fixed bottom-0 right-0 z-[100] w-56 h-56 pointer-events-none flex items-center justify-center translate-x-6 translate-y-6"
            aria-label="AI Assistant Avatar"
        >
            <Canvas
                className="pointer-events-auto cursor-pointer"
                style={{ background: 'transparent' }}
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ alpha: true, powerPreference: 'high-performance' }}
            >
                {/* Color Cycle Controller */}
                <ColorController isThinking={isThinking} isBooped={isBooped} keyLightRef={keyLightRef} />

                {/* Iluminación — key light synced with color cycle */}
                <ambientLight intensity={0.5} />
                <pointLight ref={keyLightRef} position={[2, 2, 2]} intensity={5} color="#06b6d4" decay={2} />
                <pointLight position={[-2, -1, -2]} intensity={3} color="#8b5cf6" decay={2} />

                {/* Entorno para reflejos del cristal */}
                <Environment preset="city" />

                {/* Cuerpo gelatinoso con cara completa */}
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <JellyBody isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} isOpen={isOpen} />
                </Float>
            </Canvas>
        </div>
    );
}

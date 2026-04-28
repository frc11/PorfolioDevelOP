'use client';

import { type ComponentRef, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import type { Message } from 'ai';
import * as THREE from 'three';

export type AvatarPhase = 'dormant' | 'initializing' | 'stabilizing' | 'active' | 'sleeping';

interface NeuroAvatarProps {
    isThinking?: boolean;
    showPrompt?: boolean;
    isBooped?: boolean;
    isHovered?: boolean;
    isOpen?: boolean;
    phase?: AvatarPhase;
    scrollSection?: string;
    messagePulse?: number;
    lastMessageRole?: Message['role'];
    hoverPulse?: number;
    contextColor?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'cycle';
    embedded?: boolean;
}

const mouseRef = { current: { x: 0, y: 0 } };

function useMouseTracking() {
    useEffect(() => {
        if ('ontouchstart' in window) return;

        const handleMove = (e: MouseEvent) => {
            // Normalizar a rango -1 a 1 relativo al centro de la pantalla
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = (e.clientY / window.innerHeight) * 2 - 1;
            mouseRef.current = { x, y };
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);
}

const PALETTE = {
    cyan: new THREE.Color('#06b6d4'),
    violet: new THREE.Color('#7c3aed'),
    emerald: new THREE.Color('#059669'),
    amber: new THREE.Color('#f59e0b'),
    frantic: new THREE.Color('#a78bfa'),
    white: new THREE.Color('#ffffff'),
};

const activeColorRef = { current: new THREE.Color('#06b6d4') };

function computeCycleColor(time: number, result: THREE.Color) {
    const cycle = (time * 0.1) % 3.0;

    if (cycle < 1) {
        const t = (1 - Math.cos(cycle * Math.PI)) / 2;
        result.copy(PALETTE.cyan).lerpHSL(PALETTE.violet, t);
        return;
    }

    if (cycle < 2) {
        const t = (1 - Math.cos((cycle - 1) * Math.PI)) / 2;
        result.copy(PALETTE.violet).lerpHSL(PALETTE.emerald, t);
        return;
    }

    const t = (1 - Math.cos((cycle - 2) * Math.PI)) / 2;
    result.copy(PALETTE.emerald).lerpHSL(PALETTE.cyan, t);
}

const BODY_SPRING = { stiffness: 400, damping: 12, mass: 1.2 };
const EYE_SPRING = { stiffness: 400, damping: 14, mass: 1.0 };
const FACE_SPRING = { stiffness: 300, damping: 20, mass: 1.0 };

function springLerp(current: number, target: number, delta: number, spring = BODY_SPRING): number {
    const factor = 1 - Math.exp((-spring.stiffness / (spring.damping * spring.mass)) * delta);
    return THREE.MathUtils.lerp(current, target, factor);
}

function ColorController({
    isThinking,
    isBooped,
    isHovered,
    phase,
    contextColor,
    keyLightRef,
}: {
    isThinking: boolean;
    isBooped: boolean;
    isHovered: boolean;
    phase: AvatarPhase;
    contextColor: 'cyan' | 'violet' | 'emerald' | 'amber' | 'cycle';
    keyLightRef: React.RefObject<THREE.PointLight | null>;
}) {
    const targetColor = useRef(new THREE.Color('#06b6d4'));
    const transitionRef = useRef(1); // 0 = transition fresh, 1 = fully settled
    const prevContextColorRef = useRef(contextColor);

    useEffect(() => {
        if (prevContextColorRef.current !== contextColor) {
            transitionRef.current = 0;
            prevContextColorRef.current = contextColor;
        }
    }, [contextColor]);

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        // Avanzar transición de contexto
        transitionRef.current = Math.min(1, transitionRef.current + delta * 0.45);

        if (phase === 'dormant') {
            targetColor.current.copy(PALETTE.white).multiplyScalar(0.2);
        } else if (phase === 'sleeping') {
            // Color tenue durante sleep
            if (contextColor === 'cycle') {
                computeCycleColor(time, targetColor.current);
            } else {
                targetColor.current.copy(PALETTE[contextColor]);
            }
            targetColor.current.multiplyScalar(0.45);
        } else if (isBooped) {
            targetColor.current.copy(PALETTE.white);
        } else if (isThinking) {
            targetColor.current.copy(PALETTE.frantic);
        } else if (contextColor !== 'cycle') {
            // CONTEXTO ACTIVO: tomar el color de la sección
            const ctx = PALETTE[contextColor];

            // Subtle breathing variation around the context color
            // Cada color "respira" alrededor de su tono base sin saturar
            const breathe = (Math.sin(time * 0.6) + 1) / 2;  // 0..1
            targetColor.current.copy(ctx);

            // Mezcla sutil con white para que respire
            targetColor.current.lerp(PALETTE.white, breathe * 0.12);

            if (isHovered) {
                targetColor.current.lerp(PALETTE.white, 0.15);
            }
        } else {
            // CYCLING DEFAULT (landing y otras)
            computeCycleColor(time, targetColor.current);
            if (isHovered) {
                targetColor.current.lerp(PALETTE.white, 0.18);
            }
        }

        // Lerp progresivo del color actual al target
        // Más lento durante una transición de contexto fresh
        const lerpFactor = transitionRef.current < 1 ? delta * 1.5 : delta * 4;
        activeColorRef.current.lerp(targetColor.current, lerpFactor);

        if (keyLightRef.current) {
            keyLightRef.current.color.lerp(activeColorRef.current, delta * 3);

            let targetIntensity = 4;
            if (phase === 'sleeping') {
                targetIntensity = 1.5;
            } else if (phase === 'active') {
                if (isThinking) targetIntensity = 5.4;
                else if (isHovered) targetIntensity = 5.1;
                else targetIntensity = 4.6;
            }

            keyLightRef.current.intensity = THREE.MathUtils.lerp(
                keyLightRef.current.intensity,
                targetIntensity,
                delta * 6,
            );
        }
    });

    return null;
}

function QuantumEye({
    positionX,
    isThinking,
    showPrompt,
    isBooped,
    hoverPulse,
    isRight,
    isSleeping,
}: {
    positionX: number;
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    hoverPulse: number;
    isRight?: boolean;
    isSleeping: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const winkTimeRef = useRef(0);
    const hoverTimeRef = useRef(1);

    useEffect(() => {
        if (hoverPulse > 0) {
            hoverTimeRef.current = 0;
        }
    }, [hoverPulse]);

    useFrame((_, delta) => {
        if (!meshRef.current) {
            return;
        }

        let targetSX = 1;
        let targetSY = 1;
        let targetSZ = 1;

        const idleBlinkCycle = ((_.clock.elapsedTime + (isRight ? 0.04 : 0)) % 4.8) / 4.8;
        const idleBlink = !isBooped && !showPrompt && !isThinking && idleBlinkCycle > 0.94
            ? Math.sin(((idleBlinkCycle - 0.94) / 0.06) * Math.PI)
            : 0;
        hoverTimeRef.current = Math.min(1, hoverTimeRef.current + delta * 1.9);
        const hoverWave = Math.sin(hoverTimeRef.current * Math.PI) * (1 - hoverTimeRef.current);

        if (isSleeping) {
            targetSX = 1.0;
            targetSY = 0.04;
            targetSZ = 1.0;
            winkTimeRef.current = 0;
        } else if (isBooped) {
            targetSX = 1.4;
            targetSY = 1.4;
            targetSZ = 1.4;
            winkTimeRef.current = 0;
        } else if (showPrompt) {
            if (isRight) {
                winkTimeRef.current += delta;
                const t = winkTimeRef.current;

                if (t < 0.1) {
                    targetSY = 0.1;
                } else if (t < 0.2) {
                    targetSY = 1;
                } else if (t < 0.3) {
                    targetSY = 0.1;
                } else {
                    targetSY = 1;
                }
            }
        } else {
            winkTimeRef.current = 0;

            if (isThinking) {
                targetSX = 1.05;
                targetSY = 1.15;
            } else {
                targetSX = 1.1;
                targetSY = 0.75;
            }
        }

        if (idleBlink > 0) {
            targetSY = THREE.MathUtils.lerp(targetSY, 0.08, idleBlink);
        }

        targetSX += hoverWave * 0.22;
        targetSY += hoverWave * 0.36;

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta, EYE_SPRING);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta, EYE_SPRING);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta, EYE_SPRING);

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

function Eyebrow({
    side,
    isThinking,
    showPrompt,
    isBooped,
    hoverPulse,
    isSleeping,
}: {
    side: 'left' | 'right';
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    hoverPulse: number;
    isSleeping: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const isLeft = side === 'left';
    const baseX = isLeft ? -0.2 : 0.2;
    const baseRotZ = Math.PI / 2;
    const hoverTimeRef = useRef(1);

    useEffect(() => {
        if (hoverPulse > 0) {
            hoverTimeRef.current = 0;
        }
    }, [hoverPulse]);

    useFrame((state, delta) => {
        if (!meshRef.current) {
            return;
        }

        const time = state.clock.elapsedTime;
        let targetY = 0.2;
        let expressionRot = 0;
        hoverTimeRef.current = Math.min(1, hoverTimeRef.current + delta * 1.7);
        const hoverWave = Math.sin(hoverTimeRef.current * Math.PI) * (1 - hoverTimeRef.current);

        if (isSleeping) {
            targetY = 0.12;
            expressionRot = 0;
        } else if (isBooped) {
            targetY = 0.26;
            expressionRot = isLeft ? 0.35 : -0.35;
        } else if (showPrompt) {
            targetY = 0.15 + Math.sin(time * 6) * 0.03;
            expressionRot = isLeft ? 0.1 : -0.1;
        } else if (isThinking) {
            // Ceja izquierda sube ligeramente (curiosidad/concentración humana)
            if (isLeft) {
                targetY = 0.27;
                expressionRot = 0.08;
            } else {
                targetY = 0.18;
                expressionRot = -0.02;
            }
        }

        targetY += hoverWave * 0.12;
        expressionRot += (isLeft ? 1 : -1) * hoverWave * 0.18;

        meshRef.current.position.y = springLerp(meshRef.current.position.y, targetY, delta, FACE_SPRING);
        meshRef.current.rotation.z = springLerp(
            meshRef.current.rotation.z,
            baseRotZ + expressionRot,
            delta,
            FACE_SPRING,
        );

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

function Mouth({
    isThinking,
    showPrompt,
    isBooped,
    messagePulse,
    lastMessageRole,
    hoverPulse,
    isSleeping,
}: {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    messagePulse: number;
    lastMessageRole: Message['role'];
    hoverPulse: number;
    isSleeping: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const reactionRef = useRef({ send: 0, receive: 0 });
    const hoverTimeRef = useRef(1);

    useEffect(() => {
        if (messagePulse === 0) {
            return;
        }

        if (lastMessageRole === 'user') {
            reactionRef.current.send = 1;
        } else if (lastMessageRole === 'assistant') {
            reactionRef.current.receive = 1;
        }
    }, [lastMessageRole, messagePulse]);

    useEffect(() => {
        if (hoverPulse > 0) {
            hoverTimeRef.current = 0;
        }
    }, [hoverPulse]);

    useFrame((_, delta) => {
        if (!meshRef.current) {
            return;
        }

        reactionRef.current.send = Math.max(0, reactionRef.current.send - delta * 1.9);
        reactionRef.current.receive = Math.max(0, reactionRef.current.receive - delta * 1.55);
        hoverTimeRef.current = Math.min(1, hoverTimeRef.current + delta * 1.6);
        const hoverWave = Math.sin(hoverTimeRef.current * Math.PI) * (1 - hoverTimeRef.current);

        let targetSX = 0.7;
        let targetSY = 0.7;
        let targetSZ = 0.7;

        if (isSleeping) {
            targetSX = 0.55;
            targetSY = 0.55;
            targetSZ = 0.55;
        } else if (isBooped) {
            targetSX = 1.4;
            targetSY = 1.4;
            targetSZ = 1.4;
        } else if (showPrompt) {
            targetSX = 0.5;
            targetSY = 0.5;
            targetSZ = 0.5;
        } else if (isThinking) {
            targetSX = 0.65;   // boca pequeña
            targetSY = 0.18;   // línea sutil
            targetSZ = 0.65;
        } else if (reactionRef.current.send > 0.01 || reactionRef.current.receive > 0.01) {
            targetSX = 0.92 + reactionRef.current.receive * 0.2;
            targetSY = 0.84 + reactionRef.current.send * 0.28;
            targetSZ = 0.92;
        }

        targetSX += hoverWave * 0.1;
        targetSY += hoverWave * 0.24;
        targetSZ += hoverWave * 0.08;

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta, FACE_SPRING);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta, FACE_SPRING);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta, FACE_SPRING);

        if (matRef.current) {
            matRef.current.emissive.lerp(activeColorRef.current, delta * 6);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={[0, -0.15, 0]}
            rotation={[Math.PI, 0, 0]}
            scale={[0.7, 0.7, 0.7]}
            renderOrder={999}
        >
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

function OrbitalParticles({
    isSleeping,
    isThinking,
    isBooped,
}: {
    isSleeping: boolean;
    isThinking: boolean;
    isBooped: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const matRef = useRef<THREE.PointsMaterial>(null);
    const bufferAttrRef = useRef<THREE.BufferAttribute>(null);
    const frameRef = useRef(0);

    // 24 partículas en órbitas elípticas con inclinaciones distintas
    const { positions, speeds, radii, inclinations } = useMemo(() => {
        const count = 24;
        const positions = new Float32Array(count * 3);
        const speeds: number[] = [];
        const radii: number[] = [];
        const inclinations: number[] = [];

        for (let i = 0; i < count; i++) {
            // Ángulo inicial distribuido uniformemente
            const angle = (i / count) * Math.PI * 2;
            // Radio de órbita: entre 1.05 y 1.35 (fuera del blob)
            const r = 1.05 + Math.random() * 0.3;
            // Inclinación del plano de órbita (da sensación 3D)
            const inc = (Math.random() - 0.5) * Math.PI * 0.8;

            positions[i * 3] = Math.cos(angle) * r;
            positions[i * 3 + 1] = Math.sin(angle) * r * Math.cos(inc);
            positions[i * 3 + 2] = Math.sin(angle) * r * Math.sin(inc);

            // Velocidad angular individual (algunas más lentas, otras más rápidas)
            speeds.push(0.18 + Math.random() * 0.22);
            radii.push(r);
            inclinations.push(inc);
        }

        return { positions, speeds, radii, inclinations };
    }, []);

    const positionsRef = useRef(positions);

    useFrame((state, delta) => {
        if (!groupRef.current || !matRef.current) return;
        frameRef.current++;

        const time = state.clock.elapsedTime;

        // Velocidad global de órbita según estado
        const globalSpeed = isSleeping
            ? 0.12
            : isThinking
                ? 0.55
                : isBooped
                    ? 2.2
                    : 0.28;

        // Opacidad según estado
        const targetOpacity = isSleeping ? 0.08 : isThinking ? 0.35 : 0.22;
        matRef.current.opacity = THREE.MathUtils.lerp(
            matRef.current.opacity,
            targetOpacity,
            delta * 2,
        );

        // Tamaño de partícula según estado
        const targetSize = isSleeping ? 0.008 : isBooped ? 0.025 : 0.014;
        matRef.current.size = THREE.MathUtils.lerp(
            matRef.current.size,
            targetSize,
            delta * 3,
        );

        // Actualizar posición de cada partícula
        const pos = positionsRef.current;
        for (let i = 0; i < 24; i++) {
            const speed = speeds[i] * globalSpeed;
            const angle = time * speed + (i / 24) * Math.PI * 2;
            const r = radii[i];
            const inc = inclinations[i];

            // Turbulencia suave: el radio oscila levemente
            const turbulence = Math.sin(time * 0.4 + i * 0.7) * 0.06;
            const currentR = r + turbulence;

            pos[i * 3] = Math.cos(angle) * currentR;
            pos[i * 3 + 1] = Math.sin(angle) * currentR * Math.cos(inc);
            pos[i * 3 + 2] = Math.sin(angle) * currentR * Math.sin(inc);
        }

        if (bufferAttrRef.current) {
            bufferAttrRef.current.needsUpdate = true;
        }
    });

    return (
        <group ref={groupRef}>
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        ref={bufferAttrRef as any}
                        attach="attributes-position"
                        args={[positionsRef.current, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    ref={matRef}
                    size={0.014}
                    transparent
                    opacity={0.22}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    color={activeColorRef.current}
                    vertexColors={false}
                    sizeAttenuation
                />
            </points>
        </group>
    );
}

interface JellyBodyProps {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    isHovered: boolean;
    isOpen: boolean;
    messagePulse: number;
    lastMessageRole: Message['role'];
    hoverPulse: number;
    isSleeping: boolean;
}

type DistortMaterialHandle = ComponentRef<typeof MeshDistortMaterial>;

function JellyBody({
    isThinking,
    showPrompt,
    isBooped,
    isHovered,
    isOpen,
    messagePulse,
    lastMessageRole,
    hoverPulse,
    isSleeping,
}: JellyBodyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const faceGroupRef = useRef<THREE.Group>(null);
    const bodyMatRef = useRef<DistortMaterialHandle | null>(null);
    const boopTimeRef = useRef(0);
    const messageReactionRef = useRef({ send: 0, receive: 0 });
    const hoverTimeRef = useRef(1);

    useEffect(() => {
        if (messagePulse === 0) {
            return;
        }

        if (lastMessageRole === 'user') {
            messageReactionRef.current.send = 1;
        } else if (lastMessageRole === 'assistant') {
            messageReactionRef.current.receive = 1;
        }
    }, [lastMessageRole, messagePulse]);

    useEffect(() => {
        if (hoverPulse > 0) {
            hoverTimeRef.current = 0;
        }
    }, [hoverPulse]);

    useFrame((state, delta) => {
        if (!meshRef.current) {
            return;
        }

        messageReactionRef.current.send = Math.max(0, messageReactionRef.current.send - delta * 1.65);
        messageReactionRef.current.receive = Math.max(0, messageReactionRef.current.receive - delta * 1.35);
        const sendWave = Math.sin((1 - messageReactionRef.current.send) * Math.PI) * messageReactionRef.current.send;
        const receiveWave = Math.sin((1 - messageReactionRef.current.receive) * Math.PI * 1.25) * messageReactionRef.current.receive;
        hoverTimeRef.current = Math.min(1, hoverTimeRef.current + delta * 1.45);
        const hoverWave = Math.sin(hoverTimeRef.current * Math.PI) * (1 - hoverTimeRef.current);

        if (bodyMatRef.current?.emissive) {
            bodyMatRef.current.emissive.lerp(activeColorRef.current, delta * 3);
        }

        if (isBooped) {
            boopTimeRef.current += delta;
            const t = boopTimeRef.current;

            let targetSX: number;
            let targetSY: number;
            let targetSZ: number;
            let targetPY: number;

            if (t < 0.08) {
                targetSX = 1.5;
                targetSY = 0.35;
                targetSZ = 1.5;
                targetPY = -0.35;
                meshRef.current.scale.set(targetSX, targetSY, targetSZ);
                meshRef.current.position.y = targetPY;
                return;
            }

            if (t < 0.25) {
                targetSX = 0.7;
                targetSY = 1.45;
                targetSZ = 0.7;
                targetPY = 0.15;
            } else if (t < 0.4) {
                targetSX = 1.15;
                targetSY = 0.85;
                targetSZ = 1.15;
                targetPY = -0.05;
            } else {
                targetSX = 1;
                targetSY = 1;
                targetSZ = 1;
                targetPY = 0;
            }

            const boopLerp = delta * 18;
            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetSX, boopLerp);
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetSY, boopLerp);
            meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetSZ, boopLerp);
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetPY, boopLerp);
            return;
        }

        boopTimeRef.current = 0;

        let targetSX = 1;
        let targetSY = 1;
        let targetSZ = 1;
        let targetPY = 0;
        const time = state.clock.elapsedTime;
        const breathSpeed = isSleeping ? 0.55 : 1.15;
        const breathAmp = isSleeping ? 0.06 : 0.035;
        const idleBreath = Math.sin(time * breathSpeed) * breathAmp + Math.sin(time * 0.42 + 1.4) * 0.018;
        const idleSway = Math.sin(time * 0.7) * 0.055;
        const idleNod = Math.cos(time * 0.58) * 0.025;

        if (showPrompt) {
            targetSX = 1.1;
            targetSY = 0.85;
            targetSZ = 1.1;
            targetPY = -0.1;
        } else if (isThinking) {
            targetSX = 1.05;
            targetSY = 1.12;
            targetSZ = 1.02;
            targetPY = 0.05;
        }

        targetSX += idleBreath * 0.85 + receiveWave * 0.14 + hoverWave * 0.12;
        targetSY += idleBreath * 1.1 + sendWave * 0.16 + hoverWave * 0.1;
        targetSZ += idleBreath * 0.65 + receiveWave * 0.1 + hoverWave * 0.12;
        targetPY += Math.sin(time * 1.35) * 0.03 + sendWave * 0.12 + receiveWave * 0.08;

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta);
        meshRef.current.position.y = springLerp(meshRef.current.position.y, targetPY, delta);

        if (faceGroupRef.current) {
            let gazeTargetY = 0;
            let gazeTargetX = 0;
            let gazeOffsetX = 0;

            if (isSleeping) {
                gazeTargetY = 0;
                gazeTargetX = -0.15;
                gazeOffsetX = 0;
            } else if (showPrompt) {
                gazeTargetY = -0.5;
                gazeTargetX = 0.3;
                gazeOffsetX = -0.05;
            } else if (isThinking) {
                // GESTO HUMANO DE PENSAR: mirada arriba-izquierda con micro-drift
                gazeTargetY = 0.5 + Math.sin(time * 0.8) * 0.08;    // izquierda con drift
                gazeTargetX = -0.18 + Math.cos(time * 0.7) * 0.05;  // arriba con drift
                gazeOffsetX = 0.04;
            } else if (isOpen) {
                gazeTargetY = -0.4;
                gazeTargetX = 0.1;
                gazeOffsetX = -0.08;
            } else {
                // MOUSE TRACKING: el avatar mira al cursor
                const mx = mouseRef.current.x;
                const my = mouseRef.current.y;

                // Limitamos el rango de rotación para que no se vea raro
                const MAX_YAW = 0.55;   // rotación Y izquierda/derecha
                const MAX_PITCH = 0.32; // rotación X arriba/abajo

                gazeTargetY = THREE.MathUtils.clamp(-mx * MAX_YAW, -MAX_YAW, MAX_YAW);
                gazeTargetX = THREE.MathUtils.clamp(my * MAX_PITCH, -MAX_PITCH, MAX_PITCH);

                // Micro-offset de la cara en X para dar sensación de peso
                gazeOffsetX = -mx * 0.04;

                // Agregamos un micro-drift sinusoidal muy sutil para que no se
                // vea mecánico cuando el mouse está quieto
                gazeTargetY += Math.sin(time * 0.4) * 0.04;
                gazeTargetX += Math.cos(time * 0.32) * 0.02;

                // Reacción de mensajes recibidos/enviados suma al movimiento
                gazeTargetY += sendWave * 0.06;
                gazeTargetX += receiveWave * 0.04;
            }

            gazeTargetY += hoverWave * 0.12 * (isHovered ? 1 : 0.6);
            gazeTargetX += hoverWave * 0.06;

            faceGroupRef.current.rotation.y = springLerp(
                faceGroupRef.current.rotation.y,
                gazeTargetY,
                delta,
                FACE_SPRING,
            );
            faceGroupRef.current.rotation.x = springLerp(
                faceGroupRef.current.rotation.x,
                gazeTargetX,
                delta,
                FACE_SPRING,
            );
            faceGroupRef.current.position.x = springLerp(
                faceGroupRef.current.position.x,
                gazeOffsetX,
                delta,
                FACE_SPRING,
            );
            faceGroupRef.current.position.y = springLerp(faceGroupRef.current.position.y, 0.12, delta, FACE_SPRING);
        }

        const thinkingTilt = isThinking ? -0.12 : 0;  // 5-7° hacia un lado
        meshRef.current.rotation.z = THREE.MathUtils.lerp(
            meshRef.current.rotation.z,
            thinkingTilt + (isThinking ? Math.sin(time * 1.2) * 0.025 : idleSway) + receiveWave * 0.08 + hoverWave * 0.05,
            delta * 3,
        );
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
            meshRef.current.rotation.x,
            (isThinking ? 0.06 + Math.cos(time * 2.1) * 0.03 : idleNod) + sendWave * 0.06 + hoverWave * 0.08,
            delta * 3,
        );
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
            meshRef.current.rotation.y,
            Math.sin(time * 0.5) * 0.08 - sendWave * 0.05 + hoverWave * 0.04,
            delta * 2.5,
        );
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.85, 64, 64]} />
            <MeshDistortMaterial
                ref={bodyMatRef}
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={0.35}
                envMapIntensity={2.8}
                clearcoat={1}
                clearcoatRoughness={0.05}
                metalness={0.05}
                roughness={0.08}
                distort={isSleeping ? 0.08 : isThinking ? 0.22 : showPrompt ? 0.15 : 0.3}
                speed={isSleeping ? 0.4 : isThinking ? 1.4 : showPrompt ? 1 : 2}
            />

            <group ref={faceGroupRef} position={[0, 0.12, 1]}>
                <QuantumEye positionX={-0.22} isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} hoverPulse={hoverPulse} isSleeping={isSleeping} />
                <QuantumEye
                    positionX={0.22}
                    isThinking={isThinking}
                    showPrompt={showPrompt}
                    isBooped={isBooped}
                    hoverPulse={hoverPulse}
                    isRight
                    isSleeping={isSleeping}
                />
                <Eyebrow side="left" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} hoverPulse={hoverPulse} isSleeping={isSleeping} />
                <Eyebrow side="right" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} hoverPulse={hoverPulse} isSleeping={isSleeping} />
                <Mouth
                    isThinking={isThinking}
                    showPrompt={showPrompt}
                    isBooped={isBooped}
                    messagePulse={messagePulse}
                    lastMessageRole={lastMessageRole}
                    hoverPulse={hoverPulse}
                    isSleeping={isSleeping}
                />
            </group>
        </mesh>
    );
}

export function NeuroAvatar({
    isThinking = false,
    showPrompt = false,
    isBooped = false,
    isHovered = false,
    isOpen = false,
    phase = 'active',
    messagePulse = 0,
    lastMessageRole = 'assistant',
    hoverPulse = 0,
    contextColor = 'cycle',
    embedded = false,
}: NeuroAvatarProps) {
    const keyLightRef = useRef<THREE.PointLight>(null);
    const isVisible = phase !== 'dormant';
    const isSleeping = phase === 'sleeping';
    const wrapperScale = phase === 'initializing' ? 0.78 : phase === 'stabilizing' ? 0.9 : 1;

    useMouseTracking();

    const wrapperClasses = embedded
        ? 'flex h-28 w-28 items-center justify-center pointer-events-none transition-[opacity,transform] duration-700 ease-out md:h-56 md:w-56'
        : 'fixed bottom-2 right-2 z-[96] flex h-28 w-28 items-center justify-center pointer-events-none transition-[opacity,transform] duration-700 ease-out md:bottom-3 md:right-3 md:h-56 md:w-56';

    return (
        <div
            className={wrapperClasses}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: `scale(${wrapperScale})`,
                transformOrigin: 'bottom right',
                position: embedded ? 'relative' : undefined,
            }}
            aria-label="AI Assistant Avatar"
        >
            <Canvas
                className={isVisible ? 'h-full w-full pointer-events-auto cursor-pointer' : 'h-full w-full pointer-events-none'}
                style={{ background: 'transparent' }}
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ alpha: true, powerPreference: 'high-performance' }}
            >
                <ColorController
                    isThinking={isThinking}
                    isBooped={isBooped}
                    isHovered={isHovered}
                    phase={phase}
                    contextColor={contextColor}
                    keyLightRef={keyLightRef}
                />

                <ambientLight intensity={0.25} />

                {/* KEY LIGHT — principal, posicionada arriba-derecha-frente
                    Da forma y define la expresión del rostro */}
                <pointLight
                    ref={keyLightRef}
                    position={[2.5, 2.5, 2.5]}
                    intensity={5.5}
                    color="#06b6d4"
                    decay={2}
                />

                {/* FILL LIGHT — izquierda-abajo, suaviza las sombras
                    Intensidad baja = no aplana, solo evita negro puro */}
                <pointLight
                    position={[-2.5, -0.8, 1.5]}
                    intensity={1.8}
                    color={
                        contextColor === 'cyan' ? '#7c3aed' :
                        contextColor === 'violet' ? '#06b6d4' :
                        contextColor === 'amber' ? '#7c3aed' :
                        '#7c3aed'
                    }
                    decay={2.5}
                />

                {/* RIM LIGHT — atrás-arriba, separa el blob del fondo
                    El efecto "producto Apple" viene de acá */}
                <pointLight
                    position={[0, 3.5, -3]}
                    intensity={3.2}
                    color="rgba(255,255,255,1)"
                    decay={1.8}
                />

                {/* FACE LIGHT — muy cerca, ilumina los rasgos faciales
                    Sin esto los ojos y boca quedan planos */}
                <directionalLight
                    position={[0, 0.5, 3.5]}
                    intensity={0.9}
                    color="#ffffff"
                />

                <Float
                    speed={isThinking ? 3.4 : isSleeping ? 0.6 : 2.35}
                    rotationIntensity={isSleeping ? 0.1 : 0.65}
                    floatIntensity={isOpen ? 0.55 : isSleeping ? 0.2 : 0.85}
                >
                    <JellyBody
                        isThinking={isThinking}
                        showPrompt={showPrompt}
                        isBooped={isBooped}
                        isHovered={isHovered}
                        isOpen={isOpen}
                        messagePulse={messagePulse}
                        lastMessageRole={lastMessageRole}
                        hoverPulse={hoverPulse}
                        isSleeping={isSleeping}
                    />
                    <OrbitalParticles
                        isSleeping={isSleeping}
                        isThinking={isThinking}
                        isBooped={isBooped}
                    />
                </Float>
            </Canvas>

            {/* Sleep Z indicator - SOLO si está sleeping */}
            {isSleeping && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: '20%',
                        right: '15%',
                        pointerEvents: 'none',
                        zIndex: 5,
                        opacity: 0.4,
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#06b6d4',
                        fontFamily: 'ui-monospace, monospace',
                        animation: 'sleepZ 3s ease-in-out infinite',
                    }}
                >
                    z
                </div>
            )}
            <style jsx global>{`
                @keyframes sleepZ {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-8px) scale(1.1); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}

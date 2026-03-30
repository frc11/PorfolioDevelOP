'use client';

import { type ComponentRef, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export type AvatarPhase = 'dormant' | 'initializing' | 'stabilizing' | 'active';

interface NeuroAvatarProps {
    isThinking?: boolean;
    showPrompt?: boolean;
    isBooped?: boolean;
    isHovered?: boolean;
    isOpen?: boolean;
    phase?: AvatarPhase;
    scrollSection?: string;
}

const PALETTE = {
    cyan: new THREE.Color('#06b6d4'),
    violet: new THREE.Color('#7c3aed'),
    emerald: new THREE.Color('#059669'),
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
    keyLightRef,
}: {
    isThinking: boolean;
    isBooped: boolean;
    isHovered: boolean;
    phase: AvatarPhase;
    keyLightRef: React.RefObject<THREE.PointLight | null>;
}) {
    const targetColor = useRef(new THREE.Color('#06b6d4'));

    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;

        if (phase === 'dormant') {
            targetColor.current.copy(PALETTE.white).multiplyScalar(0.2);
        } else if (isBooped) {
            targetColor.current.copy(PALETTE.white);
        } else if (isThinking) {
            targetColor.current.copy(PALETTE.frantic);
        } else {
            computeCycleColor(time, targetColor.current);
            if (isHovered) {
                targetColor.current.lerp(PALETTE.white, 0.18);
            }
        }

        activeColorRef.current.lerp(targetColor.current, delta * 4);

        if (keyLightRef.current) {
            keyLightRef.current.color.lerp(activeColorRef.current, delta * 3);
            keyLightRef.current.intensity = THREE.MathUtils.lerp(
                keyLightRef.current.intensity,
                phase === 'active' ? (isThinking ? 5.4 : isHovered ? 5.1 : 4.6) : 4,
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
    isRight,
}: {
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
        if (!meshRef.current) {
            return;
        }

        let targetSX = 1;
        let targetSY = 1;
        let targetSZ = 1;

        if (isBooped) {
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
                targetSY = 1.1;
            } else {
                targetSX = 1.1;
                targetSY = 0.75;
            }
        }

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
}: {
    side: 'left' | 'right';
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const isLeft = side === 'left';
    const baseX = isLeft ? -0.2 : 0.2;
    const baseRotZ = Math.PI / 2;

    useFrame((state, delta) => {
        if (!meshRef.current) {
            return;
        }

        const time = state.clock.elapsedTime;
        let targetY = 0.2;
        let expressionRot = 0;

        if (isBooped) {
            targetY = 0.26;
            expressionRot = isLeft ? 0.35 : -0.35;
        } else if (showPrompt) {
            targetY = 0.15 + Math.sin(time * 6) * 0.03;
            expressionRot = isLeft ? 0.1 : -0.1;
        } else if (isThinking) {
            targetY = 0.22;
        }

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
}: {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((_, delta) => {
        if (!meshRef.current) {
            return;
        }

        let targetSX = 0.7;
        let targetSY = 0.7;
        let targetSZ = 0.7;

        if (isBooped) {
            targetSX = 1.4;
            targetSY = 1.4;
            targetSZ = 1.4;
        } else if (showPrompt) {
            targetSX = 0.5;
            targetSY = 0.5;
            targetSZ = 0.5;
        } else if (isThinking) {
            targetSX = 0.8;
            targetSY = 0.15;
            targetSZ = 0.8;
        }

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

interface JellyBodyProps {
    isThinking: boolean;
    showPrompt: boolean;
    isBooped: boolean;
    isHovered: boolean;
    isOpen: boolean;
}

type DistortMaterialHandle = ComponentRef<typeof MeshDistortMaterial>;

function JellyBody({
    isThinking,
    showPrompt,
    isBooped,
    isHovered,
    isOpen,
}: JellyBodyProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const faceGroupRef = useRef<THREE.Group>(null);
    const bodyMatRef = useRef<DistortMaterialHandle | null>(null);
    const boopTimeRef = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) {
            return;
        }

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

        if (showPrompt) {
            targetSX = 1.1;
            targetSY = 0.85;
            targetSZ = 1.1;
            targetPY = -0.1;
        } else if (isThinking) {
            targetSY = 1.03;
            targetPY = 0.05;
        } else if (isHovered) {
            targetSX = 1.04;
            targetSY = 0.98;
            targetSZ = 1.04;
            targetPY = -0.03;
        }

        meshRef.current.scale.x = springLerp(meshRef.current.scale.x, targetSX, delta);
        meshRef.current.scale.y = springLerp(meshRef.current.scale.y, targetSY, delta);
        meshRef.current.scale.z = springLerp(meshRef.current.scale.z, targetSZ, delta);
        meshRef.current.position.y = springLerp(meshRef.current.position.y, targetPY, delta);

        if (faceGroupRef.current) {
            let gazeTargetY = 0;
            let gazeTargetX = 0;
            let gazeOffsetX = 0;

            if (showPrompt) {
                gazeTargetY = -0.5;
                gazeTargetX = 0.3;
                gazeOffsetX = -0.05;
            } else if (isOpen) {
                gazeTargetY = -0.4;
                gazeTargetX = 0.1;
                gazeOffsetX = -0.08;
            } else if (isHovered) {
                gazeTargetY = -0.18;
                gazeTargetX = 0.02;
            }

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

        const time = state.clock.elapsedTime;
        meshRef.current.rotation.z = THREE.MathUtils.lerp(
            meshRef.current.rotation.z,
            isThinking ? Math.sin(time * 1.8) * 0.02 : 0,
            delta * 3,
        );
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
                distort={isThinking ? 0.35 : showPrompt ? 0.15 : isHovered ? 0.24 : 0.3}
                speed={isThinking ? 2.5 : showPrompt ? 1 : isHovered ? 1.6 : 2}
            />

            <group ref={faceGroupRef} position={[0, 0.12, 1]}>
                <QuantumEye positionX={-0.22} isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <QuantumEye
                    positionX={0.22}
                    isThinking={isThinking}
                    showPrompt={showPrompt}
                    isBooped={isBooped}
                    isRight
                />
                <Eyebrow side="left" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <Eyebrow side="right" isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
                <Mouth isThinking={isThinking} showPrompt={showPrompt} isBooped={isBooped} />
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
}: NeuroAvatarProps) {
    const keyLightRef = useRef<THREE.PointLight>(null);
    const isVisible = phase !== 'dormant';
    const wrapperScale = phase === 'initializing' ? 0.78 : phase === 'stabilizing' ? 0.9 : 1;

    return (
        <div
            className="fixed bottom-3 right-3 z-[110] flex h-56 w-56 items-center justify-center pointer-events-none transition-[opacity,transform] duration-700 ease-out"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: `scale(${wrapperScale})`,
                transformOrigin: 'bottom right',
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
                    keyLightRef={keyLightRef}
                />

                <ambientLight intensity={0.5} />
                <pointLight ref={keyLightRef} position={[2, 2, 2]} intensity={5} color="#06b6d4" decay={2} />
                <pointLight position={[-2, -1, -2]} intensity={3} color="#8b5cf6" decay={2} />
                <Environment preset="city" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <JellyBody
                        isThinking={isThinking}
                        showPrompt={showPrompt}
                        isBooped={isBooped}
                        isHovered={isHovered}
                        isOpen={isOpen}
                    />
                </Float>
            </Canvas>
        </div>
    );
}

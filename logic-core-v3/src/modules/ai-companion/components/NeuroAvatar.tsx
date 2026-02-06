'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EnergyField } from './EnergyField';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface NeuroAvatarProps {
    isThinking?: boolean;
}

function TesseractCore({ isThinking }: { isThinking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const rotationSpeed = isThinking ? 0.05 : 0.01;
        meshRef.current.rotation.x += rotationSpeed * delta * 60;
        meshRef.current.rotation.y += rotationSpeed * delta * 40;
        meshRef.current.rotation.z += rotationSpeed * delta * 30;

        if (isThinking) {
            const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
            meshRef.current.scale.setScalar(pulseScale);
        } else {
            const currentScale = meshRef.current.scale.x;
            const targetScale = hovered ? 1.1 : 1;
            meshRef.current.scale.setScalar(
                THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
            );
        }

        if (innerCoreRef.current) {
            const corePulse = isThinking
                ? 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.15
                : 0.2;
            innerCoreRef.current.scale.setScalar(corePulse);
            innerCoreRef.current.rotation.x += (isThinking ? 0.08 : 0.02) * delta * 60;
            innerCoreRef.current.rotation.y += (isThinking ? 0.06 : 0.015) * delta * 60;
        }
    });

    return (
        <group>
            <Sphere
                ref={meshRef}
                args={[1, 64, 64]}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <MeshDistortMaterial
                    color={isThinking ? "#1e293b" : "#09090b"}
                    attach="material"
                    distort={isThinking ? 0.7 : 0.3}
                    speed={isThinking ? 4 : 1.5}
                    roughness={0}
                    metalness={0.9}
                    bumpScale={0.005}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    radius={1}
                />
            </Sphere>

            <mesh ref={innerCoreRef} visible={isThinking}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial
                    color="#00ffff"
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export function NeuroAvatar({ isThinking = false }: NeuroAvatarProps) {
    return (
        /* 
         * FIX: Added overflow-hidden and rounded-full to the main container.
         * This physically forces any square artifacts into a circular shape, 
         * making them invisible against the background.
         */
        <div className="fixed bottom-0 right-0 z-[100] w-72 h-72 pointer-events-none flex items-center justify-center translate-x-12 translate-y-12 overflow-hidden rounded-full">
            {/* 3D Canvas */}
            <Canvas
                className="pointer-events-auto cursor-pointer"
                style={{ background: 'transparent' }}
                camera={{ position: [0, 0, 6], fov: 45 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    stencil: false,
                    depth: true,
                    premultipliedAlpha: false,
                    powerPreference: 'high-performance',
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                <ambientLight intensity={0.5} />
                <Environment preset="city" />

                <pointLight
                    position={[5, 5, 5]}
                    intensity={isThinking ? 15 : 5}
                    color="#22d3ee"
                />

                <Float
                    speed={isThinking ? 6 : 1.5}
                    rotationIntensity={isThinking ? 2 : 0.8}
                    floatIntensity={isThinking ? 2 : 1}
                >
                    <TesseractCore isThinking={isThinking} />
                    <EnergyField isThinking={isThinking} />
                </Float>

                {/* 
                 * FIX: multisampling={0} is critical for post-processing transparency.
                 * Also ensured only one EffectComposer exists.
                 */
                }
                <EffectComposer multisampling={0} disableNormalPass>
                    <Bloom
                        luminanceThreshold={1}
                        mipmapBlur
                        intensity={0.5}
                        radius={0.4}
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

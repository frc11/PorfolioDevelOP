'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Sparkles, Float } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * The Tesseract - A Neural Avatar
 * Reactive 3D visualization that represents AI thinking state
 */

interface NeuroAvatarProps {
    isThinking?: boolean;
}

function TesseractCore({ isThinking }: { isThinking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Rotation speed based on thinking state
        const rotationSpeed = isThinking ? 0.05 : 0.01;
        meshRef.current.rotation.x += rotationSpeed * delta * 60;
        meshRef.current.rotation.y += rotationSpeed * delta * 40;
        meshRef.current.rotation.z += rotationSpeed * delta * 30;

        // Breathing/pulsing effect when thinking
        if (isThinking) {
            const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
            meshRef.current.scale.setScalar(pulseScale);
        } else {
            // Smoothly return to normal scale
            const currentScale = meshRef.current.scale.x;
            const targetScale = hovered ? 1.1 : 1;
            meshRef.current.scale.setScalar(
                THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
            );
        }

        // Inner core pulsing animation
        if (innerCoreRef.current) {
            const corePulse = isThinking
                ? 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.15
                : 0.2;
            innerCoreRef.current.scale.setScalar(corePulse);

            // Rotate inner core faster when thinking
            innerCoreRef.current.rotation.x += (isThinking ? 0.08 : 0.02) * delta * 60;
            innerCoreRef.current.rotation.y += (isThinking ? 0.06 : 0.015) * delta * 60;
        }
    });

    return (
        <group>
            {/* Outer Glass Shell - High Detail Icosahedron */}
            <mesh
                ref={meshRef}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <icosahedronGeometry args={[1, 15]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2.5}
                    chromaticAberration={isThinking ? 1 : 0.4}
                    anisotropy={0.5}
                    distortion={isThinking ? 0.7 : 0.3}
                    distortionScale={0.5}
                    temporalDistortion={isThinking ? 0.8 : 0.3}
                    color="#101010"
                    resolution={1024}
                    transmission={0.9}
                    roughness={0}
                    metalness={0.05}
                    ior={2.4}
                    reflectivity={0.8}
                />
            </mesh>

            {/* Inner Pulsing Energy Core */}
            <mesh ref={innerCoreRef}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial
                    color={isThinking ? '#00ffff' : '#ffffff'}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export function NeuroAvatar({ isThinking = false }: NeuroAvatarProps) {
    return (
        <div className="fixed bottom-8 right-8 z-[100] w-32 h-32 cursor-pointer group transition-transform hover:scale-105">
            {/* Quantum Glow Effect */}
            <div
                className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${isThinking
                        ? 'bg-violet-500/50 scale-150'
                        : 'bg-cyan-400/20 scale-100'
                    }`}
            />

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 0, 4], fov: 50 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: 'high-performance'
                }}
            >
                {/* Lighting setup */}
                <ambientLight intensity={isThinking ? 3 : 1.5} />
                <pointLight
                    position={[10, 10, 10]}
                    intensity={isThinking ? 2 : 0.8}
                    color="#22d3ee"
                />
                <pointLight
                    position={[-10, -10, -10]}
                    intensity={0.5}
                    color="#8b5cf6"
                />

                {/* Main floating effect wrapper */}
                <Float
                    speed={isThinking ? 8 : 2}
                    rotationIntensity={isThinking ? 2 : 0.5}
                    floatIntensity={isThinking ? 1.5 : 0.5}
                >
                    <TesseractCore isThinking={isThinking} />
                </Float>

                {/* Primary Data Particles - Reactive Colors */}
                <Sparkles
                    count={isThinking ? 150 : 50}
                    scale={3.5}
                    size={isThinking ? 5 : 2}
                    speed={isThinking ? 3 : 0.5}
                    opacity={isThinking ? 1 : 0.5}
                    color={isThinking ? '#c026d3' : '#22d3ee'}
                    noise={2}
                />

                {/* Secondary Particle Layer - Violet/Orange Glow */}
                <Sparkles
                    count={isThinking ? 80 : 25}
                    scale={5}
                    size={isThinking ? 3 : 1}
                    speed={isThinking ? 2 : 0.4}
                    opacity={isThinking ? 0.7 : 0.3}
                    color={isThinking ? '#fb923c' : '#8b5cf6'}
                    noise={1.5}
                />
            </Canvas>

            {/* Status indicator dot */}
            <div className="absolute -top-1 -right-1 z-10">
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

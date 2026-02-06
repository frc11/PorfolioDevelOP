'use client';

import { useFrame } from '@react-three/fiber';
import { Sparkles, Billboard, Float } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface EnergyFieldProps {
    isThinking: boolean;
}

/**
 * EnergyField Component - Orbital Data Stream
 * High-end VFX layer utilizing complex geometries and holographic materials.
 */
export function EnergyField({ isThinking }: EnergyFieldProps) {
    const streamRef = useRef<THREE.Mesh>(null);
    const secondaryStreamRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        const speedMultiplier = isThinking ? 3 : 1;

        if (streamRef.current) {
            streamRef.current.rotation.x += 0.2 * delta * speedMultiplier;
            streamRef.current.rotation.y += 0.3 * delta * speedMultiplier;
            streamRef.current.rotation.z += 0.1 * delta * speedMultiplier;

            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
            streamRef.current.scale.setScalar(pulse);
        }

        if (secondaryStreamRef.current) {
            secondaryStreamRef.current.rotation.x -= 0.15 * delta * speedMultiplier;
            secondaryStreamRef.current.rotation.z += 0.25 * delta * speedMultiplier;
        }
    });

    return (
        <group>
            {/* Main Orbital Data Stream */}
            <Float speed={isThinking ? 4 : 2} rotationIntensity={1} floatIntensity={0.5}>
                <mesh ref={streamRef}>
                    <torusKnotGeometry args={[1.3, 0.015, 128, 32]} />
                    <meshPhysicalMaterial
                        color="#22d3ee"
                        emissive="#22d3ee"
                        emissiveIntensity={isThinking ? 4 : 1}
                        roughness={0}
                        metalness={0.2}
                        transmission={1}
                        thickness={0.5}
                        transparent
                        opacity={0.7}
                    />
                </mesh>
            </Float>

            {/* Secondary Energy Filament */}
            <mesh ref={secondaryStreamRef} rotation={[Math.PI / 4, 0, Math.PI / 3]}>
                <torusKnotGeometry args={[1.5, 0.008, 100, 16, 3, 4]} />
                <meshBasicMaterial
                    color={isThinking ? "#c026d3" : "#52525b"}
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Data Cloud Particles */}
            <Sparkles
                count={isThinking ? 120 : 40}
                scale={2.8}
                size={isThinking ? 4 : 1.5}
                speed={0.6}
                opacity={0.6}
                color="#a5f3fc"
                noise={1}
            />

            {/* Ambient Particles */}
            <Sparkles
                count={isThinking ? 60 : 20}
                scale={7}
                size={2}
                speed={0.3}
                opacity={isThinking ? 0.8 : 0.3}
                color={isThinking ? '#fb923c' : '#8b5cf6'}
                noise={2.5}
            />

            {/* Circular Glow Billboard - Replaced square plane with circle for seamless integration */}
            <Billboard>
                <mesh scale={10}>
                    <circleGeometry args={[1, 64]} />
                    <meshBasicMaterial
                        color={isThinking ? "#0891b2" : "#000000"}
                        transparent
                        opacity={isThinking ? 0.12 : 0.03}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </Billboard>
        </group>
    );
}

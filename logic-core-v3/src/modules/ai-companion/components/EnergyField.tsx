'use client';

import { useFrame } from '@react-three/fiber';
import { Sparkles, Billboard, Float, PointMaterial, Points } from '@react-three/drei';
import { useRef, useMemo, memo } from 'react';
import * as THREE from 'three';

interface EnergyFieldProps {
    isThinking: boolean;
}

// ─────────────────────────────────────────────────────────
// Cinematic Particles - 2000 spherically-distributed particles
// ─────────────────────────────────────────────────────────

const CinematicParticles = memo(function CinematicParticles({ isThinking }: { isThinking: boolean }) {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate 2000 particles in spherical distribution
    const { positions, colors } = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const cyan = new THREE.Color('#22d3ee');
        const purple = new THREE.Color('#c026d3');
        const orange = new THREE.Color('#fb923c');

        for (let i = 0; i < count; i++) {
            // Spherical coordinates: radius 2-4, random theta/phi
            const radius = 2 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Color distribution: 50% cyan, 30% purple, 20% orange
            const roll = Math.random();
            const color = roll < 0.5 ? cyan : roll < 0.8 ? purple : orange;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return { positions, colors };
    }, []);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const time = state.clock.elapsedTime;
        const speed = isThinking ? 0.3 : 0.1;

        // Orbital rotation around Y-axis per particle
        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < posArray.length / 3; i++) {
            const x = posArray[i * 3];
            const z = posArray[i * 3 + 2];

            // Rotate around Y
            const cos = Math.cos(speed * delta);
            const sin = Math.sin(speed * delta);
            posArray[i * 3] = x * cos - z * sin;
            posArray[i * 3 + 2] = x * sin + z * cos;

            // Vertical oscillation
            posArray[i * 3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.002;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;

        // Rotate the whole system slowly
        pointsRef.current.rotation.y += delta * 0.05;
    });

    return (
        <Points ref={pointsRef} limit={2000}>
            <bufferAttribute
                attach="geometry-attributes-position"
                args={[positions, 3]}
            />
            <bufferAttribute
                attach="geometry-attributes-color"
                args={[colors, 3]}
            />
            <PointMaterial
                size={isThinking ? 0.04 : 0.02}
                vertexColors
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation
            />
        </Points>
    );
}, (prev, next) => prev.isThinking === next.isThinking);

/**
 * EnergyField Component - Orbital Data Stream
 * High-end VFX layer utilizing complex geometries and holographic materials.
 */
export const EnergyField = memo(function EnergyField({ isThinking }: EnergyFieldProps) {
    const streamRef = useRef<THREE.Mesh>(null);
    const secondaryStreamRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (streamRef.current) {
            // Rotation speeds: faster when thinking
            const rotX = isThinking ? 0.4 : 0.15;
            const rotY = isThinking ? 0.5 : 0.2;
            const rotZ = isThinking ? 0.3 : 0.1;
            streamRef.current.rotation.x += rotX * delta;
            streamRef.current.rotation.y += rotY * delta;
            streamRef.current.rotation.z += rotZ * delta;

            // Scale pulse
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
            streamRef.current.scale.setScalar(pulse);
        }

        if (secondaryStreamRef.current) {
            secondaryStreamRef.current.rotation.x -= 0.15 * delta;
            secondaryStreamRef.current.rotation.z += 0.25 * delta;
        }
    });

    return (
        <group>
            {/* Main Orbital Data Stream */}
            <Float speed={isThinking ? 4 : 2} rotationIntensity={1} floatIntensity={0.5}>
                <mesh ref={streamRef}>
                    <torusKnotGeometry args={[1.3, 0.02, 256, 64]} />
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

            {/* Cinematic Particle System */}
            <CinematicParticles isThinking={isThinking} />

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

            {/* Circular Glow Billboard */}
            <Billboard>
                <mesh scale={12}>
                    <circleGeometry args={[1, 64]} />
                    <meshBasicMaterial
                        color={isThinking ? "#0891b2" : "#18181b"}
                        transparent
                        opacity={isThinking ? 0.2 : 0.05}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </Billboard>

            {/* Concentric Glow Rings - Visible only when thinking */}
            {isThinking && (
                <>
                    {/* Inner glow ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[2, 2.1, 64]} />
                        <meshBasicMaterial
                            color="#22d3ee"
                            transparent
                            opacity={0.3}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>

                    {/* Outer glow ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.2}>
                        <ringGeometry args={[2, 2.05, 64]} />
                        <meshBasicMaterial
                            color="#a5f3fc"
                            transparent
                            opacity={0.15}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                </>
            )}
        </group>
    );
}, (prev, next) => prev.isThinking === next.isThinking);

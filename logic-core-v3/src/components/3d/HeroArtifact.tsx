"use client";

import React, { useRef, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { SVGLoader } from 'three-stdlib';
import * as THREE from 'three';
import { Center } from '@react-three/drei';

export function HeroArtifact({ active = true }: { active?: boolean }) {
    const groupRef = useRef<THREE.Group>(null);

    // Load SVG
    const svgData = useLoader(SVGLoader as any, '/logodevelOP.svg');

    // Parse path to shapes
    const shapes = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (svgData as any).paths.flatMap((path: any) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            path.toShapes(true).map((shape: any) => ({ shape, color: path.color, userData: path.userData }))
        );
    }, [svgData]);

    // Animation: Mouse Follow
    useFrame((state) => {
        if (!groupRef.current) return;

        if (!active) {
            // Idle / Waiting State
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
            return;
        }

        const { pointer } = state;
        // Lerp rotation for smooth follow
        // Target rotation based on pointer position (limits to +/- ~60 degrees - Heavy & Expensive feel)
        const targetRotX = -pointer.y * 1.2;
        const targetRotY = pointer.x * 1.2;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05); // Heavy damping
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    });

    return (
        <group ref={groupRef}>
            <group scale={0.007} rotation={[Math.PI, 0, 0]}> {/* Flip Y for SVG coordinates */}
                <group position={[-512, -512, 0]}> {/* Manual Center for 1024x1024 ViewBox */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {shapes.map((item: any, i: number) => (
                        <mesh key={i}>
                            <extrudeGeometry
                                args={[
                                    item.shape,
                                    {
                                        depth: 10,
                                        bevelEnabled: true,
                                        bevelThickness: 1,
                                        bevelSize: 1,
                                        bevelSegments: 5,
                                    },
                                ]}
                            />
                            <meshPhysicalMaterial
                                color="#000000"
                                emissive="#000000"
                                roughness={0.0} // Piano Polish
                                metalness={1.0} // Chrome/Obsidian
                                clearcoat={1.0}
                                clearcoatRoughness={0.0}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
            <OrbitalParticles count={3000} />
        </group>
    );
}

function OrbitalParticles({ count = 3000 }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const points = useRef<THREE.Points>(null!)

    const { temp, initial } = useMemo(() => {
        const temp = new Float32Array(count * 3)
        const initial = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            // Spherical distribution
            const radius = 6 + Math.random() * 8 // Wider cloud
            const theta = THREE.MathUtils.randFloatSpread(360)
            const phi = THREE.MathUtils.randFloatSpread(360)

            initial[i3] = temp[i3] = radius * Math.sin(theta) * Math.cos(phi)
            initial[i3 + 1] = temp[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
            initial[i3 + 2] = temp[i3 + 2] = radius * Math.cos(theta)
        }
        return { temp, initial }
    }, [count])

    useFrame((state) => {
        if (!points.current) return;

        // Base Rotation
        const time = state.clock.getElapsedTime()
        points.current.rotation.y = time * 0.02
        points.current.rotation.x = time * 0.01

        const { pointer, viewport } = state

        // Convert mouse/pointer to 3D coords (approximate at z=0 plane)
        const mouse3D = new THREE.Vector3(
            (pointer.x * viewport.width) / 2,
            (pointer.y * viewport.height) / 2,
            0
        )

        const positions = points.current.geometry.attributes.position.array as Float32Array

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Current Particle Position
            const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2])

            // Interaction logic
            // Note: We need to account for the group's rotation in a real app, 
            // but for a subtle effect, treating local space is often "good enough" or creates interesting artifacts.
            // Here we assume local space interaction for simplicity and "glitchy" aesthetics.

            const dist = particlePos.distanceTo(mouse3D)
            const influenceRadius = 4

            if (dist < influenceRadius) {
                // Repel: Move away from mouse
                const repelStrength = (influenceRadius - dist) * 0.05
                const dir = particlePos.clone().sub(mouse3D).normalize().multiplyScalar(repelStrength)

                positions[i3] += dir.x
                positions[i3 + 1] += dir.y
                positions[i3 + 2] += dir.z
            } else {
                // Return to initial position (Elasticity)
                positions[i3] += (initial[i3] - positions[i3]) * 0.02
                positions[i3 + 1] += (initial[i3 + 1] - positions[i3 + 1]) * 0.02
                positions[i3 + 2] += (initial[i3 + 2] - positions[i3 + 2]) * 0.02
            }
        }
        points.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={temp.length / 3}
                    array={temp}
                    itemSize={3}
                    args={[temp, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.025} // "Diamond Dust" - tiny dots
                color="#ffffff" // Silver/White sparkles
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                sizeAttenuation
            />
        </points>
    )
}

'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance, Line } from '@react-three/drei';
import * as THREE from 'three';

export const NeuralNetwork = () => {
    const groupRef = useRef<THREE.Group>(null);

    // 1. Generate random node positions
    const count = 50;
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            // Spherical distribution radius ~4
            const r = 4 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            temp.push(new THREE.Vector3(x, y, z));
        }
        return temp;
    }, []);

    // 2. Generate connections (Static plexus for performance)
    const connections = useMemo(() => {
        const lines: THREE.Vector3[][] = [];
        const threshold = 2.5; // Connection distance

        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const dist = particles[i].distanceTo(particles[j]);
                if (dist < threshold) {
                    lines.push([particles[i], particles[j]]);
                }
            }
        }
        return lines;
    }, [particles]);

    // 3. Animation: Rotation & Breathing
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Slow rotation
        groupRef.current.rotation.y += delta * 0.05;
        groupRef.current.rotation.x += delta * 0.02;
    });

    return (
        <group ref={groupRef}>
            {/* Bright Nodes */}
            <Instances range={count}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial
                    emissive="#ffffff"
                    emissiveIntensity={3}
                    color="#ffffff"
                    toneMapped={false}
                />
                {particles.map((pos, i) => (
                    <Instance key={i} position={pos} />
                ))}
            </Instances>

            {/* Connecting Lines */}
            {connections.map((points, i) => (
                <Line
                    key={i}
                    points={points}
                    color="white"
                    transparent
                    opacity={0.15}
                    lineWidth={1}
                />
            ))}
        </group>
    );
};

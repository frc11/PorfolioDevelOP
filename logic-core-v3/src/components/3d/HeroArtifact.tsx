'use client';

import React, { useRef, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { SVGLoader } from 'three-stdlib';
import * as THREE from 'three';

export function HeroArtifact({ active = true }: { active?: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const svgData = useLoader(SVGLoader, '/logodevelOP.svg');

    const shapes = useMemo(() => {
        return svgData.paths.flatMap((path) =>
            path.toShapes(true).map((shape) => ({ shape, color: path.color }))
        );
    }, [svgData]);

    useFrame((state) => {
        if (!groupRef.current) return;

        // Si no está activo, volver lentamente al centro
        const targetX = active ? -state.pointer.y * 1.2 : 0;
        const targetY = active ? state.pointer.x * 1.2 : 0;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
    });

    return (
        <group ref={groupRef}>
            {/* CONFIGURACIÓN ORIGINAL V1 */}
            <group scale={0.007} rotation={[Math.PI, 0, 0]}>
                <group position={[-512, -512, 0]}>
                    {shapes.map((item, i) => (
                        <mesh key={i} castShadow receiveShadow>
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
                            {/* MATERIAL OBSIDIAN ORIGINAL */}
                            <meshPhysicalMaterial
                                color="#050505"
                                emissive="#000000"
                                roughness={0.1}
                                metalness={0.9}
                                clearcoat={1.0}
                                clearcoatRoughness={0.1}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    );
}

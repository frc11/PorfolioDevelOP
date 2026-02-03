'use client';

import React, { useRef, useMemo } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { SVGLoader } from 'three-stdlib';
import * as THREE from 'three';

export function HeroArtifact() {
    const groupRef = useRef<THREE.Group>(null);
    const svgData = useLoader(SVGLoader, '/logodevelOP.svg');

    const shapes = useMemo(() => {
        return svgData.paths.flatMap((path) =>
            path.toShapes(true).map((shape) => ({ shape, color: path.color }))
        );
    }, [svgData]);

    useFrame((state) => {
        if (!groupRef.current) return;

        // INTERACTIVIDAD: Seguimiento del mouse suave y elegante
        const { x, y } = state.pointer;

        // Ajusta los multiplicadores (0.8) para controlar cuánto gira
        const targetX = -y * 0.8;
        const targetY = x * 0.8;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.1);
    });

    return (
        <group ref={groupRef}>
            {/* Ajuste de escala y rotación para SVG invertido */}
            <group scale={0.007} rotation={[Math.PI, 0, 0]}>
                {/* Ajuste de centro (asumiendo viewBox 1024x1024) */}
                <group position={[-512, -512, 0]}>
                    {shapes.map((item, i) => (
                        <mesh key={i} castShadow receiveShadow>
                            <extrudeGeometry
                                args={[
                                    item.shape,
                                    {
                                        depth: 15, // Un poco más grueso para que se vea imponente
                                        bevelEnabled: true,
                                        bevelThickness: 1,
                                        bevelSize: 1,
                                        bevelSegments: 5,
                                    },
                                ]}
                            />
                            {/* MATERIAL BRILLANTE DEFINITIVO */}
                            <meshPhysicalMaterial
                                color="#000000"
                                emissive="#000000"
                                roughness={0.0}   // Espejo
                                metalness={1.0}   // Metal
                                clearcoat={1.0}   // Barniz
                                clearcoatRoughness={0.0}
                                reflectivity={1.0}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    );
}

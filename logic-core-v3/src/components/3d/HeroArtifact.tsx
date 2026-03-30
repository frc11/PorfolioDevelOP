'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { SVGLoader } from 'three-stdlib';
import * as THREE from 'three';

import type { PreloaderPhase } from '@/context/PreloaderContext';

type HeroArtifactProps = {
    phase: PreloaderPhase;
};

export function HeroArtifact({ phase }: HeroArtifactProps) {
    const groupRef = useRef<THREE.Group>(null);
    const isVisibleRef = useRef(true);
    const materialRefs = useRef<THREE.MeshPhysicalMaterial[]>([]);
    const svgData = useLoader(SVGLoader, '/logodevelOP.svg');

    const shapes = useMemo(
        () =>
            svgData.paths.flatMap((path) =>
                path.toShapes(true).map((shape) => ({ shape }))
            ),
        [svgData]
    );

    useEffect(() => {
        const handleScroll = () => {
            isVisibleRef.current = window.scrollY <= window.innerHeight + 200;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame((state, delta) => {
        const group = groupRef.current;
        if (!group || !isVisibleRef.current) return;

        const revealTarget =
            phase === 'done' ? 1 :
            phase === 'swapping' ? 0.88 :
            0;
        const opacityTarget =
            phase === 'done' ? 1 :
            phase === 'swapping' ? 0.86 :
            0;
        const scaleTarget =
            phase === 'done' ? 1 :
            phase === 'swapping' ? 1.06 :
            0.72;
        const depthTarget =
            phase === 'done' ? 0 :
            phase === 'swapping' ? 0.45 :
            -3.2;

        const currentReveal =
            typeof group.userData.revealProgress === 'number'
                ? group.userData.revealProgress
                : 0;
        const revealProgress = THREE.MathUtils.damp(
            currentReveal,
            revealTarget,
            phase === 'done' ? 7.5 : 5.6,
            delta
        );

        group.userData.revealProgress = revealProgress;

        const emergence = 1 - revealProgress;
        const floatAmplitude = phase === 'done' ? 0.08 : 0.02;
        const floatY = Math.sin(state.clock.elapsedTime * 0.65) * floatAmplitude;
        const pointerStrength = phase === 'done' ? 1 : 0.32 + revealProgress * 0.45;
        const targetX = -state.pointer.y * 0.8 * pointerStrength - emergence * 0.14;
        const targetY = state.pointer.x * 0.8 * pointerStrength + emergence * 0.16;

        group.position.y = THREE.MathUtils.damp(
            group.position.y,
            emergence * 0.45 + floatY,
            7.2,
            delta
        );
        group.position.z = THREE.MathUtils.damp(
            group.position.z,
            depthTarget,
            phase === 'done' ? 8.2 : 5.8,
            delta
        );
        group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 8, delta);
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 8, delta);

        const nextScale = THREE.MathUtils.damp(
            group.scale.x || 1,
            scaleTarget,
            phase === 'done' ? 8.6 : 5.8,
            delta
        );
        group.scale.setScalar(nextScale);

        materialRefs.current.forEach((material) => {
            if (!material) return;

            material.opacity = THREE.MathUtils.damp(
                material.opacity,
                opacityTarget,
                phase === 'done' ? 8 : 5.8,
                delta
            );
            material.emissiveIntensity = THREE.MathUtils.damp(
                material.emissiveIntensity ?? 0,
                phase === 'swapping' ? 0.12 : 0.02,
                6.8,
                delta
            );
        });
    });

    return (
        <group ref={groupRef}>
            <group scale={0.007} rotation={[Math.PI, 0, 0]}>
                <group position={[-512, -512, 0]}>
                    {shapes.map((item, index) => (
                        <mesh key={index} castShadow receiveShadow>
                            <extrudeGeometry
                                args={[
                                    item.shape,
                                    {
                                        depth: 15,
                                        bevelEnabled: true,
                                        bevelThickness: 1,
                                        bevelSize: 1,
                                        bevelSegments: 5,
                                    },
                                ]}
                            />
                            <meshPhysicalMaterial
                                ref={(material) => {
                                    if (material) {
                                        materialRefs.current[index] = material;
                                    }
                                }}
                                color="#000000"
                                emissive="#000000"
                                emissiveIntensity={0}
                                roughness={0}
                                metalness={1}
                                clearcoat={1}
                                clearcoatRoughness={0}
                                reflectivity={1}
                                side={THREE.DoubleSide}
                                transparent
                                opacity={0}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    );
}

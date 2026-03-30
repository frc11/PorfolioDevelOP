'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Environment, ContactShadows } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { SVGLoader } from 'three-stdlib';
import type { SVGResult } from 'three-stdlib';
import * as THREE from 'three';

export type PreloaderArtifactProps = {
    phase: 'hidden' | 'appearing' | 'idle' | 'exiting';
    onLoaded?: () => void;
};

function PreloaderLogoMesh({ phase, onLoaded }: PreloaderArtifactProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [svgData, setSvgData] = useState<SVGResult | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loader = new SVGLoader();
        loader.load('/logodevelOP.svg', (data) => {
            setSvgData(data);
            setIsLoaded(true);
        });
    }, []);

    useEffect(() => {
        if (isLoaded) onLoaded?.();
    }, [isLoaded, onLoaded]);

    const shapes = useMemo(() => {
        if (!svgData) return [];
        return svgData.paths.flatMap((path) =>
            path.toShapes(true).map((shape) => ({ shape }))
        );
    }, [svgData]);

    useEffect(() => {
        if (!groupRef.current) return;

        if (phase === 'hidden') {
            groupRef.current.scale.setScalar(0);
            groupRef.current.position.y = 0;
            groupRef.current.rotation.x = 0;
            groupRef.current.rotation.y = -0.5;
        }

        if (phase === 'appearing') {
            groupRef.current.scale.setScalar(0.007);
            groupRef.current.position.y = 0;
            groupRef.current.rotation.x = 0;
            groupRef.current.rotation.y = -0.6;
        }
    }, [phase]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (phase === 'appearing') {
            groupRef.current.scale.setScalar(0.007);
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                0,
                delta * 1.5
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                0,
                delta * 1.5
            );
        }

        if (phase === 'idle') {
            groupRef.current.scale.setScalar(0.007);
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;

            const targetX = -state.pointer.y * 0.8;
            const targetY = state.pointer.x * 0.8;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetX,
                0.1
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetY,
                0.1
            );
        }

        if (phase === 'exiting') {
            groupRef.current.scale.setScalar(0.007);
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.08;

            const targetX = -state.pointer.y * 0.4;
            const targetY = state.pointer.x * 0.4;

            groupRef.current.rotation.x = THREE.MathUtils.lerp(
                groupRef.current.rotation.x,
                targetX,
                0.05
            );
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                targetY,
                0.05
            );
        }
    });

    return (
        <group ref={groupRef} visible={isLoaded}>
            <group rotation={[Math.PI, 0, 0]}>
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
                                color="#ffffff"
                                emissive="#111111"
                                roughness={0.05}
                                metalness={1.0}
                                clearcoat={1.0}
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

export function PreloaderArtifact({ phase, onLoaded }: PreloaderArtifactProps) {
    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
            <pointLight position={[-5, 3, 2]} intensity={1.5} color="#06b6d4" />
            <pointLight position={[5, -3, -2]} intensity={0.8} color="#8b5cf6" />
            <Environment preset="studio" />

            <PreloaderLogoMesh phase={phase} onLoaded={onLoaded} />

            <ContactShadows
                position={[0, -2.5, 0]}
                opacity={0.6}
                scale={15}
                blur={2}
                far={4}
                color="#000000"
            />

            <EffectComposer enableNormalPass={false}>
                <ChromaticAberration offset={[0.0015, 0.0015]} />
                <Noise opacity={0.05} premultiply />
                <Vignette eskil={false} offset={0.1} darkness={0.5} />
            </EffectComposer>
        </>
    );
}

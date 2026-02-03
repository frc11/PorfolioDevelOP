'use client';
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const LiquidMetal = () => {
    const materialRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (materialRef.current) {
            // Lerp para suavizar la transición de calma a tormenta
            const targetDistort = hovered ? 0.7 : 0.3;
            const targetSpeed = hovered ? 5 : 1.5;
            const targetColor = hovered ? new THREE.Color('#0044ff') : new THREE.Color('#222222');

            materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, delta * 2);
            materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, delta * 2);
            materialRef.current.color.lerp(targetColor, delta * 2);
        }
    });

    return (
        <mesh
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            rotation={[-Math.PI / 2, 0, 0]} // Rotar para que parezca una superficie
        >
            <planeGeometry args={[4, 4, 64, 64]} /> {/* Alta densidad para buena distorsión */}
            <MeshDistortMaterial
                ref={materialRef}
                color="#222222"
                roughness={0.1}
                metalness={0.9}
                radius={1}
                distort={0.3}
            />
        </mesh>
    );
};

// imageUrl unused but kept for compatibility with parent usage
export default function LiquidProject({ className = "", imageUrl }: { className?: string, imageUrl?: string }) {
    return (
        <div className={`relative w-full h-full ${className}`}>
            <Canvas camera={{ position: [0, 2, 3], fov: 45 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                {/* Luces de colores para dar reflejos interesantes */}
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <LiquidMetal />
                </Float>

                {/* Entorno HDRI para reflejos realistas */}
                <Environment preset="warehouse" />
            </Canvas>
        </div>
    );
}

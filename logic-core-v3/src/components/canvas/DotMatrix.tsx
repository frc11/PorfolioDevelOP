'use client';

import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function DotMatrix() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const rows = 50;
    const cols = 50;
    const count = rows * cols;

    // Objetos reusables para optimización (Garbage Collection friendly)
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Generar la Grilla Base centrada
    const basePositions = useMemo(() => {
        const temp = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = (i - rows / 2) * 0.6; // Espaciado 0.6
                const y = (j - cols / 2) * 0.6;
                temp.push({ x, y, z: -3 }); // Z base detrás del logo
            }
        }
        return temp;
    }, [rows, cols]);

    useLayoutEffect(() => {
        if (meshRef.current) {
            // Inicializar matriz de colores
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
        }
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime() * 0.5; // Velocidad de la onda
        const { pointer, viewport } = state;

        // Mouse en coordenadas de mundo aproximadas
        const mx = (pointer.x * viewport.width) / 2;
        const my = (pointer.y * viewport.height) / 2;

        basePositions.forEach((pos, i) => {
            let { x, y, z } = pos;

            // 1. ONDA ARMÓNICA (Movimiento Principal)
            // Crea un oleaje suave diagonal
            const waveZ = Math.sin(x * 0.3 + time) * Math.cos(y * 0.3 + time) * 1.5;

            // 2. INTERACCIÓN SUTIL
            const dx = mx - x;
            const dy = my - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            let mouseInfluence = 0;

            if (dist < 4) {
                // Suave elevación cerca del mouse
                mouseInfluence = (4 - dist) / 4;
                z += mouseInfluence * 1.5;
            }

            // Posición final combinada
            dummy.position.set(x, y, z + waveZ);

            // Escala dinámica: Los puntos más altos son un poco más grandes
            const scaleFactor = 1 + (waveZ * 0.2);
            dummy.scale.setScalar(scaleFactor);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // COLOR DINÁMICO
            // Oscuro en el fondo, Claro en la cresta de la ola
            const intensity = (waveZ + 1.5) / 3; // Normalizar aprox 0 a 1
            color.setHex(0x333333).lerp(new THREE.Color('#dddddd'), intensity + mouseInfluence * 0.5);

            meshRef.current!.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            {/* Esferas más pequeñas y finas */}
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial
                color="#ffffff"
                roughness={0.4}
                metalness={0.8}
            />
        </instancedMesh>
    );
}

'use client';

import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DotMatrixProps {
    active?: boolean;
}

export function DotMatrix({ active }: DotMatrixProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const count = 40 * 40; // 1600 points

    // Use useMemo for stable objects to avoid GC
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);
    const targetColor = useMemo(() => new THREE.Color('#00aaff'), []); // Cyan/Blue
    const baseColor = useMemo(() => new THREE.Color('#cccccc'), []); // Medium Grey for Light Mode

    const particles = useMemo(() => {
        const temp = [];
        for (let x = 0; x < 40; x++) {
            for (let y = 0; y < 40; y++) {
                // Center grid: (x - 20) * 0.8
                const px = (x - 20) * 0.8;
                const py = (y - 20) * 0.8;
                temp.push({ x: px, y: py, z: -3 }); // Positioned at Z = -3 (behind logo)
            }
        }
        return temp;
    }, []);

    useLayoutEffect(() => {
        // Ensure instanceColor attribute exists
        if (meshRef.current && !meshRef.current.instanceColor) {
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
        }
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const { pointer, viewport } = state;

        // Map mouse (-1 to 1) to rough world coords at z=0 plane sizing
        // Note: dots are at z=-3 so they span a wider area, but interaction is relative
        const mx = (pointer.x * viewport.width) / 2;
        const my = (pointer.y * viewport.height) / 2;

        particles.forEach((p, i) => {
            const { x, y, z } = p;

            // Calculate distance
            const dx = mx - x;
            const dy = my - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Interactive Effect
            let scale = 1;
            let zOffset = 0;
            let force = 0;

            if (dist < 5) {
                force = (5 - dist) / 5; // 0 to 1
                scale = 1 + force; // Scale x2 max when mouse is very close
                zOffset = force * 2; // Move closer to camera (Z+)
            }

            dummy.position.set(x, y, z + zOffset);
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // Color Interactive
            // Base medium grey, lerp to Cyan/Blue based on force
            if (meshRef.current!.instanceColor) {
                color.copy(baseColor).lerp(targetColor, force * 0.8);
                meshRef.current!.setColorAt(i, color);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            {/* White material so instance colors (grey/cyan) are true */}
            <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </instancedMesh>
    );
}

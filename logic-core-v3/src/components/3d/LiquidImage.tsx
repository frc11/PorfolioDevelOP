'use client';
import { useRef, useState, useMemo } from 'react';
import { Image as DreiImage, useCursor } from '@react-three/drei';
import { useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { easing } from 'maath';
import * as THREE from 'three';

// Extend Three.js types if needed (though Image handles most standard uniforms)
// For advanced custom shaders, we would extend here.
// For this implementation, we use Drei Image + Frame Physics.

type LiquidImageProps = {
    url: string;
    [key: string]: any;
};

export const LiquidImage = ({ url, ...props }: LiquidImageProps) => {
    const ref = useRef<any>();
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

    // Material modification for custom uniforms if needed in future
    // const uniforms = useMemo(() => ({
    //   uHover: { value: 0 },
    //   uTime: { value: 0 }
    // }), [])

    useFrame((state, delta) => {
        if (!ref.current) return;

        // 1. Animación de Color/Opacidad (Fade in)
        // grayscale prop is managed by Drei Image material
        easing.damp(ref.current.material, 'grayscale', hovered ? 0 : 0.8, 0.25, delta);
        easing.damp(ref.current.material, 'zoom', hovered ? 1 : 1.1, 0.25, delta);

        // 2. Simulación de "Líquido" (Wobble) y "Bounce"
        // Alteramos la escala o rotación ligeramente con una onda seno rápida cuando está en hover
        if (hovered) {
            const t = state.clock.elapsedTime;
            // Micro-vibración vertical para efecto "flotando en agua"
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, Math.sin(t * 5) * 0.02, 0.1);
        } else {
            // Return to 0
            easing.damp3(ref.current.position, [ref.current.position.x, 0, ref.current.position.z], 0.1, delta);
        }

        // Smooth Scale on Hover (Elastic Bubble)
        const targetScale = hovered ? 1.05 : 1;
        easing.damp3(ref.current.scale, [targetScale, targetScale, 1], 0.15, delta);
    });

    return (
        <DreiImage
            ref={ref}
            url={url}
            transparent
            side={THREE.DoubleSide}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            {...props}
        />
    );
};

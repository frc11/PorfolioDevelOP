"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { SVGLoader } from "three-stdlib";
import * as THREE from "three";

// Mismos params de extrude/transform que HeroArtifact (FROZEN) → footprint IDÉNTICO,
// para que el crossfade 2D→3D quede alineado y no haya salto de tamaño/posición.
const EXTRUDE_OPTIONS = {
    depth: 15,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 5,
};

/**
 * Logo 3D con material BLANCO para el intro de marketing — lee blanco MISMO tono
 * que el relleno 2D (`#f4f4f5`) → crossfade continuo (sin salto blanco→gris).
 *
 * Componente APARTE: NO toca `HeroArtifact` (frozen). Reconstruye su MISMA geometría
 * (SVG → shapes → extrude, `0.007`, offset `[-512,-512]`, `rotation[Math.PI]`) con
 * un `meshPhysicalMaterial` propio (blanco, metalness baja + leve clearcoat = sheen).
 *
 * HEAD-ON y QUIETO mientras `mouseFollowEnabled` es false: el `state.pointer` se
 * clampea a (0,0) por frame → ningún tilt asoma por los huecos del 2D. Sigue al
 * mouse recién cuando el 2D ya desapareció (`mouseFollowEnabled` = true).
 */
export function BrandedLogoWhite({
    mouseFollowEnabled,
}: {
    mouseFollowEnabled: boolean;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const svgData = useLoader(SVGLoader, "/logodevelOP.svg");

    const shapes = useMemo(
        () =>
            svgData.paths.flatMap((path) =>
                path.toShapes(true).map((shape) => ({ shape })),
            ),
        [svgData],
    );

    useFrame((state, delta) => {
        const group = groupRef.current;
        if (!group) return;

        // Mientras el 2D tapa (mouse-follow OFF): HEAD-ON. Clampear state.pointer a
        // (0,0) por si quedó un valor stale → nada de tilt asomando por los huecos.
        if (!mouseFollowEnabled) {
            state.pointer.x = 0;
            state.pointer.y = 0;
        }

        const strength = mouseFollowEnabled ? 1 : 0;
        const targetX = -state.pointer.y * 0.8 * strength;
        const targetY = state.pointer.x * 0.8 * strength;
        group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetX, 8, delta);
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetY, 8, delta);
    });

    return (
        <group ref={groupRef}>
            <group scale={0.007} rotation={[Math.PI, 0, 0]}>
                <group position={[-512, -512, 0]}>
                    {shapes.map((item, index) => (
                        <mesh key={index}>
                            <extrudeGeometry args={[item.shape, EXTRUDE_OPTIONS]} />
                            <meshPhysicalMaterial
                                color="#f4f4f5"
                                roughness={0.42}
                                metalness={0.08}
                                clearcoat={0.55}
                                clearcoatRoughness={0.32}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            </group>
        </group>
    );
}

export default BrandedLogoWhite;

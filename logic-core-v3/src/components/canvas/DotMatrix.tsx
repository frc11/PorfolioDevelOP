'use client';

import { useRef, useMemo, useLayoutEffect, useEffect } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type { MotionValue } from 'motion/react';

// Pitch de grilla para la coreografía intro→hero. Con `progress` undefined
// (páginas de auth y cualquier uso standalone) la malla renderiza exactamente
// como antes: DOT_SPACING_FINAL y sin offset X. SPARSE se calibra en Sprint 3.
const DOT_SPACING_FINAL = 0.6;
const DOT_SPACING_SPARSE = 0.95;
// Cull-by-scale: los puntos que caen fuera de la mitad derecha se escalan a 0 con
// un ramp suave (smoothstep) — independiente del fondo, los hace desaparecer de
// verdad y sin pop. DOT_CULL_BAND = ancho (world) del ramp a la derecha del centro
// (x=0); los de x<=0 quedan ocultos cuando progress=1.
const DOT_CULL_BAND = 2.4;
// Cobertura de la grilla (filas → extensión X, columnas → extensión Y). En el
// intro la grilla EXCEDE la sección visible por todos lados (sin huecos en bordes
// ni en la costura). Default 50×50 SOLO sin `progress` (auth: /login,
// /forgot-password, /accept-invite) → back-compat bit-idéntico. Misma densidad
// final (spacing 0.6): solo cambia la extensión, no la separación entre puntos.
const GRID_ROWS_DEFAULT = 50;
const GRID_COLS_DEFAULT = 50;
const GRID_ROWS_INTRO = 84;
const GRID_COLS_INTRO = 60;
// Color de la cresta de la ola (hoisted: evita crear un THREE.Color por punto y
// por frame; solo se lee en lerp → mismo resultado visual).
const DOT_COLOR_CREST = new THREE.Color('#52525b');

// Random reveal (revealProgress): cada instancia tiene un delay aleatorio → los
// puntos "pintan" en orden random en lugar de todos de golpe.
// SPREAD: los delays abarcan esta fracción del rango rv [0,1] → escalonado.
// RAMP: cada punto se revela sobre esta ventana de rv → casi instantáneo por punto.
const REVEAL_SPREAD = 0.75;
const REVEAL_RAMP = 0.20;

type DotMatrixMeshProps = {
    /**
     * Driver opcional 0..1 (un MotionValue, leído por frame — nunca re-renderiza).
     * Interpola la grilla de sparse/full-screen (0) a densa/mitad-derecha (1).
     * Omitido → comportamiento estático original (back-compat).
     */
    progress?: MotionValue<number>;
    /**
     * Driver opcional 0..1 para el reveal POR-INSTANCIA en orden ALEATORIO.
     * Cada punto tiene un delay random; su factor = smoothstep sobre rv → los
     * puntos "pintan" de a uno en orden random en lugar de todos de golpe.
     * Omitido → factor 1 para todos (back-compat: /login·/forgot-password·/accept-invite).
     */
    revealProgress?: MotionValue<number>;
};

export const DotMatrixMesh = ({ progress, revealProgress }: DotMatrixMeshProps) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const isVisibleRef = useRef(true);
    // Con `progress` (intro del Hero) la grilla es MÁS GRANDE que la sección
    // visible (sobra por todos lados). Sin progress (auth) queda 50×50 EXACTO.
    const intro = progress !== undefined;
    const rows = intro ? GRID_ROWS_INTRO : GRID_ROWS_DEFAULT;
    const cols = intro ? GRID_COLS_INTRO : GRID_COLS_DEFAULT;
    const count = rows * cols;

    // Objetos reusables para optimización (Garbage Collection friendly)
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Grilla base en coords normalizadas (gx, gy) para animar spacing y offsetX
    // por frame. Con spacing 0.6 y offsetX 0 reproduce exactamente las posiciones
    // originales: x = (i - rows/2) * 0.6, y = (j - cols/2) * 0.6.
    const baseGrid = useMemo(() => {
        const temp: { gx: number; gy: number; z: number }[] = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                temp.push({ gx: i - rows / 2, gy: j - cols / 2, z: -3 }); // Z base detrás del logo
            }
        }
        return temp;
    }, [rows, cols]);

    // Delays random por instancia: useRef + useLayoutEffect (Math.random no puede ir
    // en useMemo — es impure según la regla react-hooks/purity). El ref se inicializa
    // con ceros y se rellena al montar / cuando cambia `count`; como el settle tarda
    // 420ms, los delays están listos mucho antes de que arranque la animación.
    const delaysRef = useRef<Float32Array>(new Float32Array(count));
    useLayoutEffect(() => {
        const buf = new Float32Array(count);
        for (let k = 0; k < count; k++) buf[k] = Math.random();
        delaysRef.current = buf;
    }, [count]);

    useLayoutEffect(() => {
        if (meshRef.current) {
            // Inicializar matriz de colores
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
        }
    }, [count]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight + 200) {
                isVisibleRef.current = false;
            } else {
                isVisibleRef.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame((state) => {
        if (!meshRef.current || !isVisibleRef.current) return;

        const time = state.clock.getElapsedTime() * 0.5; // Velocidad de la onda
        const { pointer, viewport } = state;

        // Mouse en coordenadas de mundo aproximadas
        const mx = (pointer.x * viewport.width) / 2;
        const my = (pointer.y * viewport.height) / 2;

        // Driver de la coreografía (0..1). Sin progress → comportamiento original.
        const p = progress ? progress.get() : null;
        const spacing =
            p !== null
                ? THREE.MathUtils.lerp(DOT_SPACING_SPARSE, DOT_SPACING_FINAL, p)
                : DOT_SPACING_FINAL;
        const offsetX = p !== null ? THREE.MathUtils.lerp(0, viewport.width * 0.25, p) : 0;

        baseGrid.forEach((cell, i) => {
            const x = cell.gx * spacing + offsetX;
            const y = cell.gy * spacing;
            let z = cell.z;

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
            let scaleFactor = 1 + (waveZ * 0.2);

            // CULL POR ESCALA: al condensarse a la derecha (p→1), los puntos con x
            // fuera de la mitad derecha se escalan a 0 con ramp suave (sin pop).
            // p=0 → sin cull (full-screen). x<=0 → oculto a p=1; ramp en [0, BAND].
            if (p !== null) {
                const edge = THREE.MathUtils.smoothstep(x, 0, DOT_CULL_BAND);
                scaleFactor *= THREE.MathUtils.lerp(1, edge, p);
            }

            // REVEAL ALEATORIO (revealProgress): factor por instancia (0→1), cada
            // punto tiene un delay random → pinchan en orden random, casi instantáneo.
            // Sin revealProgress (default undefined) → factor 1 = back-compat intacto.
            if (revealProgress !== undefined) {
                const rv = revealProgress.get();
                const d = delaysRef.current[i] ?? 0;
                const revealFactor = THREE.MathUtils.smoothstep(
                    rv,
                    d * REVEAL_SPREAD,
                    d * REVEAL_SPREAD + REVEAL_RAMP,
                );
                scaleFactor *= revealFactor;
            }

            dummy.scale.setScalar(scaleFactor);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // COLOR DINÁMICO
            // Claro en el fondo, Oscuro en la cresta de la ola (Para Light Mode)
            const intensity = (waveZ + 1.5) / 3; // Normalizar aprox 0 a 1
            color.setHex(0xd4d4d8).lerp(DOT_COLOR_CREST, intensity + mouseInfluence * 0.5);

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

export function DotMatrix() {
    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            dpr={[1, 2]} // Optimize for retina displays while limiting max resolution
            gl={{ alpha: true, antialias: true }}
            style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <DotMatrixMesh />
        </Canvas>
    )
}

export default DotMatrix;

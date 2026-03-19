"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

// Nota para el dev: 
// Existe una posible advertencia/rompimiento de compatibilidad entre @react-three/fiber v8+ y React 19 
// con respecto al manejo de Suspense y Tipados. Directiva 'use client' estricta y uso de dependencias 19 preventivas.

// --- SHADER MATERIAL FOR AURORA ---
const vertexShaderAurora = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderAurora = `
  uniform float uTime;
  varying vec2 vUv;

  float random (in vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm (in vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  void main() {
      vec2 st = vUv * 3.0;
      vec2 q = vec2(0.0);
      q.x = fbm(st + 0.0 * uTime);
      q.y = fbm(st + vec2(1.0));

      vec2 r = vec2(0.0);
      r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
      r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

      float f = fbm(st + r);

      // Colores: #0a0a2e -> #0d1b4b -> #00e5ff
      vec3 color1 = vec3(0.039, 0.039, 0.180);
      vec3 color2 = vec3(0.051, 0.106, 0.294);
      vec3 color3 = vec3(0.0, 0.898, 1.0);

      vec3 color = mix(color1, color2, clamp(length(q), 0.0, 1.0));
      color = mix(color, color3, clamp(length(r.x), 0.0, 1.0));

      gl_FragColor = vec4((f * f * f + 0.6 * f * f + 0.5 * f) * color, 0.35);
  }
`;

const AuroraMesh = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh position={[0, 0, -3]}>
            <planeGeometry args={[20, 10]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShaderAurora}
                fragmentShader={fragmentShaderAurora}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
};

// --- PARTICLES ---
const Particles = () => {
    const count = 120;
    const pointsRef = useRef<THREE.Points>(null);
    const { camera } = useThree();

    const mouse = useRef(new THREE.Vector2(-999, -999));

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const { positions, colors, sizes, particleData } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const siz = new Float32Array(count);
        const data = [];

        const colorA = new THREE.Color("#00e5ff");
        const colorB = new THREE.Color("#7b2fff");

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 15;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() * 4) - 2; // z=[-2, 2]

            siz[i] = Math.random() * 2 + 1;

            const mixFactor = Math.max(0, Math.min(1, (y + 5) / 10));
            const c = colorA.clone().lerp(colorB, mixFactor);
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            data.push({
                baseX: x,
                baseY: y,
                speed: Math.random() * 0.5 + 0.1,
                seed: Math.random() * Math.PI * 2,
                x, y, z
            });
        }
        return { positions: pos, colors: col, sizes: siz, particleData: data };
    }, [count]);

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 }
        },
        vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        void main() {
            vColor = customColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
        fragmentShader: `
        varying vec3 vColor;
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0);
        }
    `
    }), []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.elapsedTime;

        const vector = new THREE.Vector3(mouse.current.x, mouse.current.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pointerPos = camera.position.clone().add(dir.multiplyScalar(distance));

        const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const p = particleData[i];

            const targetY = p.baseY + Math.sin(time * p.speed + p.seed) * 0.5;
            const targetX = p.baseX + Math.cos(time * p.speed * 0.8 + p.seed) * 0.2;

            const dx = p.x - pointerPos.x;
            const dy = p.y - pointerPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let pushX = 0;
            let pushY = 0;

            if (dist < 0.8) {
                const force = (0.8 - dist) / 0.8;
                pushX = (dx / dist) * force * 1.5;
                pushY = (dy / dist) * force * 1.5;
            }

            p.x += (targetX + pushX - p.x) * 0.05;
            p.y += (targetY + pushY - p.y) * 0.05;

            positionsArray[i * 3] = p.x;
            positionsArray[i * 3 + 1] = p.y;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-customColor" args={[colors, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={shaderArgs.vertexShader}
                fragmentShader={shaderArgs.fragmentShader}
                transparent={true}
            />
        </points>
    );
};

import { motion } from "framer-motion";

export default function HeroBackground() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50">
            {/* Task 1: Film Grain Layer */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                 style={{ 
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                 }} 
            />

            {/* Task 2: Technical Grid with Animation (Light Mode Adjusted) */}
            <motion.div 
                animate={{ translateY: [0, 64] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" 
            />

            <Canvas
                dpr={[1, 1.5]}
                frameloop="always"
                camera={{ position: [0, 0, 5], fov: 75 }}
                gl={{ antialias: false, alpha: true }}
            >
                <AuroraMesh />
                <Particles />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.2} intensity={0.4} />
                </EffectComposer>
            </Canvas>
        </div>
    );
}

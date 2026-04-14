"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";

type QualityMode = "low" | "balanced" | "high";

type QualityConfig = {
    showCanvas: boolean;
    dpr: [number, number];
    gridAnimated: boolean;
    auroraSpeed: number;
    particleCount: number;
    particleFps: number;
};

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

  float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 st = vUv * 2.85;
    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.0 * uTime);
    q.y = fbm(st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(st + q + vec2(1.7, 9.2) + 0.12 * uTime);
    r.y = fbm(st + q + vec2(8.3, 2.8) + 0.1 * uTime);

    float f = fbm(st + r);

    vec3 color1 = vec3(0.012, 0.024, 0.055);
    vec3 color2 = vec3(0.024, 0.067, 0.145);
    vec3 color3 = vec3(0.122, 0.482, 0.745);

    vec3 color = mix(color1, color2, clamp(length(q), 0.0, 1.0));
    color = mix(color, color3, clamp(abs(r.x), 0.0, 1.0));

    gl_FragColor = vec4((f * f * f + 0.56 * f * f + 0.44 * f) * color, 0.14);
  }
`;

const AuroraMesh = ({ speed }: { speed: number }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed;
        }
    });

    return (
        <mesh position={[0, 0, -3]}>
            <planeGeometry args={[42, 23]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShaderAurora}
                fragmentShader={fragmentShaderAurora}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
};

const hash01 = (index: number, seed: number) => {
    const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
    return value - Math.floor(value);
};

const Particles = ({ count, fps }: { count: number; fps: number }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const frameAccumulator = useRef(0);

    const { positions, colors, sizes, baseX, baseY, speed, phase } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const siz = new Float32Array(count);
        const xBase = new Float32Array(count);
        const yBase = new Float32Array(count);
        const spd = new Float32Array(count);
        const ph = new Float32Array(count);

        const colorA = new THREE.Color("#3cb7ef");
        const colorB = new THREE.Color("#6c63ff");

        for (let i = 0; i < count; i++) {
            const x = (hash01(i, 1) - 0.5) * 15;
            const y = (hash01(i, 2) - 0.5) * 10;
            const z = hash01(i, 3) * 4 - 2;
            const mix = Math.max(0, Math.min(1, (y + 5) / 10));
            const c = colorA.clone().lerp(colorB, mix);

            xBase[i] = x;
            yBase[i] = y;
            spd[i] = 0.1 + hash01(i, 4) * 0.5;
            ph[i] = hash01(i, 5) * Math.PI * 2;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;

            siz[i] = 0.4 + hash01(i, 6) * 0.8;
        }

        return { positions: pos, colors: col, sizes: siz, baseX: xBase, baseY: yBase, speed: spd, phase: ph };
    }, [count]);

    const shaders = useMemo(
        () => ({
            vertex: `
                attribute float size;
                attribute vec3 customColor;
                varying vec3 vColor;
                void main() {
                    vColor = customColor;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (150.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragment: `
                varying vec3 vColor;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    gl_FragColor = vec4(vColor, 0.46);
                }
            `,
        }),
        []
    );

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        frameAccumulator.current += delta;
        const step = 1 / fps;
        if (frameAccumulator.current < step) return;
        frameAccumulator.current = 0;

        const t = state.clock.elapsedTime;
        const positionAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const arr = positionAttr.array as Float32Array;

        for (let i = 0; i < count; i++) {
            arr[i * 3] = baseX[i] + Math.cos(t * speed[i] * 0.8 + phase[i]) * 0.2;
            arr[i * 3 + 1] = baseY[i] + Math.sin(t * speed[i] + phase[i]) * 0.5;
        }

        positionAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-customColor" args={[colors, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial vertexShader={shaders.vertex} fragmentShader={shaders.fragment} transparent />
        </points>
    );
};

export default function HeroBackground() {
    const prefersReducedMotion = useReducedMotion();
    const [viewportWidth, setViewportWidth] = useState(1366);
    const [deviceCores, setDeviceCores] = useState(8);
    const [deviceMemory, setDeviceMemory] = useState(8);

    useEffect(() => {
        const setMetrics = () => {
            setViewportWidth(window.innerWidth);
            const nav = navigator as Navigator & { hardwareConcurrency?: number; deviceMemory?: number };
            setDeviceCores(nav.hardwareConcurrency ?? 8);
            setDeviceMemory(nav.deviceMemory ?? 8);
        };

        setMetrics();
        window.addEventListener("resize", setMetrics, { passive: true });
        return () => window.removeEventListener("resize", setMetrics);
    }, []);

    const mode: QualityMode = useMemo(() => {
        if (prefersReducedMotion) return "low";
        if (viewportWidth < 768) return "low";

        const lowPower = deviceCores <= 6 || deviceMemory <= 6;
        if (lowPower || viewportWidth < 1400) return "balanced";
        return "high";
    }, [prefersReducedMotion, viewportWidth, deviceCores, deviceMemory]);

    const quality = useMemo<QualityConfig>(() => {
        if (mode === "low") {
            return {
                showCanvas: false,
                dpr: [0.75, 0.9],
                gridAnimated: false,
                auroraSpeed: 0.55,
                particleCount: 0,
                particleFps: 18,
            };
        }

        if (mode === "balanced") {
            return {
                showCanvas: true,
                dpr: [0.75, 1],
                gridAnimated: false,
                auroraSpeed: 0.68,
                particleCount: 56,
                particleFps: 24,
            };
        }

        return {
            showCanvas: true,
            dpr: [0.9, 1.2],
            gridAnimated: true,
            auroraSpeed: 0.9,
            particleCount: 64,
            particleFps: 30,
        };
    }, [mode]);

    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#040914]">
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
                }}
            />

            {quality.gridAnimated ? (
                <motion.div
                    animate={{ translateY: [0, 48] }}
                    transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
                    className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
                />
            ) : (
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.014)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.014)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            )}

            {quality.showCanvas ? (
                <Canvas
                    dpr={quality.dpr}
                    frameloop="always"
                    camera={{ position: [0, 0, 5], fov: 75 }}
                    gl={{ antialias: false, alpha: true, powerPreference: "low-power", precision: "mediump" }}
                    performance={{ min: 0.45 }}
                >
                    <AuroraMesh speed={quality.auroraSpeed} />
                    {quality.particleCount > 0 && <Particles count={quality.particleCount} fps={quality.particleFps} />}
                </Canvas>
            ) : (
                <>
                    <motion.div
                        className="absolute -left-20 top-[-8%] h-[58%] w-[70%] rounded-full blur-[80px]"
                        animate={{ opacity: [0.35, 0.55, 0.35] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.32) 0%, transparent 68%)" }}
                    />
                    <motion.div
                        className="absolute right-[-14%] top-[16%] h-[52%] w-[66%] rounded-full blur-[86px]"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
                        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.28) 0%, transparent 70%)" }}
                    />
                </>
            )}
        </div>
    );
}

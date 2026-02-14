'use client';

import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Sphere, Float, Environment } from '@react-three/drei';
import { EffectComposer as EffectComposerOriginal, Bloom, ChromaticAberration, Vignette, SMAA } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
const EffectComposer = EffectComposerOriginal as any;
import { EnergyField } from './EnergyField';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
// Custom GLSL Shader: Liquid Metal Material
// ─────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uThinking;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;

//
// Simplex 3D Noise (Ashima Arts)
// https://github.com/ashima/webgl-noise
//
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // Multi-octave noise displacement (3 layers)
    float thinkingMult = mix(1.0, 2.5, uThinking);
    float speed = mix(0.4, 1.2, uThinking);

    // Octave 1: Large-scale organic deformation
    float noise1 = snoise(position * 1.2 + uTime * speed * 0.3) * 0.25;
    // Octave 2: Medium-scale surface detail
    float noise2 = snoise(position * 2.8 + uTime * speed * 0.5) * 0.12;
    // Octave 3: Fine-grain micro-turbulence  
    float noise3 = snoise(position * 5.5 + uTime * speed * 0.8) * 0.06;

    float totalDisplacement = (noise1 + noise2 + noise3) * uIntensity * thinkingMult;

    vDisplacement = totalDisplacement;

    vec3 displaced = position + normal * totalDisplacement;

    vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uThinking;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uAccent;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying float vDisplacement;

void main() {
    // View direction for Fresnel
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    // Fresnel rim lighting (stronger at edges)
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 3.0);

    // Displacement-based color mixing: dark base → lighter when deformed
    float displacementFactor = smoothstep(-0.15, 0.3, vDisplacement);
    vec3 baseColor = mix(uColor1, uColor2, displacementFactor);

    // Iridescent accent on peaks
    float peakFactor = smoothstep(0.15, 0.35, vDisplacement);
    // Shift hue slightly over time for iridescence
    float iridescence = sin(vDisplacement * 12.0 + uTime * 1.5) * 0.5 + 0.5;
    vec3 iridescentColor = mix(uAccent, uAccent * vec3(0.7, 1.0, 1.3), iridescence);
    baseColor = mix(baseColor, iridescentColor, peakFactor * 0.7);

    // Metallic specularity
    float metalness = 0.9;
    vec3 lightDir = normalize(vec3(5.0, 5.0, 5.0));
    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(vNormal, halfDir), 0.0), 64.0) * metalness;

    // Diffuse lighting
    float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;

    // Compose final color
    vec3 color = baseColor * diffuse;
    color += specular * mix(vec3(1.0), uAccent, 0.3);

    // Fresnel rim glow (cyan tinted)
    float fresnelThinking = mix(0.4, 1.0, uThinking);
    color += fresnel * uAccent * fresnelThinking * 0.6;

    // Subtle ambient glow when thinking
    color += uAccent * uThinking * 0.05;

    gl_FragColor = vec4(color, 1.0);
}
`;

// ─────────────────────────────────────────────────────────
// ShaderMaterial class definition + R3F registration
// ─────────────────────────────────────────────────────────

class LiquidMetalMaterial extends THREE.ShaderMaterial {
    constructor() {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uIntensity: { value: 1.0 },
                uThinking: { value: 0.0 },
                uColor1: { value: new THREE.Color('#09090b') },
                uColor2: { value: new THREE.Color('#1e293b') },
                uAccent: { value: new THREE.Color('#00ffff') },
            },
        });
    }
}

extend({ LiquidMetalMaterial });

// TypeScript declaration for JSX usage
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module '@react-three/fiber' {
    interface ThreeElements {
        liquidMetalMaterial: any;
    }
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

interface NeuroAvatarProps {
    isThinking?: boolean;
}

function TesseractCore({ isThinking }: { isThinking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Smooth rotation (more cinematic speeds)
        const rotationSpeed = isThinking ? 0.3 : 0.05;
        meshRef.current.rotation.x += rotationSpeed * delta;
        meshRef.current.rotation.y += rotationSpeed * delta * 0.7;
        meshRef.current.rotation.z += rotationSpeed * delta * 0.5;

        // Scale animation with smooth lerp transitions
        const currentScale = meshRef.current.scale.x;
        let targetScale = hovered ? 1.1 : 1.0;
        if (isThinking) {
            targetScale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
        }
        meshRef.current.scale.setScalar(
            THREE.MathUtils.lerp(currentScale, targetScale, delta * 4)
        );

        // Update shader uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

            // Smooth thinking transition (lerp 0.0 → 1.0)
            const currentThinking = materialRef.current.uniforms.uThinking.value;
            const targetThinking = isThinking ? 1.0 : 0.0;
            materialRef.current.uniforms.uThinking.value = THREE.MathUtils.lerp(
                currentThinking,
                targetThinking,
                delta * 2.0
            );

            // Smooth intensity transition (lerp 0.3 → 0.7)
            const currentIntensity = materialRef.current.uniforms.uIntensity.value;
            const targetIntensity = isThinking ? 0.7 : 0.3;
            materialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
                currentIntensity,
                targetIntensity,
                delta * 2.0
            );
        }

        // Inner core animation
        if (innerCoreRef.current) {
            const corePulse = isThinking
                ? 0.3 + Math.sin(state.clock.elapsedTime * 5) * 0.15
                : 0.2;
            innerCoreRef.current.scale.setScalar(corePulse);
            innerCoreRef.current.rotation.x += (isThinking ? 0.08 : 0.02) * delta * 60;
            innerCoreRef.current.rotation.y += (isThinking ? 0.06 : 0.015) * delta * 60;
        }
    });

    return (
        <group>
            <Sphere
                ref={meshRef}
                args={[1, 128, 128]}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <liquidMetalMaterial ref={materialRef} attach="material" />
            </Sphere>

            <mesh ref={innerCoreRef} visible={isThinking}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshBasicMaterial
                    color="#00ffff"
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

// ─────────────────────────────────────────────────────────
// Cinematic Lighting System
// ─────────────────────────────────────────────────────────

function CinematicLights({ isThinking }: { isThinking: boolean }) {
    const keyLightRef = useRef<THREE.PointLight>(null);
    const accentLightRef = useRef<THREE.PointLight>(null);

    useFrame((state, delta) => {
        // Key light: intensity lerps 8 → 20 when thinking
        if (keyLightRef.current) {
            const targetIntensity = isThinking ? 20 : 8;
            keyLightRef.current.intensity = THREE.MathUtils.lerp(
                keyLightRef.current.intensity,
                targetIntensity,
                delta * 3
            );
        }

        // Accent light: orbits circularly around the subject
        if (accentLightRef.current) {
            const time = state.clock.elapsedTime;
            accentLightRef.current.position.x = Math.sin(time * 0.5) * 4;
            accentLightRef.current.position.z = Math.cos(time * 0.5) * 4;
            accentLightRef.current.position.y = 2 + Math.sin(time * 0.3) * 0.5;

            // Intensity pulses more when thinking
            const targetAccent = isThinking ? 8 : 4;
            accentLightRef.current.intensity = THREE.MathUtils.lerp(
                accentLightRef.current.intensity,
                targetAccent,
                delta * 3
            );
        }
    });

    return (
        <group>
            {/* Ambient Base */}
            <ambientLight intensity={0.3} color="#1a1a2e" />

            {/* Key Light - Main cyan illumination */}
            <pointLight
                ref={keyLightRef}
                position={[3, 3, 3]}
                intensity={8}
                color="#22d3ee"
                decay={2}
            />

            {/* Fill Light - Indigo counter-balance */}
            <pointLight
                position={[-3, 1, -2]}
                intensity={3}
                color="#6366f1"
                decay={2}
            />

            {/* Accent Light - Orbiting magenta highlight */}
            <pointLight
                ref={accentLightRef}
                position={[4, 2, 0]}
                intensity={4}
                color="#c026d3"
                decay={2}
            />

            {/* Directional - Subtle top-down fill */}
            <directionalLight
                position={[5, 5, 5]}
                intensity={0.5}
                color="#ffffff"
            />
        </group>
    );
}

// ─────────────────────────────────────────────────────────
// useVisibility - IntersectionObserver for render gating
// ─────────────────────────────────────────────────────────

function useVisibility(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

export function NeuroAvatar({ isThinking = false }: NeuroAvatarProps) {
    const { ref: containerRef, isVisible } = useVisibility(0.1);

    return (
        /* 
         * FIX: Added overflow-hidden and rounded-full to the main container.
         * This physically forces any square artifacts into a circular shape, 
         * making them invisible against the background.
         */
        <div
            ref={containerRef}
            className="fixed bottom-0 right-0 z-[100] w-72 h-72 pointer-events-none flex items-center justify-center translate-x-12 translate-y-12 overflow-hidden rounded-full"
            aria-label="AI Assistant Avatar"
        >
            {/* 3D Canvas */}
            <Canvas
                className="pointer-events-auto cursor-pointer"
                style={{ background: 'transparent' }}
                camera={{ position: [0, 0, 6], fov: 45 }}
                frameloop={isVisible ? 'always' : 'demand'}
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                gl={{
                    alpha: true,
                    antialias: true,
                    stencil: false,
                    depth: true,
                    premultipliedAlpha: false,
                    powerPreference: 'high-performance',
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                <CinematicLights isThinking={isThinking} />
                <Environment preset="city" />

                <Float
                    speed={isThinking ? 6 : 1.5}
                    rotationIntensity={isThinking ? 2 : 0.8}
                    floatIntensity={isThinking ? 2 : 1}
                >
                    <TesseractCore isThinking={isThinking} />
                    <EnergyField isThinking={isThinking} />
                </Float>

                {/* 
                 * FIX: multisampling={0} is critical for post-processing transparency.
                 * Also ensured only one EffectComposer exists.
                 */
                }
                <EffectComposer multisampling={0} disableNormalPass>
                    <SMAA />
                    <Bloom
                        luminanceThreshold={0.9}
                        mipmapBlur
                        intensity={isThinking ? 1.2 : 0.6}
                        radius={0.8}
                        levels={9}
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.0002, 0.0002) as any}
                    />
                    <Vignette
                        blendFunction={BlendFunction.NORMAL}
                        offset={0.3}
                        darkness={0.6}
                    />
                </EffectComposer>
            </Canvas>

            {/* Status indicator dot */}
            <div className="absolute top-1/4 right-1/4 z-10 pointer-events-none">
                <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${isThinking
                        ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50'
                        : 'bg-zinc-600'
                        }`}
                />
            </div>

            {/* Tooltip on hover */}
            <div className="absolute -top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-zinc-900/95 backdrop-blur-sm text-zinc-100 px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-zinc-700/50 shadow-xl">
                    {isThinking ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            Pensando...
                        </span>
                    ) : (
                        'Logic AI Assistant'
                    )}
                </div>
            </div>
        </div>
    );
}

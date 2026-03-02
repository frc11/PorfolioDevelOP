'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import { EffectComposer as EffectComposerOriginal, Bloom, ChromaticAberration, Vignette, SMAA, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
const EffectComposer = EffectComposerOriginal as any;
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface NeuroAvatarProps {
    isThinking?: boolean;
    messages?: any[];
}

// ─────────────────────────────────────────────────────────
// Global ref for streaming pulse (0 to 1) 
// ─────────────────────────────────────────────────────────
const streamPulseRef = { current: 0 };

// ─────────────────────────────────────────────────────────
// Phase 8: Luxurious Tri-Color Palette
// ─────────────────────────────────────────────────────────
const PALETTE = {
    cyan: new THREE.Color('#06b6d4'),
    violet: new THREE.Color('#7c3aed'),
    emerald: new THREE.Color('#059669'),
    frantic: new THREE.Color('#8b5cf6'),
};

/**
 * Calculates a slow, elegant color cycle (Cyan -> Violet -> Emerald -> Cyan)
 * Uses lerpHSL to ensure high saturation is maintained (prevents gray mud).
 * @param time Elapsed time in seconds
 * @param result Target THREE.Color to mutate
 */
function applyLuxuriousColor(time: number, result: THREE.Color) {
    // 30 second full cycle (10 seconds per phase)
    const cycle = (time * 0.1) % 3.0;

    // Ease in-out sine wave translation for silky smooth transitions
    if (cycle < 1) {
        const t = (1 - Math.cos(cycle * Math.PI)) / 2;
        result.copy(PALETTE.cyan).lerpHSL(PALETTE.violet, t);
    } else if (cycle < 2) {
        const t = (1 - Math.cos((cycle - 1) * Math.PI)) / 2;
        result.copy(PALETTE.violet).lerpHSL(PALETTE.emerald, t);
    } else {
        const t = (1 - Math.cos((cycle - 2) * Math.PI)) / 2;
        result.copy(PALETTE.emerald).lerpHSL(PALETTE.cyan, t);
    }
}

// ─────────────────────────────────────────────────────────
// GLSL: Simplex 3D Noise (Ashima Arts) — injected into onBeforeCompile
// ─────────────────────────────────────────────────────────

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
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
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
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
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}
`;

// ─────────────────────────────────────────────────────────
// LiquidBlob — Refractive glass body with noise displacement
// Uses MeshPhysicalMaterial + onBeforeCompile for GLSL injection
// ─────────────────────────────────────────────────────────

function LiquidBlob({ isThinking }: { isThinking: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const shaderRef = useRef<any>(null);

    // Targets for smooth lerping
    const targetsRef = useRef({
        distort: 0.25,
        speed: 0.3,
        emissiveColor: new THREE.Color('#06b6d4'),
        scale: 1.0,
    });

    // Update targets reactively based on global state
    useFrame((state) => {
        const isStreaming = streamPulseRef.current > 0.05;
        // If thinking but NOT streaming, it means we are waiting for the API (Loading) --> frantic
        const isLoading = isThinking && !isStreaming;

        if (isLoading) {
            targetsRef.current.distort = 0.8;
            targetsRef.current.speed = 0.4;
            targetsRef.current.emissiveColor.copy(PALETTE.frantic); // Violet frantic thought
            targetsRef.current.scale = 0.8;
        } else if (isStreaming) {
            targetsRef.current.distort = 0.4;
            targetsRef.current.speed = 0.25;
            targetsRef.current.emissiveColor.copy(PALETTE.cyan); // Cyan stable during speech
            // Add a slight scale pop based on the text chunk arrival
            targetsRef.current.scale = 0.8 + (streamPulseRef.current * 0.05);
        } else {
            targetsRef.current.distort = 0.25;
            targetsRef.current.speed = 0.15;
            // Phase 8: Slow luxurious tri-color cycle when idle
            applyLuxuriousColor(state.clock.elapsedTime, targetsRef.current.emissiveColor);
            targetsRef.current.scale = 0.8;
        }
    });

    // Create the MeshPhysicalMaterial with onBeforeCompile to inject noise
    const material = useMemo(() => {
        const mat = new THREE.MeshPhysicalMaterial({
            // ── Glass/liquid properties ──
            transmission: 1.0,
            ior: 1.45,
            thickness: 2.5,
            roughness: 0.05,
            metalness: 0.0,    // Must be 0 for transmission to work in Three.js
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            iridescence: 1.0,
            iridescenceIOR: 1.3,
            // ── Color: subtle tint visible through glass ──
            color: new THREE.Color('#09090b'),
            emissive: new THREE.Color('#06b6d4'),
            emissiveIntensity: 0.4,
            // ── Reflections ──
            envMapIntensity: 2.0,
            // ── Rendering ──
            transparent: false,
            toneMapped: false,
            side: THREE.FrontSide,
        });

        mat.onBeforeCompile = (shader: any) => {
            // Inject custom uniforms
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uDistortStrength = { value: 0.25 };
            shader.uniforms.uSpeed = { value: 0.3 };

            // Inject noise functions + uniforms into vertex shader
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                ${NOISE_GLSL}
                uniform float uTime;
                uniform float uDistortStrength;
                uniform float uSpeed;
                varying vec3 vDisplacedNormal;
                `
            );

            // Inject vertex displacement after begin_vertex (where `transformed` is defined)
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>

                // FBM displacement along normal
                vec3 noisePos = position * 1.2 + uTime * uSpeed;
                float displacement = fbm(noisePos) * uDistortStrength;
                transformed += normal * displacement;

                // Approximate displaced normal for smooth reflections
                float eps = 0.01;
                vec3 tangent1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
                if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.001)
                    tangent1 = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
                vec3 bitangent1 = normalize(cross(normal, tangent1));

                float dT = fbm((position + tangent1 * eps) * 1.2 + uTime * uSpeed) * uDistortStrength;
                float dB = fbm((position + bitangent1 * eps) * 1.2 + uTime * uSpeed) * uDistortStrength;

                vec3 pT = (position + tangent1 * eps) + normal * dT;
                vec3 pB = (position + bitangent1 * eps) + normal * dB;

                objectNormal = normalize(cross(pT - transformed, pB - transformed));
                `
            );

            // Store reference for uniform updates
            shaderRef.current = shader;
        };

        return mat;
    }, []);

    // Animate uniforms every frame
    useFrame((state, delta) => {
        const targets = targetsRef.current;

        // Lerp physical scale target
        if (meshRef.current) {
            const trgScale = targets.scale;
            meshRef.current.scale.lerp(new THREE.Vector3(trgScale, trgScale, trgScale), delta * 15);
        }

        // Animate shader uniforms
        if (!shaderRef.current) return;
        const u = shaderRef.current.uniforms;

        u.uTime.value = state.clock.elapsedTime;
        u.uDistortStrength.value = THREE.MathUtils.lerp(
            u.uDistortStrength.value, targets.distort, delta * 2
        );
        u.uSpeed.value = THREE.MathUtils.lerp(
            u.uSpeed.value, targets.speed, delta * 2
        );

        // Animate material emissive color
        if (material) {
            material.emissive.lerp(targets.emissiveColor, delta * 4);
        }
    });

    return (
        <mesh ref={meshRef} material={material}>
            <icosahedronGeometry args={[1.1, 128]} />
        </mesh>
    );
}

// ─────────────────────────────────────────────────────────
// QuantumEyes — Emissive energy orbs INSIDE the body
// Their light refracts through the glass body
// ─────────────────────────────────────────────────────────

function AnatomicalEye({ isThinking }: { isThinking: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const leftGlowRef = useRef<THREE.Mesh>(null);
    const rightGlowRef = useRef<THREE.Mesh>(null);

    // Refs for dynamically coloring Iris and Glow without re-rendering
    const leftIrisMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const rightIrisMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const leftGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const rightGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);

    const leftOrbRef = useRef<THREE.Mesh>(null);
    const rightOrbRef = useRef<THREE.Mesh>(null);
    const [isBlinking, setIsBlinking] = useState(false);

    // Lógica estocástica de parpadeo orgánico
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            // Probabilidad aleatoria de parpadear (simula vida)
            if (Math.random() > 0.4) {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 150); // Duración del parpadeo rápido

                // Probabilidad de un segundo parpadeo rápido (doble parpadeo orgánico)
                if (Math.random() > 0.7) {
                    setTimeout(() => setIsBlinking(true), 300);
                    setTimeout(() => setIsBlinking(false), 450);
                }
            }
        }, Math.random() * 3000 + 2000); // Intervalo base entre 2 y 5 segundos

        return () => clearInterval(blinkInterval);
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;

        // ── 1. Seguimiento de Cursor con Inercia (Lerp) ──
        const targetRotY = state.pointer.x * 0.15;
        const targetRotX = -state.pointer.y * 0.15;

        // Lerp mega suave (factor 0.04) para dar sensación de deslizamiento lento y viscoso
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);

        // Slow look-around background motion (agrega micro-vida constante)
        const wanderSpeed = isThinking ? 1.5 : 0.3;
        const wanderX = Math.sin(time * wanderSpeed) * 0.03;
        const wanderY = Math.sin(time * wanderSpeed * 1.3 + 0.8) * 0.02;
        groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, wanderX, 0.1);
        groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, wanderY, 0.1);

        // ── 2. Respiración + Parpadeo en la Escala ──
        const breathe = Math.sin(time * 2.5) * 0.1 + 0.9;
        const isStreaming = streamPulseRef.current > 0.05;
        const isLoading = isThinking && !isStreaming;

        const thinkPulse = isLoading
            ? Math.sin(time * 8) * 0.2 + 0.8  // Rapid nervous pulsing
            : isStreaming
                ? breathe + (streamPulseRef.current * 0.15) // Pulse on text stream
                : breathe;

        // Si está pensando, hace un squint natural. Si parpadea, colapso cuántico a 0.05.
        const targetScaleY = isBlinking ? 0.05 : (isThinking ? 0.6 : thinkPulse);

        // Aplicamos lerp a la escala de los orbes
        if (leftOrbRef.current) {
            leftOrbRef.current.scale.y = THREE.MathUtils.lerp(leftOrbRef.current.scale.y, targetScaleY, isBlinking ? 0.6 : 0.15);
            leftOrbRef.current.scale.x = THREE.MathUtils.lerp(leftOrbRef.current.scale.x, thinkPulse, 0.1);
            leftOrbRef.current.scale.z = THREE.MathUtils.lerp(leftOrbRef.current.scale.z, thinkPulse, 0.1);
        }
        if (rightOrbRef.current) {
            rightOrbRef.current.scale.y = THREE.MathUtils.lerp(rightOrbRef.current.scale.y, targetScaleY, isBlinking ? 0.6 : 0.15);
            rightOrbRef.current.scale.x = THREE.MathUtils.lerp(rightOrbRef.current.scale.x, thinkPulse, 0.1);
            rightOrbRef.current.scale.z = THREE.MathUtils.lerp(rightOrbRef.current.scale.z, thinkPulse, 0.1);
        }

        // ── Glow halo pulse ──
        const glowPulse = Math.sin(time * 2.5 + 0.3) * 0.1 + 0.9;
        if (leftGlowRef.current) leftGlowRef.current.scale.setScalar(isThinking ? thinkPulse * 1.1 : glowPulse);
        if (rightGlowRef.current) rightGlowRef.current.scale.setScalar(isThinking ? thinkPulse * 1.1 : glowPulse);

        // ── Phase 8: Color Theory Sync ──
        // Keep eyes perfectly synchronized with the liquid body's color state
        const targetColor = new THREE.Color();
        if (isLoading) {
            targetColor.copy(PALETTE.frantic);
        } else if (isStreaming) {
            targetColor.copy(PALETTE.cyan);
        } else {
            applyLuxuriousColor(time, targetColor);
        }

        // Apply to Iris
        if (leftIrisMatRef.current) leftIrisMatRef.current.emissive.lerp(targetColor, 0.1);
        if (leftIrisMatRef.current) leftIrisMatRef.current.color.lerp(targetColor, 0.1);
        if (rightIrisMatRef.current) rightIrisMatRef.current.emissive.lerp(targetColor, 0.1);
        if (rightIrisMatRef.current) rightIrisMatRef.current.color.lerp(targetColor, 0.1);

        // Apply to Glow Halos
        if (leftGlowMatRef.current) leftGlowMatRef.current.color.lerp(targetColor, 0.1);
        if (rightGlowMatRef.current) rightGlowMatRef.current.color.lerp(targetColor, 0.1);
    });

    // Eyes positioned INSIDE the body
    // Adjusted proportionally for the new 1.1 radius body.
    const eyeSpacing = 0.18;
    const eyeY = 0.18;
    const eyeZ = 1.15; // Much closer to the surface of the 1.1 body
    const eyeRadius = 0.07; // Iris radius

    return (
        <group ref={groupRef}>
            {/* ── Left Anatomical Eye ── */}
            <group ref={leftOrbRef} position={[-eyeSpacing, eyeY, eyeZ]}>
                {/* CAPA 3: Córnea (Reflejos y Lente) */}
                <mesh>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshPhysicalMaterial
                        transmission={1}
                        thickness={0.2}
                        roughness={0}
                        metalness={0.2}
                        ior={1.5}
                        envMapIntensity={2}
                    />
                </mesh>
                {/* CAPA 2: Iris (Energía Cuántica) */}
                <mesh position={[0, 0, -0.01]}>
                    <sphereGeometry args={[0.07, 32, 32]} />
                    <meshStandardMaterial
                        ref={leftIrisMatRef}
                        color="#06b6d4"
                        emissive="#06b6d4"
                        emissiveIntensity={15}
                        toneMapped={false}
                    />
                </mesh>
                {/* CAPA 1: Pupila (Foco) */}
                <mesh position={[0, 0, 0.03]}>
                    <sphereGeometry args={[0.03, 32, 32]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>

                {/* Glow halo */}
                <mesh ref={leftGlowRef}>
                    <sphereGeometry args={[eyeRadius * 2.5, 24, 24]} />
                    <meshBasicMaterial
                        ref={leftGlowMatRef}
                        color={new THREE.Color('#06b6d4')}
                        transparent
                        opacity={0.08}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </mesh>
            </group>

            {/* ── Right Anatomical Eye ── */}
            <group ref={rightOrbRef} position={[eyeSpacing, eyeY, eyeZ]}>
                {/* CAPA 3: Córnea (Reflejos y Lente) */}
                <mesh>
                    <sphereGeometry args={[0.09, 32, 32]} />
                    <meshPhysicalMaterial
                        transmission={1}
                        thickness={0.2}
                        roughness={0}
                        metalness={0.2}
                        ior={1.5}
                        envMapIntensity={2}
                    />
                </mesh>
                {/* CAPA 2: Iris (Energía Cuántica) */}
                <mesh position={[0, 0, -0.01]}>
                    <sphereGeometry args={[0.07, 32, 32]} />
                    <meshStandardMaterial
                        ref={rightIrisMatRef}
                        color="#06b6d4"
                        emissive="#06b6d4"
                        emissiveIntensity={15}
                        toneMapped={false}
                    />
                </mesh>
                {/* CAPA 1: Pupila (Foco) */}
                <mesh position={[0, 0, 0.03]}>
                    <sphereGeometry args={[0.03, 32, 32]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>

                {/* Glow halo */}
                <mesh ref={rightGlowRef}>
                    <sphereGeometry args={[eyeRadius * 2.5, 24, 24]} />
                    <meshBasicMaterial
                        ref={rightGlowMatRef}
                        color={new THREE.Color('#06b6d4')}
                        transparent
                        opacity={0.08}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </mesh>
            </group>
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
        if (keyLightRef.current) {
            const targetIntensity = isThinking ? 20 : 8;
            keyLightRef.current.intensity = THREE.MathUtils.lerp(
                keyLightRef.current.intensity, targetIntensity, delta * 3
            );
        }
        if (accentLightRef.current) {
            const time = state.clock.elapsedTime;
            accentLightRef.current.position.x = Math.sin(time * 0.5) * 4;
            accentLightRef.current.position.z = Math.cos(time * 0.5) * 4;
            accentLightRef.current.position.y = 2 + Math.sin(time * 0.3) * 0.5;
            const targetAccent = isThinking ? 8 : 4;
            accentLightRef.current.intensity = THREE.MathUtils.lerp(
                accentLightRef.current.intensity, targetAccent, delta * 3
            );
        }
    });

    return (
        <group>
            <ambientLight intensity={0.4} color="#1a1a2e" />
            <pointLight ref={keyLightRef} position={[3, 3, 3]} intensity={8} color="#22d3ee" decay={2} />
            <pointLight position={[-3, 1, -2]} intensity={isThinking ? 6 : 3} color="#8b5cf6" decay={2} />
            <pointLight ref={accentLightRef} position={[4, 2, 0]} intensity={4} color="#c026d3" decay={2} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
        </group>
    );
}

// ─────────────────────────────────────────────────────────
// StreamController - Decoupled hook to listen to text chunks
// and update streamPulseRef without re-rendering Heavy Meshes
// ─────────────────────────────────────────────────────────

function StreamController({ messages }: { messages?: any[] }) {
    const lastLengthRef = useRef(0);

    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant') {
            const currentLength = lastMsg.content?.length || 0;
            const diff = currentLength - lastLengthRef.current;

            // If new text arrived, pop the pulse to 1.0 (creates a shockwave)
            if (diff > 0) {
                streamPulseRef.current = 1.0;
            }
            lastLengthRef.current = currentLength;
        } else {
            lastLengthRef.current = 0;
            streamPulseRef.current = 0;
        }
    }, [messages]);

    useFrame((_, delta) => {
        // Decay the pulse back to 0 quickly
        if (streamPulseRef.current > 0) {
            streamPulseRef.current = THREE.MathUtils.lerp(streamPulseRef.current, 0, delta * 10);
            if (streamPulseRef.current < 0.01) streamPulseRef.current = 0;
        }
    });

    return null;
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

// ─────────────────────────────────────────────────────────
// Exported NeuroAvatar
// ─────────────────────────────────────────────────────────

export function NeuroAvatar({ isThinking = false, messages = [] }: NeuroAvatarProps) {
    const { ref: containerRef, isVisible } = useVisibility(0.1);

    return (
        <div
            ref={containerRef}
            className="fixed bottom-0 right-0 z-[100] w-72 h-72 pointer-events-none flex items-center justify-center translate-x-12 translate-y-12"
            aria-label="AI Assistant Avatar"
        >
            <Canvas
                className="pointer-events-auto cursor-pointer"
                style={{ background: 'transparent', pointerEvents: 'auto' }} // Crucial: Allow clicking the canvas itself for toggleChat
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                frameloop={isVisible ? 'always' : 'demand'}
                dpr={[1, 2]}
                performance={{ min: 0.5 }}
                gl={{
                    alpha: true,
                    depth: true,
                    premultipliedAlpha: false,
                    powerPreference: 'high-performance',
                }}
            >
                <CinematicLights isThinking={isThinking} />
                <Environment preset="city" />
                <StreamController messages={messages} />

                <Float
                    speed={isThinking ? 1.2 : 0.6}
                    rotationIntensity={isThinking ? 1.0 : 0.5}
                    floatIntensity={isThinking ? 1.5 : 1}
                >
                    {/* Order matters: eyes first, then glass body on top for refraction */}
                    <AnatomicalEye isThinking={isThinking} />
                    <LiquidBlob isThinking={isThinking} />
                </Float>

                <EffectComposer multisampling={0} disableNormalPass>
                    <SMAA />
                    <Bloom
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        height={300}
                        intensity={isThinking ? 3.0 : 2.0}
                        mipmapBlur
                    />
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={new THREE.Vector2(0.0015, 0.0015) as any}
                    />
                    <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
                    <Vignette
                        eskil={false}
                        blendFunction={BlendFunction.NORMAL}
                        offset={0.5}
                        darkness={0.4}
                    />
                </EffectComposer>
            </Canvas>
        </div>
    );
}

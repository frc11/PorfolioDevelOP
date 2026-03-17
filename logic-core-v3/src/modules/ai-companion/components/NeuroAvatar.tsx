'use client';

import React, { useRef, Suspense, useMemo, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, extend, ThreeElement } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, shaderMaterial } from '@react-three/drei';
import { motion, useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import {
    EffectComposer,
    Bloom,
    ChromaticAberration,
    Vignette,
    ToneMapping,
} from '@react-three/postprocessing';
import {
    BlendFunction,
    ToneMappingMode,
} from 'postprocessing';

// ─────────────────────────────────────────────────────────
// Error Boundary to prevent R3F crashes from taking down UI
// ─────────────────────────────────────────────────────────
class AvatarErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("NeuroAvatar R3F Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

// ─────────────────────────────────────────────────────────
// Custom Energy Field Shader Material
// ─────────────────────────────────────────────────────────
const EnergyFieldMaterial = shaderMaterial(
    {
        uTime: 0,
        uIntensity: 0.3,
        uColor: new THREE.Color(0x4488ff),
        uColorSecondary: new THREE.Color(0x8844ff),
    },
    `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uColor;
    uniform vec3 uColorSecondary;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
        float n = noise(vUv * 8.0 + uTime * 0.3);
        vec3 color = mix(uColor, uColorSecondary, fresnel + n * 0.2);
        float alpha = fresnel * uIntensity * (0.8 + n * 0.4);
        gl_FragColor = vec4(color, alpha);
    }
    `
);

extend({ EnergyFieldMaterial });

declare module '@react-three/fiber' {
    interface ThreeElements {
        energyFieldMaterial: ThreeElement<typeof EnergyFieldMaterial>;
    }
}

// ─────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────
export type AvatarPhase = 'dormant' | 'initializing' | 'stabilizing' | 'active';

interface NeuroAvatarProps {
    isThinking?: boolean;
    showPrompt?: boolean;
    isBooped?: boolean;
    isHovered?: boolean;
    isOpen?: boolean;
    phase?: AvatarPhase;
    scrollSection?: string;
}

const COLOR_IDLE = { emissive: 0x4488cc, pointLight: 0x6699dd, intensity: 4 };
const COLOR_THINKING = { emissive: 0x6644ff, pointLight: 0x8866ff, intensity: 8 };
const COLOR_OPEN = { emissive: 0x0099cc, pointLight: 0x00bbdd, intensity: 6 };
const COLOR_ROI = 0x44aa66;

const PARTICLE_COUNT = 120;

function generateOrbitalPositions(count: number, radius: number): Float32Array {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - (2 * i) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
}

// ─────────────────────────────────────────────────────────
// Internal Scene Component (Inside Canvas)
// ─────────────────────────────────────────────────────────
function AvatarSceneContent({ 
    isThinking = false, 
    showPrompt = false, 
    isBooped = false, 
    isHovered = false, 
    isOpen = false, 
    phase = 'active', 
    scrollSection,
    prefersReducedMotion = false
}: NeuroAvatarProps & { prefersReducedMotion: boolean }) {
    // ── Scene Refs ──
    const avatarGroupRef = useRef<THREE.Group>(null);
    const keyLightRef = useRef<THREE.PointLight>(null);
    const bloomRef = useRef<any>(null);
    const chromRef = useRef<any>(null);
    const energyFieldRef = useRef<any>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const outerSphereRef = useRef<THREE.Mesh>(null);
    const innerCoreRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    // ── Memoized Geometries ──
    const geometries = useMemo(() => ({
        outer: new THREE.SphereGeometry(1, 64, 64),
        inner: new THREE.IcosahedronGeometry(1, 4),
        ring: new THREE.TorusGeometry(1.2, 0.015, 8, 120),
        particles: generateOrbitalPositions(PARTICLE_COUNT, 1.4)
    }), []);

    // ── Animation Values ──
    const currentEmissive = useMemo(() => new THREE.Color(COLOR_IDLE.emissive), []);
    const roiColor = useMemo(() => new THREE.Color(COLOR_ROI), []);
    
    const scaleRef = useRef(phase === 'active' ? 1 : 0);
    const opacityRef = useRef(phase === 'active' ? 1 : 0);
    const distortionRef = useRef(phase === 'active' ? 0.1 : 0.8);
    const bloomPulseRef = useRef(0);
    const boopBurstRef = useRef(0);
    const audioPlayedRef = useRef(false);
    const bloomIntensityRef = useRef(0.6);
    const chromaticOffsetRef = useRef(0.0008);
    const thinkingIntensityRef = useRef(0);
    const rotationRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const boopState = useRef({ vx: 0, vy: 0, px: 0, py: 0 });

    useEffect(() => {
        if (!isBooped || prefersReducedMotion) return;
        boopState.current.vx = (Math.random() - 0.5) * 0.3;
        boopState.current.vy = 0.2;
        bloomPulseRef.current = 2.5; 
        boopBurstRef.current = 0.8;
    }, [isBooped, prefersReducedMotion]);

    const hasOpenedOnce = useRef(false);
    const celebrationOffsetRef = useRef(0);

    useEffect(() => {
        if (!isOpen || hasOpenedOnce.current) return;
        hasOpenedOnce.current = true;
        celebrationOffsetRef.current = 1.0;
        const timer = setTimeout(() => { celebrationOffsetRef.current = 0; }, 800);
        return () => clearTimeout(timer);
    }, [isOpen]);

    // ── Unified Frame Loop ──
    useFrame((state, delta) => {
        try {
            const t = state.clock.getElapsedTime();

            // 1. Physics (Boop)
            if (!prefersReducedMotion) {
                const b = boopState.current;
                b.vx += (0 - b.px) * 0.08;
                b.vy += (0 - b.py) * 0.08;
                b.vx *= 0.88;
                b.vy *= 0.88;
                b.px += b.vx;
                b.py += b.vy;
                if (avatarGroupRef.current) {
                    avatarGroupRef.current.position.x = b.px;
                    avatarGroupRef.current.position.y = b.py;
                }
                boopBurstRef.current = Math.max(0, boopBurstRef.current - delta * 2);
            }

            // 2. Lifecycle Phases
            if (phase === 'dormant') {
                scaleRef.current = 0; opacityRef.current = 0;
            } else if (phase === 'initializing') {
                scaleRef.current += (1 - scaleRef.current) * 0.025;
                opacityRef.current += (1 - opacityRef.current) * 0.02;
                distortionRef.current = 0.8;
            } else if (phase === 'stabilizing') {
                distortionRef.current += (0.1 - distortionRef.current) * 0.08;
                bloomPulseRef.current = Math.max(0, bloomPulseRef.current - 0.04);
                if (!audioPlayedRef.current) {
                    playActivationTone(); audioPlayedRef.current = true;
                    bloomPulseRef.current = 2.0;
                }
            } else {
                scaleRef.current = 1; opacityRef.current = 1;
                distortionRef.current = isThinking ? 0.4 : 0.1;
            }

            // 3. Gaze & Rotation
            const r = rotationRef.current;
            if (showPrompt) { r.ty = -0.3; r.tx = 0.2; }
            else if (isOpen) { r.ty = -0.5; r.tx = 0.1; }
            else { r.ty = state.pointer.x * 0.3; r.tx = -state.pointer.y * 0.2; }
            r.cy += (r.ty - r.cy) * 0.025;
            r.cx += (r.tx - r.cx) * 0.025;
            if (avatarGroupRef.current) {
                avatarGroupRef.current.rotation.y = r.cy;
                avatarGroupRef.current.rotation.x = r.cx;
            }

            // 4. Element Animations
            if (ringRef.current) {
                const ringSpeed = scrollSection === 'vault' ? 0.2 : 1.2;
                ringRef.current.rotation.z += delta * ringSpeed;
            }
            if (energyFieldRef.current) {
                energyFieldRef.current.uniforms.uTime.value = t;
                let targetInt = isThinking ? 0.8 : isHovered ? 0.6 : 0.25;
                if (scrollSection === 'comparador') targetInt += 0.2;
                energyFieldRef.current.uniforms.uIntensity.value += (targetInt - energyFieldRef.current.uniforms.uIntensity.value) * 0.03;
            }

            thinkingIntensityRef.current += ((isThinking ? 1 : 0) - thinkingIntensityRef.current) * 0.03;
            
            if (outerSphereRef.current) {
                outerSphereRef.current.rotation.y = t * -0.05;
                const breathe = scaleRef.current * (1 + Math.sin(t * 0.8) * 0.02 + thinkingIntensityRef.current * 0.08);
                outerSphereRef.current.scale.setScalar(breathe);
            }

            if (innerCoreRef.current) {
                let rotSpeedY = isThinking ? 0.3 : 0.08;
                if (scrollSection === 'vault') rotSpeedY *= 0.2;
                innerCoreRef.current.rotation.y = t * rotSpeedY;
                const coreS = THREE.MathUtils.lerp(innerCoreRef.current.scale.x, isThinking ? 0.55 : 0.45, 0.05) * scaleRef.current;
                innerCoreRef.current.scale.setScalar(coreS);
            }

            if (particlesRef.current) {
                let pSpeed = isThinking ? 2.5 : isHovered ? 1.5 : 1.0;
                if (scrollSection === 'vault') pSpeed *= 0.2;
                particlesRef.current.rotation.y = t * 0.15 * pSpeed;
                const celeb = celebrationOffsetRef.current > 0 ? (1 + Math.sin(t * 15) * 0.1) : 1;
                const disp = boopBurstRef.current;
                particlesRef.current.scale.setScalar(scaleRef.current * celeb + disp);
            }

            // 5. Lights & Colors
            const targetSet = isThinking ? COLOR_THINKING : isOpen ? COLOR_OPEN : COLOR_IDLE;
            const targetE = scrollSection === 'calculador' ? roiColor : new THREE.Color(targetSet.emissive);
            currentEmissive.lerp(targetE, 0.025);

            if (keyLightRef.current) {
                const targetP = scrollSection === 'calculador' ? roiColor : new THREE.Color(targetSet.pointLight);
                keyLightRef.current.color.lerp(targetP, 0.05);
                keyLightRef.current.intensity = THREE.MathUtils.lerp(keyLightRef.current.intensity, targetSet.intensity, 0.05);
            }

            // 6. Post-processing updates
            const bTarget = isThinking ? 1.8 : isHovered ? 1.2 : 0.6;
            const bBase = (scrollSection === 'comparador') ? bTarget + 0.3 : bTarget;
            bloomIntensityRef.current += (bBase - bloomIntensityRef.current) * 0.04;
            if (bloomRef.current) {
                bloomRef.current.intensity = (isMobile ? bloomIntensityRef.current * 0.5 : bloomIntensityRef.current) + bloomPulseRef.current;
            }

            const cTarget = isThinking ? 0.03 : isHovered ? 0.015 : 0.0008;
            chromaticOffsetRef.current += (cTarget - chromaticOffsetRef.current) * 0.04;
            if (chromRef.current && !isMobile && chromRef.current.offset) {
                try {
                    if (typeof chromRef.current.offset.set === 'function') {
                        chromRef.current.offset.set(chromaticOffsetRef.current, chromaticOffsetRef.current);
                    } else if (chromRef.current.offset.x !== undefined) {
                        chromRef.current.offset.x = chromaticOffsetRef.current;
                        chromRef.current.offset.y = chromaticOffsetRef.current;
                    }
                } catch {}
            }
        } catch (e) {
            // Silently catch frame errors to prevent crash loop, but log once
            if ((window as any).__v_errorCount === undefined) (window as any).__v_errorCount = 0;
            if ((window as any).__v_errorCount < 3) {
                console.error("Frame Error:", e);
                (window as any).__v_errorCount++;
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight ref={keyLightRef} position={[2, 3, 2]} intensity={4} color={COLOR_IDLE.pointLight} distance={10} decay={2} />
            <pointLight position={[-2, -1, -2]} intensity={2} color="#1a1a3a" distance={8} decay={2} />
            <pointLight position={[0, -2, -3]} intensity={3} color="#c8d8f0" distance={6} decay={2} />
            <Environment preset="studio" />

            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <group ref={avatarGroupRef}>
                    <group>
                        {/* Energy Aura */}
                        <mesh scale={1.15}>
                            <sphereGeometry args={[1, 32, 32]} />
                            <energyFieldMaterial ref={energyFieldRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
                        </mesh>
                        {/* Outer Shell */}
                        <mesh ref={outerSphereRef} geometry={geometries.outer}>
                            <MeshTransmissionMaterial transmission={0.95} thickness={0.8} roughness={0.05} ior={1.5} chromaticAberration={0.08} anisotropy={0.3} distortion={distortionRef.current} distortionScale={0.3} temporalDistortion={0.15} color={isThinking ? '#e0f0ff' : '#f0f8ff'} emissive={currentEmissive} emissiveIntensity={isThinking ? 0.6 : 0.2} transparent opacity={opacityRef.current * 0.85} />
                        </mesh>
                        {/* Inner Core */}
                        <mesh ref={innerCoreRef} geometry={geometries.inner} scale={0.45}>
                            <meshPhysicalMaterial color="#c8d8f0" metalness={0.95} roughness={0.05} reflectivity={1} envMapIntensity={3} emissive={currentEmissive} emissiveIntensity={isThinking ? 1.2 : 0.4} transparent opacity={opacityRef.current} />
                        </mesh>
                        {/* Ring */}
                        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} geometry={geometries.ring}>
                            <meshPhysicalMaterial color="#a0c0e8" metalness={1} roughness={0} emissive={currentEmissive} emissiveIntensity={isThinking ? 2 : 0.8} transparent opacity={opacityRef.current * 0.7} />
                        </mesh>
                        {/* Particles */}
                        <points ref={particlesRef}>
                            <bufferGeometry><bufferAttribute attach="attributes-position" args={[geometries.particles, 3]} /></bufferGeometry>
                            <pointsMaterial size={isThinking ? 0.025 : 0.015} color={isThinking ? '#9988ff' : '#88aacc'} transparent opacity={(isThinking ? 0.9 : 0.5) * opacityRef.current} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
                        </points>
                    </group>
                </group>
            </Float>

            <EffectComposer multisampling={prefersReducedMotion ? 0 : 4} enableNormalPass={false}>
                {/* mipmapBlur is disabled to prevent circular structure serialization in Next.js overlay */}
                <Bloom ref={bloomRef} intensity={0.6} luminanceThreshold={0.3} luminanceSmoothing={0.9} radius={0.6} blendFunction={BlendFunction.ADD} />
                {!isMobile && (
                    <ChromaticAberration ref={chromRef} offset={[0.0008, 0.0008]} blendFunction={BlendFunction.NORMAL} radialModulation={true} modulationOffset={0.5} />
                )}
                <Vignette offset={0.35} darkness={0.7} blendFunction={BlendFunction.NORMAL} />
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
        </>
    );
}

// ─────────────────────────────────────────────────────────
// Main Export (Wrapper with Canvas)
// ─────────────────────────────────────────────────────────
export function NeuroAvatar(props: NeuroAvatarProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <AvatarErrorBoundary fallback={<div className="w-64 h-64 bg-slate-900/20 backdrop-blur-3xl rounded-full border border-white/5 flex items-center justify-center"><p className="text-[10px] text-zinc-500">Avatar Offline</p></div>}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: props.phase !== 'dormant' ? 1 : 0 }}
                transition={{ duration: 1.2 }}
                className="fixed bottom-0 right-0 z-[100] w-64 h-64 pointer-events-none flex items-center justify-center translate-x-6 translate-y-6"
            >
                <Canvas
                    className="pointer-events-auto cursor-pointer"
                    style={{ background: 'transparent' }}
                    camera={{ position: [0, 0, 4.5], fov: 45 }}
                    gl={{ 
                        alpha: true, 
                        antialias: false, 
                        toneMapping: THREE.NoToneMapping,
                        outputColorSpace: THREE.SRGBColorSpace,
                        powerPreference: 'high-performance' 
                    }}
                >
                    <Suspense fallback={null}>
                        <AvatarSceneContent {...props} prefersReducedMotion={!!prefersReducedMotion} />
                    </Suspense>
                </Canvas>
            </motion.div>
        </AvatarErrorBoundary>
    );
}

function playActivationTone() {
    try {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 432; osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
}

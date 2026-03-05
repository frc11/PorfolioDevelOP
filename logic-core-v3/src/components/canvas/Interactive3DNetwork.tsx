'use client';
import { useMemo, useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { HyperText } from '@/components/ui/HyperText';

// --- Types ---
interface QualityNode {
    id: number;
    label: string;
    desc: string;
}

// --- Configuration ---
const PALETTE = ['#06b6d4', '#8b5cf6', '#10b981', '#f472b6', '#3b82f6'];

// --- Geometry & Math ---
const getSpherePoints = (count: number, radius: number) => {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
    }
    return points;
};

// --- VFX Components ---

const ShootingStar = ({ initialDelay }: { initialDelay: number }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const [started, setStarted] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initial delay logic
    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setStarted(true);
            resetPosition();
        }, initialDelay);
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [initialDelay]);

    const resetPosition = () => {
        if (!mesh.current) return;
        // Random start position far away
        const r = 40; // Distance
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        // Random direction roughly crossing the center or screen
        mesh.current.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );

        mesh.current.lookAt(0, 0, 0); // Aim at center
        // Add some offset so it doesn't just hit the dead center
        mesh.current.rotateX((Math.random() - 0.5) * 0.5);
        mesh.current.rotateY((Math.random() - 0.5) * 0.5);
    };

    useFrame((state, delta) => {
        if (!started || !mesh.current) return;

        const speed = 20; // Very fast
        mesh.current.translateZ(speed * delta);

        // Check if out of bounds (passed through)
        if (mesh.current.position.length() > 60) {
            setStarted(false);
            // Random interval before next shot
            const randomDelay = Math.random() * 5000 + 2000;
            timeoutRef.current = setTimeout(() => {
                setStarted(true);
                resetPosition();
            }, randomDelay);
        }
    });

    return (
        <mesh ref={mesh} visible={started}>
            {/* Long thin streak */}
            <boxGeometry args={[0.05, 0.05, 12]} />
            <meshBasicMaterial color="#ccfbf1" transparent opacity={0.4} />
        </mesh>
    );
};

const ShootingStarSystem = () => {
    return (
        <group>
            <ShootingStar initialDelay={1000} />
            <ShootingStar initialDelay={4000} />
            <ShootingStar initialDelay={7000} />
        </group>
    );
}

// --- Sub-Components ---

const Starfield = () => {
    const points = useMemo(() => {
        const p = [];
        const count = 2000;
        for (let i = 0; i < count; i++) {
            const r = 80 + Math.random() * 20;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            p.push(x, y, z);
        }
        return new Float32Array(p);
    }, []);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length / 3}
                    array={points}
                    itemSize={3}
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.6}
                color="#e0f2fe"
                transparent
                opacity={0.4}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
};

const QualityCard = ({ node, isOpen, color }: { node: QualityNode, isOpen: boolean, color: string }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                // Solid background (bg-zinc-950) to block content behind
                className="w-[280px] bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] origin-top mt-1 pointer-events-auto select-none text-left relative z-50"
                style={{ borderColor: `${color}60` }}
            >
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
                <h3 className="text-xl font-bold text-white mb-2" style={{ color }}>{node.label}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                    {node.desc}
                </p>
                {/* Decorative Tech Elements */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const CoreNodes = ({ points, qualities, onHoverChange }: { points: THREE.Vector3[], qualities: QualityNode[], onHoverChange: (hovering: boolean) => void }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handlePointerOver = (i: number) => {
        setHoveredIndex(i);
        onHoverChange(true);
    };

    const handlePointerOut = () => {
        setHoveredIndex(null);
        onHoverChange(false);
    };

    const defaultQualities = [
        "Innovation", "Security", "Cloud Native", "AI Core", "Logic"
    ];

    const nodeColors = useMemo(() => {
        return points.map((_, i) => PALETTE[i % PALETTE.length]);
    }, [points]);

    return (
        <group>
            {points.map((point, i) => {
                const isHovered = hoveredIndex === i;
                const quality = qualities[i] || {
                    id: 100 + i,
                    label: defaultQualities[i % defaultQualities.length],
                    desc: "System Architecture Node"
                };
                const color = nodeColors[i];

                return (
                    <group key={i} position={point}>
                        {/* The 3D Sphere */}
                        <Sphere
                            args={[0.35, 32, 32]}
                            scale={isHovered ? 1.5 : 1}
                            onPointerOver={(e) => { e.stopPropagation(); handlePointerOver(i); }}
                            onPointerOut={handlePointerOut}
                            onClick={() => handlePointerOver(i)} // Touch support
                        >
                            <meshStandardMaterial
                                color={isHovered ? color : "#ffffff"}
                                emissive={color}
                                emissiveIntensity={isHovered ? 3 : 1.2}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </Sphere>

                        {/* Floating HTML Annotation */}
                        <Html
                            as="div"
                            distanceFactor={20}
                            zIndexRange={[10, 0]}
                            style={{
                                pointerEvents: 'none',
                                transform: 'translate3d(0,0,0)',
                                zIndex: 10,
                                position: 'relative'
                            }}
                        >
                            {/* Flex container with select-none to prevent drag selection */}
                            <div className="flex flex-col items-center w-[175px]  pointer-events-none select-none">
                                <motion.span
                                    animate={{ opacity: isHovered ? 0 : 0.8, y: isHovered ? -5 : 0 }}
                                    className="bg-black/80 px-3 py-1 rounded-full text-[10px] font-mono text-white backdrop-blur-md mt-1 border border-white/10 uppercase tracking-widest whitespace-nowrap"
                                    style={{ borderColor: `${color}40`, textShadow: `0 0 10px ${color}` }}
                                >
                                    {quality.label}
                                </motion.span>

                                <div className="pointer-events-auto">
                                    <QualityCard node={quality} isOpen={isHovered} color={color} />
                                </div>
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

const DustNodes = ({ points }: { points: THREE.Vector3[] }) => (
    <group>
        {points.map((point, i) => (
            <Sphere key={i} position={point} args={[0.04, 8, 8]}>
                <meshBasicMaterial color="#ffffff" opacity={0.15} transparent />
            </Sphere>
        ))}
    </group>
);

const Connections = ({ points }: { points: THREE.Vector3[] }) => {
    const lines = useMemo(() => {
        const _lines = [];
        const threshold = 6;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dist = points[i].distanceTo(points[j]);
                if (dist < threshold) {
                    _lines.push({ start: points[i], end: points[j], opacity: 1 - dist / threshold });
                }
            }
        }
        return _lines;
    }, [points]);

    return (
        <group>
            {lines.map((l, i) => (
                <Line key={i} points={[l.start, l.end]} color="#ffffff" transparent opacity={l.opacity * 0.1} lineWidth={1} />
            ))}
        </group>
    );
};

const Scene = ({ qualities, onHoverChange }: { qualities: QualityNode[], onHoverChange: (v: boolean) => void }) => {
    const corePoints = useMemo(() => getSpherePoints(10, 5), []);
    const dustPoints = useMemo(() => getSpherePoints(200, 8), []);

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            <CoreNodes points={corePoints} qualities={qualities} onHoverChange={onHoverChange} />
            <DustNodes points={dustPoints} />
            <Connections points={[...corePoints, ...dustPoints.slice(0, 40)]} />
        </Float>
    );
};

// --- DESKTOP COMPONENT ---

const Interactive3DNetworkDesktop = ({ qualities, titleVisible, renderCanvas = true }: { qualities: QualityNode[], titleVisible?: boolean, renderCanvas?: boolean }) => {
    const [isHoveringNode, setIsHoveringNode] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInteractionStart = () => {
        setIsInteracting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleInteractionEnd = () => {
        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
        }, 3000);
    };

    const active = isInteracting || isHoveringNode;

    return (
        <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-0 bg-[#030712]">
            <motion.div
                className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center select-none"
                animate={{
                    y: active ? 250 : 0,
                    opacity: active ? 0.3 : 1,
                    scale: active ? 0.9 : 1,
                    zIndex: active ? 0 : 100
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase text-center drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                        <HyperText text="¿POR QUÉ DEVELOP?" persist={true} trigger={titleVisible} />
                    </h2>
                    <div className="flex gap-4 mt-6 opacity-80">
                        <p className="text-xs text-zinc-500 font-mono tracking-[0.5em] backdrop-blur-sm">[ NEURAL CORE ONLINE ]</p>
                        <p className="text-xs text-cyan-500 font-mono tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_cyan]">_ACTIVE</p>
                    </div>
                </div>
            </motion.div>

            {renderCanvas && (
                <Canvas camera={{ position: [0, 0, 24], fov: 40 }} gl={{ alpha: true, antialias: false, powerPreference: "high-performance", stencil: false, depth: false }} dpr={[1, 1.5]}>
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        rotateSpeed={0.5}
                        autoRotate={!isInteracting && !isHoveringNode}
                        autoRotateSpeed={0.5}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI}
                        onStart={handleInteractionStart}
                        onEnd={handleInteractionEnd}
                    />
                    <Suspense fallback={
                        <Html center>
                            <div className="flex flex-col items-center justify-center opacity-50">
                                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-cyan-500 text-[10px] font-mono mt-2 tracking-widest">INITIALIZING...</p>
                            </div>
                        </Html>
                    }>
                        <Starfield />
                        <ShootingStarSystem />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                        <Environment preset="city" />
                        <Scene qualities={qualities} onHoverChange={setIsHoveringNode} />
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
};


// --- MOBILE COMPONENTS ---

const CoreNodesMobile = ({ points, qualities, activeNode, setActiveNode }: { points: THREE.Vector3[], qualities: QualityNode[], activeNode: number | null, setActiveNode: (i: number | null) => void }) => {
    const defaultQualities = ["Innovation", "Security", "Cloud Native", "AI Core", "Logic"];
    const nodeColors = useMemo(() => points.map((_, i) => PALETTE[i % PALETTE.length]), [points]);

    return (
        <group>
            {points.map((point, i) => {
                const quality = qualities[i] || {
                    id: 100 + i,
                    label: defaultQualities[i % defaultQualities.length],
                    desc: "System Architecture Node"
                };
                const color = nodeColors[i];

                return (
                    <group key={i} position={point}>
                        {/* Visible Sphere - NO HITBOX SO FINGERS PASS THROUGH */}
                        <Sphere
                            args={[0.25, 32, 32]}
                        >
                            <meshStandardMaterial
                                color="#ffffff"
                                emissive={color}
                                emissiveIntensity={1.2}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </Sphere>

                        <Html
                            as="div"
                            distanceFactor={15}
                            zIndexRange={[10, 0]}
                            style={{
                                pointerEvents: 'none',
                                transform: 'translate3d(0,0,0)',
                                zIndex: 10,
                                position: 'relative'
                            }}
                        >
                            <div className="flex flex-col items-center w-[150px] pointer-events-none select-none">
                                <motion.span
                                    animate={{ opacity: 0.8, y: 0 }}
                                    className="bg-black/80 px-2 py-1 rounded-full text-[8px] font-mono text-white backdrop-blur-md mt-1 border border-white/10 uppercase tracking-widest whitespace-nowrap"
                                    style={{ borderColor: `${color}40`, textShadow: `0 0 10px ${color}` }}
                                >
                                    {quality.label}
                                </motion.span>
                                {/* Removed the interactive QualityCard for mobile entirely as requested */}
                            </div>
                        </Html>
                    </group>
                );
            })}
        </group>
    );
};

const SceneMobile = ({ qualities }: { qualities: QualityNode[] }) => {
    // Smaller spheres for mobile
    const corePoints = useMemo(() => getSpherePoints(10, 3.2), []);
    const dustPoints = useMemo(() => getSpherePoints(150, 5), []);

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
            {/* Disabled activeNode logic for mobile */}
            <CoreNodesMobile points={corePoints} qualities={qualities} activeNode={null} setActiveNode={() => { }} />
            <DustNodes points={dustPoints} />
            <Connections points={[...corePoints, ...dustPoints.slice(0, 30)]} />
        </Float>
    );
};

const Interactive3DNetworkMobile = ({ qualities, titleVisible, renderCanvas = true }: { qualities: QualityNode[], titleVisible?: boolean, renderCanvas?: boolean }) => {
    const [isActivated, setIsActivated] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetInactivityTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsActivated(false);
        }, 5000); // 5s timeout
    };

    const activate = () => {
        setIsActivated(true);
        resetInactivityTimer();
    };

    const deactivate = () => {
        setIsActivated(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    // Effect to handle inactivity cleanup
    useEffect(() => {
        if (isActivated) {
            resetInactivityTimer();
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isActivated]);

    return (
        <div className="w-full h-full relative z-0 bg-[#030712] overflow-hidden">
            {/* INACTIVE OVERLAY - Blocks scroll issues, requires tap to interact */}
            {!isActivated && (
                <div
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer touch-pan-y"
                    onClick={activate}
                >
                    <div className="translate-y-24 bg-black/40 border border-cyan-500/20 px-6 py-2 rounded-full backdrop-blur-sm animate-pulse">
                        <p className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
                            (TAP TO INTERACT)
                        </p>
                    </div>
                </div>
            )}

            {/* ACTIVE BG HINT */}
            {isActivated && (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-zinc-700/50 text-[10px] uppercase tracking-widest translate-y-32">
                        (click de vuelta para parar la animación)
                    </p>
                </div>
            )}

            {/* Title / Info */}
            <motion.div
                className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center select-none"
                animate={{
                    y: isActivated ? 180 : 0, // Lowered title
                    opacity: isActivated ? 0.15 : 1,
                    scale: isActivated ? 0.8 : 1,
                    zIndex: isActivated ? 0 : 40
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase text-center drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] px-4">
                        <HyperText text="¿POR QUÉ DEVELOP?" persist={true} trigger={titleVisible} />
                    </h2>
                    <div className="flex gap-4 mt-6 opacity-80">
                        <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] backdrop-blur-sm">[ NEURAL CORE ONLINE ]</p>
                        <p className="text-[10px] text-cyan-500 font-mono tracking-[0.3em] animate-pulse">_ACTIVE</p>
                    </div>
                </div>
            </motion.div>

            {/* Canvas Container */}
            <div
                className={`w-full h-full relative z-10 ${isActivated ? 'pointer-events-auto' : 'pointer-events-none'}`}
                onPointerDown={isActivated ? resetInactivityTimer : undefined}
                onTouchStart={isActivated ? resetInactivityTimer : undefined}
            >
                {renderCanvas && (
                    <Canvas
                        camera={{ position: [0, 0, 24], fov: 40 }}
                        gl={{ alpha: true, antialias: false, powerPreference: "high-performance", stencil: false, depth: false }}
                        dpr={[1, 1.5]}
                        onPointerMissed={() => {
                            if (isActivated) {
                                deactivate();
                            }
                        }}
                    >
                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            rotateSpeed={0.6}
                            autoRotate={true}
                            autoRotateSpeed={0.5}
                            minPolarAngle={1}
                            maxPolarAngle={Math.PI - 1}
                            enabled={isActivated}
                            onStart={isActivated ? resetInactivityTimer : undefined}
                        />
                        <Suspense fallback={
                            <Html center>
                                <div className="flex flex-col items-center justify-center opacity-50">
                                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-cyan-500 text-[10px] font-mono mt-2 tracking-widest">INITIALIZING...</p>
                                </div>
                            </Html>
                        }>
                            <Starfield />
                            <ShootingStarSystem />
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                            <Environment preset="city" />

                            <SceneMobile
                                qualities={qualities}
                            />
                        </Suspense>
                    </Canvas>
                )}
            </div>
        </div>
    );
};

// --- MAIN TWIN EXPORT ---

export const Interactive3DNetwork = (props: { qualities: QualityNode[], titleVisible?: boolean, renderCanvas?: boolean }) => {
    return (
        <div className="w-full h-full">
            {/* MOBILE VIEW */}
            <div className="block md:hidden w-full h-full">
                <Interactive3DNetworkMobile {...props} />
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block w-full h-full">
                <Interactive3DNetworkDesktop {...props} />
            </div>
        </div>
    );
};

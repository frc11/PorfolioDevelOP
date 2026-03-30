"use client";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import {
    PreloaderArtifact,
    type PreloaderArtifactProps,
} from "@/components/3d/PreloaderArtifact";
import { usePreloader } from "@/context/PreloaderContext";

type PreloaderProps = {
    isHomePage?: boolean;
    onPreloaderComplete?: () => void;
};

type ParticleSpec = {
    size: number;
    x: string;
    y: string;
    duration: number;
    delay: number;
    opacity: number;
};

type TypewriterTextProps = {
    text: string;
    delay?: number;
    className?: string;
};

const PRELOADER_COPY = "CONSTRUIMOS LO QUE IMAGINÁS";
const MOBILE_BREAKPOINT = 768;
const TEXT_REVEAL_DURATION_SECONDS = 0.5;
const TEXT_EXIT_DURATION_SECONDS = 0.2;
const CANVAS_FADE_IN_DURATION_SECONDS = 1.1;
const FLIGHT_DURATION_SECONDS = 0.65;
const CANVAS_FADE_OUT_DURATION_SECONDS = 0.5;
const DISSOLVE_DURATION_SECONDS = 0.4;
const MOBILE_EXIT_DURATION_SECONDS = 0.35;
const HERO_RECT_WAIT_TIMEOUT_MS = 300;
const SWAP_OVERLAP_WAIT_MS = 200;
const HERO_REVEAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const PRELOADER_SUBCOPY = "TUCUM\u00c1N \u00b7 ARGENTINA";
const PRELOADER_COPY_LABEL =
    PRELOADER_COPY.slice(0, 0) + "CONSTRUIMOS LO QUE IMAGIN\u00c1S";
const PRELOADER_VERSION_COPY = "V.3.0";
const DECORATION_EXIT_DURATION_SECONDS = 0.3;
const VIGNETTE_FADE_IN_DURATION_SECONDS = 0.8;
const PARTICLES_FADE_IN_DURATION_SECONDS = 1;
const DOT_FIELD_FADE_IN_DURATION_SECONDS = 0.6;
const DOT_FIELD_FADE_OUT_DURATION_SECONDS = 0.4;
const DOT_FIELD_COLUMNS = 16;
const DOT_FIELD_ROWS = 10;
const TYPEWRITER_CHARACTER_DELAY_MS = 55;
const PRELOADER_SUBCOPY_DELAY_MS =
    PRELOADER_COPY_LABEL.length * TYPEWRITER_CHARACTER_DELAY_MS + 400;
const PARTICLES: ParticleSpec[] = [
    { size: 5, x: "22%", y: "30%", duration: 6, delay: 0, opacity: 0.36 },
    { size: 4, x: "75%", y: "22%", duration: 7, delay: 1, opacity: 0.30 },
    { size: 6, x: "78%", y: "68%", duration: 5.5, delay: 0.5, opacity: 0.4 },
    { size: 4, x: "20%", y: "72%", duration: 6.5, delay: 1.5, opacity: 0.32 },
    { size: 2, x: "45%", y: "15%", duration: 3.5, delay: 0.8, opacity: 0.5 },
    { size: 2, x: "82%", y: "44%", duration: 4, delay: 2, opacity: 0.44 },
    { size: 3, x: "15%", y: "50%", duration: 4.5, delay: 0.3, opacity: 0.36 },
    { size: 2, x: "55%", y: "82%", duration: 3.8, delay: 1.8, opacity: 0.4 },
];

function TypewriterText({
    text,
    delay = 0,
    className,
}: TypewriterTextProps) {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const startTimer = window.setTimeout(() => {
            setStarted(true);
        }, delay);

        return () => {
            window.clearTimeout(startTimer);
        };
    }, [delay]);

    useEffect(() => {
        if (!started) {
            return;
        }

        let characterIndex = 0;
        const interval = window.setInterval(() => {
            setDisplayed(text.slice(0, characterIndex + 1));
            characterIndex += 1;

            if (characterIndex >= text.length) {
                window.clearInterval(interval);
            }
        }, TYPEWRITER_CHARACTER_DELAY_MS);

        return () => {
            window.clearInterval(interval);
        };
    }, [started, text]);

    return (
        <span className={className}>
            {displayed}
            {displayed.length < text.length && started && (
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ marginLeft: 1 }}
                >
                    |
                </motion.span>
            )}
        </span>
    );
}

function LoadingCounter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 4200;
        const start = performance.now();
        let rafId: number;

        const tick = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * 100));
            if (progress < 1) {
                rafId = window.requestAnimationFrame(tick);
            }
        };

        rafId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(rafId);
    }, []);

    return <span>{String(count).padStart(3, "0")}</span>;
}

function DotField({ active }: { active: boolean }) {
    const cols = DOT_FIELD_COLUMNS;
    const rows = DOT_FIELD_ROWS;

    return (
        <motion.div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
                overflow: "hidden",
            }}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{
                duration: active
                    ? DOT_FIELD_FADE_IN_DURATION_SECONDS
                    : DOT_FIELD_FADE_OUT_DURATION_SECONDS,
                ease: "easeOut",
            }}
        >
            {Array.from({ length: cols * rows }, (_, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const distX = Math.abs(col - cols / 2) / (cols / 2);
                const distY = Math.abs(row - rows / 2) / (rows / 2);
                const distCenter = Math.sqrt(distX ** 2 + distY ** 2) / Math.sqrt(2);
                const baseOpacity = 0.08 + distCenter * 0.25;

                return (
                    <motion.div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${(col / (cols - 1)) * 100}%`,
                            top: `${(row / (rows - 1)) * 100}%`,
                            width: 2,
                            height: 2,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,1)",
                            transform: "translate(-50%, -50%)",
                        }}
                        animate={{
                            opacity: [
                                baseOpacity * 0.3,
                                baseOpacity,
                                baseOpacity * 0.5,
                                baseOpacity * 0.8,
                                baseOpacity * 0.3,
                            ],
                            scale: [0.8, 1.5, 1, 1.3, 0.8],
                        }}
                        transition={{
                            duration: 2.5 + (col * 0.1 + row * 0.15) % 2,
                            delay: (col * 0.06 + row * 0.09) % 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                );
            })}
        </motion.div>
    );
}

export default function Preloader({
    isHomePage = true,
    onPreloaderComplete,
}: PreloaderProps) {
    const { heroCanvasRect, isDone, phase, setPhase } = usePreloader();
    const [overlayScope, animate] = useAnimate();
    const canvasRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const heroCanvasRectRef = useRef<DOMRect | null>(heroCanvasRect);
    const timeoutIdsRef = useRef<number[]>([]);
    const frameIdsRef = useRef<number[]>([]);
    const isCancelledRef = useRef(false);
    const artifactLoadedRef = useRef(false);
    const artifactLoadedResolveRef = useRef<(() => void) | null>(null);
    const [artifactPhase, setArtifactPhase] =
        useState<PreloaderArtifactProps["phase"]>("hidden");
    const [isArtifactReady, setIsArtifactReady] = useState(false);

    useEffect(() => {
        heroCanvasRectRef.current = heroCanvasRect;
    }, [heroCanvasRect]);

    const handleArtifactLoaded = useCallback(() => {
        let frameCount = 0;
        const waitFrames = () => {
            frameCount++;
            if (frameCount < 3) {
                requestAnimationFrame(waitFrames);
            } else {
                artifactLoadedRef.current = true;
                setIsArtifactReady(true);
                artifactLoadedResolveRef.current?.();
                artifactLoadedResolveRef.current = null;
            }
        };
        requestAnimationFrame(waitFrames);
    }, []);

    const isTextPhaseOrLater =
        phase === "text" ||
        phase === "waiting" ||
        phase === "flying" ||
        phase === "swapping" ||
        phase === "done";
    const isBackdropAwake =
        artifactPhase === "appearing" ||
        artifactPhase === "idle" ||
        artifactPhase === "exiting";
    const isDotFieldVisible =
        artifactPhase === "appearing" || artifactPhase === "idle";
    const shouldShowCornerCopy = artifactPhase === "idle";
    const shouldShowWarmupPlate =
        artifactPhase === "hidden" && !isArtifactReady;
    const bloomOpacity =
        artifactPhase === "appearing" || artifactPhase === "idle" ? 1 : 0;
    const particlesOpacity =
        artifactPhase === "idle" ? 1 : artifactPhase === "exiting" ? 0 : 0;

    const handlePreloaderComplete = useCallback(() => {
        onPreloaderComplete?.();
        setPhase("swapping");
    }, [onPreloaderComplete, setPhase]);

    useEffect(() => {
        if (!isHomePage || isDone) {
            return;
        }

        isCancelledRef.current = false;
        artifactLoadedRef.current = false;
        artifactLoadedResolveRef.current = null;
        document.body.style.overflow = "hidden";

        const wait = (delay: number) =>
            new Promise<void>((resolve) => {
                const timeoutId = window.setTimeout(resolve, delay);
                timeoutIdsRef.current.push(timeoutId);
            });

        const nextFrame = () =>
            new Promise<void>((resolve) => {
                const frameId = window.requestAnimationFrame(() => resolve());
                frameIdsRef.current.push(frameId);
            });

        const waitForArtifactLoaded = () =>
            new Promise<void>((resolve) => {
                if (artifactLoadedRef.current) {
                    resolve();
                } else {
                    artifactLoadedResolveRef.current = resolve;
                }
            });

        const waitForHeroCanvasRect = async () => {
            const deadline = Date.now() + HERO_RECT_WAIT_TIMEOUT_MS;

            while (
                !isCancelledRef.current &&
                heroCanvasRectRef.current === null &&
                Date.now() < deadline
            ) {
                await wait(50);
            }

            return heroCanvasRectRef.current;
        };

        const runSequence = async () => {
            await nextFrame();

            const overlayElement = overlayScope.current;

            if (!overlayElement || isCancelledRef.current) {
                return;
            }

            setPhase("drawing");

            await wait(200);

            if (isCancelledRef.current) {
                return;
            }

            setArtifactPhase("appearing");

            // Wait for SVG to finish loading before fading in canvas
            await waitForArtifactLoaded();

            if (isCancelledRef.current) {
                return;
            }

            const canvasFadeInAnimation = canvasRef.current
                ? animate(
                      canvasRef.current,
                      { opacity: 1 },
                      {
                          duration: CANVAS_FADE_IN_DURATION_SECONDS,
                          ease: "easeOut",
                      },
                  )
                : null;

            await wait(1200);

            if (isCancelledRef.current) {
                return;
            }

            if (canvasFadeInAnimation) {
                await canvasFadeInAnimation;
            }

            setArtifactPhase("idle");

            await wait(400);

            if (isCancelledRef.current) {
                return;
            }

            setPhase("text");

            const textRevealAnimation = textRef.current
                ? animate(
                      textRef.current,
                      { opacity: 1, y: 0 },
                      {
                          duration: TEXT_REVEAL_DURATION_SECONDS,
                          ease: "easeOut",
                      },
                  )
                : null;

            await wait(2400);

            if (isCancelledRef.current) {
                return;
            }

            if (textRevealAnimation) {
                await textRevealAnimation;
            }

            setPhase("waiting");
            const heroRectPromise =
                heroCanvasRectRef.current !== null
                    ? Promise.resolve(heroCanvasRectRef.current)
                    : waitForHeroCanvasRect();

            if (isCancelledRef.current) {
                return;
            }

            await wait(800);

            if (isCancelledRef.current) {
                return;
            }

            const resolvedHeroCanvasRect =
                heroCanvasRectRef.current ?? (await heroRectPromise);

            setArtifactPhase("exiting");

            const isMobileViewport = window.innerWidth < MOBILE_BREAKPOINT;
            const textExitAnimation = textRef.current
                ? animate(
                      textRef.current,
                      { opacity: 0, y: -8 },
                      {
                          duration: TEXT_EXIT_DURATION_SECONDS,
                          ease: "easeOut",
                      },
                  )
                : null;

            if (isMobileViewport) {
                handlePreloaderComplete();

                const mobileExitAnimation = animate(
                    overlayElement,
                    { opacity: 0, scale: 0.98 },
                    {
                        duration: MOBILE_EXIT_DURATION_SECONDS,
                        ease: "easeOut",
                    },
                );

                if (textExitAnimation) {
                    await Promise.all([mobileExitAnimation, textExitAnimation]);
                } else {
                    await mobileExitAnimation;
                }

                if (isCancelledRef.current) {
                    return;
                }

                document.body.style.overflow = "unset";
                setPhase("done");
                return;
            }

            setPhase("flying");

            await nextFrame();

            if (isCancelledRef.current) {
                return;
            }

            const canvasElement = canvasRef.current;

            if (!canvasElement) {
                document.body.style.overflow = "unset";
                setPhase("done");
                return;
            }

            const originalTransform = canvasElement.style.transform;
            canvasElement.style.transform = "none";
            const currentRect = canvasElement.getBoundingClientRect();
            canvasElement.style.transform = originalTransform;
            const targetRect = resolvedHeroCanvasRect ?? currentRect;
            const targetX =
                targetRect.left -
                currentRect.left +
                (targetRect.width - currentRect.width) / 2;
            const targetY =
                targetRect.top -
                currentRect.top +
                (targetRect.height - currentRect.height) / 2;
            const targetScale =
                currentRect.width > 0 ? targetRect.width / currentRect.width : 1;

            const flightAnimation = animate(
                canvasElement,
                {
                    x: targetX,
                    y: targetY,
                    scale: targetScale,
                },
                {
                    duration: FLIGHT_DURATION_SECONDS,
                    ease: HERO_REVEAL_EASE,
                },
            );

            if (textExitAnimation) {
                await Promise.all([flightAnimation, textExitAnimation]);
            } else {
                await flightAnimation;
            }

            if (isCancelledRef.current) {
                return;
            }

            handlePreloaderComplete();

            await wait(SWAP_OVERLAP_WAIT_MS);

            if (isCancelledRef.current) {
                return;
            }

            const canvasFadeOutAnimation = animate(
                canvasElement,
                { opacity: 0 },
                {
                    duration: CANVAS_FADE_OUT_DURATION_SECONDS,
                    ease: "easeOut",
                },
            );
            const overlayFadeOutAnimation = animate(
                overlayElement,
                { opacity: 0 },
                {
                    duration: DISSOLVE_DURATION_SECONDS,
                    ease: "easeOut",
                },
            );

            await Promise.all([canvasFadeOutAnimation, overlayFadeOutAnimation]);

            if (isCancelledRef.current) {
                return;
            }

            document.body.style.overflow = "unset";
            setPhase("done");
        };

        void runSequence();

        return () => {
            isCancelledRef.current = true;

            timeoutIdsRef.current.forEach((timeoutId) => {
                window.clearTimeout(timeoutId);
            });
            timeoutIdsRef.current = [];

            frameIdsRef.current.forEach((frameId) => {
                window.cancelAnimationFrame(frameId);
            });
            frameIdsRef.current = [];

            document.body.style.overflow = "unset";
        };
    }, [
        animate,
        handleArtifactLoaded,
        handlePreloaderComplete,
        isDone,
        isHomePage,
        overlayScope,
        setArtifactPhase,
        setPhase,
    ]);

    if (!isHomePage) {
        return null;
    }

    return (
        <AnimatePresence>
            {!isDone && (
                <motion.div
                    ref={overlayScope}
                    className="fixed inset-0 z-[9999] bg-[#0a0a0a]"
                    exit={{ opacity: 0 }}
                    transition={{ duration: DISSOLVE_DURATION_SECONDS }}
                    style={{
                        willChange: "transform, opacity",
                        transformOrigin: "center center",
                    }}
                >
                    <DotField active={isDotFieldVisible} />

                    {/* Edge shadows — top/bottom fade */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(0,0,0,0.055) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.055) 100%)",
                            zIndex: 0,
                            opacity: isBackdropAwake ? 1 : 0,
                            transition: "opacity 280ms ease",
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        animate={{
                            opacity: shouldShowWarmupPlate ? 1 : 0,
                            scale: shouldShowWarmupPlate ? 1 : 0.98,
                        }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        style={{ zIndex: 2 }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: 168,
                                height: 168,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: "14%",
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(circle, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 42%, transparent 74%)",
                                    filter: "blur(18px)",
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: "50%",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    opacity: 0.45,
                                }}
                            />
                            <Image
                                src="/logodevelOP.svg"
                                alt=""
                                aria-hidden="true"
                                width={58}
                                height={58}
                                className="h-[58px] w-[58px] object-contain opacity-72 brightness-0 invert"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Decorative horizontal lines growing from center */}
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: isBackdropAwake && phase !== "done" ? "60vw" : 0,
                            opacity:
                                artifactPhase === "appearing" ||
                                artifactPhase === "idle"
                                    ? 1
                                    : 0,
                        }}
                        transition={{
                            duration: artifactPhase === "exiting" ? 0.4 : 1.2,
                            ease: HERO_REVEAL_EASE,
                            delay: 0.3,
                        }}
                        style={{
                            top: "15%",
                            height: 1,
                            background: "rgba(255,255,255,0.12)",
                            zIndex: 1,
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: isBackdropAwake && phase !== "done" ? "60vw" : 0,
                            opacity:
                                artifactPhase === "appearing" ||
                                artifactPhase === "idle"
                                    ? 1
                                    : 0,
                        }}
                        transition={{
                            duration: artifactPhase === "exiting" ? 0.4 : 1.2,
                            ease: HERO_REVEAL_EASE,
                            delay: 0.5,
                        }}
                        style={{
                            bottom: "15%",
                            height: 1,
                            background: "rgba(255,255,255,0.12)",
                            zIndex: 1,
                        }}
                    />

                    {/* Subtle center glow */}
                    <motion.div
                        className="pointer-events-none absolute inset-0"
                        animate={{ opacity: bloomOpacity }}
                        transition={{
                            duration:
                                artifactPhase === "exiting"
                                    ? DECORATION_EXIT_DURATION_SECONDS
                                    : VIGNETTE_FADE_IN_DURATION_SECONDS,
                            ease: "easeOut",
                        }}
                        style={{ zIndex: 0 }}
                    >
                        <motion.div
                            aria-hidden="true"
                            animate={{
                                scale: [1, 1.12, 0.96, 1.08, 1],
                                opacity: [0.7, 1, 0.6, 0.95, 0.7],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "50vw",
                                height: "50vw",
                                minWidth: 320,
                                minHeight: 320,
                                maxWidth: 720,
                                maxHeight: 720,
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)",
                                filter: "blur(60px)",
                                pointerEvents: "none",
                            }}
                        />
                    </motion.div>

                    {/* Canvas wrapper — oversized so edges stay outside viewport */}
                    <motion.div
                        ref={canvasRef}
                        style={{
                            position: "absolute",
                            left: "-25vw",
                            top: "-25vh",
                            width: "150vw",
                            height: "150vh",
                            opacity: 0,
                            pointerEvents: "none",
                            willChange: "transform, opacity",
                            zIndex: 1,
                        }}
                    >
                        <Canvas
                            camera={{ position: [0, 0, 15], fov: 51 }}
                            gl={{
                                alpha: true,
                                powerPreference: "high-performance",
                                antialias: false,
                                stencil: false,
                                depth: true,
                            }}
                            dpr={[1, 1.5]}
                            style={{ background: "transparent" }}
                        >
                            <Suspense fallback={null}>
                                <PreloaderArtifact
                                    phase={artifactPhase}
                                    onLoaded={handleArtifactLoaded}
                                />
                            </Suspense>
                        </Canvas>
                    </motion.div>

                    {/* Floating particles */}
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        animate={{ opacity: particlesOpacity }}
                        transition={{
                            duration:
                                artifactPhase === "idle"
                                    ? PARTICLES_FADE_IN_DURATION_SECONDS
                                    : DECORATION_EXIT_DURATION_SECONDS,
                            ease: "easeOut",
                        }}
                        style={{ zIndex: 3 }}
                    >
                        {PARTICLES.map((particle, index) => (
                            <motion.div
                                key={`${particle.x}-${particle.y}-${index}`}
                                animate={{
                                    y: [0, -20, -8, -28, 0],
                                    x: [0, 10, -6, 4, 0],
                                    opacity: [
                                        0,
                                        particle.opacity,
                                        particle.opacity * 0.6,
                                        particle.opacity,
                                        0,
                                    ],
                                    scale: [0.8, 1.4, 1, 1.2, 0.8],
                                }}
                                transition={{
                                    duration: particle.duration,
                                    delay: particle.delay + 1.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    times: [0, 0.25, 0.5, 0.75, 1],
                                }}
                                style={{
                                    position: "absolute",
                                    left: particle.x,
                                    top: particle.y,
                                    width: particle.size,
                                    height: particle.size,
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.9)",
                                    pointerEvents: "none",
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Vignette — dark edges */}
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isBackdropAwake ? 1 : 0 }}
                        transition={{
                            duration: VIGNETTE_FADE_IN_DURATION_SECONDS,
                            ease: "easeOut",
                        }}
                        style={{
                            background:
                                "radial-gradient(ellipse 85% 85% at 50% 45%, transparent 0%, transparent 45%, rgba(0,0,0,0.3) 68%, rgba(0,0,0,0.55) 100%)",
                            zIndex: 4,
                        }}
                    />

                    {/* Loading counter */}
                    <motion.div
                        className="pointer-events-none absolute"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity:
                                artifactPhase === "appearing" ||
                                artifactPhase === "idle"
                                    ? 1
                                    : 0,
                        }}
                        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                        style={{
                            bottom: 28,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "var(--font-sans)",
                            fontSize: 9,
                            fontWeight: 300,
                            letterSpacing: "0.35em",
                            color: "rgba(255,255,255,0.35)",
                            zIndex: 5,
                            fontVariantNumeric: "tabular-nums",
                        }}
                    >
                        <LoadingCounter />
                    </motion.div>

                    {/* Corner — develOP™ */}
                    <motion.div
                        className="pointer-events-none absolute"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: shouldShowCornerCopy ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
                        style={{
                            bottom: 28,
                            left: 32,
                            fontFamily: "var(--font-sans)",
                            fontSize: 9,
                            fontWeight: 400,
                            letterSpacing: "0.2em",
                            color: "rgba(255,255,255,0.35)",
                            zIndex: 5,
                        }}
                    >
                        develOP™
                    </motion.div>

                    {/* Corner — version */}
                    <motion.div
                        className="pointer-events-none absolute"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: shouldShowCornerCopy ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
                        style={{
                            bottom: 28,
                            right: 32,
                            fontFamily: "var(--font-sans)",
                            fontSize: 9,
                            fontWeight: 400,
                            letterSpacing: "0.2em",
                            color: "rgba(255,255,255,0.35)",
                            zIndex: 5,
                        }}
                    >
                        {shouldShowCornerCopy ? (
                            <TypewriterText
                                text={PRELOADER_VERSION_COPY}
                                delay={2000}
                            />
                        ) : null}
                    </motion.div>

                    {/* Main text */}
                    <motion.div
                        ref={textRef}
                        className="pointer-events-none absolute inset-x-0 top-[calc(50vh+2rem)] flex justify-center px-4 text-center md:bottom-[8vh] md:top-auto"
                        style={{
                            opacity: 0,
                            y: 16,
                            willChange: "transform, opacity",
                            zIndex: 5,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div className="flex flex-col items-center" style={{ gap: 12 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 1,
                                        background: "rgba(255,255,255,0.25)",
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily: "var(--font-sans)",
                                        fontSize: 12,
                                        fontWeight: 300,
                                        letterSpacing: "0.35em",
                                        color: "rgba(255,255,255,0.65)",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {isTextPhaseOrLater ? (
                                        <TypewriterText
                                            text={PRELOADER_COPY_LABEL}
                                            delay={0}
                                        />
                                    ) : null}
                                </span>
                                <div
                                    style={{
                                        width: 32,
                                        height: 1,
                                        background: "rgba(255,255,255,0.25)",
                                    }}
                                />
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isTextPhaseOrLater ? 1 : 0 }}
                                transition={{
                                    duration: 0.45,
                                    delay: 0.15,
                                    ease: "easeOut",
                                }}
                                style={{
                                    fontFamily: "var(--font-sans)",
                                    fontSize: 9,
                                    fontWeight: 400,
                                    letterSpacing: "0.5em",
                                    color: "rgba(255,255,255,0.30)",
                                    textTransform: "uppercase",
                                }}
                            >
                                {isTextPhaseOrLater ? (
                                    <TypewriterText
                                        text={PRELOADER_SUBCOPY}
                                        delay={PRELOADER_SUBCOPY_DELAY_MS}
                                    />
                                ) : null}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

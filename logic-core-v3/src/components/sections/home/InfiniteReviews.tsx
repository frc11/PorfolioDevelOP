'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';

type TechIconName = 'react' | 'typescript' | 'next' | 'node' | 'tailwind' | 'postgres';

type MarqueeToken =
    | {
        type: 'word';
        text: string;
    }
    | {
        type: 'icon';
        icon: TechIconName;
        label: string;
    };

type LayerConfig = {
    id: string;
    top: string;
    z: number;
    fontSize: string;
    fontWeight: number;
    direction: 1 | -1;
    baseSpeed: number;
    parallaxX: number;
    parallaxY: number;
    strokeWidth: number;
    fillAlpha: number;
    fillGain: number;
    strokeAlpha: number;
    tilt: number;
    tokenOffset: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const wrap = (value: number, size: number) => ((value % size) + size) % size;

const TOKENS: MarqueeToken[] = [
    { type: 'word', text: 'RESULTADOS' },
    { type: 'icon', icon: 'react', label: 'React' },
    { type: 'word', text: 'PRECISIÓN' },
    { type: 'icon', icon: 'typescript', label: 'TypeScript' },
    { type: 'word', text: 'ESCALA' },
    { type: 'icon', icon: 'next', label: 'Next.js' },
    { type: 'word', text: 'INGENIERÍA' },
    { type: 'icon', icon: 'node', label: 'Node.js' },
    { type: 'word', text: 'CREATIVIDAD' },
    { type: 'icon', icon: 'tailwind', label: 'Tailwind CSS' },
    { type: 'word', text: 'INNOVACIÓN' },
    { type: 'icon', icon: 'postgres', label: 'PostgreSQL' },
    { type: 'word', text: 'ARQUITECTURA' },
    { type: 'icon', icon: 'react', label: 'React' },
    { type: 'word', text: 'PERFORMANCE' },
    { type: 'icon', icon: 'next', label: 'Next.js' },
];

// Four depth layers: farther rows are lighter, thinner and slower; front row is heavier and faster.
const LAYERS: LayerConfig[] = [
    {
        id: 'horizon',
        top: '16%',
        z: -120,
        fontSize: 'clamp(4.75rem, 11vw, 12rem)',
        fontWeight: 100,
        direction: -1,
        baseSpeed: 22,
        parallaxX: 34,
        parallaxY: -22,
        strokeWidth: 1.25,
        fillAlpha: 0.03,
        fillGain: 0.24,
        strokeAlpha: 0.42,
        tilt: -5,
        tokenOffset: 0,
    },
    {
        id: 'rear',
        top: '38%',
        z: -60,
        fontSize: 'clamp(5.5rem, 13.5vw, 14.5rem)',
        fontWeight: 300,
        direction: 1,
        baseSpeed: 30,
        parallaxX: 72,
        parallaxY: -8,
        strokeWidth: 1,
        fillAlpha: 0.14,
        fillGain: 0.28,
        strokeAlpha: 0.34,
        tilt: -2.4,
        tokenOffset: 4,
    },
    {
        id: 'middle',
        top: '61%',
        z: 0,
        fontSize: 'clamp(6.5rem, 16vw, 17.5rem)',
        fontWeight: 700,
        direction: -1,
        baseSpeed: 39,
        parallaxX: 118,
        parallaxY: 14,
        strokeWidth: 0.45,
        fillAlpha: 0.66,
        fillGain: 0.24,
        strokeAlpha: 0.16,
        tilt: 1.2,
        tokenOffset: 8,
    },
    {
        id: 'front',
        top: '82%',
        z: 60,
        fontSize: 'clamp(7.5rem, 20vw, 22rem)',
        fontWeight: 900,
        direction: 1,
        baseSpeed: 52,
        parallaxX: 172,
        parallaxY: 34,
        strokeWidth: 0,
        fillAlpha: 1,
        fillGain: 0,
        strokeAlpha: 0,
        tilt: 3.2,
        tokenOffset: 12,
    },
];

const iconStyle: CSSProperties = {
    display: 'block',
    width: '0.34em',
    height: '0.34em',
    fill: 'currentColor',
};

// Inline monochrome technology marks inherit the active layer color through currentColor.
const TechnologyIcon = ({ name }: { name: TechIconName }) => {
    switch (name) {
        case 'react':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M32 25.6a6.4 6.4 0 1 1 0 12.8 6.4 6.4 0 0 1 0-12.8Zm0-6.7c16.7 0 28.8 5.5 28.8 13.1S48.7 45.1 32 45.1 3.2 39.6 3.2 32 15.3 18.9 32 18.9Zm0 4.2C17.7 23.1 7.6 27.7 7.6 32S17.7 40.9 32 40.9 56.4 36.3 56.4 32 46.3 23.1 32 23.1Z" />
                    <path d="M20.7 25.4C29 10.9 39.8 3.2 46.4 7c6.6 3.8 4.8 17.1-3.5 31.6C34.5 53.1 23.7 60.8 17.1 57c-6.6-3.8-4.8-17.1 3.6-31.6Zm3.6 2.1C17.2 39.9 15.9 50.9 19.2 52.8c3.7 2.1 12.7-5.4 19.9-17.8C46.2 22.6 47.5 11.6 44.2 9.7c-3.7-2.1-12.7 5.4-19.9 17.8Z" />
                    <path d="M21.1 38.7C12.7 24.3 10.9 10.9 17.5 7.1c6.6-3.8 17.4 3.9 25.8 18.3 8.4 14.5 10.1 27.8 3.5 31.6-6.6 3.8-17.4-3.9-25.7-18.3Zm3.6-2.1C31.9 49 40.9 56.5 44.6 54.4c3.3-1.9 2-12.9-5.2-25.3C32.2 16.7 23.2 9.2 19.5 11.3c-3.3 1.9-2 12.9 5.2 25.3Z" />
                </svg>
            );
        case 'typescript':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M7 7h50v50H7V7Zm12.5 18.7h24.8v5.1h-9.5v25.1h-5.9V30.8h-9.4v-5.1Zm26.6 30.6c6.6 0 10.4-3.2 10.4-8.4 0-4.8-2.7-6.9-9.1-9.6-3.8-1.6-4.8-2.5-4.8-4.1 0-1.5 1.1-2.5 3.4-2.5 2.7 0 5.1.9 7.4 2.3l2-4.7c-2.6-1.7-5.7-2.6-9.3-2.6-5.9 0-9.7 3.4-9.7 8.1 0 5 3.3 7.3 9.5 9.8 3.5 1.4 4.4 2.3 4.4 3.9 0 1.8-1.3 2.8-4.1 2.8-3.2 0-6.2-1.2-8.6-2.9l-1.9 4.9c2.4 1.8 6.3 3 10.4 3Z" />
                </svg>
            );
        case 'next':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M32 4a28 28 0 1 0 0 56 28 28 0 0 0 0-56Zm12.2 42.8L25.4 23.2v22.1h-5.2V18.7h6.7l18 22.6V18.7h5.2v28.1h-5.9Z" />
                </svg>
            );
        case 'node':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M32 3.8 56.3 18v28L32 60.2 7.7 46V18L32 3.8Zm0 8.1L14.8 22v19.8L32 51.9l17.2-10.1V22L32 11.9Zm-8.8 30V24.5h5.1l10.1 10.8V24.5h5.5v17.4h-5.1L28.7 31.3v10.6h-5.5Z" />
                </svg>
            );
        case 'tailwind':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M32 17.4c-7 0-11.4 3.5-13.3 10.4 2.6-3.5 5.7-4.8 9.4-3.8 2.1.6 3.6 2.1 5.3 3.8 2.8 2.8 6.1 6 13.2 6 7 0 11.4-3.5 13.3-10.4-2.6 3.5-5.7 4.8-9.4 3.8-2.1-.6-3.6-2.1-5.3-3.8-2.8-2.8-6.1-6-13.2-6ZM17.4 30.2c-7 0-11.4 3.5-13.3 10.4 2.6-3.5 5.7-4.8 9.4-3.8 2.1.6 3.6 2.1 5.3 3.8 2.8 2.8 6.1 6 13.2 6 7 0 11.4-3.5 13.3-10.4-2.6 3.5-5.7 4.8-9.4 3.8-2.1-.6-3.6-2.1-5.3-3.8-2.8-2.8-6.1-6-13.2-6Z" />
                </svg>
            );
        case 'postgres':
            return (
                <svg viewBox="0 0 64 64" aria-hidden="true" style={iconStyle}>
                    <path d="M31.8 5.2c-12.1 0-21.2 7.9-21.2 20.4 0 8.7 4.2 15.4 10.9 18.6l-2 12.5h6.4l1.4-8.7c1.5.3 3 .5 4.6.5 12.1 0 21.2-8 21.2-20.5S43.9 5.2 31.8 5.2Zm0 5.7c8.8 0 14.9 5.6 14.9 17.1 0 11.3-6.1 14.9-14.9 14.9-1.2 0-2.4-.1-3.6-.3l1.6-10.1c.7.2 1.5.3 2.3.3 4.1 0 7.5-3.2 7.5-7.6s-3.4-7.6-7.5-7.6-7.5 3.2-7.5 7.6c0 1.5.4 2.9 1.2 4.1l-1.5 9.2c-4.5-2.5-7.3-6.8-7.3-12.9 0-9.2 6.1-14.7 14.8-14.7Z" />
                </svg>
            );
    }
};

const buildLayerTokens = (offset: number) => {
    const safeOffset = wrap(offset, TOKENS.length);
    return [...TOKENS.slice(safeOffset), ...TOKENS.slice(0, safeOffset)];
};

const tokenBaseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    lineHeight: 0.82,
};

// One segment is duplicated in the track; JS wraps by its measured width for a seamless loop.
const MarqueeSegment = ({ tokens }: { tokens: MarqueeToken[] }) => (
    <div
        data-marquee-segment
        aria-hidden="true"
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.23em',
            flex: '0 0 auto',
            paddingRight: '0.23em',
        }}
    >
        {tokens.map((token, index) =>
            token.type === 'word' ? (
                <span key={`${token.text}-${index}`} style={tokenBaseStyle}>
                    {token.text}
                </span>
            ) : (
                <span
                    key={`${token.icon}-${index}`}
                    aria-label={token.label}
                    role="img"
                    style={{
                        ...tokenBaseStyle,
                        width: '0.5em',
                        opacity: 0.92,
                    }}
                >
                    <TechnologyIcon name={token.icon} />
                </span>
            ),
        )}
    </div>
);

const layerShellStyle: CSSProperties = {
    position: 'absolute',
    left: '-12vw',
    width: '124vw',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
};

const trackStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'max-content',
    whiteSpace: 'nowrap',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
};

const ScrollingTextMarquee = () => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
    const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const phasesRef = useRef<number[]>(LAYERS.map((_, index) => index * 180));
    const tokensByLayer = useMemo(() => LAYERS.map((layer) => buildLayerTokens(layer.tokenOffset)), []);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        let frameId = 0;
        let isVisible = false;
        let lastTime = performance.now();
        let lastScrollY = window.scrollY;
        let progress = 0;
        let velocityBoost = 0;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Single RAF loop drives scroll progress, parallax, background interpolation and marquee speed.
        const paintFrame = (time: number) => {
            const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
            lastTime = time;

            if (isVisible) {
                const rect = section.getBoundingClientRect();
                const viewportHeight = window.innerHeight || 1;
                const targetProgress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
                const scrollVelocity = deltaSeconds > 0 ? (window.scrollY - lastScrollY) / deltaSeconds : 0;
                const targetBoost = prefersReducedMotion ? 0 : clamp(Math.abs(scrollVelocity) / 180, 0, 18);

                progress = lerp(progress, targetProgress, 0.045);
                velocityBoost = lerp(velocityBoost, targetBoost, 0.24);

                const backgroundShade = Math.round(238 - progress * 92);
                const textShade = Math.round(10 + progress * 22);
                section.style.backgroundColor = `rgb(${backgroundShade}, ${backgroundShade}, ${backgroundShade})`;
                section.style.setProperty('--marquee-ambient-opacity', String(0.18 + progress * 0.34));
                section.style.setProperty('--marquee-grid-opacity', String(0.08 + progress * 0.1));
                section.style.setProperty('--marquee-vignette-opacity', String(0.36 + progress * 0.18));

                LAYERS.forEach((layer, index) => {
                    const layerElement = layerRefs.current[index];
                    const trackElement = trackRefs.current[index];
                    const segmentElement = segmentRefs.current[index];
                    const segmentWidth = segmentElement?.offsetWidth ?? 0;

                    if (!layerElement || !trackElement || segmentWidth <= 0) return;

                    const scrollDepth = progress - 0.5;
                    const parallaxX = scrollDepth * layer.parallaxX;
                    const parallaxY = scrollDepth * layer.parallaxY;
                    const depthBoost = layer.z >= 60 ? 1.18 : layer.z >= 0 ? 1 : 0.82;
                    const speed = prefersReducedMotion ? 0 : layer.baseSpeed * (1 + velocityBoost * depthBoost);
                    const currentPhase = phasesRef.current[index] + layer.direction * speed * deltaSeconds;
                    const wrappedPhase = wrap(currentPhase, segmentWidth);
                    const fillAlpha = clamp(layer.fillAlpha + progress * layer.fillGain, 0, 1);
                    const strokeAlpha = clamp(layer.strokeAlpha + progress * 0.18, 0, 0.9);

                    phasesRef.current[index] = wrappedPhase;
                    layerElement.style.transform = `translate3d(0, calc(-50% + ${parallaxY}px), ${layer.z}px) rotateX(${layer.tilt * scrollDepth}deg)`;
                    layerElement.style.color = `rgba(${textShade}, ${textShade}, ${textShade}, ${fillAlpha})`;
                    layerElement.style.webkitTextStroke = `${layer.strokeWidth}px rgba(${textShade}, ${textShade}, ${textShade}, ${strokeAlpha})`;
                    trackElement.style.transform = `translate3d(${parallaxX - wrappedPhase}px, 0, 0)`;
                });
            }

            lastScrollY = window.scrollY;

            if (isVisible) {
                frameId = window.requestAnimationFrame(paintFrame);
            } else {
                frameId = 0;
            }
        };

        // El rAF vive DENTRO del gate de visibilidad. Antes se re-agendaba siempre —
        // el observer gateaba el trabajo, no el loop — así que la sección seguía
        // corriendo a 60 fps y leyendo window.scrollY fuera de pantalla.
        const startLoop = () => {
            if (frameId) return;
            // Rebasar ambos relojes: sin esto, el primer frame de vuelta al viewport
            // ve un delta y una velocidad de scroll acumulados y el marquee pega un
            // salto de velocidad.
            lastTime = performance.now();
            lastScrollY = window.scrollY;
            frameId = window.requestAnimationFrame(paintFrame);
        };

        const stopLoop = () => {
            if (!frameId) return;
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;

                if (isVisible) {
                    startLoop();
                } else {
                    stopLoop();
                }
            },
            { threshold: 0 },
        );

        observer.observe(section);

        return () => {
            observer.disconnect();
            stopLoop();
        };
    }, []);

    return (
        <section
            id="testimonials"
            ref={sectionRef}
            aria-label="Capacidades técnicas de develOP"
            style={{
                position: 'relative',
                isolation: 'isolate',
                width: '100%',
                height: '100vh',
                minHeight: '42rem',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                color: '#0a0a0a',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    background:
                        'radial-gradient(ellipse at 50% 34%, rgba(255,255,255,var(--marquee-ambient-opacity,0.18)) 0%, transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.24), transparent 24%, transparent 76%, rgba(0,0,0,var(--marquee-vignette-opacity,0.36)))',
                    pointerEvents: 'none',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 'var(--marquee-grid-opacity,0.08)',
                    backgroundImage:
                        'linear-gradient(rgba(0,0,0,0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.34) 1px, transparent 1px), radial-gradient(circle at center, rgba(0,0,0,0.24) 1px, transparent 1.5px)',
                    backgroundSize: '96px 96px, 96px 96px, 32px 32px',
                    maskImage: 'radial-gradient(ellipse at center, black 0%, black 52%, transparent 86%)',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: '9% 6%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    opacity: 0.16,
                    border: '1px solid rgba(0,0,0,0.22)',
                    maskImage:
                        'linear-gradient(90deg, transparent 0%, black 18%, black 82%, transparent 100%)',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 3,
                    height: 'clamp(13rem, 30vh, 22rem)',
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.96) 12%, rgba(0,0,0,0.72) 36%, rgba(0,0,0,0) 100%)',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 3,
                    height: 'clamp(13rem, 30vh, 22rem)',
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(0deg, #030305 0%, rgba(3,3,5,0.96) 12%, rgba(3,3,5,0.72) 36%, rgba(3,3,5,0) 100%)',
                }}
            />

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    perspective: '1000px',
                    perspectiveOrigin: '50% 52%',
                    transformStyle: 'preserve-3d',
                }}
            >
                {LAYERS.map((layer, index) => (
                    <div
                        key={layer.id}
                        ref={(element) => {
                            layerRefs.current[index] = element;
                        }}
                        style={{
                            ...layerShellStyle,
                            top: layer.top,
                            fontSize: layer.fontSize,
                            fontWeight: layer.fontWeight,
                            letterSpacing: '-0.015em',
                            textTransform: 'uppercase',
                        }}
                    >
                        <div
                            ref={(element) => {
                                trackRefs.current[index] = element;
                            }}
                            style={trackStyle}
                        >
                            {[0, 1, 2].map((copyIndex) => (
                                <div
                                    key={`${layer.id}-${copyIndex}`}
                                    ref={copyIndex === 0
                                        ? (element) => {
                                            segmentRefs.current[index] = element;
                                        }
                                        : undefined}
                                >
                                    <MarqueeSegment tokens={tokensByLayer[index]} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(90deg, rgba(238,238,238,0.86) 0%, transparent 11%, transparent 89%, rgba(238,238,238,0.86) 100%)',
                    opacity: 0.26,
                }}
            />
        </section>
    );
};

export const InfiniteReviews = ScrollingTextMarquee;

export default ScrollingTextMarquee;

'use client';
<<<<<<< HEAD
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
=======

import { useId, useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
>>>>>>> 2e2538035336e0fb5af1444fcc07cf4be2d988cd
import { useThemeSection } from '@/hooks/useThemeObserver';
import { KineticText } from '@/components/ui/KineticText';

interface TeamMemberProps {
    name: string;
    role: string;
    description: string;
    avatarInitial: string;
    tone: 'light' | 'dark';
}

const ABOUT_HERO_LOGO_TEXT_SIZE = 'clamp(9rem,18vw,24rem)';
const ABOUT_HERO_LOGO_LINE_HEIGHT = '0.74';
const ABOUT_HERO_LOGO_TRACKING = '-0.08em';
const ABOUT_HERO_LOGO_SHADOW_WIDTH = 'min(88vw,78rem)';
const ABOUT_HERO_LOGO_SHADOW_HEIGHT = 'clamp(3.5rem,6vw,6.5rem)';
const ABOUT_HERO_LOGO_SHADOW_TOP = '86%';
const ABOUT_HERO_LOGO_SHADOW_OPACITY = 0.56;

const teamMembers: TeamMemberProps[] = [
    {
        name: 'Franco',
        role: 'Co-Founder & Lead Developer',
        description:
            'Desarrollo web, IA y arquitectura de sistemas. Convierto ideas de negocio en productos digitales que funcionan solos.',
        avatarInitial: 'F',
        tone: 'light',
    },
    {
        name: 'Valentino',
        role: 'Full Stack & Automatizaciones',
        description:
            'Backend, bases de datos y flujos de automatización. Hacemos que los sistemas trabajen solos.',
        avatarInitial: 'V',
        tone: 'dark',
    },
];

const AvatarPlaceholder = ({
    initial,
    tone,
}: {
    initial: string;
    tone: TeamMemberProps['tone'];
}) => (
    <motion.div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${tone === 'light'
            ? 'bg-[radial-gradient(circle_at_30%_18%,#ffffff_0%,#d9d9d9_34%,#8f8f8f_72%,#363636_100%)]'
            : 'bg-[radial-gradient(circle_at_65%_20%,#7d7d7d_0%,#4f4f4f_38%,#1c1c1c_74%,#050505_100%)]'
            }`}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
    >
        <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.14]"
            style={{
                backgroundImage:
                    'linear-gradient(rgba(0,0,0,0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.34) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
            }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <span
            className={`relative select-none text-8xl font-black drop-shadow-[0_18px_24px_rgba(0,0,0,0.22)] ${tone === 'light' ? 'text-black' : 'text-zinc-100'
                }`}
        >
            {initial}
        </span>
    </motion.div>
);

const TeamMemberMobile = ({ name, role, description, avatarInitial, tone }: TeamMemberProps) => (
    <div className="relative h-[60vh] w-[80vw] overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.035] shadow-[0_24px_70px_rgba(255,255,255,0.08)] backdrop-blur-md">
        <div className="absolute inset-0">
            <AvatarPlaceholder initial={avatarInitial} tone={tone} />
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t border-white/[0.1] bg-gradient-to-t from-black via-black/88 to-transparent p-6">
            <h3 className="text-3xl font-bold text-zinc-50">{name}</h3>
            <p className="mt-1 text-sm uppercase tracking-widest text-zinc-300">{role}</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{description}</p>
        </div>
    </div>
);

const TeamMemberDesktop = ({ name, role, description, avatarInitial, tone }: TeamMemberProps) => (
    <motion.div
        data-cursor="hover"
        className="group relative h-[clamp(20rem,50vh,28.125rem)] w-[clamp(13rem,21vw,25rem)] flex-shrink-0 cursor-none overflow-hidden rounded-sm border border-white/[0.12] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-md"
        whileHover={{
            y: -6,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 44px 0 rgba(255,255,255,0.12)',
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
    >
        <div className="absolute inset-0 opacity-80 grayscale transition-all duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0">
            <AvatarPlaceholder initial={avatarInitial} tone={tone} />
        </div>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full translate-y-full border-t border-white/[0.12] bg-black/92 p-6 shadow-[0_-18px_50px_rgba(255,255,255,0.06)] backdrop-blur-md transition-transform duration-500 ease-out group-hover:translate-y-0">
            <h3 className="text-xl font-bold text-zinc-50">{name}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-400">{role}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>
    </motion.div>
);

const HighlightGlyph = ({
    glyph,
    index,
    active,
}: {
    glyph: string;
    index: number;
    active: boolean;
}) => {
    const delay = index * 0.028;
    const isSpace = glyph === ' ';

    return (
        <motion.span
            className={`relative inline-block pb-[0.04em] align-baseline will-change-transform ${isSpace ? 'w-[0.32em]' : ''}`}
            animate={{
                y: 0,
                opacity: active ? 1 : isSpace ? 0.64 : 0.74,
                color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.76)',
                textShadow:
                    active && !isSpace
                        ? '0 0 8px rgba(255,255,255,0.32), 0 0 18px rgba(255,255,255,0.11)'
                        : '0 0 0 rgba(255,255,255,0)',
                filter: active ? 'contrast(1.08)' : 'contrast(0.92)',
            }}
            transition={{
                duration: active ? 0.34 : 0.24,
                delay: active ? delay : 0,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {isSpace ? '\u00A0' : glyph}
            <motion.span
                aria-hidden="true"
                className="absolute bottom-0 left-[-0.04em] h-[0.08em] w-[calc(100%+0.08em)] origin-left bg-[#b8b8b8]"
                animate={{
                    scaleX: active ? 1 : 0,
                    opacity: active ? 1 : 0,
                }}
                transition={{
                    duration: active ? 0.34 : 0.24,
                    delay: active ? delay : 0,
                    ease: [0.16, 1, 0.3, 1],
                }}
            />
        </motion.span>
    );
};

const DigitalHighlight = ({ children, active = false }: { children: string; active?: boolean }) => {
    const words = children.trim().split(/\s+/);
    let glyphIndex = 0;

    return (
        <motion.span data-cursor="hover" aria-label={children} className="inline font-semibold">
            {words.map((word, wordIndex) => {
                const letters = Array.from(word);

                return (
                    <span
                        key={`${word}-${wordIndex}`}
                        aria-hidden="true"
                        className="relative inline-block whitespace-nowrap pb-[0.05em]"
                    >
                        {letters.map((glyph, charIndex) => {
                            const currentIndex = glyphIndex;
                            glyphIndex += 1;

                            return (
                                <HighlightGlyph
                                    key={`${glyph}-${wordIndex}-${charIndex}`}
                                    glyph={glyph}
                                    index={currentIndex}
                                    active={active}
                                />
                            );
                        })}
                    {wordIndex < words.length - 1
                        ? (() => {
                            const currentIndex = glyphIndex;
                            glyphIndex += 1;

                            return <HighlightGlyph key={`space-${wordIndex}`} glyph=" " index={currentIndex} active={active} />;
                        })()
                        : null}
                </span>
                );
            })}
        </motion.span>
    );
};

const AnimatedLocationBadge = ({ progress }: { progress: MotionValue<number> }) => {
    const scale = useTransform(progress, [0.78, 0.98], [1, 1.035], { clamp: true });
    const borderColor = useTransform(progress, [0.78, 0.98], ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.34)'], {
        clamp: true,
    });
    const background = useTransform(
        progress,
        [0.78, 0.98],
        [
            'linear-gradient(90deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025), rgba(255,255,255,0.05))',
            'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.055), rgba(255,255,255,0.1))',
        ],
        { clamp: true },
    );
    const boxShadow = useTransform(
        progress,
        [0.78, 0.98],
        [
            'inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 44px rgba(255,255,255,0.04)',
            'inset 0 1px 0 rgba(255,255,255,0.16), 0 22px 58px rgba(255,255,255,0.12)',
        ],
        { clamp: true },
    );
    const dotScale = useTransform(progress, [0.78, 0.98], [1, 1.35], { clamp: true });
    const dotBoxShadow = useTransform(
        progress,
        [0.78, 0.98],
        ['0 0 16px rgba(255,255,255,0.38)', '0 0 28px rgba(255,255,255,0.62)'],
        { clamp: true },
    );

    return (
        <motion.div
            className="mt-6 inline-flex max-w-full origin-left items-center gap-3 rounded-full px-4 py-2.5"
            style={{ scale, borderColor, background, boxShadow, borderWidth: 1, borderStyle: 'solid' }}
        >
            <motion.span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-100"
                style={{ scale: dotScale, boxShadow: dotBoxShadow }}
            />
            <span className="text-sm tracking-wide text-zinc-300">
                Tucumán, Argentina - trabajamos con clientes de todo el país
            </span>
        </motion.div>
    );
};

const LocationBadge = ({ progress, active }: { progress?: MotionValue<number>; active?: boolean }) => {
    if (typeof active === 'boolean') {
        return (
            <motion.div
                className="mt-6 inline-flex max-w-full origin-left items-center gap-3 rounded-full px-4 py-2.5"
                animate={{
                    scale: active ? 1.035 : 1,
                    borderColor: active ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.15)',
                    background: active
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.055), rgba(255,255,255,0.1))'
                        : 'linear-gradient(90deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025), rgba(255,255,255,0.05))',
                    boxShadow: active
                        ? 'inset 0 1px 0 rgba(255,255,255,0.16), 0 22px 58px rgba(255,255,255,0.12)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 44px rgba(255,255,255,0.04)',
                }}
                transition={{ duration: active ? 0.72 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                style={{ borderWidth: 1, borderStyle: 'solid' }}
            >
                <motion.span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-100"
                    animate={{
                        scale: active ? 1.35 : 1,
                        boxShadow: active
                            ? '0 0 28px rgba(255,255,255,0.62)'
                            : '0 0 16px rgba(255,255,255,0.38)',
                    }}
                    transition={{ duration: active ? 0.72 : 0.42, ease: [0.16, 1, 0.3, 1] }}
                />
                <span className="text-sm tracking-wide text-zinc-300">
                    Tucumán, Argentina - trabajamos con clientes de todo el país
                </span>
            </motion.div>
        );
    }

    if (progress) {
        return <AnimatedLocationBadge progress={progress} />;
    }

    return (
        <div className="mt-6 inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r from-white/[0.07] via-white/[0.025] to-white/[0.05] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_44px_rgba(255,255,255,0.04)]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-100 shadow-[0_0_16px_rgba(255,255,255,0.38)]" />
            <span className="text-sm tracking-wide text-zinc-300">
                TucumÃ¡n, Argentina - trabajamos con clientes de todo el paÃ­s
            </span>
        </div>
    );
};

const AboutLogoFilter = ({ filterId }: { filterId: string }) => (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
        <filter
            id={filterId}
            x="-18%"
            y="-18%"
            width="136%"
            height="136%"
            colorInterpolationFilters="sRGB"
        >
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.86 0.52"
                numOctaves="4"
                seed="19"
                result="materializeNoise"
            >
                <animate
                    attributeName="baseFrequency"
                    values="0.86 0.52;0.58 0.36;0.24 0.14;0.001 0.001"
                    keyTimes="0;0.34;0.72;1"
                    dur="760ms"
                    calcMode="spline"
                    keySplines="0.16 1 0.3 1;0.16 1 0.3 1;0.16 1 0.3 1"
                    fill="freeze"
                />
            </feTurbulence>
            <feDisplacementMap
                in="SourceGraphic"
                in2="materializeNoise"
                scale="56"
                xChannelSelector="R"
                yChannelSelector="G"
            >
                <animate
                    attributeName="scale"
                    values="56;38;15;0"
                    keyTimes="0;0.32;0.7;1"
                    dur="760ms"
                    calcMode="spline"
                    keySplines="0.16 1 0.3 1;0.16 1 0.3 1;0.16 1 0.3 1"
                    fill="freeze"
                />
            </feDisplacementMap>
        </filter>
    </svg>
);

const AboutLogoMark = ({ active }: { active: boolean }) => {
    const filterId = `about-logo-materialize-${useId().replace(/:/g, '')}`;
    const filterStyle = {
        '--about-logo-materialize-filter': `url(#${filterId})`,
    } as React.CSSProperties;

    return (
        <div className="relative isolate overflow-visible px-[clamp(0.75rem,2.5vw,2rem)] pb-[clamp(1.4rem,3vw,3rem)]">
            {active ? <AboutLogoFilter filterId={filterId} /> : null}

            <div
                aria-hidden="true"
                className={`about-logo-shadow pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-[50%] ${active ? 'is-active' : ''}`}
                style={{
                    top: ABOUT_HERO_LOGO_SHADOW_TOP,
                    width: ABOUT_HERO_LOGO_SHADOW_WIDTH,
                    height: ABOUT_HERO_LOGO_SHADOW_HEIGHT,
                    '--about-logo-shadow-opacity': ABOUT_HERO_LOGO_SHADOW_OPACITY,
                    background:
                        'radial-gradient(ellipse at center, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.28) 30%, rgba(255,255,255,0.1) 56%, transparent 84%)',
                } as React.CSSProperties}
            />

            <div
                className={`about-logo-materialize relative z-10 text-center font-black text-zinc-50 ${active ? 'is-active' : ''}`}
                style={{
                    ...filterStyle,
                    fontSize: ABOUT_HERO_LOGO_TEXT_SIZE,
                    lineHeight: ABOUT_HERO_LOGO_LINE_HEIGHT,
                    letterSpacing: ABOUT_HERO_LOGO_TRACKING,
                }}
            >
                <KineticText>
                    <span>SOMOS</span>
                    <br />
                    <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text px-[0.08em] text-transparent">
                        develOP
                    </span>
                </KineticText>
            </div>
        </div>
    );
};

const AboutMobile = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const x = useTransform(scrollYProgress, [0, 1], ['0%', '-300vw']);
    const inViewRef = useRef(null);
    const isInView = useInView(inViewRef, { margin: '-10%' });
    const logoRevealRef = useRef<HTMLDivElement>(null);
    const isLogoRevealInView = useInView(logoRevealRef, { amount: 0.75, once: true });

    useThemeSection(isInView, 'light');

    return (
        <div ref={targetRef} className="relative block h-[400vh] bg-black md:hidden" id="nosotros">
            <div ref={inViewRef} className="pointer-events-none absolute top-0 h-[20vh] w-full" />
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex">
                    <div ref={logoRevealRef} className="flex h-screen w-[100vw] flex-shrink-0 items-center justify-center bg-black">
                        <AboutLogoMark active={isLogoRevealInView} />
                    </div>

                    <div className="flex h-screen w-[100vw] flex-shrink-0 items-center bg-black p-8">
                        <div className="border-l border-white/15 pl-6">
                            <p className="text-2xl font-light leading-tight text-zinc-300">
                                No somos una agencia más.
                                <br />
                                Somos el{' '}
                                <DigitalHighlight>
                                    equipo técnico que tu empresa necesitaba.
                                </DigitalHighlight>
                            </p>
                            <p className="mt-6 text-base leading-relaxed text-zinc-500">
                                Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio
                                crezca sin depender de vos todo el tiempo.
                            </p>
                            <LocationBadge />
                        </div>
                    </div>

                    <div className="flex h-screen w-[100vw] flex-shrink-0 items-center justify-center bg-black">
                        <TeamMemberMobile {...teamMembers[0]} />
                    </div>

                    <div className="flex h-screen w-[100vw] flex-shrink-0 items-center justify-center bg-black">
                        <TeamMemberMobile {...teamMembers[1]} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const AboutDesktop = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const x = useTransform(scrollYProgress, [0, 0.12, 0.82], ['0vw', '0vw', '-100vw']);
    const [isFinalEffectActive, setIsFinalEffectActive] = useState(false);
    const inViewRef = useRef(null);
    const isInView = useInView(inViewRef, { margin: '-20%' });
    const logoRevealRef = useRef<HTMLDivElement>(null);
    const isLogoRevealInView = useInView(logoRevealRef, { amount: 0.75, once: true });

    useThemeSection(isInView, 'light');

    useMotionValueEvent(scrollYProgress, 'change', (latest) => {
        setIsFinalEffectActive(latest >= 0.8);
    });

    return (
        <div ref={targetRef} className="relative hidden h-[400vh] bg-black md:block" id="nosotros">
            <div className="pointer-events-none absolute left-0 top-0 z-20 h-64 w-full bg-gradient-to-b from-black to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_42%,rgba(255,255,255,0.075),transparent_28%),radial-gradient(circle_at_77%_48%,rgba(255,255,255,0.055),transparent_30%)]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.34) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 76%, transparent 100%)',
                }}
            />

            <div ref={inViewRef} className="pointer-events-none absolute top-0 h-[20vh] w-full" />
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex items-center">
                    <div ref={logoRevealRef} className="flex h-screen w-screen flex-shrink-0 items-center justify-center px-[clamp(1rem,3vw,4rem)]">
                        <AboutLogoMark active={isLogoRevealInView} />
                    </div>

                    <div className="flex h-screen w-screen flex-shrink-0 items-center justify-center px-[clamp(1.25rem,4vw,5rem)]">
                        <div className="flex w-full max-w-[112rem] items-center justify-center gap-[clamp(1.5rem,4vw,6rem)]">
                            <div className="flex w-[clamp(20rem,42vw,56rem)] flex-shrink-0 flex-col justify-center gap-8 border-l border-white/[0.08] pl-[clamp(1.5rem,3vw,3.5rem)]">
                                <p className="text-3xl font-light leading-tight text-zinc-300 md:text-4xl xl:text-5xl">
                                    No somos una agencia más.
                                    <br />
                                    Somos el{' '}
                                    <DigitalHighlight active={isFinalEffectActive}>
                                        equipo técnico que tu empresa necesitaba.
                                    </DigitalHighlight>
                                </p>
                                <p className="max-w-2xl text-lg leading-relaxed text-zinc-500 xl:text-xl">
                                    Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio
                                    crezca sin depender de vos todo el tiempo.
                                </p>
                                <LocationBadge active={isFinalEffectActive} />
                            </div>

                            <div className="flex flex-shrink-0 items-center gap-8">
                                <TeamMemberDesktop {...teamMembers[0]} />
                                <TeamMemberDesktop {...teamMembers[1]} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export const About = () => (
    <section id="about">
        <AboutMobile />
        <AboutDesktop />
    </section>
);

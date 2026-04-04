'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useThemeSection } from '@/hooks/useThemeObserver';
import { KineticText } from '@/components/ui/KineticText';

// Shared Interfaces
interface TeamMemberProps {
    name: string;
    role: string;
    description: string;
    skills: string[];
    avatarInitial: string;
    avatarGradient: string;
}

// Avatar placeholder styled con iniciales
const AvatarPlaceholder = ({ initial, gradient }: { initial: string; gradient: string }) => (
    <motion.div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
    >
        <span className="text-black font-black text-8xl select-none">{initial}</span>
    </motion.div>
);

// Mobile Team Member Card
const TeamMemberMobile = ({ name, role, description, skills, avatarInitial, avatarGradient }: TeamMemberProps) => (
    <div className="relative w-[80vw] h-[60vh] bg-white/[0.03] overflow-hidden rounded-2xl border border-white/[0.08] backdrop-blur-md">
        <div className="absolute inset-0">
            <AvatarPlaceholder initial={avatarInitial} gradient={avatarGradient} />
        </div>
        <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent w-full">
            <h3 className="font-bold text-3xl text-zinc-50">{name}</h3>
            <p className="text-sm text-zinc-400 tracking-widest uppercase mt-1">{role}</p>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
                {skills.map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

// Desktop Team Member Card (Original)
const TeamMemberDesktop = ({ name, role, description, skills, avatarInitial, avatarGradient }: TeamMemberProps) => (
    <motion.div
        data-cursor="hover"
        className="group relative w-[400px] h-[450px] bg-white/[0.03] overflow-hidden rounded-sm flex-shrink-0 border border-white/[0.08] backdrop-blur-md cursor-none"
        whileHover={{ y: -6, boxShadow: '0 0 32px 0 rgba(34,211,238,0.12)' }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
    >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100">
            <AvatarPlaceholder initial={avatarInitial} gradient={avatarGradient} />
        </div>
        <div className="absolute bottom-0 left-0 p-6 bg-zinc-950/95 backdrop-blur-md w-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out border-t border-white/[0.08]">
            <h3 className="font-bold text-xl text-zinc-50">{name}</h3>
            <p className="text-xs text-zinc-500 tracking-widest uppercase mt-1">{role}</p>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
                {skills.map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    </motion.div>
);

// Shared Component: Digital Underline Highlighting
const DigitalHighlight = ({ children }: { children: React.ReactNode }) => {
    return (
        <span
            className="relative inline-block font-bold text-zinc-50 cursor-none"
            data-cursor="hover"
        >
            <span className="relative z-10">{children}</span>
            <motion.span
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: false, margin: "-10%" }}
                transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 to-blue-600 origin-left"
            />
        </span>
    );
};

// Location badge
const LocationBadge = () => (
    <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02]">
        <span className="text-base">📍</span>
        <span className="text-sm text-zinc-400 tracking-wide">
            Tucumán, Argentina — trabajamos con clientes de todo el país
        </span>
    </div>
);

// Team data
const teamMembers: TeamMemberProps[] = [
    {
        name: "Franco",
        role: "Co-Founder & Lead Developer",
        description: "Desarrollo web, IA y arquitectura de sistemas. Convierto ideas de negocio en productos digitales que funcionan solos.",
        skills: ["Next.js", "IA", "n8n", "TypeScript"],
        avatarInitial: "F",
        avatarGradient: "from-cyan-500 to-green-500",
    },
    {
        name: "Equipo develOP",
        role: "Full Stack & Automatizaciones",
        description: "Backend, bases de datos y flujos de automatización. Hacemos que los sistemas trabajen solos.",
        skills: ["Node.js", "PostgreSQL", "n8n", "APIs"],
        avatarInitial: "D",
        avatarGradient: "from-violet-500 to-cyan-500",
    },
];

// -----------------------------------------------------------------------------
// MOBILE IMPLEMENTATION (NEW LOGIC)
// -----------------------------------------------------------------------------
const AboutMobile = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    // Drive horizontal scroll from 0 to -300vw (showing 4 slides of 100vw each)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-300vw"]);

    const inViewRef = useRef(null);
    const isInView = useInView(inViewRef, { margin: "-10%" });
    useThemeSection(isInView, 'light');

    return (
        <div ref={targetRef} className="relative h-[400vh] bg-zinc-950 block md:hidden" id='nosotros'>
            {/* Trigger for theme observer */}
            <div ref={inViewRef} className="absolute top-0 h-[20vh] w-full pointer-events-none" />

            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                <motion.div style={{ x }} className="flex">

                    {/* SLIDE 1: Title */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <div className="flex flex-col items-center">
                            <h2 className="text-5xl font-black text-white tracking-tighter text-center leading-none">
                                <KineticText>
                                    SOMOS<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r pl-4 pr-5 from-zinc-300 to-zinc-600">
                                        develOP
                                    </span>
                                </KineticText>
                            </h2>
                        </div>
                    </div>

                    {/* SLIDE 2: Description */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0 p-8">
                        <div className="flex flex-col gap-6">
                            <p className="text-2xl font-light text-zinc-400 leading-tight">
                                No somos una agencia más. <br />
                                <span className="mr-2">Somos el</span>
                                <DigitalHighlight>
                                    equipo técnico que tu empresa necesitaba.
                                </DigitalHighlight>
                            </p>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio crezca sin depender de vos todo el tiempo.
                            </p>
                            <LocationBadge />
                        </div>
                    </div>

                    {/* SLIDE 3: Profile 1 */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <TeamMemberMobile {...teamMembers[0]} />
                    </div>

                    {/* SLIDE 4: Profile 2 */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <TeamMemberMobile {...teamMembers[1]} />
                    </div>

                </motion.div>
            </div>
        </div>
    );
};


// -----------------------------------------------------------------------------
// DESKTOP IMPLEMENTATION (ORIGINAL LOGIC)
// -----------------------------------------------------------------------------
const AboutDesktop = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });

    // Logic: Animation finishes at 75% of scroll, holding position for the remaining 25%
    const x = useTransform(scrollYProgress, [0, 0.75], ["2%", "-48%"]);

    const inViewRef = useRef(null);
    const isInView = useInView(inViewRef, { margin: "-20%" });
    useThemeSection(isInView, 'light');

    return (
        <div ref={targetRef} className="relative h-[400vh] bg-zinc-950 hidden md:block" id='nosotros'>
            {/* Top Fade (Integration with Hero) */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-zinc-950 to-transparent z-20 pointer-events-none" />

            <div ref={inViewRef} className="absolute top-0 h-[20vh] w-full pointer-events-none" />
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-20 px-20 items-center">
                    {/* SLIDE 1 */}
                    <div className="flex-shrink-0 min-w-[80vw] flex items-center">
                        <div className="text-[10rem] md:text-[14rem] leading-[0.8] font-black tracking-tighter text-zinc-50">
                            <KineticText>
                                <span className="pl-50">
                                    SOMOS
                                </span><br />
                                <span className="text-transparent pl-50 bg-clip-text bg-gradient-to-r from-zinc-300 pr-50 to-zinc-600">
                                    develOP
                                </span>
                            </KineticText>
                        </div>
                    </div>
                    {/* SLIDE 2 */}
                    <div className="flex-shrink-0 w-[60vw] max-w-4xl flex flex-col justify-center gap-8 pl-20 border-l border-zinc-800">
                        <p className="text-3xl md:text-5xl font-light text-zinc-400 leading-tight">
                            No somos una agencia más. <br />
                            <span className="mr-2">Somos el</span>
                            <DigitalHighlight>
                                equipo técnico que tu empresa necesitaba.
                            </DigitalHighlight>
                        </p>
                        <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
                            Combinamos desarrollo web, inteligencia artificial y automatizaciones para que tu negocio crezca sin depender de vos todo el tiempo.
                        </p>
                        <LocationBadge />
                    </div>
                    {/* SLIDE 3 */}
                    <div className="flex-shrink-0 flex gap-8 items-center pl-5">
                        <TeamMemberDesktop {...teamMembers[0]} />
                        <TeamMemberDesktop {...teamMembers[1]} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export const About = () => {
    return (
        <section id="about">
            <AboutMobile />
            <AboutDesktop />
        </section>
    );
};

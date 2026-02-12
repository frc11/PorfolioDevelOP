'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useThemeSection } from '@/hooks/useThemeObserver';
import { KineticText } from '@/components/ui/KineticText';

// Shared Interfaces
interface TeamMemberProps {
    name: string;
    role: string;
    img: string;
}

// Mobile Team Member Card
const TeamMemberMobile = ({ name, role, img }: TeamMemberProps) => (
    <div className="relative w-[80vw] h-[60vh] bg-zinc-900 overflow-hidden rounded-2xl border border-zinc-800">
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute bottom-0 left-0 p-6 bg-transparent bg-gradient-to-t from-black/90 to-transparent w-full">
            <h3 className="font-bold text-3xl text-zinc-50">{name}</h3>
            <p className="text-sm text-zinc-400 tracking-widest uppercase mt-1">{role}</p>
        </div>
    </div>
);

// Desktop Team Member Card (Original)
const TeamMemberDesktop = ({ name, role, img }: TeamMemberProps) => (
    <div
        data-cursor="hover"
        className="group relative w-[400px] h-[450px] bg-zinc-900 overflow-hidden rounded-sm flex-shrink-0 border border-zinc-800 cursor-none"
    >
        <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
            style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute bottom-0 left-0 p-6 bg-zinc-950/95 backdrop-blur-sm w-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out border-t border-zinc-800">
            <h3 className="font-bold text-xl text-zinc-50">{name}</h3>
            <p className="text-xs text-zinc-500 tracking-widest uppercase mt-1">{role}</p>
        </div>
    </div>
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
        <div ref={targetRef} className="relative h-[400vh] bg-zinc-950 block md:hidden">
            {/* Trigger for theme observer */}
            <div ref={inViewRef} className="absolute top-0 h-[20vh] w-full pointer-events-none" />

            <div className="sticky top-0 h-screen overflow-hidden flex items-center">
                <motion.div style={{ x }} className="flex">

                    {/* SLIDE 1: Title */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <div className="flex flex-col items-center">
                            <h2 className="text-5xl font-black text-white tracking-tighter text-center leading-none">
                                WE ARE<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">
                                    ARCHITECTS
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* SLIDE 2: Description */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0 p-8">
                        <div className="flex flex-col gap-6">
                            <p className="text-2xl font-light text-zinc-400 leading-tight">
                                No somos solo programadores. <br />
                                <span className="mr-2">Somos</span>
                                <DigitalHighlight>
                                    estrategas digitales.
                                </DigitalHighlight>
                            </p>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Fusionamos la lógica matemática con la emoción humana para crear productos que no solo funcionan, sino que se sienten.
                            </p>
                        </div>
                    </div>

                    {/* SLIDE 3: Profile 1 */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <TeamMemberMobile
                            name="Alex Dev"
                            role="Lead Architect"
                            img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
                        />
                    </div>

                    {/* SLIDE 4: Profile 2 */}
                    <div className="w-[100vw] h-screen flex items-center justify-center bg-zinc-950 flex-shrink-0">
                        <TeamMemberMobile
                            name="Mike Ops"
                            role="Full Stack"
                            img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
                        />
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
        <div ref={targetRef} className="relative h-[400vh] bg-zinc-950 hidden md:block">
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
                                    WE ARE
                                </span><br />
                                <span className="text-transparent pl-50 bg-clip-text bg-gradient-to-r from-zinc-300 pr-50 to-zinc-600">
                                    ARCHITECTS
                                </span>
                            </KineticText>
                        </div>
                    </div>
                    {/* SLIDE 2 - UPDATED TEXT */}
                    <div className="flex-shrink-0 w-[60vw] max-w-4xl flex flex-col justify-center gap-8 pl-20 border-l border-zinc-800">
                        <p className="text-3xl md:text-5xl font-light text-zinc-400 leading-tight">
                            No somos solo programadores. <br />
                            <span className="mr-2">Somos</span>
                            <DigitalHighlight>
                                estrategas digitales.
                            </DigitalHighlight>
                        </p>
                        <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
                            Fusionamos la lógica matemática con la emoción humana para crear productos que no solo funcionan, sino que se sienten. Diseñamos sistemas que escalan y experiencias que perduran.
                        </p>
                    </div>
                    {/* SLIDE 3 */}
                    <div className="flex-shrink-0 flex gap-8 items-center pl-5">
                        <TeamMemberDesktop name="Alex Dev" role="Lead Architect" img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" />
                        <TeamMemberDesktop name="Mike Ops" role="Full Stack" img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop" />
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

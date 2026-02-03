'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useThemeSection } from '@/hooks/useThemeObserver';
import { KineticText } from '@/components/ui/KineticText';

interface TeamMemberProps {
    name: string;
    role: string;
    img: string;
}

const TeamMember = ({ name, role, img }: TeamMemberProps) => (
    <div className="group relative w-[300px] h-[450px] bg-zinc-900 overflow-hidden rounded-sm flex-shrink-0 border border-zinc-800">
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

export const TheStudio = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: targetRef });
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);
    const inViewRef = useRef(null);
    const isInView = useInView(inViewRef, { margin: "-20%" });
    useThemeSection(isInView, 'light');

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-zinc-950">
            <div ref={inViewRef} className="absolute top-0 h-[20vh] w-full pointer-events-none" />
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div style={{ x }} className="flex gap-20 px-20 items-center">
                    {/* SLIDE 1 */}
                    <div className="flex-shrink-0 w-[80vw] flex items-center">
                        <div className="text-[10rem] md:text-[14rem] leading-[0.8] font-black tracking-tighter text-zinc-50">
                            <KineticText>
                                WE ARE<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-600 to-zinc-300">
                                    ARCHITECTS
                                </span>
                            </KineticText>
                        </div>
                    </div>
                    {/* SLIDE 2 */}
                    <div className="flex-shrink-0 w-[60vw] max-w-4xl flex flex-col justify-center gap-8 pl-20 border-l border-zinc-800">
                        <p className="text-3xl md:text-5xl font-light text-zinc-400 leading-tight">
                            No somos solo programadores. <br />
                            <span className="font-bold text-zinc-50">Somos estrategas digitales.</span>
                        </p>
                        <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl">
                            Fusionamos la lógica matemática con la emoción humana para crear productos que no solo funcionan, sino que se sienten. Diseñamos sistemas que escalan y experiencias que perduran.
                        </p>
                    </div>
                    {/* SLIDE 3 */}
                    <div className="flex-shrink-0 flex gap-8 items-center pl-20">
                        <TeamMember name="Alex Dev" role="Lead Architect" img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" />
                        <TeamMember name="Sarah Design" role="Creative Director" img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop" />
                        <TeamMember name="Mike Ops" role="Full Stack" img="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop" />
                        <TeamMember name="Elena UI" role="Interaction Design" img="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

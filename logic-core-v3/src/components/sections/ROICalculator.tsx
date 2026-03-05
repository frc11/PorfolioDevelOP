'use client';
import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Calculator, Clock, DollarSign, Zap, Crosshair } from 'lucide-react';
import { MagneticCta } from '@/components/ui/buttons/MagneticCta';
import { useTransitionContext } from '@/context/TransitionContext';

// Animated Counter Component for the Money Value
const AnimatedCounter = ({ value }: { value: number }) => {
    // We use a spring for a smooth hardware-accelerated counting effect
    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
        mass: 1,
    });

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    // Format the number with commas
    const displayValue = useTransform(springValue, (current) =>
        Math.round(current).toLocaleString('en-US')
    );

    return <motion.span>{displayValue}</motion.span>;
};

export const ROICalculator = () => {
    const { triggerTransition } = useTransitionContext();
    // Start with a relatable default value
    const [hoursPerWeek, setHoursPerWeek] = useState(50);

    // Constants for calculation
    const HOURLY_RATE = 20; // Estimated cost per hour in USD
    const WEEKS_PER_MONTH = 4;

    // Derived metrics
    const hoursSavedPerMonth = hoursPerWeek * WEEKS_PER_MONTH;
    const moneySavedPerMonth = hoursSavedPerMonth * HOURLY_RATE;

    const handleCalculate = () => {
        // Trigger generic contact or lead capture transition
        triggerTransition('/contact');
    };

    return (
        <section className="relative w-full py-32 bg-zinc-950 overflow-hidden text-center z-10 font-sans selection:bg-cyan-500/30">
            {/* Quantum Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-fuchsia-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />

                {/* Micro-grid overlay */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />
            </div>

            <div className="container mx-auto px-6 max-w-5xl relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6"
                    >
                        <Calculator className="w-4 h-4" />
                        <span>Métricas de Decisión</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight"
                    >
                        Calcula tu <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                            Retorno de Inversión (ROI)
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light"
                    >
                        Descubre cuántas horas y dinero pierde tu equipo en tareas repetitivas cada mes. La automatización no es un gasto, es multiplicador de capital.
                    </motion.p>
                </div>

                {/* Main Dashboard Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 20 }}
                    className="w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    {/* Top glass reflection */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="flex flex-col gap-12">
                        {/* Interactive Section */}
                        <div className="w-full max-w-3xl mx-auto text-left">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Crosshair className="w-5 h-5 text-cyan-400" />
                                        Horas manuales por semana
                                    </h3>
                                    <p className="text-sm text-zinc-500 mt-1">Tiempo invertido por todo tu equipo en trabajo operativo y data entry.</p>
                                </div>
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white font-mono">
                                    {hoursPerWeek} <span className="text-lg text-zinc-500 font-sans tracking-normal font-medium">hrs</span>
                                </div>
                            </div>

                            {/* Custom Slider */}
                            <div className="relative w-full h-8 flex items-center group">
                                <div className="absolute inset-0 bg-zinc-950 rounded-full h-3 my-auto shadow-inner overflow-hidden border border-white/5">
                                    {/* Liquid Fill Effect */}
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                        style={{ width: `${((hoursPerWeek - 10) / 490) * 100}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="500"
                                    step="5"
                                    value={hoursPerWeek}
                                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                                    className="w-full absolute z-10 opacity-0 cursor-ew-resize h-full"
                                />
                                {/* Custom Thumb injected via math to follow the invisible range input */}
                                <div
                                    className="absolute h-6 w-6 bg-white rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] pointer-events-none transition-transform group-hover:scale-110 flex items-center justify-center -ml-3"
                                    style={{ left: `${((hoursPerWeek - 10) / 490) * 100}%` }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                </div>
                            </div>

                            <div className="flex justify-between text-xs text-zinc-600 mt-3 font-mono">
                                <span>10 hrs</span>
                                <span>250 hrs</span>
                                <span>500+ hrs</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Output Metrics Panels */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Metric 1 */}
                            <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5 relative group hover:border-fuchsia-500/30 transition-colors">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/0 to-transparent group-hover:via-fuchsia-500/50 transition-colors" />
                                <div className="flex items-center gap-3 text-zinc-400 mb-4">
                                    <Clock className="w-5 h-5 text-fuchsia-400" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">Tiempo Recuperado</span>
                                </div>
                                <div className="text-4xl font-black text-white font-mono flex items-baseline gap-2">
                                    <AnimatedCounter value={hoursSavedPerMonth} />
                                    <span className="text-base font-medium text-zinc-500 font-sans tracking-normal">hrs / mes</span>
                                </div>
                            </div>

                            {/* Metric 2 - The Big One */}
                            <div className="bg-gradient-to-b from-cyan-950/40 to-black/40 rounded-2xl p-6 border border-cyan-500/30 shadow-[inset_0_0_30px_rgba(34,211,238,0.05)] relative transform md:-translate-y-4">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-cyan-400 shadow-[0_0_10px_cyan]" />
                                <div className="flex items-center gap-3 text-cyan-200 mb-4 justify-center md:justify-start">
                                    <DollarSign className="w-5 h-5 text-cyan-400" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">Ahorro Estimado</span>
                                </div>
                                <div className="text-5xl font-black text-white font-mono flex items-baseline justify-center md:justify-start gap-1">
                                    <span className="text-cyan-400">$</span>
                                    <AnimatedCounter value={moneySavedPerMonth} />
                                </div>
                                <div className="text-xs text-cyan-400/50 mt-2 font-mono uppercase tracking-widest text-center md:text-left">
                                    USD / Mes
                                </div>
                            </div>

                            {/* Metric 3 */}
                            <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5 relative group hover:border-cyan-500/30 transition-colors">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-colors" />
                                <div className="flex items-center gap-3 text-zinc-400 mb-4">
                                    <Zap className="w-5 h-5 text-cyan-400" />
                                    <span className="text-sm font-semibold uppercase tracking-wider">Impacto ROI</span>
                                </div>
                                <div className="text-4xl font-black text-white font-mono flex items-baseline gap-2">
                                    10<span className="text-cyan-400">x</span>
                                </div>
                                <div className="text-xs text-zinc-500 mt-2">
                                    Multiplicador de eficiencia.
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 flex flex-col items-center"
                >
                    <MagneticCta
                        onClick={handleCalculate}
                        variant="primary"
                    >
                        Quiero Automatizar Mi Empresa
                    </MagneticCta>
                    <p className="text-zinc-500 text-sm mt-6 font-mono tracking-wide">
                        * Cálculo estimado basado en un costo operativo de $20 USD / hora.
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

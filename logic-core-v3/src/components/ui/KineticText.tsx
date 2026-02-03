'use client';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';

export const KineticText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

    // Mapear velocidad a inclinación (ajusta el rango [-1000, 1000] según gusto)
    // Skew effect: text tilts based on scroll speed
    const skewX = useTransform(smoothVelocity, [-1000, 1000], [-15, 15], { clamp: false });

    return (
        <div className={`overflow-hidden ${className}`}>
            <motion.div style={{ skewX }} className="origin-bottom">
                {children}
            </motion.div>
        </div>
    );
};

'use client';
<<<<<<< HEAD
=======
import { useEffect } from 'react';
>>>>>>> d1903b4efb17fa61d6249ed6cc8e0ece8fc8db98
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

export const KineticText = ({
    children,
    className,
    enabled = true,
}: {
    children: React.ReactNode;
    className?: string;
    enabled?: boolean;
}) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 72,
        stiffness: 240,
        mass: 0.72,
    });
    const kineticStrength = useSpring(enabled ? 1 : 0, {
        damping: 34,
        stiffness: 180,
        mass: 0.58,
    });

    useEffect(() => {
        kineticStrength.set(enabled ? 1 : 0);
    }, [enabled, kineticStrength]);

    const skewX = useTransform([smoothVelocity, kineticStrength], ([velocity, strength]) => {
        const clampedVelocity = Math.max(-1100, Math.min(1100, velocity));
        return (clampedVelocity / 1100) * 10 * strength;
    });

    return (
        <div className={`overflow-hidden px-[0.08em] pb-[0.08em] pt-[0.03em] ${className}`}>
            <motion.div style={{ skewX }} className="origin-bottom">
                {children}
            </motion.div>
        </div>
    );
};

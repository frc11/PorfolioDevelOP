'use client';
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';

export const KineticText = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 72,
        stiffness: 240,
        mass: 0.72,
    });
    const skewX = useTransform(smoothVelocity, [-1100, 1100], [-10, 10], {
        clamp: true,
    });

    return (
        <div className={`overflow-hidden px-[0.08em] pb-[0.08em] pt-[0.03em] ${className}`}>
            <motion.div style={{ skewX }} className="origin-bottom">
                {children}
            </motion.div>
        </div>
    );
};

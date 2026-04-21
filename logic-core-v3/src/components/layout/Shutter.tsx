'use client';

import { motion } from 'framer-motion';
import { useTransitionContext } from '@/context/TransitionContext';

export const Shutter = () => {
    const { isAnimating } = useTransitionContext();

    return (
        <motion.div
            className="fixed inset-0 w-screen h-[100lvh] z-[9999] pointer-events-none bg-[#030305]"
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
    );
};

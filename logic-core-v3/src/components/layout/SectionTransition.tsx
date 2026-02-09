import { useThemeSection } from '@/hooks/useThemeObserver';
import { useInView } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface SectionTransitionProps {
    className?: string;
    height?: string;
    children?: ReactNode;
}


export const SectionTransition = ({ className = "", height = "h-32", children }: SectionTransitionProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, {
        once: false,
        margin: '50%'
    });

    // Trigger dark mode
    useThemeSection(isInView, 'dark');

    return (
        <div ref={ref} className={`w-full relative pointer-events-none ${height} ${className}`}>
            {children}
        </div>
    );
};

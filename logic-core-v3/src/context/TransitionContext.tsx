'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TransitionContextType {
    isAnimating: boolean;
    triggerTransition: (targetId: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
    const [isAnimating, setIsAnimating] = useState(false);

    const triggerTransition = (targetId: string) => {
        if (isAnimating) return; // Prevent double triggers

        // 1. Start Close Animation
        setIsAnimating(true);

        // 2. Wait for panels to close completely (assuming 500ms duration)
        // We give it slightly less than total animation to start scrolling while covered?
        // Or exactly match? User said: "Wait 500ms (Panels close)."
        setTimeout(() => {
            // 3. Teleport (Scroll)
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else {
                console.warn(`Target element "${targetId}" not found.`);
                // Fallback or handle error? If not found, maybe just stop animating?
                // But we need to open the panels anyway.
            }

            // 4. Wait for scroll stabilization / "Teleport" feeling
            setTimeout(() => {
                // 5. Start Open Animation
                setIsAnimating(false);
            }, 100);

        }, 500);
    };

    return (
        <TransitionContext.Provider value={{ isAnimating, triggerTransition }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function useTransitionContext() {
    const context = useContext(TransitionContext);
    if (context === undefined) {
        throw new Error('useTransitionContext must be used within a TransitionProvider');
    }
    return context;
}

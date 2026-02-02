'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Hook to observe a section and update theme when it enters viewport
 * @param isInView - Boolean from useInView hook
 * @param themeToSet - Theme to set when section is in view
 */
export function useThemeSection(isInView: boolean, themeToSet: Theme) {
    const { setTheme } = useTheme();

    // Update theme when section enters viewport - wrapped in useEffect to avoid render-phase updates
    useEffect(() => {
        if (isInView) {
            setTheme(themeToSet);
        }
    }, [isInView, themeToSet, setTheme]);
}

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

    // Sync with DOM for CSS variable interpolation
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
    }, [theme]);

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

export function useThemeSection(isInView: boolean, themeToSet: Theme) {
    const { setTheme } = useTheme();

    useEffect(() => {
        if (isInView) {
            setTheme(themeToSet);
        }
    }, [isInView, themeToSet, setTheme]);
}

/**
 * Igual que `useThemeSection`, pero no explota si no hay `ThemeProvider` arriba:
 * en ese caso simplemente no hace nada.
 *
 * Lo necesita `SectionShell` (sistema de diseño del rediseño, B1-S2): ese
 * componente tiene que poder renderizar fuera del árbol del home — el
 * styleguide, y cualquier página que arme secciones sin montar el provider —
 * y `useTheme()` tira si el contexto está `undefined`.
 *
 * Agregado sin tocar `useTheme` ni `useThemeSection`: los consumidores
 * existentes (About, WhyDevelOP, SectionTransition) no cambian de conducta.
 */
export function useThemeSectionOptional(isInView: boolean, themeToSet: Theme) {
    const context = useContext(ThemeContext);
    const setTheme = context?.setTheme;

    useEffect(() => {
        if (isInView && setTheme) {
            setTheme(themeToSet);
        }
    }, [isInView, themeToSet, setTheme]);
}

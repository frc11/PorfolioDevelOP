// ─────────────────────────────────────────────────────────
// AI Companion Design Tokens
// Centralized color palette and shadow system
// ─────────────────────────────────────────────────────────

export const COLORS = {
    primary: {
        cyan: {
            50: '#ecfeff',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
        },
        purple: {
            400: '#c026d3',
            500: '#a21caf',
            600: '#86198f',
        },
        violet: {
            400: '#a78bfa',
            500: '#8b5cf6',
        },
    },

    glass: {
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(255, 255, 255, 0.12)',
    },

    bg: {
        deepest: '#000000',
        deep: '#09090b',
        base: '#0a0a0a',
        elevated: '#18181b',
    },

    status: {
        active: '#22d3ee',
        thinking: '#8b5cf6',
        idle: '#71717a',
        error: '#ef4444',
    },
} as const;

export const SHADOWS = {
    glow: {
        cyan: '0 0 20px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.1)',
        purple: '0 0 20px rgba(192, 38, 211, 0.3), 0 0 60px rgba(192, 38, 211, 0.1)',
        soft: '0 0 30px rgba(34, 211, 238, 0.08), 0 0 80px rgba(139, 92, 246, 0.05)',
    },

    depth: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)',
    },
} as const;

// Type exports for consuming components
export type ColorToken = typeof COLORS;
export type ShadowToken = typeof SHADOWS;

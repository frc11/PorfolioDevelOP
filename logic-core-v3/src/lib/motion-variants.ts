import type { Transition, Variants } from 'motion/react'

export const standardEase = [0.25, 0.46, 0.45, 0.94] as const

// === FADE + SLIDE UP (reveals) ===
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

export const fadeUpTransition: Transition = {
  duration: 0.4,
  ease: standardEase,
}

// === FADE only ===
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

// === STAGGER container (para listas) ===
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

// === STAGGER item ===
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: standardEase,
    },
  },
}

// === SCALE IN (modales, popovers) ===
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: standardEase },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.12 },
  },
}

// === SPRING para layout ===
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

// === BUTTON PRESS ===
export const buttonPress = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 600, damping: 25 },
} as const

// === HOVER LIFT ===
export const hoverLift = {
  whileHover: { y: -2 },
  transition: { duration: 0.2, ease: standardEase },
} as const

'use client'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { useEffect, useState } from 'react'

export function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false)

    // Use springs for smooth movement
    const cursorX = useSpring(0, { stiffness: 450, damping: 25 })
    const cursorY = useSpring(0, { stiffness: 450, damping: 25 })

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 10) // Center the 20px cursor
            cursorY.set(e.clientY - 10)
        }

        const handleHover = (e: Event) => {
            const target = e.target as HTMLElement
            // Check if the target or its parent is interactive
            const isInteractive =
                target.matches('button, a, input, textarea, [role="button"]') ||
                target.closest('button, a, input, textarea, [role="button"]') ||
                window.getComputedStyle(target).cursor === 'pointer'

            setIsHovering(!!isInteractive)
        }

        window.addEventListener('mousemove', moveCursor)
        document.addEventListener('mouseover', handleHover)
        document.addEventListener('mouseout', handleHover)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            document.removeEventListener('mouseover', handleHover)
            document.removeEventListener('mouseout', handleHover)
        }
    }, [cursorX, cursorY])

    return (
        <>
            {/* Main Cursor Ring */}
            <motion.div
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    borderColor: isHovering ? '#00ffff' : 'rgba(255, 255, 255, 0.3)',
                }}
                transition={{ duration: 0.15 }} // Transition for scale/color
                className="fixed top-0 left-0 w-5 h-5 z-[9999] pointer-events-none rounded-full border border-white/30 mix-blend-difference"
            />
            {/* Optional: Tiny center dot for precision */}
            <motion.div
                style={{
                    x: cursorX,
                    y: cursorY,
                }}
                className="fixed top-0 left-0 w-5 h-5 z-[9999] pointer-events-none flex items-center justify-center opacity-50 mix-blend-difference"
            >
                <div className="w-1 h-1 bg-white rounded-full" />
            </motion.div>
        </>
    )
}

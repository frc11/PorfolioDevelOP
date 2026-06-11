'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Forces the R3F canvas to match its DOM container's real size.
 *
 * R3F sizes its canvas from react-use-measure (a ResizeObserver). When a Canvas
 * mounts during the app's heavy first paint inside a nested/flex container, that
 * initial measure can be lost, leaving the canvas stuck at the 300x150 browser
 * default until some unrelated window 'resize' happens (confirmed live: a resize
 * event snaps it to the right size). Mounted as a child of <Canvas>, this reads
 * the container's real box post-layout and calls R3F's setSize — the same thing
 * a resize event does, but locally and deterministically — then keeps it in sync
 * via a ResizeObserver. Renders nothing. Sizing only; nothing global.
 */
export function CanvasAutoResize() {
  const gl = useThree((state) => state.gl)
  const setSize = useThree((state) => state.setSize)

  useEffect(() => {
    const container = gl.domElement.parentElement
    if (!container) return

    const apply = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width > 0 && height > 0) setSize(width, height)
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(container)
    return () => observer.disconnect()
  }, [gl, setSize])

  return null
}

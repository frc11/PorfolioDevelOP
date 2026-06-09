/**
 * Caps the per-frame delta handed to the chat avatars' R3F `useFrame` loops.
 *
 * When the tab is backgrounded (or rAF is otherwise throttled), R3F resumes with
 * a single very large `delta` covering the whole paused gap. Delta-scaled springs
 * and lerps then over-step in one frame — `springLerp`'s `1 - exp(-k·delta)`
 * saturates toward 1 (a snap) and `lerp(x, t, delta·N)` overshoots — which reads as
 * the avatar "fast-forwarding" to catch up. Clamping delta keeps every frame's step
 * bounded so the motion stays natural on resume.
 *
 * 0.05s (≈20fps) sits above a normal 30fps frame (~0.033s), so ordinary frames pass
 * through untouched; only abnormal catch-up frames are clamped.
 */
export const MAX_FRAME_DELTA = 0.05

export function clampDelta(delta: number): number {
  return Math.min(delta, MAX_FRAME_DELTA)
}

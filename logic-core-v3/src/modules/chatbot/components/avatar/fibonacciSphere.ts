import * as THREE from 'three'

/**
 * Returns N points evenly distributed on a unit sphere using the
 * Fibonacci spiral. Produces visually balanced particle clouds.
 */
export function fibonacciSphere(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const goldenRatio = (1 + Math.sqrt(5)) / 2
  const angleIncrement = Math.PI * 2 * goldenRatio

  for (let i = 0; i < count; i++) {
    const t = i / count
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = angleIncrement * i

    const x = Math.sin(inclination) * Math.cos(azimuth)
    const y = Math.sin(inclination) * Math.sin(azimuth)
    const z = Math.cos(inclination)
    points.push(new THREE.Vector3(x, y, z))
  }
  return points
}

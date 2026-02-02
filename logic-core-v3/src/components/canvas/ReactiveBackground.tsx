'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

// Simple pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermite Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

void main() {
  vec2 st = gl_FragCoord.xy/uResolution.xy;
  st.x *= uResolution.x/uResolution.y; // Aspect ratio correction

  vec2 mouse = uMouse;
  mouse.x *= uResolution.x/uResolution.y;

  // Distance from mouse for radial glow
  float dist = distance(st, mouse);

  // Radial strength (soft glow)
  float glow = 1.0 - smoothstep(0.0, 0.8, dist);

  // Add subtle noise
  float n = noise(st * 3.0 + uTime * 0.1);
  
  // Base background color (Deep Obsidian/Black)
  vec3 color = vec3(0.008, 0.008, 0.016); // #020204 approx

  // Glow color (Cyan/White weak mix)
  vec3 glowColor = vec3(0.1, 0.2, 0.25);

  // Mix based on distance and noise
  vec3 finalColor = mix(color, glowColor, glow * 0.3 + n * 0.02);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const BackgroundEffect = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();
    const mouse = useThree((state) => state.pointer);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }, // Start center
        uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) }
    }), [viewport]);

    useFrame((state) => {
        if (!materialRef.current) return;
        materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

        // Mouse is -1 to 1 in R3F, map to 0 to 1 for shader if needed, but here we can pass it directly
        // Actually our shader logic with gl_FragCoord expects 0-1 range or screen coords.
        // Let's pass normalized 0-1 mouse.
        // R3F pointer is -1 to 1.
        const normalizedMouse = new THREE.Vector2((mouse.x + 1) / 2, (mouse.y + 1) / 2);

        materialRef.current.uniforms.uMouse.value.lerp(normalizedMouse, 0.1);
        // Update resolution in case of resize (though useMemo handles viewport change causing re-render often)
        // For exact pixel matches we might want direct window size, but viewport is fine for relative logic.
    });

    return (
        <Plane args={[viewport.width * 1.2, viewport.height * 1.2]}> {/* Oversize to cover edges */}
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </Plane>
    );
};

export const ReactiveBackground = () => {
    return (
        <div className="absolute inset-0 z-[-1] pointer-events-none w-full h-full">
            <Canvas
                gl={{ alpha: true, antialias: false }}
                dpr={[1, 2]} // Handle high DPI
            >
                <BackgroundEffect />
            </Canvas>
        </div>
    );
};

'use client';

export const NoiseOverlay = () => {
    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-[9990] opacity-[0.03] mix-blend-overlay overflow-hidden">
                <svg className="h-full w-full animate-noise">
                    <filter id="noiseFilter">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.8"
                            numOctaves="4"
                            stitchTiles="stitch"
                        />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            <style jsx global>{`
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(-10%, 5%); }
          30% { transform: translate(5%, -10%); }
          40% { transform: translate(-5%, 15%); }
          50% { transform: translate(-10%, 5%); }
          60% { transform: translate(15%, 0); }
          70% { transform: translate(0, 10%); }
          80% { transform: translate(-15%, 0); }
          90% { transform: translate(10%, 5%); }
        }
        .animate-noise {
          animation: noise 0.2s steps(10) infinite;
        }
      `}</style>
        </>
    );
};

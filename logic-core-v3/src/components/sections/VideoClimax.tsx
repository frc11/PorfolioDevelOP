'use client'

export function VideoClimax() {
    return (
        <div
            style={{
                position: 'relative',
                height: 'clamp(280px, 35vh, 380px)',
                overflow: 'hidden',
                borderRadius: '12px',
            }}
        >
            {/* Video */}
            <video
                src="/video/Man_sips_coffee_scrolls_phone_delpmaspu_.mp4"
                autoPlay
                muted
                loop
                playsInline
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '112%',
                    height: '112%',
                    objectFit: 'cover',
                    objectPosition: 'center 20%',
                    marginLeft: '-6%',
                    marginTop: '-6%',
                    display: 'block',
                }}
            />

            {/* Fusion overlay — blends left edge into text column */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 2,
                    background:
                        'linear-gradient(90deg, rgba(8,8,16,0.95) 0%, rgba(8,8,16,0.6) 25%, rgba(8,8,16,0.1) 50%, transparent 100%)',
                }}
            />

            {/* Corner watermark gradient */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '140px',
                    height: '70px',
                    zIndex: 10,
                    background:
                        'linear-gradient(135deg, transparent 0%, rgba(8,8,16,0.98) 55%, rgba(8,8,16,1) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Badge */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 20,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(0,229,255,0.2)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                }}
            >
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
                    Tu negocio
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                    trabajando solo.
                </div>
            </div>
        </div>
    )
}

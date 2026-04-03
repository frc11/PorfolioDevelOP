const fs = require('fs');
const content = fs.readFileSync('src/components/sections/OurServices.tsx', 'utf8');
const lines = content.split('\n');

// renderMapsScene starts at line 1251 (0-indexed: 1250), ends at 1573 (0-indexed: 1572)
// We replace lines 1250..1572 (inclusive) with the new implementation

const replacement = `  const renderMapsScene = ({ isActive, progress, color }: SimProps) => {
    const showGrid = progress > 0.10
    const showCompetitors = progress > 0.22
    const showClient = progress > 0.50
    const showPanel = progress > 0.72

    const competitors = [
      { x: '28%', y: '48%', rating: '2.8', delay: 0.22 },
      { x: '68%', y: '36%', rating: '3.1', delay: 0.30 },
      { x: '58%', y: '65%', rating: '3.4', delay: 0.38 },
    ]

    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '4px 2px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              GOOGLE MAPS · LOCAL
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              Tucumán, Argentina
            </div>
          </div>
          <div style={{
            fontSize: 9, color: color,
            background: \`\${color}12\`,
            border: \`1px solid \${color}25\`,
            borderRadius: 6,
            padding: '4px 8px',
            fontWeight: 600,
          }}>
            PRIMERA POSICIÓN
          </div>
        </div>

        {/* Área mapa + panel lateral */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: 8,
          minHeight: 0,
        }}>

          {/* Mapa */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Grid del mapa */}
            {showGrid && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: \`
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                  \`,
                  backgroundSize: '24px 24px',
                }}
              />
            )}

            {/* Pins competidores */}
            {showCompetitors && competitors.map((comp, i) => (
              progress > comp.delay && (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    position: 'absolute',
                    left: comp.x,
                    top: comp.y,
                    transform: 'translate(-50%, -100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <div style={{
                    width: 18, height: 18,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    background: 'rgba(120,120,120,0.5)',
                    border: '1px solid rgba(160,160,160,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}/>
                  <div style={{
                    background: 'rgba(20,20,20,0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 5,
                    padding: '2px 5px',
                    fontSize: 8,
                    color: 'rgba(255,255,255,0.35)',
                    whiteSpace: 'nowrap',
                  }}>
                    {comp.rating} ⭐
                  </div>
                </motion.div>
              )
            ))}

            {/* Pin cliente DESTACADO */}
            {showClient && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '42%',
                  transform: 'translate(-50%, -100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  zIndex: 10,
                }}
              >
                {/* Anillos */}
                {[1, 2].map(ring => (
                  <motion.div
                    key={ring}
                    animate={{
                      scale: [1, 2 + ring * 0.8],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      delay: ring * 0.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    style={{
                      position: 'absolute',
                      width: 30, height: 30,
                      borderRadius: '50%',
                      border: \`1px solid \${color}\`,
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}

                {/* Pin */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: 32, height: 32,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    background: \`linear-gradient(135deg, \${color}, \${color}cc)\`,
                    boxShadow: \`0 0 24px \${color}50, 0 4px 16px rgba(0,0,0,0.5)\`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ transform: 'rotate(45deg)', fontSize: 13 }}>★</span>
                </motion.div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring' }}
                  style={{
                    background: color,
                    backdropFilter: 'blur(8px)',
                    color: 'black',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    boxShadow: \`0 2px 12px \${color}40\`,
                    letterSpacing: '0.03em',
                  }}
                >
                  TU EMPRESA · 5.0 ★
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Panel lateral */}
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                width: 108,
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: \`1px solid \${color}20\`,
                borderRadius: 12,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexShrink: 0,
              }}
            >
              {/* Rating principal */}
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginBottom: 4, letterSpacing: '0.06em' }}>
                  TU EMPRESA
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>5.0</span>
                </div>
                <div>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ fontSize: 10, color: '#f59e0b' }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  47 reseñas
                </div>
              </div>

              {/* Separador */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}/>

              {/* Checkmarks */}
              {['Fotos', 'Horarios', 'Web', 'WhatsApp'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item}</span>
                  <span style={{ fontSize: 10, color }}>✓</span>
                </motion.div>
              ))}

              {/* Separador */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}/>

              {/* VS competencia */}
              <div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginBottom: 5, letterSpacing: '0.08em' }}>
                  VS COMPETENCIA
                </div>
                {[
                  { label: 'Reseñas', you: '47', them: '8' },
                  { label: 'Rating', you: '5.0', them: '3.1' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color, fontWeight: 700 }}>{item.you}</span>
                      <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)' }}>vs</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.them}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  };`;

// Lines are 0-indexed internally; file is 1-indexed per view.
// renderMapsScene starts at 1251 (view) = index 1250
// renderMapsScene ends at 1573 (view) = index 1572 (the line with '  };')
const startIdx = 1250; // 0-based index of line 1251
const endIdx = 1572;   // 0-based index of line 1573 (inclusive)

const newLines = [
  ...lines.slice(0, startIdx),
  ...replacement.split('\n'),
  ...lines.slice(endIdx + 1),
];

fs.writeFileSync('src/components/sections/OurServices.tsx', newLines.join('\n'));
console.log('Success! renderMapsScene replaced with SimMaps premium.');

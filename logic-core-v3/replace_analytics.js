const fs = require('fs');
const lines = fs.readFileSync('src/components/sections/OurServices.tsx', 'utf8').split('\n');

const replacement = `  const renderAnalyticsScene = ({ isActive, progress, color }: SimProps) => {
    const visits = Math.floor(progress * 1842)
    const sessions = Math.floor(progress * 247)
    const conv = (progress * 3.2).toFixed(1)

    const baseData = [45, 62, 58, 78, 71, 95, 88, 112, 98, 128, 115, 148]
    const visiblePoints = Math.floor(progress * baseData.length)
    const showGraph = progress > 0.20
    const showMap = progress > 0.40

    // Silueta Argentina mejorada
    const argentinaPath = "M80,8 C88,8 98,12 105,20 C112,28 115,38 114,50 C113,60 108,68 110,80 C112,90 108,100 105,112 C102,122 104,132 100,142 C96,152 92,162 88,172 C84,182 80,192 76,202 C72,212 68,222 62,232 C56,242 50,252 44,260 C40,266 36,268 34,264 C32,258 34,250 36,242 C38,234 36,226 34,216 C32,206 34,196 32,186 C30,176 28,166 30,156 C28,146 26,136 28,126 C26,116 24,106 26,96 C24,86 22,76 24,66 C26,56 28,46 26,36 C28,28 34,18 42,12 C52,6 66,6 80,8Z"

    const mapCities = [
      { name: 'Buenos Aires', cx: 65, cy: 175, r: 6 },
      { name: 'Córdoba', cx: 58, cy: 130, r: 5 },
      { name: 'Rosario', cx: 62, cy: 152, r: 4 },
      { name: 'Tucumán', cx: 52, cy: 82, r: 4 },
      { name: 'Mendoza', cx: 40, cy: 138, r: 4 },
      { name: 'Salta', cx: 48, cy: 56, r: 3 },
    ]

    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '4px 2px',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>
              PANEL EN TIEMPO REAL
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              Últimos 30 días · Tu sitio
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 9,
              fontWeight: 600,
              color: color,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: \`0 0 8px \${color}\` }}/>
            LIVE
          </motion.div>
        </div>

        {/* 3 métricas grandes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          flexShrink: 0,
        }}>
          {[
            { label: 'VISITAS', value: visits.toLocaleString(), trend: '+12%', color },
            { label: 'SESIONES', value: sessions.toString(), trend: '+8%', color: '#8b5cf6' },
            { label: 'CONV.', value: \`\${conv}%\`, trend: '+0.4%', color: '#f59e0b' },
          ].map((m, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: \`1px solid \${m.color}18\`,
              borderRadius: 10,
              padding: '8px 10px',
            }}>
              <div style={{
                fontSize: 8,
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.08em',
                marginBottom: 4,
              }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: m.color,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                marginBottom: 3,
              }}>
                {m.value}
              </div>
              <div style={{
                fontSize: 9,
                color: '#10b981',
                fontWeight: 500,
              }}>
                ↑ {m.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Área principal: gráfico + mapa */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 6,
          minHeight: 0,
        }}>

          {/* Gráfico */}
          {showGraph && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '10px 10px 8px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                fontSize: 8,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}>
                ÚLTIMOS 12 DÍAS
              </div>
              <svg
                viewBox="0 0 120 60"
                style={{ flex: 1, width: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={\`grad-\${color.replace('#','')}\`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {visiblePoints > 1 && (() => {
                  const pts = baseData.slice(0, visiblePoints).map((v, i) => ({
                    x: (i / (baseData.length - 1)) * 120,
                    y: 55 - (v / 160) * 50,
                  }))
                  const areaD = [
                    \`M \${pts[0].x} 60\`,
                    ...pts.map(p => \`L \${p.x} \${p.y}\`),
                    \`L \${pts[pts.length-1].x} 60 Z\`
                  ].join(' ')
                  const lineD = pts.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ')
                  return (
                    <>
                      <path d={areaD} fill={\`url(#grad-\${color.replace('#','')})\`}/>
                      <path d={lineD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      {/* Punto final con glow */}
                      <circle
                        cx={pts[pts.length-1].x}
                        cy={pts[pts.length-1].y}
                        r="3"
                        fill={color}
                      />
                      <circle
                        cx={pts[pts.length-1].x}
                        cy={pts[pts.length-1].y}
                        r="6"
                        fill="none"
                        stroke={color}
                        strokeWidth="0.5"
                        opacity="0.4"
                      />
                    </>
                  )
                })()}
              </svg>
            </motion.div>
          )}

          {/* Mapa Argentina */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '10px 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{
                fontSize: 8,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.08em',
                marginBottom: 4,
                flexShrink: 0,
              }}>
                ORIGEN
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <svg
                  viewBox="20 5 100 270"
                  style={{ width: '100%', height: '100%' }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Silueta Argentina */}
                  <path
                    d={argentinaPath}
                    fill="rgba(255,255,255,0.06)"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.8"
                  />
                  {/* Ciudades */}
                  {mapCities.map((city, i) => (
                    progress > 0.42 + i * 0.07 && (
                      <g key={city.name}>
                        {/* Anillo pulsante */}
                        <motion.circle
                          cx={city.cx} cy={city.cy}
                          r={city.r * 2}
                          fill="none"
                          stroke={color}
                          strokeWidth="0.5"
                          animate={{ r: [city.r * 1.5, city.r * 3, city.r * 1.5], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                        />
                        {/* Punto */}
                        <motion.circle
                          cx={city.cx} cy={city.cy}
                          r={city.r}
                          fill={color}
                          initial={{ r: 0, opacity: 0 }}
                          animate={{ r: city.r, opacity: 0.85 }}
                          transition={{ type: 'spring', stiffness: 300, delay: i * 0.08 }}
                          style={{ filter: \`drop-shadow(0 0 3px \${color})\` }}
                        />
                      </g>
                    )
                  ))}
                </svg>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    )
  };`;

const newLines = lines.slice(0, 738).concat(replacement.split('\n')).concat(lines.slice(1124));
fs.writeFileSync('src/components/sections/OurServices.tsx', newLines.join('\n'));
console.log('Success!');

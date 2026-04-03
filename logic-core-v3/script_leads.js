const fs = require('fs');
const lines = fs.readFileSync('src/components/sections/OurServices.tsx', 'utf8').split('\n');

const replacement = `  const renderLeadsScene = ({ isActive, progress, color }: SimProps) => {
    const fields = [
      { label: 'Nombre', value: 'Carlos Mendoza', icon: User },
      { label: 'WhatsApp', value: '+54 381 555-1234', icon: Phone },
      { label: 'Servicio', value: 'Consulta de precios', icon: MessageSquare },
    ]

    const fieldThresholds = [0, 0.12, 0.24]
    const showButton = progress > 0.38
    const submitted = progress > 0.50
    const showWhatsApp = progress > 0.62
    const showIA = progress > 0.80

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
              FORMULARIO DE CONTACTO
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
              Captura automática · 24/7
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
            CAPTACIÓN
          </div>
        </div>

        {/* Campos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {fields.map((field, i) => {
            const visible = progress > fieldThresholds[i]
            const charProgress = visible
              ? Math.min((progress - fieldThresholds[i]) / 0.12, 1)
              : 0
            const charCount = Math.floor(charProgress * field.value.length)
            const displayValue = field.value.slice(0, charCount)
            const complete = charCount >= field.value.length
            const IconComponent = field.icon

            return visible ? (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: complete
                    ? \`\${color}08\`
                    : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: \`1px solid \${complete ? color + '30' : 'rgba(255,255,255,0.08)'}\`,
                  borderRadius: 10,
                  padding: '9px 12px',
                  transition: 'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                <div style={{ color: complete ? color : 'rgba(255,255,255,0.2)', transition: 'color 300ms', flexShrink: 0 }}>
                  <IconComponent size={13} strokeWidth={1.5}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 8,
                    color: 'rgba(255,255,255,0.25)',
                    marginBottom: 2,
                    letterSpacing: '0.06em',
                  }}>
                    {field.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                    {displayValue}
                    {!complete && visible && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        style={{
                          display: 'inline-block',
                          width: 1.5,
                          height: 12,
                          background: color,
                          marginLeft: 1,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                  </div>
                </div>
                {complete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    style={{
                      width: 18, height: 18,
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={10} color="black" strokeWidth={3}/>
                  </motion.div>
                )}
              </motion.div>
            ) : null
          })}
        </div>

        {/* Botón submit */}
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: submitted
                  ? \`linear-gradient(135deg, \${color}30, \${color}15)\`
                  : \`\${color}15\`,
                backdropFilter: 'blur(20px)',
                border: \`1px solid \${submitted ? color + '50' : color + '25'}\`,
                borderRadius: 10,
                padding: '11px',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: submitted ? color : \`\${color}80\`,
                letterSpacing: '0.1em',
                flexShrink: 0,
                boxShadow: submitted ? \`0 0 20px \${color}15\` : 'none',
                transition: 'all 400ms ease',
              }}
            >
              {submitted ? '✓ CONSULTA ENVIADA' : 'ENVIANDO...'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificaciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <AnimatePresence>
            {showWhatsApp && (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  background: 'rgba(37,211,102,0.07)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(37,211,102,0.20)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  background: 'rgba(37,211,102,0.15)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <MessageSquare size={13} color="#25D366"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#25D366', marginBottom: 3 }}>
                    WhatsApp → Tu equipo
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                    "Nueva consulta: Carlos Mendoza — Precios"
                  </div>
                </div>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>ahora</span>
              </motion.div>
            )}

            {showIA && (
              <motion.div
                initial={{ opacity: 0, x: 16, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                style={{
                  background: \`\${color}07\`,
                  backdropFilter: 'blur(20px)',
                  border: \`1px solid \${color}20\`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  background: \`\${color}15\`,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Bot size={13} color={color}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 3 }}>
                    IA → Carlos Mendoza
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                    "¡Hola Carlos! Recibimos tu consulta, te contactamos en minutos 🚀"
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  };`;

const newLines = lines.slice(0, 1006).concat(replacement.split('\n')).concat(lines.slice(1254));
fs.writeFileSync('src/components/sections/OurServices.tsx', newLines.join('\n'));
console.log('Success replacing renderLeadsScene with SimLeads!');

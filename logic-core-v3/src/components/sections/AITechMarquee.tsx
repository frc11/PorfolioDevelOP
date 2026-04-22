"use client"
import React from 'react'
import { motion } from 'motion/react'

const marqueeItems = [
  { icon:'', label:'WhatsApp API' },
  { icon:'', label:'Instagram Direct' },
  { icon:'', label:'MercadoPago' },
  { icon:'', label:'Google Calendar' },
  { icon:'', label:'AFIP' },
  { icon:'', label:'Google Sheets' },
  { icon:'', label:'Gmail' },
  { icon:'', label:'Notion' },
  { icon:'', label:'Zapier' },
  { icon:'', label:'Tiendanube' },
  { icon:'', label:'Mercado Libre' },
  { icon:'', label:'WooCommerce' },
  { icon:'', label:'Salesforce' },
  { icon:'', label:'Meta Ads' },
]

const allItems = [...marqueeItems, ...marqueeItems]

export const AITechMarquee = () => {
    return (
        <section style={{
            width: '100%',
            position: 'relative',
            zIndex: 10,
            padding: '14px 0',
            overflow: 'hidden',
            background: 'rgba(0,255,136,0.03)',
            borderTop: '1px solid rgba(0,255,136,0.08)',
            borderBottom: '1px solid rgba(0,255,136,0.08)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
            maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}>
            <motion.div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    width: 'max-content',
                }}
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                    duration: 40,
                    ease: "linear",
                    repeat: Infinity,
                }}
            >
                {allItems.map((item, index) => (
                    <div 
                        key={index} 
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 clamp(16px,2vw,28px)',
                            borderRight: '1px solid rgba(0,255,136,0.1)',
                            flexShrink: 0,
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>
                            {item.icon}
                        </span>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.5)',
                            whiteSpace: 'nowrap',
                            letterSpacing: '0.08em',
                        }}>
                            {item.label}
                        </span>
                    </div>
                ))}
            </motion.div>
        </section>
    )
}

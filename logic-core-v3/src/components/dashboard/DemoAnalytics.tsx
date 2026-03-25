'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Info,
  ArrowUpRight,
  MousePointerClick,
  ShieldCheck
} from 'lucide-react'

// Mock Data for a Car Dealership (Last 30 days)
const generateMockData = () => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 80) + 120, // 120-200 visits
      leads: Math.floor(Math.random() * 12) + 8,   // 8-20 leads
    }
  })
}

const mockData = generateMockData()

// Summary Metrics
const stats = [
  { 
    label: 'Total Visitas', 
    value: '4,892', 
    icon: <Users size={20} />, 
    color: 'text-cyan-400', 
    trend: '+12.5%', 
    description: 'Tráfico Web Interesado' 
  },
  { 
    label: 'Leads de WhatsApp', 
    value: '342', 
    icon: <MessageSquare size={20} />, 
    color: 'text-emerald-400', 
    trend: '+8.3%', 
    description: 'Consultas Directas' 
  },
  { 
    label: 'Ventas Estimadas', 
    value: '18', 
    icon: <TrendingUp size={20} />, 
    color: 'text-blue-400', 
    trend: '+15.0%', 
    description: 'Conversiones de Cierre' 
  },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-cyan-500/30 bg-[#0c0e12]/80 p-4 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
          {new Date(label).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-sm font-black text-white">{payload[0].value} <span className="text-[10px] text-zinc-400 font-bold uppercase">Visitas</span></span>
          </div>
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tight">Fuente Principal:</span>
            <span className="text-[10px] font-black text-zinc-300 uppercase italic">Google Ads</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function DemoAnalytics() {
  return (
    <div className="flex flex-col gap-8">
      {/* Premium Demo Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group p-[1px] rounded-3xl bg-gradient-to-r from-amber-500/30 via-amber-200/20 to-amber-500/30 shadow-2xl overflow-hidden"
      >
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[23px] bg-[#0c0e12]/80 backdrop-blur-3xl px-8 py-6">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <div className="relative group/tooltip cursor-help">
                <Info size={22} className="text-amber-400" />
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-3 bg-[#0c0e12]/95 border border-white/10 rounded-xl text-[11px] font-bold text-zinc-300 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl backdrop-blur-3xl z-50 translate-y-2 group-hover/tooltip:translate-y-0 text-center">
                  Estamos visualizando datos de ejemplo para Empresa Demo. <br />
                  <span className="text-amber-400/80">Haz clic para salir del modo demo.</span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0c0e12] border-r border-b border-white/10 rotate-45" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]">Modo Demo Activo</p>
              <h2 className="text-lg font-black text-white mt-0.5 tracking-tight">Ecosistema Digital: Empresa Demo B2B</h2>
            </div>
          </div>

          <Link 
            href="/dashboard/analytics" 
            className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-6 py-3 text-xs font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 shadow-xl shadow-black/50 active:scale-95 group/btn"
          >
            <ShieldCheck size={16} className="group-hover/btn:rotate-12 transition-transform" />
            Salir de Demo Mode
          </Link>
        </div>

        {/* Subtle animated shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_4s_infinite] pointer-events-none" />
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-3xl transition-all hover:bg-white/[0.05] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${stat.color} shadow-inner`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all duration-300 group-hover:scale-105 ${
                stat.color === 'text-cyan-400' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' :
                stat.color === 'text-emerald-400' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="text-[11px] font-black tracking-tight leading-none">{stat.trend}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-white/60 group-hover:text-white/80 transition-colors">
                {stat.label}
              </p>
              <h3 className={`text-6xl font-black tracking-tighter ${stat.color} drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]`}>
                {stat.value}
              </h3>
              <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest mt-2">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0e12]/60 p-8 backdrop-blur-3xl shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MousePointerClick size={18} className="text-cyan-400" />
              Sesiones Diarias
            </h2>
            <p className="text-xs text-zinc-500 font-medium tracking-wide mt-1">Tráfico y captación de leads en tiempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Visitas</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="demoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <filter id="demoGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
                  <feComponentTransfer in="offsetBlur">
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" vertical={false} opacity={0.05} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 8, fill: '#71717a', fontWeight: 'bold' }}
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => val.split('-')[2]}
                interval={2}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 8, fill: '#71717a', fontWeight: 'bold' }}
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#06b6d4', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="visits" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fill="url(#demoGradient)"
                animationDuration={2000}
                activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                filter="url(#demoGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

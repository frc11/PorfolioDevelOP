'use client'

import React from 'react'

export interface ReportData {
  month: string
  clientName: string
  visits: string
  leads: string
  pipelineValue: string
  hoursSaved: string
  roi: string
  tasksCompleted: number
  aiBrief: string
}

export function ExecutiveReportTemplate({ data }: { data: ReportData }) {
  // A4 size: 210x297mm. At 96 DPI: 794x1123 pixels.
  // We use this exact intrinsic size so html2canvas captures nicely.
  return (
    <div
      id="executive-report-template"
      className="bg-[#080a0c] text-zinc-100 flex flex-col font-sans relative overflow-hidden"
      style={{
        width: '794px',
        height: '1123px',
        margin: 0,
        padding: '60px',
        boxSizing: 'border-box',
      }}
    >
      {/* Premium Background Effects */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 60%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.06) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/10 pb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            devel<span className="text-cyan-400">OP</span>
          </h1>
          <p className="text-sm text-zinc-400 uppercase tracking-[0.2em] font-medium">Reporte Ejecutivo Mensual</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-zinc-200">{data.clientName}</p>
          <p className="text-xs text-zinc-500 mt-1">Período: {data.month}</p>
          <p className="text-[10px] text-zinc-600 mt-1">Generado automáticamente</p>
        </div>
      </div>

      <div className="flex-1 mt-10 relative z-10 flex flex-col gap-10">
        {/* Intro */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 border-l-2 border-cyan-500 pl-4 mb-4">
            Resumen de Impacto
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
            Este documento certifica el análisis mensual de rendimiento y el valor empírico del ecosistema B2B, automatizaciones e inteligencia artificial implementados por develOP para acelerar operaciones.
          </p>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <span className="text-xs font-semibold text-cyan-500 tracking-wider uppercase mb-1">Volumen y Leads</span>
            <div className="flex justify-between items-end mb-4">
              <span className="text-3xl font-bold text-white tabular-nums">{data.visits}</span>
              <span className="text-xs text-zinc-500">Visitas totales</span>
            </div>
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
              <span className="text-2xl font-bold text-white tabular-nums">{data.leads}</span>
              <span className="text-xs text-zinc-500">Nuevos Leads prospectados</span>
            </div>
          </div>

          <div className="flex flex-col p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/20 shadow-[0_8px_32px_rgba(16,185,129,0.1)]">
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-1">Eficiencia B2B</span>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-white tabular-nums">{data.hoursSaved}</span>
              <span className="text-xs text-emerald-400/80 leading-tight">Horas operativas<br/>ahorradas por IA</span>
            </div>
            <div className="flex justify-between items-end border-t border-emerald-500/20 pt-4">
              <span className="text-xl font-bold text-emerald-400">{data.roi}</span>
              <span className="text-xs text-zinc-400">ROI Estimado (USD)</span>
            </div>
          </div>
        </div>

        {/* AI Brief (Simulated natural language phase 4) */}
        <div className="mt-2">
          <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            AI Executive Brief
          </h2>
          <div className="p-6 rounded-2xl border border-white/10 bg-[#0c0e12]/80 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <p className="text-sm text-zinc-300 leading-8 relative z-10 italic">
              "{data.aiBrief}"
            </p>
          </div>
        </div>

        {/* Project Velocity */}
        <div className="mt-auto">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <span className="text-sm font-medium text-zinc-400">Entregables y Tareas Completadas (Mes actual)</span>
            <span className="text-lg font-bold text-white tabular-nums">{data.tasksCompleted} completadas exitosamente</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-12 pt-6 flex justify-between items-center relative z-10">
        <p className="text-[10px] text-zinc-600 font-medium tracking-wide">CONFIDENCIAL - USO EXCLUSIVO PARA CLIENTES</p>
        <p className="text-[10px] text-cyan-500 font-semibold tracking-widest uppercase">www.develop-agency.com</p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 -translate-x-1 -translate-y-1" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 translate-x-1 -translate-y-1" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 -translate-x-1 translate-y-1" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 translate-x-1 translate-y-1" />
    </div>
  )
}

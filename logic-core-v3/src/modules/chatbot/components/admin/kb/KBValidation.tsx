'use client'

import { AlertCircle, AlertTriangle, Check, Info } from 'lucide-react'
import type { KBValidationIssue } from '@/modules/chatbot/server/admin/validateKB'

interface KBValidationProps {
  issues: KBValidationIssue[]
}

export function KBValidation({ issues }: KBValidationProps) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.04] p-4 text-sm text-emerald-200 backdrop-blur-[20px] backdrop-saturate-[180%]">
        <Check className="h-4 w-4" strokeWidth={1.5} />
        Sin issues detectados en la KB
      </div>
    )
  }

  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  const infos = issues.filter((issue) => issue.severity === 'info')

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        {errors.length > 0 && <span className="text-red-400">{errors.length} errores</span>}
        {warnings.length > 0 && <span className="text-amber-400">{warnings.length} warnings</span>}
        {infos.length > 0 && <span className="text-zinc-400">{infos.length} infos</span>}
      </div>

      <div className="space-y-2">
        {issues.map((issue, index) => (
          <IssueRow key={`${issue.section}-${index}`} issue={issue} />
        ))}
      </div>
    </div>
  )
}

function IssueRow({ issue }: { issue: KBValidationIssue }) {
  const config = {
    error: {
      icon: AlertCircle,
      borderColor: 'border-red-400/20',
      bgColor: 'bg-red-500/[0.04]',
      textColor: 'text-red-200',
      iconColor: 'text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      borderColor: 'border-amber-400/20',
      bgColor: 'bg-amber-500/[0.04]',
      textColor: 'text-amber-200',
      iconColor: 'text-amber-400',
    },
    info: {
      icon: Info,
      borderColor: 'border-white/[0.08]',
      bgColor: 'bg-white/[0.04]',
      textColor: 'text-zinc-300',
      iconColor: 'text-zinc-400',
    },
  }[issue.severity]

  const Icon = config.icon

  return (
    <div className={`flex items-start gap-3 rounded-2xl border ${config.borderColor} ${config.bgColor} p-3 backdrop-blur-[20px] backdrop-saturate-[180%]`}>
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.iconColor}`} strokeWidth={1.5} />
      <div className="flex-1">
        <p className={`text-sm ${config.textColor}`}>{issue.message}</p>
        {issue.hint && (
          <p className="mt-1 text-xs text-zinc-500">{issue.hint}</p>
        )}
      </div>
    </div>
  )
}

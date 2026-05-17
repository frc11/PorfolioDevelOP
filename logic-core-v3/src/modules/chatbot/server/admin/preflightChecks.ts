'use server'

import { prisma } from '@/lib/prisma'

export interface PreflightCheck {
  id: string
  label: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  hint?: string
}

export async function runPreflightChecks(botId: string): Promise<PreflightCheck[]> {
  const checks: PreflightCheck[] = []

  const bot = await prisma.botConfig.findUnique({
    where: { id: botId },
    include: { knowledgeBase: true, organization: true },
  })

  if (!bot) {
    return [{
      id: 'bot_exists',
      label: 'Bot existe',
      status: 'fail',
      message: 'Bot no encontrado',
    }]
  }

  if (bot.knowledgeBase) {
    const kb = bot.knowledgeBase
    const requiredFields = [
      'businessInfo',
      'servicesOrProducts',
      'faq',
      'policies',
      'salesGuidance',
    ] as const
    const missingFields = requiredFields.filter((field) => {
      const value = kb[field]
      return !value || value.trim().length < 20
    })

    if (missingFields.length === 0) {
      checks.push({
        id: 'kb_complete',
        label: 'Knowledge base completa',
        status: 'pass',
        message: 'Todas las secciones esenciales tienen contenido',
      })
    } else if (missingFields.length <= 2) {
      checks.push({
        id: 'kb_complete',
        label: 'Knowledge base parcial',
        status: 'warn',
        message: `${missingFields.length} secciones vacias o muy cortas`,
        hint: `Faltantes: ${missingFields.join(', ')}`,
      })
    } else {
      checks.push({
        id: 'kb_complete',
        label: 'Knowledge base incompleta',
        status: 'fail',
        message: `${missingFields.length} secciones criticas vacias`,
        hint: 'Es muy dificil que el bot funcione bien sin KB completa',
      })
    }
  } else {
    checks.push({
      id: 'kb_complete',
      label: 'Knowledge base',
      status: 'fail',
      message: 'No hay knowledge base configurada',
    })
  }

  if (bot.welcomeMessage && bot.welcomeMessage.length >= 20) {
    checks.push({
      id: 'welcome_message',
      label: 'Mensaje de bienvenida',
      status: 'pass',
      message: 'Configurado correctamente',
    })
  } else {
    checks.push({
      id: 'welcome_message',
      label: 'Mensaje de bienvenida',
      status: 'fail',
      message: 'Vacio o muy corto',
      hint: 'Minimo 20 caracteres',
    })
  }

  const quickReplies = bot.quickReplies as unknown
  if (Array.isArray(quickReplies) && quickReplies.length >= 3) {
    checks.push({
      id: 'quick_replies',
      label: 'Quick replies',
      status: 'pass',
      message: `${quickReplies.length} sugerencias configuradas`,
    })
  } else {
    checks.push({
      id: 'quick_replies',
      label: 'Quick replies',
      status: 'warn',
      message: 'Menos de 3 quick replies',
      hint: 'Recomendado minimo 3 para que el usuario tenga opciones',
    })
  }

  if (bot.whatsappNumber && /^\d{10,15}$/.test(bot.whatsappNumber)) {
    checks.push({
      id: 'whatsapp_number',
      label: 'WhatsApp configurado',
      status: 'pass',
      message: `Numero: +${bot.whatsappNumber}`,
    })
  } else {
    checks.push({
      id: 'whatsapp_number',
      label: 'WhatsApp',
      status: 'warn',
      message: 'Numero no configurado o invalido',
      hint: 'Sin esto el handoff a WhatsApp no funciona',
    })
  }

  if (bot.accentColor && /^#[0-9a-f]{6}$/i.test(bot.accentColor)) {
    checks.push({
      id: 'accent_color',
      label: 'Color de acento',
      status: 'pass',
      message: bot.accentColor,
    })
  } else {
    checks.push({
      id: 'accent_color',
      label: 'Color de acento',
      status: 'fail',
      message: 'Color invalido',
    })
  }

  if (bot.monthlyQuota > 0) {
    checks.push({
      id: 'quota',
      label: 'Quota mensual',
      status: 'pass',
      message: `${bot.monthlyQuota.toLocaleString('es-AR')} conv/mes`,
    })
  } else {
    checks.push({
      id: 'quota',
      label: 'Quota mensual',
      status: 'fail',
      message: 'Quota 0 o invalida',
    })
  }

  return checks
}

export async function canActivate(checks: PreflightCheck[]): Promise<boolean> {
  return !checks.some((check) => check.status === 'fail')
}

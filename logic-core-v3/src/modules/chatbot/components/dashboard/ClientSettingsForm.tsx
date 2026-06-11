'use client'

import { useState } from 'react'
import { Select } from '@/components/ui'
import { saveClientSettings } from '@/modules/chatbot/server/admin/saveClientSettings'
import type { BotConfig } from '@prisma/client'
import { toast } from 'sonner'

const COLORS = [
  { hex: '#06b6d4', name: 'Cyan' },
  { hex: '#8b5cf6', name: 'Violeta' },
  { hex: '#10b981', name: 'Verde' },
  { hex: '#f59e0b', name: 'Ámbar' },
  { hex: '#ef4444', name: 'Rojo' },
  { hex: '#3b82f6', name: 'Azul' },
]

export function ClientSettingsForm({ bot }: { bot: BotConfig }) {
  const [isActive, setIsActive] = useState(bot.isActive)
  const [welcomeMessage, setWelcomeMessage] = useState(bot.welcomeMessage)
  const [accentColor, setAccentColor] = useState(
    COLORS.map(c => c.hex).includes(bot.accentColor) ? bot.accentColor : '#06b6d4'
  )
  const [position, setPosition] = useState(bot.position)
  const [quickReplies, setQuickReplies] = useState<{ id: string, label: string, prompt: string }[]>(
    (bot.quickReplies as any[]) ?? []
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const promise = saveClientSettings({
        isActive,
        welcomeMessage,
        accentColor: accentColor as any,
        position: position as any,
        quickReplies,
      }).then(res => {
        if (!res.ok) throw new Error(res.error ?? 'Error')
        return res
      })
      
      toast.promise(promise, {
        loading: 'Guardando configuración...',
        success: 'Configuración guardada exitosamente',
        error: 'No se pudo guardar la configuración'
      })
      
      await promise
    } catch (e) {
      // toast handles the error notification
    } finally {
      setSaving(false)
    }
  }

  const addQuickReply = () => {
    if (quickReplies.length < 6) {
      setQuickReplies([...quickReplies, { id: Math.random().toString(), label: '', prompt: '' }])
    }
  }

  const removeQuickReply = (index: number) => {
    setQuickReplies(quickReplies.filter((_, i) => i !== index))
  }

  const updateQuickReply = (index: number, key: 'label' | 'prompt', value: string) => {
    const newReplies = [...quickReplies]
    newReplies[index][key] = value
    setQuickReplies(newReplies)
  }

  return (
    <div className="max-w-2xl space-y-8 bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Estado General</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-cyan-500' : 'bg-zinc-700'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="text-sm text-zinc-300">Activar Chatbot</span>
        </label>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Mensaje de Bienvenida</h2>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          maxLength={500}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
          rows={3}
        />
        <p className="text-xs text-zinc-500 mt-1 text-right">{welcomeMessage.length} / 500</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Color de Acento</h2>
        <div className="flex gap-3">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setAccentColor(c.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${accentColor === c.hex ? 'border-zinc-100 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Posición</h2>
        <Select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
        >
          <option value="bottom_right">Abajo a la derecha</option>
          <option value="bottom_left">Abajo a la izquierda</option>
        </Select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-zinc-100">Respuestas Rápidas</h2>
          <button
            onClick={addQuickReply}
            disabled={quickReplies.length >= 6}
            className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-40"
          >
            + Agregar
          </button>
        </div>
        <div className="space-y-3">
          {quickReplies.map((qr, i) => (
            <div key={qr.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Etiqueta del botón"
                  value={qr.label}
                  onChange={(e) => updateQuickReply(i, 'label', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
                />
                <input
                  type="text"
                  placeholder="Mensaje real que se enviará"
                  value={qr.prompt}
                  onChange={(e) => updateQuickReply(i, 'prompt', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-100 text-sm"
                />
              </div>
              <button
                onClick={() => removeQuickReply(i)}
                className="p-2 text-zinc-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          {quickReplies.length === 0 && (
            <p className="text-sm text-zinc-500">No hay respuestas rápidas configuradas.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-500 text-zinc-950 rounded font-medium disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}

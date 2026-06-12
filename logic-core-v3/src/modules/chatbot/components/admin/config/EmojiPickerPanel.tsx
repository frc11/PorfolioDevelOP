'use client'

import type { CSSProperties } from 'react'
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from 'emoji-picker-react'

interface EmojiPickerPanelProps {
  onPick: (emoji: string) => void
  width: number
  height: number
}

// Vars --epr-* de emoji-picker-react (CSS_VARIABLES.md). Van inline porque la
// lib inyecta su <style> en runtime después de nuestro stylesheet — un override
// en globals.css perdería por orden de cascada. Se setean base + variante dark
// (el theme dark remapea las base a --epr-dark-*).
const PICKER_THEME_VARS: CSSProperties & Record<`--epr-${string}`, string> = {
  // El shell (EmojiPickerField) ya pone fondo glass + borde — acá transparente.
  '--epr-bg-color': 'transparent',
  '--epr-dark-bg-color': 'transparent',
  '--epr-picker-border-color': 'transparent',
  '--epr-search-input-bg-color': 'rgba(255,255,255,0.04)',
  '--epr-dark-search-input-bg-color': 'rgba(255,255,255,0.04)',
  '--epr-search-border-color': 'rgba(255,255,255,0.1)',
  '--epr-dark-search-border-color': 'rgba(255,255,255,0.1)',
  '--epr-highlight-color': '#22d3ee',
  '--epr-hover-bg-color': 'rgba(34,211,238,0.1)',
  '--epr-dark-hover-bg-color': 'rgba(34,211,238,0.1)',
  // Labels de categoría sticky dentro del scroll: fondo casi opaco o el texto se superpone.
  '--epr-category-label-bg-color': 'rgba(24,24,27,0.92)',
  '--epr-dark-category-label-bg-color': 'rgba(24,24,27,0.92)',
}

/**
 * Único módulo del repo que importa emoji-picker-react: sus enums (Theme,
 * EmojiStyle) son runtime — importarlos desde el field arrastraría los ~307KB
 * al chunk principal del admin. Default export para next/dynamic.
 */
export default function EmojiPickerPanel({ onPick, width, height }: EmojiPickerPanelProps) {
  return (
    <EmojiPicker
      onEmojiClick={(data: EmojiClickData) => onPick(data.emoji)}
      theme={Theme.DARK}
      // Glifos unicode nativos: sin CDN de imágenes y WYSIWYG con AvatarRenderer.
      emojiStyle={EmojiStyle.NATIVE}
      width={width}
      height={height}
      // En mobile el autofocus abre el teclado virtual → dispara resize al montar.
      autoFocusSearch={false}
      previewConfig={{ showPreview: false }}
      // El índice de búsqueda de la lib es English-only (issue #325).
      searchPlaceHolder="Buscar (en inglés)"
      style={PICKER_THEME_VARS}
    />
  )
}

import typographyPlugin from '@tailwindcss/typography'
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
  zIndex,
} from './src/lib/design-tokens'

const pxScale = Object.fromEntries(
  Object.entries(spacing).map(([key, value]) => [key, `${value}px`]),
)

const zIndexScale = Object.fromEntries(
  Object.entries(zIndex).map(([key, value]) => [key, String(value)]),
)

export default {
  theme: {
    extend: {
      colors: {
        develop: colors,
      },
      spacing: pxScale,
      borderRadius: radii,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      lineHeight: typography.lineHeight,
      boxShadow: shadows,
      zIndex: zIndexScale,
    },
  },
  plugins: [typographyPlugin],
}

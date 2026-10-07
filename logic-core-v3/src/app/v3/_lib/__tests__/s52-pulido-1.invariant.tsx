/**
 * PULIDO 1 — el invariante: npm run test:s52-pulido-1
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   P12 · el texto de Trabajos sobre el logo de noche, en el teléfono y la tablet: halo denso + velo detrás de la bajada.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-1.md`. Lo que se mira en vivo: `docs/rediseno/entregas/pulido-1/mirar.txt`.
 */
import { readFileSync } from 'node:fs'

import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('P12 · Teléfono y tablet: el texto de Trabajos se lee sobre el logo de noche (AA, como sobre la noche)')

// El halo de C1 (nocturno final) era UNA sombra fina y difusa: medido a 390, sobre el logo la bajada del cartel quedaba en
// mediana 3,2–4,4:1 y la de las demos en 3,5–4,7 (la mitad de sus píxeles bajo AA). Ahora, abajo de 1024: el halo denso
// (la misma sombra corta apilada, la receta de D2) y un VELO del color de la noche detrás de la bajada (oscurece el logo
// sólo ahí; sobre la noche no se ve). Medido: sobre el logo, la bajada en mediana 10–12:1, lo mismo que sobre la noche.
const banda = leer('_estilos/banda.css')
const enLaBanda = (css: string): string => css.slice(css.indexOf('@media (width < 1024px) {'), css.indexOf('/* ── HOVER DONDE HAY'))
/** ¿El halo es denso? Al menos tres sombras cortas iguales del color del fondo, apiladas (la opacidad se suma). */
const haloDenso = (css: string): boolean => {
  const m = /--halo-sobre-la-escena: ([^;]+);/.exec(css)
  if (m === null) return false
  const sombras = m[1].split(/,(?![^(]*\))/).map((s) => s.trim())
  const cortas = sombras.filter((s) => /^0 0 0\.1em var\(--color-fondo\)$/.test(s)).length
  return cortas >= 3
}
/** ¿La bajada del cartel y el texto de las demos llevan el velo, con al menos 70 % del fondo? */
const conVelo = (css: string): boolean => {
  const velo = /--velo-sobre-la-escena: color-mix\(in srgb, var\(--color-fondo\) (\d+)%, transparent\);/.exec(css)
  const regla = /\[data-v3\] \[data-panel='trabajos'\] \[data-pieza='cartel'\] p,\s*\[data-v3\] \[data-panel='trabajos'\] \[data-capa='demos'\] \[data-pieza='texto'\] \{\s*background-color: var\(--velo-sobre-la-escena\);\s*box-shadow: var\(--sombra-del-velo\);/.test(css)
  const sombra = /--sombra-del-velo: 0 0 [0-9.]+em [0-9.]+em var\(--velo-sobre-la-escena\);/.test(css)
  return velo !== null && Number(velo[1]) >= 70 && regla && sombra
}
const p12Bien = (css: string): boolean => haloDenso(enLaBanda(css)) && conVelo(enLaBanda(css))
afirmar(haloDenso(enLaBanda(banda)), 'abajo de 1024 el halo del texto de Trabajos es denso: la misma sombra corta del fondo apilada (no una sola fina y difusa)')
afirmar(conVelo(enLaBanda(banda)), 'abajo de 1024 la bajada del cartel y el texto de las demos llevan un velo del color de la noche (≥ 70 %): oscurece el logo sólo detrás del texto')
// El código anterior (el halo de C1, sin velo): este invariante lo VE.
const HALO_DE_C1 = `@media (width < 1024px) {
  [data-v3] [data-panel='trabajos'] {
    --halo-sobre-la-escena: 0 0 0.06em var(--color-fondo), 0 0 0.2em color-mix(in srgb, var(--color-fondo) 90%, transparent), 0 0 0.6em color-mix(in srgb, var(--color-fondo) 55%, transparent);
  }

  [data-v3] [data-panel='trabajos'] [data-pieza='cartel'],
  [data-v3] [data-panel='trabajos'] [data-capa='demos'] {
    text-shadow: var(--halo-sobre-la-escena);
  }
}
/* ── HOVER DONDE HAY`
controlPositivo('el detector VE el halo de C1 (el código anterior: fino, sin velo)', HALO_DE_C1, p12Bien)
controlPositivo('y un velo demasiado tenue (50 %)', banda.replace(/(--velo-sobre-la-escena: color-mix\(in srgb, var\(--color-fondo\) )\d+%/, '$150%'), p12Bien)
// Escritorio no cambia: nada del velo fuera de la banda de abajo de 1024.
const fueraDeLaBanda = banda.replace(enLaBanda(banda), '')
afirmar(!/velo-sobre-la-escena|sombra-del-velo/.test(fueraDeLaBanda), 'desde 1024 nada cambia: el velo y su sombra viven sólo en la banda de abajo de 1024')

cerrar('s52-pulido-1')

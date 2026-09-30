/**
 * SPRINT CALIDAD 1 — la lámina final, base contra final: final-lamina.ts
 *
 * Con las capturas de `momentos.ts` en `calidad1/final/cuadros/` (rótulos `base`, del commit de B0, y `final`): los cinco
 * momentos de las dos (`hoja-<ancho>.png`) y los recortes al doble de lo que el sprint tenía que mejorar: el polvo, los
 * cantos del logo, la trama y el piso vivo (`recortes-x2-<ancho>.png`). El polvo y el piso vivo se mueven solos entre
 * una captura y otra: ahí se compara la nitidez, no la posición.
 */
import { hoja, recortes } from './hojas'

const ZONAS_1440 = [
  { momento: 'hero', zona: [720, 610, 280, 200], nombre: 'polvo, hero' },
  { momento: 'hero', zona: [680, 290, 280, 200], nombre: 'cantos del logo, hero' },
  { momento: 'por-que-develop', zona: [60, 220, 280, 200], nombre: 'trama, por que develOP' },
  { momento: 'quienes-somos', zona: [1050, 480, 280, 200], nombre: 'piso vivo, quienes somos' },
] as const

const ZONAS_375 = [
  { momento: 'hero', zona: [0, 60, 250, 180], nombre: 'polvo, hero' },
  { momento: 'hero', zona: [0, 250, 250, 180], nombre: 'cantos del logo, hero' },
  { momento: 'hero', zona: [120, 70, 250, 180], nombre: 'trama, hero' },
  { momento: 'quienes-somos', zona: [125, 630, 250, 180], nombre: 'piso vivo, quienes somos' },
] as const

console.log(hoja('final', '1440', 'base', 'final'))
console.log(hoja('final', '375', 'base', 'final'))
console.log(recortes('final', '1440', ZONAS_1440, 'base', 'final'))
console.log(recortes('final', '375', ZONAS_375, 'base', 'final'))

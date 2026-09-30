/** SPRINT CALIDAD 1 — B7 · los recortes al doble de los cantos del logo (antes: normales por cara; después: con pliegue). */
import { recortes } from './hojas'

console.log(
  recortes('b7-antialias', '1440', [
    { momento: 'hero', zona: [940, 260, 280, 200], nombre: 'hero, la p' },
    { momento: 'hero', zona: [680, 300, 280, 200], nombre: 'hero, la c' },
    { momento: 'quienes-somos', zona: [540, 330, 280, 200], nombre: 'quienes somos' },
    { momento: 'por-que-develop', zona: [560, 300, 280, 200], nombre: 'por que develOP' },
  ]),
)
console.log(
  recortes('b7-antialias', '375', [
    { momento: 'hero', zona: [120, 240, 250, 180], nombre: 'hero' },
    { momento: 'quienes-somos', zona: [100, 380, 250, 180], nombre: 'quienes somos' },
  ]),
)

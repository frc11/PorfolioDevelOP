import { ANCLAJE } from '../src/app/v3/_lib/escena/anclaje'
console.log(JSON.stringify(ANCLAJE.nudos.map((n) => [Number(n.pantalla.toFixed(6)), n.progreso])))
console.log('doc', ANCLAJE.pantallasDelDocumento, 'scroll', ANCLAJE.pantallasDeScroll)

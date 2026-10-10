/**
 * PULIDO 11 — el invariante: npm run test:s62-pulido-11
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por subpunto:
 *   A1 · abrir Contacto sin el cuadrado negro: las caras de la placa se ven recién con el viaje terminado (la causa, medida con
 *        los cuadros del compositor: la cara de atrás asomaba antes de que la hoja se rasterizara).
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-11.md`.
 */
import { readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

import { PlacaDelContacto } from '../../_chrome/contacto/PlacaDelContacto'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · Abrir Contacto sin el cuadrado negro')

// Medido (`pulido-11/_scripts/a1-contacto.ts`, `Page.startScreencast`, con las caras pintadas de colores puros): a 1440, desde
// el hero y desde Portfolio, en los cuadros de ~378 a ~406 ms la cara de atrás asomaba como un rectángulo chico en el medio
// (la hoja todavía sin rasterizar, la placa lejos en su viaje). Era el cuadrado negro (la cara era de tinta hasta PULIDO 10).
// Ahora las cinco caras están en el árbol desde el principio (el espesor de verdad de s49) pero no se ven hasta que el viaje
// terminó (`llego`): en el viaje la placa va de frente y no aportan nada. Medido después: cero cuadros con una cara a la vista
// en el viaje; con el mouse a un costado, el espesor se ve.
const PLACA = leer('_chrome/contacto/PlacaDelContacto.tsx')
const carasDespuesDelViaje = (f: string): boolean => /className=\{cn\('absolute', c\.className, !llego && 'invisible'\)\}/.test(f)
afirmar(carasDespuesDelViaje(PLACA), 'A1 · las caras de la placa están ocultas hasta que el viaje termina (`!llego && invisible`)')
controlPositivo('A1 · el detector VE las caras de antes (siempre a la vista)', PLACA.replace(", !llego && 'invisible')", ')'), carasDespuesDelViaje)
const alMontar = renderToStaticMarkup(
  <PlacaDelContacto activa>
    <div data-parte="hoja" />
  </PlacaDelContacto>,
)
const carasOcultas = (h: string): boolean => {
  const caras = [...h.matchAll(/<div data-cara="([a-z]+)" aria-hidden="true" class="([^"]*)"/g)]
  return caras.length === 5 && caras.every((c) => c[2].split(' ').includes('invisible'))
}
afirmar(carasOcultas(alMontar), '  al montarse (el primer cuadro del viaje), las cinco caras están en el árbol y ocultas')
controlPositivo('  el detector VE una cara a la vista al montarse', alMontar.replace(/ invisible"/, '"'), carasOcultas)

cerrar('s62-pulido-11')

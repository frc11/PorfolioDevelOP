/**
 * SPRINT INTERFAZ 2 · T4 — el trazo del V1 encima del logo de verdad: la línea central (rojo) sobre la tinta del logo
 * (gris) y los centros de los dos cuencos (`formaDelLogo.ts`, azul). Va a `interfaz2/t4-recorrido/trazo-sobre-el-logo.png`.
 */
import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA } from '../scripts-b4/navegador'
import { LOGO_PATH_D } from '../src/components/ui/LogoMark'
import { TRAZO_DEL_INFINITO, TRAZO_DEL_PALO } from '../src/app/v3/_chrome/recorrido/recorrido'
import { FORMA_DEL_LOGO_SVG } from '../src/app/v3/_lib/escena/polvo/formaDelLogo'
import { carpeta, correr, esperar } from './banco'

correr(async () => {
  const { c, p } = FORMA_DEL_LOGO_SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 150 1024 780" width="1024" height="780"><rect x="0" y="150" width="1024" height="780" fill="white"/><path d="${LOGO_PATH_D}" fill="#bbb"/><path d="${TRAZO_DEL_INFINITO} ${TRAZO_DEL_PALO}" fill="none" stroke="red" stroke-width="10"/><circle cx="${String(c.x)}" cy="${String(c.y)}" r="6" fill="blue"/><circle cx="${String(p.x)}" cy="${String(p.y)}" r="6" fill="blue"/></svg>`
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/interfaz2-trazo', ancho: 1100, alto: 900 })
  const pagina = await abrirPagina(chrome)
  try {
    await irA(pagina, 'data:text/html,' + encodeURIComponent(`<body style="margin:0">${svg}</body>`))
    await esperar(800)
    const s = (await pagina.conexion.enviar('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1024, height: 780, scale: 0.6 } }, pagina.sessionId)) as { data: string }
    writeFileSync(`${carpeta('t4-recorrido')}/trazo-sobre-el-logo.png`, Buffer.from(s.data, 'base64'))
  } finally {
    await cerrarPagina(pagina)
    await cerrarChrome(chrome)
  }
})

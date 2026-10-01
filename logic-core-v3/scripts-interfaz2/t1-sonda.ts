/**
 * SPRINT INTERFAZ 2 · T1 — la sonda: ¿la escena atiende lo que pide la interfaz? (`responde=si`)
 *
 *   1. el hero: el puntero entra al CTA → ¿nace un principal en ese instante? (y sin la bandera, no);
 *   2. Por qué develOP: el puntero sobre un valor de la izquierda y uno de la derecha → la onda, su dirección;
 *   3. el teléfono (390): se abre el menú → el filtro del lienzo y la luz de la sala.
 *
 * Capturas de cada momento a `interfaz2/t1-escena-responde/sonda/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, centroDe, correr, escenaViva, esperar, hastaLosValores, raton, viajar, type Banco } from './banco'

const captura = async (b: Banco, archivo: string): Promise<void> => {
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  writeFileSync(archivo, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: b.ancho < 1024, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
}

correr(async () => {
  const dir = carpeta('t1-escena-responde/sonda')
  const salida: Record<string, unknown> = {}
  for (const pedido of ['producto', 'producto,responde=si']) {
    const b = await abrir(1440, 900, { pedido })
    const r: Record<string, unknown> = { placa: b.placa }
    const rotulo = pedido === 'producto' ? 'sin' : 'con'
    // 1 · el CTA del hero
    await raton(b, [720, 820], [720, 780], 4, 30)
    await esperar(1500)
    const cta = await centroDe(b, '[data-panel="hero"] a[data-pieza="cta"]')
    const antes = await escenaViva(b)
    if (cta !== null) await raton(b, [720, 780], cta, 12, 16)
    await esperar(220)
    const despues = await escenaViva(b)
    r.cta = { centro: cta, antes: { t: antes.t, anillos: antes.anillos, nacen: antes.nacen }, despues: { t: despues.t, anillos: despues.anillos, nacen: despues.nacen } }
    await esperar(900)
    await captura(b, `${dir}/hero-cta-${rotulo}.png`)
    // 2 · los valores de Por qué develOP
    await raton(b, cta ?? [720, 780], [720, 120], 6, 16)
    await viajar(b, 'por-que-develop')
    r.valoresALaVista = await hastaLosValores(b)
    await esperar(1500)
    for (const [indice, lado] of [[0, 'izquierda'], [4, 'derecha']] as const) {
      const c = await centroDe(b, '[data-pieza="valor"]', indice)
      if (c === null) continue
      await raton(b, [720, 120], c, 14, 16)
      await esperar(150)
      const piso = await medir<{ onda: number[]; maximo: number }>(b.p, 'window.__pisoDelBanco.estado()')
      const viva = await escenaViva(b)
      r[`valor-${lado}`] = { centro: c, onda: piso.onda, t: viva.t }
      await esperar(700)
      await captura(b, `${dir}/valor-${lado}-${rotulo}.png`)
      await raton(b, c, [720, 120], 10, 16)
      await esperar(1800)
    }
    await b.cerrar()
    // 3 · el menú del teléfono
    const t = await abrir(390, 844, { pedido })
    await esperar(1500)
    const nivel = (): Promise<number> => medir<number>(t.p, 'window.__escenaViva.noche')
    const cerrado = { filtro: await medir<string>(t.p, `document.querySelector('[data-escena]').style.filter`) }
    await captura(t, `${dir}/menu-cerrado-${rotulo}.png`)
    await medir(t.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
    await esperar(900)
    const abierto = {
      filtro: await medir<string>(t.p, `getComputedStyle(document.querySelector('[data-escena]')).filter`),
      velo: await medir<string>(t.p, `getComputedStyle(document.querySelector('[data-parte="velo-del-menu"]')).backdropFilter`),
      noche: await nivel(),
    }
    await captura(t, `${dir}/menu-abierto-${rotulo}.png`)
    r.menu = { cerrado, abierto, placa: t.placa }
    await t.cerrar()
    salida[pedido] = r
  }
  writeFileSync(`${dir}/sonda.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida, null, 1))
})

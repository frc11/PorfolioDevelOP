/**
 * SPRINT ESCENA 9 — T4 · qué GPU usa el Chrome del banco: t4-gpu.ts
 *
 * Abre el Chrome del banco (el del sistema, con las banderas de siempre) con cada juego de banderas EXTRA y lee, en
 * la página de /v3, lo que WebGL dice de la placa (`WEBGL_debug_renderer_info`: el renderizador sin enmascarar) y lo
 * que Chrome dice de sus GPU (`SystemInfo.getInfo`). La máquina tiene una NVIDIA y una AMD integrada: la pregunta es cuál
 * usa el banco por defecto y con qué bandera usa la NVIDIA.
 */
import { writeFileSync } from 'node:fs'

import { cerrarChrome, lanzarChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, irA, medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'

export const JUEGOS: Readonly<Record<string, readonly string[]>> = {
  'por defecto': [],
  'force_high_performance_gpu': ['--force_high_performance_gpu'],
  'angle d3d11 + alto rendimiento': ['--use-angle=d3d11', '--force_high_performance_gpu'],
  'angle vulkan': ['--use-angle=vulkan'],
}

const QUE_PLACA = `(() => {
  const c = document.createElement('canvas')
  const gl = c.getContext('webgl2', { powerPreference: 'high-performance' })
  if (!gl) return { error: 'sin webgl2' }
  const ext = gl.getExtension('WEBGL_debug_renderer_info')
  return { renderizador: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), vendedor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR) }
})()`

async function principal(): Promise<void> {
  const salida: Record<string, unknown> = {}
  for (const [nombre, banderas] of Object.entries(JUEGOS)) {
    const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/escena9-gpu', ancho: 1000, alto: 700, banderasExtra: banderas })
    try {
      const info = (await chrome.conexion.enviar('SystemInfo.getInfo', {})) as { gpu: { devices: { vendorId: number; deviceId: number; deviceString: string; driverVersion: string }[] } }
      const p = await abrirPagina(chrome)
      await irA(p, 'http://localhost:3000/v3')
      await esperar(2500)
      const placa = await medir<Record<string, string>>(p, QUE_PLACA)
      await cerrarPagina(p)
      salida[nombre] = { banderas, placa, dispositivos: info.gpu.devices.map((d) => ({ vendor: `0x${d.vendorId.toString(16)}`, device: `0x${d.deviceId.toString(16)}`, nombre: d.deviceString, driver: d.driverVersion })) }
      console.log(nombre, JSON.stringify(placa))
    } catch (e: unknown) {
      salida[nombre] = { banderas, error: e instanceof Error ? e.message : String(e) }
      console.log(nombre, 'ERROR', e instanceof Error ? e.message : String(e))
    } finally {
      await cerrarChrome(chrome)
    }
  }
  writeFileSync(`${carpeta('t4-fluidez')}/gpu-del-banco.json`, JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('t4-gpu.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })

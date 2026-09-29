/**
 * SPRINT CALIDAD 1 — B1 · el experimento del shader de los rayos: shader.ts
 *
 * Toma de la página el shader REAL de los rayos del amanecer (el programa que usa el objeto «rayos del amanecer»,
 * con todo lo que three le antepone) y cronometra, en un contexto WebGL2 nuevo, compilar + enlazar + el primer dibujo
 * (con `finish`: el ejecutable de Direct3D se arma recién ahí). Con variantes, para saber qué parte cuesta. Cada
 * variante lleva una constante distinta: ANGLE guarda lo compilado por fuente, y sin eso la segunda sería gratis.
 */
import { medir } from '../../scripts-b4/navegador'
import { esperar } from '../../scripts-viajes/banco'
import { abrirMotor } from './abrir'

const EXPERIMENTO = `(async () => {
  const p = window.__gpuDelBanco.programas()
  const id = p.lista.find((x) => x.usadoPor.includes('rayos del amanecer')).id
  const gl0 = window.__gpuDelBanco.contexto()
  const programa = window.__gpuDelBanco.programaCrudo(id)
  const [vs, fs] = gl0.getAttachedShaders(programa).sort((a, b) => gl0.getShaderParameter(a, gl0.SHADER_TYPE) === gl0.VERTEX_SHADER ? -1 : 1)
  const fuenteV = gl0.getShaderSource(vs)
  const fuenteF = gl0.getShaderSource(fs)
  const variantes = {
    'tal cual': (f) => f,
    'lazo con tope fijo (20)': (f) => f.replace(/i < uPasos/, 'i < 20'),
    'sin el ruido del aire': (f) => f.replace(/float aire = [^;]+;/, 'float aire = 1.0;'),
    'sin la trama': (f) => f.replace(/suma \\+= delanteDeLaTrama\\( p, uSolDelAmanecer \\) \\* aire \\* paso;/, 'suma += aire * paso;'),
    'sin trama ni ruido': (f) => f.replace(/float aire = [^;]+;/, 'float aire = 1.0;').replace(/suma \\+= delanteDeLaTrama\\( p, uSolDelAmanecer \\) \\* aire \\* paso;/, 'suma += aire * paso;'),
  }
  const c = document.createElement('canvas')
  c.width = 64; c.height = 64
  const gl = c.getContext('webgl2')
  const salida = {}
  let n = 0
  for (const [nombre, cambio] of Object.entries(variantes)) {
    n += 1
    // Una constante distinta por variante: sin caché.
    const f = cambio(fuenteF).replace('void main() {', 'uniform float uSinCache' + n + ';\\nvoid main() {')
    const t0 = performance.now()
    const v = gl.createShader(gl.VERTEX_SHADER); gl.shaderSource(v, fuenteV.replace('void main() {', 'uniform float uSinCacheV' + n + ';\\nvoid main() {')); gl.compileShader(v)
    const s = gl.createShader(gl.FRAGMENT_SHADER); gl.shaderSource(s, f); gl.compileShader(s)
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, s); gl.linkProgram(pr)
    const ok = gl.getProgramParameter(pr, gl.LINK_STATUS)
    const t1 = performance.now()
    gl.useProgram(pr)
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'position'); if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0) }
    const u = gl.getUniformLocation(pr, 'uPasos'); if (u) gl.uniform1i(u, 20)
    const r = gl.getUniformLocation(pr, 'uRayos'); if (r) gl.uniform1f(r, 1)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.finish()
    const t2 = performance.now()
    salida[nombre] = { enlazarMs: Math.round(t1 - t0), primerDibujoMs: Math.round(t2 - t1), ok, log: ok ? '' : gl.getProgramInfoLog(pr).slice(0, 200) }
  }
  return salida
})()`

async function principal(): Promise<void> {
  const b = await abrirMotor(1440, 900)
  try {
    await esperar(4000)
    console.log(JSON.stringify(await medir<unknown>(b.p, EXPERIMENTO), null, 1))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('shader.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })

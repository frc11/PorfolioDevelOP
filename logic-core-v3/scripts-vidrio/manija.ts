/**
 * LA MANIJA — cómo se llega a la escena de three.js desde la página.
 *
 * ⚠️ **Por qué hace falta buscarla, y por qué no se supone.** El camino
 * documentado de `react-three-fiber` —`canvas.__r3f`— **no existe en la versión
 * instalada**: la sonda lo comprobó en los dos anchos y el canvas sólo trae
 * `__reactFiber$…` y `__reactProps$…`. Lo único global es `window.__THREE__`,
 * que es el número de revisión de three y no la escena.
 *
 * El camino que queda es la FIBRA de React: desde el nodo del canvas se sube
 * por `return`, y en cada fibra se miran dos sitios donde r3f podría estar
 * guardando su almacén —la lista de hooks (`memoizedState`) y el valor de un
 * proveedor de contexto (`memoizedProps.value`)—. Se reconoce por su forma, no
 * por su nombre: **un objeto con `getState()` que devuelve algo con `scene`**.
 *
 * Es API interna, así que todo lo que la usa VERIFICA primero y falla con un
 * motivo si no la encuentra, en vez de devolver un cero plausible.
 */

/** Deja `window.__vidrio` con la escena y el material del logo, o con el motivo. */
export const INSTALAR_LA_MANIJA = [
  '(() => {',
  '  const salida = { hay: false, motivo: "", mallas: 0, materiales: 0 }',
  '  const c = document.querySelector("canvas")',
  '  if (c === null) { salida.motivo = "no hay canvas"; window.__vidrio = salida; return salida }',
  '  const clave = Object.keys(c).find((k) => k.indexOf("__reactFiber$") === 0)',
  '  if (clave === undefined) { salida.motivo = "el canvas no tiene fibra"; window.__vidrio = salida; return salida }',
  '',
  '  const esAlmacen = (v) => {',
  '    if (v === null || typeof v !== "object" || typeof v.getState !== "function") return null',
  '    try {',
  '      const st = v.getState()',
  '      return st !== null && typeof st === "object" && st.scene !== undefined && st.scene !== null ? st : null',
  '    } catch (e) { return null }',
  '  }',
  '',
  '  let escena = null',
  '  let fibra = c[clave]',
  '  for (let i = 0; i < 40 && fibra !== null && fibra !== undefined && escena === null; i += 1) {',
  '    let hook = fibra.memoizedState',
  '    for (let j = 0; j < 40 && hook !== null && hook !== undefined && escena === null; j += 1) {',
  '      const st = esAlmacen(hook.memoizedState)',
  '      if (st !== null) escena = st.scene',
  '      hook = hook.next',
  '    }',
  '    if (escena === null && fibra.memoizedProps !== null && fibra.memoizedProps !== undefined) {',
  '      const st = esAlmacen(fibra.memoizedProps.value)',
  '      if (st !== null) escena = st.scene',
  '    }',
  '    fibra = fibra.return',
  '  }',
  '  if (escena === null) { salida.motivo = "no apareció un almacén con escena en 40 fibras"; window.__vidrio = salida; return salida }',
  '',
  '  const mallas = []',
  '  const materiales = new Map()',
  '  escena.traverse((o) => {',
  '    if (o.isMesh !== true) return',
  '    mallas.push(o)',
  '    if (o.material && !materiales.has(o.material.uuid)) materiales.set(o.material.uuid, o.material)',
  '  })',
  '  salida.hay = true',
  '  salida.mallas = mallas.length',
  '  salida.materiales = materiales.size',
  '  window.__vidrio = {',
  '    hay: true,',
  '    motivo: "",',
  '    mallas: mallas.length,',
  '    materiales: materiales.size,',
  '    escena,',
  '    listaDeMallas: mallas,',
  '    listaDeMateriales: [...materiales.values()],',
  '  }',
  '  return salida',
  '})()',
].join('\n')

/** El censo de lo que la manija encontró: tipos, colores y cuántas mallas usa cada material. */
export const CENSO_DE_MATERIALES = [
  '(() => {',
  '  const v = window.__vidrio',
  '  if (!v || v.hay !== true) return { hay: false, motivo: v ? v.motivo : "sin manija" }',
  '  return {',
  '    hay: true,',
  '    mallas: v.mallas,',
  '    materiales: v.listaDeMateriales.map((m) => ({',
  '      tipo: m.type,',
  '      color: m.color ? "#" + m.color.getHexString() : null,',
  '      rugosidad: m.roughness === undefined ? null : m.roughness,',
  '      metalico: m.metalness === undefined ? null : m.metalness,',
  '      emisiva: m.emissive ? "#" + m.emissive.getHexString() : null,',
  '      lados: m.side,',
  '      usos: v.listaDeMallas.filter((o) => o.material === m).length,',
  '      triangulos: v.listaDeMallas',
  '        .filter((o) => o.material === m)',
  '        .reduce((n, o) => n + (o.geometry && o.geometry.index ? o.geometry.index.count / 3 : 0), 0),',
  '    })),',
  '  }',
  '})()',
].join('\n')

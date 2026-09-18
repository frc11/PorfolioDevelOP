/**
 * EL GRABADOR QUE CORRE ADENTRO DE LA PÁGINA — una sola fuente, dos sitios.
 *
 * ── Por qué un grabador y no una lectura por instante ─────────────────────
 *
 * `COMPONENTS.md` §3.2 ya leyó el CTA de la referencia en DOS instantes
 * (reposo y hover) y por eso pudo decir *qué valores* toma. Este sprint
 * pregunta otra cosa: **cuándo**, **en qué orden**, **con qué curva** y **qué
 * pasa al salir**. Nada de eso se puede contestar con dos lecturas: hace falta
 * la serie entera.
 *
 * Una lectura por CDP cuesta un viaje de ida y vuelta (2–10 ms) y no cae en un
 * cuadro determinado, así que muestrear desde Node daría una serie con el reloj
 * del conductor y no el de la página. Por eso el muestreo corre **adentro**, en
 * un `requestAnimationFrame`, y Node sólo mueve el puntero y se lleva el
 * resultado al final.
 *
 * ── Qué guarda, y por qué SÓLO los cambios ────────────────────────────────
 *
 * Para cada nodo del subárbol del CTA —los elementos y sus pseudo-elementos—
 * guarda, por cuadro, una tanda de propiedades computadas, la caja y el
 * atributo `style`. Pero **escribe una entrada sólo cuando el valor cambia**.
 * Eso hace tres cosas: el archivo queda chico, el primer y el último cambio de
 * cada propiedad son el arranque y el final de su tramo —que es exactamente la
 * pregunta del PASO 2—, y una propiedad que no se mueve queda con UNA entrada,
 * que es la prueba de que no participa.
 *
 * ── La caja se lee de `getBoundingClientRect()`, a propósito ──────────────
 *
 * `CLAUDE.md` advierte que esa llamada miente con transformadas activas — y es
 * cierto **para medir layout**. Acá se quiere justo lo contrario: la caja
 * VISUAL, ya transformada, que es dónde está el píxel. Es la única lectura que
 * describe el subrayado sin depender de CÓMO esté implementado (ancho,
 * `transform`, `clip-path` o `background-position`), así que sirve de control
 * cruzado de lo que digan las propiedades.
 *
 * ── Lo que este archivo NO hace, y es una regla del sprint ────────────────
 *
 * **No transcribe nada del sitio ajeno.** No guarda clases, ni ids, ni
 * selectores: el identificador de cada nodo es su CAMINO estructural
 * (`a>button[0]>span[1]`), derivado del índice entre hermanos. Lo que sale de
 * acá son números y nombres de propiedades del estándar.
 */

/** El identificador de la marca del conductor, para anclar el reloj de Node al de la página. */
export type MarcaDelConductor = 'entrar' | 'salir' | 'capturar' | 'congelar'

/**
 * Las propiedades que se leen EN CADA CUADRO. La lista es corta a propósito:
 * cada una cuesta una serialización por nodo y por cuadro, y un muestreador que
 * hace caer los cuadros mide su propio costo en vez del sitio. El banco publica
 * el intervalo entre cuadros logrado (p50/p95) para que eso se pueda verificar.
 */
export const PROPIEDADES_DINAMICAS: readonly string[] = [
  'transform',
  'transformOrigin',
  'opacity',
  'clipPath',
  'width',
  'height',
  'left',
  'right',
  'top',
  'bottom',
  'translate',
  'rotate',
  'scale',
  'backgroundImage',
  'backgroundColor',
  'backgroundPosition',
  'backgroundSize',
  'color',
  'boxShadow',
  'textShadow',
  'filter',
  'maskImage',
  'maskPosition',
  'maskSize',
  'borderBottomWidth',
  'borderBottomColor',
  'fontWeight',
  'letterSpacing',
  'textDecorationColor',
  'textUnderlineOffset',
  'visibility',
  'fontVariationSettings',
  'fontStretch',
]

/**
 * Las que se leen UNA vez por estado (reposo, hover pleno, después de salir).
 * Acá viven las declaradas —`transition-*` y `animation-*`—, que son la
 * respuesta directa a «la duración y la curva de cada tramo» cuando el gesto es
 * CSS. Si el gesto fuera de JavaScript estas propiedades salen vacías y la
 * duración la tiene que dar la serie: las dos vías están puestas a propósito.
 */
export const PROPIEDADES_ESTATICAS: readonly string[] = [
  ...PROPIEDADES_DINAMICAS,
  'display',
  'position',
  'overflow',
  'zIndex',
  'inset',
  'fontFamily',
  'fontSize',
  'lineHeight',
  'willChange',
  'pointerEvents',
  'textDecorationLine',
  'borderBottomStyle',
  'mixBlendMode',
  'backdropFilter',
  'transitionProperty',
  'transitionDuration',
  'transitionTimingFunction',
  'transitionDelay',
  'animationName',
  'animationDuration',
  'animationTimingFunction',
  'animationDelay',
  'animationIterationCount',
  'animationFillMode',
  'animationPlayState',
  'isolation',
  'webkitMaskImage',
  'webkitMaskPosition',
  'webkitMaskSize',
  'webkitTextStrokeWidth',
]

export interface NodoEstatico {
  readonly clave: string
  readonly etiqueta: string
  readonly pseudo: string | null
  readonly texto: string
  readonly rect: readonly number[] | null
  readonly estilo: Readonly<Record<string, string>>
}

export interface Preparacion {
  readonly encontrado: boolean
  readonly motivo: string
  readonly clave: string
  readonly etiqueta: string
  readonly texto: string
  readonly rect: readonly number[]
  readonly cantidadDeNodos: number
  readonly nodos: readonly NodoEstatico[]
  /** `scrollY` al momento de preparar. Sirve para verificar que no se movió. */
  readonly scrollY: number
}

export interface EventoDelPuntero {
  readonly t: number
  readonly tipo: string
}

export interface SerieDeNodo {
  readonly clave: string
  readonly cs: Readonly<Record<string, readonly (readonly [number, string])[]>>
  readonly rect: readonly (readonly [number, readonly number[]])[]
  readonly inline: readonly (readonly [number, string])[]
}

export interface Grabacion {
  readonly cuadros: number
  readonly duracionMs: number
  readonly dtP50: number
  readonly dtP95: number
  readonly dtMax: number
  readonly eventos: readonly EventoDelPuntero[]
  readonly marcas: readonly EventoDelPuntero[]
  readonly series: readonly SerieDeNodo[]
  readonly movimientosDePuntero: number
}

/**
 * El fuente que se inyecta. Se escribe con concatenación y sin literales de
 * plantilla porque viaja adentro de uno: un `dólar-llave` de más acá adentro lo
 * interpolaría TypeScript y el error aparecería recién en el navegador.
 */
export const FUENTE_DEL_GRABADOR = `
;(function () {
  if (window.__boton) return
  var PROPS_DIN = ${JSON.stringify(PROPIEDADES_DINAMICAS)}
  var PROPS_EST = ${JSON.stringify(PROPIEDADES_ESTATICAS)}

  function dos(n) { return Math.round(n * 100) / 100 }
  function decima(n) { return Math.round(n * 10) / 10 }

  function camino(raiz, el) {
    if (el === raiz) return el.tagName.toLowerCase()
    var partes = []
    var n = el
    while (n !== raiz && n.parentElement) {
      var i = Array.prototype.indexOf.call(n.parentElement.children, n)
      partes.unshift(n.tagName.toLowerCase() + '[' + i + ']')
      n = n.parentElement
    }
    return raiz.tagName.toLowerCase() + '>' + partes.join('>')
  }

  function nodosDe(raiz) {
    var salida = []
    var todos = [raiz].concat(Array.prototype.slice.call(raiz.querySelectorAll('*')))
    for (var i = 0; i < todos.length; i += 1) {
      var el = todos[i]
      var c = camino(raiz, el)
      salida.push({ clave: c, el: el, pseudo: null })
      var pseudos = ['::before', '::after']
      for (var j = 0; j < pseudos.length; j += 1) {
        var cs = getComputedStyle(el, pseudos[j])
        if (cs.content && cs.content !== 'none') salida.push({ clave: c + pseudos[j], el: el, pseudo: pseudos[j] })
      }
    }
    return salida
  }

  function leerEstilo(n, props) {
    var cs = getComputedStyle(n.el, n.pseudo)
    var v = {}
    for (var i = 0; i < props.length; i += 1) {
      var p = props[i]
      var x = cs[p]
      v[p] = x === undefined || x === null ? '' : String(x)
    }
    return v
  }

  function cajaDe(n) {
    if (n.pseudo !== null) return null
    var r = n.el.getBoundingClientRect()
    return [dos(r.x), dos(r.y), dos(r.width), dos(r.height)]
  }

  function textoDe(n) {
    if (n.pseudo !== null) {
      var cs = getComputedStyle(n.el, n.pseudo)
      return String(cs.content || '')
    }
    var propio = ''
    for (var i = 0; i < n.el.childNodes.length; i += 1) {
      var h = n.el.childNodes[i]
      if (h.nodeType === 3) propio += h.nodeValue
    }
    return propio.replace(/\\s+/g, ' ').trim()
  }

  function visible(el) {
    var r = el.getBoundingClientRect()
    if (r.width <= 0 || r.height <= 0) return false
    var cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none'
  }

  function porTexto(frase) {
    var objetivo = String(frase).replace(/\\s+/g, ' ').trim().toUpperCase()
    var todos = Array.prototype.slice.call(document.querySelectorAll('a,button,[role="button"],[role="link"]'))
    var candidatos = []
    for (var i = 0; i < todos.length; i += 1) {
      var t = (todos[i].textContent || '').replace(/\\s+/g, ' ').trim().toUpperCase()
      if (t.indexOf(objetivo) >= 0 && visible(todos[i])) candidatos.push(todos[i])
    }
    var hojas = candidatos.filter(function (el) {
      return !candidatos.some(function (o) { return o !== el && el.contains(o) })
    })
    return hojas
  }

  var estado = { raiz: null, nodos: [], corriendo: false, t0: 0, datos: {}, eventos: [], marcas: [], ts: [], movs: 0, sueltas: [] }

  window.__boton = {
    /**
     * El censo de rotulos visibles de la pagina.
     *
     * Existe por la regla de la referencia: UNA navegacion. Si el rotulo que la
     * instruccion nombra no estuviera exactamente como se lo escribe —otra caja,
     * otro espaciado, el sitio cambiado desde que se midio en S0— buscarlo y
     * fallar gastaria la navegacion sin traer nada. Con el censo, la misma carga
     * que buscaba trae ademas la lista de lo que hay, y la busqueda puede
     * aflojar el criterio sin volver a entrar.
     */
    rotulos: function () {
      var todos = Array.prototype.slice.call(document.querySelectorAll('a,button,[role="button"],[role="link"]'))
      var salida = []
      for (var i = 0; i < todos.length; i += 1) {
        if (!visible(todos[i])) continue
        var r = todos[i].getBoundingClientRect()
        salida.push({
          etiqueta: todos[i].tagName.toLowerCase(),
          texto: (todos[i].textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
          rect: [dos(r.x), dos(r.y), dos(r.width), dos(r.height)],
          hijos: todos[i].querySelectorAll('*').length,
        })
      }
      return salida
    },

    /**
     * Encuentra el CTA y devuelve su inventario estático.
     * La opcion "texto" busca por rotulo visible; "selector", por atributo
     * propio. El primero es el unico camino posible en un sitio ajeno, del que
     * no se copia un selector.
     */
    preparar: function (opciones) {
      var raices = []
      if (opciones.selector) {
        raices = Array.prototype.slice.call(document.querySelectorAll(opciones.selector)).filter(visible)
      } else {
        raices = porTexto(opciones.texto)
      }
      if (raices.length === 0) {
        return { encontrado: false, motivo: 'ningun candidato visible', clave: '', etiqueta: '', texto: '', rect: [], cantidadDeNodos: 0, nodos: [], scrollY: window.scrollY }
      }
      var indice = opciones.indice === undefined ? 0 : opciones.indice
      if (indice >= raices.length) {
        return { encontrado: false, motivo: 'hay ' + raices.length + ' candidatos y se pidio el ' + indice, clave: '', etiqueta: '', texto: '', rect: [], cantidadDeNodos: 0, nodos: [], scrollY: window.scrollY }
      }
      var raiz = raices[indice]
      estado.raiz = raiz
      estado.nodos = nodosDe(raiz)
      var r = raiz.getBoundingClientRect()
      return {
        encontrado: true,
        motivo: 'candidatos visibles: ' + raices.length,
        clave: camino(raiz, raiz),
        etiqueta: raiz.tagName.toLowerCase(),
        texto: (raiz.textContent || '').replace(/\\s+/g, ' ').trim(),
        rect: [dos(r.x), dos(r.y), dos(r.width), dos(r.height)],
        cantidadDeNodos: estado.nodos.length,
        nodos: estado.nodos.map(function (n) {
          return { clave: n.clave, etiqueta: n.el.tagName.toLowerCase(), pseudo: n.pseudo, texto: textoDe(n), rect: cajaDe(n), estilo: leerEstilo(n, PROPS_EST) }
        }),
        scrollY: window.scrollY,
      }
    },

    /** Una foto estática del subárbol, para los tres estados del PASO 1. */
    foto: function () {
      return estado.nodos.map(function (n) {
        return { clave: n.clave, etiqueta: n.el.tagName.toLowerCase(), pseudo: n.pseudo, texto: textoDe(n), rect: cajaDe(n), estilo: leerEstilo(n, PROPS_EST) }
      })
    },

    /** Enciende el muestreador por cuadro y los escuchas de puntero. */
    arrancar: function () {
      estado.t0 = performance.now()
      estado.datos = {}
      estado.eventos = []
      estado.marcas = []
      estado.ts = []
      estado.movs = 0
      for (var i = 0; i < estado.nodos.length; i += 1) {
        var d = { clave: estado.nodos[i].clave, cs: {}, rect: [], inline: [], ultimo: { cs: {}, rect: '#', inline: '#' } }
        for (var j = 0; j < PROPS_DIN.length; j += 1) { d.cs[PROPS_DIN[j]] = []; d.ultimo.cs[PROPS_DIN[j]] = '#' }
        estado.datos[estado.nodos[i].clave] = d
      }
      var tipos = ['pointerover', 'pointerout', 'mouseenter', 'mouseleave', 'focus', 'blur']
      estado.sueltas = []
      for (var k = 0; k < tipos.length; k += 1) {
        (function (tipo) {
          var f = function (e) { estado.eventos.push({ t: decima(performance.now() - estado.t0), tipo: tipo + (e.target === estado.raiz ? '' : ':hijo') }) }
          estado.raiz.addEventListener(tipo, f, true)
          estado.sueltas.push({ tipo: tipo, f: f })
        })(tipos[k])
      }
      var fm = function () { estado.movs += 1 }
      estado.raiz.addEventListener('pointermove', fm, true)
      estado.sueltas.push({ tipo: 'pointermove', f: fm })
      estado.corriendo = true
      var cuadro = function () {
        if (!estado.corriendo) return
        var t = decima(performance.now() - estado.t0)
        estado.ts.push(t)
        for (var a = 0; a < estado.nodos.length; a += 1) {
          var n = estado.nodos[a]
          var d = estado.datos[n.clave]
          var cs = getComputedStyle(n.el, n.pseudo)
          for (var b = 0; b < PROPS_DIN.length; b += 1) {
            var p = PROPS_DIN[b]
            var x = cs[p]
            var v = x === undefined || x === null ? '' : String(x)
            if (d.ultimo.cs[p] !== v) { d.cs[p].push([t, v]); d.ultimo.cs[p] = v }
          }
          if (n.pseudo === null) {
            var r = n.el.getBoundingClientRect()
            var caja = [dos(r.x), dos(r.y), dos(r.width), dos(r.height)]
            var s = caja.join(',')
            if (d.ultimo.rect !== s) { d.rect.push([t, caja]); d.ultimo.rect = s }
            var inl = n.el.getAttribute('style') || ''
            if (d.ultimo.inline !== inl) { d.inline.push([t, inl]); d.ultimo.inline = inl }
          }
        }
        requestAnimationFrame(cuadro)
      }
      requestAnimationFrame(cuadro)
      return estado.t0
    },

    /** Una marca del conductor en el reloj de la página. */
    marcar: function (etiqueta) {
      var t = decima(performance.now() - estado.t0)
      estado.marcas.push({ t: t, tipo: etiqueta })
      return t
    },

    /** El reloj de la página, sin marcar. Para poner corchetes a una captura. */
    reloj: function () { return decima(performance.now() - estado.t0) },

    parar: function () {
      estado.corriendo = false
      for (var i = 0; i < estado.sueltas.length; i += 1) {
        estado.raiz.removeEventListener(estado.sueltas[i].tipo, estado.sueltas[i].f, true)
      }
      var dts = []
      for (var j = 1; j < estado.ts.length; j += 1) dts.push(estado.ts[j] - estado.ts[j - 1])
      dts.sort(function (a, b) { return a - b })
      var pick = function (q) { return dts.length === 0 ? 0 : decima(dts[Math.min(dts.length - 1, Math.floor(q * dts.length))]) }
      var series = []
      for (var k = 0; k < estado.nodos.length; k += 1) {
        var d = estado.datos[estado.nodos[k].clave]
        series.push({ clave: d.clave, cs: d.cs, rect: d.rect, inline: d.inline })
      }
      return {
        cuadros: estado.ts.length,
        duracionMs: estado.ts.length === 0 ? 0 : estado.ts[estado.ts.length - 1],
        dtP50: pick(0.5),
        dtP95: pick(0.95),
        dtMax: dts.length === 0 ? 0 : decima(dts[dts.length - 1]),
        eventos: estado.eventos,
        marcas: estado.marcas,
        series: series,
        movimientosDePuntero: estado.movs,
      }
    },

    /**
     * Congela TODA animación del subárbol en un instante exacto.
     *
     * Es la única forma de que la captura «a mitad del hover» caiga en el
     * milisegundo que se declara: una captura por reloj llega cuando llega, y
     * sobre una transición de 1,3 s un desvío de 80 ms es un 6 % del gesto.
     * Funciona sobre transiciones y animaciones CSS, que son objetos de la API
     * de animaciones web. **Si el gesto fuera de JavaScript devuelve 0**, y eso
     * mismo es un dato: la captura pasa a ser por reloj y el reporte lo dice.
     */
    congelar: function (ms) {
      var as = estado.raiz.getAnimations({ subtree: true })
      for (var i = 0; i < as.length; i += 1) {
        try { as[i].pause(); as[i].currentTime = ms } catch (e) { /* una animación sin timeline */ }
      }
      return as.length
    },

    /**
     * Suelta lo congelado. Se llama con un tiempo grande ANTES, para que cada
     * transición termine y se retire sola: una animación pausada a mitad de
     * camino que después pierde el hover deja al navegador arrancando la vuelta
     * desde un valor congelado, y el estado siguiente no sería el de nadie.
     */
    soltar: function () {
      var as = estado.raiz.getAnimations({ subtree: true })
      for (var i = 0; i < as.length; i += 1) {
        try { as[i].play() } catch (e) { /* sin timeline */ }
      }
      return as.length
    },

    /** Trae el CTA al centro del viewport con scroll real. Devuelve el scroll logrado. */
    asomar: function () {
      var r = estado.raiz.getBoundingClientRect()
      var y = window.scrollY + r.top - (window.innerHeight / 2 - r.height / 2)
      window.scrollTo(0, Math.max(0, Math.round(y)))
      return window.scrollY
    },

    /** Cuántas animaciones de la API web hay vivas ahora mismo. */
    animaciones: function () {
      var as = estado.raiz.getAnimations({ subtree: true })
      return as.map(function (a) {
        var e = a.effect
        var t = e && e.getTiming ? e.getTiming() : {}
        return {
          tipo: a.constructor && a.constructor.name ? a.constructor.name : '?',
          propiedad: a.transitionProperty || a.animationName || '',
          duracion: t.duration === undefined ? null : t.duration,
          retardo: t.delay === undefined ? null : t.delay,
          curva: t.easing === undefined ? '' : t.easing,
          objetivo: e && e.target ? camino(estado.raiz, e.target) : '',
          pseudo: e && e.pseudoElement ? e.pseudoElement : null,
          tiempo: a.currentTime === null ? null : decima(Number(a.currentTime)),
        }
      })
    },

    /** La caja visual del CTA, ahora, en coordenadas del VIEWPORT (para el puntero). */
    caja: function () {
      var r = estado.raiz.getBoundingClientRect()
      return [dos(r.x), dos(r.y), dos(r.width), dos(r.height)]
    },

    /**
     * La misma caja en coordenadas del DOCUMENTO — para el recorte de la foto.
     *
     * No es un detalle: el "clip" de Page.captureScreenshot se interpreta
     * contra la PAGINA y no contra la ventana. Pasarle la caja del viewport
     * saca una foto corrida hacia arriba en exactamente el scroll que haya, y
     * con el scroll grande —el CTA del Cierre— saca un PNG en blanco de 502
     * bytes que parece una captura y no lo es.
     */
    cajaEnDocumento: function () {
      var r = estado.raiz.getBoundingClientRect()
      return [dos(r.x + window.scrollX), dos(r.y + window.scrollY), dos(r.width), dos(r.height)]
    },

    /** El desplazamiento de la ventana, que es lo que separa los dos sistemas de coordenadas. */
    desplazamiento: function () { return [Math.round(window.scrollX), Math.round(window.scrollY)] },

    /** Qué hay en un punto: si el CTA lo contiene, el hover va a prender. */
    golpea: function (x, y) {
      var el = document.elementFromPoint(x, y)
      if (el === null) return { hay: false, dentro: false, etiqueta: '' }
      return { hay: true, dentro: estado.raiz === el || estado.raiz.contains(el), etiqueta: el.tagName.toLowerCase() }
    },
  }
})()
`

;(function () {
  'use strict'

  var WIDGET_VERSION = '1.0.0'

  // z-index tokens — mirror CHATBOT_Z_INDEX in src/modules/chatbot/shared/zIndex.ts.
  // High enough to layer above typical host UI (nav, sticky headers, common
  // overlays in 100-9999 range) but NOT int32 max — we leave headroom so the
  // host can still render legitimate full-screen overlays above us.
  var Z_BUBBLE = 2147000100
  var Z_PANEL = 2147000200

  // Detect origin from the script tag's src so it works in dev and prod
  var scripts = document.querySelectorAll('script[data-bot]')
  var scriptTag = scripts[scripts.length - 1]
  if (!scriptTag) {
    console.error('[develOP] No se encontró data-bot en el script tag')
    return
  }

  var BASE_URL = 'https://develop.com.ar'
  try {
    if (scriptTag.src) BASE_URL = new URL(scriptTag.src).origin
  } catch (_) {}

  var botSlug = scriptTag.getAttribute('data-bot')
  var theme = scriptTag.getAttribute('data-theme') || 'dark'
  var position = scriptTag.getAttribute('data-position') || 'bottom-right'

  if (!botSlug) {
    console.error('[develOP] data-bot es obligatorio')
    return
  }

  var widgetOpen = false
  var iframe = null
  var bubble = null
  var side = position === 'bottom-left' ? 'left:20px;' : 'right:20px;'
  // Mobile: respect safe-area-inset on iPhone notch / Android gesture nav.
  // max() makes sure we stay at least 16px in from the edge.
  var sideM =
    position === 'bottom-left'
      ? 'left:max(16px,env(safe-area-inset-left));'
      : 'right:max(16px,env(safe-area-inset-right));'

  // Styles
  //
  // CSS isolation strategy: the iframe content is fully isolated (browser
  // sandboxing). What lives in the host DOM is the bubble (and the iframe
  // element itself). Both start with `all: initial` to neutralise host CSS
  // resets (e.g. `* { box-sizing }`, `button { all: revert }`), then declare
  // every property explicitly. This makes the widget hermetic against the
  // host's stylesheet without a Shadow DOM refactor for a single button.
  //
  // 🔴 Pending: this hardening is verified only against build prod in
  // isolation. Real-world embedded verification (third-party hostile CSS)
  // is deferred — see B8.1 bitácora entry.
  var style = document.createElement('style')
  style.textContent =
    '.dvlp-bubble{' +
    'all:initial;' +
    'position:fixed;' + side +
    'bottom:20px;width:56px;height:56px;border-radius:28px;' +
    'background:#06b6d4;cursor:pointer;z-index:' + Z_BUBBLE + ';' +
    'box-shadow:0 4px 24px rgba(0,0,0,0.25);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:transform 0.2s,opacity 0.2s;border:none;padding:0;' +
    'box-sizing:border-box;line-height:1;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
    '}' +
    '.dvlp-bubble:hover{transform:scale(1.06);}' +
    '.dvlp-bubble svg{' +
    'all:initial;display:block;width:26px;height:26px;fill:white;pointer-events:none;' +
    '}' +
    '.dvlp-iframe{' +
    'all:initial;' +
    'position:fixed;' + side +
    'bottom:20px;width:380px;height:600px;max-height:90vh;' +
    'border:none;border-radius:16px;z-index:' + Z_PANEL + ';' +
    'box-shadow:0 12px 40px rgba(0,0,0,0.35);' +
    'opacity:0;pointer-events:none;transition:opacity 0.25s,transform 0.25s;' +
    'transform:translateY(12px) scale(0.97);' +
    'box-sizing:border-box;display:block;background:transparent;' +
    '}' +
    '.dvlp-iframe.dvlp-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1);}' +
    '@media(max-width:480px){' +
    // height: 100vh fallback for browsers that pre-date dvh (Safari < 15.4,
    // Chrome < 108). 100dvh below shrinks when the virtual keyboard opens so
    // the iframe footer stays visible. The two declarations are intentional —
    // CSS picks the last supported one.
    '.dvlp-iframe{width:100vw;height:100vh;height:100dvh;max-height:100dvh;bottom:0;left:0!important;right:0!important;border-radius:0;}' +
    // Bubble mobile: respect safe-area-inset-bottom (home indicator on iPhone).
    '.dvlp-bubble{' + sideM + 'bottom:max(16px,env(safe-area-inset-bottom));}' +
    '}'

  document.head.appendChild(style)

  // Bubble
  function createBubble() {
    bubble = document.createElement('button')
    bubble.className = 'dvlp-bubble'
    bubble.setAttribute('aria-label', 'Abrir chat')
    bubble.setAttribute('type', 'button')
    bubble.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' +
      '</svg>'
    bubble.addEventListener('click', open)
    document.body.appendChild(bubble)
  }

  // Iframe (created lazily on first open)
  function createIframe() {
    if (iframe) return
    iframe = document.createElement('iframe')
    iframe.className = 'dvlp-iframe'
    iframe.title = 'Chat develOP'
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.setAttribute(
      'sandbox',
      // allow-same-origin: el iframe necesita cookies/storage del dominio develOP
      // allow-popups-to-escape-sandbox: links de handoff (WhatsApp) abren sin sandbox
      'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
    )
    iframe.src =
      BASE_URL +
      '/embed/' +
      encodeURIComponent(botSlug) +
      '?theme=' +
      encodeURIComponent(theme)
    document.body.appendChild(iframe)

    iframe.addEventListener('load', function () {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          // UTM.1 — referrer sumado para atribución first-touch (parentUrl ya
          // se mandaba antes de este sprint).
          { type: 'develop:init', parentUrl: window.location.href, referrer: document.referrer },
          BASE_URL
        )
      }
    })
  }

  function open() {
    if (widgetOpen) return
    if (!iframe) createIframe()
    widgetOpen = true
    iframe.classList.add('dvlp-open')
    bubble.style.opacity = '0'
    bubble.style.pointerEvents = 'none'
    bubble.setAttribute('aria-expanded', 'true')
  }

  function close() {
    if (!widgetOpen) return
    widgetOpen = false
    if (iframe) iframe.classList.remove('dvlp-open')
    bubble.style.opacity = '1'
    bubble.style.pointerEvents = 'auto'
    bubble.setAttribute('aria-expanded', 'false')
  }

  // Listen for messages from iframe
  window.addEventListener('message', function (event) {
    if (event.origin !== BASE_URL) return
    var data = event.data
    if (!data || typeof data !== 'object') return

    switch (data.type) {
      case 'develop:close':
        close()
        break
      case 'develop:ready':
        // iframe handshake confirmed — nothing to do for now
        break
      case 'develop:lead-captured':
        if (window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('develop:lead', { detail: data.payload })
          )
        }
        break
      case 'develop:navigate':
        var path = data.payload && data.payload.path
        if (path) window.open(BASE_URL + path, '_blank', 'noopener')
        break
    }
  })

  // Public API
  window.develOP = {
    open: open,
    close: close,
    version: WIDGET_VERSION,
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBubble)
  } else {
    createBubble()
  }
})()

;(function () {
  'use strict'

  var WIDGET_VERSION = '1.0.0'

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
  var sideM = position === 'bottom-left' ? 'left:16px;' : 'right:16px;'

  // Styles
  var style = document.createElement('style')
  style.textContent =
    '.dvlp-bubble{' +
    'position:fixed;' + side +
    'bottom:20px;width:56px;height:56px;border-radius:28px;' +
    'background:#06b6d4;cursor:pointer;z-index:999999;' +
    'box-shadow:0 4px 24px rgba(0,0,0,0.25);' +
    'display:flex;align-items:center;justify-content:center;' +
    'transition:transform 0.2s,opacity 0.2s;border:none;padding:0;' +
    '}' +
    '.dvlp-bubble:hover{transform:scale(1.06);}' +
    '.dvlp-bubble svg{width:26px;height:26px;fill:white;pointer-events:none;}' +
    '.dvlp-iframe{' +
    'position:fixed;' + side +
    'bottom:20px;width:380px;height:600px;max-height:90vh;' +
    'border:none;border-radius:16px;z-index:999998;' +
    'box-shadow:0 12px 40px rgba(0,0,0,0.35);' +
    'opacity:0;pointer-events:none;transition:opacity 0.25s,transform 0.25s;' +
    'transform:translateY(12px) scale(0.97);' +
    '}' +
    '.dvlp-iframe.dvlp-open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1);}' +
    '@media(max-width:480px){' +
    '.dvlp-iframe{width:100vw;height:100vh;max-height:100vh;bottom:0;left:0!important;right:0!important;border-radius:0;}' +
    '.dvlp-bubble{' + sideM + 'bottom:16px;}' +
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
      'allow-scripts allow-same-origin allow-forms allow-popups'
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
          { type: 'develop:init', parentUrl: window.location.href },
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

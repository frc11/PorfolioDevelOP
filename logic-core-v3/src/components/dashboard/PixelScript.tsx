'use client'

import { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'

interface PixelScriptProps {
  clientId: string
  baseUrl: string
}

export function PixelScript({ clientId, baseUrl }: PixelScriptProps) {
  const [copied, setCopied] = useState(false)

  const script = `<!-- develoP Pixel Start -->
<script>
(function() {
  var startTime = Date.now();
  var clientId = '${clientId}';
  var trackUrl = '${baseUrl}/api/track';

  window.addEventListener('beforeunload', function() {
    var duration = Math.round((Date.now() - startTime) / 1000);
    var data = JSON.stringify({
      clientId: clientId,
      url: window.location.href,
      duration: duration
    });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackUrl, data);
    } else {
      fetch(trackUrl, {
        method: 'POST',
        body: data,
        keepalive: true,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
})();
</script>
<!-- develoP Pixel End -->`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Código del Píxel</span>
        </div>
        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
            copied 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar Script'}
        </button>
      </div>
      <div className="relative p-6">
        <pre className="overflow-x-auto text-xs leading-relaxed text-cyan-50/70 font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <code>{script}</code>
        </pre>
        
        {/* Glow effect */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>
    </div>
  )
}

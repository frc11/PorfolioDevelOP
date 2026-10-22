# B9 · El cristal que se agrieta

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B9 · **El cristal que se agrieta, como firma del sitio** (craneado el 2026-10-21).
  - **En el home:** al amanecer, cuando vuelve la escena después del velo blanco, en el momento en que el título se da vuelta para volverse el último CTA.
  - **Al cambiar de página:** cuando el título 3D de la página nueva termina de entrar. Las grietas se quedan (el papel las tapa al bajar y vuelven a verse al subir).
  - **Con gatillo:**
    - las grietas nacen en varios puntos y se forman a la vista, en ~1,5 s;
    - quedan OSCURAS ~1 s;
    - después se iluminan, con una luz fina en el borde: neutra en el home y con el acento del servicio en las páginas;
    - al pasar ese punto hacia arriba, se cierran en reversa, también a la vista.
  - **Variantes con `?grietas=`:**
    - `1`: telaraña (3 a 5 impactos que se ramifican en estrella);
    - `2`: fractura larga (pocas líneas que cruzan el domo y se bifurcan);
    - `3`: por las juntas (siguen los bordes de las celdas del cristal y se propagan de celda en celda).
  - **El sonido:** un crujido de vidrio suave, solo si se encuentra uno bueno con licencia libre (CC0); si no, sin sonido. Respeta el mute.
  - **Lo demás:** en el teléfono, una versión compacta con menos grietas; con movimiento reducido, las grietas aparecen de una, sin animación. Se hace en el material del cristal, sin partir la geometría.
  - **Para evaluar después:** si la grieta iluminada puede reemplazar a la luz del piso como variante de las páginas. Se decide cuando Valentino lo vea.

## Archivos (a confirmar)
- El material del cristal de la escena (`_lib/escena/**`): las grietas se hacen en el shader o material, sin partir la geometría.
- El disparo en el home (el momento del último CTA, al amanecer) y en las páginas (cuando termina de entrar el título 3D: hoy se prueba en `/v3/pagina-base`).
- Va DESPUÉS de B8 (el mismo material).
- El sonido: solo si encontrás uno CC0 de buena calidad. Si no, dejalo preparado sin archivo y anotalo.

## El disparador
Dejá las grietas detrás de un disparador (una función o señal con avance y reversa) y una página o bandera de prueba para verlas solas. Los enganches:
- **en las páginas:** cuando termina de entrar el título 3D (ya existe desde T0); hacelo vos;
- **en el home:** en el momento en que el título se vuelve el CTA (lo construye B3). Si B3 ya está integrado, enganchalo; si no, lo hace B3 o el orquestador al integrar.

## Criterios
- Con gatillo: se forman en ~1,5 s, quedan oscuras ~1 s y se iluminan. Al subir, se cierran en reversa. Medí los tiempos.
- `?grietas=1|2|3`: las tres variantes.
- El acento en las páginas y neutro en el home.
- El costo por cuadro, dentro del presupuesto (banco antes y después).
- Con movimiento reducido, de una sin animación. En el teléfono, la versión compacta.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).

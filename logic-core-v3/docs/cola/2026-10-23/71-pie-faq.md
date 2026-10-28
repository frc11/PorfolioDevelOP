# 71 · El pie y el FAQ

Modelo: **opus**. Va después de la 70 (mismo cierre). Usa `AvisoDeScroll` de la 20. Capturas: `lote2/11`, `12`, `13`, `19`.

**El form del pie queda como está** (su envío no cambia: decisión de Valentino). Lo que cambia es cómo se hunde y sale.

## 1. El hundimiento (ítem 22)
- **El bloque de la izquierda** («Lo que sigue lo armamos con vos», el mail, el WhatsApp, El recorrido, las redes) **se guarda igual que el contacto:** se abre el piso y se hunde. Hoy no lo hace. Si le falta una base para hundirse bien, hacésela.
- **La secuencia correcta, para los dos bloques:**
  1. se abre el agujero en el piso;
  2. **el bloque se hunde tal como es** (el form y las letras, sin cambiar de aspecto);
  3. el piso **se cierra**;
  4. el piso **se vuelve a abrir** y sale, limpio, lo que sigue (el FAQ).
- **La "piel" rara de los inputs** del form cuando se cierran (`lote2/11`): no tiene que aparecer. El form se hunde con su aspecto.

## 2. El FAQ en 3D (`lote2/12`)
- Hoy los dos bloques («Preguntas frecuentes» y «Tocá una pregunta y mirá lo que pasa.») son **planos (2D)**. Tienen que ser **bloques 3D apoyados en el piso**, con **la misma estructura del bloque del form del pie** (el volumen, el canto, el material), pero no son forms.
  - **El de la derecha** (donde aparecen las respuestas): **del tamaño del form del pie**, y que **entren respuestas largas**.
  - **El de la izquierda** (las preguntas): **del ancho del form, pero más alto** (no cuadrado).
- Todo lo demás (el gatillo, las preguntas, cómo suben y bajan) queda como está.

## 3. El botón para llegar al FAQ
- **Después de que todo el pie terminó de acomodarse**, sale abajo **un botón** con **el mismo efecto de apertura del piso**, al estilo del botón «Escribinos por WhatsApp»: **«Scrolleá una vez más para ver las preguntas frecuentes»** (con la presentación de `AvisoDeScroll`, en clickeable).
- **Tocarlo hace lo mismo que el gesto de scroll** (dispara el gatillo hacia el FAQ). Al pasar al FAQ, **el botón se hunde con lo demás**.
- **Tiene que ser llamativo**, para que se sepa que hay un FAQ, y **aparecer después de todo**.
- **Una vez por carga de página:** si volvés al pie después de haber ido al FAQ, ya no aparece. Si recargás o entrás de nuevo, vuelve a aparecer (estado en memoria, no en almacenamiento).

## 4. La pasada técnica del pie y el FAQ
Aprovechá que podés verificar: revisá que **las texturas y los materiales se vean reales**, que **ningún elemento atraviese a otro** (los bloques con el piso, con el agujero, con el logo), las sombras y el orden de dibujo. Mejorá la estética donde haga falta, sin cambiar el diseño.

## 5. El bug del pie (ítem 25, `lote2/19`)
Al volver al pie (en esa captura, después de las grietas del CTA), **el form del contacto desapareció**: quedan solo «NOMBRE», «MAIL», «MENSAJE» y «Enviar» sueltos, sin el bloque oscuro ni los inputs. **Reproducilo** (probá: ir al FAQ y volver; abrir el login y cerrarlo; ir y volver con el gatillo del CTA; recargar en el medio), encontrá la causa y arreglala. Dejá la prueba que lo reproduce.

## 6. Teléfono y tablet
- **El FAQ va después del pie**, como ahora, pero **sin fondo liso**: **desplegable** (acordeón: tocás la pregunta y se abre la respuesta), **semitransparente, con un efecto de vidrio líquido** (desenfoque del fondo, un borde con brillo sutil y un reflejo). Algo moderno.

## Criterios
- `faq-del-pie` en verde, ampliado: la secuencia abrir → hundir → cerrar → abrir → salir, con los dos bloques; el control `sin-hundimiento` en rojo.
- El botón del FAQ: aparece una sola vez por carga; tocarlo equivale a un gesto.
- La prueba del bug del pie (en rojo antes, en verde después).
- Fotos a 1440 del FAQ 3D con una respuesta larga, y del hundimiento a mitad de camino.
- 390 y 768: el acordeón de vidrio.

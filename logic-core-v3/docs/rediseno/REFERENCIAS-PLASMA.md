# REFERENCIAS DEL PLASMA (PULIDO 17)

Para qué: el plasma de PULIDO 16 (átomos con órbitas, iones, electrones con estela, moléculas con resorte) no gustó («tiene una
forma muy definida, tampoco para tanto»). Lo que gustó fue el de PULIDO 15 (cargas sueltas + arcos) y `plasma-y-polvo`. El pedido:
«algo un poco menos nítido, menos formado; que no sean literalmente átomos, que sean partículas de energía que brillan, vibran, se
mueven». Monocromo, sin sonido, sin bloom global, detrás de los textos, con un día tan cuidado como la noche.

Sólo inspiración: no se copió código de ninguna referencia. Las de Shadertoy van con la licencia por defecto del sitio (CC BY-NC-SA
3.0): ni una línea. La de Gustavson y McEwan es MIT (compatible), pero el ruido de este sprint se escribió aparte, con la misma idea.
Cómo se leyó cada una: «leída» (la página entera), «por resumen» (el resumen del buscador; la página bloqueó la lectura directa o
pide registro).

## Las referencias

### Movimiento: el campo, no los pares

1. **Bridson, Hourihan y Nordenstam, «Curl-Noise for Procedural Fluid Flow» (SIGGRAPH 2007)** —
   <https://www.dneg.com/wp-content/uploads/2022/11/2007.pdf> (por resumen; ficha en <https://history.siggraph.org/?p=115355>).
   - Qué tomar: la velocidad como el rotor de un potencial de ruido (sin divergencia: el flujo se arremolina y nunca junta ni
     vacía de golpe) y la rampa cerca de un sólido (el flujo rodea al logo en vez de atravesarlo).
   - Por qué: es la diferencia entre «partículas que vibran al azar» (P15: un vaivén senoidal por carga) y «energía que fluye».
     Deriva fluida sin formas: los remolinos aparecen y se deshacen solos.
2. **Gustavson y McEwan, «Tiling simplex flow noise» (psrdnoise, JCGT 2022, MIT)** — <https://jcgt.org/published/0011/01/02/>
   (por resumen) y el hilo de GameDev.net sobre curl noise eficiente
   (<https://gamedev.net/forums/topic/699745-efficient-curl-noise-for-particles>, por resumen).
   - Qué tomar: el ruido con su gradiente analítico: el rotor sale de tres evaluaciones con derivadas en vez de dieciocho
     diferencias finitas.
   - Por qué: en la GPU son miles de partículas por cuadro; en el teléfono, cada evaluación cuenta.
3. **Edan Kwan, «The Spirit» (2016, Google Experiments) y la colección «Particle Love» de Lusion** —
   <https://experiments.withgoogle.com/the-spirit>, <https://v2.lusion.co/work/particle-love> (por resumen).
   - Qué tomar: miles de partículas en la GPU movidas por curl noise con aspecto de humo: un MEDIO vivo, no objetos.
   - Por qué: es exactamente «menos formado». También el nivel de oficio: la luz sale de la densidad, no de un dibujo.
4. **Maxime Heckel, «The magical world of Particles with React Three Fiber and Shaders»** —
   <https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/> (leída).
   - Qué tomar: la simulación en una textura (FBO) leída por el sombreador de las partículas; el tamaño atenuado con la
     distancia; la caída suave del brillo hacia el borde; `depthWrite` apagado.
   - Por qué: es nuestro mismo armado (R3F). La escena ya tiene su ping-pong (`gpu/pingPong.ts`, el del polvo con física):
     no hace falta ninguna dependencia nueva.
5. **Codrops, «Crafting a Dreamy Particle Effect with Three.js and GPGPU» (Dominik Fojcik, 2024)** —
   <https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/> (por resumen).
   - Qué tomar: partículas en la GPU que responden al mouse dentro de la simulación (no un efecto encima).
   - Por qué: el puntero como CARGA del campo (atrae, ordena, energiza) se siente en el movimiento de todas, sin dibujar nada.
6. **Codrops, «Interactive Particles with Three.js» (Bruno Imbrizi, 2019)** — <https://tympanus.net/codrops/?p=37503> (por
   resumen).
   - Qué tomar: miles de cuadrados instanciados y la influencia del puntero que DURA un poco y se apaga (su textura de toque).
   - Por qué: «que se SIENTA más de lo que se ve»: lo que el puntero tocó queda un rato más caliente; nada de anillos ni halos
     dibujados alrededor del cursor.

### Luz: cómo brilla sin bloom

7. **Partículas suaves (soft particles), Oleksandr Popov** —
   <https://keaukraine.medium.com/implementing-soft-particles-in-webgl-and-opengl-es-b968d61133b0> (por resumen).
   - Qué tomar: apagar la partícula donde se cruza con algo (sin cortes duros).
   - Por qué: acá se apagan detrás de los textos (pasan por detrás) y contra la superficie del logo (no se pegan como calcomanías).
8. **Iñigo Quílez, «Useful little functions»** — <https://iquilezles.org/articles/functions/> (por resumen).
   - Qué tomar: el impulso exponencial (sube rápido y se apaga lento) para los destellos y el pulso cúbico para un brillo local.
   - Por qué: el titileo con ritmo propio y el «se enciende más un instante» sin escalones.
9. **Profundidad de campo por tamaño (círculo de confusión)** — la tesis de Kollmann (TU Wien, 2015)
   <https://www.cg.tuwien.ac.at/research/publications/2015/Kollmann-2015-DoF/Kollmann-2015-DoF-thesis.pdf> (por resumen).
   - Qué tomar: lo desenfocado es más grande y más tenue en la misma energía (el área crece, el brillo por píxel baja).
   - Por qué: profundidad barata y «menos nítido» de verdad: las de adelante y las de atrás se vuelven luz difusa, las del
     plano del logo quedan finas.
10. **Estelas por velocidad: el «stretched billboard» de Unity** —
    <https://docs.unity3d.com/2017.3/Documentation/Manual/class-ParticleRenderer.html> (por resumen).
    - Qué tomar: estirar el cuadrado de la partícula en la dirección de su velocidad en pantalla (largo por rapidez).
    - Por qué: el movimiento se dibuja solo (chispas, corrientes) sin trazar líneas: la estela es desenfoque de movimiento.

### Los arcos: canal luminoso, no un dibujo

11. **Kim y Lin, «Physically Based Animation and Rendering of Lightning» (Pacific Graphics 2004)** y «Fast Animation of
    Lightning Using an Adaptive Mesh» (2007) — <https://gamma.cs.unc.edu/LIGHTNING/>, <https://gamma.cs.unc.edu/FAST_LIGHTNING/>
    (por resumen).
    - Qué tomar: el modelo de ruptura dieléctrica (el canal crece hacia donde el potencial lo empuja) y el resplandor como un
      núcleo convolucionado (luz que se abre alrededor del canal).
    - Por qué: un camino que tiene razón física y un brillo que no es un trazo.
12. **«Rendering Lo-fi Lightning» (Game Developer)** — <https://www.gamedeveloper.com/programming/rendering-lo-fi-lightning> (leída).
    - Qué tomar: elegir el blanco de antemano y crecer al azar con un peso hacia él (barato, sin resolver Laplace); dos capas, un
      borde ancho y un núcleo casi blanco.
    - Por qué: el costo de un arco en la CPU tiene que ser chico; las dos capas son la base del canal con núcleo.
13. **Unreal, efectos de haz en Niagara** —
    <https://dev.epicgames.com/documentation/en-us/unreal-engine/how-to-create-a-beam-effect-in-niagara-for-unreal-engine> (por
    resumen).
    - Qué tomar: el parpadeo de un rayo por re-emisión corta (vidas de ~0,2 s) y el ancho que cambia a lo largo del haz.
    - Por qué: los re-golpes por el mismo canal y el canal más fino en las puntas.
14. **La bola de plasma (física)** — <https://en.wikipedia.org/wiki/Plasma_globe> (leída por resumen) y el «Plasma Globe» de
    nimitz en Shadertoy (<https://www.shadertoy.com/view/XsjXRm>; el buscador no lo indexa: a confirmar en un navegador; sin
    código, CC BY-NC-SA).
    - Qué tomar: los filamentos nacen en el electrodo y buscan el vidrio; al tocar el vidrio, un filamento salta al dedo. Los
      filamentos se ven como luz volumétrica que tiembla, no como líneas.
    - Por qué: es la metáfora exacta de lo que ya tenemos: el logo es el electrodo (la fuente de los arcos) y el puntero, el dedo.

### Sitios premiados (cómo se integra en una página)

15. **Igloo Inc (Awwwards, sitio del año 2024)** — <https://www.awwwards.com/igloo-inc-case-study.html>, hilo de three.js
    <https://discourse.threejs.org/t/landing-site-igloo-inc/67249> (por resumen).
    - Qué tomar: partículas que son parte del relato del scroll (las del pie), con una paleta contenida.
    - Por qué: el plasma convive con el encastre del pie: tiene que acompañar, no competir.
16. **Unseen Studio, BlueYard** — <https://unseen.co/projects/blue-yard/> (por resumen).
    - Qué tomar: una nebulosa de ~30.000 partículas que reacciona a la interacción y se mantiene calma.
    - Por qué: densidad sin ruido visual: la mayoría tenue, la luz donde pasa algo.
17. **Dracarys (Awwwards, sitio del día, julio de 2024)** — <https://www.awwwards.com/sites/dracarys> (por resumen).
    - Qué tomar: energía elemental (fuego, escarcha) en WebGL leída como luz con pocos colores.
    - Por qué: «flashero pero con límite»: vivo sin saturar.

### El día: energía sobre papel

18. **Mezclas sobre fondo claro** (Defold, Khronos, three.js: <https://forum.defold.com/t/how-to-make-the-particles-more-visible-when-i-have-a-clear-white-background-solved/1718/2>,
    <https://community.khronos.org/t/particle-system-blending/27683>, por resumen).
    - Qué tomar: la suma no puede oscurecer: sobre el papel la luz desaparece. De día hace falta tapar (alfa premultiplicado)
      con algo oscuro y translúcido.
    - Por qué: el defecto de PULIDO 15 de día («lunares»): puntos de tinta con borde, todos iguales. La salida que se propone:
      ENERGÍA OSCURA, un velo gaussiano de grafito muy translúcido, sin borde, de tamaños y opacidades variables, con un brillo
      claro mínimo (un punto blanco de un píxel) sólo en las calientes: sobre el papel se lee como un destello dentro de una
      sombra suave; sobre el logo negro, como luz.

## Lo que no se toma (rechazado o fuera del criterio)

- Bloom global (rechazado antes): cada brillo es su propio halo gaussiano.
- Color y sonido (descartados por el humano).
- Órbitas, anillos, moléculas, enlaces dibujados, bordes duros: todo lo que se lee como una figura.
- Halos o anillos dibujados alrededor del cursor: el puntero se nota en cómo se mueven y se encienden las partículas.

## Tres direcciones

Las tres comparten lo que no es la partícula: los arcos (canal suave con núcleo, re-golpes y resplandor; el logo es la fuente;
pocos), la temperatura (el scroll, el pulso del logo, el golpe del pie, el clic y la descarga la suben; baja sola y se autolimita),
el gesto (el puntero como carga; clic, pulso; mantener y soltar, descarga), los textos (pasan por detrás), el tono de la escena
(ACES compensado), el movimiento reducido (quieto) y el pie (se apaga cerca del encastre). De día, ENERGÍA OSCURA; de noche, luz.

### A · Chispas — las cargas de PULIDO 15, hechas luz

- QUÉ ES: las cargas que gustaron (positivas y negativas que se atraen y se repelen suave, agrupamientos que se forman y se deshacen,
  arcos entre las que se acercan, el logo que suelta arcos, el puntero como una carga fuerte), pero cada una es una chispa de luz:
  un núcleo con caída gaussiana y su halo, sin anillo ni disco. La polaridad no se dibuja: se nota en el ritmo (las positivas
  laten lento y parejo; las negativas, más chicas, titilan rápido y vibran más).
- CÓMO SE VE: unas 600 chispas (300 en el teléfono) de tamaños muy distintos (muchas finísimas, pocas grandes), con profundidad de
  campo (las de adelante y las de atrás, luz difusa; las del plano del logo, finas). Cada una con su titileo y, de vez en cuando,
  un destello. Derivan por un campo de curl noise (no un vaivén senoidal); calientes, tiemblan.
- TÉCNICA: la física en la CPU como en PULIDO 15 (la grilla: lineal en la cantidad), con el curl noise; el dibujo en la GPU
  (cuadrados instanciados leídos de una textura). Los arcos salen de las mismas chispas.
- COSTO: ~0,2–0,4 ms de CPU por cuadro; en la GPU, 600 cuadrados chicos (nada).

### B · Enjambre — un medio de energía en la GPU

- QUÉ ES: miles de motas finísimas (16.384; 6.400 en el teléfono) simuladas en la GPU, llevadas por el curl noise, que rodean el
  logo (su campo de distancia: no entran, lo rozan) y se juntan alrededor de unos núcleos calientes que derivan (una veintena,
  en la CPU: atraen o repelen, y su fuerza respira, así las nubes se forman y se deshacen solas). El medio se ENCIENDE donde pasa la
  energía: las ondas del logo, los arcos, el puntero; en calma, una bruma con chispas sueltas.
- CÓMO SE VE: una nube luminosa, sin una sola forma reconocible; filamentos y remolinos que cambian; los arcos saltan entre los
  núcleos y el logo y prenden el medio a su paso.
- TÉCNICA: GPGPU (el ping-pong de la escena, posición y velocidad en dos salidas), las fuerzas por campo (curl noise, los núcleos,
  el logo, el puntero, los pulsos), sin pares. Cuadrados instanciados que leen su estado de la textura.
- COSTO: una pasada de simulación de 128 × 128 (~0,1–0,3 ms de GPU) y 16.384 cuadrados chicos (~0,1–0,2 ms).

### C · Corrientes sobre el logo — la energía corre por la fuente

- ESTA C REEMPLAZÓ A LA PRIMERA (en el banco: «corrientes», estelas sueltas en el volumen, se leían como lluvia; y de día, como
  rayones). Lo que se buscaba de ella (el movimiento que dibuja) quedó, pero pegado al logo.
- QUÉ ES: la simulación de B con la energía pegada a la SUPERFICIE del logo (su campo de distancia, el del polvo con física: un
  resorte a una banda de 0,18 u y el campo de costado): corre por los bordes y por las caras, y cuando se calienta (el puntero, una
  onda, un arco) se suelta y se va al aire. 3.136 (1.600 en el teléfono), dibujadas como estelas cortas.
- CÓMO SE VE: de noche, el contorno del logo electrificado (sin una línea: chispas que corren por el borde); de día, un aura oscura
  apenas en el borde del logo, sin ensuciar el papel.
- TÉCNICA: la de B, con la superficie (nacen en ella: un punto de la caja del campo llevado a la banda) y el cuadrado estirado por la
  velocidad en pantalla.
- COSTO: medido, 0,11 ms de GPU por paso a 1440 (y lo que suma por cuadro, ~0,5 ms).

La que se recomiende queda como default de `?energia=plasma`; las otras, atrás de `?plasma=a|b|c`. El polvo sigue siendo el
default del sitio. Lo que pasó en el banco (qué se criticó y qué se cambió), en `SPRINT-PULIDO-17.md`; el modelo final, en `PLASMA.md`.

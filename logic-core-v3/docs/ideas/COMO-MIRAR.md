# Cómo mirar el laboratorio (para Valentino, a la mañana)

L7e · lane C · rama `l7/lab`. **Unos 20 minutos.** Doce prototipos, cada uno sacado de algo que el home ya hace. Ninguno toca el sitio:
viven en `/v3/laboratorio/…` y nada de afuera los importa. Lo que elijas se cablea en las páginas reales en otro lote.

## Antes de empezar (1 min)
- Levantá el dev de esta rama (`npm run dev` en `C:\nocturno\cola3c\logic-core-v3`) y abrí **`/v3/laboratorio?preloader=no`** (sin el
  `?preloader=no`, el preloader sale una vez por día).
- Cada prototipo tiene **abajo a la derecha una leyenda** con qué mirar y de dónde sale; la flechita la pliega. En el teléfono arranca
  plegada.
- Para el teléfono: DevTools con el ancho en 390 (o el celular en la misma red). Los que más cambian en el teléfono están marcados 📱.
- Scrolleá despacio y **volvé a subir** en cada uno: todo lo que se arma al bajar se desarma al subir, como en el home.
- Las capturas de cada uno a 1440 y 390 están en `C:\nocturno\cola3-fotos\L7\laboratorio\`.

## El recorrido, en el orden en que los creo

1. **`/v3/laboratorio/no-encaja` · la 404 (1 min).** El logo cae a su hueco, choca, se le prende el borde rojo y queda torcido afuera;
   debajo, «Esta página no existe, pero tu proyecto sí puede.». Tocá el logo: vuelve a caer. Con el sonido prendido, suena el error de
   los formularios. **Decisión:** ¿la 404 es esto? (La real va con la escena atrás; acá está sobre papel.)

2. **`/v3/laboratorio/dos-tomas` · Nosotros, el equipo (2 min) 📱.** El párrafo largo de cada uno con su foto de dos tomas del home. En la
   compu, el hover de siempre. **En el teléfono, la foto se abre sola cuando cruza la mitad de la pantalla** y se cierra al volver: es lo
   nuevo, porque el teléfono no tiene hover. Al final, la foto de la facultad (genérica) se abre desde una rendija con el scroll.
   **Decisiones:** ¿la apertura por scroll en el teléfono? ¿La foto que se abre, o la foto quieta? Los párrafos son de prototipo (salen
   de tu historia, sin hechos nuevos).

3. **`/v3/laboratorio/fichas-abiertas` · Portfolio, los casos (2 min).** Cada trabajo es **una franja de noche sobre el papel del día**:
   el video del sitio a la izquierda y la ficha del home a la derecha, clavados un rato, con la ficha entrando fila por fila y una raya
   del color de la marca del cliente. **Decisión:** ¿la noche por caso (en el sitio la noche es donde se muestra el trabajo) o los casos
   en papel? Los `[TESTIMONIO]` y `[TEXTO]` son los huecos de siempre.

4. **`/v3/laboratorio/lo-de-siempre-tachado` · Software a medida (1,5 min) 📱.** «La planilla de stock», «El cuaderno de turnos»… se
   **tachan** con el trazo del titular de Quiénes somos y, recién después, se escribe subrayado lo que los reemplaza. Anda en todo ancho.
   **Decisión:** ¿es el momento de Software? (Sirve igual para IA con «lo que hoy hacés a mano».)

5. **`/v3/laboratorio/conversacion-en-vivo` · Integraciones con IA (1,5 min).** El chatbot de las demos del Panel (construido y sin usar
   en el home) **contestando solo** al lado del párrafo que lo promete; abajo, lo que sabe de tu negocio. **Decisión:** ¿mostrar el
   producto trabajando en la página de IA? Ojo: la demo trae el cian del panel, no el verde de IA (es el panel real).

6. **`/v3/laboratorio/historia-que-se-pinta` · Nosotros, la historia (1,5 min) 📱.** Tu historia entera, grande, **pintándose palabra por
   palabra** como el título del Panel: lo leído en tinta, lo que viene en gris. «Calidad excepcional», «Esto no es un proyecto aislado»
   y «No tenemos límites» en el otro registro. **Decisión:** ¿se lee bien a este ritmo o cansa? Si va, el pintado no se usa en otra
   parte de Nosotros.

7. **`/v3/laboratorio/como-trabajamos` · Nosotros (y Software), el proceso (1 min) 📱.** Una línea que baja con el scroll y une los
   pasos; cada paso se subraya cuando la línea lo alcanza. Los pasos salen de frases que el home ya dice («después presupuestamos, no
   antes», «la manejás vos desde tu panel»). **Decisión:** ¿estos cinco pasos? ¿El trazo o algo más quieto?

8. **`/v3/laboratorio/pantalla-que-se-dibuja` · Desarrollo web (1,5 min).** Al lado del texto de Web, el alambre de una página se dibuja
   trazo por trazo y al final **se abre adentro la pantalla real de El Garage**. **Decisión:** ¿se ve develOP o se ve wireframe de
   plantilla? Es la idea más propia de Web y la más fácil de que quede genérica.

9. **`/v3/laboratorio/carrusel-del-blog` · Blog, las destacadas (1,5 min) 📱.** El carrusel del Portfolio y Demos en el teléfono, a todo
   el ancho, con las tres notas: cambia solo cada 10 s, las líneas de abajo se llenan, mantener apretado pausa, flechas y dedo; el
   titular se levanta al entrar. Las tapas son tipográficas (las notas no tienen foto todavía). **Decisión:** ¿tapas tipográficas o
   esperamos fotos?

10. **`/v3/laboratorio/notas-irregulares` · Blog, todas las notas (1 min).** Seis tarjetas en un patrón corrido (no grilla) que caen en
    su lugar con un giro chico que se endereza. **Decisión:** ¿se lee «irregular como el panel viejo» o desordenado?

11. **`/v3/laboratorio/nota` · la nota (1,5 min).** Lectura angosta: un hilo fino arriba se dibuja mientras leés, los subtítulos se
    levantan, la frase destacada se pinta y al terminar el «2 min de lectura» se tacha y queda «Leída». **Decisión:** ¿cuáles de las
    cuatro cosas van? (Mi voto: el hilo y el tachado del final.)

12. **`/v3/laboratorio/indice-legal` · Privacidad y Términos (1 min).** El texto legal con su índice al costado: el subrayado no salta de
    un ítem al otro, **viaja**. **Decisión:** ¿alcanza con esto para las legales? (Es la página donde menos hay que lucirse.)

## Si te quedan diez minutos más (se hicieron después de cerrar el recorrido)

13. **`/v3/laboratorio/intro-de-dia` · la intro corta de Nosotros, Portfolio y Blog (2 min).** La única con la escena: una pantalla de
    la sala de día con el título en el DOM (el 3D no sabe escribir estos nombres todavía), que se levanta al llegar; después, el papel.
    Probá los tres nombres con los botones y mové el mouse. **Decisión:** ¿así es la intro de las de día hasta que haya fuentes 3D?
14. **`/v3/laboratorio/el-sistema-que-se-ordena` · Software (1,5 min) 📱.** Papeles sueltos tirados sobre la mesa que, con el scroll,
    viajan a su columna de un tablero y se enderezan. Es la segunda parte del tachado (4). **Decisión:** ¿uno, el otro o los dos?
15. **`/v3/laboratorio/pasa-solo` · IA, las automatizaciones (1 min).** Las tareas repetitivas se tildan solas al cruzar la mitad de la
    pantalla («pasa solo»); con el sonido prendido, un tic por cada una. **Decisión:** ¿el tic suma o sobra?
16. **`/v3/laboratorio/mismo-sitio-en-el-celular` · Desarrollo web (1,5 min).** La pantalla de un trabajo se angosta con el scroll hasta
    ser un teléfono y pasa al video móvil del mismo sitio; se elige el trabajo. **Decisión:** ¿esto o la pantalla que se dibuja (8)?
17. **`/v3/laboratorio/demos-en-conjunto` · Portfolio, las demos (1 min).** Las cinco tapas apoyadas en un estante; con el mouse una se
    levanta y dice su rubro. Debajo, qué son en tres pasos. **Decisión:** ¿las demos del Portfolio son esto?

## Lo que quedó en el papel y por qué
En `docs/ideas/MOMENTOS.md` están las ideas que no prototipé, a propósito:
- **Mientras dormís (IA)** y **la sala vacía (404)**: necesitan la escena y un pedido al home (una variante nueva o mover la luz); el
  laboratorio no puede tocar la escena.
- **El velo con el nombre del destino** y **el pie que recuerda dónde estuviste**: tocan el chrome; quedan como propuesta.
- **Las reseñas a la deriva**: las 10 reseñas del home son ficticias; no se puede mostrar eso en una página real.

## Para leer después (no hace falta para elegir)
- `docs/ideas/VOZ-DEL-SITIO.md`: qué hace el home, con sus tiempos y curvas, y las reglas que se infieren (sirve también para Franco).
- `docs/ideas/MOMENTOS.md`: 2–3 momentos por página, con el ranking.

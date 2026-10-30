# ESTRUCTURA DE LAS PÁGINAS (para L7)

Versión 3 · 2026-10-29 · Dueño: chat del home (DEVELOP V2). Lo que dice Valentino manda.

## Lo común a todas
- **La plantilla es `/v3/pagina-base`** (con título 1, composición 3 y legibilidad peso, fijos desde L6). Todas se arman importando sus piezas; ninguna copia código.
- **La estructura:** intro con la escena → cuerpo en papel → cierre (Seis razones → CTA → pie → FAQ propio de la página).
- **La intro, corta:** poca animación, ~1 pantalla, y pasa rápido al cuerpo (decisión de Valentino: «poca animación al principio y pasa rápido al fondo»).
- **De día** todas, salvo las de servicio. Por ahora es la misma escena en todas; más adelante puede haber variaciones del logo.
- **Lo que se reusa del home:** los títulos que se pintan, el cuerpo que aparece desde abajo, los botones y CTA del sitio, `EstadoDeEnvio`, `AvisoDeScroll`, `Reluciente` y los formularios con su estándar.
- **El texto es genérico pero real**, sin corchetes ni `[TEXTO]`, basado en lo que sabemos de develOP. Después se ajusta en el chat de cada página.
- **Las rutas**, por ahora bajo `/v3`: `/v3/nosotros`, `/v3/portfolio`, `/v3/blog`, `/v3/blog/[slug]`, `/v3/privacidad`, `/v3/terminos`, la 404 y las 3 de servicio.
- **El pie** (en el home y en todas): suma links a Privacidad y Términos.
- **La navbar:** Nosotros, Portfolio y Blog tienen que poder alcanzarse desde la barra o el pie. Se decide en L7 sin romper la barra del home.

## Nosotros (de día)
1. **La historia y el equipo.** Cómo se conocen, desde dónde vienen (Tucumán, Yerba Buena) y la foto de la facultad.
   - **El equipo NO va en 3D.** Un párrafo largo de Franco y otro de Valentino, cada uno con su foto al costado.
   - Las fotos llevan el efecto de hover del home (se ve la segunda foto).
   - **La foto de la facultad:** por ahora una foto genérica (sin decir que es FACET). Valentino la reemplaza cuando tenga la real.
2. **Cómo trabajamos:** el proceso en pasos.
3. **Nuestros valores.**
4. CTA y cierre.
- **El estilo:** títulos que se pintan y cuerpo que entra desde abajo.
- **La historia, en palabras de Valentino** (de acá sale el texto; se expande sin inventar hechos):
  > Somos 2 amigos que nos conocemos de toda la vida, fuimos al mismo colegio toda la vida y decidimos estudiar la misma carrera. Ambos ya estamos en último año con un hambre por trabajar y expandirnos al mundo laboral, nos gustaría emprender con esto siendo dueños de nuestro propio negocio y entregando un trabajo de calidad excepcional. Ambos somos muy perfeccionistas y trabajadores, no paramos hasta terminar todo. Tenemos un hambre por crecer y ganar experiencia, más allá de lo económico lo que develOP significa para nosotros es crecimiento personal y el forjamiento de una marca que guiará nuestras vidas. Esto no es un proyecto aislado, es nuestra historia y lo que nosotros queremos dejar asentado como nuestra huella. Estudiamos en la Universidad Nacional de Tucumán, en la Facultad de Ciencias Exactas (FACET), nos desenvolvemos muy bien académicamente y somos de Tucumán, de Yerba Buena. Nuestra idea es ofrecer soluciones tecnológicas a empresas que lo necesiten, no solo acá sino de forma internacional también. No tenemos límites.
- Los roles salen del home: Franco, estrategia, comercial y planificación; Valentino, ejecución técnica.

## Portfolio (de día)
1. **Todos los casos explicados en el cuerpo**, cada uno con su ficha completa ya desplegada (la misma información que la ficha del home: problema, qué hicimos, qué resolvimos, fecha, el video o la imagen, «Visitar sitio» con el color de la marca).
2. **Las demos al final, en conjunto:** qué son y cómo funcionan, no una por una.
3. **Los testimonios** (las reseñas del home) en el cuerpo, **planos, no en 3D**.
- **Sin filtros** por ahora, porque hay pocos casos. Más adelante, cada caso es una subpágina, como el blog.

## Blog (de día)
1. **Carrusel de notas destacadas a todo el ancho:** imagen, título y bajada; se toca y entra a la nota. Cambia solo y tiene flechas para pasarlo a mano.
2. **Debajo, todas las notas**, distribuidas como el panel viejo del home: tarjetas en lugares irregulares, no una grilla rígida.
- **Sin categorías** por ahora.
- **Las 6 notas iniciales** (las 3 primeras en el carrusel):
  1. «¿Necesito página web o me alcanza con Instagram?»
  2. «Qué es un chatbot con IA y cuándo le conviene a una pyme»
  3. «Cuánto cuesta una página web en Argentina y de qué depende»
  4. «5 tareas que tu negocio puede automatizar hoy»
  5. «Por qué tu página tarda en cargar y cuánto te cuesta»
  6. «Software a medida vs. planillas: cuándo dar el salto»
- **Las notas las escribe la IA**, y Valentino las va moldeando después.
- **La página de cada nota:** lectura angosta, notas relacionadas y CTA.

## Las 3 de servicio (de noche, con su acento)
- **Se parte de la página de Desarrollo web que ya armó el chat de Servicios** (rama `paginas/servicios`), que ya anda: se trae sobre la base nueva, con su variante y su contenido, **pero más expandido**.
- **Software e IA son la misma página con su color** (violeta y verde) y su contenido. Es una tarea sencilla: no hay variantes nuevas.
- Poca animación al principio y pasa rápido al cuerpo.
- **El tercer servicio se llama «Integraciones con IA»** en todos lados: la página, el `h1`, el menú, el desplegable, el recomendador y el pie. En la sección del home queda el título largo, «Integraciones con / *inteligencia artificial*». La URL actual no cambia, para no romper los links.

## Privacidad y Términos
- **Sin 3D:** una intro corta y plana, el texto legal con un índice lateral, y el pie.
- Los links van en el pie.
- **Texto genérico:** develOP como nombre comercial, Franco y Valentino como responsables, `contacto@develop.com.ar` y jurisdicción Tucumán. Sin CUIT, marca registrada ni contratos, porque todavía no existen. Lleva la fecha de «última actualización» y se actualiza cuando se formalice la empresa.

## 404
- Con la escena: «Esta página no existe, pero tu proyecto sí puede.» y un botón al home.

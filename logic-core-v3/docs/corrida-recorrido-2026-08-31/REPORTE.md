# Corrida de recorrido — el camino entero, de punta a punta

**Qué es esto.** Una persona nueva recorriendo LeadOS con un lead propio, desde que entra a
la cartera hasta donde el camino se corta. No es una prueba automatizada: cada paso se
decidió leyendo lo que la pantalla decía, y lo que la pantalla no decía se anotó.

**Esta corrida no arregla ni propone arreglos.** Marca y sigue. Todo juicio estético queda
para la verificación humana.

---

## 1 · Terreno

| | |
|---|---|
| Base | `2da5de41` — `origin/fix/helpers-que-prueban` |
| Por qué esa | Es descendiente de `origin/main` **y** de las diez ramas de sprint (`callejones`, `municiones`, `vocabulario`, `datos-viajan`, `quinta-superficie`, `una-sola-fuente`, `destinos-alcanzables`, `helpers-que-prueban`) — verificado con `git merge-base --is-ancestor` una por una. Es la punta con todo. |
| Rama | `corrida/recorrido-completo` (nueva, no pusheada) |
| Worktree | `C:/tmp/wt-corrida-recorrido` — **propio y nuevo**; `node_modules` por junction |
| Build | producción, `E2E_DIST_DIR=.next-corrida`, **exit 0** |
| Puerto | `127.0.0.1:3007` — propio. Nada escuchaba en 3000-3010 al empezar; no se mató ningún proceso ajeno |
| Base de datos | Neon **dev** (`ep-quiet-waterfall-...`), declarada como dev branch en el propio `.env` ("⚠️ DEV BRANCH — DEBE apuntar a la branch dev de Neon, NUNCA a main/prod. Prod corre en Netlify"). `prisma migrate status`: **86 migraciones, schema up to date** |
| Login | `POST /api/qa/login` con `persona: setter`, **leído de la route**, no inventado. Con `NODE_ENV=production` la cookie es `__Secure-authjs.session-token` |
| Ajeno intacto | `docs/` sin trackear en el checkout principal, 2 stashes, 15 worktrees y las ramas de otros: **no se tocó nada** |

`AUTH_URL` se sobreescribió **en tiempo de build** (`http://localhost:3007`): viene horneado
del build, y sin eso las rutas protegidas rebotan al 3000.

### Estado de datos al arrancar

- **115** `osLead` en la base · **80** asignados al setter QA · 7 sin asignar
- **19** novedades sin ver, **12 de ellas** con el mismo texto (`SMOKE-SETTER ... pasó a otro setter`)
- El foco arrancaba en `QA-W Evaluada Gate Abierto`, **fijado** ("Fijado por vos — va primero")

### Estado de datos al cerrar

- **118** `osLead` (+3, todos creados por esta corrida y prefijados `CORRIDA `) · 83 del setter QA · 21 novedades

| lead creado | estado final |
|---|---|
| `CORRIDA Panaderia San Cayetano` | POSTERGADO · stage APROBADA · vuelve 15/9/2026 |
| `CORRIDA Kiosco 24hs El Puente` | PROSPECTO · stage DESCARTADA |
| `CORRIDA Bicicleteria La Rueda` | PROSPECTO · stage EVALUADA |

No se sembró ni se borró nada. Se navegaron 3 leads `M0-GAL` **pre-existentes** en modo
lectura para re-verificar hallazgos de agosto; el único intento de escritura sobre ellos fue
una validación que **falló a propósito**, y se verificó que no persistió nada.

---

## 2 · El recorrido que se hizo

Un lead propio, `CORRIDA Panaderia San Cayetano`, por el camino completo:

1. Entrar al panel · 2. Cargar el prospecto · 3. Cargar la ficha (m1) · 4. Registrar el
veredicto (m2) · 5. Mandar el opener (m4) · 6. Esperar · 7. Registrar que respondió (m5) ·
8. Decidir la demo — el brief (m6) · 9. Construir (mc1) · 10. Refinar (mc2) ·
11. **Trabarse y pedir ayuda** · 12. Publicar el borrador (m13) · 13. Chequeo final (m14) ·
14. Enviar a revisión · 15. Esperar a Franco · 16. **Rechazo de Franco** · 17. Guía de
retrabajo (mr) · 18. Rehacer y reenviar · 19. Aprobación de Franco · 20. Mandar el link
(m15) · 21. **Postergación** · 22. Agenda (m16) — **hasta donde llega**

Más, en leads aparte: **un descarte** completo, y la re-verificación de tres hallazgos de agosto.

Los pasos de Franco (rechazo y aprobación) se hicieron por la **UI real de admin**, no
tocando la base.

---

## 3 · Los baches

### B1 · Cuatro de las cinco herramientas no tienen link, y el registro exige transcribirlas

```
DÓNDE        m2 (Evaluación) · m6 (Brief) · mc1 y mc2 (Construcción) · m4 y m5 (Opener y Seguimiento)
QUÉ PASÓ     La pantalla dice: «Link pendiente — Todavía no tenés el link cargado, pedíselo
             a Franco y lo vas a poder abrir desde acá». Debajo, el REGISTRO pide, con
             asterisco de obligatorio, transcribir lo que devuelve ESA herramienta:
             en m2 «Score», «Veredicto» y «Razonamiento» («Pegá el razonamiento completo
             del Evaluador, sin resumirlo»); en m6 «Respuesta del Gem (pegado completo)»
             («Pegala entera, sin editar»).
             Censo del DOM en m2: los únicos enlaces de <main> son «Volver a tu día», el
             Instagram del lead y «Ficha». No hay ningún enlace al Evaluador.
QUÉ FALTÓ    La herramienta. Obedecer la pantalla al pie de la letra es imposible: pide
             copiar la salida de algo que no se puede abrir. La única salida que la propia
             pantalla ofrece es fuera del producto («pedíselo a Franco»).
CÓMO SALÍ    Inventando el contenido — escribí yo el score, el veredicto, el razonamiento,
             el brief y el opener. Es conocimiento de afuera en el sentido más fuerte:
             no lo saqué de otra pantalla, lo fabriqué.
GRAVEDAD     frena
CAPTURA      09-m2-veredicto.png · 22-m6-brief.png · 25-construccion-mc1.png · 15-m4-opener.png
```

**Netlify Drop es la excepción, y muestra el contraste**: en m13 el botón «Abrir Netlify
Drop» existe, apunta a `https://app.netlify.com/drop`, y arriba hay cuatro pasos numerados
de qué exportar, cómo llamar al archivo y qué pegar dónde. Ese paso se puede hacer solo.

### B2 · El último paso del camino muere con un mensaje escrito para un programador

```
DÓNDE        m16 (Agendá la reunión), con la demo ya aprobada y el link ya enviado
QUÉ PASÓ     El flujo está bien explicado en 4 pasos. Se tilda «Estoy hablando con el
             dueño», se habilita «Buscar horarios libres de Franco», se aprieta, y la
             respuesta es, literal:
                 «Setup B7.0 pendiente: cargá en la organización develOP el username de
                  Cal.com (calComUsername) y el slug del event type (calComEmbedUrl, vale
                  el slug pelado o la URL https://cal.com/usuario/slug).»
QUÉ FALTÓ    Un mensaje que un setter pueda usar. Nombra un código de sprint («B7.0») y dos
             columnas de la base («calComUsername», «calComEmbedUrl»). No dice a quién
             pedírselo — ni siquiera el «pedíselo a Franco» que sí usan las otras pantallas.
             Verificado en la base: los 8 orgs tienen calComUsername en null.
CÓMO SALÍ    No salí. El recorrido termina acá: la reunión no se puede agendar.
GRAVEDAD     frena
CAPTURA      54-m16-agenda.png · 55-m16-buscar-horarios.png
```

### B3 · Tildar tres fases seguidas guarda una; la pantalla muestra tres

```
DÓNDE        mc1 y mc2 (las 6 fases de construcción, auto-reporte)
QUÉ PASÓ     Partiendo de un estado limpio y medido en la base
             (["estructura","personalizacion","assets"]), tildé las tres fases de mc2 —
             «CTA de WhatsApp», «Calidad y motion», «Mobile» — con 400 ms entre clic y clic.
             Tres segundos después, SIN recargar:
                 la pantalla mostraba las TRES tildadas
                 la base tenía UNA sola («mobile»)
             Reproducido dos veces, con el mismo resultado. Tildándolas de a una y
             recargando entre cada una, las tres persisten.
QUÉ FALTÓ    Nada en la pantalla avisa. El tilde se dibuja y se queda dibujado; la
             divergencia sólo aparece al recargar, y entonces las fases perdidas figuran
             como pendientes.
CÓMO SALÍ    Recargando y volviendo a tildar de a una.
GRAVEDAD     confunde — es auto-reporte y la propia pantalla dice que «tildar no bloquea
             nada»; no frena el flujo. Lo que se pierde en silencio es el registro del
             propio trabajo del setter.
CAPTURA      31-mc2-tres-tildes-en-pantalla.png
```

**El chequeo final NO tiene este problema, y ese es el límite del bache.** Tildé los 10
obligatorios de m14 al mismo ritmo (400 ms) y **los 10 persistieron**. La carrera afecta al
checklist de auto-reporte (`progresoJson`), no al que gatea el envío (`selfCheckJson`).

### B4 · «Aparece en tu foco» — no aparece

```
DÓNDE        Cargar prospecto → panel
QUÉ PASÓ     La pantalla de alta promete, al pie del formulario y otra vez debajo del botón:
             «Arranca en Ficha, como cualquier otro — y aparece en tu foco para que lo
             evalúes». Cargué el prospecto y volví al panel: el foco seguía mostrando
             «QA-W Evaluada Gate Abierto» («Fijado por vos — va primero») y abajo
             «Después: QA-W Brief · +47 más en la cola». El contador subió de 49 a 50.
QUÉ FALTÓ    Que la promesa contemple el pin y la cola. Con un lead fijado y 48 en fila, el
             prospecto recién cargado no aparece en ningún lado visible del panel.
CÓMO SALÍ    Por la URL a la que el alta me había redirigido — no por el panel.
GRAVEDAD     confunde
CAPTURA      14-panel-lead-nuevo-no-esta-en-foco.png
```

### B5 · La pantalla no acompaña al dato (el hallazgo de agosto, medido de nuevo)

```
DÓNDE        m4 (registrar el opener) y m14 (enviar a revisión)
QUÉ PASÓ     m4, medido contra la base: actividades 0 → 1, se fija el próximo toque.
             Tres segundos después, sin recargar, la URL es la misma y el texto de <main>
             es IDÉNTICO carácter por carácter: «TU PASO AHORA — Mandá el opener».
             m14: la base pasa a EN_REVISION y la pantalla sigue mostrando el checklist con
             un «Guardando...» flotante.
QUÉ FALTÓ    Que el encabezado del paso siga al dato. Hay que volver a la raíz del manual
             para que la pantalla se ponga al día.
CÓMO SALÍ    Recargando / volviendo a /manual, que sí redirige al paso correcto.
GRAVEDAD     molesta
CAPTURA      66-par2-pantalla-no-acompana.png · 17-tras-opener.png · 38-tras-enviar-a-revision.png
```

**Cambió respecto de agosto**: agosto midió «0 avisos, ninguna región aria-live». Ahora
**sí hay** una región `aria-live` con contenido: «Opener registrado — próximo toque el 2/9.»
El acuse existe; lo que no se mueve es el encabezado del paso.

### B6 · «Reabrir construcción» te deja en el chequeo final, no en construcción

```
DÓNDE        mr (guía de retrabajo), después de un rechazo
QUÉ PASÓ     El botón se llama «Reabrir construcción» y el texto de al lado dice «Reabrí la
             construcción para rehacer lo que Franco marcó». Al apretarlo, la base vuelve a
             CONSTRUCCION (correcto) pero la pantalla que se abre es m14, el chequeo final.
QUÉ FALTÓ    Coherencia entre el nombre del botón y dónde aterriza. El chequeo final es el
             último paso del retrabajo, no el primero.
CÓMO SALÍ    Navegando a mano a mc1 desde la barra de pantallas completadas.
GRAVEDAD     molesta
CAPTURA      47-reloop-mc1.png · 47-reloop-m14.png
```

### B7 · El bloque de novedades ocupa el doble que todo lo demás junto

```
DÓNDE        Panel (Tu día)
QUÉ PASÓ     La captura del panel mide 2366 px de alto. De esos, el bloque de novedades
             ocupa ~1000 px (12 tarjetas), el foco ~220 px, y «Mis números» + «Tu semana»
             ~250 px. 12 de las 19 novedades son el MISMO texto, palabra por palabra:
             «Te reasignaron un lead — SMOKE-SETTER AsignaCaliente <número> pasó a otro
             setter. Ya no está en tu cartera.»
QUÉ FALTÓ    —
CÓMO SALÍ    —
GRAVEDAD     molesta
CAPTURA      01-panel-primera-vez.png · 70-panel-novedad-caducada.png
```

Agosto declaró esta observación **no re-verificable** (su limpieza había borrado el 96% de
las novedades). Con 19-21 novedades vuelve a ser medible, y se reproduce.

### B8 · Un lead postergado hasta el 15/9 tiene como paso actual «Agendá la reunión»

```
DÓNDE        Manual del lead, con status POSTERGADO y stage APROBADA
QUÉ PASÓ     Postergué el lead al 15/9. La cartera lo muestra bien: «Postergado — vuelve el
             15/9». Pero al abrir el lead, «TU PASO AHORA» dice «Agendá la reunión — Cuando
             la conversación llega a "sí, reunámonos", ofrecé horarios reales y agendá»,
             con la insignia POSTERGADO al lado.
             Contraste dentro del mismo recorrido: cuando el mismo lead esperaba respuesta
             después del opener, el manual sí decía «EN ESPERA — Le toca al negocio».
QUÉ FALTÓ    Que la postergación ponga al lead en espera también en el manual. Dice
             «agendá ahora» sobre un negocio que pidió que lo contacten en dos semanas.
             (La pantalla sí ofrece «Ir a "Registrá lo que pasó"» y menciona el 15/9.)
CÓMO SALÍ    Leyendo la insignia, no el encabezado.
GRAVEDAD     confunde
CAPTURA      69-postergado-dice-agenda.png
```

### B9 · Una novedad sigue dando una instrucción que ya no corresponde

```
DÓNDE        Panel, bloque de novedades
QUÉ PASÓ     «Franco aprobó tu demo — CORRIDA Panaderia San Cayetano: la demo está aprobada.
             Enviá el link ya, recién aprobada.» Sigue ahí 19 minutos después, con el link
             ya enviado (enviadaAt en la base) y el lead ya postergado.
QUÉ FALTÓ    El bloque se titula «Qué cambió desde tu última visita», así que es un registro
             histórico — pero el texto es imperativo («Enviá el link ya») y ya no aplica.
CÓMO SALÍ    —
GRAVEDAD     molesta
CAPTURA      70-panel-novedad-caducada.png
```

---

## 4 · Lo que se sospechó y NO resultó ser un bache

Seis sospechas que se cayeron al verificarlas. Se listan porque un informe que sólo cuenta
los aciertos no deja medir su propia puntería.

| sospecha | cómo se refutó |
|---|---|
| «El selector de la ficha no abre» | Abre. Sin `scrollIntoView` previo el clic no aterriza dentro del shell `fixed inset-0`. Artefacto del instrumento. |
| «Hay 9 campos sin nombre accesible» | Todos tienen `label[for]`. El instrumento no calculaba el nombre accesible; con el árbol ARIA del browser salen los 9 nombrados. |
| «Falta el botón Postergar» | Está. La línea del snapshot venía citada en YAML por llevar dos puntos, y el filtro la descartaba. |
| «El chequeo final no guarda nada» | Guarda los 10. La clave del JSON es `itemsDuros`, no `marcados`. |
| «El descarte no registra» | Registra. Abre un diálogo de confirmación («Descartar este lead / Registrar y descartar») que no se había completado. |
| «"Ver toda la cartera" no navega» | Correcto que no navegue: es un `aria-expanded`, despliega la cartera en la misma pantalla. |

---

## 5 · El tiempo

**Advertencia primero, porque acá es donde un número de más engaña.** Esta corrida **no
puede** producir la cifra que el brief quiere calibrar. El agente no lee, no delibera, no
mira el Instagram del negocio, no discute con el Evaluador — y no puede usar las
herramientas, porque cuatro de cinco no tienen link. Los tiempos de abajo son **latencia del
sistema**, no trabajo humano.

**Reloj de pared de la corrida entera: 52 minutos** (16:02:55 → 16:54:52 UTC), y ahí adentro
está todo el trabajo de verificar y refutar, que un setter no hace.

Latencia por acción, medida:

| paso | acción medida | ms |
|---|---|---|
| Panel | primera carga | 3.145 |
| Alta | abrir el formulario | 159 |
| Alta | cargar prospecto → redirect a m1 | 2.606 |
| m1 | tipear los 11 campos de la ficha | 5.895 |
| m2 | registrar la evaluación | ~5.000 |
| m4 | registrar el opener | 5.082 |
| m5 | registrar «Respondió» → redirect a m6 | 5.608 |
| m6 | tipear el brief | 2.140 |
| mc1 | arrancar construcción | 3.159 |
| m13 | guardar el borrador | 5.982 |
| m14 | tildar los 10 obligatorios | 8.916 |
| m14 | enviar a revisión | ~4.000 |

**Lo que sí se puede contar, y sirve para calibrar:** el camino son **15 pantallas** con
registro; **4 campos obligatorios** son transcripciones literales de herramientas que hoy no
se pueden abrir (B1); y las acciones que escriben tardan **3 a 6 segundos** cada una, con la
pantalla mostrando el texto viejo mientras tanto (B5).

---

## 6 · Contra las 47 capturas de agosto

Agosto (`docs/diagnostico-visual-2026-08/`) dejó tres cosas medidas. Se re-verificaron las tres.

### Se arregló

**1 · El error de m13 ya no es un Zod en inglés.** Agosto midió, literal:
`Invalid literal value, expected true`. Provoqué el mismo estado (URL válida + «Guardar
borrador» sin tocar el interruptor) sobre el mismo lead pre-existente. Hoy dice:

> **«Abrí el link en otra pestaña y confirmá que la demo carga — sin eso no se guarda»**

Y se verificó contra la base que sigue sin persistir nada (`draftUrl` en null).
→ `65-m13-error-confirmacion.png`

**2 · `espera` y `revision` ya no comparten encabezado.** Agosto midió que las dos rutas
decían «Le toca a Franco». Hoy, medido en la misma corrida:

| ruta | encabezado |
|---|---|
| `/manual/espera` | **«Le toca al negocio»** |
| `/manual/revision` | **«Le toca a Franco»** |
| `/manual/archivo` | «Este negocio quedó cerrado» |

→ `68-encabezado-espera-vs-revision.png` · `67-encabezado-revision.png`

**3 · El acuse de recibo existe.** Agosto midió «0 avisos, ninguna región `aria-live`» al
registrar el opener. Hoy hay una: «Opener registrado — próximo toque el 2/9.» Lo mismo con
«Copiar bloque», que hace aparecer un «Copiado».

### Sigue igual

**4 · La pantalla no acompaña al dato.** Medido de nuevo, con el mismo método (B5): la base
cambia, el encabezado del paso no. Es el mismo par que agosto llamó PAR-2 y PAR-3.

**5 · La aglomeración de novedades.** Agosto no la pudo re-verificar; hoy sí, y se reproduce:
el bloque ocupa ~1000 px de un panel de 2366 px, con 12 tarjetas de texto idéntico (B7).

### Nuevo, que agosto no vio

**6 · La carrera de los tildes de construcción** (B3). Agosto capturó estados, no secuencias
rápidas; este bache sólo aparece tildando seguido.

**7 · El mensaje de setup de Cal.com** (B2). Agosto no llegó a m16 con un lead aprobado y
enviado — sus dos fixtures de m16 eran «sin reunión» y «agendada».

---

## 7 · La secuencia: ¿se lee como una sola cosa?

Lo que sólo se ve recorriendo, no pantalla por pantalla.

**Se lee como una sola cosa, y hay tres costuras que lo sostienen.** La primera es que cada
pantalla dice **de quién es el turno** con las mismas palabras en todos lados: «Le toca al
negocio», «Le toca a Franco», «Te toca a vos» — en el manual, en la cartera y en las
novedades. La segunda es la barra de **«Completadas — podés volver cuando quieras»**, que
crece paso a paso (Ficha → Evaluación → Opener → Brief → Construir → Refinar → Borrador →
Chequeo final → Envío) y funciona como el rastro de miguitas del recorrido entero. La tercera
es que cada paso terminado deja un acuse en su lugar y un enlace al siguiente, en vez de
saltar solo.

**Dónde se rompe la costura, ordenado por cuánto duele:**

1. **La herramienta que falta parte el camino en dos mitades distintas.** Los pasos con
   herramienta (m2, m6, mc1, mc2, m4) se leen como formularios de transcripción de algo que
   no existe; el paso del borrador (m13), con su Netlify Drop andando y sus cuatro pasos
   numerados, se lee como una tarea que se puede hacer. Es el mismo producto con dos
   temperaturas. Recorriéndolo seguido, la diferencia es lo primero que se nota.

2. **El final no cierra.** Después de veinte pasos que empujan bien, el último devuelve el
   nombre de dos columnas de la base. La curva de cuidado del copy cae de golpe justo en el
   paso que corona todo el trabajo.

3. **Cada acción de escritura tiene un hueco de tres a seis segundos** donde la pantalla
   sigue diciendo lo anterior (B5). De a una no molesta; quince veces seguidas enseña a
   desconfiar del acuse — que es justo lo que el acuse vino a arreglar.

4. **El panel y el manual cuentan historias distintas del mismo lead.** El panel es una cola
   ordenada por urgencia con un pin arriba; el manual es un camino lineal. Un lead recién
   cargado no aparece en el primero (B4), y un lead postergado dice «agendá» en el segundo
   (B8). Las dos vistas son coherentes cada una por dentro, y discrepan entre sí.

**Y el rechazo, que es donde más se podía romper, no se rompe.** Franco rechaza → llega una
novedad con el nombre del negocio → «Abrir» cae directo en la guía de retrabajo con el
Qué / Dónde / Arreglo de Franco → «Reabrir construcción» conserva los 6 tildes y el pedido, y
resetea el chequeo final. El pedido de Franco se verificó presente en **las cuatro** pantallas
del retrabajo (mc1, mc2, m13, m14), que es exactamente lo que la pantalla promete cuando dice
«el pedido te sigue en cada pantalla».

---

## 8 · Lo que queda para la verificación humana

- **Todo el juicio estético.** Esta corrida produjo 79 PNG a 1440 px de ancho; no opina sobre
  si se ven bien.
- **Si un setter de verdad se traba en los mismos lugares.** Esto es lo más cerca que se
  llega sin una persona: el agente obedeció la pantalla al pie de la letra, pero no se
  frustra, no se saltea pasos y no improvisa atajos.
- **El número de 20-30 minutos del brief.** No se puede derivar de acá (ver §5).

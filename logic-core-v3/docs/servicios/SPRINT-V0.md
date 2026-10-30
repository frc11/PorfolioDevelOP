# V0 — La variante de Páginas web, preparada SIN MONTAR

2026-10-19 · Autor: CC, en la corrida desatendida «R1, precio b y V0» (tarea 3) · Viene de: el prompt de la corrida (lo que decidió Valentino), `docs/rediseno/SPRINT-B12a.md` (`d51d95fc`) y la skill `pagina-home-based` (`VARIANTES.md`, `CONTRATO.md`).
Rama `paginas/servicios`, sobre `bb5491a6` (el precio b). **Commit «V0: variante de Paginas web preparada, sin montar».**

**Fase 0 y código puro, sin montar.** Ningún archivo de la página importa `escena/` (un test lo afirma). Esta tarea no prendió el dev ni el navegador. Las rutas son desde `src/app/v3/`, salvo las que empiezan con `src/` o `docs/`. `esc/` es `_lib/escena/`.

**Estado en una línea:**
- **El plan** está abajo: las firmas de B12a (§1), cómo hace hoy el home cada pieza (§2), cómo se expresa la variante (§3), los candidatos a P-H29 (§4), el costo, los riesgos y los padrones (§5), y qué falta (§6).
- **El código** son cuatro módulos puros en `_servicios/escena/` y un test: `escena.invariant`, con 45 afirmaciones, de las que 25 son controles positivos (§7).
- **Lo que cambia el plan,** leyendo el código:
  - en la escena **no hay un piso brilloso como material**: el brillo del pie es la luz de abajo que sale entre los bloques. Es blanca y la enciende solo la máquina del final del pie;
  - **las partículas del producto son las brasas del plasma**, y los rayos son sus arcos y la red. Comparten un color de noche, pero es privado de cada instancia;
  - **el preset propuesto lleva un componente adentro**, y una `page.tsx` de servidor no puede pasarle una función a un componente de cliente.
- **Siete candidatos a P-H29** (§4).

---

## 0. El plan en diez líneas

1. **La escena** es la del home: la composición compartida, de noche, con la cámara de los primeros tramos. La variante no mueve la cámara.
2. **La variante de web** mueve cuatro canales de luz: la noche, el brillo del piso, el tinte del piso y el tinte de la energía (brasas, arcos y red).
3. **El color** es el claro de web, `--color-acento-web-claro` (`src/app/theme-develop.css:356`). Va solo en la luz.
4. **En el avance 0** es la composición: noche plena, el piso al 12 % y la luz blanca.
5. **De 0 a 0,5** se enciende con una curva suave en las dos puntas; **de 0,5 a 1** queda quieta, para que se lea el título 3D.
6. **Al irse**, en 420 ms (rápida al principio y calma al final, sin pasarse) vuelve a la composición. Con movimiento reducido, todo está quieto y la salida es inmediata.
7. **En el celular,** la misma escena con la calidad compacta del home: los mismos 5.852 bloques, y el campo de la luz a media resolución.
8. **Hoy el home no expone** ni el brillo del piso fuera del pie, ni su color, ni el color de la energía, ni una señal de salida. Son los P-H29 de §4.
9. **El código ya está:** los datos, el preset y las funciones puras, con tipos iguales a la propuesta de B12a, cada uno marcado «B12a-API: reemplazar por el import».
10. **Cuando lleguen** `B12a-API.md` y el merge: se ajustan las firmas, se escribe el componente de R3F, se monta en la intro y se mide en el navegador (§6).

---

## 1. Las firmas propuestas de B12a

Están en `docs/rediseno/SPRINT-B12a.md` (`d51d95fc`, §3). Pueden cambiar en detalle cuando salga `docs/rediseno/B12a-API.md`. Además, **el home ya está escribiendo B12a**: en su sesión se vio un lint de `esc/ruta/pistaDeLaIntro.ts`, `esc/OrbitRig.tsx`, `esc/ataduraAlScroll.ts` y `s78-b12a.invariant.tsx`. Nada de eso está en esta rama.

| Firma | Dónde | Qué toma la variante |
|---|---|---|
| **El preset de ruta**: `IdDePagina`, `PresetDeLaEscena` (`id`, `pista`, `tramos`, `noche`, `acento`, `variante`), `PRESET_DEL_HOME`, `presetActual()`, `suscribirseAlPreset()` | `SPRINT-B12a.md:174-194` (el tipo, `:180-191`) | `presetDeWeb()` arma uno (§3.1) |
| `PresetDeLaPagina({ preset })`, el que monta la página | `:196-197` | Lo monta la página, al montar (§4, P-H29e) |
| **La intro de la página**: `PANTALLAS_DE_LA_INTRO = 1.5`, `ATRIBUTO_DE_LA_INTRO_DE_PAGINA`, `PropsDeLaIntro`, `IntroDeLaPagina`, `avanceDeLaIntro(bloque, scrollY, altoDelCuadro)` | `:200-215` | El avance 0 → 1 que lee la variante sale de acá; el atributo lo decide D2 (hoy, el nuestro: `Intro.tsx:32`) |
| **El preset del título**: `PresetDelTitulo` (`fuente`, `lectura`, `asiento`, `saleCayendo`), `TITULO_DE_PAGINA`, `TituloDePagina({ id, texto, avance })` | `:217-232` | No lo toca: la variante queda quieta de 0,5 a 1 para que se lea |
| **La ranura**: `PropsDeLaVariante` (`avance`, `acento`, `calidad`, `reducido`), `ComponenteDeVariante`, `PRESUPUESTO_DE_LA_VARIANTE = { cpuMsPorCuadro: 0.5 }` | `:234-247` | El componente recibe esto (§3.7) |

**Copiadas acá, iguales a la propuesta** (`_servicios/escena/firmas.ts`), porque el home no las exporta todavía: `IdDePagina`, `PropsDeLaVariante`, `ComponenteDeVariante`, `PRESUPUESTO_DE_LA_VARIANTE` y `PresetDeLaEscena`. Las cinco llevan «B12a-API: reemplazar por el import», y el test lo afirma.

**Importadas del home, solo como tipo:**
- `NivelDeCalidad` (`esc/calidad.ts:57`, un módulo sin imports);
- `ChoreoKeyframe` (`esc/choreographyTypes.ts:108`);
- `IdDeServicio` (`_secciones/_contrato/acento.ts:57`).

La intro y el título no se copiaron: la variante no los necesita para existir.

---

## 2. Cómo hace hoy el home cada pieza (solo leído)

### 2.1 La noche

- **Cada cuadro,** en `esc/OrbitRig.tsx`:
  - el arco de la luz (`sampleLightArc(progress, arc)`, `:337`);
  - encima, la noche disparada (`arc.level = nivelConLaNocheDisparada(arc.level)`, `:339`) y la respuesta de la interfaz (`:341`);
  - después, `applyLightRig` (`:553-563`);
  - el brillo de noche de las partículas (`BRILLO_DE_LA_NOCHE.uNoche.value = brilloDeLaNocheEn(arc.level)`, `:565`);
  - la emisión del logo (`:567`).
- **El arco** es la tabla `LIGHT_ARC` (`esc/lightArc.ts:263-291`). En el avance 0 es `parada(0, 1, 6500, -42)` (`:265`): de día, nivel 1, 6500 K.
- **La noche plena** es el nivel `NIVEL_DE_LA_NOCHE = 0.04` (`esc/lightArc.ts:181`). La noche empieza en `RIM_NIGHT_LEVEL = 0.34` (`esc/probeLighting.ts:225`).
- **El escalar de 0 a 1** que leen las piezas de noche es `uNoche` (`esc/particleGlow.ts:84`): un `smoothstep` entre 0,34 y 0,04 (`:95-99`), donde 1 es la noche plena. Se copia a `VIVO.uNoche` en `esc/entorno/Entorno.tsx:84`.
- **La noche disparada:**
  - `NOCHE_DISPARADA = { cantidad: 0 }` (`esc/nocheDisparada.ts:63`), donde 1 es disparada entera, y `nivelConLaNocheDisparada` (`:73-81`).
  - La escriben dos secciones del home: `trabajos/CapaDeLaGota.tsx` y `quienes-somos/QuienesSomos.tsx:250`.
  - `DIA_DEL_FINAL` (`:100`) la apaga al final del home. Mide `[data-panel]` (`esc/ataduraAlScroll.ts:139,180`).
- **En una página de servicio, ninguno de esos escritores existe.** La noche de la intro la tiene que poner el preset (`noche: 'noche'`): es el riesgo R1 de B12a (§8.1 de su plan), que se repone en el preset.

### 2.2 El piso brilloso del pie 3D: el material y el brillo

**No hay un material brilloso.** El piso es el de bloques:
- `esc/piso/PisoVivo.tsx:262`: `MeshStandardMaterial` en papel, con `roughness: 0.94` y `metalness: 0`, sin `envMap` ni reflector;
- `esc/StudioFloor.tsx:129`: el mismo mate.

**El brillo del pie es la luz de abajo, la que sale entre los bloques:**
- **El piso:** `conElFinalEnElPiso(material)` (`esc/final/enElPiso.ts:307`) se inyecta siempre en el piso (`PisoVivo.tsx:283`).
  - Las juntas suman luz gris: `return color + vec3( luz * junta * uBrilloDeLaLuz );` (`enElPiso.ts:273`).
  - Y oscurece el resto: `gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;` (`:329`).
- **El plano de la luz,** debajo del piso, se ve por los huecos:
  - `crearElPlanoDeLaLuz(radio)` (`esc/final/planoDeLaLuz.ts:29`), un `ShaderMaterial` sin tone mapping;
  - `gl_FragColor = vec4( vec3( plano * luz * uBrilloDeLaLuz ), 1.0 );` (`:59`).
- **Los dos blancos están escritos en el shader:** no hay un uniforme de color.
- **Las perillas** son `LUZ_DE_ABAJO_EN_VIVO` (`esc/final/luzDeAbajo.ts:203-212`):
  - `uEnergiaDeLaLuz`, `uExpansionDeLaLuz`, `uRelojDeLaLuz`;
  - `uBrilloDeLaLuz: { value: 1 }` (`:211`): nadie lo escribe hoy, así que es una perilla libre.
  - La luz aparece solo con energía y con expansión (`:337`, `:366`).
- **Quién la enciende:** la máquina del final del pie, `esc/final/cuadroDelFinal.ts`.
  - Escribe la energía y la expansión en `:385-397` y el oscuro en `:439`.
  - La máquina depende del fondo de la página (`s.fondo = document.documentElement.offsetHeight - innerHeight`, `:275`) y del asiento del logo en el piso.
  - En compacta depende además de `#cierre` (`esc/final/FinalDelPie.tsx:177,199`; `esc/final/encuadreDelPie.ts:138,179`).
- **El plano lo agrega solo `FinalDelPie`** (`FinalDelPie.tsx:90-93`), montado en `esc/ProbeStage.tsx:296`.
- **Fuera del pie no se puede usar como está:**
  - las piezas son singletons exportados, pero escribirlos desde una página es meterse en el motor;
  - una página de servicio no puede emitir `id="cierre"` ni `data-panel` (`_servicios/__tests__/pagina.invariant.tsx:210-213`).

**El piso de bloques:**
- `PISO_VIVO = { lado: 0.8, radioDeReferencia: 34, … }` (`esc/piso/bloques.ts:46-49`).
- `grillaDelPiso(radio)` (`:99-112`) arma `n = 2·⌈radio/lado⌉`, con el lado escalado al radio.
- El radio es 45 en plena (con la formación, `esc/formacion/enFormacion.ts:28`) y 34 en compacta, que no tiene formación (`esc/formacion/Formacion.tsx:47`; `PisoVivo.tsx:68`).
- **Contado con la misma fórmula: 5.852 bloques en las dos** (n = 86). Cambia solo el lado: 1,0588 en plena y 0,8 en compacta.

### 2.3 Las partículas y los rayos

- **Por defecto** (sin banderas de url) la energía es el plasma: `conPlasma = energia !== 'polvo'` (`esc/ProbeStage.tsx:171-173`).
  - El polvo y el bokeh solo existen con `?energia=polvo` o `?energia=plasma-y-polvo` (`esc/entorno.ts:155,181`).
  - **Las «partículas» del producto son las brasas del plasma, y los «rayos», sus arcos y la red.**
- **`esc/energia/PlasmaYCargas.tsx`:** los uniformes comunes salen de `uniformesComunes()` (`esc/energia/dibujo/comun.ts:119-143`).
- **El color de noche** es `uLuzNoche: v3(p.luzNoche)` (`comun.ts:137`), blanco por defecto (`paleta: { luzNoche: [1, 1, 1] }`, `:23`). Lo leen:
  - las brasas (`dibujo/particulas.ts:238`);
  - los arcos (`dibujo/arcos.ts:152`, `:246`);
  - la red, que reusa los shaders de los arcos (`dibujo/red.ts:218-219`);
  - los efectos (`dibujo/efectos.ts:73-97`);
  - el reflejo en el piso (`dibujo/reflejos.ts:91`).
- **Ese uniforme es por instancia:** lo crea `armar()` (`dibujo/armado.ts:106`) y queda en una ref de `PlasmaYCargas` (`:43`, `:57`). No se exporta.
- **Solo de noche:**
  - `u.uNoche.value = nocheDeLaEnergia(VIVO.uNoche.value, …)` (`PlasmaYCargas.tsx:91`);
  - cada pieza entra con `deNoche()` (`DE_NOCHE = { desde: 0.02, desfase: 0.6, ancho: 0.33 }`, `comun.ts:35,75-78`);
  - de día no se dibuja nada.
- **Las cantidades por calidad:**
  - brasas `[1100, 550]` (`energia/direcciones.ts:27`);
  - población `[420, 130]` (`energia/poblacion.ts:21`);
  - arcos 5 y 4 en compacta (`energia/arcos/arcos.ts:14-15`).
- El haz y el polvo tienen el blanco escrito en el shader (`esc/entorno/Haz.tsx:53,75,96`; `esc/particleGlow.ts:102`). La variante no los toca.

### 2.4 La calidad compacta del celular

- **Las calidades:** `NivelDeCalidad = 'plena' | 'compacta'` (`esc/calidad.ts:57`) y `calidadPorAncho` (`:69-71`).
- **El umbral:** `CONSULTA_ESCENARIO = (min-width: 1024px)` (`_lib/compuerta.ts:135-145`).
- **Quién la elige:** `_componentes/EscenarioCompuerta.tsx:88-89`, que rehace la escena al cruzar el umbral (`:97`). La compuerta se monta en todo `/v3` (`layout.tsx:314`), así que también en `/v3/[servicio]`.
- **La tabla** (`esc/ajustes.ts:161-174`) cambia un solo campo: `dpr` `[1, 1.5]` en plena y `[1, 1]` en compacta, −55,6 % de píxeles.
- **Además, en compacta:**
  - no hay formación, cielo de día ni moiré hasta el piso (`ProbeStage.tsx:233,253`);
  - el piso tiene radio 34, con los mismos bloques;
  - el plasma va compacto (§2.3);
  - la sombra del logo va a media resolución (`esc/LuzDelLogo.tsx:59`);
  - el pie va «angosto»: máscara a media resolución (`FinalDelPie.tsx:77,83`), sin la órbita del mouse;
  - el techo adaptativo del `dpr` es 1 (`esc/gpu/adaptativa.ts:20-30`).
- **Ese es el mecanismo que usa la variante.** La escena es la misma y la variante pinta su campo de luz a la mitad, como el pie angosto (§3.6).

### 2.5 La composición compartida del avance 0

- **No existe todavía en esta rama:** no hay `composicionInicial`, `pistaDeLaIntro` ni `esc/ruta/`. Es B12a.2 (`SPRINT-B12a.md:391`, `:433`).
- **Lo que existe es el avance 0 del home:**
  - la pose del hero, `{ angleDeg: 0, height: 6.4, distance: 19, frameX: 0.5, frameY: 0 }` (`esc/choreography.ts:249-251`);
  - la cámara en `(0, 6.4, 19)` mirando a `(0, 0, 0)` (`OrbitRig.tsx:494-500`), con `CAMERA_FOV = 35` (`esc/probeScene.ts:196`) ajustado por ancho (`esc/banda.ts:36`);
  - de día: nivel 1 hasta `ATARDECER.desde` (0,4375).
- **Los primeros tramos:** hero de 0 a 0,125 y quiénes somos de 0,125 a 0,375 (`esc/choreography.ts:189-196`). `progresoDeLaCamara` es la identidad hasta 0,125 (`esc/camaraDeEntonces.ts:34,42`).
- **El sitio vivo usa esa pose:** `SCENE_ENTRY_POSE` (`src/lib/scene-framing.ts:144`). La pista de las páginas tiene que ser otra, como dice B12a (§1.3 de su plan).
- **La composición de las páginas** es la cámara del hero, de noche y con el piso apenas encendido. La cámara y la noche las pone el home (B12a.2). El nivel de luz del piso, hoy, lo definimos acá (`COMPOSICION_COMPARTIDA`), con la nota B12a-API (§4, P-H29f).

### 2.6 El celeste de web de la sección Servicios

- **El token:** `--color-acento-web-claro` (`src/app/theme-develop.css:356`), 10:1 sobre la noche. **Es el que toma la variante.**
- **La regla del servicio:** `[data-servicio="web"]` pone `--color-acento-claro: var(--color-acento-web-claro)` (`theme-develop.css:1366-1369`). Es la regla con la que la sección Servicios marca su bloque de web (`_secciones/servicios/Servicios.tsx:120`, `data-servicio={servicio.id}`).
- **Lo que pinta la sección es otro:** usa el alias oscuro, `--color-acento`, que ahí vale `--color-acento-web` (`theme-develop.css:326`, el de las superficies en papel). Lo hace en el DOM: `RotuloDeServicio.tsx:160-161`, `GraficoDeTorta.tsx:146`, `CtaDelServicio.tsx:21` y `CtaQueRota.tsx:275`.
- **En el 3D no hay ningún acento todavía:** ningún `THREE.Color` en `esc/`.
- **Para la luz va el claro,** como dice el CONTRATO («Claros: sobre la escena, la intro, la luz y las variantes»). La función que da el token por el id es nuestra: `tokenDelAcentoClaro('web')` (`_servicios/estiloDelAcento.ts:29`).

---

## 3. Cómo se expresa la variante con las firmas propuestas

### 3.1 El preset (`escena/presetDeWeb.ts`)

`presetDeWeb(pista, variante)` arma un `PresetDeLaEscena`:
- `id: 'web'`, `noche: 'noche'` y `acento: 'web'`;
- `tramos: { intro: '[data-intro-de-servicio]', pie: null }`: la intro es la nuestra (`Intro.tsx:32`), y el pie llega con B13.
- La **pista** (la intro compartida, B12a.2) y el **componente** (B12a.7) entran como argumentos, porque todavía no existen.

### 3.2 Los parámetros: cuatro canales de luz (`escena/estructura.ts`)

| Canal | 0 → 1 | Composición (avance 0) | Web encendida | Qué luz del home |
|---|---|---|---|---|
| `noche` | día → noche plena | 1 | 1 | `uNoche` (§2.1) |
| `brilloDelPiso` | apagada → la del pie con todo su poder | 0,12 | 1 | la luz de abajo: energía y `uBrilloDeLaLuz` (§2.2) |
| `tinteDelPiso` | blanco → el claro de web | 0 | 1 | el color de esa luz: hoy, blanco en el shader (P-H29b) |
| `tinteDeLaEnergia` | blanco → el claro de web | 0 | 1 | `uLuzNoche` de las brasas, los arcos y la red (P-H29c) |

**Ningún canal es una superficie:** los bloques, el logo, el domo y la sala no cambian de color. El test afirma que los cuatro canales son de luz y que ningún nombre es de color de superficie, con dos controles.

### 3.3 La curva, en el avance 0 → 1

- **De 0 a 0,5:** `t = smoothstep(avance / 0,5)`, y cada canal es `composición·(1 − t) + encendida·t`. Es suave en las dos puntas, sin salto al arrancar ni al llegar.
- **De 0,5 a 1:** quieta, exactamente la encendida.

| Avance | 0 | 0,1 | 0,25 | 0,4 | 0,5 a 1 |
|---|---|---|---|---|---|
| `t` | 0 | 0,104 | 0,5 | 0,896 | 1 |
| `brilloDelPiso` | 0,12 | 0,21 | 0,56 | 0,91 | 1 |
| `tinteDelPiso` y `tinteDeLaEnergia` | 0 | 0,10 | 0,5 | 0,90 | 1 |

### 3.4 La salida

- **Al irse de la página,** cada canal va de donde estaba a la composición en **420 ms**, con `1 − (1 − t)³`.
  - Arranca rápido: a 105 ms hizo el 58 %, a 210 ms el 88 % y a 315 ms el 98 %.
  - Llega calma, sin pasarse.
- Termina antes de que pase el velo, la banda de la gota de 760 ms (`_secciones/trabajos/gota.ts:54`), como pide el CONTRATO: primero la escena vuelve a la composición y después pasa el velo.
- **Con movimiento reducido** la salida es inmediata.
- **La ranura propuesta no le avisa a la variante que se va:** la desmonta (P-H29d).

### 3.5 Movimiento reducido

Con movimiento reducido es el estado final, quieto, en cualquier avance (VARIANTES.md, «con movimiento reducido, el estado final quieto»), y la salida es inmediata.

### 3.6 El celular

- **La escena es la misma** en las dos calidades: los mismos canales en los 101 avances, con y sin reducido. El test lo afirma.
- **La cantidad de bloques es la del home** en las dos (5.852, §2.2). Ni el ajuste ni los canales tocan el piso.
- **La única perilla de costo** es `resolucionDelCampo`: 1 en plena y 0,5 en compacta. Es el campo de la luz de abajo (la máscara del hueco y su distancia), el mismo mecanismo que el pie angosto (`FinalDelPie.tsx:77,83`). Cuesta un cuarto en texeles.
- **Encima van las reducciones que ya hace el home:** el `dpr` 1 y las brasas y los arcos compactos.

### 3.7 Cómo la usaría el componente (cuando se monte; no se escribió)

En un `useFrame` de R3F:
1. lee `avance.current`;
2. pide `escenaDeWeb(avance, calidad, reducido)`;
3. escribe las perillas de luz que exponga el home (§4): el brillo del piso, y el tinte (el blanco mezclado con `acento`, el `THREE.Color` que da la ranura).

- **Sin estado de React por cuadro:** son 4 números, una mezcla de colores y dos escrituras de uniformes.
- **Al salir,** corre `parametrosDeLaSalida` hasta la composición y recién ahí se desmonta (P-H29d).
- **Al desmontarse,** devuelve las perillas a la composición y libera lo que haya creado (`dispose`).

---

## 4. Lo que la variante necesita y la ranura propuesta NO expone: candidatos a P-H29

| # | Qué necesita | Por qué |
|---|---|---|
| **P-H29a** | **El brillo del piso en la intro, fuera del pie:** una perilla de la ranura para la energía de la luz de abajo y para su plano | Hoy la luz de abajo solo la enciende la máquina del final (`cuadroDelFinal.ts:385-397`). Esa máquina depende del fondo de la página (`:275`), del asiento del logo y, en compacta, de `#cierre` (`FinalDelPie.tsx:177,199`), que una página de servicio no puede emitir (`pagina.invariant.tsx:210-213`). El plano lo monta solo `FinalDelPie` (`:90-93`). Además, el día que el pie (B13) se monte en la página, la intro y el pie escribirían los mismos uniformes: hace falta **un dueño por tramo** |
| **P-H29b** | **El color de la luz de abajo:** un uniforme de tinte (`vec3`) exportado, que la ranura escriba | Hoy es blanco, escrito en el shader en los dos lugares (`enElPiso.ts:273`, `planoDeLaLuz.ts:59`) |
| **P-H29c** | **El color de la energía** (brasas, arcos y red) **expuesto a la ranura** | `uLuzNoche` ya existe y lo leen todas las piezas (`comun.ts:137`), pero es por instancia y privado de `PlasmaYCargas` (`:43`, `:57`). Solo el banco lo ajusta (`armado.ts:220`) |
| **P-H29d** | **Una señal de salida:** que `PropsDeLaVariante` traiga `saliendo` (una referencia que se lee en el `useFrame`), o que la ranura espere `DURACION_DE_LA_SALIDA_MS` antes de desmontar | La ranura propuesta desmonta la variante al salir de la página (`SPRINT-B12a.md:237`). Sin aviso, el brillo y el color no pueden «bajar rápido y calmos hasta la composición»: desaparecerían de golpe |
| **P-H29e** | **Cómo viaja la variante en el preset:** `PresetDeLaEscena.variante` es un componente, y `[servicio]/page.tsx` es de servidor (`params` asíncronos). Una función no se puede pasar de un componente de servidor a uno de cliente | Hay dos salidas. (1) La página monta `PresetDeLaPagina` desde un archivo de cliente propio: un `PresetDeServicio.tsx` con `'use client'`, que importa el componente. Esto cambia la afirmación de `pagina` «el único código de cliente son los cuatro de movimiento/». (2) El preset lleva un id y la ranura resuelve el componente con un import dinámico registrado. Recomiendo la (2): deja la variante fuera del chunk de la página y del lienzo hasta que haga falta |
| **P-H29f** | **La composición compartida en términos de luz:** una constante del home con la noche y el brillo base del piso del avance 0 | Las tres páginas arrancan en la misma composición, «con la noche y el piso brilloso apenas encendido». Si cada página define su brillo base, ya no es compartida. Hoy es local (`COMPOSICION_COMPARTIDA`, 0,12), con la nota B12a-API |
| **P-H29g** | **La pista de la intro compartida, importable:** que el home exporte la de `esc/ruta/pistaDeLaIntro.ts` (o que la pista acepte `'intro'`) | La firma propuesta es `pista: 'home' \| readonly ChoreoKeyframe[]` (`SPRINT-B12a.md:184`): la pista entera del home o keyframes propios. Las tres páginas usan la misma intro (la composición compartida y los primeros tramos del home); copiar keyframes sería duplicar la cámara del home |

**No son pedidos** (ya los cubre la propuesta de B12a):
- la noche de la página la pone el preset (riesgo 1 de su plan);
- la calidad llega por la ranura;
- el acento llega como `THREE.Color` leído del token.

---

## 5. El costo, los riesgos y los padrones (O-2)

### 5.1 El costo

- **La base** (B12a §2): la escena en una subruta gasta unos 600 ms/s de hilo principal en dev. El criterio de B12a.7 es **≤ 0,5 ms de CPU por cuadro** para la variante.
- **El cálculo puro de la variante:** 0,0012 ms por cuadro en Node (medido por el test, 2.000 vueltas), unas 400 veces por debajo del presupuesto.
- **Lo que costaría el componente montado,** estimado y a medir:
  - CPU: 4 números y dos escrituras de uniformes por cuadro;
  - GPU: el piso ya corre la luz de abajo en su shader, porque está inyectada siempre (`PisoVivo.tsx:283`), así que teñirla es una multiplicación por fragmento;
  - el plano de la luz es una malla más (la que ya tiene el pie);
  - el campo de la luz es una textura (en compacta, a la mitad);
  - la energía ya existe de noche.
- **No medido:** la memoria de GPU del campo de la luz fuera del pie y el costo real por cuadro. Va en el bench del montaje (§6).

### 5.2 Los riesgos

1. **Dos dueños de la luz de abajo:** la intro (la variante) y el pie (la máquina del final) escribiendo los mismos uniformes. Se resuelve con P-H29a: un dueño por tramo.
2. **Los almacenes sobreviven a la navegación cliente** (riesgo 1 de B12a): `LUZ_DE_ABAJO_EN_VIVO`, `BRILLO_DE_LA_NOCHE` y el `uLuzNoche`. La salida y el desmontaje tienen que dejarlos en la composición. El test de la salida lo afirma en puro; el montaje tiene que probarlo navegando.
3. **El tinte baja la luminancia:** el claro de web tiene alrededor de la mitad de la luminancia del blanco (0,49). Con el tinte entero, el piso y la energía se ven más apagados. Si pasa, se compensa con el brillo, no con más color, y se mide.
4. **El título 3D sobre el brillo:** la variante queda quieta de 0,5 a 1 para que se lea. Hay que medir el contraste del título contra el piso encendido, a 1440 y en compacta.
5. **El chunk:** el componente de R3F no puede entrar en la carga inicial con un valor de three (regla 4: `PAQUETES_DE_TRES`, `esc/contrato.ts:40-47`, verificada sobre el build por `esc/__tests__/s8-tres.invariant.ts`). Por eso los módulos de hoy importan de three solo tipos, y el componente irá dentro del chunk del lienzo (P-H29e, salida 2).
6. **El hex:** en `_servicios` no puede haber ningún hex, ni en comentarios (`datos.invariant.ts:258-260`). El color se lee del token.
7. **Medir en dev:** sin `next build` (O-10), las medidas son relativas.

### 5.3 Los padrones que alcanzan `_servicios/escena/`

| Padrón o barrido | ¿Alcanza `escena/`? | Qué exige | Con lo de hoy |
|---|---|---|---|
| `s3-archivos` (`DIRECTORIOS_PROPIOS`, `:126-134`) | no | — | — |
| `s8-padron` (`FRENTES`, `:63-66`) | no, salvo su `recorrer` reusado | — | — |
| **`s8-montaje`** (`s8-montaje-soporte.ts:38`, todo `src/`) | **sí** | ningún módulo fuera de su lista importa `marcaEscena` (`s8-montaje.invariant.ts:105-109`) | no lo importa: 56/2, las dos de siempre |
| **`s8-escena`** (`s8-escena-soporte.ts:39-41`, todo `src/`) | **sí** | §2: todo especificador a `_lib/escena` resuelve (los de tipo cuentan); §7: solo `EscenaDelHome` importa `marcaEscena` (`s8-escena.invariant.ts:243-247`) | los tres imports de tipo resuelven: 33/0 |
| **`s40-3d-sonido`** (`:121`, `git ls-files -co` de `src/app/v3`) | **sí** | ningún import estático de `howler` ni de `sonido/motor` (`:122-124`) | 38/0 |
| `_servicios/__tests__/datos` | **sí** | cero hex en todo `_servicios` | sin hex |
| `_servicios/__tests__/pagina` | **sí** | sin `next/link` ni router; nombres que no chocan; solo cuatro archivos de cliente | `escena/` no tiene ninguno; **el componente de R3F lo va a cambiar** (P-H29e) |
| `_servicios/__tests__/diagonales` | **sí** | sin `location.search` ni la bandera del precio | ninguno |
| `s77`, `s7-cn`, `s4-conflictos` | sí, inofensivos | `BotonPausa`, el corpus de clases, las marcas de merge | — |

**Ningún padrón nuevo recorre `escena/`**, y ningún padrón del home la registra. Cuando se monte, B12a pide que todo archivo nuevo del home vaya a sus carpetas (`SPRINT-B12a.md:355-358`); los de servicios quedan en `_servicios/escena/`, que es de servicios.

---

## 6. Qué falta cuando lleguen `B12a-API.md` y el merge de B12a

1. **El ajuste de las firmas:** borrar las cinco de `firmas.ts` e importarlas de `esc/ruta/`. Si cambiaron, ajustar `presetDeWeb` y el test. `COMPOSICION_COMPARTIDA` pasa a ser la del home (P-H29f).
2. **Los P-H29 que el home acepte:** sobre todo a, b, c y d. Sin a, b y c, la variante no tiene dónde escribir la luz.
3. **El componente de R3F:** `_servicios/escena/web.tsx`, que lee el avance en el `useFrame`, escribe las perillas, hace la salida y libera al desmontarse.
4. **El montaje en la intro:** la página declara el preset (según P-H29e), la intro pasa a 1,5 pantallas (`Intro.tsx:35`) y se va la tapa interina (`:46`).
5. **La medición en el navegador** (VARIANTES.md, «en el FRENO va»):
   - capturas en avance 0, 0,5 y 1 a 1440, 1024 y 390;
   - el costo por cuadro contra el presupuesto de 0,5 ms (bench, con la placa verificada);
   - montar y desmontar 10 veces sin que crezca `renderer.info.memory`;
   - el contraste del título 3D sobre el piso encendido;
   - la salida hasta la composición antes del velo.
6. **La calibración con Valentino:** el brillo base (0,12), el tinte entero o parcial, y la duración de la salida. Como mucho tres versiones detrás de una bandera; la bandera se va al elegir.

---

## 7. Lo hecho en esta tarea (Paso B)

### 7.1 Los archivos

| Archivo | Qué |
|---|---|
| `_servicios/escena/firmas.ts` | Las cinco firmas de la ranura y del preset, iguales a la propuesta, cada una con «B12a-API: reemplazar por el import». De three y de react solo trae tipos |
| `_servicios/escena/estructura.ts` | La estructura de las tres páginas: los canales y su destino, la composición compartida, la curva del avance, la salida, el ajuste por calidad y el costo relativo. Puro |
| `_servicios/escena/varianteDeWeb.ts` | La variante de web: el token de la luz (`tokenDelAcentoClaro('web')`), la encendida y sus funciones `parametrosDeWeb` y `escenaDeWeb`. Puro |
| `_servicios/escena/presetDeWeb.ts` | El preset de web: los tramos y `presetDeWeb(pista, variante)`. Va aparte porque es del lado de la página (lee el atributo de la intro) |
| `_servicios/__tests__/escena.invariant.ts` | 45 afirmaciones, 25 controles (§7.2). Corre a mano, como los otros |
| `docs/servicios/SPRINT-V0.md` | Este plan |

**Nada lo monta:** ningún archivo de la página importa `escena/`. Sin dev ni navegador en esta tarea.

### 7.2 Los tests (`escena.invariant.ts`), cada uno con su control positivo

| Afirmación | Control |
|---|---|
| **En el avance 0, la composición compartida, exacta;** y la composición es de noche, con el piso apenas encendido y sin teñir | una curva que arranca encendida; una composición de día; una con el piso apagado |
| **En la mitad, completa; de 0,5 a 1, quieta** (51 avances) | una que sigue subiendo hasta el final |
| En la primera mitad cada canal solo sube | una que baja y vuelve a subir |
| Suave en las puntas (menos del 1 % del camino en el primer y el último centésimo) | un encendido lineal |
| La encendida de web: noche, piso entero y el celeste en el piso y en la energía | una sin el celeste en la energía |
| **La salida vuelve a la composición**, exacta a los 420 ms, desde la encendida y desde la mitad | una que se queda a mitad de camino |
| Rápida y calma: el 80 % a la mitad del tiempo, sin pasarse ni volver | una lineal; una que rebota |
| Con reducido, la salida es inmediata | una animada con reducido |
| **El color solo en la luz:** los cuatro canales son de luz, ninguno de superficie | un canal de color de superficie; uno que apunta a una superficie |
| La variante, la composición y la curva no llevan nada más que esos canales | una encendida con un color para los bloques |
| La luz toma el claro de web del token (y `[data-servicio="web"]` lo pone en el alias claro) | el oscuro de web |
| **En la compacta, la misma escena y menos costo** (un cuarto) | una compacta que apaga el tinte; una que cuesta lo mismo |
| **Ni el ajuste ni los canales tocan el piso de bloques** | una compacta con la mitad de los bloques |
| Con reducido, el estado final quieto | una que sigue el avance |
| El preset de web: de noche, con el acento de web y la intro anclada | un preset de día |
| Las 5 firmas llevan la nota B12a-API | una firma sin la nota |
| El cálculo de un cuadro cuesta menos de un décimo del presupuesto | un cálculo de 1 ms |
| **Sin montar:** nada de `_servicios` (fuera de `escena/`) ni de `[servicio]/` importa `escena/` | un bloque que importa la variante; la página que importa el preset |
| `escena/` son cuatro módulos puros (`.ts`, sin «use client», de three y react solo tipos) | un módulo con un valor de three |

### 7.3 El gate

| Paso | Resultado |
|---|---|
| Lint de los 5 archivos nuevos de código | **0** |
| `tsc --noEmit` (4 GB) | **0 errores** |
| `escena` (nuevo) | **45/0 (25 controles)** |
| `datos` · `precios` · `slots` · `seo` | 55/0 · 22/0 · 44/0 · 56/0 |
| `pagina` · `medios` · `diagonales` | 240/0 · 26/0 · 47/0 |
| s38 · s44 · s74 · `s77` · `s25-contacto` | 57/0 · 45/0 · 34/0 · 35/0 · 35/0 |
| Los seis barridos | iguales a la base del precio (§7.4) |
| `next build` | no se corrió |

### 7.4 Los barridos que miran los imports de la escena

Los seis dan **lo mismo que en el gate del precio** (`bb5491a6`), línea por línea. Solo cambian los conteos de archivos: +5 en `src/` (los cuatro de `escena/` y el test) y +6 en el repo (con este plan).

| Barrido | Resultado | Lo que mira de la escena |
|---|---|---|
| **`s8-montaje` §3** | 56/2 (las dos de los 300 renglones, de siempre) | «ningún módulo de la aplicación importa `marcaEscena`»: `[]`, con 2495 archivos de `src/` |
| **`s8-escena` §2 y §7** | 33/0 | §2: 2495 archivos, cero especificadores rotos (los tres imports de tipo de `escena/` resuelven). §7: un solo archivo importa `marcaEscena`, y ningún valor de three directo |
| **`s40-3d-sonido`** | 38/0 | ningún import estático de `howler` ni del motor |
| `s4-paquete` · `s53-pulido-2` · `s9-sentry` | 21/0 · 54/0 · 22/0, con 2 fuera de ventana | — |

Las salidas están en `C:\paginas-servicios-datos\c2\v0\`. Antes de `tsc` y de los barridos hubo entre 6 y 6,7 GB libres, sin `next build` ni arnés del home corriendo. No hubo que esperar.

---

## 8. Decidido por CC, revisar

1. **«El piso brilloso del pie» es la luz de abajo** (las juntas y el plano debajo del piso), porque no hay otro brillo en el piso: el material es mate (§2.2).
2. **«Las partículas y los rayos» son las brasas, los arcos y la red del plasma,** la energía del producto. El polvo y el haz no se tocan: el polvo solo existe con una bandera, y el haz no es un rayo de la red.
3. **El celeste es el claro de web,** `--color-acento-web-claro`. La sección Servicios pinta con el oscuro en el papel; para la luz, el CONTRATO pide el claro.
4. **El brillo y la energía comparten un tinte cada uno, entero (1).** El de la energía es uno solo para las brasas, los arcos y la red, como el `uLuzNoche` que ya comparten.
5. **Los números para calibrar:** el brillo base de la composición (0,12), la salida (420 ms, con la cúbica) y la compacta (el campo a la mitad).
6. **La salida es inmediata con movimiento reducido.**
7. **El preset va en un archivo aparte** del de la variante: es del lado de la página, y la variante es del lado del lienzo.
8. **La pista y el componente entran como argumentos** del preset, en vez de inventar keyframes o un componente vacío.
9. **El test mide el costo del cálculo puro** contra un décimo del presupuesto: es lo único medible sin montar.

---

## 9. Qué mira Valentino

1. **Este plan**, sobre todo §2.2 (no hay un piso brilloso: es la luz de abajo del pie), §4 (los siete P-H29 para el home) y §8.
2. **La curva de §3.3 y la salida de §3.4:** si los tiempos y el brillo base son los que imaginabas, o se calibran al montar.
3. **No hay nada para ver en el navegador:** la variante no está montada.

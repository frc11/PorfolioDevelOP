# Censo de los 55 invariantes — qué los puede firmar de más (P26, solo lectura)

Insumo para el sprint siguiente. **No se arregló ninguno acá.** Cada renglón dice qué promete
el encabezado, a qué granularidad afirma, y si su aserción puede satisfacerla algo que no es
el sujeto que dice proteger.

Corrido sobre `130492e8`, con los 55 en verde. La columna «de más» es lo que haría pasar el
invariante **sin que exista lo que protege**.

## El número

| | |
|---|---|
| invariantes corridos | **55** (56 descubiertos, 1 excluido de siempre) |
| **sobre-satisfacibles** | **33** |
| anclados al sujeto | 22 |
| leen texto de archivos fuente | 6 |
| ...de esos, con al menos una aserción a granularidad de ARCHIVO | 5 |

El hallazgo de P25 —«la señal se evaluaba contra el archivo entero»— es real, pero **es la
minoría**. De los 33, sólo 5 tienen una aserción por archivo. Los otros 28 fallan por cuatro
formas que no tienen nada que ver con leer archivos, y que están más extendidas. Los conteos
suman 34 porque `enlaces-manual` cae en dos:

| forma | cuántos | cuáles |
|---|---|---|
| **Helper suelto sin call-site atado.** Se afirma que un helper devuelve el filtro correcto; nada afirma que la query real lo use. | **9** | assignment-trail, escalamiento, mask-secret, mis-numeros, novedades, progreso-isolation, reloop-selfcheck, setter-meta, timeline |
| **Fixture derivada de la constante vigilada.** El caso se construye desde la misma lista que el invariante custodia, así que mover la lista mueve el caso con ella. | **7** | cola, ficha-bloques, pantallas-construccion, recommendations, self-check-gate, turno, upsell-dedup |
| **Aguja demasiado ancha.** Un `includes` de una palabra, un vocabulario cerrado de cinco verbos, una ausencia de substring: la firma cualquier texto que caiga del lado correcto. | **5** | client-notifications, draft-url-mensaje, lead-detail, lead-scoring-gate, notifications-brevo |
| **Espejo a mano de un sujeto que nunca se lee.** Promete coincidir con `build.ts`, con el enum de Prisma o con las opciones de un select, y compara contra literales copiados; el sujeto nunca entra al proceso. | **5** | brief-input, enlaces-manual, executive-report-plan, executive-report-prefs, lead-status-rules |
| **Afirma por archivo.** El caso de P25. | **5** | acuse-recibo, aprobada-sin-link, copy-sin-jerga, copy-sin-ubicacion, enlaces-manual |
| **Tautología o round-trip de la propia fixture.** La aserción no puede fallar: el objeto se arma dentro del invariante, o el ensamblador devuelve lo que el test le pasó. | **3** | client-monthly-report, contador-dms, modules |

A eso se suman los **números a mano** (`length === 4`, `=== 6`, censos congelados), que se
atrasan solos y en verde — el mismo modo de fallar que el piso de `run-invariants` ya mostró.

La forma más común no es la que P25 encontró: es **el helper suelto**. Nueve invariantes prueban
que una función devuelve el filtro correcto y ninguno prueba que la query lo llame. Un `where`
escrito de nuevo a mano en el call-site —sin el filtro— los deja a los nueve en verde.

## Los 55

Granularidad: `archivo` = afirma sobre el texto de un archivo entero · `simbolo` = acotado a un
call-site o bloque · `valor` = ejecuta producción y compara un valor · `estructura` = recorre un
mapa, lista o grafo.

| # | invariante | archivo:línea | qué promete | granularidad | ¿de más? | qué lo firmaría de más |
|---|---|---|---|---|---|---|
| 1 | assignment-trail | `src/lib/leados/assignment-trail.invariant.ts:48` | mostrar el rastro de reasignación no cambia quién ve qué, y el evento SISTEMA queda fuera de toda lectura comercial | valor | **sí** | nada ata el evento del rastro al canal SISTEMA: registrarlo con otro canal infla los contactos y las cinco aserciones siguen verdes |
| 2 | acuse-recibo | `src/lib/leados/acuse-recibo.invariant.ts:220,228` | toda acción que escribe da las dos señales del patrón, **evaluado por call-site y no por archivo** | símbolo + **archivo** | **sí** | el envoltorio sí es por call-site, pero dos de las cuatro aserciones se evalúan contra el archivo entero: la señal 1 de todo call-site que no autoguarde (l. 228) la firma cualquier `useStepAction()` del archivo, y la señal 2 de un autoguardado (l. 220) la firma un solo `AutosaveStatus` aunque haya dos forms y uno lo haya perdido |
| 3 | alta-propia | `src/lib/leados/alta-propia.invariant.ts:45` | el alta propia deriva el dueño de la sesión y nunca de un campo del cliente | valor | no | — |
| 4 | announcements | `src/lib/announcements/announcements.invariant.ts:46` | una novedad ALL la ven todas las orgs, una ORG sólo la suya, la vencida no se muestra | valor | no | — |
| 5 | aprobada-sin-link | `src/lib/leados/aprobada-sin-link.invariant.ts:300` | una demo aprobada sin el link permanente no deriva igual que una con link, y no aparece una superficie nueva sin censar | valor + **archivo** | **sí** | la parte B (guard de descubrimiento) es por archivo: cualquier mención de `finalUrl` —incluso en un comentario o en código muerto— mantiene al archivo dentro del conjunto congelado aunque haya perdido la distinción |
| 6 | brief-input | `src/lib/ai/executive-brief-input.invariant.ts:70` | el input del brief ve el mismo delta que la card y no describe crecimiento con deltas negativos | valor | **sí** | la no-invención se afirma contra un vocabulario cerrado de cinco verbos: «aumentó», «repuntó» o «mejor que la semana pasada» pasan; y las métricas se cuentan contra un `4` escrito a mano |
| 7 | client-monthly-report | `src/lib/reports/client-monthly/monthly-report-data.invariant.ts:51` | el informe mensual ensambla honesto y la degradación pasa tal cual, sin divergir de la tab | valor | **sí** | round-trip de una fixture escrita en el propio invariante: al ensamblador le alcanza con devolver lo que el test le pasó |
| 8 | client-notifications | `src/lib/client-notifications/client-notifications.invariant.ts:48` | a quién y con qué template se avisa según plan, el cap anti-spam y el aislamiento del digest | valor | **sí** | el banner de urgencia se afirma con un `includes` de una sola palabra sobre todo el HTML: la firma cualquier aparición de esa palabra, y un banner redactado sin ella no la rompe |
| 9 | cola | `src/lib/leados/cola.invariant.ts:95` | el foco es el primer ítem de la cola, nada se pierde, la cola no se decapita | estructura | **sí** | el caso que motivó el sprint usa el tope importado de producción como expectativa: si el tope volviera a 1 —la conducta que P21 vino a matar— las tres aserciones se adaptan solas |
| 10 | contador-dms | `src/lib/leados/contador-dms.invariant.ts:48` | el contador cuenta mensajes mandados y no filas de actividad | valor | **sí** | la aserción principal está anclada, pero la sección 3 arma el objeto dentro del propio invariante: es una aserción que no puede fallar |
| 11 | copy-sin-jerga | `src/lib/leados/copy-sin-jerga.invariant.ts:338` | ninguna frase que el setter pueda leer nombra un código de sprint ni una columna de la base | **archivo** | **sí** | es una ausencia sobre un universo acotado a mano: rutas fijas (copy nueva fuera del ámbito es invisible), sólo columnas con joroba, y pisos escritos a mano que el barrido puede tocar sin ponerse en rojo |
| 12 | copy-sin-ubicacion | `src/lib/leados/copy-sin-ubicacion.invariant.ts:286` | ninguna copy del setter dice dónde está una cosa en vez de nombrarla | **archivo** | **sí** | la ubicación se detecta con una regex cerrada de 16 frases: «al pie», «en el header» o «en el panel derecho» pasan sin marcar, igual que cualquier pantalla nueva fuera del ámbito |
| 13 | cron-secret | `src/lib/cron/cron-secret.invariant.ts:52` | sin el secreto falla cerrado, y acepta sólo con el token correcto por cualquiera de los dos headers | valor | no | — |
| 14 | dates-ar | `src/lib/dates-ar.invariant.ts:60` | los rangos AR se anclan al día correcto en el borde de mes y con un evento de la noche | valor | no | — |
| 15 | dossier-stage | `src/lib/leados/dossier-stage.invariant.ts:78` | las transiciones legales son exactamente el grafo censado, y FICHA a BRIEF nunca es legal | estructura | no | lee `dossier.ts` pero **acota al bloque del `case`** a propósito — el modelo a copiar |
| 16 | draft-url-mensaje | `src/app/(protected)/setter/_actions/draft-url-mensaje.invariant.ts:63` | el error del borrador llega en castellano y colgado del control que falla | valor | **sí** | el único filtro de idioma es que el mensaje no empiece con `Invalid`: cualquier default en inglés que no arranque así pasa, con el mismo path |
| 17 | enlaces-manual | `src/lib/leados/enlaces-manual.invariant.ts:305` | ningún enlace del manual rebota ni se gatea de más, y ninguna guía nombra una fase que no es pantalla | estructura + archivo | **sí** | todo itera sobre una tabla de enlaces escrita a mano: un salto real del JSX que nadie declare deja el barrido verde sin mirarlo. Las «puntas» sí son por archivo, pero con aguja tan específica que sólo la firmaría código comentado |
| 18 | escalamiento | `src/lib/leados/escalamiento.invariant.ts:36` | persistir «me trabé» nunca mueve el stage ni toca el aislamiento | valor | **sí** | afirma sobre las claves del patch, no sobre el call-site que persiste: un update que mergee el patch junto con el stage pasa igual |
| 19 | executive-report-plan | `src/lib/reports/executive-weekly/report-eligible-plan.invariant.ts:17` | el helper coincide **exactamente** con el gate real de `build.ts` | valor | **sí** | compara contra tres literales a mano y **nunca importa ni lee `build.ts`**: si el sujeto que promete espejar cambia, esto sigue verde |
| 20 | executive-report-prefs | `src/app/(protected)/dashboard/_actions/executive-report-prefs.invariant.ts:19` | el schema acepta exactamente tres frecuencias por tres cantidades | valor | **sí** | el set válido y la lista de rechazos están a mano: un schema que además aceptara 6, 8 o 3.5 pasa, y las opciones reales del select nunca se leen |
| 21 | ficha-bloques | `src/lib/leados/ficha-bloques.invariant.ts:131` | el mapa de bloques no se despega del gate de señal mínima | valor | **sí** | fixtures y número esperado salen de la misma lista vigilada: vaciarla deja el piso en cero contra cero y el bucle sin iterar |
| 22 | flow | `src/lib/leados/flow.invariant.ts:61` | un postergado vencido vuelve a ser accionable y uno futuro sigue pausado | valor | no | — |
| 23 | foco | `src/lib/leados/foco.invariant.ts:80` | sin sticky el foco es la cima de la cola; el sticky sostiene; uno inválido se ignora | valor | no | — |
| 24 | gate-envio-demo | `src/lib/leados/gate-envio-demo.invariant.ts:87` | el gate es exactamente aprobada por el link permanente por el brief abierto, cada factor necesario | valor | no | — |
| 25 | gbp-connection | `src/lib/integrations/gbp-connection.invariant.ts:99` | cardinalidad de locations y aislamiento de escritura por org | valor | no | — |
| 26 | home-metrics | `src/lib/dashboard/home-metrics-logic.invariant.ts:47` | el período delega en los helpers AR y los agregados son honestos, con empty states sin ceros inventados | valor | no | — |
| 27 | lead-detail | `src/modules/chatbot/lead-detail-presentation.invariant.ts:43` | las señales se traducen a lenguaje de dueño, nunca el nombre de campo crudo | valor | **sí** | sólo prohíbe cuatro fragmentos en inglés sobre las seis frases: seis strings en castellano cualesquiera —o placeholders— las firman; y el largo esperado es un número a mano |
| 28 | lead-scoring-gate | `src/lib/plan/lead-scoring-gate.invariant.ts:151` | el gate de plan gatea la clasificación y el CSV omite sólo esa columna | valor | **sí** | es una ausencia de substring sobre el header del CSV: la firma cualquier header que no lleve ese rótulo exacto, incluido uno truncado por un fallo del builder |
| 29 | lead-status-rules | `src/modules/chatbot/lead-status-rules.invariant.ts:62` | el sellado del primer contacto es único y el gate de pertenencia vale | valor | **sí** | el ciclo de punta a punta corre sobre una re-implementación **local** del cómputo del action: si el action dejara de usar el helper y pisara el sellado, esto sigue verde |
| 30 | manual | `src/lib/leados/manual.invariant.ts:67` | un lead terminal por status aterriza en archivo antes de derivar por stage | valor | no | — |
| 31 | mask-secret | `src/lib/mask-secret.invariant.ts:11` | el helper consolidado preserva el output de las dos copias que reemplazó | valor | **sí** | sólo ejercita el helper nuevo: nada afirma que los dos call-sites que dice haber consolidado lo importen |
| 32 | mis-numeros | `src/lib/leados/mis-numeros.invariant.ts:73` | el setter ve sólo sus números, con candado de query y de cálculo | valor | **sí** | el candado de query se afirma sobre el helper en aislado y nada ata la página a él; y los cuantificadores son vacuamente verdaderos con lista vacía |
| 33 | modules | `src/lib/modules/modules.invariant.ts:34` | los tres estados de la vitrina, la demanda que no cuenta como tenencia, y el scope por org | valor | **sí** | el anti-IDOR lo firma la propia firma de la función, que sólo recibe el mapa de una org: es imposible que cruce tenant haga lo que haga |
| 34 | motor-resenas-view | `src/lib/modules/motor-resenas-view.invariant.ts:48` | la truth table completa de módulo por conexión, con gating y honestidad | valor | no | — |
| 35 | notifications-brevo | `src/modules/chatbot/server/notifications/notifications-brevo.invariant.ts:134` | los templates preservan el contenido y el motor de ambos envíos es Brevo | valor | **sí** | «el motor es Brevo» se firma con un string de error del camino no configurado: cualquier implementación que devuelva ese mismo error pasa sin que se ejerza un envío |
| 36 | novedades | `src/lib/leados/novedades.invariant.ts:45` | aislamiento del feed por destinatario y dirección correcta de cada aviso | valor | **sí** | el aislamiento se afirma sobre el helper suelto; y «una novedad no es un canal de actividad» la firma cualquier par de enums con nombres distintos |
| 37 | novedades-vigencia | `src/lib/leados/novedades-vigencia.invariant.ts:261` | un aviso vigente no puede contradecir a la cola | valor | no | ausencia blindada: piso de barrido, exige visitar las dos respuestas, y sabotaje por caso |
| 38 | pantallas-construccion | `src/lib/leados/pantallas-construccion.invariant.ts:134` | toda fase tiene pantalla y ninguna pantalla queda huérfana, en las dos direcciones | estructura | **sí** | los dos lados de la igualdad salen de la misma lista de fases: borrarle una —la llave del progreso persistido— mueve los dos operandos juntos |
| 39 | particion | `src/lib/leados/particion.invariant.ts:78` | fijar un lead lo ordena pero nunca lo excluye, y el pin no fabrica accionabilidad | valor | no | — |
| 40 | paso-admitido | `src/lib/leados/paso-admitido.invariant.ts:157` | ninguna combinación señala como paso de ahora una pantalla que su estado no admite | valor | no | ausencia anclada por cuatro dientes: piso de 100.000 estados, cobertura del registro, dos sabotajes y las excepciones exigidas vivas |
| 41 | pausa-dia-ar | `src/app/(protected)/setter/_actions/pausa-dia-ar.invariant.ts:108` | la pausa termina a las 23:59:59 en hora argentina salga de donde salga el reloj del proceso | valor | no | — |
| 42 | postergacion | `src/lib/leados/postergacion.invariant.ts:112` | el día que el setter elige es el que se guarda, el que se muestra y el que reactiva | valor | no | — |
| 43 | progreso-isolation | `src/lib/leados/progreso-isolation.invariant.ts:46` | el progreso se alcanza sólo por id más dueño y el write toca únicamente el blob de progreso | valor | **sí** | el filtro se ejecuta suelto y el payload del write es un espejo escrito dentro del propio invariante: un guardado que no use ese filtro, o que agregue el stage, pasa igual |
| 44 | prospecto-import | `src/lib/leados/prospecto-import.invariant.ts:63` | el dueño de cada fila importada sale de la sesión y nunca de una columna del CSV | valor | no | — |
| 45 | recommendations | `src/lib/recommendations/recommendations.invariant.ts:59` | umbral por regla, pertinencia de señal a solución, anti-IDOR y tope con rotación | valor | **sí** | las fixtures se derivan de los umbrales: moverlos a 1 o a 10.000 mueve la fixture con ellos; y el censo de reglas es un `4` a mano |
| 46 | recorrido | `src/lib/leados/recorrido.invariant.ts:281` | la franja trae los pasos del manual enteros, sin chips a pantallas inalcanzables | estructura | no | — |
| 47 | referrals | `src/lib/referrals/referrals.invariant.ts:56` | código determinista, atribución válida y anti-abuso | valor | no | — |
| 48 | reloop-selfcheck | `src/lib/leados/reloop-selfcheck-reset.invariant.ts:85` | reabrir un rechazo resetea el self-check y preserva la checklist y el borrador | valor | **sí** | la composición real vive sólo en el comentario de cabecera: una transición que deje de spreadear la constante —o que nadie la importe— satisface igual sus claves |
| 49 | idor-tokens | `src/lib/security/idor-tokens.invariant.ts:55` | el token de opt-out está firmado por contacto y el scope sale de la sesión | valor | no | — |
| 50 | self-check-gate | `src/lib/leados/self-check-gate.invariant.ts:50` | la aprobación valida contra la lista vigente de hard-checks, no contra lo que el blob afirme | valor | **sí** | la fixture se deriva de la lista en vivo: agregar, borrar o renombrar hard-checks la reescribe sola. Lo único que ve el drift es un censo congelado a mano |
| 51 | setter-meta | `src/lib/leados/setter-meta.invariant.ts:25` | la nota, el pin y el snooze del setter son privados, y la cartera sigue aislada | valor | **sí** | afirma que un builder devuelve el filtro; ninguna lectura real del meta está atada a él, así que una query por lead deja esto verde |
| 52 | timeline | `src/lib/leados/timeline.invariant.ts:51` | el timeline es lead-scoped detrás del gate de ownership y el canal SISTEMA no cuenta como contacto | valor | **sí** | asserta la forma del objeto que devuelve el helper, pero nada ata la query real; y el «no cuenta» se ejercita con un contador escrito dentro del propio invariante |
| 53 | turno | `src/lib/leados/turno.invariant.ts:120` | toda situación tiene turno, con sus tres textos no vacíos y sin frases compartidas | estructura | **sí** | la unicidad se barre sólo sobre los campos que el mapa tenga: si un turno se queda con un campo, el barrido firma sobre menos frases y sale verde |
| 54 | upsell-dedup | `src/lib/upsell/dedup.invariant.ts:30` | clicks repetidos no duplican, sin silenciar el interés renovado | valor | **sí** | la fixture se deriva de la ventana: puede achicarse hasta unos seis segundos —el único piso real es el rage-click— y el dedup queda apagado, en verde |
| 55 | vista-cartera | `src/lib/leados/vista-cartera.invariant.ts:98` | la pausa personal y la postergación comercial tienen cada una su filtro | valor | no | — |

## Lo que este censo NO mide

No dice cuáles de los 33 importan. Un invariante sobre-satisfacible sobre una regla que nadie
va a tocar cuesta menos que uno anclado sobre una que cambia todas las semanas. Priorizar es
trabajo del sprint que lo tome; acá está el mapa, no el orden.

Tampoco se ejecutó ningún sabotaje: la columna «de más» es lectura de código, no medición. Un
sabotaje por invariante es lo que convertiría cada «sí» en un hecho — y es exactamente el
trabajo que P25 hizo para uno solo.

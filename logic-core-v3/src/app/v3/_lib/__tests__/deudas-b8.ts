/**
 * LAS DEUDAS DECLARADAS DE B8 — una sola lista, con número y con cierre.
 *
 * B8 saca el velo, abre seis de las ocho secciones sobre la sala y pone la
 * noche en Trabajos. Eso ROMPE contraste a propósito, y la regla del bloque es
 * que ninguna afirmación se afloja ni se borra: la que falla corre con su
 * condición intacta como `deudaDeclarada()` (`afirmar.ts`), cuenta aparte y
 * el agregado la publica. Acá viven los números y los cierres, para que dos
 * instrumentos que miden la misma deuda —el modelo de CPU de `s8-tinta` (el
 * peor píxel del cuadro SIN el logo) y la captura real de `s10-acceso` (el peor
 * píxel bajo cada glifo, logo incluido)— la nombren igual.
 *
 * Cada entrada dice QUÉ está roto y en qué bloque se cierra. El cómo no se
 * decide acá: se anota la salida más barata que se midió, no una promesa.
 * Las cifras de origen están en `docs/rediseno/outputs/B8-LUZ.md` §6.
 *
 * ── B11 · lo que cerró, lo que no, y con qué vara ────────────────────────────
 *
 * B11 movió el texto y volvió a medir las seis con el instrumento que las
 * declaró, a lo largo del tramo entero y en tres anchos
 * (`docs/rediseno/outputs/B11-ACOMODAMIENTO.md`). La vara la fijó el humano en
 * la PARADA 1: una deuda del logo cierra cuando la estructura pasa por detrás
 * del texto el 0 % del tramo en los tres anchos. **Las entradas se re-escriben
 * con lo medido y NINGUNA condición cambió**: las cuatro de `s8-tinta` §4
 * (numeros, trabajos, diferencial, cierre) miden la luz en la ventana de cada
 * sección, B11 no tocó la luz, y siguen corriendo como deuda con la misma
 * condición. Lo que queda debajo del texto después de correrlo —el piso de
 * motas— tiene sus propios números en `deudas-b11.ts`.
 */

export interface DeudaDeclarada {
  readonly numero: string
  readonly que: string
  readonly cierre: string
}

export const DEUDAS_DE_B8 = {
  numeros: {
    numero: 'D-B8.1',
    que: 'Números — DOS MITADES. La del logo, CERRADA en B11: el logo quedaba detrás del titular y de las cifras (10 de 13 bloques bajo AA en la captura, peor 1,00:1) y con la composición entera en c7–c12 pasa por detrás de las 13 cajas el 0 % del tramo en 1440, 1920 y 2560 (cruce-despues.json; antes, el 100 % de la caja del titular, el 44–53 % del tiempo). La del atardecer, ABIERTA: su última pantalla cae adentro del atardecer, la sala se apaga con la sección todavía en cuadro y la tinta oscura pierde AA (modelo: cruza AA hacia abajo en p=0,4882; captura: «Procesos automatizados» con el 95,9 % de su caja bajo AA en la peor parada a 1440, el 8,7 % del tramo, 1,06:1)',
    cierre: 'la mitad del logo cerró en B11 moviendo el texto; la del atardecer NO se cierra subiendo la cifra a la fila 1 —ahí su aterrizaje deja 1,47 pantallas hasta Trabajos contra el gate de 1,33 de B9— y queda para la luz: correr el atardecer al pie de Números, que decide el humano. El piso de motas que queda debajo es D-B11.3',
  },
  trabajos: {
    numero: 'D-B8.2',
    que: 'Trabajos — tinta clara sobre la sala: asoma con la sala todavía a pleno sol (modelo, ABIERTA) y en la noche las partículas que brillan quedan debajo de los glifos (captura: 3 de 9 bloques bajo AA, peor 2,53:1). B11 midió el tramo entero: el logo no pasa nunca por detrás (0 % en los tres anchos), y lo que a 1920 dejaba el renglón del nombre en 2,04–3,82:1 con el 85,7–100 % de su caja bajo AA era la franja de piso iluminado al pie del cuadro: CERRADA en B11 subiendo el renglón arriba de la captura (3,62–4,75:1, 0 % bajo AA). Lo que queda son las partículas: D-B11.4',
    cierre: 'la mitad de la captura cerró en B11 (el renglón del nombre arriba de la captura); la del modelo —arrancar el atardecer una fracción de pantalla antes de que Trabajos asome— es luz y la decide el humano; las partículas que brillan son el piso de D-B11.4',
  },
  diferencial: {
    numero: 'D-B8.3',
    que: 'Por qué develOP — dos mitades: asoma (p=0,7411) con el amanecer a nivel 0,504 y la tinta oscura no llega a AA hasta p=0,816, mientras el panel entra (modelo); y donde llena el cuadro (el ancla, 0,8525, a 0,643) el texto no llega a AA: 5 de 7 bajo AA, peor 1,11:1 (captura; B6-A ya medía 6 de 7). B11 midió el tramo entero y separó las causas: el logo pasa por detrás de las tres líneas del titular el 3,2–6,0 % del tramo (el 21,8–32,8 % de su caja alguna vez) y por detrás del cuerpo el 0 %; lo que el cuerpo tiene debajo el 18–49 % del tiempo es LA PARED de la sala (D-B5.1, re-escrita como problema de luz en deudas-b11.ts). La palanca de la tinta no existe: los 14 bloques aterrizados ya están en #111111 a alfa 1',
    cierre: 'ABIERTA por decisión (PARADA 1 de B11, decisión 4): el nivel del titular no se toca y la pared es luz, no posición. La salida barata para la entrada —terminar el amanecer en 0,643 antes de la reanudación— sigue medida y sin aplicar (B8-LUZ.md §6.4): acorta la entrada bajo AA de 0,075 a 0,028 de progreso pero no la elimina. La tabla queda para que la decisión sea revocable',
  },
  cierre: {
    numero: 'D-B8.4',
    que: 'Cierre — queda como está (PARADA 2 de B8 y decisión 6 de la PARADA 1 de B11): el pie pinta #0E0E0E, tapa la sala y da 0 de 25 bajo AA (peor 6,44) — B11 lo confirma en los tres anchos (0 de 25–26). Las variantes con el pie sin relleno, re-medidas por B11 en la pose y en tres anchos (sin-recorte/bloques-antes-cierre-*.json): oscuro-transparente 25 de 25, 26 de 26 y 26 de 26 bajo AA (peor 1,00–1,01); papel-transparente 13 de 25, 13 de 26 y 10 de 26 (peor 1,01–1,09); en las dos, el peor es «El envío está deshabilitado…» con TODO su glifo bajo AA (2.354–2.417 px) y con 0 bloques sobre el logo en la pose. B8 lo medía sobre la sala a 0,643 con el logo detrás (1,00–1,01); en la pose de B11 lo que hay detrás del pie es la sala misma',
    cierre: 'como está. Abrir el Cierre es acomodar el texto del pie contra lo que la sala tenga detrás en ese instante —logo o sala—, y recién ahí decidir qué superficie lleva: no antes, y lo decide el humano',
  },
  hero: {
    numero: 'D-B8.5',
    que: 'Hero — CERRADA en B11 sin mover nada, porque la atribución era falsa: «piloto automático.» y el cuerpo daban 3 de 7 bloques bajo AA (peor 2,94:1) y B8 lo escribió como el logo detrás del texto; B11 midió las 17 paradas del tramo en tres anchos y el logo pasa por detrás de los bloques del hero el 0 % del tiempo (cruce-*.json: 0 % alguna vez, antes y después). Los píxeles bajo AA son motas: 6–20 de 10.191 por captura. B6-A ya lo medía (2–4 de 7) y la cita de S9 (9,73:1) era el modelo sin el logo',
    cierre: 'cerrada en B11 por estructura (0 %); lo que queda es el piso de motas del hero, D-B11.1, que sólo baja con la escena',
  },
  quienesSomos: {
    numero: 'D-B8.6',
    que: 'Quiénes somos — el logo quedaba detrás del cuerpo y del rótulo (captura: 14 de 17 bloques bajo AA, peor 1,00:1; B11 antes: «Trabajamos desde Tucumán…» con el 62,9 % de su caja bajo el logo, el marcador de la foto el 100 % y el epígrafe el 76,6 %). CERRADA en B11: con «Cómo trabajamos» y la primera persona en c7–c10 y la foto en c3–c5, el logo pasa por detrás de los 17–18 bloques el 0 % del tramo en 1440, 1920 y 2560. B6-A lo había medido (12 de 17) y por eso no la abría; B8 la abre por decisión',
    cierre: 'cerrada en B11 por estructura (0 %); lo que queda —el piso de motas y la celosía bajo la segunda persona, con las dos tintas al 0,6 ya subidas a plena en la PARADA 2— es D-B11.2',
  },
} as const satisfies Record<string, DeudaDeclarada>

export const LISTA_DE_DEUDAS_DE_B8: readonly DeudaDeclarada[] = Object.values(DEUDAS_DE_B8)

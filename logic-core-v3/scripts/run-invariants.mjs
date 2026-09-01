// scripts/run-invariants.mjs
// Corre TODOS los scripts de invariante del repo y reporta cada resultado.
// Uso: npm run check:invariants
//
// ── Por qué existe este archivo ───────────────────────────────────────────────
// Hasta C1, `check:invariants` era una cadena `npm run a && npm run b && ...`
// escrita a mano en package.json. Eso tenía dos fallas, y las dos daban falso
// verde o falso rojo:
//
//   1. `&&` CORTA en el primer fallo. Si el invariante #3 falla, los #4..#43
//      nunca corren y nadie se entera de que además estaban rotos. El probe C0
//      lo midió: la cadena reportaba 13, 7, 16 y 7 verdes sin llegar al resto.
//
//   2. La cadena era una SEGUNDA LISTA, escrita a mano, que había que mantener
//      sincronizada con los scripts de package.json. Divergieron: de 43 scripts
//      de invariante, la cadena corría 22. Los otros 21 eran huérfanos — existían,
//      pasaban, y ningún agregado los invocaba.
//
// Este runner ataca las dos: descubre la lista desde package.json (no hay
// segunda lista que mantener — un script nuevo entra solo) y los corre TODOS
// SIEMPRE, sin cortar, acumulando el veredicto.
//
// ── El guard de la cuenta ─────────────────────────────────────────────────────
// Descubrir dinámicamente tiene su propio modo de fallar en verde: si el patrón
// deja de matchear (alguien renombra el prefijo), el runner descubre 0 scripts,
// corre 0, no falla ninguno, y sale 0. Verde impecable sobre una red apagada.
// Este número lo impide: descubrir algo distinto de lo esperado es un fallo
// ruidoso. Si agregás o borrás un invariante, ajustá este renglón EN EL MISMO
// COMMIT y decí por qué. Que cueste un renglón es el punto.
//
// ── Por qué EXACTO y no un piso (P8, caso 4) ─────────────────────────────────
// Hasta acá esto era `PISO_MINIMO = 43` y solo fallaba hacia abajo. Un piso que
// solo mira para un lado se atrasa POR CONSTRUCCIÓN: cada sprint que suma un
// invariante ensancha la holgura, y con holgura de N se pueden borrar N
// invariantes sin que la suite se entere. Medido: el piso era 43 y el
// descubrimiento había llegado a 47 — cuatro renglones de holgura, y la distancia
// creció sola en cada uno de los cuatro sprints anteriores.
//
// La alternativa era avisar cuando la distancia crece en vez de fallar. Se
// descartó: un aviso sobre una suite en verde es exactamente lo que ya pasó
// cuatro veces seguidas sin que nadie lo levantara. Fallar en las DOS
// direcciones cuesta el mismo renglón que el archivo ya pedía para borrar, se
// arregla en el commit donde ya estás parado, y es la única versión que no se
// puede volver a atrasar.
//
// Lo que este guard NO ve, y queda anotado: un RENOMBRE COORDINADO (un script
// que se va y otro que entra) conserva la cuenta y pasa. Vigilar eso pide fijar
// los NOMBRES, que es la segunda lista que este runner existe para no tener.
// 49 desde el sprint de destinos alcanzables: suma `check:invariant:enlaces`
// (los saltos pantalla→pantalla del manual no rebotan + ninguna guía manda a
// una fase que no nombra ninguna pantalla).
// 50 desde el sprint de la configuración que falta: suma
// `check:invariant:copy-sin-jerga` (ninguna frase que el setter pueda leer
// nombra un código de sprint ni una columna de la base — el mensaje que mataba
// el último paso del recorrido decía «Setup B7.0 … calComUsername»).
// 51 desde el sprint de la ficha por fuentes: suma `check:invariant:ficha-bloques`
// (el mapa campo→fuente no se despega del gate de señal mínima, el recorrido no
// se saltea bloques, y el bloque de la web no puede tener campos obligatorios —
// si los tuviera, un negocio sin web no podría dejar su veredicto).
const INVARIANTES_ESPERADOS = 51;

// ── Exclusiones ──────────────────────────────────────────────────────────────
// Scripts que se DESCUBREN pero no se corren, con el motivo al lado. Se imprimen
// en cada corrida a propósito: un script excluido en silencio es otra vez un
// huérfano, solo que escondido en el runner en vez de en package.json.
// La cuenta de arriba vigila el DESCUBRIMIENTO (el excluido sigue apareciendo), así
// que excluir uno no afloja el guard.
const EXCLUIDOS = {
  'check:invariant:client-monthly-report-pdf':
    'no es un invariante puro: hace prisma.botConfig.findFirst() y necesita DATABASE_URL. ' +
    'Local pasa porque hay .env.local; en CI sin DB falla. Reclasificarlo al job que tiene ' +
    'base es trabajo de C1b.',
};

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const scripts = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8')).scripts;

// `check:invariant` (a secas, el de assignment-trail) + todos los `check:invariant:*`.
// NO incluye `check:invariants` — ese es este mismo runner, y se llamaría a sí mismo.
const invariantes = Object.keys(scripts).filter(
  (nombre) => nombre === 'check:invariant' || nombre.startsWith('check:invariant:'),
);

if (invariantes.length !== INVARIANTES_ESPERADOS) {
  const faltan = INVARIANTES_ESPERADOS - invariantes.length;
  console.error(
    `\n✗ ABORTADO: se descubrieron ${invariantes.length} invariantes y se esperaban ` +
      `${INVARIANTES_ESPERADOS}.\n` +
      (faltan > 0
        ? `  Hay ${faltan} de MENOS. O se borraron scripts sin ajustar la cuenta, o el patrón de\n` +
          `  descubrimiento dejó de matchear. Correr con menos de lo esperado es un falso verde:\n` +
          `  revisá package.json.\n`
        : `  Hay ${-faltan} de MÁS: se agregaron invariantes y la cuenta quedó atrás. Subila a\n` +
          `  ${invariantes.length} en scripts/run-invariants.mjs, en este mismo commit.\n` +
          `  No es burocracia: mientras la cuenta esté atrasada por N, se pueden borrar N\n` +
          `  invariantes sin que esta suite lo note. Así se atrasó de 43 a 47.\n`),
  );
  process.exit(1);
}

const aCorrer = invariantes.filter((nombre) => !(nombre in EXCLUIDOS));
const excluidos = invariantes.filter((nombre) => nombre in EXCLUIDOS);

console.log(
  `\nDescubiertos ${invariantes.length} invariantes; corriendo ${aCorrer.length} ` +
    `(sin cortar en el primer fallo)\n`,
);

if (excluidos.length > 0) {
  console.log('EXCLUIDOS de esta corrida:');
  for (const nombre of excluidos) console.log(`  · ${nombre}\n      ${EXCLUIDOS[nombre]}`);
  console.log('');
}

const resultados = [];
for (const nombre of aCorrer) {
  // El nombre viene de las llaves de package.json y se interpola en un comando de
  // shell. Validarlo es barato y evita que una llave rara ejecute algo que no es.
  if (!/^[a-z0-9:_-]+$/i.test(nombre)) {
    resultados.push({ nombre, code: 1, ms: 0, salida: 'nombre de script inválido, no se ejecutó' });
    console.log(`✗ FALLA   ${nombre}  (nombre de script inválido)`);
    continue;
  }

  const t0 = Date.now();
  const r = spawnSync(`npm run --silent ${nombre}`, {
    shell: true,
    cwd: raiz,
    encoding: 'utf8',
    timeout: 300_000,
  });
  const ms = Date.now() - t0;
  const code = r.status ?? 1;

  resultados.push({
    nombre,
    code,
    ms,
    salida: [r.stdout, r.stderr].filter(Boolean).join('\n').trim(),
  });

  const estado = code === 0 ? '✓ ok     ' : `✗ FALLA  `;
  console.log(`${estado} ${nombre.padEnd(42)} ${String(ms).padStart(6)}ms`);
}

const fallados = resultados.filter((r) => r.code !== 0);

// La salida de los que fallaron va al final y completa: durante la corrida solo
// se imprime una línea por script para que el log siga siendo legible, pero un
// fallo sin su output obliga a re-correr a mano para saber qué pasó.
if (fallados.length > 0) {
  console.log('\n' + '─'.repeat(78));
  console.log('SALIDA DE LOS QUE FALLARON');
  console.log('─'.repeat(78));
  for (const f of fallados) {
    console.log(`\n### ${f.nombre}  (exit ${f.code})`);
    console.log(f.salida || '(sin salida)');
  }
}

console.log('\n' + '─'.repeat(78));
console.log(
  `descubiertos ${invariantes.length}  |  excluidos ${excluidos.length}  |  ` +
    `corridos ${resultados.length}  |  pasaron ${resultados.length - fallados.length}  |  ` +
    `fallaron ${fallados.length}`,
);
console.log('─'.repeat(78) + '\n');

process.exit(fallados.length > 0 ? 1 : 0);

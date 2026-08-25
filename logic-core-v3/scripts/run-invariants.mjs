// scripts/run-invariants.mjs
// Corre TODOS los scripts de invariante del repo y reporta los 43 resultados.
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
// segunda lista que mantener — un script nuevo entra solo) y corre los 43
// SIEMPRE, sin cortar, acumulando el veredicto.
//
// ── El guard del piso ─────────────────────────────────────────────────────────
// Descubrir dinámicamente tiene su propio modo de fallar en verde: si el patrón
// deja de matchear (alguien renombra el prefijo), el runner descubre 0 scripts,
// corre 0, no falla ninguno, y sale 0. Verde impecable sobre una red apagada.
// PISO_MINIMO lo impide: menos scripts que el piso es un fallo ruidoso.
// Si borrás un invariante a propósito, bajá el piso EN EL MISMO COMMIT y decí
// por qué. Que cueste un renglón es el punto.
const PISO_MINIMO = 43;

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

if (invariantes.length < PISO_MINIMO) {
  console.error(
    `\n✗ ABORTADO: se descubrieron ${invariantes.length} invariantes y el piso es ${PISO_MINIMO}.\n` +
      `  O se borraron scripts sin bajar el piso, o el patrón de descubrimiento dejó de matchear.\n` +
      `  Correr con menos de lo esperado sería un falso verde: revisá package.json.\n`,
  );
  process.exit(1);
}

console.log(`\nCorriendo ${invariantes.length} invariantes (sin cortar en el primer fallo)\n`);

const resultados = [];
for (const nombre of invariantes) {
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
  `corridos ${resultados.length}  |  pasaron ${resultados.length - fallados.length}  |  fallaron ${fallados.length}`,
);
console.log('─'.repeat(78) + '\n');

process.exit(fallados.length > 0 ? 1 : 0);

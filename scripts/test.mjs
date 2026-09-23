#!/usr/bin/env node
// harvis-standards v2 · test del paquete: las composiciones cargan y las reglas muerden.
// Lint del fixture (tests/fixture) con `vite()` vía la API de ESLint y afirma los
// ruleIds esperados. Sin framework externo: node + eslint.
//   pnpm test
import { ESLint } from 'eslint';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as std from '../eslint.config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, '..', 'tests', 'fixture');

const expect = (cond, msg) => {
  if (!cond) {
    console.error('[X] ' + msg);
    process.exitCode = 1;
  } else console.log('[V] ' + msg);
};

// 1) Composiciones cargan y tienen la forma esperada
expect(std.next({ tsconfigRootDir: fixture }).length >= 10, 'next() compone (sin registrar plugins)');
expect(!JSON.stringify(std.next({})).includes('"react-hooks"'), 'next() no registra react-hooks (lo hace Next)');
expect(std.vite({}).some((b) => b.plugins && b.plugins['react-hooks']), 'vite() registra react-hooks');
const baseMax = std.base.find((b) => b.rules && b.rules['max-lines']);
expect(baseMax && baseMax.rules['max-lines'][0] === 'error' && baseMax.rules['max-lines'][1].max === 300, 'base: max-lines 300 en error (HAR-0024)');
const legacyMax = std.legacy.find((b) => b.rules && b.rules['max-lines'] && b.rules['max-lines'][0] === 'warn');
expect(legacyMax && legacyMax.rules['max-lines'][1].max === 300, 'legacy: max-lines 300 en warn');
let threw = false;
try { std.promises({}); } catch (e) { threw = true; }
expect(threw, 'promises() exige tsconfigRootDir');

// 2) El fixture: cada fichero dispara lo que debe
const eslint = new ESLint({
  cwd: fixture,
  overrideConfigFile: true,
  overrideConfig: [
    ...std.vite({ tailwind: { legacy: { 'text-muted-foreground': 'text-ink-meta' } } }),
  ],
});
const results = await eslint.lintFiles(['src/**/*.{ts,tsx}']);
const byFile = {};
for (const r of results) byFile[path.relative(fixture, r.filePath)] = r.messages.map((m) => m.ruleId);
const has = (f, rule) => (byFile[f] || []).includes(rule);

expect(has('src/features/a/x.ts', '@typescript-eslint/no-explicit-any'), 'no-explicit-any en features/a/x.ts');
expect(has('src/features/a/x.ts', 'no-console'), 'no-console en features/a/x.ts');
expect(has('src/features/a/x.ts', 'import/no-cycle') || has('src/features/b/index.ts', 'import/no-cycle'), 'import/no-cycle detecta el ciclo a ↔ b');
expect(has('src/features/a/Card.tsx', 'harvis/no-arbitrary-tailwind'), 'harvis/no-arbitrary-tailwind: color arbitrario y token legacy');
expect(has('src/features/a/long.ts', 'max-lines'), 'max-lines: 301 líneas es error');
expect(has('src/components/Shared.tsx', 'boundaries/element-types'), 'boundaries: components/ no importa de features/');
expect(!has('src/features/a/clean.ts', '@typescript-eslint/no-explicit-any') && (byFile['src/features/a/clean.ts'] || []).length === 0, 'clean.ts sin hallazgos');

// `cycles: false` apaga la regla, y SOLO esa.
//
// La opción existe porque `import/no-cycle` no escala: en un repo de 1151
// ficheros se llevaba el 89,5 % del tiempo del lint, y ahí el grafo se
// comprueba con `pnpm ciclos` (madge, cien veces más rápido). Lo que se vigila
// aquí son las dos formas de estropearlo: que la opción no haga nada —y el
// repo grande siga pagando— o que se lleve por delante más reglas de la
// cuenta, dejando a los demás sin el orden de imports que sí necesitan.
const reglasDe = (cfg) => new Set(cfg.flatMap((c) => Object.keys(c.rules || {})));
const raiz = process.cwd();
for (const [nombre, hacer] of [['next', std.next], ['vite', std.vite]]) {
  const conCiclos = reglasDe(hacer({ tsconfigRootDir: raiz }));
  const sinCiclos = reglasDe(hacer({ tsconfigRootDir: raiz, cycles: false }));
  expect(conCiclos.has('import/no-cycle'), `${nombre}() trae import/no-cycle por defecto`);
  expect(!sinCiclos.has('import/no-cycle'), `${nombre}({cycles:false}) lo quita`);
  expect(
    sinCiclos.has('import/no-duplicates') && sinCiclos.has('import/no-self-import'),
    `${nombre}({cycles:false}) conserva el resto de reglas de imports`,
  );
}

// Una opción que no existe FALLA, no se ignora.
//
// El fallo que lo trajo (2026-09-23): `personal-os` pasó `cycles: false`
// apuntando a una versión del estándar que no conocía la opción. JavaScript la
// ignoró sin decir nada, el PR se mergeó creyendo el problema resuelto, y el
// lint siguió tardando quince minutos durante días. Un `cycles: false` que no
// hace nada es peor que un error: parece que está arreglado.
for (const [nombre, hacer, mala] of [
  ['next', std.next, 'ciclos'],
  ['vite', std.vite, 'cicles'],
  ['astro', std.astro, 'cycles'],
]) {
  let grito = null;
  try {
    hacer({ tsconfigRootDir: raiz, [mala]: false });
  } catch (e) {
    grito = e.message;
  }
  expect(grito !== null, `${nombre}({${mala}}) tiene que fallar, no ignorarse`);
  expect(
    grito?.includes(mala) && grito?.includes('version instalada'),
    `${nombre}() dice QUÉ opción sobra y que puede ser una versión vieja`,
  );
}

// `--if-present` va a pnpm, nunca detras del script.
//
// `pnpm ciclos --if-present` parece lo mismo que `pnpm run --if-present
// ciclos` y hace lo contrario: el flag llega AL SCRIPT. madge contesta
// «unknown option '--if-present'» y tumba el job -- o sea que en vez de saltar
// un script que no existe, revienta el que si existe. Pasó el 2026-09-23 y
// costo una ronda entera de CI.
//
// Se comprueba sobre el workflow porque ahi es donde vive el error: un YAML no
// tiene quien le avise, y este se copia a mano cada vez que se anade un paso.
{
  const wf = fs.readFileSync(new URL('../.github/workflows/quality.yml', import.meta.url), 'utf8');
  const malos = wf
    .split('\n')
    .filter((l) => /run:/.test(l) && /--if-present/.test(l) && !/run --if-present/.test(l));
  expect(
    malos.length === 0,
    `quality.yml usa \`pnpm run --if-present <script>\`${malos.length ? `; mal en: ${malos.join(' | ').trim()}` : ''}`,
  );
}

console.log(process.exitCode ? '\nFALLOS' : '\nharvis-standards: OK');

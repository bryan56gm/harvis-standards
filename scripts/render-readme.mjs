#!/usr/bin/env node
// harvis-standards v2 · README generado desde la configuración (HAR-0024 D11).
// La prosa que describe la máquina no puede divergir de la máquina: esta tabla
// sale de eslint.config.js. Entre <!-- rules:start --> y <!-- rules:end --> del README.
//   node scripts/render-readme.mjs          → reescribe el README
//   node scripts/render-readme.mjs --check  → exit 1 si el README está desactualizado
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as std from '../eslint.config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const readme = path.join(here, '..', 'README.md');
const check = process.argv.includes('--check');

const EXPORTS = {
  base: std.base,
  legacy: std.legacy,
  rulesOnly: std.rulesOnly,
  react: std.react,
  boundaries: std.boundaries,
  imports: std.imports,
  a11y: std.a11y,
  'promises({ tsconfigRootDir })': std.promises({ tsconfigRootDir: here }),
  'tailwind(opts)': std.tailwind({}),
  'barrels(opts)': std.barrels({}),
};
const COMPOSITIONS = {
  'next(opts)': 'rulesOnly + importsRulesOnly + a11y + barrels + tailwind (+ promises si tsconfigRootDir). Sin registrar plugins: Next ya los trae.',
  'vite(opts)': 'base + react + boundaries + imports + a11yPlugin + tailwind (+ promises).',
  'astro(opts)': 'base + react + imports + tailwind (+ promises). El plugin de Astro lo añade el repo.',
};

const sev = (v) => (Array.isArray(v) ? v[0] : v);
const opt = (v) => (Array.isArray(v) && v.length > 1 ? JSON.stringify(v.slice(1)).slice(1, -1) : '');
const SKIP = /^(no-unused-vars|no-undef|constructor-super|for-direction|getter-return|no-async-promise-executor|no-case-declarations|no-class-assign|no-compare-neg-zero|no-cond-assign|no-const-assign|no-constant-binary-expression|no-constant-condition|no-control-regex|no-debugger|no-delete-var|no-dupe-|no-duplicate-case|no-empty|no-empty-character-class|no-empty-pattern|no-empty-static-block|no-ex-assign|no-extra-boolean-cast|no-fallthrough|no-func-assign|no-global-assign|no-import-assign|no-invalid-regexp|no-irregular-whitespace|no-loss-of-precision|no-misleading-character-class|no-new-native-nonconstructor|no-nonoctal-decimal-escape|no-obj-calls|no-octal|no-prototype-builtins|no-redeclare|no-regex-spaces|no-self-assign|no-setter-return|no-shadow-restricted-names|no-sparse-arrays|no-this-before-super|no-unexpected-multiline|no-unreachable|no-unsafe-|no-unused-labels|no-unused-private-class-members|no-useless-|no-with|require-yield|use-isnan|valid-typeof|@typescript-eslint\/(no-array-constructor|no-duplicate-enum-values|no-empty-object-type|no-extra-non-null-assertion|no-misused-new|no-namespace|no-non-null-asserted-optional-chain|no-require-imports|no-this-alias|no-unnecessary-type-constraint|no-unsafe-declaration-merging|no-unsafe-function-type|no-unused-expressions|no-wrapper-object-types|prefer-as-const|prefer-namespace-keyword|triple-slash-reference)|jsx-a11y\/)/;

function rulesOf(blocks) {
  const map = new Map();
  for (const b of blocks) for (const [id, v] of Object.entries(b.rules || {})) {
    if (SKIP.test(id) && !/no-autofocus|label-has/.test(id)) continue;
    const files = b.files ? b.files.join(' ') : '';
    map.set(id + '|' + files, { id, sev: sev(v), opt: opt(v), files });
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

let out = '';
for (const [name, blocks] of Object.entries(EXPORTS)) {
  const rows = rulesOf(blocks);
  out += `\n### \`${name}\`\n\n| Regla | Severidad | Opciones | Ficheros |\n| --- | --- | --- | --- |\n`;
  for (const r of rows) out += `| \`${r.id}\` | ${r.sev} | ${r.opt ? '`' + r.opt.replace(/`/g, '') + '`' : ''} | ${r.files ? '`' + r.files + '`' : 'todos'} |\n`;
  if (name === 'a11y') out += `\nMás las \`recommended\` de \`eslint-plugin-jsx-a11y\` (no se listan una a una).\n`;
  if (name === 'base' || name === 'rulesOnly') out += `\nMás \`@eslint/js\` recommended y \`typescript-eslint\` recommended (no se listan).\n`;
}
out += '\n### Composiciones\n\n| Export | Qué compone |\n| --- | --- |\n';
for (const [n, d] of Object.entries(COMPOSITIONS)) out += `| \`${n}\` | ${d} |\n`;
out += '\nExentos de `max-lines`: `' + std.SIZE_EXEMPT.join('`, `') + '`.\n';

const current = fs.readFileSync(readme, 'utf8');
const start = current.indexOf('<!-- rules:start -->');
const end = current.indexOf('<!-- rules:end -->');
if (start < 0 || end < 0) { console.error('README sin marcadores rules:start/end'); process.exit(1); }
const next = current.slice(0, start) + '<!-- rules:start -->\n' + out + '\n' + current.slice(end);
if (check) {
  if (next !== current) { console.error('README.md desactualizado: node scripts/render-readme.mjs'); process.exit(1); }
  console.log('README.md al día');
} else {
  fs.writeFileSync(readme, next);
  console.log('README.md regenerado');
}

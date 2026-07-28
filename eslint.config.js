// Estandar HARVIS — regla -> maquina. Cambiar aqui = cambia en todos los repos.
//
// Uso en un repo:
//   import { base, react, boundaries } from '@bryan56gm/harvis-standards';
//   export default [...base, ...react, ...boundaries, ...overridesLocales];
//
// `legacy`: para repos con codigo previo — degrada any/console a warn para
// adoptar el estandar sin romper CI; los repos nuevos usan `base` (errores).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundariesPlugin from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../../../*'], message: 'Usa alias @/ en vez de rutas relativas profundas' }] },
      ],
    },
  },
  {
    // hard cap: 500 lineas = error (tests, tipos generados y locales exentos)
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.spec.*', '**/database.types.ts', '**/locales/**', '**/i18n/**'],
    rules: { 'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }] },
  },
  { ignores: ['dist/', 'build/', '.next/', '.astro/', 'node_modules/', 'coverage/', '**/*.gen.*'] }
);

// Repos con codigo previo: mismo estandar, severidad reducida donde el legado
// aun no cumple. El objetivo es subirlos a `base` con el tiempo.
export const legacy = [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export const react = [
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Reglas nuevas de react-hooks v7: informativas hasta que el codigo las cumpla
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
];

// Arquitectura 3 capas: app -> features -> lib (nunca al reves)
export const boundaries = [
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    plugins: { boundaries: boundariesPlugin },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: ['app/**', 'src/app/**', 'src/pages/**'] },
        { type: 'features', pattern: ['features/**', 'src/features/**'] },
        { type: 'lib', pattern: ['lib/**', 'src/lib/**'] },
        { type: 'ui', pattern: ['components/**', 'src/components/**'] },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'app', allow: ['features', 'lib', 'ui'] },
            { from: 'features', allow: ['features', 'lib', 'ui'] },
            { from: 'ui', allow: ['ui', 'lib'] },
            { from: 'lib', allow: ['lib'] },
          ],
        },
      ],
    },
  },
];

// Para repos cuyo framework ya registra los plugins TS/react (p.ej.
// eslint-config-next): solo severidades de reglas core + @typescript-eslint,
// sin registrar ningun plugin (evita "Cannot redefine plugin").
export const rulesOnly = [
  {
    rules: {
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['../../../*'], message: 'Usa alias @/ en vez de rutas relativas profundas' }] },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.spec.*', '**/database.types.ts', '**/locales/**', '**/i18n/**'],
    rules: { 'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }] },
  },
];

export default [...base, ...react, ...boundaries];

// Estandar HARVIS — regla -> maquina. Cambiar aqui = cambia en todos los repos.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Tamaño: el archivo de 5000 lineas es imposible por construccion
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-restricted-imports': ['error', { patterns: [{ group: ['../../../*'], message: 'Usa alias @/ en vez de rutas relativas profundas' }] }]
    }
  },
  {
    // hard cap: 500 lineas = error
    rules: { 'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }] },
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/*.test.*', '**/*.spec.*', '**/database.types.ts', '**/locales/**', '**/i18n/**']
  },
  {
    // Arquitectura 3 capas: app -> features -> lib (nunca al reves)
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: ['app/**', 'src/app/**', 'src/pages/**'] },
        { type: 'features', pattern: ['features/**', 'src/features/**'] },
        { type: 'lib', pattern: ['lib/**', 'src/lib/**'] },
        { type: 'ui', pattern: ['components/**', 'src/components/**'] }
      ]
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['features', 'lib', 'ui'] },
          { from: 'features', allow: ['features', 'lib', 'ui'] },
          { from: 'ui', allow: ['ui', 'lib'] },
          { from: 'lib', allow: ['lib'] }
        ]
      }]
    }
  },
  { ignores: ['dist/', 'build/', '.next/', 'node_modules/', 'coverage/', '**/*.gen.*'] }
);

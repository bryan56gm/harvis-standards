// harvis-standards v2 — regla → máquina. Cambiar aquí = cambia en todos los repos.
//
// Exports componibles (cada repo compone lo que necesita y añade excepciones debajo):
//
//   base          severidades estrictas + max-lines 300 (error) — repos que parten de cero
//   legacy        mismas reglas con severidad reducida (any/console warn, max-lines 300 warn, 500 error)
//   react         eslint-plugin-react-hooks v7 (REGISTRA el plugin: no usar con Next)
//   boundaries    arquitectura app → features → lib (REGISTRA eslint-plugin-boundaries)
//   imports       import/no-cycle y orden (REGISTRA eslint-plugin-import)
//   importsRulesOnly  las mismas reglas sin registrar el plugin (Next ya lo registra)
//   *SinCiclos    las mismas, sin `import/no-cycle` — para repos que comprueban
//                 el grafo con `pnpm ciclos` (madge). Ver la nota junto a IMPORT_RULES.
//   barrels(opts) fronteras entre módulos: solo `@/features/<m>` o `/client`; components/ y lib/ sin dominio
//   a11y          reglas de jsx-a11y sin registrar el plugin (Next) · a11yPlugin lo registra (Vite/Astro)
//   promises(opts) type-aware: no-floating-promises, no-misused-promises (necesita tsconfigRootDir)
//   tailwind(opts) harvis/no-arbitrary-tailwind (colores arbitrarios; `sizes`, `legacy` opcionales)
//   rulesOnly     severidades core sin registrar plugins (base para Next)
//   next(opts) · vite(opts) · astro(opts)   composiciones por framework
//
// Regla de composición (pattern-eslint-flat-config-plugins): un plugin solo se
// registra UNA vez en toda la cadena. eslint-config-next ya registra `import`,
// `react-hooks` y `jsx-a11y`: por eso existen las variantes *RulesOnly.
//
// Decisiones: HAR-0024 (300 líneas = error; raíz sin src/ en Next; funciones salvo estado).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundariesPlugin from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import { noArbitraryTailwind } from './rules/no-arbitrary-tailwind.js';

export const CODE_FILES = ['**/*.{ts,tsx,js,jsx,mjs,cjs}'];
// Exentos del tamaño: tests, tipos generados, locales, declaraciones.
export const SIZE_EXEMPT = [
  '**/*.test.*',
  '**/*.spec.*',
  '**/database.types.ts',
  '**/supabase/types.ts',
  '**/*.gen.*',
  '**/*.d.ts',
  '**/locales/**',
  '**/i18n/**',
  '**/messages/**',
];
const MAX_LINES = (max, severity) => [severity, { max, skipBlankLines: true, skipComments: true }];
const IGNORES = { ignores: ['dist/', 'build/', '.next/', '.astro/', 'node_modules/', 'coverage/', '**/*.gen.*', 'playwright-report/', 'test-results/'] };

const CORE_RULES = {
  '@typescript-eslint/no-explicit-any': 'error',
  'no-console': ['error', { allow: ['warn', 'error'] }],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
  'no-restricted-imports': [
    'error',
    { patterns: [{ group: ['../../../*'], message: 'Usa el alias @/ en vez de rutas relativas profundas' }] },
  ],
  'prefer-const': 'error',
  'no-var': 'error',
  eqeqeq: ['error', 'always'],
};

// ---------------------------------------------------------------------------
export const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } }, rules: CORE_RULES },
  { files: CODE_FILES, ignores: SIZE_EXEMPT, rules: { 'max-lines': MAX_LINES(300, 'error') } },
  IGNORES,
);

// Repos con código previo: mismas reglas, severidad reducida donde el legado aún
// no cumple. Objetivo: subirlos a `base` con una issue de trinquete por repo.
export const legacy = [
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'max-lines': MAX_LINES(300, 'warn'),
    },
  },
  { files: CODE_FILES, ignores: SIZE_EXEMPT, rules: { 'max-lines': MAX_LINES(500, 'error') } },
];

export const react = [
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Reglas nuevas de react-hooks v7: informativas hasta que el código las cumpla
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
];

// Arquitectura 3 capas: app -> features -> lib (nunca al revés)
export const boundaries = [
  {
    files: ['src/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
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

// `import/no-cycle` no escala, y conviene saber por qué antes de tocarlo.
//
// Un ciclo es una propiedad del GRAFO de imports, pero ESLint analiza fichero a
// fichero: la regla reconstruye el grafo desde cada uno. El coste crece con el
// cuadrado del proyecto y no se nota hasta que se nota de golpe. Medido en
// `personal-os` (1151 ficheros, 2026-09-23): **617 s de los 693 s que tardaba
// el lint entero — el 89,5 %**. El resto de reglas juntas sumaban 70 s.
//
// La alternativa es construir el grafo UNA vez. `madge` hace exactamente eso y
// tarda 6 s sobre el mismo proyecto: cien veces menos. Se comprobó que no es un
// cambio a peor introduciendo un ciclo a propósito — las dos lo detectan— y que
// lo único que `madge` no mira son paquetes de `node_modules`, que no pueden
// formar un ciclo interno.
//
// Por eso `cycles: false` no deja un hueco: obliga a poner el guardia en otro
// sitio (`pnpm ciclos`, y su paso en `quality.yml`). Y por eso el valor por
// defecto sigue siendo `true`: en un repo pequeño la regla no duele, y quitarla
// de todos a la vez dejaría cinco proyectos sin comprobación mientras cada uno
// se pone al día. El umbral práctico está por los cientos de ficheros — si el
// lint se va de un minuto, este es el primer sitio donde mirar.
const IMPORT_RULES_BASE = {
  'import/no-self-import': 'error',
  'import/first': 'error',
  'import/newline-after-import': 'error',
  'import/no-duplicates': 'error',
};
const CYCLE_RULE = { 'import/no-cycle': ['error', { maxDepth: 10 }] };
const IMPORT_RULES = { ...CYCLE_RULE, ...IMPORT_RULES_BASE };
const IMPORT_SETTINGS = {
  "import/parsers": { "@typescript-eslint/parser": [".ts", ".tsx", ".mts"] },
  "import/resolver": { node: { extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts"] } },
};
// Los cuatro exports siguen siendo ARRAYS y con las mismas reglas de siempre:
// quien ya hacía `...imports` no se entera de nada. Las variantes `SinCiclos`
// son aditivas, para el repo que ya comprueba el grafo por su cuenta.
export const imports = [{ files: CODE_FILES, plugins: { import: importPlugin }, settings: IMPORT_SETTINGS, rules: IMPORT_RULES }];
export const importsRulesOnly = [{ files: CODE_FILES, rules: IMPORT_RULES }];
export const importsSinCiclos = [{ files: CODE_FILES, plugins: { import: importPlugin }, settings: IMPORT_SETTINGS, rules: IMPORT_RULES_BASE }];
export const importsRulesOnlySinCiclos = [{ files: CODE_FILES, rules: IMPORT_RULES_BASE }];

// Fronteras entre módulos (REF-std-architecture: dos barriles, agregador declarado).
//   opts.allow: patrones que sí pueden importarse aunque sean internos
//               (p. ej. '@/features/_kernel/components/*')
//   opts.aggregators: módulos agregadores (pueden importar de todos; nadie de ellos)
export const barrels = (opts = {}) => {
  const allow = (opts.allow || []).map((p) => `!${p}`);
  return [
    {
      files: ['app/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}', 'src/pages/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/*/*/**', '!@/features/*/client', ...allow],
                message:
                  'app/ solo importa la superficie pública de un módulo (@/features/<m> o @/features/<m>/client), nunca sus internals. Expórtalo desde el barril si hace falta desde fuera.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['features/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/*/*/**', '!@/features/*/client', ...allow],
                message:
                  'Solo la superficie pública de otro módulo: @/features/<m> o @/features/<m>/client. Dentro del propio módulo, ruta relativa.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['components/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/features/*', '@/app/*'],
                message: 'components/ es capa compartida: no puede importar de features/ ni app/. Si necesita un dato de dominio, recíbelo por props.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['lib/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          { patterns: [{ group: ['@/components/*', '@/features/*'], message: 'lib/ no depende de la UI ni del dominio.' }] },
        ],
      },
    },
  ];
};

const A11Y_RULES = {
  ...jsxA11y.flatConfigs.recommended.rules,
  // El autofocus dentro de un diálogo recién abierto es lo que pide WAI-ARIA;
  // la regla apunta al autofocus de carga de página, que no ocurre.
  'jsx-a11y/no-autofocus': 'off',
  'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
};
export const a11y = [{ files: ['**/*.{tsx,jsx}'], rules: A11Y_RULES }];
export const a11yPlugin = [{ files: ['**/*.{tsx,jsx}'], plugins: { 'jsx-a11y': jsxA11y }, rules: A11Y_RULES }];

// Type-aware, acotado al código de la app para que siga siendo asequible.
export const promises = ({ tsconfigRootDir, files } = {}) => {
  if (!tsconfigRootDir) throw new Error('harvis-standards: promises({ tsconfigRootDir: import.meta.dirname })');
  return [
    {
      files: files || ['app/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
      ignores: ['**/*.test.*', '**/*.spec.*', '**/*.d.ts'],
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir } },
      rules: {
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
        '@typescript-eslint/await-thenable': 'error',
      },
    },
  ];
};

export const tailwind = (opts = {}) => [
  {
    files: ['**/*.{tsx,jsx,ts}'],
    ignores: ['**/*.test.*', '**/*.spec.*', '**/eslint.config.*', '**/eslint-rules/**'],
    plugins: { harvis: { rules: { 'no-arbitrary-tailwind': noArbitraryTailwind } } },
    rules: { 'harvis/no-arbitrary-tailwind': ['error', opts] },
  },
];

// Para repos cuyo framework ya registra los plugins TS/react/import/a11y (Next):
// solo severidades de reglas core + @typescript-eslint, sin registrar ningún plugin.
export const rulesOnly = [
  { rules: CORE_RULES },
  { files: CODE_FILES, ignores: SIZE_EXEMPT, rules: { 'max-lines': MAX_LINES(300, 'error') } },
  IGNORES,
];

// ---------------------------------------------------------------------------
// Una opcion que no existe es un ERROR, no un silencio.
//
// JavaScript ignora sin rechistar una propiedad que nadie lee, y eso convierte
// una version vieja del estandar en una trampa: el repo pasa `cycles: false`,
// la version instalada no sabe que es `cycles`, y el resultado es que la
// opcion no hace NADA mientras todo el mundo la da por aplicada.
//
// Paso de verdad (2026-09-23). `personal-os` desactivo `import/no-cycle` --la
// regla que se llevaba el 89,7 % del lint, 1272 s de 1418-- apuntando a una
// version del estandar que nunca se publico. Quedo clavado en v2.1.0, la
// opcion se ignoro, y el lint siguio tardando quince minutos con un PR
// mergeado que decia que ya no.
//
// Con esto, esa combinacion falla al arrancar ESLint y dice exactamente que
// pasa. Un fallo ruidoso el primer dia vale mas que semanas creyendo que algo
// esta arreglado.
const comprobarOpciones = (nombre, opts, permitidas) => {
  const sobran = Object.keys(opts).filter((k) => !permitidas.includes(k));
  if (sobran.length) {
    throw new Error(
      `harvis-standards: ${nombre}() no conoce ${sobran.map((k) => `\`${k}\``).join(', ')}. ` +
        `Acepta: ${permitidas.join(', ')}. ` +
        `Si la opcion deberia existir, la version instalada es vieja: mira la etiqueta en package.json.`,
    );
  }
};

// Composiciones por framework. Las excepciones locales van DEBAJO en el repo.
export const next = (opts = {}) => {
  comprobarOpciones('next', opts, ['tsconfigRootDir', 'barrels', 'tailwind', 'cycles']);
  const { tsconfigRootDir, barrels: barrelOpts, tailwind: twOpts, cycles } = opts;
  return [
    ...rulesOnly,
    ...(cycles === false ? importsRulesOnlySinCiclos : importsRulesOnly),
    ...a11y,
    ...barrels(barrelOpts),
    ...tailwind(twOpts),
    ...(tsconfigRootDir ? promises({ tsconfigRootDir }) : []),
  ];
};

export const vite = (opts = {}) => {
  comprobarOpciones('vite', opts, ['tsconfigRootDir', 'tailwind', 'cycles']);
  const { tsconfigRootDir, tailwind: twOpts, cycles } = opts;
  return [
  ...base,
  ...react,
  ...boundaries,
  ...(cycles === false ? importsSinCiclos : imports),
  ...a11yPlugin,
  ...tailwind(twOpts),
    ...(tsconfigRootDir ? promises({ tsconfigRootDir, files: ['src/**/*.{ts,tsx}'] }) : []),
  ];
};

export const astro = (opts = {}) => {
  comprobarOpciones('astro', opts, ['tsconfigRootDir', 'tailwind']);
  const { tsconfigRootDir, tailwind: twOpts } = opts;
  return [
  ...base,
  ...react,
  ...imports,
  ...tailwind(twOpts),
    ...(tsconfigRootDir ? promises({ tsconfigRootDir, files: ['src/**/*.{ts,tsx}'] }) : []),
  ];
};

export default [...base, ...react, ...boundaries];

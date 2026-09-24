# harvis-standards

**Regla → máquina.** Lo que decide un linter no gasta ni un token de prompt: aquí
vive el carril 0 del estándar de ingeniería de Bryan (HAR-0022). ESLint flat config
componible por framework, una regla custom para Tailwind, Prettier, `tsconfig` base,
plantillas (lefthook, commitlint, editorconfig, gitattributes, knip, renovate, CI) y
un workflow reutilizable. El texto del estándar (el porqué) vive en el kernel de
HARVIS, `knowledge/ref/REF-code.md`.

## Uso

```bash
pnpm add -D github:bryan56gm/harvis-standards#v2.0.0 eslint typescript-eslint prettier
```

```js
// eslint.config.js · Next (App Router). Ver templates/eslint.config.next.js
import { next } from '@bryan56gm/harvis-standards';
export default [...nextVitals, ...nextTs, ...next({ tsconfigRootDir: import.meta.dirname })];

// Vite + React · templates/eslint.config.vite.js
import { vite } from '@bryan56gm/harvis-standards';
export default [...vite({ tsconfigRootDir: import.meta.dirname })];
```

- Prettier: `import config from '@bryan56gm/harvis-standards/prettier'` (o `prettier-tailwind` con el plugin de orden de clases).
- TypeScript: `"extends": "@bryan56gm/harvis-standards/tsconfig.base.json"`.
- Hooks de git: `templates/lefthook.yml` + `templates/lint-staged.json` + `templates/commitlint.config.js`.
- CI: `templates/ci.yml` → `uses: bryan56gm/harvis-standards/.github/workflows/quality.yml@v2`. El repo necesita `"packageManager": "pnpm@10.x"` en `package.json`.
- Adopción sin bloquear: añade `...legacy` debajo mientras el código previo no cumpla `base`, y abre la issue de trinquete. Subir la severidad es un commit que se ve en el diff (HAR-0021).

Un plugin solo se registra una vez en toda la cadena: `next()` no registra ninguno
(eslint-config-next ya trae `import`, `react-hooks` y `jsx-a11y`); `vite()` y `astro()`
sí. Detalle: `knowledge/patterns/pattern-eslint-flat-config-plugins.md`.

## Decisiones (HAR-0024)

300 líneas de código = **error** (tests, tipos generados y locales exentos; 500 techo en
`legacy`) · Next en la raíz sin `src/`, Vite/Astro con `src/` · funciones por defecto,
clase solo para estado real · lefthook en todos los repos · semver con tags; los repos
fijan `#v2.x.y` y Renovate lo sube · este README se genera desde la configuración.

## Reglas efectivas

Generado por `node scripts/render-readme.mjs` (la CI comprueba que está al día).

<!-- rules:start -->

### `base`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `@typescript-eslint/ban-ts-comment` | error | `{"ts-expect-error":"allow-with-description"}` | todos |
| `@typescript-eslint/consistent-type-imports` | error |  | todos |
| `@typescript-eslint/no-explicit-any` | error |  | todos |
| `@typescript-eslint/no-unused-vars` | error | `{"argsIgnorePattern":"^_","varsIgnorePattern":"^_","caughtErrorsIgnorePattern":"^_"}` | todos |
| `eqeqeq` | error | `"always"` | todos |
| `max-lines` | error | `{"max":300,"skipBlankLines":true,"skipComments":true}` | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `no-array-constructor` | off |  | todos |
| `no-console` | error | `{"allow":["warn","error"]}` | todos |
| `no-new-symbol` | off |  | `**/*.ts **/*.tsx **/*.mts **/*.cts` |
| `no-restricted-imports` | error | `{"patterns":[{"group":["../../../*"],"message":"Usa el alias @/ en vez de rutas relativas profundas"}]}` | todos |
| `no-unused-expressions` | off |  | todos |
| `no-var` | error |  | `**/*.ts **/*.tsx **/*.mts **/*.cts` |
| `no-var` | error |  | todos |
| `prefer-const` | error |  | `**/*.ts **/*.tsx **/*.mts **/*.cts` |
| `prefer-const` | error |  | todos |
| `prefer-rest-params` | error |  | `**/*.ts **/*.tsx **/*.mts **/*.cts` |
| `prefer-spread` | error |  | `**/*.ts **/*.tsx **/*.mts **/*.cts` |

Más `@eslint/js` recommended y `typescript-eslint` recommended (no se listan).

### `legacy`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `@typescript-eslint/consistent-type-imports` | warn |  | todos |
| `@typescript-eslint/no-explicit-any` | warn |  | todos |
| `max-lines` | warn | `{"max":300,"skipBlankLines":true,"skipComments":true}` | todos |
| `max-lines` | error | `{"max":500,"skipBlankLines":true,"skipComments":true}` | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `no-console` | warn | `{"allow":["warn","error"]}` | todos |

### `rulesOnly`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `@typescript-eslint/ban-ts-comment` | error | `{"ts-expect-error":"allow-with-description"}` | todos |
| `@typescript-eslint/consistent-type-imports` | error |  | todos |
| `@typescript-eslint/no-explicit-any` | error |  | todos |
| `@typescript-eslint/no-unused-vars` | error | `{"argsIgnorePattern":"^_","varsIgnorePattern":"^_","caughtErrorsIgnorePattern":"^_"}` | todos |
| `eqeqeq` | error | `"always"` | todos |
| `max-lines` | error | `{"max":300,"skipBlankLines":true,"skipComments":true}` | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `no-console` | error | `{"allow":["warn","error"]}` | todos |
| `no-restricted-imports` | error | `{"patterns":[{"group":["../../../*"],"message":"Usa el alias @/ en vez de rutas relativas profundas"}]}` | todos |
| `no-var` | error |  | todos |
| `prefer-const` | error |  | todos |

Más `@eslint/js` recommended y `typescript-eslint` recommended (no se listan).

### `react`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `react-hooks/config` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/error-boundaries` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/exhaustive-deps` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/gating` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/globals` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/immutability` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/incompatible-library` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/preserve-manual-memoization` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/purity` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/refs` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/rules-of-hooks` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/set-state-in-effect` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/set-state-in-render` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/static-components` | error |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/unsupported-syntax` | warn |  | `**/*.{ts,tsx,jsx}` |
| `react-hooks/use-memo` | error |  | `**/*.{ts,tsx,jsx}` |

### `boundaries`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `boundaries/element-types` | error | `{"default":"disallow","rules":[{"from":"app","allow":["features","lib","ui"]},{"from":"features","allow":["features","lib","ui"]},{"from":"ui","allow":["ui","lib"]},{"from":"lib","allow":["lib"]}]}` | `src/**/*.{ts,tsx} app/**/*.{ts,tsx} features/**/*.{ts,tsx} lib/**/*.{ts,tsx} components/**/*.{ts,tsx}` |

### `imports`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `import/first` | error |  | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `import/newline-after-import` | error |  | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `import/no-cycle` | error | `{"maxDepth":10}` | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `import/no-duplicates` | error |  | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |
| `import/no-self-import` | error |  | `**/*.{ts,tsx,js,jsx,mjs,cjs}` |

### `a11y`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `jsx-a11y/label-has-associated-control` | error | `{"depth":3}` | `**/*.{tsx,jsx}` |
| `jsx-a11y/label-has-for` | off |  | `**/*.{tsx,jsx}` |
| `jsx-a11y/no-autofocus` | off |  | `**/*.{tsx,jsx}` |

Más las `recommended` de `eslint-plugin-jsx-a11y` (no se listan una a una).

### `promises({ tsconfigRootDir })`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `@typescript-eslint/await-thenable` | error |  | `app/**/*.{ts,tsx} features/**/*.{ts,tsx} lib/**/*.{ts,tsx} components/**/*.{ts,tsx} src/**/*.{ts,tsx}` |
| `@typescript-eslint/no-floating-promises` | error | `{"ignoreVoid":true}` | `app/**/*.{ts,tsx} features/**/*.{ts,tsx} lib/**/*.{ts,tsx} components/**/*.{ts,tsx} src/**/*.{ts,tsx}` |
| `@typescript-eslint/no-misused-promises` | error | `{"checksVoidReturn":{"attributes":false}}` | `app/**/*.{ts,tsx} features/**/*.{ts,tsx} lib/**/*.{ts,tsx} components/**/*.{ts,tsx} src/**/*.{ts,tsx}` |

### `tailwind(opts)`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `harvis/no-arbitrary-tailwind` | error | `{}` | `**/*.{tsx,jsx,ts}` |

### `barrels(opts)`

| Regla | Severidad | Opciones | Ficheros |
| --- | --- | --- | --- |
| `no-restricted-imports` | error | `{"patterns":[{"group":["@/features/*/*/**","!@/features/*/client"],"message":"app/ solo importa la superficie pública de un módulo (@/features/<m> o @/features/<m>/client), nunca sus internals. Expórtalo desde el barril si hace falta desde fuera."}]}` | `app/**/*.{ts,tsx} src/app/**/*.{ts,tsx} src/pages/**/*.{ts,tsx}` |
| `no-restricted-imports` | error | `{"patterns":[{"group":["@/features/*/*/**","!@/features/*/client"],"message":"Solo la superficie pública de otro módulo: @/features/<m> o @/features/<m>/client. Dentro del propio módulo, ruta relativa."}]}` | `features/**/*.{ts,tsx} src/features/**/*.{ts,tsx}` |
| `no-restricted-imports` | error | `{"patterns":[{"group":["@/features/*","@/app/*"],"message":"components/ es capa compartida: no puede importar de features/ ni app/. Si necesita un dato de dominio, recíbelo por props."}]}` | `components/**/*.{ts,tsx} src/components/**/*.{ts,tsx}` |
| `no-restricted-imports` | error | `{"patterns":[{"group":["@/components/*","@/features/*"],"message":"lib/ no depende de la UI ni del dominio."}]}` | `lib/**/*.{ts,tsx} src/lib/**/*.{ts,tsx}` |

### Composiciones

| Export | Qué compone |
| --- | --- |
| `next(opts)` | rulesOnly + importsRulesOnly + a11y + barrels + tailwind (+ promises si tsconfigRootDir). Sin registrar plugins: Next ya los trae. |
| `vite(opts)` | base + react + boundaries + imports + a11yPlugin + tailwind (+ promises). |
| `astro(opts)` | base + react + imports + tailwind (+ promises). El plugin de Astro lo añade el repo. |

Exentos de `max-lines`: `**/*.test.*`, `**/*.spec.*`, `**/database.types.ts`, `**/supabase/types.ts`, `**/*.gen.*`, `**/*.d.ts`, `**/locales/**`, `**/i18n/**`, `**/messages/**`.

<!-- rules:end -->

## Desarrollo

```bash
pnpm install
pnpm test                       # scripts/test.mjs: las composiciones cargan y las reglas muerden (tests/fixture)
node scripts/render-readme.mjs  # regenera la tabla de arriba
```

Versionado: semver. `v2` es una etiqueta flotante que sigue al último 2.x (para `quality.yml@v2`); el paquete se fija a `#vX.Y.Z`. Cada cambio de severidad o regla nueva es al menos `minor`; quitar
o endurecer una regla en `base` es `major`. `CHANGELOG.md`.

## El presupuesto de tiempo

`quality.yml` **falla** si las comprobaciones pasan de cinco minutos
(`presupuesto-segundos`, 300 por defecto).

No es una métrica: es un check. Un CI lento no se arregla nunca —cada quien que
lo sufre decide que hoy no le toca a él— y acaba saltándose con `--no-verify` o
ignorándose del todo, que es como se llega a mergear sin verificar. En rojo,
hay que mirarlo el día que se rompe, cuando todavía se sabe qué cambio lo rompió.

El reloj arranca **después** de instalar dependencias: lo que se presupuesta es
comprobar, no descargar. Y se mide dentro del job, no desde fuera, porque la
duración que muestra GitHub incluye esperar a que haya ejecutor libre, y eso no
lo arregla el repo.

Si de verdad no se puede bajar, se sube el techo en un PR con el motivo escrito.
Ponerlo a `0` lo desactiva, y eso también deja rastro.

### Las tres a la vez

Lint, ciclos y tipos corren **en paralelo** dentro del job. No se necesitan
entre sí —cada una lee el código y opina— y en fila costaban la suma cuando el
reloj de quien espera solo ve la más larga. En `personal-os`: 184 + 19 + 72 s
en fila, contra ~190 s a la vez.

Cabe en la máquina: el lint usa 2 hilos, `tsc` va prácticamente a uno y `madge`
es corto. Cada salida va a su fichero y se vuelca agrupada al final — mezclar
tres logs según llegan da algo que no se puede leer, y el log es lo primero que
se mira cuando algo falla.

### `concurrencia-lint`

Por defecto **1**, y no es una renuncia: medido en `personal-os`, **82 s a un
hilo contra 121 s a dos**. Con reglas que usan tipos, cada hilo construye su
propio programa de TypeScript —unos 3,8 GB—, así que el segundo hilo duplica el
trabajo y la memoria para ir más lento.

El techo de este job no son los núcleos: es la **memoria**. Al lado corre `tsc`
(~2 GB) y, en otro job del mismo workflow, los tests. En el VPS —4 núcleos,
15 GB, de los que el escritorio puede reservar 12— eso se junta enseguida y el
vigilante mata lo que pille. Llega como `SIGTERM` sin mensaje: parece que el CI
se cuelga o que tarda de más, y no es ninguna de las dos.

Una máquina con memoria de sobra puede subirlo. La que decide es la RAM.

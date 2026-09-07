# Changelog

Semver. Los repos fijan `github:bryan56gm/harvis-standards#vX.Y.Z`.

## 2.1.0 — 2026-09-07

### Added

- `quality.yml`: input `build` (default `true`). Un workflow reutilizable no recibe `env` del repo que lo llama; los repos cuyo build exige variables (personal-os: Supabase, Sentry) lo apagan y mantienen su job de build con secretos. La primera adopción real (personal-os) lo dejó a la vista.
- Etiqueta flotante `v2`: sigue al último 2.x. Los repos referencian `quality.yml@v2` y fijan el paquete a `#vX.Y.Z`.

## 2.0.0 — 2026-09-07

Fase F5 del estándar de ingeniería v2 (harvis-system#226, HAR-0022/0024).

### Breaking

- `base` y `rulesOnly`: `max-lines` pasa de 300 warn / 500 error a **300 error** (HAR-0024). `legacy` conserva 300 warn y 500 error para adoptar sin romper la CI.
- `base` añade `consistent-type-imports`, `ban-ts-comment` (con descripción), `prefer-const`, `no-var`, `eqeqeq`.
- `react`: `rules-of-hooks` en error explícito.

### Added

- Exports `imports` / `importsRulesOnly` (`import/no-cycle`, `no-self-import`, `first`, `newline-after-import`, `no-duplicates`).
- `barrels(opts)`: fronteras entre módulos (solo `@/features/<m>` o `/client`; `components/` y `lib/` sin dominio). `opts.allow` para excepciones del repo.
- `a11y` / `a11yPlugin`: `jsx-a11y` recommended con `no-autofocus` off y `label-has-associated-control` depth 3.
- `promises({ tsconfigRootDir })`: `no-floating-promises`, `no-misused-promises`, `await-thenable` (type-aware, acotado).
- `tailwind(opts)`: regla custom `harvis/no-arbitrary-tailwind` (colores arbitrarios siempre; `sizes: true` opcional; `legacy: {token: reemplazo}` para retirar un sistema de diseño).
- Composiciones `next(opts)`, `vite(opts)`, `astro(opts)`.
- `tsconfig.base.json` estricto (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, …).
- Plantillas: `lefthook.yml` (lint-staged + typecheck), `lint-staged.json`, `commitlint.config.js`, `.editorconfig`, `.gitattributes`, `knip.json`, `renovate.json`, `ci.yml`, `eslint.config.{next,vite,astro}.js`.
- `quality.yml` v2: inputs `max-warnings`, `knip`, `node-version`.
- README generado desde la configuración (`scripts/render-readme.mjs`, la CI lo comprueba) y test del paquete (`scripts/test.mjs` sobre `tests/fixture`).

## 1.0.0 — 2026-07-29

`base`, `legacy`, `react`, `boundaries`, `rulesOnly`, Prettier, plantilla lefthook, `quality.yml`.

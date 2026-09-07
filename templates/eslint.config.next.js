// harvis-standards v2 · plantilla para Next (App Router, raíz sin src/).
// eslint-config-next ya registra import, react-hooks y jsx-a11y: `next()` solo aporta reglas.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { next, legacy } from '@bryan56gm/harvis-standards';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', 'coverage/**']),
  ...next({
    tsconfigRootDir: import.meta.dirname,
    // barrels: { allow: ['@/features/_kernel/components/*'] },
    // tailwind: { legacy: { 'text-muted-foreground': 'text-ink-meta' } },
  }),
  // Adopción: quitar `legacy` cuando el repo cumpla `base` (issue de trinquete).
  // ...legacy,
  // Excepciones del repo debajo.
]);

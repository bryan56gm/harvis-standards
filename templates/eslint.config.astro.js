// harvis-standards v2 · plantilla para Astro (+ islas React).
import astroPlugin from 'eslint-plugin-astro';
import { astro, legacy } from '@bryan56gm/harvis-standards';

export default [
  { ignores: ['dist/', '.astro/', 'src/lib/database.types.ts'] },
  ...astro({ tsconfigRootDir: import.meta.dirname }),
  ...astroPlugin.configs.recommended,
  // ...legacy,
];

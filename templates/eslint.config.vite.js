// harvis-standards v2 · plantilla para Vite + React (Capacitor).
import { vite, legacy } from '@bryan56gm/harvis-standards';

export default [
  { ignores: ['dist', 'android', 'ios', '**/*.config.{js,ts,mjs}'] },
  ...vite({ tsconfigRootDir: import.meta.dirname }),
  // ...legacy,
];

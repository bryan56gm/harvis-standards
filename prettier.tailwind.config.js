// harvis-standards v2 · Prettier + orden automático de clases de Tailwind.
//   pnpm add -D prettier-plugin-tailwindcss
//   prettier.config.js: export { default } from '@bryan56gm/harvis-standards/prettier-tailwind';
import base from './prettier.config.js';
export default { ...base, plugins: ['prettier-plugin-tailwindcss'] };

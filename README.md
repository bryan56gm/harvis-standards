# harvis-standards

Regla → máquina. ESLint flat config compartida (max-lines 300/500, boundaries app/features/lib, no-any, no-console), Prettier, plantillas lefthook/commitlint y CI reutilizable.

Uso en un repo:
```bash
pnpm add -D github:bryan56gm/harvis-standards eslint typescript-eslint
# eslint.config.js del repo:
#   import harvis from '@bryan56gm/harvis-standards';
#   export default [...harvis];
```
CI: `uses: bryan56gm/harvis-standards/.github/workflows/quality.yml@main`

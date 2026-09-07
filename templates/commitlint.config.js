// harvis-standards v2 · Conventional Commits en imperativo, ≤72 en la primera línea.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};

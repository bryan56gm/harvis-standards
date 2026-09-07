/**
 * harvis/no-arbitrary-tailwind
 *
 * Las decisiones visuales viven en tokens (variables CSS mapeadas por Tailwind),
 * no en un componente. Esta regla prohíbe en cualquier cadena de un fichero de
 * componente:
 *   - colores arbitrarios: `bg-[#0A0C0E]`, `text-[rgb(…)]`, `border-[hsl(…)]`,
 *     `ring-[oklch(…)]`  → siempre;
 *   - tamaños arbitrarios: `w-[137px]`, `gap-[7px]`  → solo con `sizes: true`
 *     (por defecto se permiten: en el sistema de diseño de Bryan son legítimos
 *     y llevan motivo en comentario, HAR-0024);
 *   - tokens legacy que se están retirando, con su equivalencia en el mensaje,
 *     vía `legacy: { 'text-muted-foreground': 'text-ink-meta', … }`.
 *
 * Mira TODAS las cadenas (Literal y TemplateElement), no solo `className`: los
 * repos guardan clases en tablas de mapeo lejos del JSX. Nombres como
 * `bg-[#fff]` no aparecen en prosa, así que no hay falsos positivos en la práctica.
 *
 * Generalizada desde `personal-os/eslint-rules/legacy-tokens.mjs` (F5 del estándar).
 */
const RE_ARBITRARY_COLOR = /(?<![\w-])(?:bg|text|border|fill|stroke|ring|shadow|from|to|via|outline|decoration|accent|caret|placeholder)-\[(?:#|rgb|hsl|oklch|color\()/;
const RE_ARBITRARY_SIZE = /(?<![\w-])(?:w|h|size|min-w|min-h|max-w|max-h|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|inset|top|right|bottom|left|text|leading|tracking|rounded|translate-x|translate-y)-\[[^\]]*(?:px|rem|em|%|vh|vw|dvh)\]/;

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const noArbitraryTailwind = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohíbe colores arbitrarios (y opcionalmente tamaños) y tokens legacy en clases de Tailwind',
    },
    schema: [
      {
        type: 'object',
        properties: {
          sizes: { type: 'boolean' },
          legacy: { type: 'object', additionalProperties: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      color:
        'Color arbitrario en una clase de Tailwind. Los colores son tokens de globals.css (@theme); si falta uno, añádelo al tema, no al componente.',
      size:
        'Tamaño arbitrario en una clase de Tailwind. Usa la escala (4/8 px) o un token; un valor arbitrario necesita motivo en comentario y `sizes: false` en la regla.',
      legacy: 'Token de diseño retirado: «{{token}}». Usa → {{nuevo}}.',
    },
  },

  create(context) {
    const opts = context.options[0] || {};
    const legacy = opts.legacy || {};
    const names = Object.keys(legacy);
    const reLegacy = names.length
      ? new RegExp(`(?<![\\w-])(${names.map(escapeRe).join('|')})(?![\\w-])`, 'g')
      : null;

    function isImport(node) {
      const p = node.parent;
      return (
        p?.type === 'ImportDeclaration' ||
        p?.type === 'ExportNamedDeclaration' ||
        p?.type === 'ExportAllDeclaration' ||
        (p?.type === 'ImportExpression' && p.source === node)
      );
    }

    function check(node, text) {
      if (RE_ARBITRARY_COLOR.test(text)) context.report({ node, messageId: 'color' });
      if (opts.sizes && RE_ARBITRARY_SIZE.test(text)) context.report({ node, messageId: 'size' });
      if (reLegacy) {
        const seen = new Set();
        for (const m of text.matchAll(reLegacy)) {
          if (seen.has(m[1])) continue;
          seen.add(m[1]);
          context.report({ node, messageId: 'legacy', data: { token: m[1], nuevo: legacy[m[1]] } });
        }
      }
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string' || isImport(node)) return;
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

export default noArbitraryTailwind;

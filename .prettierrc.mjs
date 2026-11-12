/**
 * @type {import('prettier').Options}
 */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: true,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<BUILTIN_MODULES>', // Node.js built-in modules
    '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.
    '', // Empty line
    '^~(.*)$',
    '',
    '^[./]',
  ],
  overrides: [
    // Locale values are always double-quoted so strings with apostrophes,
    // colons or typographic quotes never need a per-line quoting decision.
    { files: '*.yml', options: { singleQuote: false } },
  ],
}

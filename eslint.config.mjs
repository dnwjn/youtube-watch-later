import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['build/**', '.plasmo/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // eslint-plugin-react-hooks is pinned to ^5.2.0 (see package.json) rather
    // than latest: v7's "recommended" config pulls in the new React Compiler
    // rule set, which flags legitimate derived-state effects in button.tsx
    // that would need an architectural rewrite out of scope for this task.
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  eslintConfigPrettier,
)

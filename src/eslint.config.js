import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: true, document: true, console: true, fetch: true, AbortSignal: true, parseInt: true, parseFloat: true, isNaN: true, clearInterval: true, setInterval: true, setTimeout: true },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
    settings: { react: { version: '18' } },
  },
];

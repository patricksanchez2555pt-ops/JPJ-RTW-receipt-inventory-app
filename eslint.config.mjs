import expoConfig from 'eslint-config-expo/flat.js';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';

export default [
  ...expoConfig,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    plugins: {
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      // ─────────────────────────────────────────
      // Unused code
      // ─────────────────────────────────────────

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-imports': 'error',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // ─────────────────────────────────────────
      // TypeScript
      // ─────────────────────────────────────────

      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],

      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],

      // ─────────────────────────────────────────
      // Imports
      // ─────────────────────────────────────────

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // ─────────────────────────────────────────
      // JavaScript
      // ─────────────────────────────────────────

      'no-debugger': 'error',
      'no-alert': 'error',
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // ─────────────────────────────────────────
      // React
      // ─────────────────────────────────────────

      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'warn',
    },
  },

  prettierConfig,
];

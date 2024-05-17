const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: ['@vercel/style-guide/eslint/node', '@vercel/style-guide/eslint/typescript', '@vercel/style-guide/eslint/react'].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  // add rules configurations here
  rules: {
    // 'import/no-default-export': 'off',
    // 'no-console': 'off',
    // '@typescript-eslint/no-unused-vars': 'warn',
    // 'unicorn/filename-case': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // '@typescript-eslint/explicit-function-return-type': 'off',
    // 'import/no-named-as-default-member': 'off',
    // '@typescript-eslint/no-misused-promises': 'off',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/naming-convention': 'off',
    // 'react/function-component-definition': 'off',
    // 'react/no-array-index-key': 'off',
    // '@typescript-eslint/no-unsafe-argument': 'off',
    // 'require-await': 'off',
    // '@typescript-eslint/require-await': 'warn',
    // '@typescript-eslint/no-unsafe-member-access': 'warn',
    // 'react-hooks/exhaustive-deps': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/await-thenable': 'off',
    // '@typescript-eslint/no-confusing-void-expression': 'off',
    // '@typescript-eslint/consistent-type-imports': 'off',
    // '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    // 'jsx-a11y/click-events-have-key-events': 'off',
    // 'jsx-a11y/no-static-element-interactions': 'off',
    // 'jsx-a11y/no-noninteractive-element-interactions': 'off',
    // 'jsx-a11y/tabindex-no-positive': 'off',
    // 'eslint-comments/require-description': 'off',
    // 'react/no-unstable-nested-components': 'off',
    // 'no-nested-ternary': 'off',
    // '@typescript-eslint/no-unsafe-call': 'off',
    // '@typescript-eslint/no-unsafe-return': 'off',
    // '@typescript-eslint/no-unnecessary-condition': 'off',
  },
};

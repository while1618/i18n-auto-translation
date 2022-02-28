module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  rules: {
    'prettier/prettier': 'error',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    'no-console': 'off',
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-underscore-dangle': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    'no-plusplus': 'off',
  },
};

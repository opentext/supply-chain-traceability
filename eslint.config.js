/* eslint-disable import/no-extraneous-dependencies */
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import airbnbBase from 'eslint-config-airbnb-base';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default [
  ...compat.extends(
    'airbnb',
  ),
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      js,
      react,
      'react-hooks': reactHooks,
      airbnbBase,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-loop-func': 'off',
      'no-param-reassign': 'off',
      'no-underscore-dangle': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-inner-declarations': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'no-nested-ternary': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'consistent-return': 'off',
      'no-use-before-define': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-unstable-nested-components': 'off',
      'linebreak-style': ['error', 'windows'],
      'react/require-default-props': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/parsers': {
        espree: ['.js', '.mjs', '.cjs', '.jsx'],
      },
      'import/resolver': {
        node: {
          paths: ['.', 'src'],
        },
      },
    },
  },
];

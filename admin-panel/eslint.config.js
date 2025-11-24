// eslint.config.js  (or .cjs if you prefer)
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  // Ignore build output
  { ignores: ['dist', 'node_modules'] },

  // Recommended base rules
  js.configs.recommended,

  // React + JSX rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect', // auto-detects React version
      },
    },
    rules: {
      // React & Hooks
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // React Refresh (only allow valid exports)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Custom tweaks
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]' }], // ignore React components
      'react/prop-types': 'off', // you're not using PropTypes
      'react/jsx-uses-react': 'off', // not needed with new JSX transform
      'react/react-in-jsx-scope': 'off', // not needed in React 17+
    },
  },
]
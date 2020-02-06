const { readFileSync } = require('fs')
const { join, resolve } = require('path')
/**
 * Helps with using custom eslint rules without creating and publishing as plugin
 */
const rulesDirPlugin = require('eslint-plugin-rulesdir')
rulesDirPlugin.RULES_DIR = join(__dirname, 'scripts/eslint-rules')

const MIT_LICENSE = readFileSync('./LICENSE', 'utf-8')
const LICENSE_HEADER =
  '/**\n' +
  MIT_LICENSE.split('\n')
    .map(line => ` * ${line}`)
    .join('\n') +
  '\n */'

module.exports = {
  env: {
    es6: true,
    browser: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  extends: [
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'prettier/@typescript-eslint',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'babel-eslint',
  plugins: ['standard', 'rulesdir'],
  rules: {
    'no-unused-vars': 'error',
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
    'object-shorthand': 'error',
    'rulesdir/require-license-header': [
      'error',
      {
        license: LICENSE_HEADER
      }
    ],
    'react/prop-types': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/member-delimiter-style': 0
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      /**
       * babel-eslint does not understand some of the typescript features
       * so it's better to use '@typescript-eslint/parser' for .ts files
       */
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
      }
    },
    {
      /**
       * Disable specific rule that are overrided by
       * typescript eslint config on js files
       */
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-empty-function': 0,
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-this-alias': 0,
        'no-var': 0,
        'prefer-const': 0,
        'prefer-rest-params': 0,
        'prefer-spread': 0
      }
    }
  ]
}

const { readFileSync } = require('fs')
const { join } = require('path')
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
    browser: true
  },
  extends: ['plugin:prettier/recommended', 'plugin:react/recommended'],
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
    'react/prop-types': 0
  }
}

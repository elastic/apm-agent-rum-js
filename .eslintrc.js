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
  parser: 'babel-eslint',
  plugins: ['prettier', 'standard', 'rulesdir'],
  rules: {
    'max-len': ['error', { code: 100, ignoreComments: true }],
    'no-unused-vars': 'error',
    'space-before-function-paren': 'error',
    'rulesdir/require-license-header': [
      'error',
      {
        license: LICENSE_HEADER
      }
    ]
  }
}

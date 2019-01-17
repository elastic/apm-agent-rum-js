/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

const assert = require('assert')
const { parse } = require('babel-eslint')

function normalizeWhitespace (string) {
  return string.replace(/\s+/g, ' ')
}

/**
 * Based on ESlint rule from Kibana
 * https://github.com/elastic/kibana/blob/bdf66a4db80bae3207a1ba7d19130ab0a150da71/packages/kbn-eslint-plugin-license-header/rules/require_license_header.js
 */
module.exports = {
  meta: {
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          license: {
            type: 'string'
          }
        },
        additionalProperties: false
      }
    ]
  },
  create: context => {
    return {
      Program () {
        const options = context.options[0] || {}
        const licenseToBeAdded = options.license
        assert(!!licenseToBeAdded, '"license" option is required')

        const parsed = parse(licenseToBeAdded)

        assert(
          !parsed.body.length,
          '"license" option must only include a single comment'
        )
        assert(
          parsed.comments.length === 1,
          '"license" option must only include a single comment'
        )

        const license = {
          source: licenseToBeAdded,
          nodeValue: normalizeWhitespace(parsed.comments[0].value)
        }
        const sourceCode = context.getSourceCode()
        const comment = sourceCode
          .getAllComments()
          .find(node => normalizeWhitespace(node.value) === license.nodeValue)

        // no licence comment
        if (!comment) {
          context.report({
            message: 'File must start with a license header',
            loc: {
              start: { line: 1, column: 0 },
              end: { line: 1, column: sourceCode.lines[0].length - 1 }
            },
            fix (fixer) {
              return fixer.replaceTextRange([0, 0], license.source + '\n\n')
            }
          })
          return
        }

        // ensure there is nothing before the comment
        const sourceBeforeNode = sourceCode
          .getText()
          .slice(0, sourceCode.getIndexFromLoc(comment.loc.start))
        if (sourceBeforeNode.length) {
          context.report({
            node: comment,
            message: 'License header must be at the very beginning of the file',
            fix (fixer) {
              // replace leading whitespace if possible
              if (sourceBeforeNode.trim() === '') {
                return fixer.replaceTextRange([0, sourceBeforeNode.length], '')
              }

              // inject content at top and remove node from current location
              // if removing whitespace is not possible
              return [
                fixer.remove(comment),
                fixer.replaceTextRange([0, 0], license.source + '\n\n')
              ]
            }
          })
        }
      }
    }
  }
}

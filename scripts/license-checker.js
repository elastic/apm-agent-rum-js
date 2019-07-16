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

const { join } = require('path')
const licenseChecker = require('license-checker')

const ROOT_REPO = join(__dirname, '../')
/**
 * For full exhaustive list, We can check the valid licenses list from Kibana
 * https://github.com/elastic/kibana/blob/dc956a0a79a34a46b353f2a0bef5b18be353220f/src/dev/license_checker/config.js#L22
 */
const LICENSE_WHITELIST = [
  'MIT',
  'MIT*',
  'Apache-2.0',
  'Apache License, Version 2.0',
  'Public Domain',
  'ISC',
  'BSD',
  'BSD*',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BSD-3-Clause OR MIT',
  'AFLv2.1',
  '(MIT OR Apache-2.0)',
  '(WTFPL OR MIT)',
  '(MIT OR WTFPL)',
  '(MIT AND Zlib)',
  '(MIT OR CC0-1.0)',
  '(BSD-2-Clause OR MIT OR Apache-2.0)',
  '(MIT AND BSD-3-Clause)',
  'CC0-1.0',
  'CC-BY-3.0',
  'CC-BY-4.0',
  'Unlicense',
  'Artistic-2.0',
  'WTFPL',
  'W3C-20150513'
]

/**
 * Packages that must be ignored during license check
 */
const IGNORE_LIST = ['colors@0.6.2', 'elastic-apm-rum@0.0.0-monorepo']

function generateInvalidMessage(name, path, licenses) {
  return `
  name: ${name}
  path: ${path}
  license: ${licenses}
`
}

function runLicenseChecker() {
  return new Promise((resolve, reject) => {
    licenseChecker.init({ start: ROOT_REPO, json: true }, (err, packages) => {
      if (err) {
        reject(err)
        return
      }
      resolve(packages)
    })
  })
}

;(async function() {
  const packagesList = await runLicenseChecker()
  const errors = []

  for (const packageKey of Object.keys(packagesList)) {
    if (IGNORE_LIST.includes(packageKey)) {
      continue
    }

    let { licenses, path } = packagesList[packageKey]

    if (!Array.isArray(licenses)) {
      licenses = [licenses]
    }

    for (const license of licenses) {
      if (!LICENSE_WHITELIST.includes(license)) {
        errors.push(generateInvalidMessage(packageKey, path, license))
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Non confirming licenses: \n${errors.join('')}`)
  }
})().catch(e => {
  console.error(e)
  process.exit(1)
})

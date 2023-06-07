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

const { version } = require('../packages/rum/package.json')
const fs = require('fs').promises
const path = require('node:path')
const process = require('node:process')

// Script logic
async function main() {
  // Extract major version
  const majorVersion = `${version.split('.')[0]}.x`

  // Generate index file
  const indexTemplate = await fs.readFile(
    path.join(process.cwd(), '.ci/scripts/index.html.template'),
    'utf8'
  )
  const indexContent = indexTemplate.replace(/VERSION/g, majorVersion)
  await fs.writeFile(
    path.join(process.cwd(), 'index.html'),
    indexContent,
    'utf8'
  )

  // Print versions
  console.log(
    JSON.stringify({
      version,
      major_version: majorVersion
    })
  )
}

// Entrypoint
;(async () => {
  try {
    await main()
  } catch (err) {
    console.log(err)
  }
})()

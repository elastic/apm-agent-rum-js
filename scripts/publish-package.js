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

const Command = require('@lerna/command')
const PackageGraph = require('@lerna/package-graph')
const { PublishCommand } = require('@lerna/publish')

const [, , packageName] = process.argv

if (!packageName) {
  throw new Error('Please provide the name of the package to publish')
}

function checkValidPackages(packages) {
  return packages.some(({ name }) => name === packageName)
}

/**
 * We override the Lerna prepration command which takes of
 * building the package graph for publishing packages
 */
Command.prototype.runPreparations = async function() {
  /**
   * List of packages that are present under /packages/ folder
   */
  const packages = await this.project.getPackages()

  if (!checkValidPackages(packages)) {
    const message = `
    Error: Please provide a valid package name

    Valid packages: ${packages.map(pkg => pkg.name).join(', ')}
    `
    console.error(message)
    process.exit(1)
  }

  const filteredPackages = packages.filter(({ name }) => name === packageName)

  this.packageGraph = new PackageGraph(filteredPackages)

  return Promise.resolve()
}

/**
 * Invoking lerna publish command with default configurations from lerna.json
 */
new PublishCommand({})

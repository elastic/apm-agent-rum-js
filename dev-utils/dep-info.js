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
const { readFileSync, writeFileSync, readdirSync } = require('fs')

function getFileContent(directory, filename) {
  var files = readdirSync(directory)
  var licenseFile = files.find(f =>
    f.toLowerCase().startsWith(filename.toLowerCase())
  )
  if (licenseFile) {
    var license = readFileSync(join(directory, licenseFile), 'utf8')
    return license
  }
}

function generateDependencyInfo(deps, modulesPath) {
  var allLicenses = []
  deps.forEach(d => {
    var modulePath = join(modulesPath, d)
    var license = getFileContent(modulePath, 'LICENSE') || rootLicense
    var dep = {
      name: d
    }
    if (license) {
      dep.license = license
    }

    var notice = getFileContent(modulePath, 'NOTICE')
    if (notice) {
      dep.notice = notice
    }
    allLicenses.push(dep)
  })
  return allLicenses
}

function getInternalPackageNames(packageList, packagesDir) {
  const internalPackages = []
  for (const packageName of packageList) {
    const packageDir = join(packagesDir, packageName)
    const { name } = JSON.parse(
      readFileSync(join(packageDir, 'package.json'), 'utf8')
    )

    internalPackages.push(name)
  }

  return internalPackages
}

function generateNotice(rootDir = '../', packagesDir = 'packages') {
  /**
   * Resolve in context of the file
   */
  rootDir = join(__dirname, rootDir)
  packagesDir = join(rootDir, packagesDir)

  const packageList = readdirSync(packagesDir).reverse()

  const internalPackages = getInternalPackageNames(packageList, packagesDir)

  for (const packageName of packageList) {
    const packageDir = join(packagesDir, packageName)
    const { dependencies = {}, name } = JSON.parse(
      readFileSync(join(packageDir, 'package.json'), 'utf8')
    )
    /**
     * For internal packages, we use the root level license info
     * instead of package level
     */
    let rootLicense = ''
    if (internalPackages.indexOf(name) > -1) {
      rootLicense = getFileContent(rootDir, 'LICENSE')
    }

    const depInfo = generateDependencyInfo(
      Object.keys(dependencies),
      join(packageDir, 'node_modules'),
      rootLicense
    )
    let allLicenses = `
${name}
Copyright (c) 2017-present, Elasticsearch BV

`
    depInfo.forEach(d => {
      if (d.license || d.notice) {
        allLicenses += `
---
This product relies on ${d.name}

${d.license ? d.license : ''}

${d.notice ? d.notice : ''}`
      }
    })
    writeFileSync(join(packageDir, './NOTICE.txt'), allLicenses)
  }
}

module.exports = {
  generateDependencyInfo,
  generateNotice
}

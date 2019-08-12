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

const ROOT_DIR = join(__dirname, '../')
const ROOT_NODE_MODULES = join(ROOT_DIR, 'node_modules')

function safeReadDirSync(directory) {
  let files = []
  try {
    files = readdirSync(directory)
  } catch (_) {}
  return files
}

function getFileContent(directory, filename) {
  const files = safeReadDirSync(directory)

  const file = files.find(f =>
    f.toLowerCase().startsWith(filename.toLowerCase())
  )
  let content
  if (file) {
    content = readFileSync(join(directory, file), 'utf8')
  }
  return content
}

function generateDependencyInfo(deps, modulesPath, pkgNames) {
  var allLicenses = []
  deps.forEach(d => {
    const depModulesPath = join(modulesPath, d)
    const rootModulesPath = join(ROOT_NODE_MODULES, d)

    const dep = { name: d }

    let license
    /**
     * If dependency is one of the internal package itself,
     * we use the root level license info instead of package level
     */
    if (pkgNames.includes(d)) {
      license = getFileContent(ROOT_DIR, 'LICENSE')
    } else {
      /**
       * Search for both dep/node_modules and root/node_modules
       * since dep node modules might be hoisted
       */
      license =
        getFileContent(rootModulesPath, 'LICENSE') ||
        getFileContent(depModulesPath, 'LICENSE')
    }

    if (license) {
      dep.license = license
    }

    const notice =
      getFileContent(rootModulesPath, 'NOTICE') ||
      getFileContent(depModulesPath, 'NOTICE')
    if (notice) {
      dep.notice = notice
    }
    allLicenses.push(dep)
  })
  return allLicenses
}

function getDependencies(pkgName) {
  const packageDir = join(ROOT_NODE_MODULES, pkgName)
  const { dependencies = {} } = JSON.parse(
    readFileSync(join(packageDir, 'package.json'), 'utf8')
  )
  return dependencies
}

function updateScoreAtEachDep(score, pkgName, pkgNames) {
  const dependencies = getDependencies(pkgName)

  Object.keys(dependencies).forEach(dep => {
    if (pkgNames.includes(dep)) {
      updateScoreAtEachDep(score, dep, pkgNames)
      score[pkgName] = 1 + score[dep]
    }
  })

  return score
}

function sortPackagesByScore(pkgNames) {
  const score = {}
  pkgNames.forEach(pkg => {
    score[pkg] = 0
  })
  for (const pkgName of pkgNames) {
    updateScoreAtEachDep(score, pkgName, pkgNames)
  }
  return Object.keys(score).sort((a, b) => score[a] > score[b])
}

function mapPkgFolderToDeps(packagesDir) {
  const packageList = readdirSync(packagesDir)
  const pkgMap = {}

  packageList.forEach(pkgName => {
    const packageDir = join(packagesDir, pkgName)
    const { name } = JSON.parse(
      readFileSync(join(packageDir, 'package.json'), 'utf8')
    )
    pkgMap[name] = pkgName
  })
  return pkgMap
}

function generateNotice(packagesDir = 'packages') {
  packagesDir = join(ROOT_DIR, packagesDir)

  const pkgMap = mapPkgFolderToDeps(packagesDir)

  const sortedPkgNames = sortPackagesByScore(Object.keys(pkgMap))

  for (const pkgName of sortedPkgNames) {
    const dependencies = getDependencies(pkgName)
    const pkgFolderDir = join(packagesDir, pkgMap[pkgName])

    const depInfo = generateDependencyInfo(
      Object.keys(dependencies),
      join(pkgFolderDir, 'node_modules'),
      sortedPkgNames
    )
    let allLicenses = `
${pkgName}
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
    writeFileSync(join(pkgFolderDir, './NOTICE.txt'), allLicenses)
  }
  console.log('NOTICE.txt file is generated for all packages')
}

module.exports = {
  generateDependencyInfo,
  generateNotice
}

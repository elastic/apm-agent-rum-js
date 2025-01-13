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

import * as process from 'node:process'
import fetch from 'node-fetch'
import { execa } from 'execa'
import { appendFile } from 'node:fs/promises'
import * as path from 'node:path'

function raiseError(msg) {
  console.log(msg)
  process.exit(1)
}

async function gitContext() {
  try {
    const { stdout: username } = await execa('git', ['config', 'user.name'])
    const { stdout: email } = await execa('git', ['config', 'user.email'])
    return {
      username,
      email
    }
  } catch (err) {
    raiseError('Failed to extract git context')
  }
}

// Script logic
async function main() {
  const isDryRun =
    process.env.DRY_RUN == null || process.env.DRY_RUN !== 'false'

  // Extract git context
  const ctx = await gitContext()
  console.log(`Git User: username=${ctx.username}, email=${ctx.email}`)

  if (isDryRun) {
    await dryRunMode()
  } else {
    await prodMode()
  }
}

async function dryRunMode() {
  console.log('Running in dry-run mode')

  const registryUrl = process.env.REGISTRY_URL || 'http://localhost:4873'
  console.log(`Checking local registry url: ${registryUrl}`)
  try {
    await fetch(registryUrl)
  } catch (err) {
    raiseError("The local registry isn't available")
  }

  try {
    // Ref: https://github.com/npm/npm-registry-client/blob/856eefea40a2a88618835978e281300e3406924b/lib/adduser.js#L63-L68
    const response = await fetch(
      `${registryUrl}/-/user/org.couchdb.user:test`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'test',
          password: 'test',
          email: 'test@elastic.co'
        })
      }
    )

    let npmrcData = 'registry=http://localhost:4873\n'
    if (response.status === 201) {
      const { token: token } = await response.json()
      npmrcData += `//localhost:4873/:_authToken=${token}\n`
    } else {
      raiseError('Failed to add user to private registry')
    }

    await appendFile(path.join(process.cwd(), '.npmrc'), '\n' + npmrcData)
  } catch (err) {
    raiseError('Failed to login to private registry')
  }

  try {
    await execa(
      'npx',
      ['lerna', 'publish', 'from-package', `--registry=${registryUrl}`, '--no-push', '--no-git-tag-version', '--no-changelog', '--yes'],
      { stdin: process.stdin }
    )
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to publish npm packages')
  }

  await execa('git', ['diff', process.cwd()])
    .pipeStdout(process.stdout)
    .pipeStderr(process.stderr)

  await execa('git', ['log', '-1', '--stat', process.cwd()])
    .pipeStdout(process.stdout)
    .pipeStderr(process.stderr)
}

async function prodMode() {
  console.log('Running in prod mode')

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken == null || githubToken === '') {
    raiseError("The 'GITHUB_TOKEN' env var isn't defined")
  }

  try {
    await execa('npx',
      ['lerna', 'publish', 'from-package', '--no-push', '--no-git-tag-version', '--no-changelog', '--yes'],
      { stdin: process.stdin}
    )
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to publish npm packages')
  }

  try {
    await execa('npm', ['run', 'github-release'], {
      stdin: process.stdin,
      env: {
        GITHUB_TOKEN: githubToken
      }
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to publish github release')
  }
}

// Entrypoint
;(async () => {
  try {
    await main()
  } catch (err) {
    raiseError(err)
  }
})()

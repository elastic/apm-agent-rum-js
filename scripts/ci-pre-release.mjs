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

import { execa } from 'execa'
import * as process from 'node:process'
// To read the version then use https://nodejs.org/api/esm.html#no-require-exports-or-moduleexports
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { version } = require('../packages/rum/package.json')

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

// Script logic
async function dryRunMode() {
  console.log('Running in dry-run mode')

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken == null || githubToken === '') {
    raiseError("The 'GITHUB_TOKEN' env var isn't defined")
  }

  const branch = `prerelease/${version}-next`

  try {
    await execa('git', ['checkout', '-b', branch], {
      stdin: process.stdin
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to create git branch')
  }

  try {
    await execa('npx', ['lerna', 'version', '--yes', '--no-push'], {
      stdin: process.stdin,
      env: {
        GH_TOKEN: githubToken
      }
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to version npm')
  }

  try {
    await execa('git', ['--no-pager', 'diff', 'HEAD~1'], {
      stdin: process.stdin
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to git diff')
  }
}

async function prodMode() {
  console.log('Running in prod mode')

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken == null || githubToken === '') {
    raiseError("The 'GITHUB_TOKEN' env var isn't defined")
  }

  const branch = `prerelease/${version}-next`

  try {
    await execa('git', ['checkout', '-b', branch], {
      stdin: process.stdin
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to create git branch')
  }

  try {
    await execa('npx', ['lerna', 'version', '--yes', '--no-push'], {
      stdin: process.stdin,
      env: {
        GH_TOKEN: githubToken
      }
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to version npm')
  }

  // As long as lerna version uses --no-push then it's required to push the commits
  // this will avoid pushing the git tag too.
  try {
    await execa('git', ['push', 'origin', branch], {
      stdin: process.stdin
    })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to push git branch')
  }

  try {
    await execa('gh', ['pr', 'create', '--fill-first', '--head', branch], {
      stdin: process.stdin,
      env: {
        GH_TOKEN: githubToken
      }
    })
      .pipeStdout('.pr.txt')
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to create GitHub PR')
  }
}

// Entrypoint
;(async () => {
  try {
    await main()
  } catch (err) {
    console.log(err)
  }
})()

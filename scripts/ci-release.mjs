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
import { execa } from 'execa'

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
  
  try {
    const { stdout, stderr } = await execa('npx',
      ['lerna', 'publish', 'from-package', '--no-push', '--no-git-tag-version', '--no-changelog'],
      {
        // Respond 'No' to Lerna's prompt "Are you sure you want to publish these packages? (ynh)""
        input: 'n',
        // and telling "no" makes the command fail, we expect that error
        reject: false
      }
    )

    // If OK lerna will say print in stdout a message like
    // "Found 5 packages to publish"
    const match = stdout.match(/Found (\d+) packages to publish/)
    if (match) {
      console.log(stdout)
    } else {
      throw new Error(stderr)
    }
  } catch (err) {
    raiseError('Unexpected error while publishing npm packages in dryRun mode')
  }
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
      { stdin: process.stdin }
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

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
import * as fs from 'fs'

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

}

async function prodMode() {
  console.log('Running in prod mode')

  const githubToken = process.env.GITHUB_TOKEN
  if (githubToken == null || githubToken === '') {
    raiseError("The 'GITHUB_TOKEN' env var isn't defined")
  }

  try {

    console.log(` > List lerna versions`)

    await execa('npx',
      ['lerna', 'list', '-l', '--json'],
      { stdin: process.stdin }
    )
      .pipeStdout('lerna-list.txt')
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to list the current lerna versions')
  }

  // Use lerna list to know the current versions to tag
  // all the components, if needed, using the sha commit for the
  // module @elastic/apm-rum-core
  try {
    // Read the lerna list output and generate the data structure
    // name@version
    let rawData = fs.readFileSync('lerna-list.txt', 'utf8')
    let jsonData = JSON.parse(rawData)
    let core
    var ids = []
    jsonData.forEach(element => {
      if (element.name != '@elastic/apm-rum-core') {
        ids.push(`${element.name}@${element.version}`)
      } else {
        core = `${element.name}@${element.version}`
      }
    })

    // The existing release automation is not tagging the core module
    // this was intentionally changed to support the new release automation of
    // reviewing the changes and then raising a PR to bump the version.
    // As a consequence, the tags need to be created explicitly rather than
    // with the lerna automation.
    // Let's tag the core module if it's not tagged yet.
    try {
      console.log(` >> Get sha commit for ${core} and check if it's tagged already.`)
      const {stdout} = await execa('git', ['rev-list', '-n', '1', `${core}`], { stdin: process.stdin })
        .pipeStderr(process.stderr)
      console.log(` >> ${core} = ${stdout}`)
    } catch (err) {
      console.log(` >> ${core} has not been tagged yet. Let's tag it now.`)
      // otherwise tag, if something bad then this is a genuine error.
      execa('git', ['tag', `${core}`], { stdin: process.stdin })
        .pipeStdout(process.stdout)
        .pipeStderr(process.stderr)
    }

    console.log(` >> Get sha commit for ${core}`)
    // Get the sha commit for core, if something bad then this is a genuine error.
    const {stdout} = await execa('git', ['rev-list', '-n', '1', `${core}`], { stdin: process.stdin })
      .pipeStderr(process.stderr)
    console.log(` >> ${core} = ${stdout}`)

    // Checkout the commit, if something bad then this is a genuine error.
    await execa('git', ['checkout', `${stdout}`], { stdin: process.stdin })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)

    ids.forEach(tag => {
      // if it's already a tag then say that!
      try {
        execa('git', ['rev-parse', `${tag}`], { stdin: process.stdin })
          .pipeStdout(process.stdout)
          .pipeStderr(process.stderr)
        console.log(` >> ${tag} already exists. There is no need to tag it`)
      } catch (err) {
        console.log(` >> ${tag} does not exist.`)
        // otherwise retag, if something bad then this is a genuine error.
        execa('git', ['tag', `${tag}`], { stdin: process.stdin })
          .pipeStdout(process.stdout)
          .pipeStderr(process.stderr)
      }
    })

    // and push the tags, if something bad then this is a genuine error.
    await execa('git', ['push', '--tags'], { stdin: process.stdin })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    console.log(`${err}`)
    raiseError('Failed to tag all the versions.')
  }

  // and push the tags, if something bad then this is a genuine error.
  try {
    await execa('git', ['push', '--tags'], { stdin: process.stdin })
      .pipeStdout(process.stdout)
      .pipeStderr(process.stderr)
  } catch (err) {
    raiseError('Failed to push the tags. You might need to retag it manually.')
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

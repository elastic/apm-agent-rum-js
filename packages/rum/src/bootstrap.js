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
const {
  isPlatformSupported
} = require('@elastic/apm-rum-core/src/common/utils')
const { patchAll } = require('@elastic/apm-rum-core/src/common/patching')
const { polyfill } = require('es6-promise')
const {
  ApmServer,
  ErrorLogging,
  Config,
  Logger,
  TransactionService,
  PerformanceMonitoring
} = require('@elastic/apm-rum-core')

let enabled = false

/**
 * IIFE to polyfill for the supported platforms
 */
!(function() {
  if (isPlatformSupported()) {
    polyfill()
    patchAll()
    enabled = true
  } else {
    console.warn('APM: Platform is not supported!')
  }
})()

/**
 * Set up all the essential singleton instances required
 * across all the core API
 */
const logger = new Logger()
const config = new Config()
const server = new ApmServer(config, logger)
const transactionService = new TransactionService(logger, config)
const performance = new PerformanceMonitoring(
  server,
  config,
  logger,
  transactionService
)
const errorLogger = new ErrorLogging(server, config, logger, transactionService)

module.exports = {
  enabled,
  logger,
  config,
  server,
  transactionService,
  performance,
  errorLogger
}

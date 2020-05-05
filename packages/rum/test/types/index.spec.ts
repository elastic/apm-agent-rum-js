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

import { ApmBase, init } from '@elastic/apm-rum'

const config: AgentConfigOptions = {
  active: true,
  logLevel: 'info',
  distributedTracing: true,
  disableInstrumentations: ['xmlhttprequest', 'page-load']
}

/** APM Base */
const apmBase = init(config)

apmBase.addLabels({})

// dummy service factory
const serviceFactory = {
  instances: {},
  getService(name: string) {
    return name
  }
}

const apm = new ApmBase(serviceFactory, false)

apm.init(config)

apm.observe('transaction:start', transaction => {
  transaction.addLabels({
    test: 'test'
  })
})

apm.observe('transaction:end', transaction => {
  const taskId = transaction.addTask('2')
  transaction.removeTask(taskId)
})

apm.setUserContext({
  id: 'id',
  username: 'user',
  email: 'email'
})

apm.setCustomContext({
  foo: 'bar',
  bar: {
    baz: 2
  }
})

apm.addLabels({
  foo: 'bar',
  bar: 'baz'
})

const filter1 = (payload: any) => {
  return payload
}
const filter2 = () => false
const filter3 = () => undefined

apm.addFilter(filter1)
apm.addFilter(filter2)
apm.addFilter(filter3)

apm.startTransaction('test', 'page-load', {
  startTime: 0
})
apm.startTransaction(null, null)
apm.startTransaction(undefined, undefined, {
  startTime: 1
})

apm.startSpan('test', 'custom', {
  sync: false
})
apm.startSpan(null, null)
apm.startSpan(undefined, undefined, {
  sync: true
})

/** Transaction */
const transaction = apm.getCurrentTransaction()

if (transaction) {
  transaction.addLabels({})
  const taskId = transaction.addTask('test')
  transaction.removeTask(taskId)
  transaction.end(20)
  transaction.mark('event')
  transaction.captureBreakdown()
  transaction.isFinished()
}

/** Span */
const span = apm.startSpan('span', 'span')

if (span) {
  span.name
  span.type
  span.addLabels({
    test: 'foo'
  })
  span.addContext({
    test: {
      foo: '1',
      bar: 2
    }
  })
  span.end()
  span.duration()
}

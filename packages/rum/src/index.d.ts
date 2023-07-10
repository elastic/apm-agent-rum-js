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

declare module '@elastic/apm-rum' {
  export class Span extends BaseSpan {
    sync?: boolean
  }
  export class Transaction extends BaseSpan {
    startSpan(
      name?: string | null,
      type?: string | null,
      options?: SpanOptions
    ): Span | undefined
    mark(key: string): void
    /**
     * undocumented, might be removed in future versions
     */
    addTask(taskId: TaskId): TaskId
    /**
     * undocumented, might be removed in future versions
     */
    removeTask(taskId: TaskId): void
    /**
     * undocumented, might be removed in future versions
     */
    captureBreakdown(): void
    /**
     * undocumented, might be removed in future versions
     */
    isFinished(): boolean
  }
  export interface SpanOptions {
    /**
     * undocumented, might be removed in future versions
     */
    startTime?: number
    blocking?: boolean
    parentId?: string | number
    sync?: boolean
  }
  export interface TransactionOptions {
    managed?: boolean
    /**
     * undocumented, might be removed in future versions
     */
    startTime?: number
    /**
     * undocumented, might be removed in future versions
     */
    canReuse?: boolean
  }
  export interface AgentConfigOptions {
    apiVersion?: 2 | 3
    serviceName?: string
    serverUrl?: string
    serverUrlPrefix?: string
    serviceVersion?: string
    active?: boolean
    instrument?: boolean
    disableInstrumentations?: Array<InstrumentationTypes>
    environment?: string
    logLevel?: LogLevel
    breakdownMetrics?: boolean
    flushInterval?: number
    pageLoadTraceId?: string
    pageLoadSampled?: boolean
    pageLoadSpanId?: string
    pageLoadTransactionName?: string
    distributedTracing?: boolean
    distributedTracingOrigins?: Array<string | RegExp>
    errorThrottleLimit?: number
    errorThrottleInterval?: number
    transactionThrottleLimit?: number
    transactionThrottleInterval?: number
    transactionSampleRate?: number
    centralConfig?: boolean
    ignoreTransactions?: Array<string | RegExp>
    propagateTracestate?: boolean
    eventsLimit?: number
    queueLimit?: number
    sendCredentials?: boolean
    apmRequest?: (requestParams: {
      xhr: XMLHttpRequest
      url: string
      method: string
      payload?: string
      headers?: Record<string, string>
    }) => boolean
  }

  type Init = (options?: AgentConfigOptions) => ApmBase
  const init: Init

  class ApmBase {
    /**
     * undocumented, might be removed in future versions
     */
    serviceFactory: ServiceFactory
    constructor(serviceFactory: ServiceFactory, disable: boolean)
    init: Init
    /**
     * undocumented, might be removed in future versions
     */
    isEnabled(): boolean
    isActive(): boolean
    observe(name: TransactionEvents, callback: (tr: Transaction) => void): void
    config(config: AgentConfigOptions): void
    setUserContext(user: UserObject): void
    setCustomContext(custom: object): void
    addLabels(labels: Labels): void
    setInitialPageLoadName(name: string): void
    startTransaction(
      name?: string | null,
      type?: string | null,
      options?: TransactionOptions
    ): Transaction | undefined
    startSpan(
      name?: string | null,
      type?: string | null,
      options?: SpanOptions
    ): Span | undefined
    getCurrentTransaction(): Transaction | undefined
    captureError(error: Error | string): void
    addFilter(fn: FilterFn): void
  }
  const apmBase: ApmBase
  export default init
  export { init, apmBase, ApmBase, apmBase as apm }
}

declare class BaseSpan {
  name: string
  type: string

  addLabels(labels: Labels): void
  /**
   * undocumented, might be removed in future versions
   */
  addContext(context: object): void
  end(endTime?: number): void
  duration(): number | null
}

interface UserObject {
  id?: string | number
  username?: string
  email?: string
}

interface Labels {
  [key: string]: LabelValue
}

/**
 * TODO: Will be imported from @elastic/apm-rum-core typings
 * once available
 */
interface ServiceFactory {
  instances: { [key: string]: any }
  getService: (name: string) => any
}

type FilterFn = (payload: Payload) => Payload | boolean | void
type Payload = { [key: string]: any }

type TaskId = string | number
type LabelValue = string | number | boolean
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error'
type TransactionEvents = 'transaction:start' | 'transaction:end'
type InstrumentationTypes =
  | 'page-load'
  | 'eventtarget'
  | 'click'
  | 'error'
  | 'history'
  | 'fetch'
  | 'xmlhttprequest'

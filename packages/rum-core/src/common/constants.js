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

/**
 * Task States
 */
const SCHEDULE = 'schedule'
const INVOKE = 'invoke'
const CLEAR = 'clear'

/**
 * Event listener methods
 */
const ADD_EVENT_LISTENER_STR = 'addEventListener'
const REMOVE_EVENT_LISTENER_STR = 'removeEventListener'

/**
 * Resource Timing initiator types that will be captured as spans
 */
const RESOURCE_INITIATOR_TYPES = [
  'link',
  'css',
  'script',
  'img',
  'xmlhttprequest',
  'fetch',
  'beacon',
  'iframe'
]

/**
 * The amount of time it is allowed for a transaction to be reused in another startTransaction
 */
const REUSABILITY_THRESHOLD = 5000

/**
 * Maximum duration of the span that is used to decide if the span is valid - 300 secs / 5 mins
 */
const MAX_SPAN_DURATION = 5 * 60 * 1000

/**
 * Transaction & Span - Name & Types
 */
const PAGE_LOAD = 'page-load'
const ROUTE_CHANGE = 'route-change'
const TYPE_CUSTOM = 'custom'
const HTTP_REQUEST_TYPE = 'http-request'
const TEMPORARY_TYPE = 'temporary'
const NAME_UNKNOWN = 'Unknown'

/**
 * Check only for long tasks that are more than 60ms
 */
const USER_TIMING_THRESHOLD = 60

/**
 * Events - to be consumed by the users
 */
const TRANSACTION_START = 'transaction:start'
const TRANSACTION_END = 'transaction:end'

/**
 * Internal Events
 */
const CONFIG_CHANGE = 'config:change'

/**
 * Events types that are used to toggle auto instrumentations
 */
const XMLHTTPREQUEST = 'xmlhttprequest'
const FETCH = 'fetch'
const HISTORY = 'history'
const ERROR = 'error'

/**
 * Event modifiers, append these to event names.
 */
const BEFORE_EVENT = ':before'
const AFTER_EVENT = ':after'

/**
 * Local Config Key used storing the remote config in the localStorage
 */
const LOCAL_CONFIG_KEY = 'elastic_apm_config'

/**
 * Default configs used on top of extensible configs from ConfigService
 */
const KEYWORD_LIMIT = 1024
const SERVER_URL_PREFIX = '/intake/v2/rum/events'
const BROWSER_RESPONSIVENESS_INTERVAL = 500
const BROWSER_RESPONSIVENESS_BUFFER = 3
const SIMILAR_SPAN_TO_TRANSACTION_RATIO = 0.05

export {
  SCHEDULE,
  INVOKE,
  CLEAR,
  ADD_EVENT_LISTENER_STR,
  REMOVE_EVENT_LISTENER_STR,
  RESOURCE_INITIATOR_TYPES,
  REUSABILITY_THRESHOLD,
  MAX_SPAN_DURATION,
  PAGE_LOAD,
  ROUTE_CHANGE,
  NAME_UNKNOWN,
  TYPE_CUSTOM,
  USER_TIMING_THRESHOLD,
  TRANSACTION_START,
  TRANSACTION_END,
  CONFIG_CHANGE,
  XMLHTTPREQUEST,
  FETCH,
  HISTORY,
  ERROR,
  BEFORE_EVENT,
  AFTER_EVENT,
  LOCAL_CONFIG_KEY,
  HTTP_REQUEST_TYPE,
  KEYWORD_LIMIT,
  SERVER_URL_PREFIX,
  BROWSER_RESPONSIVENESS_INTERVAL,
  BROWSER_RESPONSIVENESS_BUFFER,
  SIMILAR_SPAN_TO_TRANSACTION_RATIO,
  TEMPORARY_TYPE
}

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
const USER_INTERACTION = 'user-interaction'
const HTTP_REQUEST_TYPE = 'http-request'
const TEMPORARY_TYPE = 'temporary'
const NAME_UNKNOWN = 'Unknown'

const TRANSACTION_TYPE_ORDER = [
  PAGE_LOAD,
  ROUTE_CHANGE,
  USER_INTERACTION,
  HTTP_REQUEST_TYPE,
  TYPE_CUSTOM,
  TEMPORARY_TYPE
]

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
const EVENT_TARGET = 'eventtarget'
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
 * List of entry types that could be observed by the PerformaneObserver Interface
 * or can be captured via Performance Timeline API
 */
const LONG_TASK = 'longtask'
const PAINT = 'paint'
const MEASURE = 'measure'
const NAVIGATION = 'navigation'
const RESOURCE = 'resource'
const FIRST_CONTENTFUL_PAINT = 'first-contentful-paint'
const LARGEST_CONTENTFUL_PAINT = 'largest-contentful-paint'
const FIRST_INPUT = 'first-input'
const LAYOUT_SHIFT = 'layout-shift'

/**
 * Event types sent to APM Server on the queue
 */
const ERRORS = 'errors'
const TRANSACTIONS = 'transactions'

/**
 * Services
 */
const CONFIG_SERVICE = 'ConfigService'
const LOGGING_SERVICE = 'LoggingService'
const APM_SERVER = 'ApmServer'

/**
 * Truncated spans are associated with this type information
 */
const TRUNCATED_TYPE = '.truncated'

/**
 * Default configs used on top of extensible configs from ConfigService
 */
const KEYWORD_LIMIT = 1024

export {
  SCHEDULE,
  INVOKE,
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
  EVENT_TARGET,
  ERROR,
  BEFORE_EVENT,
  AFTER_EVENT,
  LOCAL_CONFIG_KEY,
  HTTP_REQUEST_TYPE,
  LONG_TASK,
  PAINT,
  MEASURE,
  NAVIGATION,
  RESOURCE,
  FIRST_CONTENTFUL_PAINT,
  LARGEST_CONTENTFUL_PAINT,
  KEYWORD_LIMIT,
  TEMPORARY_TYPE,
  USER_INTERACTION,
  TRANSACTION_TYPE_ORDER,
  ERRORS,
  TRANSACTIONS,
  CONFIG_SERVICE,
  LOGGING_SERVICE,
  APM_SERVER,
  TRUNCATED_TYPE,
  FIRST_INPUT,
  LAYOUT_SHIFT
}

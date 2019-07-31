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
const NAME_UNKNOWN = 'Unknown'
const TYPE_CUSTOM = 'custom'

/**
 * Check only for long tasks that are more than 60ms
 */
const USER_TIMING_THRESHOLD = 60

/**
 * Others
 */
const KEYWORD_LIMIT = 1024

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
  NAME_UNKNOWN,
  TYPE_CUSTOM,
  USER_TIMING_THRESHOLD,
  KEYWORD_LIMIT,
  TRANSACTION_START,
  TRANSACTION_END,
  CONFIG_CHANGE,
  XMLHTTPREQUEST,
  FETCH,
  HISTORY,
  ERROR,
  BEFORE_EVENT,
  AFTER_EVENT
}

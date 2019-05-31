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
 * Request Sources
 */
const FETCH_SOURCE = 'fetch'
const XMLHTTPREQUEST_SOURCE = 'XMLHttpRequest.send'

/**
 * History sources
 */
const HISTORY_PUSHSTATE = 'history.pushState'

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
const REUSABILITY_THRESHOLD = 10000

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
 * Others
 */
const KEYWORD_LIMIT = 1024

export {
  SCHEDULE,
  INVOKE,
  CLEAR,
  FETCH_SOURCE,
  XMLHTTPREQUEST_SOURCE,
  ADD_EVENT_LISTENER_STR,
  REMOVE_EVENT_LISTENER_STR,
  RESOURCE_INITIATOR_TYPES,
  HISTORY_PUSHSTATE,
  REUSABILITY_THRESHOLD,
  MAX_SPAN_DURATION,
  PAGE_LOAD,
  NAME_UNKNOWN,
  TYPE_CUSTOM,
  KEYWORD_LIMIT
}

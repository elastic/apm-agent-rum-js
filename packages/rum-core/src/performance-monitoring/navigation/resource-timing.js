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

import { stripQueryStringFromUrl } from '../../common/utils'
import { shouldCreateSpan } from './utils'
import { RESOURCE_INITIATOR_TYPES } from '../../common/constants'
import Span from '../span'

function createResourceTimingSpan(resourceTimingEntry) {
  const { name, initiatorType, startTime, responseEnd } = resourceTimingEntry
  let kind = 'resource'
  if (initiatorType) {
    kind += '.' + initiatorType
  }
  const spanName = stripQueryStringFromUrl(name)
  const span = new Span(spanName, kind)

  span._start = startTime
  span.end(responseEnd, { url: name, entry: resourceTimingEntry })
  return span
}

/**
 * Checks if the span is already captured via XHR/Fetch patch by
 * comparing the given resource startTime(fetchStart) aganist the
 * patch code execution time.
 */
function isCapturedByPatching(resourceStartTime, requestPatchTime) {
  return requestPatchTime != null && resourceStartTime > requestPatchTime
}

/**
 * Check if the given url matches APM Server's Intake
 * API endpoint and ignore it from Spans
 */
function isIntakeAPIEndpoint(url) {
  return /intake\/v\d+\/rum\/events/.test(url)
}

function createResourceTimingSpans(entries, requestPatchTime, trStart, trEnd) {
  const spans = []
  for (let i = 0; i < entries.length; i++) {
    const { initiatorType, name, startTime, responseEnd } = entries[i]
    /**
     * Skip span creation if initiatorType is other than known types specified as part of RESOURCE_INITIATOR_TYPES
     * The reason being, there are other types like embed, video, audio, navigation etc
     *
     * Check the below webplatform test to know more
     * https://github.com/web-platform-tests/wpt/blob/b0020d5df18998609b38786878f7a0b92cc680aa/resource-timing/resource_initiator_types.html#L93
     */
    if (
      RESOURCE_INITIATOR_TYPES.indexOf(initiatorType) === -1 ||
      name == null
    ) {
      continue
    }

    /**
     * Create Spans for API calls (XHR, Fetch) only if its not captured by the patch
     *
     * This would happen if our agent is downlaoded asyncrhonously and page does
     * API requests before the agent patches the required modules.
     */
    if (
      (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch') &&
      (isIntakeAPIEndpoint(name) ||
        isCapturedByPatching(startTime, requestPatchTime))
    ) {
      continue
    }

    if (shouldCreateSpan(startTime, responseEnd, trStart, trEnd)) {
      spans.push(createResourceTimingSpan(entries[i]))
    }
  }
  return spans
}

export { createResourceTimingSpans }

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

import { EVENT, FIRST_INPUT } from '../../../common/constants'
import { isPerfInteractionCountSupported } from '../../../common/utils'
import { PerfEntryRecorder } from '../metrics'

// Threshold recommended by Google
const INP_THRESHOLD = 40

// The Google guideline is just to track the 10 longest interactions as INP candidates
const MAX_INTERACTIONS_TO_CONSIDER = 10

export const inpState = {
  minInteractionId: Infinity,
  maxInteractionId: 0,
  interactionCount: 0,
  longestInteractions: []
}

/**
 * Observes Event Timing API entries
 */
export function observeUserInteractions(
  recorder = new PerfEntryRecorder(processUserInteractions)
) {
  const isPerfCountSupported = isPerfInteractionCountSupported()
  /**
   * We set the lowest threshold (16) supported by browsers
   * this way we can estimate the total number of different user interactions which is essential to calculate P98, among other things.
   * Once browsers start exposing the `performance.interactionCount` property the
   * threshold will be 40, which is the value Google recommends as the default threshold
   * https://github.com/GoogleChrome/web-vitals/blob/3806160ffbc93c3c4abf210a167b81228172b31c/src/onINP.ts#L203
   */
  const durationThreshold = isPerfCountSupported ? INP_THRESHOLD : 16 // lowest threshold supported by browsers

  recorder.start(EVENT, {
    buffered: true,
    durationThreshold
  })
  /**
   * first-input is also taken into consideration for calculating INP.
   * Currently, there is a bug in Chrome which causes the first-input entry to have interactionId set to 0
   * After internal investigation it has been found that only the ones triggered by a `pointerdown`
   * have a valid interactionId. Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=1325826
   * This is not particularly important given that the only usage for first-input is to be an "extra"
   * detector that checks if there has been a interaction with a duration less than 16ms.
   * Once `performance.interactionCount` is exposed, this logic will not be useful anymore
   */
  if (!isPerfCountSupported) {
    recorder.start(FIRST_INPUT)
  }
}

/*
   Processes the observed user interactions for INP purposes
 */
export function processUserInteractions(list) {
  const entries = list.getEntries()
  entries.forEach(entry => {
    // Only entries with interactionId should be considered to calculate INP
    if (!entry.interactionId) {
      return
    }

    // All reported entries should be taken into account to estimate the total number of different interactions
    updateInteractionCount(entry)

    /**
     * The duration can be lower than the recommended threshold because
     * the observer will report events with durations >= 16 until browsers expose `performance.interactionCount`
     * and the reason we don't store it is because the default Google's approach is to report as 0
     * the INP if the slower duration is less than 40
     * which is well below the recommended threshold.
     */
    if (entry.duration < INP_THRESHOLD) {
      return
    }

    storeUserInteraction(entry)
  })
}

export function calculateInp() {
  if (inpState.longestInteractions.length === 0) {
    /**
     * The PerformanceObserver doesn't report all interactions because of the durationThreshold limit.
     * Despite so, if the interactionCount is greater than 0, we should report 0
     * which is the number/placeholder that Google has chosen as a way to convey that users had a good user experience.
     */
    if (interactionCount() > 0) {
      return 0
    }

    // This means not activity at all, so nothing to report
    return
  }

  /**
   * If there are less than 50 interactions we will report the slowest interaction
   * For 50 interactions or more, we will report the 98th percentile, which means picking the next in "line".
   *
   * One of the reasons why Google advocates for this is because it wouldn't be fair if your site would be penalized (SEO related),
   * just because it received more interactions for an arbitrary reason.
   */
  const interactionIndex = Math.min(
    inpState.longestInteractions.length - 1,
    Math.floor(interactionCount() / 50)
  )
  const inp = inpState.longestInteractions[interactionIndex].duration

  return inp
}

export function interactionCount() {
  return performance.interactionCount || inpState.interactionCount
}

export function restoreINPState() {
  inpState.minInteractionId = Infinity
  inpState.maxInteractionId = 0
  inpState.interactionCount = 0
  inpState.longestInteractions = []
}

// Stores user interaction
function storeUserInteraction(entry) {
  // Don't store interactions that are faster than the current ones
  // This also makes sure we don't store repeated values
  const leastSlow =
    inpState.longestInteractions[inpState.longestInteractions.length - 1]
  if (
    typeof leastSlow !== 'undefined' &&
    entry.duration <= leastSlow.duration &&
    entry.interactionId != leastSlow.id
  ) {
    return
  }

  /**
   * different entries can share the same interactionId
   * Please see the EventTiming spec for more details about
   * the algorithm: https://www.w3.org/TR/event-timing/#sec-computing-interactionid
   */
  const filteredInteraction = inpState.longestInteractions.filter(
    interaction => interaction.id === entry.interactionId
  )
  if (filteredInteraction.length > 0) {
    // Override existing interaction
    const foundInteraction = filteredInteraction[0]
    foundInteraction.duration = Math.max(
      foundInteraction.duration,
      entry.duration
    )
  } else {
    inpState.longestInteractions.push({
      id: entry.interactionId,
      duration: entry.duration
    })
  }

  // Sort the interactions to keep the slowest interactions at the end and keep only the max interactions
  inpState.longestInteractions.sort((a, b) => b.duration - a.duration)
  inpState.longestInteractions.splice(MAX_INTERACTIONS_TO_CONSIDER)
}

/**
 * Updates the total count of different user interactions occurred in a page
 * Once `performance.interactionCount` becomes globally available the "helper/polyfill logic" function
 * will not be needed anymore.
 *
 * the reasons why interactionCount is important are:
 * 1. To get the proper percentile 98 when calculating the INP value.
 * 2. To report INP as 0 (rather than undefined) in those circumstances where the PerformanceObserver doesn't report entries.
 *    That can happen because interactions faster than 16ms will not be taken into account.
 *    Note: a first-input entry duration can be less than 16, which is also helpful for this
 *
 * Again, these are Google conventions/guidelines and things might change in the future.
 * The INP metric calculations will probably evolve over time.
 */
function updateInteractionCount(entry) {
  if (isPerfInteractionCountSupported()) {
    return
  }

  inpState.minInteractionId = Math.min(
    inpState.minInteractionId,
    entry.interactionId
  )
  inpState.maxInteractionId = Math.max(
    inpState.maxInteractionId,
    entry.interactionId
  )

  /**
   * Note: The explanation below is based on our conclusions after exploring and investigating, this is not referenced in any place at all.
   * Understanding how the convention works is essential to give our users and customers the best service possible.
   *
   * To estimate the number of different user interactions in an webpage (without storing all of them in memory)
   * Google uses math interpolation:
   * E.g. if you have something like (1,2,3,4,5) one of the ways you have to know the total amount different values
   * is doing (max-min) + 1, which in this case is 5
   *
   * To understand why the calculation below uses the "/ 7" first we need to understand how interactionId is generated.
   * From the EventTiming spec: "The user interaction value is increased by a small number chosen by the user agent instead of 1..."
   * Please see more details here: https://www.w3.org/TR/event-timing/#user-interaction-value
   *
   * In case of Chromium, the interactionId increases by 7 each time.
   *
   * So, the "/ 7" helps to estimate how many different ids have been generated. Let's see a more real example:
   * Ids that the PerformanceObserver generated: (3407, 3414, 3421, 3428, 3435)
   * let's explain step by step the calculation: (3435 - 3407) / 7 + 1
   * 1. 3435-3407 is 28
   * 2. Since we know that every id is increased by 7, then do 28 / 7 + 1 which will give us 5
   *
   * Again, this technique helps to estimate, it's not 100% accurate the whole time
   * mainly because PerformanceObserver doesn't report all interactions.
   */
  inpState.interactionCount =
    (inpState.maxInteractionId - inpState.minInteractionId) / 7 + 1
}

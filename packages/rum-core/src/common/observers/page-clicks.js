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

import { USER_INTERACTION } from '../constants'

const interactiveSelector = attribute => `a[${attribute}], button[${attribute}]`

export function observePageClicks(configService, transactionService) {
  const clickHandler = event => {
    // Real user clicks interactions will always be related to an Element.
    // And since the goal is to maximise the capture of such interactions
    // events synthetically dispatched through Window (window.dispatch) and Document (document.dispatch)
    // will not be handled.
    if (event.target instanceof Element) {
      createUserInteractionTransaction(
        configService,
        transactionService,
        event.target
      )
    }
  }

  const eventName = 'click'
  const useCapture = true
  window.addEventListener(eventName, clickHandler, useCapture)

  return () => {
    window.removeEventListener(eventName, clickHandler, useCapture)
  }
}

function createUserInteractionTransaction(
  configService,
  transactionService,
  target
) {
  const transactionNameCustomAttribute = configService.get(
    'transactionNameCustomAttribute'
  )
  const { transactionName, context } = getTransactionMetadata(
    target,
    transactionNameCustomAttribute
  )

  /**
   * We reduce the reusability threshold to make sure
   * we only capture async activities (e.g. network)
   * related to this interaction.
   */
  const tr = transactionService.startTransaction(
    `Click - ${transactionName}`,
    USER_INTERACTION,
    {
      managed: true,
      canReuse: true,
      reuseThreshold: 300
    }
  )

  if (tr && context) {
    tr.addContext(context)
  }
}

function getTransactionMetadata(target, transactionNameCustomAttribute) {
  const metadata = {
    transactionName: null,
    context: null
  }

  metadata.transactionName = buildTransactionName(
    target,
    transactionNameCustomAttribute
  )

  let classes = target.getAttribute('class')
  if (classes) {
    metadata.context = { custom: { classes } }
  }

  return metadata
}

// builds the name of a transaction from the given target
// Strategy:
// if transactionNameCustomAttribute config option is set, use that
// if not, use custom html attribute 'data-transaction-name'
// otherwise fall back to "tagname" + "name"-Attribute
function buildTransactionName(target, transactionNameCustomAttribute) {
  // Verify if a custom transaction name has been defined
  const dtName = findCustomTransactionName(
    target,
    transactionNameCustomAttribute
  )

  if (dtName) {
    return dtName
  }

  const tagName = target.tagName.toLowerCase()
  // "tagname" + "name"-Attribute
  const name = target.getAttribute('name')
  if (!!name) {
    return `${tagName}["${name}"]`
  }

  // Just use the tagName
  return tagName
}

function findCustomTransactionName(target, transactionNameCustomAttribute) {
  const trCustomNameAttribute =
    transactionNameCustomAttribute || 'data-transaction-name'
  const fallbackName = target.getAttribute(trCustomNameAttribute)

  if (target.closest) {
    // Leverage closest API to traverse the element and its parents
    // only links and buttons are considered.
    const element = target.closest(interactiveSelector(trCustomNameAttribute))
    return element ? element.getAttribute(trCustomNameAttribute) : fallbackName
  }

  // browsers (such as IE11) which don't support closest API will just look at the target element
  return fallbackName
}

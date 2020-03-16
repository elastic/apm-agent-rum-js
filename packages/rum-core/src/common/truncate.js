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
import { KEYWORD_LIMIT } from './constants'

/**
 * All models value holds the arrary of form
 * [ limit, required, placeholder]
 *
 * Defaults are represented in the array as true
 * to reduce the bundlesize
 * true -> !0 in the minified code
 */
const METADATA_MODEL = {
  service: {
    name: [KEYWORD_LIMIT, true],
    version: true,
    agent: {
      version: [KEYWORD_LIMIT, true]
    },
    environment: true
  },
  labels: {
    '*': true
  }
}

const RESPONSE_MODEL = {
  '*': true,
  headers: {
    '*': true
  }
}

const DESTINATION_MODEL = {
  address: [KEYWORD_LIMIT],
  service: {
    '*': [KEYWORD_LIMIT, true]
  }
}

const CONTEXT_MODEL = {
  user: {
    id: true,
    email: true,
    username: true
  },
  tags: {
    '*': true
  },
  /** Spans */
  http: {
    response: RESPONSE_MODEL
  },
  destination: DESTINATION_MODEL,
  /** Transactions */
  response: RESPONSE_MODEL
}

const SPAN_MODEL = {
  name: [KEYWORD_LIMIT, true],
  type: [KEYWORD_LIMIT, true],
  id: [KEYWORD_LIMIT, true],
  trace_id: [KEYWORD_LIMIT, true],
  parent_id: [KEYWORD_LIMIT, true],
  transaction_id: [KEYWORD_LIMIT, true],
  subtype: true,
  action: true,
  context: CONTEXT_MODEL
}

const TRANSACTION_MODEL = {
  name: true,
  parent_id: true,
  type: [KEYWORD_LIMIT, true],
  id: [KEYWORD_LIMIT, true],
  trace_id: [KEYWORD_LIMIT, true],
  span_count: {
    started: [KEYWORD_LIMIT, true]
  },
  context: CONTEXT_MODEL
}

const ERROR_MODEL = {
  id: [KEYWORD_LIMIT, true],
  trace_id: true,
  transaction_id: true,
  parent_id: true,
  culprit: true,
  exception: {
    type: true
  },
  transaction: {
    type: true
  },
  context: CONTEXT_MODEL
}

function truncate(
  value,
  limit = KEYWORD_LIMIT,
  required = false,
  placeholder = 'N/A'
) {
  /*
    The request will fail if we set a string placeholder
    when the apm server expects a number.
    However, if this happens it must be a bug.
  */
  if (required && isEmpty(value)) {
    value = placeholder
  }
  if (typeof value === 'string') {
    return value.substring(0, limit)
  }
  return value
}

function isEmpty(value) {
  return value == null || value === '' || typeof value === 'undefined'
}

function replaceValue(target, key, currModel) {
  const value = truncate(target[key], currModel[0], currModel[1])
  if (isEmpty(value)) {
    delete target[key]
    return
  }
  target[key] = value
}

function truncateModel(model = {}, target, childTarget = target) {
  const keys = Object.keys(model)
  const emptyArr = []
  for (let i = 0; i < keys.length; i++) {
    const currKey = keys[i]
    const currModel = model[currKey] === true ? emptyArr : model[currKey]

    if (!Array.isArray(currModel)) {
      truncateModel(currModel, target, childTarget[currKey])
    } else {
      /**
       * To avoid traversing the target object, we keep a reference to
       * the current depth inorder to get the value associated with the key
       * and set the truncated value in target object
       *
       * when the key is '*', Apply truncation to all the keys in current level
       */
      if (currKey === '*') {
        Object.keys(childTarget).forEach(key =>
          replaceValue(childTarget, key, currModel)
        )
      } else {
        replaceValue(childTarget, currKey, currModel)
      }
    }
  }
  return target
}

export {
  truncate,
  truncateModel,
  SPAN_MODEL,
  TRANSACTION_MODEL,
  ERROR_MODEL,
  METADATA_MODEL,
  RESPONSE_MODEL
}

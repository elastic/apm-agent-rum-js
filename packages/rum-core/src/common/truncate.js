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
 * Goes over the object in Breadth first fashion
 * Example:
 * {
 *    a: '10',
 *    b: { c: 20, d: { e: 30 } },
 *    f: { g: '100' }
 * }
 *
 * Execute callbacks on below paths in order
 * ['a'],  ['b', 'c'], ['b', 'd', 'e'], ['f', 'g']
 */

function breathFilter(obj = {}, callback, path = []) {
  const queue = []
  let index = 0
  const keys = Object.keys(obj)
  if (keys.length === index) {
    return obj
  }
  queue.push(keys[index])

  while (queue.length > 0) {
    const currKey = queue.shift()
    const value = obj[currKey]

    if (typeof value === 'object') {
      breathFilter(value, callback, path.concat(currKey))
    } else {
      obj[currKey] = callback(value, path.concat(currKey))
    }
    index++
    if (index < keys.length) {
      queue.push(keys[index])
    }
  }
  return obj
}

function truncate(value, limit, required = false, placeholder = 'N/A') {
  if (required && !value) {
    value = placeholder
  }
  if (value) {
    return String(value).substr(0, limit)
  }
  return value
}

function truncateMetadata(metadata, opts) {
  return breathFilter(metadata, (value, path) => {
    if (typeof value !== 'string') {
      return value
    }
    let limit
    let required = false
    switch (path[0]) {
      case 'service': {
        switch (path[1]) {
          case 'version':
          case 'environment':
            limit = opts.stringLimit
            break
          case 'name':
            limit = opts.stringLimit
            required = true
            break

          case 'agent':
          case 'language':
          case 'runtime':
            switch (path[2]) {
              case 'name':
              case 'version':
                limit = opts.stringLimit
                break
            }
            break
        }
        break
      }
    }
    return truncate(value, limit, required)
  })
}

function contextLength(path, opts) {
  switch (path[1]) {
    case 'user':
      switch (path[2]) {
        case 'id':
        case 'email':
        case 'username':
          return opts.stringLimit
      }
      break

    case 'tags':
      return opts.stringLimit
  }

  return undefined
}

function truncateSpan(span, opts) {
  return breathFilter(span, (value, path) => {
    if (typeof value !== 'string') {
      return value
    }
    let limit
    let required = false
    switch (path[0]) {
      case 'name':
      case 'type':
        required = true
        limit = opts.stringLimit
        break

      case 'id':
      case 'trace_id':
      case 'parent_id':
      case 'transaction_id':
      case 'subtype':
      case 'action':
        limit = opts.stringLimit
        break

      case 'context':
        limit = contextLength(path, opts)
        break
    }
    return truncate(value, limit, required)
  })
}

function truncateTransaction(transaction, opts) {
  return breathFilter(transaction, (value, path) => {
    if (typeof value !== 'string') {
      return value
    }
    let limit
    let required = false
    switch (path[0]) {
      case 'type':
      case 'id':
      case 'trace_id':
      case 'parent_id':
        required = true
        limit = opts.stringLimit
        break

      case 'name':
        limit = opts.stringLimit
        break

      case 'context':
        limit = contextLength(path, opts)
        break
    }
    return truncate(value, limit, required)
  })
}

function truncateError(error, opts) {
  return breathFilter(error, (value, path) => {
    if (typeof value !== 'string') {
      return value
    }

    let limit
    let required = false
    switch (path[0]) {
      case 'id':
        limit = opts.stringLimit
        required = true
        break

      case 'trace_id':
      case 'transaction_id':
      case 'parent_id':
      case 'culprit':
        limit = opts.stringLimit
        break

      case 'exception':
        switch (path[1]) {
          case 'type':
            limit = opts.stringLimit
            break
        }
        break

      case 'transaction':
        switch (path[1]) {
          case 'type':
            limit = opts.stringLimit
            break
        }
        break

      case 'context':
        limit = contextLength(path, opts)
        break
    }
    return truncate(value, limit, required)
  })
}

module.exports = {
  truncate,
  truncateMetadata,
  truncateSpan,
  truncateTransaction,
  truncateError
}

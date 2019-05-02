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

export let globalState = {
  fetchInProgress: false
}

export function apmSymbol(name) {
  return '__apm_symbol__' + name
}

function isPropertyWritable(propertyDesc) {
  if (!propertyDesc) {
    return true
  }

  if (propertyDesc.writable === false) {
    return false
  }

  return !(
    typeof propertyDesc.get === 'function' &&
    typeof propertyDesc.set === 'undefined'
  )
}

function attachOriginToPatched(patched, original) {
  patched[apmSymbol('OriginalDelegate')] = original
}

export function patchMethod(target, name, patchFn) {
  var proto = target
  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto)
  }
  if (!proto && target[name]) {
    // somehow we did not find it, but we can see it. This happens on IE for Window properties.
    proto = target
  }

  const delegateName = apmSymbol(name)
  var delegate
  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name]
    // check whether proto[name] is writable
    // some property is readonly in safari, such as HtmlCanvasElement.prototype.toBlob
    const desc = proto && Object.getOwnPropertyDescriptor(proto, name)
    if (isPropertyWritable(desc)) {
      const patchDelegate = patchFn(delegate, delegateName, name)
      proto[name] = function() {
        return patchDelegate(this, arguments)
      }
      attachOriginToPatched(proto[name], delegate)
    }
  }
  return delegate
}

export const XHR_IGNORE = apmSymbol('xhrIgnore')
export const XHR_SYNC = apmSymbol('xhrSync')
export const XHR_URL = apmSymbol('xhrURL')
export const XHR_METHOD = apmSymbol('xhrMethod')

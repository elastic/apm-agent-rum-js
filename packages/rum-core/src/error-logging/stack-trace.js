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

import stackParser from 'error-stack-parser'

function filePathToFileName(fileUrl) {
  const origin =
    window.location.origin ||
    window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '')

  if (fileUrl.indexOf(origin) > -1) {
    fileUrl = fileUrl.replace(origin + '/', '')
  }

  return fileUrl
}

function cleanFilePath(filePath = '') {
  if (filePath === '<anonymous>') {
    filePath = ''
  }
  return filePath
}

function isFileInline(fileUrl) {
  if (fileUrl) {
    return window.location.href.indexOf(fileUrl) === 0
  }
  return false
}

function normalizeStackFrames(stackFrames) {
  return stackFrames.map(frame => {
    if (frame.functionName) {
      frame.functionName = normalizeFunctionName(frame.functionName)
    }
    return frame
  })
}

function normalizeFunctionName(fnName) {
  // SpinderMonkey name convetion (https://developer.mozilla.org/en-US/docs/Tools/Debugger-API/Debugger.Object#Accessor_Properties_of_the_Debugger.Object_prototype)

  // We use a/b to refer to the b defined within a
  var parts = fnName.split('/')
  if (parts.length > 1) {
    fnName = ['Object', parts[parts.length - 1]].join('.')
  } else {
    fnName = parts[0]
  }

  // a< to refer to a function that occurs somewhere within an expression that is assigned to a.
  fnName = fnName.replace(/.<$/gi, '.<anonymous>')

  // Normalize IE's 'Anonymous function'
  fnName = fnName.replace(/^Anonymous function$/, '<anonymous>')

  // Always use the last part
  parts = fnName.split('.')
  if (parts.length > 1) {
    fnName = parts[parts.length - 1]
  } else {
    fnName = parts[0]
  }

  return fnName
}

export function createStackTraces(errorEvent) {
  const { error, filename, lineno, colno } = errorEvent

  let stackTraces = []
  if (error) {
    try {
      stackTraces = stackParser.parse(error)
    } catch (e) {
      /**
       * Ignore library errors from error-stack-parser, since it does not
       * provide any valuable information for the user
       */
    }
  }

  if (stackTraces.length === 0) {
    stackTraces = [
      {
        fileName: filename,
        lineNumber: lineno,
        columnNumber: colno
      }
    ]
  }

  const normalizedStackTraces = normalizeStackFrames(stackTraces)

  return normalizedStackTraces.map(stack => {
    const {
      fileName,
      lineNumber,
      columnNumber,
      functionName = '<anonymous>'
    } = stack
    if (!fileName && !lineNumber) {
      return {}
    }
    if (!columnNumber && !lineNumber) {
      return {}
    }

    const filePath = cleanFilePath(fileName)
    let cleanedFileName = filePathToFileName(filePath)

    if (isFileInline(filePath)) {
      cleanedFileName = '(inline script)'
    }

    return {
      abs_path: fileName,
      filename: cleanedFileName,
      function: functionName,
      lineno: lineNumber,
      colno: columnNumber
    }
  })
}

export function filterInvalidFrames(frames) {
  return frames.filter(({ filename, lineno }) => {
    return typeof filename !== 'undefined' && typeof lineno !== 'undefined'
  })
}

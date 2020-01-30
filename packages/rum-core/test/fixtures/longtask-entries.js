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
 * Entries are copied from the demo link available as part of
 * longtask repo - https://w3c.github.io/longtasks/demo.html
 */
export default [
  {
    name: 'self',
    entryType: 'longtask',
    startTime: 745.4100000031758,
    duration: 54.56999997841194,
    attribution: [
      {
        name: 'unknown',
        entryType: 'taskattribution',
        startTime: 0,
        duration: 0,
        containerType: 'window',
        containerSrc: '',
        containerId: '',
        containerName: ''
      }
    ]
  },
  {
    name: 'same-origin-descendant',
    entryType: 'longtask',
    startTime: 1023.40999995591,
    duration: 187.19000002602115,
    attribution: [
      {
        name: 'unknown',
        entryType: 'taskattribution',
        startTime: 0,
        duration: 0,
        containerType: 'iframe',
        containerSrc: 'demo-child.html',
        containerId: '',
        containerName: 'childA'
      }
    ]
  },
  {
    name: 'same-origin-ancestor',
    entryType: 'longtask',
    startTime: 1923.40999995591,
    duration: 158.16999995149672,
    attribution: [
      {
        name: 'unknown',
        entryType: 'taskattribution',
        startTime: 0,
        duration: 0,
        containerType: 'window',
        containerSrc: '',
        containerId: '',
        containerName: ''
      }
    ]
  }
]

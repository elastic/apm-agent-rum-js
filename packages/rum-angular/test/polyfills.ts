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
 * Polyfills required for Angular to work on all browsers
 * https://angular.io/guide/browser-support#polyfills-for-non-cli-users
 */

/*
 * IE9, IE10 and IE11 requires all of the following polyfills.
 */
import 'core-js/features/symbol'
import 'core-js/features/object'
import 'core-js/features/function'
import 'core-js/features/parse-int'
import 'core-js/features/parse-float'
import 'core-js/features/number'
import 'core-js/features/math'
import 'core-js/features/string'
import 'core-js/features/date'
import 'core-js/features/array'
import 'core-js/features/regexp'
import 'core-js/features/map'
import 'core-js/features/weak-map'
import 'core-js/features/set'
import 'core-js/features/reflect'

/*
 * Evergreen browsers require these
 */
import 'core-js/proposals/reflect-metadata'

/*
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone'

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

declare module '@elastic/apm-rum-react' {
  import type { ComponentType } from 'react'
  import type { Route } from 'react-router'
  import type { Transaction } from '@elastic/apm-rum'

  /**
   * ApmRoute only instruments the route if component property is provided,
   * in other cases, e.g. using render or children properties, ApmRoute will
   * only renders the route without instrumenting it, please instrument
   * the individual component using withTransaction in these cases instead.
   */
  export const ApmRoute: typeof Route

  export const withTransaction: <T>(
    name?: string,
    type?: string,
    callback?: (transaction: Transaction | undefined, props: T) => {}
  ) => (component: ComponentType<T>) => ComponentType<T>
}

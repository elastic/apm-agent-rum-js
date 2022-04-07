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

import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory, afterFrame } from '@elastic/apm-rum-core'
import { ApmVuePlugin } from '../../src'

describe('APM route hooks', () => {
  let apm

  beforeEach(() => {
    apm = new ApmBase(createServiceFactory(), false)
  })

  const App = {
    name: 'App',
    template: `<div id="app"><router-view /></div>`
  }
  const Home = {
    name: 'Home',
    template: `<div>Home Component</div>`
  }
  const Parent = {
    template: `
      <div class="parent">
        <router-view class="child"></router-view>
      </div>
    `
  }
  const Foo = { template: '<div>foo</div>' }
  const CatchAll = {
    template: `-`
  }

  function mountApp(routes, options = {}) {
    const { history = createWebHistory(), passRouter = true } = options

    const router = createRouter({
      history,
      routes: [
        ...routes,
        /**
         * Suppress router warnings
         * https://github.com/vuejs/vue-router-next/issues/359
         */
        {
          path: '/:pathMatch(.*)*',
          component: CatchAll
        }
      ]
    })

    const apmPlugin = [
      ApmVuePlugin,
      {
        router: passRouter ? router : undefined,
        apm,
        config: {
          serviceName: 'test'
        }
      }
    ]
    const wrapper = mount(App, {
      global: {
        plugins: [router, apmPlugin]
      }
    })
    return { router, wrapper }
  }

  it('should start the transaction with correct name on navigation', async () => {
    const { router, wrapper } = mountApp([
      {
        path: '/',
        redirect: '/home'
      },
      {
        path: '/home',
        component: Home
      }
    ])
    spyOn(apm, 'startTransaction').and.callThrough()
    await router.push('/')

    expect(apm.startTransaction).toHaveBeenCalledWith('/home', 'route-change', {
      managed: true,
      canReuse: true
    })
    expect(wrapper.findComponent(Home).exists()).toBe(true)
    wrapper.unmount()
  })

  it('should use the slug id for transaction name', async () => {
    const { router, wrapper } = mountApp([
      {
        path: '/foo/:id',
        component: Foo
      }
    ])
    spyOn(apm, 'startTransaction').and.callThrough()
    await router.push('/foo/1')

    expect(apm.startTransaction).toHaveBeenCalledWith(
      '/foo/:id',
      'route-change',
      {
        managed: true,
        canReuse: true
      }
    )
    expect(wrapper.findComponent(Foo).exists()).toBe(true)
    wrapper.unmount()
  })

  it('should use the slug id for nested child routes', async done => {
    const { router, wrapper } = mountApp([
      {
        path: '/parent',
        component: Parent,
        children: [
          {
            path: 'foo/:fooId',
            component: Foo
          }
        ]
      }
    ])
    const detectFinishSpy = jasmine.createSpy('detectFinishSpy')
    spyOn(apm, 'startTransaction').and.returnValue({
      detectFinish: detectFinishSpy
    })
    await router.push('/parent/foo/1')

    expect(apm.startTransaction).toHaveBeenCalledWith(
      '/parent/foo/:fooId',
      'route-change',
      {
        managed: true,
        canReuse: true
      }
    )
    expect(wrapper.findComponent(Foo).exists()).toBe(true)
    afterFrame(() => {
      expect(detectFinishSpy).toHaveBeenCalled()
      wrapper.unmount()
      done()
    })
  })

  it('should expose the $apm on the vue instance', () => {
    const { wrapper } = mountApp([])
    expect(wrapper.vm.$apm).toEqual(apm)
  })

  it('should capture spans inside component route guard', async () => {
    const Span = {
      template: `<div>Span</div>`,
      beforeRouteEnter(to, from, next) {
        setTimeout(() => {
          const span = apm.startSpan('before-route-enter')
          span.end()
          next()
        }, 0)
      }
    }
    const { router, wrapper } = mountApp([
      {
        path: '/spans/:id',
        component: Span
      }
    ])
    await router.isReady()
    router.afterEach(() => {
      const tr = apm.getCurrentTransaction()
      const expectedSpan = 'before-route-enter'
      const filteredSpans = tr.spans.filter(span => span.name === expectedSpan)

      expect(filteredSpans.length).toBe(1)
    })
    spyOn(apm, 'startTransaction')
    await router.push('/spans/1')

    expect(apm.startTransaction).toHaveBeenCalledWith(
      '/spans/:id',
      'route-change',
      {
        managed: true,
        canReuse: true
      }
    )
    expect(wrapper.findComponent(Span).exists()).toBe(true)

    wrapper.unmount()
  })

  it('should consider router as optional', async () => {
    const { router, wrapper } = mountApp(
      [
        {
          path: '/home',
          component: Home
        }
      ],
      { passRouter: false }
    )

    spyOn(apm, 'startTransaction')
    await router.push('/home')

    expect(apm.startTransaction).not.toHaveBeenCalled()

    expect(wrapper.findComponent(Home).exists()).toBe(true)
    wrapper.unmount()
  })

  it('should end transaction on navigation error', async done => {
    const endSpy = jasmine.createSpy('endSpy')
    const detectFinishSpy = jasmine.createSpy('detectFinishSpy')
    const ErrorSpan = {
      template: `<div>Span</div>`,
      beforeRouteEnter() {
        throw new Error('Nav Error')
      }
    }
    const { router, wrapper } = mountApp([
      {
        path: '/error',
        component: ErrorSpan
      }
    ])

    router.onError(() => {
      expect(endSpy).toHaveBeenCalled()
      wrapper.unmount()
      done()
    })

    spyOn(apm, 'startTransaction').and.returnValue({
      end: endSpy,
      detectFinish: detectFinishSpy
    })
    await router.push('/error')

    expect(apm.startTransaction).toHaveBeenCalledWith(
      '/error',
      'route-change',
      {
        managed: true,
        canReuse: true
      }
    )
    expect(wrapper.findComponent(ErrorSpan).exists()).toBe(false)
  })

  describe('vue router hash mode', async () => {
    it('should use the slug id for transaction name', async () => {
      const { router, wrapper } = mountApp(
        [
          {
            path: '/foo/:id',
            component: Foo
          }
        ],
        {
          mode: 'hash'
        }
      )
      spyOn(apm, 'startTransaction')
      await router.push('/foo/1')

      expect(apm.startTransaction).toHaveBeenCalledWith(
        '/foo/:id',
        'route-change',
        {
          managed: true,
          canReuse: true
        }
      )
      expect(wrapper.findComponent(Foo).exists()).toBe(true)
      wrapper.unmount()
    })
  })
})

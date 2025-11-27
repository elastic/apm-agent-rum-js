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

import { TestBed, ComponentFixture } from '@angular/core/testing'
import { NgModule, Component, Injectable } from '@angular/core'
import { Routes, Router, NavigationError, CanActivate } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { Location } from '@angular/common'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'
import { APM, ApmModule } from '../../src/apm.module'
import { ApmService } from '../../src/apm.service'

@Component({
  template: 'LazyHome'
})
class LazyHomeComponent {}

@Component({
  template: 'LazyDetail'
})
class LazyDetailComponent {}

const lazyRoutes: Routes = [
  {
    path: '',
    component: LazyHomeComponent,
    children: [
      {
        path: ':id',
        component: LazyDetailComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterTestingModule.withRoutes(lazyRoutes)],
  declarations: [LazyHomeComponent, LazyDetailComponent]
})
class LazyModule {}

@Component({
  template: 'Home'
})
class HomeComponent {}

@Component({
  template: 'Slug'
})
class SlugComponent {}

@Component({
  template: '<router-outlet></router-outlet>'
})
class AppComponent {}

@Injectable()
class CanActivateReject implements CanActivate {
  canActivate(): any {
    return false
  }
}

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'lazy', loadChildren: () => LazyModule },
  { path: 'slug/:id', component: SlugComponent },
  {
    path: 'invalid-route',
    component: SlugComponent,
    canActivate: [CanActivateReject]
  }
]

describe('ApmService', () => {
  let service: ApmService
  let router: Router
  let location: Location
  let fixture: ComponentFixture<AppComponent>
  let compiled: HTMLElement

  function setUpAppModule() {
    TestBed.configureTestingModule({
      imports: [ApmModule, RouterTestingModule.withRoutes(routes)],
      declarations: [HomeComponent, AppComponent, SlugComponent],
      providers: [ApmService, CanActivateReject]
    }).compileComponents()

    TestBed.overrideProvider(APM, {
      useValue: new ApmBase(createServiceFactory(), false)
    })

    service = TestBed.get(ApmService)
    router = TestBed.get(Router)
    location = TestBed.get(Location)

    fixture = TestBed.createComponent(AppComponent)
    compiled = fixture.debugElement.nativeElement
  }

  function setUpRouteNavigation() {
    fixture.ngZone.run(() => router.initialNavigation())
  }

  describe('testing init', () => {
    beforeEach(() => {
      setUpAppModule()
      setUpRouteNavigation()
    })

    it('should return apm base instance on service initialization', () => {
      const apmBase = service.init({
        active: false
      })

      expect(apmBase instanceof ApmBase).toBeTruthy()
      expect(apmBase.startTransaction).toBeDefined()
    })

    it('should not instrument route changes when agent is inactive', done => {
      spyOn(service.apm, 'startTransaction')
      service.init({
        active: false
      })

      fixture.ngZone.run(() => {
        router.navigate(['/home']).then(() => {
          expect(location.path()).toBe('/home')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'Home'
          )
          expect(service.apm.startTransaction).not.toHaveBeenCalled()
          done()
        })
      })
    })
  })

  describe('testing observe', () => {
    beforeEach(() => {
      setUpAppModule()
      service.observe()
      setUpRouteNavigation()
    })

    it('navigate to "/home" should create /home transaction', done => {
      spyOn(service.apm, 'startTransaction')
      fixture.ngZone.run(() => {
        router.navigate(['/home']).then(() => {
          expect(location.path()).toBe('/home')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'Home'
          )

          expect(service.apm.startTransaction).toHaveBeenCalledWith(
            '/home',
            'route-change',
            {
              managed: true,
              canReuse: true
            }
          )
          done()
        })
      })
    })

    it('should set transaction name properly on redirects', done => {
      spyOn(service.apm, 'startTransaction').and.callThrough()
      const tr = service.apm.getCurrentTransaction()
      fixture.ngZone.run(() => {
        router.navigate(['/']).then(() => {
          expect(location.path()).toBe('/home')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'Home'
          )
          expect(service.apm.startTransaction).toHaveBeenCalledWith(
            '/',
            'route-change',
            {
              managed: true,
              canReuse: true
            }
          )
          expect(tr.name).toEqual('/home')

          done()
        })
      })
    })

    it('should set transaction name properly on parameterised urls', done => {
      spyOn(service.apm, 'startTransaction').and.callThrough()
      const tr = service.apm.getCurrentTransaction()
      fixture.ngZone.run(() => {
        router.navigate(['/slug/2']).then(() => {
          expect(location.path()).toBe('/slug/2')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'Slug'
          )
          expect(service.apm.startTransaction).toHaveBeenCalledWith(
            '/slug/2',
            'route-change',
            {
              managed: true,
              canReuse: true
            }
          )
          expect(tr.name).toEqual('/slug/:id')

          done()
        })
      })
    })

    it('should set transaction name properly for lazy loaded modules', done => {
      spyOn(service.apm, 'startTransaction').and.callThrough()
      const tr = service.apm.getCurrentTransaction()
      fixture.ngZone.run(() => {
        router.navigate(['/lazy/2']).then(() => {
          expect(location.path()).toBe('/lazy/2')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'LazyHome'
          )
          expect(service.apm.startTransaction).toHaveBeenCalledWith(
            '/lazy/2',
            'route-change',
            {
              managed: true,
              canReuse: true
            }
          )
          expect(tr.name).toEqual('/lazy/:id')

          done()
        })
      })
    })

    it('should capture navigation errors', done => {
      spyOn(service.apm, 'startTransaction').and.callThrough()
      spyOn(service.apm, 'captureError')
      const tr = service.apm.getCurrentTransaction()
      let err
      fixture.ngZone.run(() => {
        router.events.subscribe(event => {
          if (event instanceof NavigationError) {
            err = event.error
          }
        })
        router.navigate(['/invalid-route']).then(() => {
          expect(location.path()).toBe('/')
          expect(compiled.querySelector('ng-component').textContent).toBe(
            'Home'
          )
          expect(service.apm.startTransaction).toHaveBeenCalledWith(
            '/invalid-route',
            'route-change',
            {
              managed: true,
              canReuse: true
            }
          )
          expect(service.apm.captureError).toHaveBeenCalledWith(err)
          expect(tr.name).toEqual('/invalid-route')

          done()
        })
      })
    })
  })
})

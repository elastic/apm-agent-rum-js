---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/angular-integration.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# Angular integration [angular-integration]

This document covers how to use Real User Monitoring JavaScript agent with Angular applications.

## Supported versions [angular-supported-versions]

This integration supports Angular versions ≥ 12.0


## Installing Elastic APM Angular package [installing-angular-integration]

Install the `@elastic/apm-rum-angular` package as a dependency to your application:

```bash
npm install @elastic/apm-rum-angular --save
```

::::{note}
If you are using an Angular version < 12.0, use @elastic/apm-rum-angular 2.x to instrument your application.
::::


::::{note}
If you are using an Angular version < 9.0, use @elastic/apm-rum-angular 1.x to instrument your application. Details are available in a [prior release](https://www.elastic.co/guide/en/apm/agent/rum-js/4.x/angular-integration.html).
::::



### Instrumenting your Angular application [_instrumenting_your_angular_application]

The Angular integration packages exposes the `ApmModule` and `ApmService` which uses Angular’s dependency injection pattern and will start subscribing to [Angular Router Events](https://angular.io/api/router/Event) once the service is initialized.

`ApmService` must be initialized from either the application module or application component since the RUM agent has to start capturing all the resources and API calls as soon as possible.

```js
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { Routes, RouterModule } from '@angular/router'
import { ApmModule, ApmService } from '@elastic/apm-rum-angular'

const routes: Routes = [
  { path: 'contact', component: ContactListComponent },
  { path: 'contact/:id', component: ContactDetailComponent }
]

@NgModule({
  imports: [ApmModule, BrowserModule, RouterModule.forRoot(routes)],
  declarations: [AppComponent, ContactListComponent, ContactDetailComponent],
  providers: [ApmService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(service: ApmService) {
    // Agent API is exposed through this apm instance
    const apm = service.init({
      serviceName: 'angular-app',
      serverUrl: 'http://localhost:8200'
    })

    apm.setUserContext({
      'username': 'foo',
      'id': 'bar'
    })
  }
}
```

Once the service is initialized, both page load and Single page application navigation events will be captured as transactions with the `path` of the route as its name and `page-load` or `route-change` as type.


### Capturing errors in Angular applications [_capturing_errors_in_angular_applications]

By default, when an error is thrown inside the Angular application, the default error handler prints the error messages to the console without rethrowing them as browser events.

`ApmErrorHandler` provides a centralized error handling which captures and reports the errors to be shown in the `APM UI` and also logs them to the browser console.

```js
import { ErrorHandler } from '@angular/core'
import { ApmErrorHandler } from '@elastic/apm-rum-angular'

@NgModule({
  providers: [
    {
      provide: ErrorHandler,
      useClass: ApmErrorHandler
    }
  ]
})
class AppModule {}
```



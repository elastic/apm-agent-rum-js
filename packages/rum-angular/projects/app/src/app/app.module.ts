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

import { ErrorHandler, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule, Routes } from '@angular/router'
import {
  ApmErrorHandler,
  ApmModule,
  ApmService
} from '@elastic/apm-rum-angular'
import { AppComponent } from './app.component'
import { ContactDetailComponent } from './contact-detail.component'
import { ContactListComponent } from './contact-list.component'
import { HomeComponent } from './home.component'
import { PageNotFoundComponent } from './not-found.component'
import { HttpClientModule } from '@angular/common/http'
// import { initializeApmService } from '../index'

const routes: Routes = [
  { path: 'contacts', component: ContactListComponent },
  { path: 'contact/:id', component: ContactDetailComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: '**', component: PageNotFoundComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    ContactDetailComponent,
    ContactListComponent,
    HomeComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    ApmModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [{ provide: ErrorHandler, useClass: ApmErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private apmService: ApmService) {
    apmService.init({
      serviceName: 'e2e-angular-integration',
      environment: 'debug',
      serverUrl: 'http://localhost:8200'
    })
    // This won't work in this setup because node `process` isn't available here.
    // initializeApmService(apmService, {
    //   serviceName: 'e2e-angular-integration',
    //   logLevel: 'debug'
    // })
  }
}

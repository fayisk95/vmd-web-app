import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { InMemoryDataService } from './services/in-memory-data.service';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    InMemoryDataService,
    ApiService,
    // Add interceptors here if needed
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: YourInterceptor,
    //   multi: true
    // }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
import { ToasterModule } from 'angular2-toaster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { OssRoutingModule } from './oss-routing.module';
import { OssModule } from './oss.module';
import { ServicesModule } from './services/services.module';

@NgModule({
    imports: [
        OssModule,
        BrowserAnimationsModule,
        FormsModule,
        ServicesModule,
        ToasterModule.forRoot(),
        InfiniteScrollModule,
        DragDropModule,
        OssRoutingModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }

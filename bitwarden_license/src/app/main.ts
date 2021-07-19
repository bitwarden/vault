import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import 'bootstrap';
import 'jquery';
import 'popper.js';

// tslint:disable-next-line
require('src/scss/styles.scss');

import { AppModule } from './app.module';

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, { preserveWhitespaces: true });

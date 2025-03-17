import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { enableProdMode } from '@angular/core';
import { environment } from './app/environment';

defineCustomElements(window);
if (environment.production) {
  enableProdMode();
  }

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

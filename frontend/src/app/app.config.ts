import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Reducers
import { documentReducer } from './store/reducers/document.reducer';
import { chatReducer } from './store/reducers/chat.reducer';
import { searchReducer } from './store/reducers/search.reducer';

// Effects
import { DocumentEffects } from './store/effects/document.effects';
import { ChatEffects } from './store/effects/chat.effects';
import { SearchEffects } from './store/effects/search.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideStore({
      documents: documentReducer,
      chat: chatReducer,
      search: searchReducer,
    }),
    provideEffects(),
    DocumentEffects,
    ChatEffects,
    SearchEffects,
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false, // Set to true in production
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../environments/environment';

// Reducers
import { documentReducer } from './reducers/document.reducer';
import { chatReducer } from './reducers/chat.reducer';
import { searchReducer } from './reducers/search.reducer';

// Effects
import { DocumentEffects } from './effects/document.effects';
import { ChatEffects } from './effects/chat.effects';
import { SearchEffects } from './effects/search.effects';

@NgModule({
  imports: [
    StoreModule.forRoot({
      documents: documentReducer,
      chat: chatReducer,
      search: searchReducer,
    }),
    EffectsModule.forRoot([DocumentEffects, ChatEffects, SearchEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
})
export class AppStoreModule {}

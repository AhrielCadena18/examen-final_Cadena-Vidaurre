import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
///////// importar firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

///////// importar httopclient module de forma global
import { HttpClientModule } from '@angular/common/http';
import { NgModel, ReactiveFormsModule } from '@angular/forms';

///// para login y registro ////
import { Auth } from '@angular/fire/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule, ReactiveFormsModule,  AngularFireAuthModule,
      CommonModule),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyDZTFvLty2qMvDNjQWIXx-NARlqQvoSP0I",
      authDomain: "programacion-2-529c3.firebaseapp.com",
      projectId: "programacion-2-529c3",
      storageBucket: "programacion-2-529c3.firebasestorage.app",
      messagingSenderId: "67310190827",
      appId: "1:67310190827:web:082c3d45e56b6da4b0beae",
      measurementId: "G-9BQX38FW8V"
    })),
    ////// para login y registro
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

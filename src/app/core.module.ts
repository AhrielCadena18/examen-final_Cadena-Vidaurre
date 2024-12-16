import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule, // Importamos HttpClientModule aquí para toda la aplicación
  ],
  providers: [
    // Aquí puedes incluir todos los servicios que desees que sean globales
  ]
})
export class CoreModule {
  constructor() {
    console.log('CoreModule cargado.');
  }
}

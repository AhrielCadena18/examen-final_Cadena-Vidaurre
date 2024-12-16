import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgFor } from '@angular/common';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {

  listaProductos = [
    'zapatillas adidas',
    'blusa zara',
    'polera benethon'
  ]
  mensaje = 'Nuestras ofertas de la semana son:';
  figuras: any;
  constructor(
    public auth: AuthService,
    public db: DatabaseService
  ) {
    console.log('ver si esta logueado', auth.verifyIsLogued());
    this.db.fetchFirestoreCollection('figuras')
      .subscribe((res: any) => {
        console.log('datos de firebase', res);
        this.figuras = res;
      })
  }

}

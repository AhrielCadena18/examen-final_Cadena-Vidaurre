import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { CommonModule, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    RouterLink,
    CardComponent,
    NgFor,
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  postsFiltrados: any[] = [];
  allTickets: any[] = [];
  allEvents: any[] = [];
  seeMyTickets: boolean = false;
  seeMyEvents: boolean = true; // Mostrar eventos por defecto
itIsTicket: boolean = false;

  constructor(
    public auth: AuthService,
    public db: DatabaseService
  ) {
    console.log('hola desde perfil component', auth.profile);

    // Obtener eventos subidos por el usuario
    this.db.getDocumentsByField('events', 'owner_user.id', this.auth.profile?.id)
      .subscribe((res: any) => {
        this.allEvents = res;
        this.itIsTicket = false;
        this.updateFilteredPosts();
      });

    // Obtener boletos comprados por el usuario
    this.db.getDocumentsByField('tickets_bought', 'user.id', this.auth.profile?.id)
      .subscribe((res: any) => {
        this.allTickets = res;
        this.itIsTicket = true;
        this.updateFilteredPosts();
      });
  }

  // Alternar entre ver boletos y eventos
  switchView(view: string): void {
    this.seeMyTickets = view === 'tickets';
    this.seeMyEvents = view === 'events';
    this.updateFilteredPosts();
  }

  // Actualizar la lista mostrada según la vista seleccionada
  private updateFilteredPosts(): void {
    if (this.seeMyTickets) {
      this.itIsTicket = true;
      console.log('tickets', this.allTickets);
      this.postsFiltrados = this.allTickets;
      //order first the ones with outstanding ==true
      this.postsFiltrados.sort((a: any, b: any) => {
        if (a.outstanding && !b.outstanding) {
          return -1;
        }
        if (!a.outstanding && b.outstanding) {
          return 1;
        }
        return 0;
      });
    } else if (this.seeMyEvents) {
      this.itIsTicket = false;
      this.postsFiltrados = this.allEvents;
      //order first the ones with outstanding ==true
      this.postsFiltrados.sort((a: any, b: any) => {
        if (a.outstanding && !b.outstanding) {
          return -1;
        }
        if (!a.outstanding && b.outstanding) {
          return 1;
        }
        return 0;
      });
    }
  }
}


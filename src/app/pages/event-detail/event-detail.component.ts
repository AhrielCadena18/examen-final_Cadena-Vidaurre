import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartComponent } from "../../components/cart/cart.component";


@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
  imports: [NgClass, NgFor, NgIf, CartComponent],
  standalone: true
})
export class EventDetailComponent implements OnInit {
  constructor(
    public db: DatabaseService,
    public auth: AuthService,
    private route: ActivatedRoute
  ) {}
  setLike() {
    let likesToUpdate = [...(this.eventData.likes || [])];
  
    if (this.checkLike()) {
      likesToUpdate = likesToUpdate.filter(id => id !== this.auth.profile?.id);
    } else {
      likesToUpdate.push(this.auth.profile?.id);
    }
  
    console.log('likesToUpdate', likesToUpdate);
    if (this.eventData.id) {
      this.eventData.likes = likesToUpdate;
      this.db.updateFirestoreDocument('events', this.eventData.id, this.eventData)
        .then(() => {
          console.log('Datos actualizados correctamente.');
          
          // Vuelve a obtener los datos actualizados del documento
          this.db.getDocumentById('events', this.eventData.id)
          .subscribe((res: any)=>{this.eventData = res;console.log('res', res)})
          console.log('likes', this.eventData);
        })
        .catch(error => {
          console.error('Error al actualizar datos:', error.message);
        });
    } else {
      console.error('No se puede actualizar: ID del documento no definido.');
    }
  }
  

  checkLike() {
    let currentStatus = false;
    return this.eventData.likes?.indexOf(this.auth.profile?.id) >= 0;
  }
addToCart() {
  //confirmar si desea agregar al carrito
  if (!confirm('¿Estás seguro de que deseas agregar este evento a tu carrito?')) {
    return;
  }
  //modify user.cart
  let cartToUpdate = [...(this.auth.profile?.cart || [])];
  if (cartToUpdate.indexOf(this.eventData.id) >= 0) {
    console.error('Este evento ya está en tu carrito.');
    return;
  }
  cartToUpdate.push(this.eventData);
  console.log('cartToUpdate', cartToUpdate);
  let userUpdate = {...this.auth.profile};
  userUpdate.cart = cartToUpdate;
  console.log('userUpdate', userUpdate);
  this.db.updateFirestoreDocument('users', userUpdate.id, userUpdate)
    .then((res) => {
      console.log('Datos actualizados correctamente.');
      console.log('res', res);
    })
    .catch(error => {
      console.error('Error al actualizar datos:', error.message);
    });

  }
  eventId: string | null = null;
  eventData: any = null;

  

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id'); // Obtener el ID del evento
    if (this.eventId) {
      this.db.getDocumentById('events', this.eventId).subscribe((data: any) => {
        this.eventData = data; // Guardar los datos del evento
      });
    }
  }
}

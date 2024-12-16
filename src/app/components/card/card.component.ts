import { Component, Input, OnInit } from '@angular/core';
import { BtnComponent } from '../btn/btn.component';
import { RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, BtnComponent, RouterLink, NgIf, NgFor],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit {
getFormattedDate(arg0: any) {
  //format date into local date time stirng
  arg0 = new Date(arg0);
  return arg0.toLocaleString();
}


  @Input() data: any;
  @Input() showEditButton: boolean = false;
  @Input() itIsTicket: boolean = false;
  toggleInput: boolean = false;
  showComments: boolean = false;
  user: any;
  constructor(
    public db: DatabaseService,
    public auth: AuthService
  ) {
  }

  ngOnInit(): void {
    console.log('data', this.data);
    //console.log('likes', this.data.likes);
    this.db.getDocumentById('users', this.data)
    .subscribe((res: any)=>{this.user = res})
  }

  addToCart() {
    //confirmar si desea agregar al carrito
    if (!confirm('¿Estás seguro de que deseas agregar este evento a tu carrito?')) {
      return;
    }
    //modify user.cart
    let cartToUpdate = [...(this.auth.profile?.cart || [])];
    if (cartToUpdate.indexOf(this.data.id) >= 0) {
      console.error('Este evento ya está en tu carrito.');
      return;
    }
    cartToUpdate.push(this.data);
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
    

  setLike() {
    let likesToUpdate = [...(this.data.likes || [])];
  
    if (this.checkLike()) {
      likesToUpdate = likesToUpdate.filter(id => id !== this.auth.profile?.id);
    } else {
      likesToUpdate.push(this.auth.profile?.id);
    }
  
    console.log('likesToUpdate', likesToUpdate);
    if (this.data.id) {
      this.data.likes = likesToUpdate;
      this.db.updateFirestoreDocument('events', this.data.id, this.data)
        .then(() => {
          console.log('Datos actualizados correctamente.');
          
          // Vuelve a obtener los datos actualizados del documento
          this.db.getDocumentById('events', this.data.id)
          .subscribe((res: any)=>{this.data = res;console.log('res', res)})
          console.log('likes', this.data);
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
    return this.data.likes?.indexOf(this.auth.profile?.id) >= 0;
  }

  borrarEvento() {
    //confirmar si desea borrar
    if (confirm('¿Estás seguro de que deseas borrar este evento?')) {
      //confirmar que el usuario es el dueño del evento
      if (this.auth.profile?.id === this.data.owner_user.id) {
        this.eliminarEvento();
      } else {
        console.error('No puedes borrar un evento que no te pertenece.');
      }
    }
  }

  eliminarEvento() {
    this.db.deleteFirestoreDocument('events', this.data.id)
      .then(() => {
        console.log('Evento eliminado correctamente.');
      })
      .catch(error => {
        console.error('Error al eliminar evento:', error.message);
      });
      //correct it, the scturcture is user.cart[n].id == this.data.id but for every user
      this.db.fetchFirestoreCollection('users')
      .subscribe((res: any) => {
        res.forEach((user: any) => {
          let cartToUpdate = [...(user.cart || [])];
          if (cartToUpdate.find((item: any) => item.id === this.data.id)) {
            cartToUpdate = cartToUpdate.filter((item: any) => item.id !== this.data.id);
            let userUpdate = {...user};
            userUpdate.cart = cartToUpdate;
            this.db.updateFirestoreDocument('users', userUpdate.id, userUpdate)
              .then(() => {
                console.log('Datos actualizados correctamente.');
              })
              .catch(error => {
                console.error('Error al actualizar datos:', error.message);
              });
            }
          });
        });

      
  }
}

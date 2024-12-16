import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import { NgModule } from '@angular/core';
import { TicketBought } from '../objects/ticket_bought';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartOpen: boolean = false;
  cartItems: any[] = [];
  cuponCode: string = '';
  cuponValid: boolean | null = null;
  appliedCupon: any = {}; // Variable to store the coupon details
  discountPercentage: number = 0;

  constructor(private auth: AuthService, private db: DatabaseService) {}

  ngOnInit(): void {
    if (this.auth.profile) {
      this.cartItems = this.auth.profile.cart || [];
      this.subscribeToCart();
    } else {
      console.error('El usuario no está autenticado.');
    }
  }

  toggleCart(): void {
    this.cartOpen = !this.cartOpen;
  }

  checkout(): void {
    if (this.cartItems.length > 0) {
      if (confirm('¿Estás seguro de que deseas comprar estos productos?')) {
        const listOfTickets: TicketBought[] = [];

        this.cartItems.forEach((item) => {
          const newTicket = new TicketBought(
            '',
            new Date().toISOString(),
            item,
            this.auth.profile,
            item.quantity,
            item.price
          );
          listOfTickets.push(newTicket);
        });

        console.log('Tickets comprados:', listOfTickets);

        listOfTickets.forEach((ticket) => {
          const plainTicket = { ...ticket };
          this.db
            .addFirestoreDocument('tickets_bought', plainTicket)
            .then(() => {
              console.log('Ticket subido correctamente.');
            })
            .catch((error) => {
              console.error('Error al subir ticket:', error.message);
            });
        });

        this.cartItems.forEach((item) => {
          this.removeFromCart(item);
        });
      }
    }
  }

  applyCupon(): void {
    // Verificar el cupón ingresado
    this.db
      .fetchFirestoreCollection('cupon')
      .subscribe((cupons: any[]) => {
        const cupon = cupons.find(
          (cupon) => cupon.Code === this.cuponCode.trim()
        );

        if (cupon) {
          // Check if the coupon has expired
          const expirationDate = new Date(cupon.expiration_date);
          if (expirationDate < new Date()) {
            this.cuponValid = false;
            this.appliedCupon = {};
            alert('El cupón ha expirado.');
            return;
          }

          // Store coupon details for display
          this.cuponValid = true;
          this.appliedCupon = cupon;
          this.discountPercentage = cupon.fercent_discount || 0; // Assuming fercent_discount is the percentage
          this.applyDiscount();
        } else {
          this.cuponValid = false;
          this.appliedCupon = {};
          this.discountPercentage = 0;
          alert('Cupón no válido.');
        }
      });
  }

  applyDiscount(): void {
    this.cartItems.forEach((item) => {
      if (this.appliedCupon.discountType === 'percentage') {
        item.price = item.price * (1 - this.discountPercentage / 100);
      } else {
        item.price = item.price - this.appliedCupon.fixed_discount; // Assuming fixed_discount is for a fixed amount
      }
    });
  }

  getDiscountedTotal(): number {
    let total = 0;
    this.cartItems.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      item.price = item.price * item.quantity;
    }
  }

  increaseQuantity(item: any) {
    item.quantity++;
    item.price = item.price * item.quantity;
  }

  removeFromCart(data: any) {
    this.db.fetchFirestoreCollection('users').subscribe((res: any) => {
      res.forEach((user: any) => {
        let cartToUpdate = [...(user.cart || [])];
        if (cartToUpdate.find((item: any) => item.id === data.id)) {
          cartToUpdate = cartToUpdate.filter(
            (item: any) => item.id !== data.id
          );
          let userUpdate = { ...user };
          userUpdate.cart = cartToUpdate;
          this.db
            .updateFirestoreDocument('users', userUpdate.id, userUpdate)
            .then(() => {
              console.log('Datos actualizados correctamente.');
            })
            .catch((error) => {
              console.error('Error al actualizar datos:', error.message);
            });
        }
      });
    });
  }

  updateQuantity(item: any) {
    if (item.quantity < 1) {
      item.quantity = 1;
    }
  }

  private subscribeToCart(): void {
    const userId = this.auth.profile.id;

    this.db.getDocumentById('users', userId).subscribe((userData: any) => {
      if (userData && userData.cart) {
        this.cartItems = userData.cart;
        this.cartItems.forEach((item) => {
          if (!item.quantity) {
            item.quantity = 1;
          }
        });
        console.log('Carrito actualizado:', this.cartItems);
      }
    });
  }
}
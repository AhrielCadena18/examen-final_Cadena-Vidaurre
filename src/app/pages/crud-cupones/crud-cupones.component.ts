import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-crud-cupones',
  standalone: true,
  imports: [
    RouterLink,
    NgFor,
    NgClass,
    NgIf,
    HttpClientModule,
  ],
  templateUrl: './crud-cupones.component.html',
  styleUrls: ['./crud-cupones.component.scss'], // Cambiado de styleUrl a styleUrls
})
export class CrudCuponesComponent implements OnInit, OnDestroy {
  cuponesItems: any[] = [];
  private subscription: Subscription | undefined;

  constructor(public http: HttpClient, public db: DatabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
    Swal.fire({
      title: 'Bienvenido',
      text: 'Aquí podrás ver todos los cupones disponibles',
      icon: 'success',
    });
  }

  ngOnDestroy(): void {
    // Cancelar la suscripción al salir del componente
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async agregarCuponModal() {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Cupón',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nombre">
        <input id="swal-input2" class="swal2-input" placeholder="Cod. Cupón">
        <input id="swal-input3" type="date" class="swal2-input" placeholder="Fecha de expiración (YYYY-MM-DD)">
        <input id="swal-input4" type="number" class="swal2-input" placeholder="Descuento Porcentaje">
        <input id="swal-input5" type="number" class="swal2-input" placeholder="Descuento Monto Fijo">
      `,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const codigo = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const fechaExpiracionDate = (document.getElementById('swal-input3') as HTMLInputElement).value;
        const descuentoPorcentaje = parseFloat((document.getElementById('swal-input4') as HTMLInputElement).value);
        const descuentoMontoFijo = parseFloat((document.getElementById('swal-input5') as HTMLInputElement).value);

        const fechaExpiracion = new Date(fechaExpiracionDate);
        if (!nombre || !codigo || !fechaExpiracion ) {
          Swal.showValidationMessage('Todos los campos son requeridos y deben ser válidos');
          return null;
        }

        return { nombre, codigo, fechaExpiracion, descuentoPorcentaje, descuentoMontoFijo };
      },
    });

    if (formValues) {
      const fechaTimestamp = Timestamp.fromDate(new Date(formValues.fechaExpiracion));
      await this.agregarCupon(
        formValues.nombre,
        formValues.codigo,
        fechaTimestamp,
        formValues.descuentoPorcentaje,
        formValues.descuentoMontoFijo
      );
    }
  }
  getFormattedDate(date: Timestamp) {
    return date.toDate().toLocaleDateString();
  }

  getFormattedDate2(date: Date) {
    return new Date(date);
  
  }

  async eliminarCuponModal(cupon: any) {
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres eliminar este cupón?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (isConfirmed) {
      await this.eliminarCupon(cupon);
    }
  }

  async eliminarCupon(cupon: any) {
    await this.db.deleteFirestoreDocument('cupon', cupon.id);
    await this.loadData();
  }


  async editarCuponModal(cupon: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Cupón',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${cupon.name}">
        <input id="swal-input2" class="swal2-input" placeholder="Cod. Cupón" value="${cupon.Code}">
        <input id="swal-input3" type="date" class="swal2-input" placeholder="Fecha de expiración (YYYY-MM-DD)" value="${this.getFormattedDate2(cupon.expiration_date)}">
        <input id="swal-input4" type="number" class="swal2-input" placeholder="Descuento Porcentaje" value="${cupon.percentage_discount}">
        <input id="swal-input5" type="number" class="swal2-input" placeholder="Descuento Monto Fijo" value="${cupon.fixed_discount}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const codigo = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const fechaExpiracionDate = (document.getElementById('swal-input3') as HTMLInputElement).value;
        const descuentoPorcentaje = parseFloat((document.getElementById('swal-input4') as HTMLInputElement).value);
        const descuentoMontoFijo = parseFloat((document.getElementById('swal-input5') as HTMLInputElement).value);
  
        // Si la fecha es modificada, se usa la nueva fecha; si no, se conserva la fecha original
        const fechaExpiracion = fechaExpiracionDate ? new Date(fechaExpiracionDate) : cupon.expiration_date.toDate();
  
        if (!nombre || !codigo || isNaN(descuentoPorcentaje) || isNaN(descuentoMontoFijo)) {
          Swal.showValidationMessage('Todos los campos son requeridos y deben ser válidos');
          return null;
        }
  
        return { nombre, codigo, fechaExpiracion, descuentoPorcentaje, descuentoMontoFijo };
      },
    });
  
    if (formValues) {
      const fechaTimestamp = Timestamp.fromDate(formValues.fechaExpiracion);
      await this.editarCupon(
        cupon.id,
        formValues.nombre,
        formValues.codigo,
        fechaTimestamp,
        formValues.descuentoPorcentaje,
        formValues.descuentoMontoFijo
      );
  
      await this.loadData();
    }
  }

  async editarCupon(
    id: string,
    nombre: string,
    codigo: string,
    fechaExpiracion: Timestamp,
    descuentoPorcentaje: number,
    descuentoMontoFijo: number
  ) {
    await this.db.updateFirestoreDocument('cupon', id, {
      name: nombre,
      Code: codigo,
      expiration_date: fechaExpiracion,
      percentage_discount: descuentoPorcentaje,
      fixed_discount: descuentoMontoFijo,
    });
  }


  async agregarCupon(
    nombre: string,
    codigo: string,
    fechaExpiracion: Timestamp,
    descuentoPorcentaje: number,
    descuentoMontoFijo: number
  ) {
    await this.db.addFirestoreDocument('cupon', {
      name: nombre,
      Code: codigo,
      expiration_date: fechaExpiracion,
      percentage_discount: descuentoPorcentaje,
      fixed_discount: descuentoMontoFijo,
    });

    await this.loadData();
  }

  async loadData() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.db.fetchFirestoreCollection('cupon').subscribe((res: any) => {
      this.cuponesItems = res;
      console.log('Cupones cargados:', res);
    });
  }
}

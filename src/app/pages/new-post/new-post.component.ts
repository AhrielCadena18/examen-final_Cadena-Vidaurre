import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-new-post',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './new-post.component.html',
  styleUrl: './new-post.component.scss',

})



export class NewPostComponent {
  id: string | null;
  formulario!: FormGroup;
  post: any;
  category: string = '';
  categories = ['Concierto', 'Fiesta', 'Cultura', 'Deportes']; // Opciones de categorías predefinidas
  selectedCategory: string = '';
  selectedFile: any;
  constructor(
    public auth: AuthService,
    public db: DatabaseService,
    private fb: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('identificador');
    this.initForm();

    if (this.id) {
      // Si existe un ID, recuperar los datos del evento
      this.db.getDocumentById('events', this.id).subscribe((res: any) => {
        this.post = res;
        console.log('post', this.post);
        this.populateForm(res);
      });
    }
  }

  // Inicializar el formulario con validadores
  initForm() {
    this.formulario = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      photo: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+$/)]],
      price: ['', [Validators.required, Validators.min(0)]],
      categories: this.fb.array([], Validators.required), // Usamos FormArray para categorías dinámicas
      date: ['', [Validators.required]],
      discount_percentage: ['', [Validators.required]],
      outstanding: ['', [Validators.required]],
      time: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      ubication: ['', [Validators.required]],
      contact_number: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
    });
  }

  // Getter para acceder a las categorías dinámicas
  get categoriesFormArray() {
    return this.formulario.get('categories') as FormArray;
  }

    // Método para manejar el archivo seleccionado
    onFileSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        this.selectedFile = input.files[0];
        console.log('Archivo seleccionado:', this.selectedFile);
      }
    }
  
    // Método para subir el archivo y obtener el enlace
    async uploadFile(): Promise<void> {
      if (!this.selectedFile) return;
  
      const userId = 'user123'; // Reemplaza con el ID real del usuario
      try {
        const downloadURL = await this.db.uploadPhoto(this.selectedFile, userId);
        this.formulario.patchValue({ photo: downloadURL }); // Asigna el enlace al campo 'photo'
      } catch (error) {
        console.error('Error al subir la imagen:', error);
      }
    }
  

  // Agregar una categoría al array
  addCategory(category: string) {
    if (category && !this.categoriesFormArray.value.includes(category)) {
      this.categoriesFormArray.push(this.fb.control(category));
    }
  }

  // Eliminar una categoría del array
  removeCategory(index: number) {
    this.categoriesFormArray.removeAt(index);
  }

  // Rellenar el formulario con datos existentes
  populateForm(data: any) {
    this.formulario.patchValue({
      name: data.name,
      photo: data.photo,
      price: data.price,
      date: data.date,
      time: data.time,
      description: data.description,
      ubication: data.ubication,
      contact_number: data.contact_number,
      discount_percentage: data.discount_percentage,
      outstanding: data.outstanding,

    });

    // Rellenar las categorías si existen
    if (data.categories) {
      data.categories.forEach((category: string) => {
        this.addCategory(category);
      });
    }
  }

  // Guardar los datos del evento
  async storePost() {
    let {
      name,
      photo,
      price,
      date,
      time,
      description,
      ubication,
      contact_number,
      discount_percentage,
      outstanding,
    } = this.formulario.value;

    let category = this.categoriesFormArray.value; // Obtener categorías seleccionadas
    //if category is a simple string convert it to an array with one element
    
    //if the date is null, set it to the current date
    if(date == null){
      date = new Date();
    }
    if(time == null){
      time = "00:00";
    }

    if (this.id) {
      // Actualizar evento existente
      await this.db.updateFirestoreDocument('events', this.id, {
        name,
        photo,
        price,
        category,
        date,
        time,
        description,
        ubication,
        contact_number,
        discount_percentage,
        outstanding

      });
      alert('Evento actualizado');
    } else {
      // Crear nuevo evento
      const owner_user = this.auth.profile;
      owner_user.password = '';
      let nuevoPost = await this.db.addFirestoreDocument('events', {
        name,
        photo,
        price,
        category,
        date,
        time,
        description,
        ubication,
        contact_number,
        discount_percentage,
        outstanding,
        likes: [],
        owner_user: owner_user,
      });
      console.log('nuevoPost', nuevoPost);
      alert('Nuevo evento creado');
    }
    //go to home
    
    this.router.navigateByUrl('/profile');

  }
}

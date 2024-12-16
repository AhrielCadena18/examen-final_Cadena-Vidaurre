import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule
import { DatabaseService } from '../../services/database.service';
import { NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {

  search: any;
  alldata: any; /// aqui vamos a alojar los datos que se muestran en pantalla
  filtered: any;


  constructor(
    public auth: AuthService,
    public db: DatabaseService,
  ) {

    let verificar = auth.verifyIsLogued();
    console.log(verificar);
    console.log(this.search)
    this.loadData();
  }

  loadData() {
    this.db.fetchFirestoreCollection('figuras')
      .subscribe(
        (res: any) => {
          console.log('figuras', res);
          this.alldata = res;
        },
        (error: any) => { console.log('Error: ', error) },
      )
  }

  searchDocument() {
    console.log('buscando', this.search);
    this.filtered = [];
    this.alldata.forEach((i: any) => {
      if (i.name?.indexOf(this.search) >= 0) {
        this.filtered.push(i);
      }
    });
  }

  searchOnChange() {
    console.log('on change', this.search);
    this.filtered = [];
    this.alldata.forEach((i: any) => {
      if (i.name.indexOf(this.search) >= 0) {
        this.filtered.push(i);
      }
    });
  }
}

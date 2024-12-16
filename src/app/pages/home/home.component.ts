import { Component, importProvidersFrom, OnDestroy, OnInit } from '@angular/core';
import { CardComponent } from '../../components/card/card.component';
import { MessageComponent } from '../../components/message/message.component';
import { BtnComponent } from '../../components/btn/btn.component';
/////// paso 1 importar servicio
import { AuthService } from '../../services/auth.service';
import { NgClass, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DatabaseService } from '../../services/database.service';
import { CoreModule } from '../../core.module';
import { TabbarComponent } from '../../components/tabbar/tabbar.component';
import { CartComponent } from "../../components/cart/cart.component";
import { CrudCuponesComponent } from "../crud-cupones/crud-cupones.component";
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NgFor,
    NgClass,
    CardComponent,
    MessageComponent,
    TabbarComponent,
    BtnComponent,
    CartComponent,
    CrudCuponesComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  searchTerm: string = '';
  title: any;
  posts: any;
  postsFiltrados: any;
  tags: any = [];
  tagsMarcados: any = [];
  constructor(
    public http: HttpClient,
    public db: DatabaseService,
    public auth: AuthService /////// paso 2 importar servicio
  ) {
    this.title = 'Home';

  }

  ngOnInit(): void {
    this.loadData();
    console.log('posts', this.posts);
    /* this.db.fetchFirestoreCollection('figuras')
    .subscribe((res: any)=>{
      console.log('res', res)
    }) */
  }

  


  onSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement; // Cast explícito
    const value = inputElement?.value || ''; // Asegura que value nunca sea null
    this.searchTerm = value.toLowerCase();
    this.filtrarEventos();

  }
  

filtrarEventos() {
  this.postsFiltrados = this.posts.filter((post: any) => {
    return post.name?.toLowerCase().includes(this.searchTerm) || post.category?.some((cat: any) => cat.toLowerCase().includes(this.searchTerm));
  });

}
  loadData() {
    console.log('loadData', this.posts);
    this.db.fetchFirestoreCollection('events')
      .subscribe((res: any) => {
        this.postsFiltrados = res;
        this.posts = res;
        console.log('posts', this.posts);
        /// tags para filtros
        this.tags = [];
        this.posts.forEach((e: any) => {
          e.userTags?.forEach((tag: any) => {
            if (this.tags.indexOf(tag) === -1) {
              this.tags.push(tag);
            }
          })
        });



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
   
        
      })
  }

  selectUserTag(tag: any) {
    const index = this.tagsMarcados.indexOf(tag)
    if (index === -1) {
      this.tagsMarcados.push(tag);
    }
    else {
      this.tagsMarcados.splice(index, 1)
    }
    this.filterData()
  }

  filterData() {
    this.postsFiltrados = [];
    for (let i = 0; i < this.posts.length; i++) {
      console.log(this.posts[i])
      for (let j = 0; j < this.posts[i].userTags.length; j++) {
        if (this.tagsMarcados.indexOf(this.posts[i].userTags[j]) >= 0) {
          this.postsFiltrados.push(this.posts[i]);
          break;
        }
      }
    }
  }

}

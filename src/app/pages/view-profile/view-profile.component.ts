import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../components/card/card.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CardComponent, NgFor],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent implements OnInit {

  id: any;
  data: any;
  postsFiltrados: any;
  constructor(
    public db: DatabaseService,
    public activatedRoute: ActivatedRoute
  ) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.db.getDocumentById('users', this.id)
      .subscribe((res: any) => {
        console.log('perfil de usuario', res);
        this.data = res;
      });

    this.db.getDocumentsByField('posts', 'userId', this.id)
      .subscribe((res: any) => {
        console.log('posts filtrados', res);
        this.postsFiltrados = res;
      });
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudCuponesComponent } from './crud-cupones.component';

describe('CrudCuponesComponent', () => {
  let component: CrudCuponesComponent;
  let fixture: ComponentFixture<CrudCuponesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudCuponesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudCuponesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamiliaDetallesPage } from './familia-detalles.page';

describe('FamiliaDetallesPage', () => {
  let component: FamiliaDetallesPage;
  let fixture: ComponentFixture<FamiliaDetallesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliaDetallesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

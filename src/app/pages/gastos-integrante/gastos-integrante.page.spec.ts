import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastosIntegrantePage } from './gastos-integrante.page';

describe('GastosIntegrantePage', () => {
  let component: GastosIntegrantePage;
  let fixture: ComponentFixture<GastosIntegrantePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GastosIntegrantePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

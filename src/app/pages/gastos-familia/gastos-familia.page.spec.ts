import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GastosFamiliaPage } from './gastos-familia.page';

describe('GastosFamiliaPage', () => {
  let component: GastosFamiliaPage;
  let fixture: ComponentFixture<GastosFamiliaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GastosFamiliaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

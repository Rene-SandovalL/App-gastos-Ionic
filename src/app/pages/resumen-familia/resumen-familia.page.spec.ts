import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumenFamiliaPage } from './resumen-familia.page';

describe('ResumenFamiliaPage', () => {
  let component: ResumenFamiliaPage;
  let fixture: ComponentFixture<ResumenFamiliaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenFamiliaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

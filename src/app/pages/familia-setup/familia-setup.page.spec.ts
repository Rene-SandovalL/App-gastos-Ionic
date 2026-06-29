import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamiliaSetupPage } from './familia-setup.page';

describe('FamiliaSetupPage', () => {
  let component: FamiliaSetupPage;
  let fixture: ComponentFixture<FamiliaSetupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliaSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

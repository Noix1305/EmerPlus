import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarUsuarioAdminPage } from './agregar-usuario-admin.page';

describe('AgregarUsuarioAdminPage', () => {
  let component: AgregarUsuarioAdminPage;
  let fixture: ComponentFixture<AgregarUsuarioAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarUsuarioAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

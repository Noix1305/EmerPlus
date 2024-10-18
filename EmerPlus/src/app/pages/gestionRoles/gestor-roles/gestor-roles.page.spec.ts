import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestorRolesPage } from './gestor-roles.page';

describe('GestorRolesPage', () => {
  let component: GestorRolesPage;
  let fixture: ComponentFixture<GestorRolesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestorRolesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarSolicitudPage } from './gestionar-solicitud.page';

describe('GestionarSolicitudPage', () => {
  let component: GestionarSolicitudPage;
  let fixture: ComponentFixture<GestionarSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

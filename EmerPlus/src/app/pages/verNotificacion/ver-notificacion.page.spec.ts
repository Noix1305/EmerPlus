import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerNotificacionPage } from './ver-notificacion.page';

describe('VerNotificacionPage', () => {
  let component: VerNotificacionPage;
  let fixture: ComponentFixture<VerNotificacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerNotificacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UbicacionPage } from './ubicacion.page';

describe('UbicacionPage', () => {
  let component: UbicacionPage;
  let fixture: ComponentFixture<UbicacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UbicacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

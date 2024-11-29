import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasesConocimientoPage } from './bases-conocimiento.page';

describe('BasesConocimientoPage', () => {
  let component: BasesConocimientoPage;
  let fixture: ComponentFixture<BasesConocimientoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasesConocimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

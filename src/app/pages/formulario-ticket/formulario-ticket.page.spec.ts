import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioTicketPage } from './formulario-ticket.page';

describe('FormularioTicketPage', () => {
  let component: FormularioTicketPage;
  let fixture: ComponentFixture<FormularioTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularioTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

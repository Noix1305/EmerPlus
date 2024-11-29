import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarTicketPage } from './gestionar-ticket.page';

describe('GestionarTicketPage', () => {
  let component: GestionarTicketPage;
  let fixture: ComponentFixture<GestionarTicketPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarTicketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

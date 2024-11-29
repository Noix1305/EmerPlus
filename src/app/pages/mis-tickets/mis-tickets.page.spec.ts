import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisTicketsPage } from './mis-tickets.page';

describe('MisTicketsPage', () => {
  let component: MisTicketsPage;
  let fixture: ComponentFixture<MisTicketsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisTicketsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

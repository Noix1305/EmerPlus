import { TestBed } from '@angular/core/testing';

import { TipoTicketServiceService } from './tipo-ticket-service.service';

describe('TipoTicketServiceService', () => {
  let service: TipoTicketServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoTicketServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

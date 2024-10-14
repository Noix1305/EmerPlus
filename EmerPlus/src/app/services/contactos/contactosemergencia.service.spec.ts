import { TestBed } from '@angular/core/testing';

import { ContactosemergenciaService } from './contactosemergencia.service';

describe('ContactosemergenciaService', () => {
  let service: ContactosemergenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactosemergenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

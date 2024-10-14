import { TestBed } from '@angular/core/testing';

import { SolicitudDeEmergenciaService } from './solicitud-de-emergencia.service';

describe('SolicitudDeEmergenciaService', () => {
  let service: SolicitudDeEmergenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudDeEmergenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

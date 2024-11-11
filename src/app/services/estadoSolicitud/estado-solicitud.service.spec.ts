import { TestBed } from '@angular/core/testing';

import { EstadoSolicitudService } from './estado-solicitud.service';

describe('EstadoSolicitudService', () => {
  let service: EstadoSolicitudService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoSolicitudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

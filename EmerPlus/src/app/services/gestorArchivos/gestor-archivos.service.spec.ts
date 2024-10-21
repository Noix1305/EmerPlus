import { TestBed } from '@angular/core/testing';

import { GestorArchivosService } from './gestor-archivos.service';

describe('GestorArchivosService', () => {
  let service: GestorArchivosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestorArchivosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

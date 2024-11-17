import { TestBed } from '@angular/core/testing';

import { EncriptadorService } from './encriptador.service';

describe('EncriptadorService', () => {
  let service: EncriptadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncriptadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

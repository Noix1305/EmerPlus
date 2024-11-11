import { TestBed } from '@angular/core/testing';

import { RegionComunaService } from './region-comuna.service';

describe('RegionComunaService', () => {
  let service: RegionComunaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionComunaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

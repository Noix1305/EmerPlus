import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isTecnicoGuard } from './is-tecnico.guard';

describe('isTecnicoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isTecnicoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

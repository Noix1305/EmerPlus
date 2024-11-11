import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isUsuarioGuard } from './is-usuario.guard';

describe('isUsuarioGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isUsuarioGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

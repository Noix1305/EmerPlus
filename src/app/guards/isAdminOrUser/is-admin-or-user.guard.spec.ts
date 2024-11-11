import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isAdminOrUserGuard } from './is-admin-or-user.guard';

describe('isAdminOrUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isAdminOrUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

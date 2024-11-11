import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isStaffGuard } from './is-staff.guard';

describe('isStaffGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isStaffGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

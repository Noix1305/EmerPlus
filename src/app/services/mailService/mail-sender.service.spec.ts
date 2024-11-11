import { TestBed } from '@angular/core/testing';

import { MailSenderService } from './mail-sender.service';

describe('MailSenderService', () => {
  let service: MailSenderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MailSenderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

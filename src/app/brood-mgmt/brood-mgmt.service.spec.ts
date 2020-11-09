import { TestBed } from '@angular/core/testing';

import { BroodMgmtService } from './brood-mgmt.service';

describe('BroodMgmtService', () => {
  let service: BroodMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BroodMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

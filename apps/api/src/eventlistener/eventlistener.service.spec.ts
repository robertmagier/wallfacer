import { Test, TestingModule } from '@nestjs/testing';
import { EventlistenerService } from './eventlistener.service';

describe('EventlistenerService', () => {
  let service: EventlistenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventlistenerService],
    }).compile();

    service = module.get<EventlistenerService>(EventlistenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

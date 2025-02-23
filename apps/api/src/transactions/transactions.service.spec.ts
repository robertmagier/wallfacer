import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { DepositEvent } from './entities/depositEvent.entity';
import { WithdrawEvent } from './entities/withdrawEvent.entity';
import { Aggregates } from './entities/aggregates.entity';

const mockDepositRepository = () => ({
  save: jest.fn(),
});

const mockWithdrawalRepository = () => ({
  save: jest.fn(),
});

const mockAggregateRepository = () => ({
  findBy: jest.fn(()=>
    [
      {
        owner: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
        transaction_type: 'deposit',
        total_assets: '3320011659',
        total_shares: '3146678009',
        transaction_count: 1,
      }]),
      
      save: jest.fn(),
});

const mockDataSource = () => ({
  query: jest.fn(),
});

describe('TransactionsService', () => {
  let service: TransactionsService;
  let depositRepository: Repository<DepositEvent>;
  let aggregateRepository: Repository<Aggregates>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: getRepositoryToken(DepositEvent), useFactory: mockDepositRepository },
        { provide: getRepositoryToken(WithdrawEvent), useFactory: mockWithdrawalRepository },
        { provide: getRepositoryToken(Aggregates), useFactory: mockAggregateRepository },
        { provide: DataSource, useFactory: mockDataSource },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    depositRepository = module.get<Repository<DepositEvent>>(getRepositoryToken(DepositEvent));
    aggregateRepository = module.get<Repository<Aggregates>>(getRepositoryToken(Aggregates));
  });

  it('should call save on the deposit repository when addDeposits is called', async () => {
    const depositData: Partial<DepositEvent>[] = [
      {
        sender: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
        owner: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
        assets: '3320011659',
        shares: '3146678009',
        block: '26725073',
        index: 280,
        timestamp: new Date(),
      },
    ];

    await service.addDeposits(depositData);

    expect(depositRepository.save).toHaveBeenCalledWith(depositData[0]);
    expect(aggregateRepository.findBy).toHaveBeenCalled();
    expect(aggregateRepository.save).toHaveBeenCalled();
  });
});

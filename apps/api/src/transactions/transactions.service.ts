import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DepositEvent } from './entities/depositEvent.entity';
import { WithdrawEvent } from './entities/withdrawEvent.entity';
import BigNumber from 'bignumber.js';
import { Aggregates } from './entities/aggregates.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private testCount = 0;
  constructor(
    @InjectRepository(DepositEvent) private depositRepository: Repository<DepositEvent>,
    @InjectRepository(WithdrawEvent) private withdrawalRepository: Repository<WithdrawEvent>,
    @InjectRepository(Aggregates) private aggregateRepository: Repository<Aggregates>,
    private dataSource: DataSource,
  ) {}

  async addDeposits(data: Partial<DepositEvent>[]): Promise<void> {
    for (let i = 0; i < data.length; i++) {
      try {
        await this.depositRepository.save(data[i]);
        await this.updateAggregates(data[i], 'deposit');
      } catch (e) {
        this.logger.error('Error saving deposit', e.detail);
        throw e
      }
    }
  }

  async getLastBlock(): Promise<string> {
    const depositBlock = await this.dataSource.query('SELECT MAX(block) as block FROM deposits');
    const withdrawalBlock = await this.dataSource.query('SELECT MAX(block) as block FROM withdrawals');
    const maxBlock =
      new BigNumber(depositBlock[0].block).comparedTo(withdrawalBlock[0].block) > 0 ? depositBlock[0].block : withdrawalBlock[0].block;
    return maxBlock?.toString() || null;
  }

  async addWithdrawals(data: Partial<WithdrawEvent>[]): Promise<void> {
    for (let i = 0; i < data.length; i++) {
      try {
        await this.withdrawalRepository.save(data[i]);
        await this.updateAggregates(data[i], 'withdrawal');
      } catch (e) {
        this.logger.error('Error saving withdrawal', e.detail);
        throw e
      }
    }
  }

  private async updateAggregates(data: Partial<DepositEvent> | Partial<WithdrawEvent>, transaction_type: 'withdrawal' | 'deposit'): Promise<void> {
    const aggregates = await this.aggregateRepository.findBy({ owner: data.owner, transaction_type });
    if (aggregates.length > 1) {
      throw new Error('More than one aggregate found');
    }
    const aggregate = aggregates[0];

    if (aggregate) {
      aggregate.total_assets = new BigNumber(aggregate.total_assets).plus(data.assets).toString();
      aggregate.total_shares = new BigNumber(aggregate.total_shares).plus(data.shares).toString();
      aggregate.transaction_count = parseInt(aggregate.transaction_count as any as  string) + 1;
      await this.aggregateRepository.save(aggregate);
    } else {
      await this.aggregateRepository.save({
        owner: data.owner,
        total_assets: data.assets,
        total_shares: data.shares,
        transaction_type,
        transaction_count: 1,
      });
    }
  }

  async getLastDeposits(limit: number): Promise<DepositEvent[]> {
    return this.depositRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getLastWithdrawals(limit: number): Promise<WithdrawEvent[]> {
    return this.withdrawalRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getAggregatesOwners(): Promise<Aggregates[]> {
    // get entries grouped by owner
    return this.aggregateRepository.query(`
      SELECT owner FROM aggregates GROUP BY owner
    `);
  }

  async testInsert(): Promise<string | InternalServerErrorException> {
    const deposit = {
      sender: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
      owner: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
      assets: '3320011659',
      shares: '3146678009',
      block: '26725073',
      index: 280 + this.testCount++,
      timestamp: new Date(),
    };
    console.log('Inserting deposit:', deposit);

    try {
      await this.addDeposits([deposit]);
    } catch (e) {
      console.error('Error saving deposit', e);
      // throw '❌ Error saving deposit';
      return new InternalServerErrorException('Error saving deposit');
    }

    const withdrawal = {
      sender: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
      owner: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
      receiver: '0x827CB1C854B7037B9D158eeD240e37b1c6d03B0D',
      assets: '3320011659',
      shares: '3146678009',
      block: '26725073',
      index: 280 + this.testCount++,
      timestamp: new Date(),
    };
    console.log('Inserting withdrawal:', withdrawal);

    try {
      await this.addWithdrawals([withdrawal]);
    } catch (e) {
      console.error('Error saving withdrawal', e);
      return new InternalServerErrorException('Error saving withdrawal');
      
    }

    return '✅ Deposit and withftawal saved successfully';
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DepositEvent } from './entities/depositEvent.entity';
import { WithdrawEvent } from './entities/withdrawEvent.entity';
import BigNumber from 'bignumber.js';
import { Aggregates } from './entities/aggregates.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    @InjectRepository(DepositEvent) private depositRepository: Repository<DepositEvent>,
    @InjectRepository(WithdrawEvent) private withdrawalRepository: Repository<WithdrawEvent>,
    @InjectRepository(Aggregates) private aggregateRepository: Repository<Aggregates>,
    private dataSource: DataSource,
  ) {}

  async addDeposits(data: Partial<DepositEvent>[]): Promise<void> {
    this.logger.debug('Saving deposits', JSON.stringify(data));
    for (let i = 0; i < data.length; i++) {
      try {
        await this.depositRepository.save(data[i]);
      } catch (e) {
        this.logger.error('Error saving deposit', e.detail);
      }
    }
  }

  async getLastBlock(): Promise<string> {
    const depositBlock = await this.dataSource.query('SELECT MAX(block) as block FROM deposits');
    const withdrawalBlock = await this.dataSource.query('SELECT MAX(block) as block FROM withdrawals');
    const maxBlock = new BigNumber(depositBlock[0].block).comparedTo(withdrawalBlock[0].block) > 0 ? depositBlock[0].block : withdrawalBlock[0].block;
    return maxBlock.toString()
  }

  async addWithdrawals(data: Partial<WithdrawEvent>[]): Promise<void> {
    for (let i = 0; i < data.length; i++) {
      try {
        await this.withdrawalRepository.save(data[i]);
      } catch (e) {
        this.logger.error('Error saving withdrawal', e.detail);
      }
    }
  }

  // private async updateAggregate(address: string, assets: string, shares: string, receiver?: string) {
  //   // Find existing aggregate for the address
  //   let aggregate = await this.aggregateRepository.findOneBy({ address });

  //   if (!aggregate) {
  //     // If no aggregate exists, create a new one
  //     aggregate = this.aggregateRepository.create({
  //       address,
  //       total_assets: assets,
  //       total_shares: shares,
  //     });
  //   } else {
  //     // Update existing aggregate by adding assets and shares
  //     aggregate.total_assets = (BigInt(aggregate.total_assets) + BigInt(assets)).toString();
  //     aggregate.total_shares = (BigInt(aggregate.total_shares) + BigInt(shares)).toString();
  //   }

  //   // Update aggregate for the receiver as well if it's a withdrawal
  //   if (receiver) {
  //     let receiverAggregate = await this.aggregateRepository.findOneBy({ address: receiver });
  //     if (!receiverAggregate) {
  //       receiverAggregate = this.aggregateRepository.create({
  //         address: receiver,
  //         total_assets: assets,
  //         total_shares: shares,
  //       });
  //     } else {
  //       receiverAggregate.total_assets = (BigInt(receiverAggregate.total_assets) + BigInt(assets)).toString();
  //       receiverAggregate.total_shares = (BigInt(receiverAggregate.total_shares) + BigInt(shares)).toString();
  //     }

  //     await this.aggregateRepository.save(receiverAggregate);
  //   }

  //   await this.aggregateRepository.save(aggregate);
  // }
}

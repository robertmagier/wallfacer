import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsGateway } from './transactions.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositEvent } from './entities/depositEvent.entity';
import { WithdrawEvent } from './entities/withdrawEvent.entity';
import { Aggregates } from './entities/aggregates.entity';
import { DepositSubscriber } from './subscribers/deposit.subscriber';
import { TransactionsController } from './transactions.controller';
import { WithdrawalSubscriber } from './subscribers/withdrawal.subscriber';
import { AggreagateSubscriber } from './subscribers/aggregate.subscriber';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepositEvent, WithdrawEvent, Aggregates]),// Import the entities
  ],
  providers: [TransactionsService,DepositSubscriber,WithdrawalSubscriber,AggreagateSubscriber,TransactionsGateway],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}

import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsGateway } from './transactions.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositEvent } from './entities/depositEvent.entity';
import { WithdrawEvent } from './entities/withdrawEvent.entity';
import { Aggregates } from './entities/aggregates.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DepositEvent, WithdrawEvent, Aggregates]), // Import the entities
  ],
  providers: [TransactionsGateway, TransactionsService],
})
export class TransactionsModule {}

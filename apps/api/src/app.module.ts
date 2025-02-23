import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EventListenerService } from './eventlistener/eventlistener.service';
import { TransactionsModule } from './transactions/transactions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositEvent } from './transactions/entities/depositEvent.entity';
import { WithdrawEvent } from './transactions/entities/withdrawEvent.entity';
import { TransactionsService } from './transactions/transactions.service';
import { Aggregates } from './transactions/entities/aggregates.entity';
import { DepositSubscriber } from './transactions/subscribers/deposit.subscriber';
import { TransactionsGateway } from './transactions/transactions.gateway';
import { TransactionsController } from './transactions/transactions.controller';
import { WithdrawalSubscriber } from './transactions/subscribers/withdrawal.subscriber';
import { AggreagateSubscriber } from './transactions/subscribers/aggregate.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [DepositEvent, WithdrawEvent, Aggregates],
      synchronize: true, // Set to false for production
      autoLoadEntities: true,
      // subscribers: [DepositSubscriber],
    }),
    TypeOrmModule.forFeature([DepositEvent, WithdrawEvent, Aggregates]), // Import the entities
    // TransactionsModule,
  ],
  controllers: [AppController,TransactionsController],
  providers: [AppService, TransactionsService, DepositSubscriber,WithdrawalSubscriber,AggreagateSubscriber, TransactionsGateway, EventListenerService],
})
export class AppModule {
  constructor() {
    console.log('Subscribers dir:', __dirname + '/transactions/subscribers/*.subscriber{.ts,.js}');
  }
}

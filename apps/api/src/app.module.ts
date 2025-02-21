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

@Module({
  imports: [ConfigModule.forRoot(), 
    TypeOrmModule.forRoot({
      type: 'postgres',  
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [DepositEvent, WithdrawEvent],
      synchronize: true,  // Set to false for production
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([DepositEvent, WithdrawEvent]), // Import the entities
    TransactionsModule

  ],
  controllers: [AppController],
  providers: [AppService, EventListenerService,TransactionsService],
})
export class AppModule {}

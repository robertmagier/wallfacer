import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent,Connection } from 'typeorm';
import { DepositEvent } from '../entities/depositEvent.entity';
import { TransactionsGateway } from '../transactions.gateway';
import { Injectable, Logger } from '@nestjs/common';

// @Injectable()
@EventSubscriber()
export class DepositSubscriber implements EntitySubscriberInterface<DepositEvent> {
  private logger = new Logger(DepositSubscriber.name);

  constructor(private readonly connection: Connection,private readonly transactionsGateway: TransactionsGateway) {
    this.logger.log('Deposit subscriber initialized', JSON.stringify(transactionsGateway));
    connection.subscribers.push(this);
  }

  listenTo() {
    return DepositEvent;
  }

  afterInsert(event: InsertEvent<DepositEvent>) {
    // console.log(event)
    console.log('New deposit detected:', event.entity);

    try {
      this.transactionsGateway.notifyClients('deposit_changes', event.entity);
    } catch (e) {
      console.error('Error notifying clients:', e);
    }
  }

  afterUpdate(event: UpdateEvent<DepositEvent>) {
    console.log('Deposit updated:', event.entity);
    this.transactionsGateway.notifyClients('deposit_changes', event.entity);
  }
}

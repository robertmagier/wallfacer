import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent,Connection } from 'typeorm';
import { TransactionsGateway } from '../transactions.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { WithdrawEvent } from '../entities/withdrawEvent.entity';

// @Injectable()
@EventSubscriber()
export class WithdrawalSubscriber implements EntitySubscriberInterface<WithdrawEvent> {
  private logger = new Logger(WithdrawalSubscriber.name);

  constructor(private readonly connection: Connection,private readonly transactionsGateway: TransactionsGateway) {
    this.logger.log('Withdrawal subscriber initialized', JSON.stringify(transactionsGateway));
    connection.subscribers.push(this);
  }

  listenTo() {
    return WithdrawEvent;
  }

  afterInsert(event: InsertEvent<WithdrawEvent>) {
    // console.log(event)
    console.log('New withdrawal detected:', event.entity);

    try {
      this.transactionsGateway.notifyClients('withdrawal_changes', event.entity);
    } catch (e) {
      console.error('Error notifying clients:', e);
    }
  }

  afterUpdate(event: UpdateEvent<WithdrawEvent>) {
    console.log('Withdrawal updated:', event.entity);
    this.transactionsGateway.notifyClients('withdrawal_changes', event.entity);
  }
}

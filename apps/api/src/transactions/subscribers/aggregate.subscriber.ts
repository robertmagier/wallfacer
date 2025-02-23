import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent,Connection } from 'typeorm';
import { TransactionsGateway } from '../transactions.gateway';
import { Injectable, Logger } from '@nestjs/common';
import { Aggregates } from '../entities/aggregates.entity';

// @Injectable()
@EventSubscriber()
export class AggreagateSubscriber implements EntitySubscriberInterface<Aggregates> {
  private logger = new Logger(AggreagateSubscriber.name);

  constructor(private readonly connection: Connection,private readonly transactionsGateway: TransactionsGateway) {
    this.logger.log('Agggreagtes subscriber initialized', JSON.stringify(transactionsGateway));
    connection.subscribers.push(this);
  }

  listenTo() {
    return Aggregates;
  }

  afterInsert(event: InsertEvent<Aggregates>) {
    // console.log(event)
    console.log('New aggreagate detected:', event.entity);

    try {
      this.transactionsGateway.notifyClients('aggregate_changes', event.entity);
    } catch (e) {
      console.error('Error notifying clients:', e);
    }
  }

  afterUpdate(event: UpdateEvent<Aggregates>) {
    console.log('Aggregate updated:', event.entity);
    this.transactionsGateway.notifyClients('aggregate_changes', event.entity);
  }
}

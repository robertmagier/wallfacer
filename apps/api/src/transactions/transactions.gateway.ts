import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@WebSocketGateway()
export class TransactionsGateway {
  constructor(private readonly transactionsService: TransactionsService) {}

  @SubscribeMessage('createTransaction')
  create(@MessageBody() createTransactionDto: CreateTransactionDto) {
    // return this.transactionsService.create(createTransactionDto);
  }

  @SubscribeMessage('findAllTransactions')
  findAll() {
    // return this.transactionsService.findAll();
  }

  @SubscribeMessage('findOneTransaction')
  findOne(@MessageBody() id: number) {
    // return this.transactionsService.findOne(id);
  }

  @SubscribeMessage('updateTransaction')
  update(@MessageBody() updateTransactionDto: UpdateTransactionDto) {
    // return this.transactionsService.update(updateTransactionDto.id, updateTransactionDto);
  }

  @SubscribeMessage('removeTransaction')
  remove(@MessageBody() id: number) {
    // return this.transactionsService.remove(id);
  }
}

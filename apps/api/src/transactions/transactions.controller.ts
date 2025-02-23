import { Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('test-insert')
  async testInsert() {
    return this.transactionsService.testInsert();
  }

  @Get('deposits')
  async getDeposits() {
    return this.transactionsService.getLastDeposits(10);
  }

  @Get('withdrawals')
  async getWithdrawals() {
    return this.transactionsService.getLastWithdrawals(10);
  }

  @Get('aggregates_owners')
  async getAggregates() {
    return this.transactionsService.getAggregatesOwners();
  }
}

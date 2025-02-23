import { Controller, Get, Param, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('test-insert')
  async testInsert() {
    return this.transactionsService.testInsert();
  }

  @Get('deposits/:last')
  async getDeposits(@Param('last') last: number) {
    return this.transactionsService.getLastDeposits(last || 1);
  }

  @Get('withdrawals/:last')
  async getWithdrawals(@Param('last') last: number) {
    return this.transactionsService.getLastWithdrawals(last || 1);
  }

  @Get('aggregates_owners')
  async getAggregates() {
    return this.transactionsService.getAggregatesOwners();
  }
}

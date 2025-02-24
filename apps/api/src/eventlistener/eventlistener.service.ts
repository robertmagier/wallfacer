import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ethers, Transaction } from 'ethers';
import { FUSDC_ABI__factory } from 'src/contracts';
import { FUSDC_ABI, FUSDC_ABIInterface } from 'src/contracts/FUSDC_ABI';
import { BlockDetails, DepositEventDetails, WithdrawEventDetails } from './eventslistener.types';
import BigNumber from 'bignumber.js';
import { TransactionsService } from 'src/transactions/transactions.service';

const CHUNK_SIZE = 1000;
const HISTORY_BLOCKS = 4000;
const PROVIDER_URL = 'https://base-mainnet.infura.io/v3';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private logger: Logger = new Logger(EventListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: FUSDC_ABI;
  private interface = new ethers.Interface(FUSDC_ABI__factory.abi) as FUSDC_ABIInterface;
  private FUSDC_ADDRESS = process.env.FUSDC_ADDRESS;
  private blocksDetails: BlockDetails = {} as BlockDetails;

  constructor(private transactionsService: TransactionsService) {
    this.logger.log('EventListenerService initialized');
  }

  async onModuleInit() {
    this.logger.log('EventListenerService is running');
    const lastBlockInDb = await this.transactionsService.getLastBlock();
    this.logger.log(`Last block: ${lastBlockInDb}`);

    this.provider = new ethers.JsonRpcProvider(`${PROVIDER_URL}/${process.env.INFURA_API_KEY}`);
    this.contract = FUSDC_ABI__factory.connect(this.FUSDC_ADDRESS, this.provider);
    let currentBlock;
    try {
      currentBlock = await this.provider.getBlockNumber();
    } catch (e) {
      this.logger.error('Error getting current block', e);
      currentBlock = null;
    }
    const startBlock = lastBlockInDb ? BigInt(lastBlockInDb) + BigInt(1) : currentBlock - HISTORY_BLOCKS;

    // setTimeout(async () => {
    //   await this.getDepositEvent(BigInt(26751928) - BigInt(1), BigInt(26751928));
    // }, 10000);
    // }, 10000);
    if (currentBlock) {
      this.provider.on('block', async (blockNumber) => {
        this.logger.debug(`Get block information for block ${blockNumber.toString()}`);
        const deposits = await this.getDepositEvent(BigInt(blockNumber) - BigInt(1), BigInt(blockNumber));
        const withdraws = await this.getWithdrawEvent(BigInt(blockNumber) - BigInt(1), BigInt(blockNumber));
      });
      setTimeout(async () => {
        await this.getHistoricalLogs(startBlock, currentBlock);
      }, 10000);
    }
  }

  private async getEvent<T extends DepositEventDetails | WithdrawEventDetails>(
    fromBlock: BigInt,
    toBlock: BigInt,
    topics: ethers.TopicFilter,
  ): Promise<T[]> {
    const data: T[] = [] as T[];
    try {
      const logs = await this.provider.getLogs({
        fromBlock: fromBlock as ethers.BlockTag,
        toBlock: toBlock as ethers.BlockTag,
        address: this.FUSDC_ADDRESS,
        topics,
      });
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const logData = await this.parseLog<T>(log);
        data.push(logData);
      }
    } catch (e) {
      this.logger.error('Error getting logs', e);
      return [];
    }
    return data;
  }

  private async getDepositEvent(fromBlock: BigInt, toBlock: BigInt): Promise<DepositEventDetails[]> {
    const depositFilter = this.contract.filters.Deposit(null, null, null);
    const topics = await depositFilter.getTopicFilter();
    const events = await this.getEvent<DepositEventDetails>(fromBlock, toBlock, topics);
    console.log(events);
    const dbEvents = events.map((event) => {
      return {
        ...event,
        assets: event.assets.toString(),
        shares: event.shares.toString(),
        block: event.block.toString(),
        timestamp: new Date(event.timestamp * 1000),
      };
    });
    try {
        await this.transactionsService.addDeposits(dbEvents);
    } catch(e) {
        this.logger.error('Error saving deposits', e);
    }
    return events;
  }

  private async getWithdrawEvent(fromBlock: BigInt, toBlock: BigInt): Promise<WithdrawEventDetails[]> {
    const withdrawFilter = this.contract.filters.Withdraw(null, null, null);
    const topics = await withdrawFilter.getTopicFilter();
    const events = await this.getEvent<WithdrawEventDetails>(fromBlock, toBlock, topics);
    const dbEvents = events.map((event) => {
      return {
        ...event,
        assets: event.assets.toString(),
        shares: event.shares.toString(),
        block: event.block.toString(),
        timestamp: new Date(event.timestamp * 1000),
      };
    });
    try {
        const result = await this.transactionsService.addWithdrawals(dbEvents);
    } catch(e) {
        this.logger.error('Error saving withdrawals', e);
    }
    return events;
  }

  private async parseLog<T extends DepositEventDetails | WithdrawEventDetails>(log: ethers.Log): Promise<T> {
    const parsedLog = this.interface.parseLog(log);
    const logData: T = {} as T;
    parsedLog.fragment.inputs.forEach((input, index) => {
      logData[input.name] = parsedLog.args[index];
    });
    logData.name = parsedLog.name;
    logData.block = log.blockNumber;
    logData.index = log.index;
    try {
        logData.timestamp = await this.getBlockTimestamp(log.blockNumber.toString());
    } catch(e) {
        this.logger.error('Error getting block timestamp', e);
    }
    return logData;
  }

  private async getBlockTimestamp(blockNumber: string): Promise<number> {
    if (this.blocksDetails[blockNumber]) {
      return this.blocksDetails[blockNumber];
    }
    const block = await this.provider.getBlock(BigInt(blockNumber));
    this.blocksDetails[blockNumber] = block.timestamp;
    return block.timestamp;
  }

  private async getHistoricalLogs(startBlock: ethers.BlockTag, endBlock: ethers.BlockTag): Promise<void> {
    const fromBlock: BigNumber = BigNumber(startBlock.toString());
    const toBlock: BigNumber = BigNumber(endBlock.toString());

    let start = fromBlock;
    while (start.lt(toBlock)) {
      let end = start.plus(CHUNK_SIZE);
      if (end.gt(toBlock)) {
        end = toBlock;
      }

      this.logger.debug('Getting logs for block range: ' + start.toString() + ' to ' + end.toString());

      const deposits = await this.getDepositEvent(BigInt(start.toString()), BigInt(end.toString()));
      const withdraws = await this.getWithdrawEvent(BigInt(start.toString()), BigInt(end.toString()));

      console.log(deposits);
      console.log(withdraws);

      start = start.plus(CHUNK_SIZE);
    }
  }
}

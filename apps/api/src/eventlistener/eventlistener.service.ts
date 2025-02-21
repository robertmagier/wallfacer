import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { FUSDC_ABI__factory } from 'src/contracts';
import { FUSDC_ABI, FUSDC_ABIInterface } from 'src/contracts/FUSDC_ABI';
import { DepositEventDetails, WithdrawEventDetails } from './eventslistener.types';
import BigNumber from 'bignumber.js';

const CHUNK_SIZE = 100;
const HISTORY_BLOCKS = 3000;
const PROVIDER_URL = 'https://base-mainnet.infura.io/v3';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private logger: Logger = new Logger(EventListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: FUSDC_ABI;
  private interface = new ethers.Interface(FUSDC_ABI__factory.abi) as FUSDC_ABIInterface;
  private FUSDC_ADDRESS = process.env.FUSDC_ADDRESS;
  constructor() {
    this.logger.log('EventListenerService initialized');
  }

  async onModuleInit() {
    this.logger.log('EventListenerService is running');
    this.provider = new ethers.JsonRpcProvider(`${PROVIDER_URL}/${process.env.INFURA_API_KEY}`);
    this.provider.getNetwork().then((network) => {
      this.logger.log(`Network: ${network.name}`);
    });
    this.contract = FUSDC_ABI__factory.connect(this.FUSDC_ADDRESS, this.provider);
    const latestBlock: ethers.BlockTag = await this.provider.getBlockNumber();
    await this.getHistoricalLogs(latestBlock - HISTORY_BLOCKS, latestBlock);

    this.provider.on('block', async (blockNumber) => {
      this.logger.log(`Block number: ${blockNumber}`);
    });
  }

  private async getEvent<T extends DepositEventDetails | WithdrawEventDetails>(
    fromBlock: BigInt,
    toBlock: BigInt,
    topics: ethers.TopicFilter,
  ): Promise<T[]> {
    const data: T[] = [] as T[];
    const logs = await this.provider.getLogs({
      fromBlock: fromBlock as ethers.BlockTag,
      toBlock: toBlock as ethers.BlockTag,
      address: this.FUSDC_ADDRESS,
      topics,
    });
    logs.forEach((log) => {
      const logData = this.parseLog<T>(log);
      data.push(logData);
    });
    return data;
  }

  private async getDepositEvent(fromBlock: BigInt, toBlock: BigInt): Promise<DepositEventDetails[]> {
    const depositFilter = this.contract.filters.Deposit(null, null, null);
    const topics = await depositFilter.getTopicFilter();
    return this.getEvent<DepositEventDetails>(fromBlock, toBlock, topics);
  }

  private async getWithdrawEvent(fromBlock: BigInt, toBlock: BigInt): Promise<WithdrawEventDetails[]> {
    const withdrawFilter = this.contract.filters.Withdraw(null, null, null);
    const topics = await withdrawFilter.getTopicFilter();
    return this.getEvent<WithdrawEventDetails>(fromBlock, toBlock, topics);
  }

  private parseLog<T extends DepositEventDetails | WithdrawEventDetails>(log: ethers.Log): T {
    const parsedLog = this.interface.parseLog(log);
    const logData: T = {} as T;
    parsedLog.fragment.inputs.forEach((input, index) => {
      logData[input.name] = parsedLog.args[index];
    });
    logData.name = parsedLog.name;
    logData.block = log.blockNumber;
    logData.index = log.index;
    return logData;
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

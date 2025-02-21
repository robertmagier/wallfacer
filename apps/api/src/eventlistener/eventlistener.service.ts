import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { FUSDC_ABI__factory } from 'src/contracts';
import { FUSDC_ABI, FUSDC_ABIInterface } from 'src/contracts/FUSDC_ABI';
import { DepositEventDetails } from './eventslistener.types';
import BigNumber from 'bignumber.js';

const CHUNK_SIZE = 100;
const HISTORY_BLOCKS = 2000;

@Injectable()
export class EventListenerService implements OnModuleInit {
  private logger: Logger = new Logger(EventListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: FUSDC_ABI;
  private interface = new ethers.Interface(FUSDC_ABI__factory.abi) as FUSDC_ABIInterface;

  constructor() {
    this.logger.log('EventListenerService initialized');
  }

  async onModuleInit() {
    this.logger.log('EventListenerService is running');
    this.provider = new ethers.JsonRpcProvider('https://base-mainnet.infura.io/v3/3373edb6a0524e44a61b76d03541e5c1');
    this.provider.getNetwork().then((network) => {
      this.logger.log(`Network: ${network.name}`);
    });
    this.contract = FUSDC_ABI__factory.connect('0xf42f5795D9ac7e9D757dB633D693cD548Cfd9169', this.provider);
    const latestBlock: ethers.BlockTag = await this.provider.getBlockNumber();
    await this.getHistoricalLogs(latestBlock - HISTORY_BLOCKS, latestBlock);

    this.provider.on('block', async (blockNumber) => {
      this.logger.log(`Block number: ${blockNumber}`);
    });
  }

  private async getDepositEvent(fromBlock: BigInt, toBlock: BigInt): Promise<DepositEventDetails[]> {
    const depositFilter = this.contract.filters.Deposit(null, null, null);
    const address = await this.contract.getAddress();
    const topics = await depositFilter.getTopicFilter();

    const data: DepositEventDetails[] = [] as DepositEventDetails[];
    const logs = await this.provider.getLogs({
      fromBlock: fromBlock as ethers.BlockTag,
      toBlock: toBlock as ethers.BlockTag,
      address,
      topics,
    });
    logs.forEach((log) => {
      const parsedLog = this.interface.parseLog(log);
      this.logger.log(`Block number: ${log.blockNumber} ${parsedLog.name} Index: ${log.index}`);
      const logData = this.parseLog<DepositEventDetails>(log);
      data.push(logData);
    });
    return data;
  }

  private parseLog<T extends DepositEventDetails>(log: ethers.Log): T {
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

      console.log(deposits);
      start = start.plus(CHUNK_SIZE);
    }
  }
}

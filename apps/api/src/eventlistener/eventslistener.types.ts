import { ethers } from 'ethers';
import { DepositEvent, WithdrawEvent } from 'src/contracts/FUSDC_ABI';

type EventDetails = {
  name: string;
  block: ethers.BlockTag;
  index: number;
  timestamp: number;
};

export type DepositEventDetails = DepositEvent.OutputObject & EventDetails;
export type WithdrawEventDetails = WithdrawEvent.OutputObject & EventDetails;

export type BlockDetails = Record<string, number>;

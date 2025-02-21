import { ethers } from 'ethers';
import { DepositEvent } from 'src/contracts/FUSDC_ABI';

export type DepositEventDetails = DepositEvent.OutputObject & {
  name: string;
  block: ethers.BlockTag;
  index: number;
};

import { ethers } from 'ethers';
import { DepositEvent, WithdrawEvent } from 'src/contracts/FUSDC_ABI';

type EventDetails = {
    name: string;
    block: ethers.BlockTag;
    index: number;
};

export type DepositEventDetails = DepositEvent.OutputObject & EventDetails;
export type WithdrawEventDetails = WithdrawEvent.OutputObject & EventDetails;

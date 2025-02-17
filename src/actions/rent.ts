import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createCancelEscrowTx } from '../../src/escrow';
import { Wallet } from 'src/wallet';
import { queryTokenState } from './query';
import { createRentTxn } from '../../src/escrow/rent';
import BN = require('bn.js');
export interface RentRequest {
  borrower: Wallet;
  amount: BN;
  time: BN;
  token: PublicKey;
  connection: Connection;
  programId: PublicKey;
}
export interface RentResponse {
  tx: Transaction;
}

export const rentTx = async (request: RentRequest): Promise<RentResponse> => {
  const { token, connection, programId, borrower, amount, time } = request;
  const state = await queryTokenState({
    tokenAddress: token,
    connection,
    programId,
  });
  const rentTxn = createRentTxn({
    rentee : borrower,
    amount,
    time,
    state,
    programId,
  });
  return {
    tx: new Transaction().add(rentTxn),
  };
};

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createCancelEscrowTx, createWithdrawTx } from '../../src/escrow';
import { Wallet } from 'src/wallet';
import { queryTokenState } from './query';

export interface WithdrawRequest {
  token: PublicKey;
  connection: Connection;
  programId: PublicKey;
}
export interface WithdrawResponse {
  tx: Transaction;
}

export const withdrawTx = async (request: WithdrawRequest): Promise<WithdrawResponse> => {
  const { token, connection, programId } = request;

  const state = await queryTokenState({
    tokenAddress: token,
    connection,
    programId,
  });
  const withdrawTx = createWithdrawTx({
    programId,
    pda: state.getPda(),
    holdingAccount: state.getHoldingAccount(),
  });
  return {
    tx: new Transaction().add(withdrawTx),
  };
};

import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createCancelEscrowTx } from '../../src/escrow';
import { Wallet } from 'src/wallet';
import { queryTokenState } from './query';

export interface CancelEscrowRequest {
  owner: Wallet;
  ownerTokenAddress: PublicKey;
  token: PublicKey;
  connection: Connection;
  programId: PublicKey;
}
export interface CancelEscrowResponse {
  tx: Transaction;
}

export const cancelEscrowTx = async (
  request: CancelEscrowRequest,
): Promise<CancelEscrowResponse> => {
  const { token, connection, programId, owner, ownerTokenAddress } = request;

  const state = await queryTokenState({
    tokenAddress: token,
    connection,
    programId,
  });
  const cancelTx = createCancelEscrowTx({
    owner,
    ownerTokenAccount: ownerTokenAddress,
    programId,
    pda: state.getPda(),
    holdingAccount: state.getHoldingAccount(),
  });
  return {
    tx: new Transaction().add(cancelTx),
  };
};

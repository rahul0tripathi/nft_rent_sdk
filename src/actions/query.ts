import { Connection, PublicKey } from '@solana/web3.js';
import { EscrowState } from '../escrow';

export type QueryTokenState = {
  tokenAddress: PublicKey;
  connection: Connection;
  programId: PublicKey;
};

export const queryTokenState = async (query: QueryTokenState): Promise<EscrowState> => {
  const [pda] = await PublicKey.findProgramAddress(
    [query.tokenAddress.toBuffer()],
    query.programId,
  );
  const escrowAccount = await query.connection.getAccountInfo(pda);
  if (escrowAccount === null) {
    throw new Error('Could not find escrow at given address!');
  }
  return new EscrowState(escrowAccount, pda);
};

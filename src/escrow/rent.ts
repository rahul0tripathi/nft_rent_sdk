import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Wallet } from 'src/wallet';
import { EscrowState } from './state';
import BN = require('bn.js');
export interface RentTxnRequest {
  rentee: Wallet;
  renteeTokenAccount: PublicKey;
  state: EscrowState;
  programId: PublicKey;
  amount: BN;
  time: BN;
}

export const createRentTxn = (query: RentTxnRequest): TransactionInstruction => {
  return new TransactionInstruction({
    programId: query.programId,
    data: Buffer.from(
      Uint8Array.of(1, ...query.amount.toArray('le', 8), ...query.time.toArray('le', 8)),
    ),
    keys: [
      { pubkey: query.rentee.publicKey, isSigner: true, isWritable: false },
      {
        pubkey: query.renteeTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(query.state.getState().initializerTempTokenAccountPubkey),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(query.state.getState().initializerPubkey),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(query.state.getState().initializerReceivingTokenAccountPubkey),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: query.state.getPda(), isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey('11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ],
  });
};

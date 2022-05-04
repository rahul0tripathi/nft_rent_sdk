import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, SYSVAR_RENT_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import BN = require('bn.js');
import { Wallet } from 'src/wallet';
export interface EscrowTxnRequest {
  owner: Wallet;
  rent: BN;
  pda: PublicKey;
  newAccount: PublicKey;
  programId: PublicKey;
}
export const createInitEscrowTx = ({
  owner,
  programId,
  newAccount,
  pda,
  rent,
}: EscrowTxnRequest): TransactionInstruction => {
  return new TransactionInstruction({
    programId,
    keys: [
      {
        pubkey: owner.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: newAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: owner.publicKey,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey('11111111111111111111111111111111'),
        isSigner: false,
        isWritable: false,
      },
    ],
    data: Buffer.from(Uint8Array.of(0, ...rent.toArray('le', 8))),
  });
};

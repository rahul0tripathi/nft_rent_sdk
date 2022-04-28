import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Wallet } from 'src/wallet';

export interface CancelEscrowTxnRequest {
  owner: Wallet;
  ownerTokenAccount: PublicKey;
  pda: PublicKey;
  holdingAccount: PublicKey;
  programId: PublicKey;
}

export const createCancelEscrowTx = ({
  programId,
  owner,
  ownerTokenAccount,
  holdingAccount,
  pda,
}: CancelEscrowTxnRequest): TransactionInstruction => {
  return new TransactionInstruction({
    programId: programId,
    data: Buffer.from(Uint8Array.of(3)),
    keys: [
      { pubkey: owner.publicKey, isSigner: true, isWritable: true },
      { pubkey: ownerTokenAccount, isSigner: false, isWritable: true },
      {
        pubkey: holdingAccount,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
  });
};

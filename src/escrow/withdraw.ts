import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Wallet } from 'src/wallet';

export interface WithdrawTxnRequest {
  associatedOwnersTokenAddress: PublicKey;
  associatedBorrowerTokenAddress: PublicKey;
  associatedPdaTokenAddress: PublicKey;
  pda: PublicKey;
  holdingAccount: PublicKey;
  programId: PublicKey;
}

export const createWithdrawTx = ({
  associatedOwnersTokenAddress,
  associatedBorrowerTokenAddress,
  associatedPdaTokenAddress,
  programId,
  holdingAccount,
  pda,
}: WithdrawTxnRequest): TransactionInstruction => {
  return new TransactionInstruction({
    programId: programId,
    data: Buffer.from(Uint8Array.of(2)),
    keys: [
      { pubkey: holdingAccount, isSigner: false, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: associatedOwnersTokenAddress, isSigner: false, isWritable: true },
      {
        pubkey: associatedBorrowerTokenAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: associatedPdaTokenAddress,
        isSigner: false,
        isWritable: true,
      },
    ],
  });
};

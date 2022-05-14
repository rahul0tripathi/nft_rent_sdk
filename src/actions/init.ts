import { AccountLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { createInitEscrowTx } from '../../src/escrow';
import { sendTransaction } from 'src/transactions';
import { Wallet } from 'src/wallet';
import BN from 'bn.js';

export interface InitEscrowRequest {
  owner: Wallet;
  ownerTokenAccount: PublicKey;
  token: PublicKey;
  rate: BN;
  minBorrowTime: BN;
  maxBorrowTime: BN;
  ownersRevenueShare: BN;
  connection: Connection;
  newAccount: PublicKey;
  programId: PublicKey;
}
export type InitEscrowResponse = {
  tx: Transaction;
};

export const initNFTEscrowTx = async (query: InitEscrowRequest): Promise<InitEscrowResponse> => {
  const {
    owner,
    token,
    connection,
    newAccount,
    programId,
    ownerTokenAccount,
    rate,
    minBorrowTime,
    maxBorrowTime,
    ownersRevenueShare
  } = query;
  const createTempTokenAccountTx = SystemProgram.createAccount({
    programId: TOKEN_PROGRAM_ID,
    space: AccountLayout.span,
    lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span),
    fromPubkey: owner.publicKey,
    newAccountPubkey: newAccount,
  });
  const initTempAccountTx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    token,
    newAccount,
    owner.publicKey,
  );
  const transferTokenToNewAccountTx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    ownerTokenAccount,
    newAccount,
    owner.publicKey,
    [],
    1,
  );
  const [pda] = await PublicKey.findProgramAddress([token.toBuffer()], programId);
  const initEscrowTx = createInitEscrowTx({
    owner,
    programId,
    newAccount,
    pda,
    rate,
    minBorrowTime,
    maxBorrowTime,
    ownersRevenueShare
  });
  return {
    tx: new Transaction().add(
      createTempTokenAccountTx,
      initTempAccountTx,
      transferTokenToNewAccountTx,
      initEscrowTx,
    ),
  };
};

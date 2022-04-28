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
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const findAssociatedTokenAddress = async (
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    )
  )[0];
};
export interface InitEscrowRequest {
  owner: Wallet;
  ownerTokenAccount:PublicKey;
  token: PublicKey;
  connection: Connection;
  newAccount: PublicKey;
  programId: PublicKey;
}
export type InitEscrowResponse = {
  tx: Transaction;
};

export const initNFTEscrowTx = async (query: InitEscrowRequest): Promise<InitEscrowResponse> => {
  const { owner, token, connection, newAccount, programId, ownerTokenAccount } = query;
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

// import {
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   getAssociatedTokenAddress,
//   getOrCreateAssociatedTokenAccount,
//   Token,
//   TOKEN_PROGRAM_ID,
// } from '@solana/spl-token';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  config,
  KeyPairWallet,
  sendTransaction,
  initNFTEscrowTx,
  cancelEscrowTx,
  withdrawTx,
} from '../src';

import { connection, token } from './const';
const localKp = Keypair.fromSecretKey(
  Uint8Array.from([
    201, 185, 162, 127, 216, 89, 222, 76, 237, 154, 16, 32, 41, 82, 136, 161, 19, 56, 84, 54, 143,
    165, 255, 65, 68, 247, 152, 22, 47, 213, 237, 31, 115, 99, 83, 53, 3, 26, 117, 197, 204, 115,
    209, 181, 16, 65, 245, 195, 83, 144, 231, 211, 173, 206, 240, 60, 255, 181, 115, 187, 18, 157,
    133, 96,
  ]),
);

const wallet = new KeyPairWallet(localKp);

const run = async () => {
  try {
    const resp = await withdrawTx({
      token,
      withdrawer: wallet,
      // adding a single spl token associated pda to share revenue on
      associatedPdaTokenAddress: new PublicKey('GEPFLY2atZ5sDnnerygxnQRkxhUA2ttK5SVGsDqmtsmP'),
      associatedBorrowerTokenAddress: new PublicKey('2fs2VoouTApx84Ed6nT1CzN2JarSZ3L2Sgjk52KuFWi2'),
      associatedOwnersTokenAddress: new PublicKey('8Hj9mdExiKSNKWkb1TuNKCRqyxnkUDGFTWDAXH2iGkoR'),
      programId: config.DEVNET_PROGRAM_ID,
      connection,
    });
    const txId = await sendTransaction({
      connection,
      wallet,
      signers: [localKp],
      txs: resp.tx,
      options: { skipPreflight: false, preflightCommitment: 'confirmed' },
    });
    console.log(`withdrawTx Completed: ${txId}`);
  } catch (error) {
    console.log(error);
  }
};

run();

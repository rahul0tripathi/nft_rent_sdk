import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  config,
  KeyPairWallet,
  sendTransaction,
  initNFTEscrowTx,
  findAssociatedTokenAddress,
  cancelEscrowTx,
} from '../src';
import { connection, token } from './const';

const localKp = Keypair.fromSecretKey(
  Uint8Array.from([
    195, 191, 15, 17, 39, 92, 168, 10, 175, 227, 147, 88, 14, 192, 77, 136, 102, 19, 132, 142, 77,
    98, 252, 183, 252, 102, 196, 54, 249, 169, 74, 202, 97, 65, 119, 17, 170, 211, 184, 3, 4, 229,
    79, 30, 245, 219, 131, 191, 241, 173, 133, 144, 78, 108, 6, 10, 84, 173, 212, 220, 61, 82, 87,
    248,
  ]),
);

const wallet = new KeyPairWallet(localKp);

const run = async () => {
  try {
    const resp = await cancelEscrowTx({
      owner: wallet,
      token,
      programId: config.DEVNET_PROGRAM_ID,
      connection,
      ownerTokenAddress: await findAssociatedTokenAddress(localKp.publicKey, token),
    });
    const txId = await sendTransaction({
      connection,
      wallet,
      txs: resp.tx,
      signers: [],
      options: { skipPreflight: false, preflightCommitment: 'confirmed' },
    });
    console.log(`cancelEscrowTx Completed: ${txId}`);
  } catch (error) {
    console.log(error);
  }
};

run();

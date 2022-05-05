import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  config,
  KeyPairWallet,
  sendTransaction,
  initNFTEscrowTx,
  findAssociatedTokenAddress,
  rentTx,
} from '../src';
import BN = require('bn.js');
const token = new PublicKey('4JEXtbethjME5oqdWPawbMSbuz9GL7JafWb6X5a9kt1e');
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
const renteeKp = Keypair.fromSecretKey(
  Uint8Array.from([
    201, 185, 162, 127, 216, 89, 222, 76, 237, 154, 16, 32, 41, 82, 136, 161, 19, 56, 84, 54, 143,
    165, 255, 65, 68, 247, 152, 22, 47, 213, 237, 31, 115, 99, 83, 53, 3, 26, 117, 197, 204, 115,
    209, 181, 16, 65, 245, 195, 83, 144, 231, 211, 173, 206, 240, 60, 255, 181, 115, 187, 18, 157,
    133, 96
  ]),
);

const wallet = new KeyPairWallet(renteeKp);

const run = async () => {
  try {
    const resp = await rentTx({
      borrower: wallet,
      token,
      programId: config.TESTNET_PROGRAM_ID,
      amount: new BN(1),
      time: new BN(1),
      connection
    });
    const txId = await sendTransaction({
      connection,
      wallet,
      txs: resp.tx,
      signers: [],
      options: { skipPreflight: false, preflightCommitment: 'confirmed' },
    });
    console.log(`rentTx Completed: ${txId}`);
  } catch (error) {
    console.log(error);
  }
};

run();

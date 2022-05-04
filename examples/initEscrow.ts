import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import {
  config,
  KeyPairWallet,
  sendTransaction,
  initNFTEscrowTx,
  findAssociatedTokenAddress,
} from '../src';

const token = new PublicKey('4JEXtbethjME5oqdWPawbMSbuz9GL7JafWb6X5a9kt1e');
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');
const localKp = Keypair.fromSecretKey(
  Uint8Array.from([
    195, 191, 15, 17, 39, 92, 168, 10, 175, 227, 147, 88, 14, 192, 77, 136, 102, 19, 132, 142, 77,
    98, 252, 183, 252, 102, 196, 54, 249, 169, 74, 202, 97, 65, 119, 17, 170, 211, 184, 3, 4, 229,
    79, 30, 245, 219, 131, 191, 241, 173, 133, 144, 78, 108, 6, 10, 84, 173, 212, 220, 61, 82, 87,
    248,
  ]),
);

const wallet = new KeyPairWallet(localKp);

// create a new temp token
const tempAccount = new Keypair();
const run = async () => {
  const resp = await initNFTEscrowTx({
    owner: wallet,
    rent:new BN(1),
    token,
    connection,
    newAccount: tempAccount.publicKey,
    ownerTokenAccount: await findAssociatedTokenAddress(localKp.publicKey, token),
    programId: config.TESTNET_PROGRAM_ID,
  });
  const txId = await sendTransaction({
    connection,
    wallet,
    txs: resp.tx,
    signers: [localKp, tempAccount],
    options: { skipPreflight: false, preflightCommitment: 'confirmed' },
  });
  console.log(`initEscrowTx Completed: ${txId}`);
};

run();

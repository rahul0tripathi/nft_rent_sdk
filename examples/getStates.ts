import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import { connection, token } from './const';

import {
  queryTokenState,
  config,
  EscrowState,
  getWalletTokens,
  KeyPairWallet,
  QueryWalletTokensStatus,
  getAllListedTokens,
} from '../src';
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
    const state = await queryTokenState({
      programId: config.DEVNET_PROGRAM_ID,
      tokenAddress: token,
      connection,
    });
    console.log(
      state.getState(),
      state.isInitialized(),
      state.getState().maxBorrowDuration.toNumber(),
    );
  } catch (error) {
    console.log(error);
  }
  console.log('getting all listed tokens\n');

  console.log(
    await getWalletTokens({
      connection,
      programId: config.DEVNET_PROGRAM_ID,
      owner: wallet,
      type: QueryWalletTokensStatus.LISTED,
    }),
    'all listed tokens\n',
  );
  console.log('getting all borrowed tokens\n');
  console.log(
    await getWalletTokens({
      connection,
      programId: config.DEVNET_PROGRAM_ID,
      owner: wallet,
      type: QueryWalletTokensStatus.BORROWED,
    }),
    'all borrowed tokens\n',
  );
  console.log('querying all listed tokens\n');
  console.log(
    await getAllListedTokens({
      connection,
      programId: config.DEVNET_PROGRAM_ID,
    }),
    'all listed tokens',
  );
};
run();

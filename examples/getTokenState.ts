import { Connection, PublicKey } from '@solana/web3.js';

import { connection, token } from './const';

import { queryTokenState, config, EscrowState } from '../src';
const run = async () => {
  try {
    const state = await queryTokenState({
      programId: config.DEVNET_PROGRAM_ID,
      tokenAddress: token,
      connection,
    });
    console.log(state.getState(), state.isInitialized());
  } catch (error) {
    console.log(error);
  }
};
run();

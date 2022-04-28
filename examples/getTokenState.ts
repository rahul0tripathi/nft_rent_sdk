import { Connection, PublicKey } from '@solana/web3.js';

const token = new PublicKey('4JEXtbethjME5oqdWPawbMSbuz9GL7JafWb6X5a9kt1e');
const connection = new Connection('https://api.testnet.solana.com', 'confirmed');

import { queryTokenState, config, EscrowState } from '../src';
const run = async () => {
  try {
    const state = await queryTokenState({
      programId: config.TESTNET_PROGRAM_ID,
      tokenAddress: token,
      connection,
    });
    console.log(state.getState(), state.isInitialized());
  } catch (error) {
    console.log(error);
  }
};
run();

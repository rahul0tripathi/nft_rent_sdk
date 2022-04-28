import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN = require('bn.js');
import { publicKey, uint64 } from '../util';
import * as BufferLayout from 'buffer-layout';

export const ESCROW_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('isInitialized'),
  publicKey('initializerPubkey'),
  publicKey('initializerTempTokenAccountPubkey'),
  publicKey('initializerReceivingTokenAccountPubkey'),
  publicKey('tokenPubkey'),
  uint64('rate'),
  uint64('expiry'),
  publicKey('rentee'),
  BufferLayout.u8('state'),
]);
export type EscrowData = {
  isInitialized: boolean;
  initializerPubkey: string;
  initializerTempTokenAccountPubkey: string;
  initializerReceivingTokenAccountPubkey: string;
  tokenPubkey: string;
  rate: BN;
  expiry: BN;
  rentee: string;
  state: BN;
};

export interface IEscrowData {
  isInitialized: boolean;
  initializerPubkey: Uint8Array;
  initializerTempTokenAccountPubkey: Uint8Array;
  initializerReceivingTokenAccountPubkey: Uint8Array;
  tokenPubkey: Uint8Array;
  rate: Uint8Array;
  expiry: Uint8Array;
  rentee: Uint8Array;
  state: number;
}

export class EscrowState {
  private state: EscrowData;
  constructor(account: AccountInfo<Buffer>) {
    const state = account.data;
    const decodedState = ESCROW_ACCOUNT_DATA_LAYOUT.decode(state) as IEscrowData;
    this.state = {
      isInitialized: !!decodedState.isInitialized,
      initializerPubkey: new PublicKey(decodedState.initializerPubkey).toBase58(),
      initializerTempTokenAccountPubkey: new PublicKey(
        decodedState.initializerTempTokenAccountPubkey,
      ).toBase58(),
      initializerReceivingTokenAccountPubkey: new PublicKey(
        decodedState.initializerReceivingTokenAccountPubkey,
      ).toBase58(),
      tokenPubkey: new PublicKey(decodedState.tokenPubkey).toBase58(),
      rate: new BN(decodedState.rate, 10, 'le'),
      expiry: new BN(decodedState.expiry, 10, 'le'),
      rentee: new PublicKey(decodedState.rentee).toBase58(),
      state: new BN(decodedState.state),
    };
  }
  public getState(): EscrowData {
    return this.state;
  }
  public isInitialized(): boolean {
    return this.state.isInitialized;
  }
}

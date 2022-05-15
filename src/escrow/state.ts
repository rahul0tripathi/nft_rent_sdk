import { AccountInfo, Connection, PublicKey } from '@solana/web3.js';
import BN = require('bn.js');
import { publicKey, uint64 } from '../util';
import * as BufferLayout from 'buffer-layout';
import { Wallet } from 'src/wallet';

export const ESCROW_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8('isInitialized'),
  publicKey('initializerPubkey'),
  publicKey('initializerTempTokenAccountPubkey'),
  publicKey('initializerReceivingTokenAccountPubkey'),
  publicKey('tokenPubkey'),
  uint64('rate'),
  uint64('expiry'),
  publicKey('borrower'),
  BufferLayout.u8('state'),
  uint64('minBorrowDuration'),
  uint64('maxBorrowDuration'),
  uint64('ownersRevenueShare'),
]);
export type EscrowData = {
  isInitialized: boolean;
  initializerPubkey: string;
  initializerTempTokenAccountPubkey: string;
  initializerReceivingTokenAccountPubkey: string;
  tokenPubkey: string;
  rate: BN;
  expiry: BN;
  borrower: string;
  state: BN;
  minBorrowDuration: BN;
  maxBorrowDuration: BN;
  ownersRevenueShare: BN;
};

export interface IEscrowData {
  isInitialized: boolean;
  initializerPubkey: Uint8Array;
  initializerTempTokenAccountPubkey: Uint8Array;
  initializerReceivingTokenAccountPubkey: Uint8Array;
  tokenPubkey: Uint8Array;
  rate: Uint8Array;
  expiry: Uint8Array;
  borrower: Uint8Array;
  state: number;
  minBorrowDuration: Uint8Array;
  maxBorrowDuration: Uint8Array;
  ownersRevenueShare: Uint8Array;
}

export class EscrowState {
  private state: EscrowData;
  private pda: PublicKey;
  constructor(account: AccountInfo<Buffer>, pda?: PublicKey) {
    if (pda) {
      this.pda = pda;
    }
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
      borrower: new PublicKey(decodedState.borrower).toBase58(),
      state: new BN(decodedState.state),
      minBorrowDuration: new BN(decodedState.minBorrowDuration, 10, 'le'),
      maxBorrowDuration: new BN(decodedState.maxBorrowDuration, 10, 'le'),
      ownersRevenueShare: new BN(decodedState.ownersRevenueShare, 10, 'le'),
    };
  }
  public getState(): EscrowData {
    return this.state;
  }
  public isInitialized(): boolean {
    return this.state.isInitialized;
  }
  public getPda(): PublicKey {
    return this.pda;
  }
  public getHoldingAccount(): PublicKey {
    return new PublicKey(this.state.initializerTempTokenAccountPubkey);
  }
}

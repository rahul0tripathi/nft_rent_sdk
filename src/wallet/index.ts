import { Keypair, PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(tx: Transaction[]): Promise<Transaction[]>;
}

export class KeyPairWallet implements Wallet {
  constructor(readonly payer: Keypair) {}
  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((tx) => {
      tx.partialSign(this.payer);
      return tx;
    });
  }

  get publicKey(): PublicKey {
    return this.payer.publicKey;
  }
}

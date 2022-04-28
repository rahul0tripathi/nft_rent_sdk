import { Keypair, SendOptions, Connection, Transaction } from '@solana/web3.js';
import { Wallet } from '../wallet';
/** Parameters for {@link sendTransaction} **/
export interface SendTransactionParams {
  connection: Connection;
  wallet: Wallet;
  txs: Transaction;
  signers?: Keypair[];
  options?: SendOptions;
}

/**
 * Sign and send transaction for validation
 * @return This action returns the resulting transaction id once it has been executed
 */
export const sendTransaction = async ({
  connection,
  wallet,
  txs,
  signers = [],
  options,
}: SendTransactionParams): Promise<string> => {
  txs.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  txs.feePayer = wallet.publicKey;
  if (signers.length) {
    txs.partialSign(...signers);
  }
  txs = await wallet.signTransaction(txs);

  return connection.sendRawTransaction(txs.serialize(), options);
};

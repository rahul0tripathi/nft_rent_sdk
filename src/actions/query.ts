import { AccountInfo, Connection, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { Wallet } from 'src/wallet';
import { EscrowState } from '../escrow';

export enum QueryWalletTokensStatus {
  LISTED,
  BORROWED,
}

export type QueryTokenState = {
  tokenAddress: PublicKey;
  connection: Connection;
  programId: PublicKey;
};
type accountData = { pubkey: PublicKey; account: AccountInfo<Buffer | ParsedAccountData> };
export type QueryWalletTokens = {
  type: QueryWalletTokensStatus;
  owner: Wallet;
  connection: Connection;
  programId: PublicKey;
};
export type QueryAllTokens = {
  connection: Connection;
  programId: PublicKey;
};
export const queryTokenState = async (query: QueryTokenState): Promise<EscrowState> => {
  const [pda] = await PublicKey.findProgramAddress(
    [query.tokenAddress.toBuffer()],
    query.programId,
  );
  const escrowAccount = await query.connection.getAccountInfo(pda);
  if (escrowAccount === null) {
    throw new Error('Could not find escrow at given address!');
  }
  return new EscrowState(escrowAccount, pda);
};

export const getWalletTokens = async (query: QueryWalletTokens): Promise<EscrowState[]> => {
  const accounts: accountData[] = await query.connection.getParsedProgramAccounts(query.programId, {
    filters: [
      {
        memcmp: {
          offset: (() => {
            // calculate offset based on the token state
            switch (query.type) {
              case QueryWalletTokensStatus.LISTED:
                return 1;
              case QueryWalletTokensStatus.BORROWED:
                return 145;
              default:
                return 0;
            }
          })(),
          bytes: query.owner.publicKey.toBase58(),
        },
      },
    ],
  });
  if (accounts === null) {
    throw new Error('Could not find listed tokens at given address!');
  }
  const states: EscrowState[] = [];
  accounts.map((escrowAccount: accountData) => {
    const _state = new EscrowState(
      escrowAccount.account as AccountInfo<Buffer>,
      escrowAccount.pubkey,
    );

    if (
      query.type == QueryWalletTokensStatus.BORROWED &&
      _state.getState().initializerPubkey !== _state.getState().borrower
    ) {
      states.push(_state);
    }
    if (query.type === QueryWalletTokensStatus.LISTED) {
      states.push(_state);
    }
  });
  return states;
};

export const getAllListedTokens = async (query: QueryAllTokens): Promise<EscrowState[]> => {
  const accounts: accountData[] = await query.connection.getParsedProgramAccounts(query.programId);
  if (accounts === null) {
    throw new Error('Could not find listed tokens at given address!');
  }
  const states: EscrowState[] = [];
  accounts.map((escrowAccount: accountData) => {
    states.push(
      new EscrowState(escrowAccount.account as AccountInfo<Buffer>, escrowAccount.pubkey),
    );
  });
  return states;
};

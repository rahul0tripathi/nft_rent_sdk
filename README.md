# STREAM NFT

This SDK provides an extension to integrate the STREAM NFT (https://www.streammoney.finance/) smart contract to your application. STREAM NFT is an on-chain "solana" smart contract that enables the real-time borrowing/renting of NFTs.
```js
import {
  queryTokenState,
  config,
  sendTransaction,
  withdrawTx,
  rentTx,
  initNFTEscrowTx,
  findAssociatedTokenAddress,
  cancelEscrowTx,
} from "stream-nft-sdk";
```

STREAM NFT flow consists of 5 major flows: Initialize, Rent, Withdraw, Cancel, Query

## [Initialize](https://github.com/rahul0tripathi/nft_rent_sdk/blob/a2b0df4dd2baee8d86310fd9a188791e570cb09f/src/actions/init.ts#L30) :
Initializes NFT on STREAM NFT protocol, making it available for users to browse and rent.
```ts
initNFTEscrowTx({
    owner: Wallet, // owner's wallet which implements wallet interface  
    token, // PublicKey of the NFT to be rented
    rate: BigNumber // rate in lamports/s,
    minBorrowTime: BigNumber // mininum time for borrow (in Seconds),
    maxBorrowTime: BigNumber // maximum time for borrow (in Seconds),
    connection,
    newAccount: PublicKey //new temp account for transfering ownership to PDA (TO BE DEPRECATED),
    ownerTokenAccount: await findAssociatedTokenAddress(
      wallet.publicKey,
      token
    ),
    programId: config.DEVNET_PROGRAM_ID, // program addresses are available in config
  });
```
 
## [Borrow](https://github.com/rahul0tripathi/nft_rent_sdk/blob/a2b0df4dd2baee8d86310fd9a188791e570cb09f/src/actions/rent.ts#L19) :
Users can borrow the NFT utility adhering to the contract constraints of rate, min_duration, and max_duration. This is will change the contract state, changing conditional ownership to the borrower.
```ts
rentTx({
    borrower: Wallet, // borrower's wallet which implements wallet interface
	token, // PublicKey of the NFT to be borrowed
    programId: config.DEVNET_PROGRAM_ID,
    amount: BigNumber // amount borrower is willing to pay (time * rate)[lamports],
    time: BigNumber // time borrower wants to borrow the NFT for (in Seconds),
    connection,
  });
```

## [Withdraw](https://github.com/rahul0tripathi/nft_rent_sdk/blob/a2b0df4dd2baee8d86310fd9a188791e570cb09f/src/actions/withdraw.ts#L15) :
As per the duration set by the user, the NFT utility would expire. NFT could be withdrawn by anyone upon expiration, and get incentivised. This flow returns NFT back to the available state for renting.
```ts
withdrawTx({
    token, // PublicKey of the NFT to be withdrawn
    programId: config.DEVNET_PROGRAM_ID,
    connection,
  });
```

## [Cancel](https://github.com/rahul0tripathi/nft_rent_sdk/blob/a2b0df4dd2baee8d86310fd9a188791e570cb09f/src/actions/cancel.ts#L17) :
NFT owners can cancel the smart contract, thus claiming back the ownership of NFT. This closes the temporary PDA and settles all PDA balances to the owner.
```ts
cancelEscrowTx({
    owner: Wallet, // owner's wallet which implements wallet interface  
    token, // PublicKey of the NFT to be remove from listing
    programId: config.DEVNET_PROGRAM_ID,
    connection,
    ownerTokenAddress: await findAssociatedTokenAddress(
      wallet.publicKey,
      token
    ),
  });
```

## [Query](https://github.com/rahul0tripathi/nft_rent_sdk/blob/a2b0df4dd2baee8d86310fd9a188791e570cb09f/src/actions/query.ts#L10) :
Any service/user can invoke the query function to get the current on-chain PDA state for a provided NFT.
```ts
queryTokenState({
    programId: config.DEVNET_PROGRAM_ID,
    tokenAddress: PublicKey  // PublicKey of the NFT to be remove from listing,
    connection,
  });
};
```

Please check out the detailed integration at https://github.com/rahul0tripathi/sol_rent_demo and examples are available at https://github.com/rahul0tripathi/nft_rent_sdk/tree/master/examples

Stream NFT is soon expanding to other chains as well.. stay tuned :)

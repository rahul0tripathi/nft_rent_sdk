# STREAM NFT

This SDK provides an extension to integrate the STREAM NFT (https://www.streammoney.finance/) smart contract to your application. STREAM NFT is an on-chain smart contract that enables the real-time borrowing/renting of NFTs.
```
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

## Initialize:
Initializes NFT on STREAM NFT protocol, making it available for users to browse and rent.
```
initNFTEscrowTx({
    owner: owner wallet,  
    NFT token address,
    rate in lamports/s,
    minBorrowTime: mininum time for borrow,
    maxBorrowTime: maximum time for borrow,
    connection,
    newAccount: new temp account for transfering ownership to PDA (TO BE DEPRECATED),
    ownerTokenAccount: await findAssociatedTokenAddress(
      wallet.publicKey,
      token
    ),
    programId: config.DEVNET_PROGRAM_ID,
  });
```
 
## Borrow:
Users can borrow the NFT utility adhering to the contract constraints of rate, min_duration, and max_duration. This is will change the contract state, changing conditional ownership to the borrower.
```
rentTx({
    borrower: borrower wallet,
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    amount: amount borrower is willing to pay,
    time: time borrower wants to borrow the NFT for,
    connection,
  });
```

## Withdraw
As per the duration set by the user, the NFT utility would expire. NFT could be withdrawn by anyone upon expiration, and get incentivized. This flow returns NFT back to the available state for renting.
```
withdrawTx({
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    connection,
  });
```

## Cancel
NFT owners can cancel the smart contract, thus claiming back the ownership of NFT. This closes the temporary PDA and settles all PDA balances to the owner.
```
cancelEscrowTx({
    owner: NFT owner wallet,
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    connection,
    ownerTokenAddress: await findAssociatedTokenAddress(
      wallet.publicKey,
      token
    ),
  });
```

## Query
Any service/user can invoke the query function to get the current on-chain PDA state for a provided NFT.
```
queryTokenState({
    programId: config.DEVNET_PROGRAM_ID,
    tokenAddress:  NFT token address,
    connection,
  });
};
```

Please check out the detailed integration at https://github.com/rahul0tripathi/sol_rent_demo

# STREAM NFT

This SDK provides extension to integrate the STREAM NFT (https://www.streammoney.finance/) smart contract yo your application. STREAM NFT is an on-chain smart contract which enables the real time borrowing/renting of NFTs.

Usage:
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

STREAM NFT flow consists of 5 major flows: Initialize, Rent, Withrdaw, Cancel, Query

## Initialize:
Initializes NFT on STREAM NFT procotol, making it available for users to browse and rent.
Request: 
await initNFTEscrowTx({
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
 
## Borrow:
Users can borrow the NFT utility adhering to the contract contraints of rate, min_duration and max_duration. This is will change the contract state, changing conditional ownership to the borrower.
wait rentTx({
    borrower: borrower wallet,
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    amount: amount borrower is willing to pay,
    time: time borrower wants to borrow the NFT for,
    connection,
  });
  
## Withdraw
As per duration set by user, NFT utility would expire. NFT could be withdrawn by anyone upon expiration, and get intentivized. This flow return NFT back to available state for renting.

withdrawTx({
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    connection,
  });
  
## Cancel
NFT owner can cancel the smart contract, thus claiming back the ownernship of NFT. This closes the temporary PDA and settles all PDA balance to owner.

await cancelEscrowTx({
    owner: NFT owner wallet,
    NFT token address,
    programId: config.DEVNET_PROGRAM_ID,
    connection,
    ownerTokenAddress: await findAssociatedTokenAddress(
      wallet.publicKey,
      token
    ),
  });
  
## Query
Any service/user can invoke the query function to get the current on chain PDA state for a provided NFT.

awai queryTokenState({
    programId: config.DEVNET_PROGRAM_ID,
    tokenAddress:  NFT token address,
    connection,
  });
};

Please check out detailed integration at https://github.com/rahul0tripathi/sol_rent_demo

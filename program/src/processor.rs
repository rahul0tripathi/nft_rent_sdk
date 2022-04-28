use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar}, clock::Clock, system_instruction, 
};
use spl_associated_token_account::get_associated_token_address;
use spl_token::state::Account;
use crate::{error::EscrowError, instruction::EscrowInstruction, state::{Escrow}};

pub struct Processor;
impl Processor {
    pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
        let instruction = EscrowInstruction::unpack(instruction_data)?;

        match instruction {
            EscrowInstruction::InitEscrow { rate } => {
                msg!("Instruction: InitEscrow");
                Self::process_init_escrow(accounts, rate, program_id)
            }
            EscrowInstruction::Rent { rentee_amount,rentee_time } => {
                msg!("Instruction: Rent");
                Self::process_rent(accounts, rentee_amount, rentee_time ,program_id)
            }
            EscrowInstruction::Withdraw { } => {
                msg!("Instruction: Withdraw");
                Self::process_withdraw(accounts, program_id)
            }
            EscrowInstruction::Cancel { } => {
                msg!("Instruction: Cancel");
                Self::process_cancel(accounts, program_id)
            }
        }
    }

    fn process_init_escrow(accounts: &[AccountInfo], rate: u64, program_id: &Pubkey,) -> ProgramResult {
        msg!("1");
        let account_info_iter = &mut accounts.iter();
        let initializer = next_account_info(account_info_iter)?;
        let temp_token_account = next_account_info(account_info_iter)?;
        let token_to_receive_account = next_account_info(account_info_iter)?;
        let escrow_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
        let token_program = next_account_info(account_info_iter)?;
        let system_program = next_account_info(account_info_iter)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        // if *token_to_receive_account.owner != spl_token::id() {
        //     msg!("token owner is: {} while splid is: {}",token_to_receive_account.owner,spl_token::id());
        //     return Err(ProgramError::IncorrectProgramId);
        // }

        msg!("2: newer");
        let temp_account_data = Account::unpack(&temp_token_account.data.borrow())?;
        if temp_account_data.amount<1{
            return Err(ProgramError::InsufficientFunds);
        }
        msg!("got mint id: {}",temp_account_data.mint);
        let (pda, _nonce) = Pubkey::find_program_address(&[&temp_account_data.mint.to_bytes()], program_id);
        if pda!=*escrow_account.key {
            msg!("not equal pda 1: {} and rust_pda 2: {}",escrow_account.key,pda);
        }
        if escrow_account.data_is_empty(){
            let create_account_ix= &system_instruction::create_account(
                initializer.key, 
                &pda, 
                rent.minimum_balance(Escrow::LEN),
                u64::from_le_bytes(Escrow::LEN.to_le_bytes()), 
                program_id);

            invoke_signed(&create_account_ix, 
                &[
                    initializer.clone(),
                    escrow_account.clone(),
                    system_program.clone(),
                ], 
                &[&[&temp_account_data.mint.to_bytes()[..], &[_nonce]]])?;
        }
        if !rent.is_exempt(escrow_account.lamports(), escrow_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }
        // if !escrow_account.data_is_empty() || escrow_account.owner!=program_id{
        //     return Err(ProgramError::UninitializedAccount);
        // }
        msg!("post rent2");
        // msg!("initialized: {}",escrow_info.is_initialized);

        let mut escrow_info = Escrow::unpack_unchecked(&escrow_account.try_borrow_data()?)?;
        msg!("initialized: {}",escrow_info.is_initialized);
        if escrow_info.is_initialized() {
            return Err(ProgramError::AccountAlreadyInitialized);
        }
        escrow_info.is_initialized = true;
        escrow_info.initializer_pubkey = *initializer.key;
        escrow_info.temp_token_account_pubkey = *temp_token_account.key;
        escrow_info.initializer_token_to_receive_account_pubkey = *token_to_receive_account.key;
        escrow_info.rate = rate;
        escrow_info.token_pubkey=temp_account_data.mint;
        escrow_info.state=0;
        escrow_info.rentee=*initializer.key;
        msg!("3");

        Escrow::pack(escrow_info, &mut escrow_account.try_borrow_mut_data()?)?;
        let owner_change_ix = spl_token::instruction::set_authority(
            token_program.key,
            temp_token_account.key,
            Some(&pda),
            spl_token::instruction::AuthorityType::AccountOwner,
            initializer.key,
            &[&initializer.key],
        )?;

        msg!("Calling the token program to transfer token account ownership...");
        invoke(
            &owner_change_ix,
            &[
                initializer.clone(),
                temp_token_account.clone(),
                token_program.clone(),
            ],
        )?;
        msg!("5");

        Ok(())
    }

    fn process_rent(accounts: &[AccountInfo], rentee_amount: u64, rentee_time: u64, program_id: &Pubkey,) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let taker = next_account_info(account_info_iter)?;
        if !taker.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        let rentee = next_account_info(account_info_iter)?;
        let pdas_temp_token_account = next_account_info(account_info_iter)?; //account transfered by NFT owner
        let initializers_main_account = next_account_info(account_info_iter)?;
        let initializers_token_to_receive_account = next_account_info(account_info_iter)?;
        let escrow_account = next_account_info(account_info_iter)?;
        let system_program = next_account_info(account_info_iter)?;
        // let pda_account = next_account_info(account_info_iter)?;
        // let pdas_temp_token_account_info =
        //     TokenAccount::unpack(&pdas_temp_token_account.try_borrow_data()?)?;
        msg!("0");
        let mint_id = Account::unpack(&pdas_temp_token_account.data.borrow())?.mint;
        let (pda, _nonce) = Pubkey::find_program_address(&[&mint_id.to_bytes()], program_id);
        msg!("1");
        let mut escrow_info = Escrow::unpack(&escrow_account.try_borrow_data()?)?;
        msg!("check pda");
        if escrow_account.key!=&pda || !escrow_info.is_initialized{
            return Err(ProgramError::InvalidAccountData);
        }
        if escrow_info.state==1{
            return Err(ProgramError::InvalidAccountData);
        }
        msg!("2");
        if escrow_info.rate*rentee_time>rentee_amount {
            return Err(ProgramError::InvalidAccountData);
        }
        msg!("3");
        if escrow_info.temp_token_account_pubkey != *pdas_temp_token_account.key {
            return Err(ProgramError::InvalidAccountData);
        }
        if escrow_info.initializer_pubkey != *initializers_main_account.key {
            return Err(ProgramError::InvalidAccountData);
        }
        if escrow_info.initializer_token_to_receive_account_pubkey
            != *initializers_token_to_receive_account.key
        {
            return Err(ProgramError::InvalidAccountData);
        }
        msg!("4");


        if **taker.try_borrow_lamports()?<rentee_amount{
            return Err(ProgramError::AccountBorrowFailed)
        }
        msg!("5");
        let transfer_to_initializer_ix = &system_instruction::transfer( // transfer sol amount to NFT owner
            taker.key,
            initializers_token_to_receive_account.key,
            rentee_amount,
        );
        msg!("Calling the token program to transfer rent to the escrow's initializer..."); 
        invoke(
            &transfer_to_initializer_ix,
            &[
                taker.clone(),
                initializers_token_to_receive_account.clone(),
                system_program.clone(),
            ],
        )?;
        msg!("6");
        escrow_info.state=1;
        escrow_info.rentee=*rentee.key;
        let now = Clock::get()?.unix_timestamp as u64;
        escrow_info.expiry=now+rentee_time;
        msg!("7");
        Escrow::pack(escrow_info, &mut escrow_account.try_borrow_mut_data()?)?;
        // let taker_x_token_account = get_associated_token_address(taker.key, token_program.key);
        msg!("source pubkey is: {}", pdas_temp_token_account.key);
        msg!("pda pubkey is: {}", &pda);
        msg!("rentee pubkey is: {}", rentee.key);
        
        Ok(())
    }
        
    fn process_withdraw(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult{
        let account_info_iter = &mut accounts.iter();
        let temp_token_account = next_account_info(account_info_iter)?;
        let pda_account = next_account_info(account_info_iter)?;
        let mint_id = Account::unpack(&temp_token_account.data.borrow())?.mint;
        msg!("got mint id: {}",mint_id);
        let (pda, _nonce) = Pubkey::find_program_address(&[&mint_id.to_bytes()], program_id);
        msg!("1");
        let mut escrow_info = Escrow::unpack(&pda_account.try_borrow_data()?)?;
        msg!("check pda");
        if pda_account.key!=&pda || !escrow_info.is_initialized{
            return Err(ProgramError::InvalidAccountData);
        }
        let now = Clock::get()?.unix_timestamp as u64;
        if escrow_info.expiry>now{
            return Err(ProgramError::AccountsDataBudgetExceeded);
        }
        escrow_info.rentee=escrow_info.initializer_pubkey;
        escrow_info.state=0;
        Escrow::pack(escrow_info, &mut pda_account.try_borrow_mut_data()?)?;
        Ok(())
    }

    fn process_cancel(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult{
        let account_info_iter = &mut accounts.iter();
        let initializer=next_account_info(account_info_iter)?;
        let initializer_withdraw_account=next_account_info(account_info_iter)?;
        let pdas_temp_token_account = next_account_info(account_info_iter)?;
        let pda_account = next_account_info(account_info_iter)?;
        let token_program= next_account_info(account_info_iter)?;
        let mint_id = Account::unpack(&pdas_temp_token_account.data.borrow())?.mint;
        msg!("got mint id: {}",mint_id);
        let (pda, _nonce) = Pubkey::find_program_address(&[&mint_id.to_bytes()], program_id);
        let escrow_info = Escrow::unpack(&pda_account.try_borrow_data()?)?;
        msg!("check pda");
        if pda_account.key!=&pda || !escrow_info.is_initialized{
            return Err(ProgramError::InvalidAccountData);
        }        
        if escrow_info.initializer_pubkey!=*initializer.key || !initializer.is_signer{
            return Err(ProgramError::InvalidInstructionData);
        }
        if escrow_info.state==1{
            return Err(ProgramError::InvalidInstructionData);
        }

        msg!("Calling NFT return");
        let initializer_token_account= get_associated_token_address(&escrow_info.initializer_pubkey, &mint_id);
        if *initializer_withdraw_account.key!=initializer_token_account {
            return Err(ProgramError::InvalidInstructionData);
        }
        let return_nft_ix=spl_token::instruction::transfer(
            token_program.key, 
            pdas_temp_token_account.key,
            &initializer_token_account, 
            pda_account.key, 
            &[], 
            1)?;
        invoke_signed(
            &return_nft_ix, 
            &[
                token_program.clone(),
                pdas_temp_token_account.clone(),
                token_program.clone(),
                initializer_withdraw_account.clone(),
                pda_account.clone()
            ], 
            &[&[&mint_id.to_bytes()[..], &[_nonce]]]
        )?;
        //closing NFT PDA owned temp
        msg!("Calling PDA close");
        let account_close_ix = spl_token::instruction::close_account(
            token_program.key, pdas_temp_token_account.key, &initializer_token_account, 
            pda_account.key, &[])?;
        invoke_signed(
            &account_close_ix, 
            &[
                token_program.clone(),
                pdas_temp_token_account.clone(),
                initializer_withdraw_account.clone(),
                token_program.clone(),
                pda_account.clone()
            ], 
            &[&[&mint_id.to_bytes()[..], &[_nonce]]]
        )?;
        //closing PDA
        msg!("Closing PDA");
        **initializer.try_borrow_mut_lamports()? = initializer
        .lamports()
        .checked_add(pda_account.lamports())
        .ok_or(EscrowError::AmountOverflow)?;
        **pda_account.try_borrow_mut_lamports()? = 0;
        *pda_account.try_borrow_mut_data()? = &mut [];
        Ok(())
    }

}


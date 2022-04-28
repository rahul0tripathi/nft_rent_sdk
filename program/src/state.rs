use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};
use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

pub struct Escrow {
    pub is_initialized: bool,
    pub initializer_pubkey: Pubkey,
    pub temp_token_account_pubkey: Pubkey,
    pub initializer_token_to_receive_account_pubkey: Pubkey,
    pub token_pubkey: Pubkey,
    pub rate: u64,
    pub expiry: u64,
    pub rentee: Pubkey,
    pub state: u8,
}

impl Sealed for Escrow {}

impl IsInitialized for Escrow {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for Escrow {
    const LEN: usize = 178;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Escrow::LEN];
        let (
            is_initialized,
            initializer_pubkey,
            temp_token_account_pubkey,
            initializer_token_to_receive_account_pubkey,
            token_pubkey,
            rate,
            expiry,
            rentee,
            state,
        ) = array_refs![src, 1, 32, 32, 32, 32 ,8, 8, 32, 1];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };

        Ok(Escrow {
            is_initialized,
            initializer_pubkey: Pubkey::new_from_array(*initializer_pubkey),
            temp_token_account_pubkey: Pubkey::new_from_array(*temp_token_account_pubkey),
            initializer_token_to_receive_account_pubkey: Pubkey::new_from_array(
                *initializer_token_to_receive_account_pubkey,
            ),
            token_pubkey: Pubkey::new_from_array(*token_pubkey),
            rate: u64::from_le_bytes(*rate),
            expiry: u64::from_le_bytes(*expiry),
            rentee: Pubkey::new_from_array(*rentee),
            state: state[0]
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Escrow::LEN];
        let (
            is_initialized_dst,
            initializer_pubkey_dst,
            temp_token_account_pubkey_dst,
            initializer_token_to_receive_account_pubkey_dst,
            token_pubkey_dst,
            rate_dst,
            expiry_dst,
            rentee_dst,
            state_dst,
        ) = mut_array_refs![dst, 1, 32, 32, 32, 32, 8, 8, 32, 1];

        let Escrow {
            is_initialized,
            initializer_pubkey,
            temp_token_account_pubkey,
            initializer_token_to_receive_account_pubkey,
            token_pubkey,
            rate,
            expiry,
            rentee,
            state
        } = self;

        is_initialized_dst[0] = *is_initialized as u8;
        initializer_pubkey_dst.copy_from_slice(initializer_pubkey.as_ref());
        temp_token_account_pubkey_dst.copy_from_slice(temp_token_account_pubkey.as_ref());
        initializer_token_to_receive_account_pubkey_dst
            .copy_from_slice(initializer_token_to_receive_account_pubkey.as_ref());
        token_pubkey_dst.copy_from_slice(token_pubkey.as_ref());
        rentee_dst.copy_from_slice(rentee.as_ref());

        *rate_dst = rate.to_le_bytes();
        *expiry_dst = expiry.to_le_bytes();
        *state_dst = [*state];
    }
}
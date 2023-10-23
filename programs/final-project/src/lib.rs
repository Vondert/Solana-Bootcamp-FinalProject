use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Token, Mint, TokenAccount};
use anchor_spl::token;
use anchor_lang::{
    system_program::*,
    prelude::*
};
declare_id!("8PfXMVu3wzJJnAu1bZxML5aAounkcEQctFbtD4xYS5Mn");

#[program]
pub mod final_project {

    use super::*;
    pub fn create_mint(ctx: Context<CreateMint>, _name: String) -> Result<()> {
        let mint_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_ata.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        msg!("Mint context created");
        let close_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::SetAuthority{ 
                current_authority: ctx.accounts.user.to_account_info(), 
                account_or_mint: ctx.accounts.mint.to_account_info() 
            }
        );
        msg!("Close context created");

        token::mint_to(mint_context, 1)?;
        msg!("Token minted");
        token::set_authority(close_context, token::spl_token::instruction::AuthorityType::MintTokens, None)?;
        msg!("Mint closed {:?}", &ctx.accounts.mint.mint_authority);
        Ok(())
   }

   pub fn transfer_token(ctx : Context<Transfer>, _name: String) -> Result<()> {
        let cpi_context = CpiContext::new(
ctx.accounts.token_program.to_account_info(),
token::Transfer {
                from : ctx.accounts.user_ata.to_account_info(),
                to : ctx.accounts.recipient_ata.to_account_info(),
                authority : ctx.accounts.user.to_account_info()
            },
        );
        msg!("Transfer context created");
        token::transfer(cpi_context, 1)?;
        msg!("Token transfered");
        Ok(())
    }

    pub fn burn_token(ctx : Context<Burn>, _name: String) -> Result<()> {
        let cpi_context = CpiContext::new(
ctx.accounts.token_program.to_account_info(),
   token::Burn {
                from:ctx.accounts.user_ata.to_account_info(), 
                authority:ctx.accounts.user.to_account_info(), 
                mint: ctx.accounts.mint.to_account_info() 
            },
        );
        msg!("Burn context created");
        token::burn(cpi_context, 1)?;
        msg!("Token burned");
        Ok(())
    }
}



#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateMint<'info>{
    #[account(
        init,
         seeds = [
            b"spl-token-mint".as_ref(),
            name.as_bytes(),
         ],
        bump,
        payer = user,
        mint::authority = user,
        mint::decimals = 0
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_ata: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,  
    pub associated_token_program : Program<'info, AssociatedToken> ,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Transfer<'info>{
    #[account(
        seeds = [
           b"spl-token-mint".as_ref(),
           name.as_bytes(),
        ],
       bump
   )]
   pub mint: Account<'info, Mint>,

   #[account(mut)]
   pub user: Signer<'info>,
   #[account(mut,
       associated_token::mint = mint,
       associated_token::authority = user
   )]
   pub user_ata: Box<Account<'info, TokenAccount>>,
    /// CHECK : We just pass the account info for the demonstration purpose. Ideally this is either signer or trusted account
   pub recipient: AccountInfo<'info>,
   #[account(
    init_if_needed,
    payer = user,
    associated_token::mint = mint,
    associated_token::authority = recipient
    )]
   pub recipient_ata: Box<Account<'info, TokenAccount>>,

   pub system_program: Program<'info, System>,
   pub token_program: Program<'info, Token>,  
   pub associated_token_program : Program<'info, AssociatedToken> ,
   pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Burn<'info>{
    #[account(
        mut,
        seeds = [
            b"spl-token-mint".as_ref(),
            name.as_bytes(),
        ],
        bump
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_ata: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,  
    pub associated_token_program : Program<'info, AssociatedToken>,
}

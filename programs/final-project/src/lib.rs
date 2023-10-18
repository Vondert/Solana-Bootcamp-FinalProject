use anchor_lang::prelude::*;

declare_id!("8PfXMVu3wzJJnAu1bZxML5aAounkcEQctFbtD4xYS5Mn");

#[program]
pub mod final_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

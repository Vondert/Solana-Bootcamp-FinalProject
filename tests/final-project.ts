import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FinalProject } from "../target/types/final_project";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, TokenAccountNotFoundError, getMint} from "@solana/spl-token";
import idl from "../target/idl/final_project.json"; // this generated when we run anchor test command
import { assert } from "chai";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { BN } from "bn.js";

describe("final-project", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.local());
  const user = anchor.AnchorProvider.local().wallet as anchor.Wallet;
  const recipient = anchor.web3.Keypair.generate();
  const program = anchor.workspace.FinalProject as Program<FinalProject>;
  const name = "Vondert";
  
  it("First Mint!", async () => {
    const findNFTMintAddress = async () => {
      return await PublicKey.findProgramAddressSync(
        [
          utf8.encode("spl-token-mint"),
          utf8.encode(name),
        ],
        new PublicKey(idl.metadata.address)
      );
    };

    const [mintKey] = (await findNFTMintAddress());
    const [userAtaKey] = await PublicKey.findProgramAddressSync(
      [
        user.publicKey.toBuffer(), 
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
     ASSOCIATED_TOKEN_PROGRAM_ID  
    );

    const tx = await program.methods.createMint(name).accounts(
      {
        mint: mintKey,
        user: user.publicKey,
        userAta: userAtaKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }

    ).signers([user.payer]).rpc();
    console.log("Your transaction signature", tx);
    const userBalance = (await program.provider.connection.getTokenAccountBalance(userAtaKey)).value.amount;
    console.log(user.publicKey.toBase58() + " balance " + userBalance);
    assert(parseInt(userBalance) == 1);
    let mint = await getMint(program.provider.connection, mintKey);
    assert(mint.mintAuthority == null);
  });
  it("Transfer!", async () => {

    const findNFTMintAddress = async () => {
      return await PublicKey.findProgramAddress(
        [
          utf8.encode("spl-token-mint"),
          utf8.encode(name),
        ],
        new PublicKey(idl.metadata.address)
      );
    };

    const [mintKey] = (await findNFTMintAddress());
    const [userAtaKey] = await PublicKey.findProgramAddress(
      [
        user.publicKey.toBuffer(), // could be any public key
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
     ASSOCIATED_TOKEN_PROGRAM_ID  
    );
    const [recipientAtaKey] = await PublicKey.findProgramAddress(
      [
        recipient.publicKey.toBuffer(), // could be any public key
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
     ASSOCIATED_TOKEN_PROGRAM_ID  
    );

    const tx = await program.methods.transferToken(name).accounts(
      {
        mint: mintKey,
        user: user.publicKey,
        userAta: userAtaKey,
        recipient: recipient.publicKey,
        recipientAta: recipientAtaKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }

    ).signers([user.payer]).rpc();
    console.log("Your transaction signature", tx);
    const userBalance = (await program.provider.connection.getTokenAccountBalance(userAtaKey)).value.amount;
    const recipientBalance = (await program.provider.connection.getTokenAccountBalance(recipientAtaKey)).value.amount;
    console.log(user.publicKey.toBase58() + " balance " + userBalance);
    console.log(recipient.publicKey.toBase58() + " balance " + recipientBalance);
    assert(parseInt(userBalance) == 0);
    assert(parseInt(recipientBalance) == 1);
  });
  it("Burn!", async () => {

    const findNFTMintAddress = async () => {
      return await PublicKey.findProgramAddress(
        [
          utf8.encode("spl-token-mint"),
          utf8.encode(name),
        ],
        new PublicKey(idl.metadata.address)
      );
    };

    const [mintKey] = (await findNFTMintAddress());
    const [recipientAtaKey] = await PublicKey.findProgramAddress(
      [
        recipient.publicKey.toBuffer(), // could be any public key
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ],
     ASSOCIATED_TOKEN_PROGRAM_ID  
    );

    const tx = await program.methods.burnToken(name).accounts(
      {
        mint: mintKey,
        user: recipient.publicKey,
        userAta: recipientAtaKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }

    ).signers([recipient]).rpc();
    console.log("Your transaction signature", tx);
    const recipientBalance = (await program.provider.connection.getTokenAccountBalance(recipientAtaKey)).value.amount;
    console.log(recipient.publicKey.toBase58() + " balance " + recipientBalance);
    assert(parseInt(recipientBalance) == 0);

  });
});

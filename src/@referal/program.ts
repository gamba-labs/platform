import { AnchorProvider, BorshAccountsCoder, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { REFERAL_IDL } from './idl'

export const PROGRAM_ID = new PublicKey('RefwFk2PPNd9bPehSyAkrkrehSHkvz6mTAHTNe8v9vH')

export const referalAccountsCoder = new BorshAccountsCoder(REFERAL_IDL)

const getPdaAddress = (...seeds: (Uint8Array | Buffer)[]) => {
  const [address] = PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)
  return address
}

export const getRefererPda = (creator: PublicKey, authority: PublicKey) =>
  getPdaAddress(
    creator.toBytes(),
    authority.toBytes(),
  )

export const createReferal = async (
  provider: AnchorProvider,
  creator: PublicKey,
  referAccount: PublicKey,
) => {
  const referalProgram = new Program(REFERAL_IDL, PROGRAM_ID, provider)
  return referalProgram.methods
    .configReferAccount(referAccount)
    .accounts({ referAccount: getRefererPda(creator, provider.wallet.publicKey), creator })
    .instruction()
}

export const closeReferal = async (
  provider: AnchorProvider,
  creator: PublicKey,
) => {
  const referalProgram = new Program(REFERAL_IDL, PROGRAM_ID, provider)
  return referalProgram.methods
    .closeReferAccount()
    .accounts({ referAccount: getRefererPda(creator, provider.wallet.publicKey), creator })
    .instruction()
}

export const fetchReferal = async (
  provider: AnchorProvider,
  pda: PublicKey,
) => {
  const referalProgram = new Program(REFERAL_IDL, PROGRAM_ID, provider)
  referalProgram.account.referAccount.all()
    .then((x) => console.log('ALL', x))
  const account = await referalProgram.account.referAccount.fetch(pda)
  if (!account) return null
  return account.referrer
}

import * as SplToken from '@solana/spl-token'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js'
import { GambaPlugin } from 'gamba-react-v2'
import { PLATFORM_REFERRAL_FEE } from '../constants'
import { createReferal } from './program'

const getRecipientFromStorage = () => {
  try {
    const referalAddressOnChain = sessionStorage.getItem('referalAddressOnChain')
    const referalAddressLocal = sessionStorage.getItem('referalAddress')
    const referalAddress = referalAddressOnChain ?? referalAddressLocal
    console.log(referalAddressOnChain, referalAddressLocal)
    if (!referalAddress) return null
    return {
      recipient: new PublicKey(referalAddress),
      onChain: !!referalAddressOnChain,
    }
  } catch {
    return null
  }
}

/**
 * This function returns additional instructions that will be executed before playing
 */
export const makeReferalPlugin = (
  feePercent = PLATFORM_REFERRAL_FEE,
): GambaPlugin => async (input, context) => {
  const referal = getRecipientFromStorage()
  if (!referal) return []

  const instructions: TransactionInstruction[] = []
  const tokenAmount = BigInt(Math.floor(input.wager * feePercent))

  const { recipient, onChain } = referal

  if (!onChain) {
    // Save the referal address on-chain
    instructions.push(
      await createReferal(context.provider.anchorProvider!, input.creator, recipient),
    )
  }

  // Send native SOL
  if (input.token.equals(SplToken.NATIVE_MINT)) {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: input.wallet,
        toPubkey: recipient,
        lamports: tokenAmount,
      }),
    )
  } else {
    // Send SPL token
    const fromAta = SplToken.getAssociatedTokenAddressSync(input.token, input.wallet)
    const toAta = SplToken.getAssociatedTokenAddressSync(input.token, recipient)

    const recipientHasAta = await (async () => {
      try {
        await SplToken.getAccount(context.provider.anchorProvider.connection, toAta, 'confirmed')
        // Recipient account exists, return empty
        return true
      } catch (error) {
        if (error instanceof SplToken.TokenAccountNotFoundError || error instanceof SplToken.TokenInvalidAccountOwnerError) {
          // Recipient account doesn't exist, add create instruction
          return false
        } else {
          throw error
        }
      }
    })()

    if (!recipientHasAta) {
      instructions.push(
        SplToken.createAssociatedTokenAccountInstruction(
          input.wallet,
          toAta,
          recipient,
          input.token,
        ),
      )
    }

    instructions.push(
      SplToken.createTransferInstruction(
        fromAta,
        toAta,
        input.wallet,
        tokenAmount,
      ),
    )
  }

  // Override creatorFee so that the player doesn't end up paying more
  context.creatorFee = Math.max(0, context.creatorFee - feePercent)

  return instructions
}

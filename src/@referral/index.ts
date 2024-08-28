import { PublicKey } from '@solana/web3.js'

const REFERRAL_PREFIX = ''

export function getReferralAddressFromHash() {
  const hash = '?' + 'ref=' + REFERRAL_PREFIX
  if (!window.location.hash.startsWith(hash)) return null
  const [_, referralAddressString] = window.location.hash.split(hash)
  try {
    return new PublicKey(referralAddressString)
  } catch (err) {
    return null
  }
}

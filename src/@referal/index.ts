import { PublicKey } from '@solana/web3.js'

const REFERAL_PREFIX = ''

export function getReferalAddressFromHash() {
  const hash = '#' + REFERAL_PREFIX
  if (!window.location.hash.startsWith(hash)) return null
  const [_, referalAddressString] = window.location.hash.split(hash)
  try {
    return new PublicKey(referalAddressString)
  } catch (err) {
    return null
  }
}

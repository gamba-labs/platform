import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, PoolToken } from 'gamba-react-ui-v2'

export const PLATFORM_CREATOR_ADDRESS = new PublicKey('V2grJiwjs25iJYqumbHyKo5MTK7SFqZSdmoRaj8QWb9')

/** Appears in ShareModal */
export const PLATFORM_SHARABLE_URL = 'play.gamba.so'

// Just a helper function
const token = (
  poolToken: PublicKey | string,
  poolAuthority?: PublicKey | string,
): PoolToken => ({
  token: new PublicKey(poolToken),
  authority: poolAuthority !== undefined ? new PublicKey(poolAuthority) : undefined,
})

// List of tokens supported by this platform
// Make sure the token you want to list has a corresponding pool on explorer.gamba.so/pools
export const POOLS = [
    // SOL:
    token('So11111111111111111111111111111111111111112'),
    // USDC:
    token('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    // Fake token:
    token(FAKE_TOKEN_MINT),
    // If you want to list a token from a private LP, make the second argument the owner of the pool
    // Here's an example for a private SOL LP:
    // token(
    //   'So11111111111111111111111111111111111111112',
    //   '<Address of the pool's creator>',
    // ),
    token('85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ'),
  ]

// add token metadata in index.tsx!!
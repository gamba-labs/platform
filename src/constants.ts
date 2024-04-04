import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, PoolToken, TokenMeta, makeHeliusTokenFetcher } from 'gamba-react-ui-v2'

/** The address that will collect fees when somebody plays on this platform */
export const PLATFORM_CREATOR_ADDRESS = new PublicKey('V2grJiwjs25iJYqumbHyKo5MTK7SFqZSdmoRaj8QWb9')

// Get RPC from the .env file or default to the public RPC.
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com"

/** Appears in ShareModal */
export const PLATFORM_SHARABLE_URL = 'play.gamba.so'

// Just a helper function
const lp = (poolToken: PublicKey | string, poolAuthority?: PublicKey | string): PoolToken => ({
  token: new PublicKey(poolToken),
  authority: poolAuthority !== undefined ? new PublicKey(poolAuthority) : undefined,
})

/**
 * List of pools supported by this platform
 * Make sure the token you want to list has a corresponding pool on https://explorer.gamba.so/pools
 * For private pools, add the creator of the Liquidity Pool as a second argument
 */
export const POOLS = [
  // SOL:
  lp('So11111111111111111111111111111111111111112'),
  // USDC:
  lp('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  // Fake token:
  lp(FAKE_TOKEN_MINT),
  // Wormhole:
  lp('85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ'),
]

// The default token to be selected
export const DEFAULT_POOL = POOLS[0]

/**
 * A method for automatically fetching Token Metadata.
 * If we don't supply a fetcher method we manually add the metadata for each supported token in TOKEN_METADATA below.
 * Here we create a fetcher that uses Helius metadata API, if an API key exists as an Environment variable.
 */
export const TOKEN_METADATA_FETCHER = (
  () => {
    if (import.meta.env.VITE_HELIUS_API_KEY) {
      return makeHeliusTokenFetcher(
        import.meta.env.VITE_HELIUS_API_KEY,
        { dollarBaseWager: 1 },
      )
    }
  }
)()

/**
 * List of token metadata for the supported tokens
 */
export const TOKEN_METADATA: (Partial<TokenMeta> & {mint: PublicKey})[] = [
  {
    mint: FAKE_TOKEN_MINT,
    name: 'Fake',
    symbol: 'FAKE',
    image: '/fakemoney.png',
    baseWager: 1e9,
    decimals: 9,
    usdPrice: 0,
  },
  {
    mint: new PublicKey('85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ'),
    name: 'W',
    symbol: 'Wormhole',
    image: 'https://wormhole.com/token.png',
    baseWager: 1e6,
    decimals: 6,
    usdPrice: 0,
  },
]

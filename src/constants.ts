import { GambaStandardTokens, TokenMeta } from 'gamba-react-ui-v2'

// Can be configured in .env
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com"

// Change this value to your Solana address
export const PLATFORM_CREATOR_ADDRESS = '23nXePvpVParAALRbExFt7ce3x1trT47i3fvDXdwZMhS'

// Appears in ShareModal
export const PLATFORM_SHARABLE_URL = 'v2-play.gamba.so'

// List of tokens supported by this platform
export const TOKENS: TokenMeta[] = [
  GambaStandardTokens.sol,
  GambaStandardTokens.usdc,
  // {
  //   mint: new PublicKey(""),
  //   symbol: '???',
  //   name: 'Custom SPL Token',
  //   decimals: 1e9,
  //   baseWager: 1,
  // }
]

import { GambaStandardTokens, TokenMeta } from 'gamba-react-ui-v2'

export const PLATFORM_CREATOR_ADDRESS = 'V2grJiwjs25iJYqumbHyKo5MTK7SFqZSdmoRaj8QWb9'

/** Appears in ShareModal */
export const PLATFORM_SHARABLE_URL = 'v2-play.gamba.so'

// List of tokens supported by this platform
export const TOKENS: TokenMeta[] = [
  GambaStandardTokens.sol,
  GambaStandardTokens.usdc,
  // {
  //   mint: new PublicKey(""),
  //   symbol: '?',
  //   name: '?',
  //   decimals: 1e9,
  //   baseWager: 1,
  // }
]

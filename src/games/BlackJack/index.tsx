import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import { CARD_VALUES, RANKS, RANK_SYMBOLS, SUIT_COLORS, SUIT_SYMBOLS, SUITS, SOUND_CARD, SOUND_LOSE, SOUND_PLAY, SOUND_WIN, SOUND_JACKPOT } from './constants'
import { Card, CardContainer, CardsContainer, Container, Profit, CardArea } from './styles'

const randomRank = () => Math.floor(Math.random() * RANKS)
const randomSuit = () => Math.floor(Math.random() * SUITS)

const createCard = (rank = randomRank(), suit = randomSuit()): Card => ({
  key: Math.random(),
  rank,
  suit,
})

interface Card {
  key: number
  rank: number
  suit: number
}

export interface BlackjackConfig {
  logo: string
}

export default function Blackjack(props: BlackjackConfig) {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const pool = useCurrentPool()
  const [playerCards, setPlayerCards] = React.useState<Card[]>([])
  const [dealerCards, setDealerCards] = React.useState<Card[]>([])
  const [initialWager, setInitialWager] = useWagerInput()
  const [profit, setProfit] = React.useState<number | null>(null)
  const [claiming, setClaiming] = React.useState(false)

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    card: SOUND_CARD,
    jackpot: SOUND_JACKPOT,
  })

  const resetGame = () => {
    setProfit(null)
    setPlayerCards([])
    setDealerCards([])
  }

  const play = async () => {
    // Reset game state before playing
    resetGame()
    sounds.play('play')

    const betArray = [2.5, 2.5, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0] 

    await game.play({
      bet: betArray,
      wager: initialWager,
    })

    const result = await game.result()
    const payoutMultiplier = result.payout / initialWager

    let newPlayerCards: Card[] = []
    let newDealerCards: Card[] = []

    if (payoutMultiplier === 2.5) {
      // Player got blackjack
      newPlayerCards = generateBlackjackHand()
      newDealerCards = generateRandomHandBelow(21)
    } else if (payoutMultiplier === 2) {
      // Player wins normally
      newPlayerCards = generateWinningHand()
      newDealerCards = generateLosingHand(newPlayerCards)
    } else {
      // Player loses
      newPlayerCards = generateLosingHand()
      newDealerCards = generateWinningHandOver(newPlayerCards)
    }

    // Function to deal cards one by one
    const dealCards = async () => {
      for (let i = 0; i < 2; i++) {
        // Deal to player
        if (i < newPlayerCards.length) {
          setPlayerCards(prev => [...prev, newPlayerCards[i]])
          sounds.play('card')
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
        }
        // After dealing player's second card, check for blackjack and play sound
        if (i === 1 && payoutMultiplier === 2.5) {
          sounds.play('jackpot') // Play jackpot sound for blackjack immediately
        }
        // Deal to dealer
        if (i < newDealerCards.length) {
          setDealerCards(prev => [...prev, newDealerCards[i]])
          sounds.play('card')
          await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
        }
      }
    }

    await dealCards()

    setProfit(result.payout)

    // Play the appropriate sound based on the result
    if (payoutMultiplier === 2.5) {
      // Do nothing; jackpot sound already played
    } else if (payoutMultiplier > 0) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  // Helper functions remain the same
  const getHandValue = (hand: Card[]): number => {
    return hand.reduce((sum, c) => sum + CARD_VALUES[c.rank], 0)
  }

  const generateBlackjackHand = (): Card[] => {
    const aceRank = 12
    const tenRanks = [8, 9, 10, 11] // Ranks corresponding to 10-value cards
    const tenCardRank = tenRanks[Math.floor(Math.random() * tenRanks.length)]
    return [createCard(aceRank, randomSuit()), createCard(tenCardRank, randomSuit())]
  }

  const generateRandomHandBelow = (maxTotal: number): Card[] => {
    let handValue = maxTotal
    while (handValue >= maxTotal) {
      const card1 = createCard()
      const card2 = createCard()
      handValue = CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank]
      if (handValue < maxTotal) {
        return [card1, card2]
      }
    }
    return []
  }

  const generateWinningHand = (): Card[] => {
    const totals = [17, 18, 19, 20]
    const targetTotal = totals[Math.floor(Math.random() * totals.length)]
    return generateHandWithTotal(targetTotal)
  }

  const generateLosingHand = (opponentHand?: Card[]): Card[] => {
    const opponentTotal = opponentHand ? getHandValue(opponentHand) : 20
    let total = opponentTotal
    while (total >= opponentTotal) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total < opponentTotal) {
        return hand
      }
    }
    return []
  }

  const generateWinningHandOver = (opponentHand: Card[]): Card[] => {
    const opponentTotal = getHandValue(opponentHand)
    let total = opponentTotal
    while (total <= opponentTotal || total > 21) {
      const hand = [createCard(), createCard()]
      total = getHandValue(hand)
      if (total > opponentTotal && total <= 21) {
        return hand
      }
    }
    return []
  }

  const generateHandWithTotal = (targetTotal: number): Card[] => {
    for (let i = 0; i < 100; i++) {
      const card1 = createCard()
      const card2 = createCard()
      if (CARD_VALUES[card1.rank] + CARD_VALUES[card2.rank] === targetTotal) {
        return [card1, card2]
      }
    }
    return generateRandomHandBelow(targetTotal)
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Container $disabled={claiming || gamba.isPlaying}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2>Dealer's Hand</h2>
              <CardArea>
                <CardsContainer>
                  {dealerCards.map((card) => (
                    <CardContainer key={card.key}>
                      <Card color={SUIT_COLORS[card.suit]}>
                        <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                        <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                      </Card>
                    </CardContainer>
                  ))}
                </CardsContainer>
              </CardArea>
              <h2>Player's Hand</h2>
              <CardArea>
                <CardsContainer>
                  {playerCards.map((card) => (
                    <CardContainer key={card.key}>
                      <Card color={SUIT_COLORS[card.suit]}>
                        <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                        <div className="suit">{SUIT_SYMBOLS[card.suit]}</div>
                      </Card>
                    </CardContainer>
                  ))}
                </CardsContainer>
              </CardArea>
              {profit !== null && (
                <Profit key={profit}>
                  {profit > 0 ? (
                    <>
                      <TokenValue amount={profit} /> +{Math.round((profit / initialWager) * 100 - 100)}%
                    </>
                  ) : (
                    <>You Lost</>
                  )}
                </Profit>
              )}
            </div>
          </Container>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <>
          <GambaUi.WagerInput value={initialWager} onChange={setInitialWager} />
          <GambaUi.PlayButton onClick={play}>Deal Cards</GambaUi.PlayButton>
        </>
      </GambaUi.Portal>
    </>
  )
}
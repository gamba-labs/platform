import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import { MAX_CARD_SHOWN, RANKS, RANK_SYMBOLS, SOUND_CARD, SOUND_FINISH, SOUND_LOSE, SOUND_PLAY, SOUND_WIN, WAGER_AMOUNTS } from './constants'
import { Card, CardContainer, CardPreview, Container, CardsContainer, Option, Options, Profit } from './styles'

const randomRank = () => 1 + Math.floor(Math.random() * (RANKS - 1))

const card = (rank = randomRank()): Card => ({
  key: Math.random(),
  rank,
})

interface Card {
  key: number
  rank: number
}

export default function HiLo() {
  const gamba = useGamba()
  const [cards, setCards] = React.useState([card()])
  const [loading, setLoading] = React.useState(false)
  const [claiming, setClaiming] = React.useState(false)
  const [initialWager, setInitialWager] = React.useState(WAGER_AMOUNTS[0])
  const [profit, setProfit] = React.useState(0)
  const currentRank = cards[cards.length - 1].rank
  const [option, setOption] = React.useState<'hi' | 'lo'>()
  const [hoveredOption, hoverOption] = React.useState<'hi' | 'lo'>()

  const addCard = (rank: number) => setCards((cards) => [...cards, card(rank)].slice(-MAX_CARD_SHOWN))

  const sounds = GameUi.useSounds({
    card: SOUND_CARD,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
    finish: SOUND_FINISH,
  })

  const betHi = React.useMemo(
    () =>
      Array.from({ length: RANKS }).map((_, i) => {
        if (currentRank === 0) {
          return i > currentRank ? RANKS / ((RANKS - 1) - currentRank) : 0
        }
        return i >= currentRank ? RANKS / (RANKS - currentRank) : 0
      }),
    [currentRank],
  )

  const betLo = React.useMemo(
    () =>
      Array.from({ length: RANKS }).map((_, i) => {
        if (currentRank === RANKS - 1) {
          return i < currentRank ? RANKS / (currentRank) : 0
        }
        return i <= currentRank ? RANKS / (currentRank + 1) : 0
      }),
    [currentRank],
  )

  const bet = React.useMemo(() => {
    const _option = hoveredOption ?? option
    if (_option === 'hi') return betHi
    if (_option === 'lo') return betLo
    return [0]
  }, [betHi, betLo, hoveredOption, option])

  const resetGame = async () => {
    try {
      if (claiming) return
      if (gamba.balances.user > 0) {
        setClaiming(true)
        await gamba.withdraw(gamba.balances.user)
      }
      sounds.finish.play({ playbackRate: .8 })
      setTimeout(() => {
        setProfit(0)
        sounds.card.play()
        addCard(randomRank())
        setOption(undefined)
        setClaiming(false)
      }, 300)
    } catch {
      setClaiming(false)
    }
  }

  const play = async () => {
    try {
      // sounds.play.play()
      // const _rank = randomRank()
      // addCard(_rank)
      // setTimeout(() => {
      //   setLoading(false)
      //   if (bet[_rank] > 0) {
      //     const payout = (profit || initialWager) * bet[_rank]
      //     setProfit(payout)
      //     sounds.win.play()
      //   } else {
      //     sounds.lose.play()
      //     setProfit(0)
      //   }
      // }, 500)
      // return
      sounds.play.play()
      const res = await gamba.play({
        bet,
        wager: profit || initialWager,
      })

      setLoading(true)
      const result = await res.result()
      addCard(result.resultIndex)
      sounds.card.play({ playbackRate: .8 })

      const win = result.payout > 0

      setTimeout(() => {
        setLoading(false)
        setProfit(result.payout)
        if (win) {
          sounds.win.play()
        } else {
          sounds.lose.play()
        }
      }, 300)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <GameUi.Fullscreen>
      <Container $disabled={claiming || loading}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <CardsContainer>
            {cards.map((card, i) => {
              const offset = -(cards.length - (i + 1))
              const xxx = cards.length > 3 ? (i / cards.length) : 1
              const opacity = Math.min(1, xxx * 3)
              return (
                <CardContainer
                  key={card.key}
                  style={{
                    transform: `translate(${offset * 30}px, ${-offset * 0}px) rotateZ(-5deg) rotateY(5deg)`,
                    opacity,
                  }}
                >
                  <Card>
                    <div className="rank">{RANK_SYMBOLS[card.rank]}</div>
                    <div className="suit" style={{ backgroundImage: 'url(/logo.svg)' }} />
                  </Card>
                </CardContainer>
              )
            })}
          </CardsContainer>
          <Options>
            <Option
              selected={option === 'hi'}
              onClick={() => setOption('hi')}
              onMouseEnter={() => hoverOption('hi')}
              onMouseLeave={() => hoverOption(undefined)}
            >
              <div>
                👆
              </div>
              <div>HI - ({Math.max(...betHi).toFixed(2)}x)</div>
            </Option>
            <Option
              selected={option === 'lo'}
              onClick={() => setOption('lo')}
              onMouseEnter={() => hoverOption('lo')}
              onMouseLeave={() => hoverOption(undefined)}
            >
              <div>
                👇
              </div>
              <div>LO - ({Math.max(...betLo).toFixed(2)}x)</div>
            </Option>
          </Options>
        </div>
        <CardPreview>
          {Array.from({ length: RANKS }).map((_, rankIndex) => {
            const opacity = bet[rankIndex] > 0 ? .9 : .5
            return (
              <Card key={rankIndex} $small style={{ opacity }}>
                <div className="rank">{RANK_SYMBOLS[rankIndex]}</div>
              </Card>
            )
          })}
        </CardPreview>
        {profit > 0 && (
          <Profit key={profit} onClick={resetGame}>
            {formatLamports(profit)} +{Math.round(profit / initialWager * 100 - 100).toLocaleString()}%
          </Profit>
        )}
      </Container>
      <GameUi.Controls disabled={claiming || loading}>
        {!profit && (
          <GameUi.Select.Root
            value={initialWager}
            label="Wager"
            onChange={setInitialWager}
            format={(wager) => formatLamports(wager)}
          >
            {WAGER_AMOUNTS.map((wager) => (
              <GameUi.Select.Option key={wager} value={wager}>
                {formatLamports(wager)}
              </GameUi.Select.Option>
            ))}
          </GameUi.Select.Root>
        )}
        {profit > 0 && (
          <GameUi.Button onClick={resetGame}>
            Cashout
          </GameUi.Button>
        )}
        <GameUi.Button variant="primary" disabled={!option} onClick={play}>
          Deal card
        </GameUi.Button>
      </GameUi.Controls>
    </GameUi.Fullscreen>
  )
}

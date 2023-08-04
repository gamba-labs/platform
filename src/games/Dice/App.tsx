import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize } from 'gamba/react-ui'
import React, { useState } from 'react'
import * as Tone from 'tone'
import Slider from './Slider'
import loseSrc from './lose.mp3'
import { GameContainer, SemiCircleContainer, StatContainer, StatContainerWrapper, StatItem, StyledSlider, WagerButtons, WagerInput, WagerSection } from './styles'
import winSrc from './win.mp3'

const createSound = (url: string) => new Tone.Player({ url }).toDestination()

const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

function Dice() {
  const gamba = useGamba()
  const [_wager, setWager] = useState(0.05)
  const [loading, setLoading] = useState(false)
  const [resultIndex, setResultIndex] = useState(-1)
  const [odds, setOdds] = useState(50)

  const MAX_PAYOUT = 6

  const multiplier = 100 / odds
  const maxBet = Math.min(lamportsToSol(gamba.balances.total), MAX_PAYOUT * (odds / 100))
  const wager = Math.min(maxBet, _wager)

  const play = async () => {
    try {
      const bet = Array.from({ length: 100 }).map((_, i) => {
        if (i < odds) {
          return +multiplier.toFixed(4)
        }
        return 0
      })
      const wagerLamports = solToLamports(wager)
      const response = await gamba.play(bet, wagerLamports)

      setLoading(true)

      const result = await response.result()
      const resultnr = result.resultIndex + 1

      console.debug('resultindex', resultnr)
      console.debug('betarray', bet)

      setResultIndex(resultnr)
      const win = result.payout > 0
      if (win) {
        soundWin.start()
      } else {
        soundLose.start()
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveSize>
        <GameContainer>

          <StatContainerWrapper>
            <SemiCircleContainer>
              <div>{odds + 1}</div>
              <div>Roll Under</div>
            </SemiCircleContainer>
            <StatContainer>
              <StatItem>
                <div>{odds}%</div>
                <div>Win odds</div>
              </StatItem>
              <StatItem>
                <div>{wager.toFixed(2)} SOL</div>
                <div>Wager</div>
              </StatItem>
              <StatItem>
                <div>{multiplier.toFixed(2)}x</div>
                <div>Multiplier</div>
              </StatItem>
              <StatItem>
                <div>{(wager * multiplier).toFixed(2)} SOL</div>
                <div>Payout</div>
              </StatItem>
              <StatItem>
                <div>{maxBet.toFixed(2)} SOL</div>
                <div>Max Bet</div>
              </StatItem>
            </StatContainer>
          </StatContainerWrapper>

          <Slider
            resultIndex={resultIndex}
            disabled={loading}
            min={1}
            max={100}
            value={odds}
            onChange={(value) => {
              setOdds(value)
              let newWager = wager // Compute the new wager based on the new odds value
              if (newWager > maxBet) {
                newWager = maxBet
              }
              setWager(newWager)
            }}
          />

          <WagerSection>
            <div>
              <WagerInput>
                <input
                  disabled={loading}
                  type="number"
                  min="0.05"
                  step="0.01"
                  max={maxBet.toFixed(2)}
                  value={wager}
                  onChange={(e) => {
                    let newWager = Number(e.target.value)
                    if (newWager > maxBet) {
                      newWager = maxBet
                    }
                    setWager(newWager)
                  }}
                />
                SOL
              </WagerInput>
              <StyledSlider
                disabled={loading}
                type="range"
                min="0.05"
                step="0.01"
                max={maxBet.toFixed(2)}
                value={wager}
                onChange={(e) => {
                  let newWager = Number(e.target.value)
                  if (newWager > maxBet) {
                    newWager = maxBet
                  }
                  setWager(newWager)
                }}
              />
              <WagerButtons>
                <button onClick={() => setWager(0.05)}>Min</button>
                <button onClick={() => setWager(Math.min(wager * 2, maxBet))}>2x</button>
                <button onClick={() => setWager(wager / 2)}>1/2</button>
                <button onClick={() => setWager(maxBet)}>Max</button>
              </WagerButtons>
            </div>
          </WagerSection>

        </GameContainer>
      </ResponsiveSize>
      <ActionBar>
        <Button loading={loading} onClick={play}>
          Spin
        </Button>
      </ActionBar>
    </>
  )
}

export default Dice

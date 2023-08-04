import { solToLamports, lamportsToSol } from 'gamba'
import { useGamba } from 'gamba/react'
import { ResponsiveSize, ActionBar, Button, formatLamports } from 'gamba/react-ui'
import React, { useState, useEffect } from 'react'
import { GameContainer, WagerButtons, WagerInputs, WagerSection, StyledSlider, StatItem, StatContainer, SemiCircleContainer, StatContainerWrapper } from './styles'
import * as Tone from 'tone'
import styled from 'styled-components'
import Slider from './Slider'  
import winSrc from './win.mp3'
import loseSrc from './lose.mp3'

const createSound = (url: string) => new Tone.Player({ url }).toDestination()

const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

function Dice() {
  const gamba = useGamba()
  const [wager, setWager] = useState<number>(0.05)  // wager in SOL
  const [resultIndex, setResultIndex] = useState<number>(0)
  const [odds, setOdds] = useState<number>(50)  // Initializing odds with 50%
  const [multiplier, setMultiplier] = useState<number>(100 / odds)
  const [maxBet, setMaxBet] = useState<number>(6)  // maxBet in SOL

  const MAX_PAYOUT = 6

  useEffect(() => {
    setMultiplier(100 / odds)
    setMaxBet(MAX_PAYOUT * (odds / 100))  // maxBet in SOL
  }, [odds])

  const generateBetArray = () => {
    const betArray = []
    
    for (let i = 0; i < 100; i++) {
      if (i < odds) {
        betArray.push(+multiplier.toFixed(4))
      } else {
        betArray.push(0)
      }
    }
    return betArray
  }

  const play = async () => {
    try {
      const bet = generateBetArray()
      const wagerLamports = solToLamports(wager)
      const response = await gamba.play(bet, wagerLamports)

      const result = await response.result()
      const resultnr = result.resultIndex + 1
      console.log('resultindex', resultnr)
      console.log('betarray', bet)
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
      console.log('done')
    }
  }

  return (
    <>
      <ResponsiveSize>
        <GameContainer>

          <Slider min={1} max={100} value={odds} onChange={(value) => {
            setOdds(value)
            let newWager = wager // Compute the new wager based on the new odds value
            if (newWager > maxBet) {
              newWager = maxBet
            }
            setWager(newWager)
          }} resultIndex={resultIndex} />

          <StatContainerWrapper>
            <SemiCircleContainer>
              <div>{odds + 1}</div>
              <div>Roll Under</div>
            </SemiCircleContainer>
            <StatContainer>
              <StatItem>
                <div>Winning odds</div>
                <div>{odds}%</div>
              </StatItem>
              <StatItem>
                <div>Wager</div>
                <div>{wager.toFixed(2)} SOL</div>
              </StatItem>
              <StatItem>
                <div>Multiplier</div>
                <div>{multiplier.toFixed(2)}x</div>
              </StatItem>
              <StatItem>
                <div>Payout</div>
                <div>{(wager * multiplier).toFixed(2)} SOL</div>
              </StatItem>
              <StatItem>
                <div>Max Bet</div>
                <div>{maxBet.toFixed(2)} SOL</div>
              </StatItem>
            </StatContainer>
          </StatContainerWrapper>

          <WagerSection>
            <WagerInputs>
              <input
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
              <StyledSlider
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
            </WagerInputs>
            <WagerButtons>
              <Button onClick={() => setWager(0.05)}>Min</Button>
              <Button onClick={() => setWager(Math.min(wager * 2, maxBet))}>2x</Button>
              <Button onClick={() => setWager(wager / 2)}>1/2</Button>
              <Button onClick={() => setWager(maxBet)}>Max</Button>
            </WagerButtons>
          </WagerSection>

        </GameContainer>
      </ResponsiveSize>
      <ActionBar>
        <Button onClick={play}>Spin</Button>
      </ActionBar>
    </>
  )
}

export default Dice

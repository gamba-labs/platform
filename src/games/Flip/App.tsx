import { OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import styled from 'styled-components'
import * as Tone from 'tone'
import { Dropdown } from '../../components/Dropdown'
import { Coin } from './Coin'
import { SplashEffect } from './SplashEffect'
import coinSrc from './coin.wav'
import headsSrc from './heads.png'
import loseSrc from './lose.wav'
import tailsSrc from './tails.png'
import winSrc from './win.wav'

const WAGER_AMOUNTS = [
  0.05,
  0.1,
  0.25,
  .5,
  1,
  3,
].map(solToLamports)

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundPlay = createSound(coinSrc)
const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

const CoinButton = styled.button<{selected: boolean}>`
  background: #ccc;
  border: none;
  margin: 0;
  position: relative;
  border-radius: var(--border-radius);
  ${({ selected }) => selected && `
    background: #42ff78;
  `}
  &:disabled {
    cursor: default;
    opacity: .5;
  }
  & > div {
    position: absolute;
    width: 75%;
    height: 75%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-size: auto 100%;
    background-position: center;
    background-repeat: no-repeat;
  }
`

interface Result {
  win: boolean
  index: number
}

export default function Flip() {
  const gamba = useGamba()
  const [heads, setHeads] = useState(true)
  const [flipping, setFlipping] = useState<'heads' | 'tails'>()
  const [result, setResult] = useState<Result>()
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])

  const play = async () => {
    try {
      const bet = heads ? [2, 0] : [0, 2]
      const response = await gamba.play(bet, wager)
      soundPlay.start()
      setFlipping(heads ? 'heads' : 'tails')
      const result = await response.result()
      const win = result.payout > 0
      setResult({
        index: result.resultIndex,
        win,
      })
      if (win)
        soundWin.start()
      else
        soundLose.start()
    } catch (err) {
      console.error(err)
    } finally {
      setFlipping(undefined)
    }
  }

  return (
    <>
      <Canvas linear flat onContextMenu={(e) => e.preventDefault()} style={{ background: '#191621' }}>
        <OrthographicCamera
          makeDefault
          zoom={80}
          position={[0, 0, 100]}
        />
        <Coin result={result?.index ?? 0} flipping={!!flipping} />
        {flipping && (
          <SplashEffect color="white" />
        )}
        {!flipping && result !== null && result?.win && <SplashEffect color="#42ff78" />}
        <ambientLight color="#ffffff" intensity={.5} />
        <directionalLight position={[0, 5, 5]} intensity={.5} />
        <hemisphereLight color="black" groundColor="red" intensity={1} />
      </Canvas>
      <ActionBar>
        <Dropdown
          value={wager}
          format={(value) => formatLamports(value)}
          label="Wager"
          onChange={setWager}
          options={WAGER_AMOUNTS.map((value) => ({
            label: formatLamports(value),
            value,
          }))}
        />
        <CoinButton disabled={flipping} selected={heads} onClick={() => setHeads(true)}>
          HEADS
        </CoinButton>
        <CoinButton disabled={flipping} selected={!heads} onClick={() => setHeads(false)} label={tailsSrc}>
          TAILS
        </CoinButton>
        <Button disabled={!!flipping} onClick={play}>
          Flip
        </Button>
      </ActionBar>
    </>
  )
}

import { Canvas } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Coin } from './Coin'
import { Effect } from './Effect'

import SOUND_COIN from './coin.mp3'
import SOUND_LOSE from './lose.mp3'
import SOUND_WIN from './win.mp3'

const SIDES = {
  Heads: [2, 0],
  Tails: [0, 2],
}

const WAGER_OPTIONS = [0.05, 0.1, 0.5, 1, 3].map(solToLamports)

export default function Flip() {
  const gamba = useGamba()
  const [flipping, setFlipping] = React.useState(false)
  const [win, setWin] = React.useState(false)
  const [resultIndex, setResultIndex] = React.useState(0)
  const [wager, setWager] = React.useState(WAGER_OPTIONS[0])

  const sounds = GameUi.useSounds({
    coin: SOUND_COIN,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

  const play = async (bet: number[]) => {
    try {
      setWin(false)
      setFlipping(true)

      sounds.coin.play({ playbackRate: .5 })

      const res = await gamba.play({ bet, wager })

      sounds.coin.play()

      const result = await res.result()

      const win = result.payout > 0

      setResultIndex(result.resultIndex)

      setWin(win)

      if (win) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } finally {
      setFlipping(false)
    }
  }

  return (
    <>
      <GameUi.Controls disabled={flipping}>
        <GameUi.Select.Root
          value={wager}
          label="Wager"
          onChange={(wager) => setWager(wager)}
          format={() => formatLamports(wager)}
        >
          {WAGER_OPTIONS.map((wager) => (
            <GameUi.Select.Option key={wager} value={wager}>
              {formatLamports(wager)}
            </GameUi.Select.Option>
          ))}
        </GameUi.Select.Root>
        <GameUi.Button variant="primary" onClick={() => play(SIDES.Heads)}>
          Heads
        </GameUi.Button>
        <GameUi.Button variant="primary" onClick={() => play(SIDES.Tails)}>
          Tails
        </GameUi.Button>
      </GameUi.Controls>
      <Canvas
        linear
        flat
        orthographic
        camera={{
          zoom: 80,
          position: [0, 0, 100],
        }}
      >
        <React.Suspense fallback={null}>
          <Coin result={resultIndex} flipping={flipping} />
        </React.Suspense>
        {flipping && <Effect color="white" />}
        {win && <Effect color="#42ff78" />}
        <ambientLight color="#CCCCCC" />
        <directionalLight
          position-z={1}
          position-y={1}
          castShadow
          color="#CCCCCC"
        />
        <hemisphereLight
          intensity={.5}
          position={[0, 1, 0]}
          scale={[1, 1, 1]}
          color="#ff0000"
          groundColor="#0000ff"
        />
      </Canvas>
    </>
  )
}

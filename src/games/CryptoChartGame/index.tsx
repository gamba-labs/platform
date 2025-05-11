
import { GambaUi, useGame, useWagerInput } from 'gamba-react-ui-v2'
import React from 'react'
import CustomSlider from './Slider'
import {
  ChartWrapper,
  ScreenWrapper,
} from './styles'
import { calculateBetArray } from './utils'

export default function CryptoChartGame() {
  const [wager, setWager] = useWagerInput()
  const [multiplierTarget, setMultiplierTarget] = React.useState(1.5)
  const [currentMultiplier, setCurrentMultiplier] = React.useState(0)
  const [basePrice] = React.useState(160)
  const [gameState, setGameState] = React.useState<'idle' | 'win' | 'crash'>('idle')
  const [candles, setCandles] = React.useState([])
  const [finalMultiplier, setFinalMultiplier] = React.useState(0)

  const viewBoxWidth = 300
  const viewBoxHeight = 100
  const animationRef = React.useRef(null)
  const game = useGame()

  const generateCandle = (prevClose: number) => {
    const trendUp = 0.7
    const noise = (Math.random() - 0.5) * 1.5

    let open = prevClose
    let close = prevClose + trendUp + noise

    let isRed = false

    if (Math.random() < 0.35) {
      close = Math.max(1, prevClose - Math.random() * 2)
      isRed = true
    }

    const high = Math.max(open, close) + Math.random() * 0.5
    const low = Math.min(open, close) - Math.random() * 0.5

    return { open, close, high, low, isRed }
  }

  const animate = (current: number, target: number, win: boolean) => {
    setCurrentMultiplier(current)

    setCandles(prev => {
      const last = prev[prev.length - 1]
      const prevClose = last ? last.close : 100
      const newCandle = generateCandle(prevClose)
      return [...prev, newCandle]
    })

    if (current >= target) {
      setGameState(win ? 'win' : 'crash')
      setCurrentMultiplier(target)
      setFinalMultiplier(target)
      return
    }
    animationRef.current = setTimeout(() => animate(current + 0.03, target, win), 100)
  }

  const calculateBiasedLowMultiplier = (targetMultiplier: number) => {
    const randomValue = Math.random()
    const maxPossibleMultiplier = Math.min(targetMultiplier, 12)
    const exponent = randomValue > 0.95 ? 2.8 : (targetMultiplier > 10 ? 5 : 6)
    const result = 1 + Math.pow(randomValue, exponent) * (maxPossibleMultiplier - 1)
    return parseFloat(result.toFixed(2))
  }

  const play = async () => {
    clearTimeout(animationRef.current)
    setGameState('idle')
    setCandles([])
    const betArray = calculateBetArray(multiplierTarget)
    await game.play({ wager, bet: betArray })
    const result = await game.result()
    const win = result.payout > 0
    const targetMultiplier = win ? multiplierTarget : calculateBiasedLowMultiplier(multiplierTarget)
    animate(0, targetMultiplier, win)
  }

  const Candle = ({ index, open, close, high, low, minPrice, maxPrice }) => {
    const isUp = close >= open
    const color = isUp ? '#00ff55' : '#ff0033'
    const scaleY = viewBoxHeight / (maxPrice - minPrice)

    const openY = viewBoxHeight - (open - minPrice) * scaleY
    const closeY = viewBoxHeight - (close - minPrice) * scaleY
    const highY = viewBoxHeight - (high - minPrice) * scaleY
    const lowY = viewBoxHeight - (low - minPrice) * scaleY

    const height = Math.max(10, Math.abs(closeY - openY))
    const x = index * 14

    return (
      <g transform={`translate(${x},0)`}>
        <line
          x1={0}
          y1={highY}
          x2={0}
          y2={lowY}
          stroke={color}
          strokeWidth="3.5"
        />
        <rect
          x={-5}
          y={Math.min(openY, closeY)}
          width={10}
          height={height}
          fill={color}
          rx={0.5}
        />
      </g>
    )
  }

  const allHighs = candles.map(c => c.high)
  const allLows = candles.map(c => c.low)
  const maxPrice = Math.max(...allHighs, 105)
  const minPrice = Math.min(...allLows, 95)
  const buffer = 10
  const adjustedMin = Math.max(0, minPrice - buffer)
  const adjustedMax = maxPrice + buffer

  const statusText = gameState === 'win'
    ? `MOON 🚀 (${finalMultiplier.toFixed(2)}x)`
    : gameState === 'crash'
      ? `RUGGED 💥 (${finalMultiplier.toFixed(2)}x)`
      : ''

  const statusColor = gameState === 'win' ? '#00c853' : gameState === 'crash' ? '#d50000' : '#ffffff'
  const bgColor = gameState === 'win'
    ? '#003300'
    : gameState === 'crash'
      ? '#330000'
      : '#000000'

  const offsetX = Math.max(0, candles.length * 14 - viewBoxWidth)
  const simulatedPrice = (basePrice * (currentMultiplier || 1)).toFixed(2)

  return (
    <>
      <GambaUi.Portal target="screen">
        <ScreenWrapper style={{
          background: bgColor,
          position: 'relative',
          transition: 'background 0.3s',
        }}>
          {(gameState === 'idle') && (
            <ChartWrapper>
              <svg width="100%" height="100%" viewBox={`${offsetX} 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="none">
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1={offsetX}
                    x2={offsetX + viewBoxWidth}
                    y1={(i + 1) * (viewBoxHeight / 6)}
                    y2={(i + 1) * (viewBoxHeight / 6)}
                    stroke="#2e2e2e"
                    strokeWidth="0.5"
                  />
                ))}
                <g>
                  {candles.map((candle, idx) => (
                    <Candle
                      key={idx}
                      index={idx}
                      open={candle.open}
                      close={candle.close}
                      high={candle.high}
                      low={candle.low}
                      minPrice={adjustedMin}
                      maxPrice={adjustedMax}
                    />
                  ))}
                </g>
              </svg>
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#00ff55', marginRight: 6 }} />
                <div style={{ color: '#999', fontSize: 24, fontWeight: 'bold' }}>Solana</div>
              </div>
              <div style={{ position: 'absolute', top: 40, left: 10, color: '#00c853', fontSize: 28, fontWeight: 'bold' }}>
                ${simulatedPrice}
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, color: '#00ff55', fontSize: 28, fontWeight: 'bold' }}>
                {currentMultiplier.toFixed(2)}x
              </div>
            </ChartWrapper>
          )}
          {(gameState === 'win' || gameState === 'crash') && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: statusColor,
              fontSize: 50,
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
              {statusText}
            </div>
          )}
        </ScreenWrapper>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <CustomSlider value={multiplierTarget} onChange={setMultiplierTarget} />
        <GambaUi.PlayButton onClick={play}>Play</GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}

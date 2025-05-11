import styled from 'styled-components'
import React from 'react'

export const ScreenWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: black;
`

export const ChartWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const MultiplierText = styled.div<{ color: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  color: ${(props) => props.color || 'white'};
`

export const Grid = styled.rect.attrs(() => ({
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: '#333',
  'stroke-width': 0.5,
}))``

// Componente Candle para renderizar velas japonesas (en el SVG)
type CandleProps = {
  x: number
  open: number
  close: number
  high: number
  low: number
}

export const Candle: React.FC<CandleProps> = ({ x, open, close, high, low }) => (
  <g transform={`translate(${x * 3},0)`}>
    <line
      x1={0}
      y1={100 - high}
      x2={0}
      y2={100 - low}
      stroke="#ffffff"
      strokeWidth={1}
    />
    <rect
      x={-1.5}
      y={100 - Math.max(open, close)}
      width={3}
      height={Math.max(2, Math.abs(close - open))}
      fill={close > open ? '#00ff00' : '#ff0000'}
    />
  </g>
)

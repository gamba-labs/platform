import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const pop = keyframes`
  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  12%  { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  80%  { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
`

const Banner = styled.div`
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Impact', sans-serif;
  font-size: 64px;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 10px #000;
  pointer-events: none;
  animation: ${pop} 1.5s cubic-bezier(.2,1.2,.6,1) forwards;
`

export type HudMessage = 'GO' | 'EXTRA BALL' | 'PLAYER OUT' | 'FINISH!' | 'DEDUCTION' | 'BIG COMBO'

export interface HudPayload {
  text: HudMessage
  key: number
}

interface Props {
  message: HudPayload | null
}

export default function BoardHUD({ message }: Props) {
  const [visible, setVisible] = useState<HudPayload | null>(null)

  useEffect(() => {
    if (!message) return
    setVisible(message)
    const id = setTimeout(() => setVisible(null), 1500)
    return () => clearTimeout(id)
  }, [message])

  return visible ? <Banner>{visible.text}</Banner> : null
}

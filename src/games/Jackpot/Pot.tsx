import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { animate } from 'framer-motion'

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const controls = animate(
      Number(node.textContent) || 0,
      value,
      {
        duration: 0.5,
        ease: 'easeOut',
        onUpdate(latest) {
          node.textContent = latest.toFixed(2)
        },
      }
    )
    return () => controls.stop()
  }, [value])

  return <span ref={ref} />
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 15px 0;
`

const Label = styled.div`
  font-size: 1rem;
  color: #e0e0e0;
`

const Value = styled.div`
  font-size: 3rem;
  line-height: 1.1;
  color: #f1c40f;
  font-weight: bold;
  text-shadow: 0 0 15px #f1c40f;

  @media (max-width: 900px) {
    font-size: 2.5rem;
  }
`

interface PotProps {
  totalPot: number
}

export function Pot({ totalPot }: PotProps) {
  return (
    <Wrapper>
      <Label>Total Pot</Label>
      <Value>
        <AnimatedNumber value={totalPot} /> SOL
      </Value>
    </Wrapper>
  )
}

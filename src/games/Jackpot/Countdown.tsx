import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  width: 100%;
`

const Time = styled.div`
  font-size: 2.5rem;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
`

const ProgressBar = styled.div`
  width: 100%;
  max-width: 500px;
  height: 10px;
  background: #2c2c54;
  border-radius: 5px;
  margin-top: 6px;
  overflow: hidden;
`

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #f39c12, #f1c40f);
  border-radius: 5px;
  transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
`

interface CountdownProps {
  creationTimestamp: number
  softExpiration: number
  onComplete: () => void
}

export const Countdown: React.FC<CountdownProps> = ({
  creationTimestamp,
  softExpiration,
  onComplete,
}) => {
  // total window
  const totalWindowRef = useRef(Math.max(softExpiration - creationTimestamp, 0))
  // time left until soft
  const [timeLeft, setTimeLeft] = useState(Math.max(softExpiration - Date.now(), 0))

  // reset when timestamps change
  useEffect(() => {
    totalWindowRef.current = Math.max(softExpiration - creationTimestamp, 0)
    setTimeLeft(Math.max(softExpiration - Date.now(), 0))
  }, [creationTimestamp, softExpiration])

  // ticking
  const firedRef = useRef(false)
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        onComplete()
      }
      return
    }
    const id = setInterval(() => {
      const rem = Math.max(softExpiration - Date.now(), 0)
      setTimeLeft(rem)
    }, 500)
    return () => clearInterval(id)
  }, [softExpiration, timeLeft, onComplete])

  // formatting
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const totalSec = Math.ceil(timeLeft / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60

  // progress %
  const pct = totalWindowRef.current > 0
    ? Math.min(100, ((totalWindowRef.current - timeLeft) / totalWindowRef.current) * 100)
    : 0

  return (
    <Wrapper>
      <Time>{`${m}:${pad(s)}`}</Time>
      <ProgressBar>
        <Progress style={{ width: `${pct}%` }} />
      </ProgressBar>
    </Wrapper>
  )
}

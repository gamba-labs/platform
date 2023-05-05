import React, { PropsWithChildren, useRef } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import styled from 'styled-components'
import { StylelessButton } from '../games/Roulette/styles'

export const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  overflow: scroll visible;
  scroll-snap-type: x mandatory;
  transition: height .25s ease;
  &::-webkit-scrollbar {
    height: .4em;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cccccc33;
  }
  & > * {
    scroll-snap-align: start;
  }
`

export function Slider({ children, title }: PropsWithChildren<{title: any}>) {
  const ref = useRef<HTMLDivElement>(null!)
  const scrll = (x: number) => {
    ref.current.scrollBy({ left: 1 * x, behavior: 'smooth' })
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <div style={{ display: 'flex', gap: '20px' }}>
          <StylelessButton style={{ color: 'white' }} onClick={() => scrll(-1)}>
            <FaArrowLeft />
          </StylelessButton>
          <StylelessButton style={{ color: 'white' }} onClick={() => scrll(1)}>
            <FaArrowRight />
          </StylelessButton>
        </div>
      </div>
      <Wrapper ref={ref}>
        {children}
      </Wrapper>
    </>
  )
}

import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'

const StyledCard = styled.div<{width: number, height: number}>`
  color: white;
  position: relative;
  background: #ffffff;
  &:hover {
    & > .background {
      transform: scale(1.1, 1.1)
    }
    & > div:last-child {
      opacity: 1;
    }
  }
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: end;
  ${({ width, height }) => `
    width: ${width}px;
    height: ${height}px;
  `}
  transition: height .25s ease;
  max-height: 100%;
  overflow: hidden;
  flex-grow: 0;
  flex-shrink: 0;
  & > .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform .2s ease;
  }
  & > div {
    &:last-child {
      transition: opacity .2s;
      opacity: 0;
      backdrop-filter: blur(50px);
      padding: 10px;
      text-align: center;
      background: #000000CC;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      transition-delay: .1s;
      user-select: none;
    }
  }
`

interface Props extends PropsWithChildren {
  backgroundImage?: string
  backgroundColor?: string
  width?: number
  height?: number
}

export function Card({ backgroundImage, backgroundColor, children, width = 150, height = 200 }: Props) {
  return (
    <StyledCard width={width} height={height} style={{ backgroundColor }}>
      {backgroundImage && (
        <div
          className="background"
          style={{ backgroundImage: 'url(' + backgroundImage + ')' }}
        />
      )}
      <div className="content">{children}</div>
    </StyledCard>
  )
}

import React from 'react'
import styled from 'styled-components'
import { Icon } from './Icon'

const Container = styled.div`
  position: relative;
  & > button {
    opacity: 0;
  }
  &:hover {
    & > button {
      opacity: .5;
    }
  }
`

const SliderButton = styled.button`
  all: unset;
  position: absolute;
  font-size: 24px;
  left: 0px;
  top: 0;
  box-sizing: border-box;
  z-index: 1;
  height: 100%;
  padding: 5px;
  cursor: pointer;
  background: var(--background-color);
  transition: opacity .2s;
  opacity: .5;
  &:hover {
    opacity: 1!important;
    background: var(--background-color);
  }
`

export const StyledSection = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  transition: width .25s ease, padding .25s ease;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 60px;

  @media (min-width: 600px) {
    padding: 20px;
    width: 1000px;
  }
  @media (min-width: 1280px) {
    padding: 20px;
    width: 1100px;
  }
`

const StyledContent = styled.div`
  display: flex;
  gap: 15px;
  width: 100%;
  overflow: scroll visible;
  scroll-snap-type: x mandatory;
  transition: height .25s ease;

  &::-webkit-scrollbar {
    height: .0em;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cccccc33;
  }

  & > * {
    scroll-snap-align: start;
    flex-grow: 0;
    flex-shrink: 0;
  }
`

export function SlideSection(props: React.PropsWithChildren) {
  const ref = React.useRef<HTMLDivElement>(null!)
  const leftArrow = React.useRef<HTMLButtonElement>(null!)
  const rightArrow = React.useRef<HTMLButtonElement>(null!)

  const scroll = (x: number) => {
    const left = ref.current.clientWidth / 2 * x
    ref.current.scrollBy({ left, behavior: 'smooth' })
  }

  const _scroll = () => {
    const target = ref.current
    leftArrow.current.style.display = target.scrollLeft > 10 ? 'block' : 'none'
    rightArrow.current.style.display = target.scrollLeft + target.clientWidth < target.scrollWidth - 10 ? 'block' : 'none'
  }

  React.useEffect(
    () => _scroll(),
    [],
  )

  return (
    <Container style={{ position: 'relative' }}>
      <SliderButton ref={leftArrow} onClick={() => scroll(-1)}>
        <Icon.ArrowLeft />
      </SliderButton>
      <StyledContent onScroll={_scroll} ref={ref}>
        {props.children}
      </StyledContent>
      <SliderButton ref={rightArrow} style={{ right: '0', left: 'unset' }} onClick={() => scroll(1)}>
        <Icon.ArrowRight />
      </SliderButton>
    </Container>
  )
}

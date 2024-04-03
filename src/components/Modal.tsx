import React from 'react'
import { Icon } from './Icon'
import useOutsideClick from '../hooks/useOnClickOutside'
import styled from 'styled-components'

interface Props extends React.PropsWithChildren {
  onClose?: () => void
}

const Container = styled.div`
  display: flex;
  padding: 20px;
  min-height: calc(100vh - 6rem);
  align-items: center;
  justify-content: center;
`

const Wrapper = styled.div`
  @keyframes wrapper-appear2 {
    0% { transform: scale(.9); }
    100% { transform: scale(1); }
  }

  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 100;
  max-width: min(100%, 460px);
  border-radius: 10px;
  background: #15151f;
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.6);
  flex: 1;
  padding-bottom: 20px;
  animation: wrapper-appear2 .3s;
  color: white;
`

const StyledModal = styled.div`
  @keyframes appear {
    0% { opacity: 0;}
    100% { opacity: 1;}
  }

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: opacity linear 150ms;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow-y: auto;
  height: 100vh;
  animation: appear .3s;

  & h1 {
    text-align: center;
    padding: 40px 0 20px 0;
    font-size: 24px;
  }

  & p {
    padding: 0 30px;
    text-align: center;
  }

  & button.close {
    margin: 0;
    position: absolute;
    cursor: pointer;
    right: 10px;
    top: 10px;
    border: none;
    z-index: 11;
    opacity: .75;
    transition: opacity .2s, background .2s;
    background: transparent;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    &:hover {
      opacity: 1;
      background: #ffffff22;
    }
    & svg {
      color: white;
      vertical-align: middle;
    }
  }
`

export function Modal({ children, onClose }: Props) {
  React.useEffect(
    () => {
      const oldValue = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = oldValue
      }
    },
    [],
  )

  const ref = React.useRef<HTMLDivElement>(null!)

  useOutsideClick(ref, () => onClose && onClose())

  return (
    <StyledModal>
      <Container>
        <Wrapper ref={ref}>
          {onClose && (
            <button className="close" onClick={onClose}>
              <Icon.Close2 />
            </button>
          )}
          {children}
        </Wrapper>
      </Container>
    </StyledModal>
  )
}

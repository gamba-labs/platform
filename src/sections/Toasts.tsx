import React from 'react'
import styled, { css } from 'styled-components'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useToastStore, type Toast as TToast } from '../hooks/useToast'

const StyledToasts = styled.div`
  position: fixed;
  right: 0;
  top: 60px;
  pointer-events: none;
  z-index: 1001;
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  padding: 20px;
  width: 100%;

  @media (min-width: 800px) {
    width: unset;
    top: unset;
    bottom: 0px;
    padding: 40px;
  }
`

const StackedToast = styled.div`
  background: #e8e8e8e3;
  width: 100%;
  border-radius: 10px;
  height: 60px;
  transform: translateY(-60px);
  z-index: -1;
`

const StyledToast = styled.div`
  @property --fade-in {
    syntax: '<percentage>';
    initial-value: 0%;
    inherits: false;
  }
  @keyframes toast-appear {
    0% { opacity: 0; --fade-in: 100%; }
    100% { opacity: 1; --fade-in: 0%; }
  }
  background: #fffffff0;
  color: black;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  pointer-events: auto;
  user-select: none;
  cursor: pointer;
  padding: 10px;

  animation: toast-appear .2s;

  width: 100%;

  filter: drop-shadow(3px 3px 1px #00000033);
  backdrop-filter: blur(50px);

  &:hover {
    background: #ffffffff;
  }

  @media (min-width: 800px) {
    min-width: 250px;
    max-width: 300px;
    transform: translateX(var(--fade-in));
  }
`

const StyledTimer = styled.div<{$ticking: boolean}>`
  @keyframes yesyes {
    0% { width: 100%;}
    100% { width: 0%;}
  }
  width: 100%;
  height: 5px;
  border-radius: 10px;
  background: #cccccc55;
  position: relative;
  overflow: hidden;
  &:after {
    ${(props) => props.$ticking && css`
      animation: yesyes linear 10s;
    `}
    content: " ";
    position: absolute;
    border-radius: 10px;
    left: 0;
    top: 0;
    width: 100%;
    height: 5px;
    background: #9564ff;
  }
`

function Toast({ toast }: {toast: TToast}) {
  const timeout = React.useRef<NodeJS.Timer>()
  const discard = useToastStore((state) => state.discard)
  const [ticking, setTicking] = React.useState(true)

  React.useLayoutEffect(
    () => {
      timeout.current = setTimeout(() => {
        discard(toast.id)
      }, 10000)
      return () => clearTimeout(timeout.current)
    },
    [toast.id],
  )

  const pauseTimer = () => {
    setTicking(false)
    clearTimeout(timeout.current)
  }
  const resumeTimer = () => {
    setTicking(true)
    timeout.current = setTimeout(() => {
      discard(toast.id)
    }, 10000)
  }

  return (
    <StyledToast
      onClick={() => discard(toast.id)}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
    >
      <div>
        <div style={{ fontWeight: 'bold' }}>{toast.title}</div>
        <div style={{ color: 'gray', fontSize: '90%' }}>{toast.description}</div>
      </div>
      <StyledTimer $ticking={ticking} />
    </StyledToast>
  )
}

export default function Toasts() {
  const toasts = useToastStore((state) => [...state.toasts].reverse())
  const showAll = useMediaQuery('sm')

  const visible = showAll ? toasts : toasts.slice(0, 1)

  return (
    <StyledToasts>
      {visible.map((toast, i) => (
        <Toast toast={toast} key={toast.id} />
      ))}
      {!showAll && toasts.length > 1 && (
        <StackedToast />
      )}
    </StyledToasts>
  )
}

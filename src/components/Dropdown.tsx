import React from 'react'
import styled, { css } from 'styled-components'

const Wrapper = styled.div<{$visible: boolean, $anchor: 'top' | 'bottom'}>`
  opacity: 0;
  transition: transform .2s ease, opacity .2s;
  position: absolute;
  visibility: hidden;
  z-index: 1000;
  right: 0;
  color: white;
  min-width: 100%;
  white-space: nowrap;
  ${(props) => props.$visible && css`
    opacity: 1;
    transform: translateY(0px)!important;
    visibility: visible;
  `}
  ${(props) => props.$anchor === 'top' && css`
    top: 100%;
    margin-top: 10px;
    transform: translateY(-10px);
  `}
  ${(props) => props.$anchor === 'bottom' && css`
    bottom: 100%;
    margin-bottom: 10px;
    transform: translateY(10px);
  `}
  & > div {
    display: grid;
    background: #15151f;
    border-radius: 10px;
    overflow: hidden;
    padding: 5px;
    gap: 5px;
  }
`

export function Dropdown({ visible, children, anchor: _anchor }: React.PropsWithChildren<{visible: boolean, anchor?: 'bottom' | 'top'}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  const anchor = React.useMemo(
    () => {
      if (_anchor) return _anchor
      if (!ref.current) return 'bottom'
      return ref.current.getBoundingClientRect().y > window.innerHeight / 2 ? 'bottom' : 'top'
    }
    , [children, visible, _anchor],
  )

  return (
    <Wrapper
      ref={ref}
      $anchor={anchor}
      $visible={visible}
    >
      <div>
        {children}
      </div>
    </Wrapper>
  )
}

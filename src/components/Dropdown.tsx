import React, { MutableRefObject, RefObject, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { create } from 'zustand'

interface PopupStore {
  openId?: string
  open: (id: string) => void
  close: () => void
}

export const usePopupStore = create<PopupStore>((set) => ({
  open: (openId) => set({ openId }),
  close: () => set({ openId: undefined }),
}))

function usePopup() {
  const id = useMemo(() => String(Math.random() * 1e9 | 0), [])
  const active = usePopupStore((state) => state.openId === id)
  const close = usePopupStore((state) => state.close)
  const open = usePopupStore((state) => state.open)
  return { active, close, open: () => open(id) }
}

const StyledWrapper = styled.div`
  position: relative;
  min-width: 100px;
`

const Label = styled.div`
  font-size: 12px;
  text-transform: uppercase;
  color: #ccc;
  display: inline;
  margin-right: 1em;
`

const StyledDropdown = styled.button<{$active?: boolean}>`
  background: var(--bg-light-color);
  border-radius: var(--border-radius);
  color: white;
  border: none;
  margin: 0;
  text-align: left;
  width: 100%;
  height: 40px;
  padding: 10px 20px;
  ${({ $active }) => $active && `
    background: #2e323f;
  `}
  &:hover {
    background: #2e323f;
  }
  &:disabled {
    background: #2e323f;
    color: #CCCCCC;
  }
`

const StyledPopup = styled.div`
  position: absolute;
  bottom: 100%;
  z-index: 10000;
  left: 0;
  border: none;
  max-width: 100%;
  background: var(--bg-light-color);
  color: white;
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  width: 100%;
  padding: 5px;
  &:after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--bg-light-color);
    position: absolute;
    z-index: -1;
    bottom: -10px;
    left: calc(50% - 10px);
  }
`

const StyledOption = styled.button<{$selected?: boolean}>`
  display: block;
  border: none;
  margin: 0;
  width: 100%;
  text-align: left;
  background: none;
  color: white;
  padding: 5px;
  & > div {
    padding: 10px 20px;
    border-radius: var(--border-radius);
  }
  ${({ $selected }) => $selected && `
    & > div {
      background: #1e2029;
    }
  `}
  &:hover {
    & > div {
      background: #2e323f;
    }
  }
`

interface Props<T> {
  label: string
  options: {value: T, label: string}[]
  onChange: (value: T) => void
  value: T
  disabled?: boolean
  format?: (value: T) => string
}

function useOnClickOutside(
  ref: RefObject<HTMLDivElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(
    () => {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (!ref.current || ref.current.contains(event.target)) {
          return
        }
        handler(event)
      }

      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)

      return () => {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    [ref, handler],
  )
}

export function Dropdown<T>({ label, options, onChange, value, disabled, format }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popup = usePopup()
  const hideActive = false

  useOnClickOutside(ref, (e) => {
    if (!buttonRef.current?.contains(e.target)) {
      popup.close()
    }
  })

  const open = () => {
    if (popup.active) {
      popup.close()
    } else {
      popup.open()
    }
  }

  const change = (v: T) => {
    onChange(v)
    popup.close()
  }

  const filteredOptions = useMemo(() => {
    return !hideActive ? options : options.filter((x) => x.value !== value)
  }, [options, value])

  const displayedValue = useMemo(() => format ? format(value) : value, [format, value])

  return (
    <StyledWrapper>
      <StyledDropdown
        ref={buttonRef}
        $active={popup.active}
        disabled={disabled}
        onClick={() => open()}
      >
        <>
          <Label>{label}</Label>
          {displayedValue}
        </>
      </StyledDropdown>
      {popup.active && (
        <StyledPopup ref={ref}>
          {[...filteredOptions].reverse().map((option, i) => (
            <StyledOption
              key={i}
              disabled={disabled}
              onClick={() => change(option.value)}
              $selected={option.value === value}
            >
              <div>
                {format ? format(option.value) : option.label}
              </div>
            </StyledOption>
          ))}
        </StyledPopup>
      )}
    </StyledWrapper>
  )
}

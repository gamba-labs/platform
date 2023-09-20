import styled, { css, keyframes } from 'styled-components'

const appear = keyframes`
  0% { transform: scale(.0) translateY(100px) rotateY(90deg); }
  100% { transform: scale(1) translateY(0) rotateY(0deg) }
`

export const Container = styled.div<{ $disabled?: boolean }>`
  user-select: none;
  background: #9967e300;
  transition: opacity .2s;
  ${({ $disabled }) => $disabled && css`
    pointer-events: none;
    opacity: .7;
  `}
`

export const Options = styled.div`
  display: flex;
  flex-direction: column;
`

export const Option = styled.button<{ selected?: boolean }>`
  background: none;
  border: none;
  margin: 0;
  padding: 0;
  transition: opacity .2s, background .2s ease;
  display: flex;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
  color: white;
  & > div:first-child {
    transition: transform .5s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    font-size: 64px;
    transform: scale(var(--scale));
    filter: drop-shadow(-4px 4px 2px #00000066);
    margin-right: 10px;
  }
  &:hover > div:first-child {
    transform: scale(max(var(--scale), 1.1));
  }
  & > div:last-child {
    ${({ selected }) => selected ? css`
      opacity: 1;
      ` : css`
      opacity: .5;
    `}
  }
  ${({ selected }) => selected ? css`
    --scale: 1;
    --opacity: 1;
    opacity: 1;
  ` : css`
    --scale: .75;
    opacity: .5;
  `}
`

export const Profit = styled.div`
  font-size: 18px;
  color: #005400;
  position: absolute;
  right: 0px;
  bottom: -100px;
  border-radius: 50px;
  background: #69ff6d;
  padding: 5px;
  animation: ${appear} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
`

export const CardPreview = styled.div`
  display: flex;
  border-radius: 5px;
  gap: 5px;
  padding: 5px;
  margin-top: 30px;
  justify-content: center;
  & > div {
    transition: opacity .2s;
  }
`

export const CardsContainer = styled.div`
  transition: transform .2s ease;
  perspective: 500px;
  display: flex;
  position: relative;
  justify-content: flex-end;
  align-items: center;
`

export const CardContainer = styled.div`
  position: absolute;
  bottom: 0;
  transition: transform .25s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity .25s ease;
  filter: drop-shadow(-10px 10px 0px #00000011);
  transform-origin: bottom;
  perspective: 500px;
  & > div {
    animation: ${appear} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }
`

export const Card = styled.div<{$small?: boolean}>`
  ${(props) => props.$small ? css`
    height: 35px;
    font-size: 15px;
    padding: 5px;
    border-radius: 6px;
  ` : css`
    height: 160px;
    font-size: 70px;
    padding: 10px;
    border-radius: 10px;
  `}
  box-shadow: -5px 5px 10px 1px #0000003d;
  background: white;
  aspect-ratio: 4/5.5;
  position: relative;
  color: #333;
  overflow: hidden;
  .rank {
    font-weight: bold;
    line-height: 1em;
  }
  .suit {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50%;
    height: 50%;
    background-size: cover;
    background-repeat: none;
    transform: translate(0%, 0%);
    font-size: 128px;
    opacity: .9;
  }
`

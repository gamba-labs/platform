import React from 'react'
import styled from 'styled-components'
import { getNumberInfo } from './constants'
import { useRoulette } from './store'
import { Loader, numberColorToHex } from './styles'

export const Wrapper = styled.div`
  border-radius: 5px;
  background: #292a307d;
  margin: 0 auto;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  & > div {
    display: flex;
  }
`

export const Result = styled.div<{$color: 'red' | 'black' | 'none'}>`
  color: ${({ $color }) => numberColorToHex($color).text};
  display: flex;
  align-items: ${({ $color }) => $color === 'red' ? 'end' : 'baseline'};
  padding: 10px;
  width: 40px;
  justify-content: center;
  &:first-child {
    height: 62px;
    font-size: 24px;
    align-items: center;
    width: 60px;
    justify-content: center;
    box-shadow: 2px 0px 10px #00000033;
    background: #FFFFFF11;
  }
`

export function Results({ loading }: {loading?: boolean}) {
  const results = useRoulette((state) => state.results)
  const [firstBet] = results
  return (
    <Wrapper>
      <div>
        <Result $color={typeof firstBet === 'number' ? getNumberInfo(firstBet).color : 'none'}>
          <div>
            {loading ? <Loader /> : typeof firstBet === 'number' ? firstBet + 1 : '-'}
          </div>
        </Result>
        {results.slice(loading ? 0 : 1, loading ? 10 : 11).map((x, i) => {
          return (
            <Result $color={getNumberInfo(x).color} key={i}>
              <div>
                {x + 1}
              </div>
            </Result>
          )
        })}
      </div>
    </Wrapper>
  )
}

import {
  GambaUi,
  TokenValue,
  useCurrentPool,
  useGambaPlatformContext,
  useUserBalance,
} from 'gamba-react-ui-v2'
import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { PLATFORM_JACKPOT_FEE } from '../constants'
import TokenSelect from './TokenSelect'
import { UserButton } from './UserButton'
import { useMediaQuery } from '../hooks/useMediaQuery'

const StyledHeader = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 90%;
  max-width: 1400px;
  height: 90px;
  padding: 0 24px;

  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  border-radius: 16px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 600px) {
    width: 95%;
    flex-direction: column;
    height: auto;
    padding: 16px 24px;
  }
`

const Logo = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  text-decoration: none;

  img {
    height: 38px;
    transition: height 0.3s ease;
  }

  @media (max-width: 600px) {
    justify-content: center;
    width: 100%;

    img {
      height: 50px;
      margin: 0 auto;
      display: block;
    }
  }
`

const Bonus = styled.button<{ noBackground?: boolean }>`
  background-color: ${({ noBackground }) => (noBackground ? 'transparent' : '#1f1f1f')};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ noBackground }) => (noBackground ? 'transparent' : '#333')};
  }
`

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 600px) {
    width: 100%;
    justify-content: center;
    margin-top: 12px;
  }
`

const PopupContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 512px;
  height: 512px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  z-index: 2000;
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #ccc;
  }
`

const ClaimButton = styled.button`
  background-color: #333;
  border: none;
  color: white;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 20px;

  &:hover {
    background-color: #555;
  }
`

export default function Header() {
  const pool = useCurrentPool()
  const context = useGambaPlatformContext()
  const balance = useUserBalance()
  const isDesktop = useMediaQuery('lg') // desktop ≥ 1024px

  const [bonusHelp, setBonusHelp] = React.useState(false)
  const [jackpotHelp, setJackpotHelp] = React.useState(false)
  const [showDailyChest, setShowDailyChest] = React.useState(false)

  return (
    <>
      {bonusHelp && (
        <Modal onClose={() => setBonusHelp(false)}>
          <h1>Bonus ✨</h1>
          <p>
            You have <b><TokenValue amount={balance.bonusBalance} /></b> worth of free plays. This bonus will be applied automatically when you play.
          </p>
          <p>Note that a fee is still needed from your wallet for each play.</p>
        </Modal>
      )}

      {jackpotHelp && (
        <Modal onClose={() => setJackpotHelp(false)}>
          <h1>Jackpot 💰</h1>
          <p style={{ fontWeight: 'bold' }}>
            There&apos;s <TokenValue amount={pool.jackpotBalance} /> in the Jackpot.
          </p>
          <p>
            The Jackpot is a prize pool that grows with every bet made. As the Jackpot grows, so does your chance of winning. Once a winner is selected, the value of the Jackpot resets and grows from there until a new winner is selected.
          </p>
          <p>
            You will be paying a maximum of {(PLATFORM_JACKPOT_FEE * 100).toLocaleString(undefined, { maximumFractionDigits: 4 })}% for each wager for a chance to win.
          </p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {context.defaultJackpotFee === 0 ? 'DISABLED' : 'ENABLED'}
            <GambaUi.Switch
              checked={context.defaultJackpotFee > 0}
              onChange={(checked) => context.setDefaultJackpotFee(checked ? PLATFORM_JACKPOT_FEE : 0)}
            />
          </label>
        </Modal>
      )}

      {showDailyChest && (
        <PopupContainer>
          <CloseButton onClick={() => setShowDailyChest(false)}>×</CloseButton>
          <h2>Daily Chest</h2>
          <p>Claim your daily chest to get more chances to win!</p>
          <ClaimButton onClick={() => alert('Claimed Daily Chest!')}>Claim</ClaimButton>
        </PopupContainer>
      )}

      <StyledHeader>
        <Logo to="/">
          <img alt="Gamba logo" src="/logo.svg" />
        </Logo>

        <RightGroup>
          {pool.jackpotBalance > 0 && (
            <Bonus noBackground onClick={() => setJackpotHelp(true)}>
              💰 {isDesktop ? <TokenValue amount={pool.jackpotBalance} /> : pool.jackpotBalance.toFixed(3)}
            </Bonus>
          )}
          {balance.bonusBalance > 0 && (
            <Bonus onClick={() => setBonusHelp(true)}>
              ✨ {isDesktop ? <TokenValue amount={balance.bonusBalance} /> : balance.bonusBalance.toFixed(3)}
            </Bonus>
          )}
          <TokenSelect />
          <UserButton />
        </RightGroup>
      </StyledHeader>
    </>
  )
}

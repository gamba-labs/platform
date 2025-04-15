import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import React from 'react'
import styled from 'styled-components'
import { useUserStore } from '../../hooks/useUserStore'

const Buttons = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  @media (min-width: 800px) {
    height: 100%;
  }

  @media (max-width: 800px) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    padding-top: 0!important;
  }

  & > button {
    border: yes;
    width: 100%;
    border-radius: 10px;
    padding: 10px;
    background: #ffffffdf;
    transition: background-color .2s ease;
    color: black;
    cursor: pointer;
    &:hover {
      background: white;
    }
  }
`

const Welcome = styled.div`
  @keyframes welcome-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes backgroundGradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  background-image: url(https://iili.io/30H7A4s.png;); 
  background-size: cover; 
 background-position: center;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06));

  & img {
    animation-duration: 5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    width: 100px;
    height: 100px;
    top: 0;
    right: 0;
    &:nth-child(1) {animation-delay: 0s;}
    &:nth-child(2) {animation-delay: 1s;}
  }

  & > div {
    padding: 0px;
    filter: drop-shadow(0 4px 3px rgba(0,0,0,.07)) drop-shadow(0 2px 2px rgba(0,0,0,.06));
  }

  @media (min-width: 800px) {
    display: grid;
    grid-template-columns: 2fr 1fr;
    padding: 0;
    & > div {
      padding: 40px;
    }
  }
`

export function WelcomeBanner() {
  const wallet = useWallet()
  const walletModal = useWalletModal()
  const store = useUserStore()
  const copyInvite = () => {
    store.set({ userModal: true })
    if (!wallet.connected) {
      walletModal.setVisible(true)
    }
  }

  return (
    <Welcome>
      <div>
       <center>
        <h1>ㅤㅤㅤㅤGET THOSE SOLANA'S WITH ㅤㅤㅤㅤㅤYOUR BANANAS! 🍌</h1> </center>

         <p>ㅤ
        </p>
      </div>
      <Buttons>
        <button onClick={copyInvite}>
          💸 INVITE
        </button>
          <button onClick={() => window.open('https://discord.gg/banabets', '_blank')}>
          💬 DISCORD
        </button>
        <button onClick={() => window.open('https://x.com/banabets', '_blank')}>
          🚀 TWITTER
        </button>
      </Buttons>
    </Welcome>

  )
}

import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

type Msg = { user: string; text: string; ts: number };

const fetcher = (url: string) => fetch(url).then(r => r.json())

const stringToHslColor = (str: string, s: number, l: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, ${s}%, ${l}%)`
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to   { opacity: 1; transform: translateY(0); }
`

const MessageItem = styled.div<{ $isOwn?: boolean }>`
  line-height:1.6;
  animation:${fadeIn} 0.3s ease-out;
  background: ${({ $isOwn }) => $isOwn ? '#7289da' : '#40444b'};
  border-radius: 8px;
  padding: 12px 16px;
  max-width: 85%;
  color: white;
  margin-bottom: 5px;
  align-self: ${({ $isOwn }) => $isOwn ? 'flex-end' : 'flex-start'};
`

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`

const Username = styled.strong<{ userColor: string }>`
  font-weight:600;
  color:${p => p.userColor};
`

const Timestamp = styled.span`
  font-size:0.85em;
  color: #aaa;
  opacity:1;
  margin-left: auto;
`

// ...rest of the component

{messages.map((m, i) => (
  <MessageItem key={m.ts || i} $isOwn={m.user === userName}>
    <MessageHeader>
      <Username userColor={userColors[m.user]}>
        {m.user.slice(0, 6)}
      </Username>
      <Timestamp>{fmtTime(m.ts)}</Timestamp>
    </MessageHeader>
    <div>{m.text}</div>
  </MessageItem>
))}

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

const Wrapper = styled.div<{ $isMinimized: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 998;
  border-radius: ${({ $isMinimized }) => $isMinimized ? '50%' : '12px'};
  background: ${({ $isMinimized }) => $isMinimized ? '#7289da' : '#2f3136'};
  border: 1px solid ${({ $isMinimized }) => $isMinimized ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'};
  color: #eee;
  font-size: 1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  ${({ $isMinimized }) => !$isMinimized && `backdrop-filter: blur(10px);`}
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: ${({ $isMinimized }) => $isMinimized ? 'pointer' : 'default'};
  transition: width 0.3s, height 0.3s, max-height 0.3s, border-radius 0.3s, background 0.3s;
  ${({ $isMinimized }) => $isMinimized
    ? `
      width: 56px;
      height: 56px;
      max-height: 56px;
      justify-content: center;
      align-items: center;
    `
    : `
      width: 400px;
      max-height: 600px;
      min-height: 200px;
    `}
  @media (max-width:480px) {
    ${({ $isMinimized }) => $isMinimized
      ? `bottom:16px; right:16px;`
      : `width:calc(100% - 32px); max-width:500px; bottom:16px; right:16px;`}
`;

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  opacity: ${({ $isMinimized }) => $isMinimized ? 0 : 1};
  transition: opacity 0.2s;
  pointer-events: ${({ $isMinimized }) => $isMinimized ? 'none' : 'auto'};
`;

const Log = styled.div`
  flex:1;
  overflow-y:auto;
  padding:20px 25px;
  display:flex;
  flex-direction:column;
  gap:1rem;
  min-height:200px;
  background: rgba(47, 49, 54, 0.8);
  border-radius: 10px;
  margin-top: 10px;
  &::-webkit-scrollbar { width:8px; }
  &::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.2); border-radius:3px; }
`;

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
`;

const Username = styled.strong<{ userColor: string }>`
  font-weight:600;
  color:${p => p.userColor};
`;

const Timestamp = styled.span`
  font-size:0.85em;
  color: #aaa;
  opacity:1;
`;

const GuestBadge = styled.span`
  background: #a259ff;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
`;

export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()

  const anonFallback = useMemo(
    () => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'),
    [],
  )
  const userName = connected && publicKey
    ? publicKey.toBase58().slice(0, 6)
    : anonFallback

  const { data: messages = [], error } = useSWR<Msg[]>(
    '/api/chat', fetcher,
    { refreshInterval: 8000, dedupingInterval: 7500 },
  )

  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => {
      if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 75)
    })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
    return map
  }, [messages, userName])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5000
      ? 'sending…'
      : new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Log>
      {!messages.length && !error && <div>Loading messages…</div>}
      {error && <div style={{color: '#ff8080' }}>Error loading chat.</div>}
      {messages.map((m, i) => (
        <MessageItem key={m.ts || i} $isOwn={m.user === userName}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Username userColor={userColors[m.user]}>
                {m.user.slice(0, 6)}
              </Username>
              <GuestBadge>GUEST</GuestBadge>
            </div>
            <Timestamp>{fmtTime(m.ts)}</Timestamp>
          </div>
          <div>{m.text}</div>
        </MessageItem>
      ))}
    </Log>
  )
}

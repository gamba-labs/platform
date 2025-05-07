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

const MinimizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
  </svg>
)

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
  background: ${({ $isMinimized }) => $isMinimized ? '#ffe42d' : 'rgba(28,28,35,0.85)'};
  border: 1px solid ${({ $isMinimized }) => $isMinimized ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'};
  color: #eee;
  font-size: 0.9rem;
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
      color: #fff;
      & > *:not(${ExpandIconWrapper}) { display: none; }
    `
    : `
      width: 340px;
      max-height: 450px;
      min-height: 150px;
    `}
  @media (max-width:480px) {
    ${({ $isMinimized }) => $isMinimized
      ? `bottom:16px; right:16px;`
      : `width:calc(100% - 32px); max-width:340px; bottom:16px; right:16px;`}
`

const EmojiPicker = styled.div`
  display: flex;
  padding: 0 10px;
  gap: 5px;
  align-items: center;
  cursor: pointer;
  & div {
    font-size: 20px;
    padding: 5px;
  }
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  opacity: ${({ $isMinimized }) => $isMinimized ? 0 : 1};
  transition: opacity 0.2s;
  pointer-events: ${({ $isMinimized }) => $isMinimized ? 'none' : 'auto'};
`

const InputRow = styled.div`
  display:flex;
  border-top:1px solid rgba(255,255,255,0.08);
  background:rgba(0,0,0,0.1);
  flex-shrink:0;
`

const TextInput = styled.input`
  flex:1;
  background:transparent;
  border:none;
  padding:12px 15px;
  color:#eee;
  outline:none;
  font-size:0.9rem;
  &::placeholder { color:#777; opacity:0.8; }
`

const SendBtn = styled.button`
  background:#ffe42d;
  border:none;
  padding:0 18px;
  cursor:pointer;
  font-weight:600;
  color:#fff;
  font-size:0.9rem;
  &:hover:not(:disabled) { background:#ffe42d; }
  &:active:not(:disabled) { background:#ffe416; transform:scale(0.98); }
  &:disabled { opacity:0.5; cursor:not-allowed; }
`

export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()
  const [isMinimized, setIsMinimized] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userName = connected && publicKey
    ? publicKey.toBase58().slice(0, 6)
    : 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0')

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden)
    ? null : '/api/chat'
  const { data: messages = [], error, mutate } = useSWR<Msg[]>(
    swrKey, fetcher,
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

  const send = async () => {
    if (!connected) return walletModal.setVisible(true)
    const txt = text.trim()
    if (!txt || isSending || cooldown > 0) return
    setIsSending(true)
    const id = Date.now()
    mutate([...messages, { user: userName, text: txt, ts: id }], false)
    setText('')
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userName, text: txt }),
      })
      mutate()
      setCooldown(5)
    } catch (e) {
      console.error(e)
      mutate()
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const addEmoji = (emoji: string) => {
    setText(prevText => prevText + emoji)
  }

  const fmtTime = (ts: number) =>
    ts > Date.now() - 5000
      ? 'sending…'
      : new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const toggleMinimize = () => setIsMinimized(v => !v)

  return (
    <Wrapper $isMinimized={isMinimized}>
      {isMinimized && (
        <ExpandIconWrapper onClick={toggleMinimize}>
          <ChatIcon />
        </ExpandIconWrapper>
      )}
      <ContentContainer $isMinimized={isMinimized}>
        <Header onClick={toggleMinimize}>
          <HeaderTitle>Troll Box 🍌</HeaderTitle>
          <HeaderStatus>
            {messages.length ? `${messages.length} msgs` : 'Connecting…'}
          </HeaderStatus>
          <MinimizeButton><MinimizeIcon /></MinimizeButton>
        </Header>
        <Log ref={logRef}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{ color: '#ff8080' }}>Error loading chat.</LoadingText>}
          {messages.map((m, i) => (
            <MessageItem key={m.ts || i}>
              <Username userColor={userColors[m.user]}>
                {m.user.slice(0, 6)}
              </Username>
              : {m.text}
              <Timestamp>{fmtTime(m.ts)}</Timestamp>
            </MessageItem>
          ))}
        </Log>
        <InputRow>
          <TextInput
            ref={inputRef}
            value={text}
            placeholder={connected ? 'Say something…' : 'Connect wallet to chat'}
            onChange={e => setText(e.target.value)}
            onClick={() => !connected && walletModal.setVisible(true)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }}}
            disabled={isSending || !swrKey}
            maxLength={200}
          />
          <EmojiPicker>
            {['😀', '😁', '😂', '😃', '😄', '😅', '😆'].map(emoji => (
              <div key={emoji} onClick={() => addEmoji(emoji)}>{emoji}</div>
            ))}
          </EmojiPicker>
          <SendBtn
            onClick={send}
            disabled={!connected || isSending || cooldown > 0 || !text.trim() || !swrKey}
          >
            {isSending ? '…'
              : cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
          </SendBtn>
        </InputRow>
      </ContentContainer>
    </Wrapper>
  )
}

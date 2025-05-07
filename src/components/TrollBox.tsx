import React, { useState, useRef, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

type Msg = { user: string; text: string; ts: number; reactions?: Record<string, number> };

const fetcher = (url: string) => fetch(url).then(r => r.json())

const stringToHslColor = (str: string, s: number, l: number): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return `hsl(${hash % 360}, ${s}%, ${l}%)`
}

// Reactions Icons
const LikeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

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
      color: #fff;
      & > *:not(${ExpandIconWrapper}) { display: none; }
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

const Header = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #202225;
  color: #fff;
  cursor: pointer;
`

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

const Username = styled.strong<{ userColor: string }>`
  font-weight:600;
  color:${p => p.userColor};
  margin-right:0.5em;
`

const InputRow = styled.div`
  display:flex;
  border-top:1px solid rgba(255,255,255,0.08);
  background:#202225;
  flex-shrink:0;
  align-items: center;
  padding: 10px 15px;
`

const TextInput = styled.input`
  flex:1;
  background:#40444b;
  border:none;
  padding:15px 20px;
  color:#fff;
  outline:none;
  font-size:1.1rem;
  border-radius: 10px;
  &::placeholder { color:#777; opacity:0.8; }
`

const SendBtn = styled.button`
  background:none;
  border:none;
  padding:0 20px;
  cursor:pointer;
  font-weight:600;
  color:#fff;
  font-size:1.1rem;
  &:hover:not(:disabled) { background:rgba(255,255,255,0.1); }
  &:active:not(:disabled) { background:rgba(255,255,255,0.2); transform:scale(0.98); }
  &:disabled { opacity:0.5; cursor:not-allowed; }
`

// Add Reaction logic
const ReactionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
`

const ReactionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #a0a0a0;
  padding: 5px;
  margin-right: 10px;
  &:hover {
    color: #fff;
  }
`

export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()
  const [isMinimized, setIsMinimized] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const anonFallback = useMemo(
    () => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'),
    [],
  )
  const userName = connected && publicKey
    ? publicKey.toBase58().slice(0, 6)
    : anonFallback

  const swrKey = isMinimized || (typeof document !== 'undefined' && document.hidden)
    ? null : '/api/chat'
  const { data: messages = [], error, mutate } = useSWR<Msg[]>(
    swrKey, fetcher,
    { refreshInterval: 8000, dedupingInterval: 7500 },
  )

  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => {
      if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 75)
    })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
    return map
  }, [messages, userName])

  // Handle reaction click
  const handleReaction = (messageId: number, reaction: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.ts === messageId) {
        const newReactions = { ...msg.reactions };
        newReactions[reaction] = (newReactions[reaction] || 0) + 1;
        return { ...msg, reactions: newReactions };
      }
      return msg;
    });
    mutate(updatedMessages, false);
  };

  async function send() {
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

  const fmtTime = (ts:number) =>
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
          <HeaderTitle>
            #banabets-chat
          </HeaderTitle>
          <MinimizeButton><MinimizeIcon /></MinimizeButton>
        </Header>
        <Log ref={logRef}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{ color: '#ff8080' }}>Error loading chat.</LoadingText>}
          {messages.map((m, i) => (
            <MessageItem key={m.ts || i} $isOwn={m.user === userName}>
              <Username userColor={userColors[m.user]}>
                {m.user.slice(0, 6)}
              </Username>
              : {m.text}
              <Timestamp>{fmtTime(m.ts)}</Timestamp>
              <ReactionContainer>
                <ReactionButton onClick={() => handleReaction(m.ts, 'like')}>
                  <LikeIcon />
                  {m.reactions?.like || 0}
                </ReactionButton>
              </ReactionContainer>
            </MessageItem>
          ))}
        </Log>
        <InputRow>
          <TextInput
            ref={inputRef}
            value={text}
            placeholder={connected ? 'Say something…' : 'Connect wallet to chat'}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            disabled={isSending || !swrKey}
            maxLength={200}
          />
          <SendBtn
            onClick={send}
            disabled={!connected || isSending || cooldown > 0 || !text.trim() || !swrKey}
          >
            {isSending ? '…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Send'}
          </SendBtn>
        </InputRow>
      </ContentContainer>
    </Wrapper>
  );
}

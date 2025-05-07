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
  /* Estilos previos */
`

const ContentContainer = styled.div<{ $isMinimized: boolean }>`
  /* Estilos previos */
`

const Header = styled.div`
  /* Estilos previos */
`

const HeaderTitle = styled.span`
  /* Estilos previos */
`

const OnlineStatus = styled.div`
  /* Estilos previos */
`

const HeaderStatus = styled.span`
  /* Estilos previos */
`

const MinimizeButton = styled.button`
  /* Estilos previos */
`

const ExpandIconWrapper = styled.div`
  /* Estilos previos */
`

const Log = styled.div`
  /* Estilos previos */
`

const MessageItem = styled.div<{ $isOwn?: boolean }>`
  /* Estilos previos */
`

const Username = styled.strong<{ userColor: string }>`
  font-weight:600;
  color:${p => p.userColor};
  margin-right:0.5em;
`

// Agregar el estilo para el nivel dorado
const UserLevel = styled.span`
  font-size: 0.85rem; /* Tamaño pequeño */
  color: gold; /* Color dorado */
  margin-left: 5px;
`

const Timestamp = styled.span`
  font-size:0.85em;
  color:white;
  opacity:1;
  margin-left:0.5em;
`

const InputRow = styled.div`
  /* Estilos previos */
`

const TextInput = styled.input`
  /* Estilos previos */
`

const SendBtn = styled.button`
  /* Estilos previos */
`

const LoadingText = styled.div`
  /* Estilos previos */
`

export default function TrollBox() {
  const { publicKey, connected } = useWallet()
  const walletModal = useWalletModal()
  const [isMinimized, setIsMinimized] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [userLevel, setUserLevel] = useState(0) // Estado para el nivel del usuario

  // derive username
  const anonFallback = useMemo(
    () => 'anon' + Math.floor(Math.random() * 1e4).toString().padStart(4, '0'),
    [],
  )
  const userName = connected && publicKey
    ? publicKey.toBase58().slice(0, 6)
    : anonFallback

  // SWR setup
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

  // color map
  const userColors = useMemo(() => {
    const map: Record<string, string> = {}
    messages.forEach(m => {
      if (!map[m.user]) map[m.user] = stringToHslColor(m.user, 70, 75)
    })
    if (!map[userName]) map[userName] = stringToHslColor(userName, 70, 75)
    return map
  }, [messages, userName])

  // send with optimistic UI + cooldown
  async function send() {
    if (!connected) return walletModal.setVisible(true)
    const txt = text.trim()
    if (!txt || isSending || cooldown > 0) return
    setIsSending(true)
    const id = Date.now()
    mutate([...messages, { user: userName, text: txt, ts: id }], false)
    setText('')
    setUserLevel(prevLevel => prevLevel + 1) // Incrementar el nivel al enviar un mensaje
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

  // scroll to bottom on every message load
  useEffect(() => {
    if (!isMinimized && logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isMinimized])

  // cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const fmtTime = (ts:number) =>
    ts > Date.now() - 5000
      ? 'sending…'
      : new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const toggleMinimize = () => setIsMinimized(v => !v)

  const onlineUsers = useMemo(() => {
    const uniqueUsers = new Set(messages.map(m => m.user));
    return uniqueUsers.size;
  }, [messages]);

  return (
    <Wrapper $isMinimized={isMinimized}>
      {isMinimized && (
        <ExpandIconWrapper onClick={toggleMinimize}>
          <ChatIcon/>
        </ExpandIconWrapper>
      )}
      <ContentContainer $isMinimized={isMinimized}>
        <Header onClick={toggleMinimize}>
          <HeaderTitle>
            #banabets-chat
            <OnlineStatus />
          </HeaderTitle>
          <HeaderStatus>
            {messages.length ? `${messages.length} msgs` : 'Connecting…'}
          </HeaderStatus>
          <MinimizeButton><MinimizeIcon/></MinimizeButton>
        </Header>
        <Log ref={logRef}>
          {!messages.length && !error && <LoadingText>Loading messages…</LoadingText>}
          {error && <LoadingText style={{color: '#ff8080' }}>Error loading chat.</LoadingText>}
          {messages.map((m, i) => (
            <MessageItem key={m.ts || i} $isOwn={m.user === userName}>
              <Username userColor={userColors[m.user]}>
                {m.user.slice(0, 6)}
              </Username>
              <UserLevel>{userLevel}</UserLevel> {/* Mostrar el nivel */}
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
            onChange={ e => setText(e.target.value)}
            onClick={ () => !connected && walletModal.setVisible(true)}
            onKeyDown={ e =>{ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }}}
            disabled={isSending || !swrKey}
            maxLength={200}
          />
          <SendBtn
            onClick={send}
            disabled={!connected || isSending || cooldown > 0 || !text.trim() || !swrKey}
          >
            { isSending ? '…'
              : cooldown > 0 ? `Wait ${cooldown}s` : 'Send' }
          </SendBtn>
        </InputRow>
      </ContentContainer>
    </Wrapper>
  )
}

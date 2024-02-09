import { GambaTransaction } from 'gamba-core-v2'
import { GambaUi, TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import html2canvas from 'html2canvas'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex } from '../../components'
import { Modal } from '../../components/Modal'
import { PLATFORM_SHARABLE_URL } from '../../constants'
import { useToast } from '../../hooks/useToast'
import { extractMetadata } from '../../utils'

// const saveBlob = (function() {
//   const a = document.createElement('a')
//   document.body.appendChild(a)
//   a.setAttribute('style', 'display: none')

//   return function(blob: Blob, fileName: string) {
//     const url = window.URL.createObjectURL(blob)
//     a.href = url
//     a.download = fileName
//     a.click()
//     window.URL.revokeObjectURL(url)
//   }
// })()

const canvasToClipboard = async (canvas: HTMLCanvasElement) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return reject()
        }
        if (blob) {
          // saveBlob(blob, 'play.png')
          // resolve(true)
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(resolve)
            .catch(reject)
        }
      },
    )
  })
}

export function ShareModal({ event, onClose }: {event: GambaTransaction<'GameSettled'>, onClose: () => void}) {
  const navigate = useNavigate()
  const { game } = extractMetadata(event)
  const gotoGame = () => {
    navigate('/' + game?.id)
    onClose()
  }
  const tokenMeta = useTokenMeta(event.data.tokenMint)
  const ref = React.useRef<HTMLDivElement>(null!)

  const toast = useToast()

  const profit = event.data.payout.sub(event.data.wager).toNumber()
  const percentChange = profit / event.data.wager.toNumber()
  const [copying, setCopying] = React.useState(false)

  const copyImage = async () => {
    try {
      setCopying(true)
      const canvas = await html2canvas(ref.current, { removeContainer: true, backgroundColor: '#000' })
      await canvasToClipboard(canvas)
      toast({
        title: '📋 Copied image to clipboard',
        description: 'You can paste it in Twitter or Telegram etc.',
      })
    } finally {
      setCopying(false)
    }
  }

  return (
    <Modal onClose={() => onClose()}>
      <div style={{ display: 'grid', gap: '10px', padding: '20px', paddingBottom: '0', width: '100%' }}>
        <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <div ref={ref} style={{ background: '#121217' }}>
            <div style={{ display: 'grid', gap: '5px', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', padding: '10px' }}>
              <img src={tokenMeta.image} style={{ borderRadius: '50%', height: '40px' }} />
              <div style={{ fontSize: '20px', color: percentChange >= 0 ? '#9bffad' : '#ff4f4f', padding: '10px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  {profit >= 0 ? '+' : '-'}
                  <TokenValue exact amount={Math.abs(profit)} mint={event.data.tokenMint} />
                </div>
                {profit >= 0 && (
                  <div style={{ fontSize: 14 }}>
                    {profit >= 0 ? '+' : '-'}{(Math.abs(percentChange) * 100).toFixed(2)}%
                  </div>
                )}
              </div>
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <img src={game?.meta?.image} width="100px" />
              </div>
            </div>
            <div style={{ background: '#00000033', color: '#ffffff99', fontStyle: 'italic', display: 'flex', alignContent: 'center', gap: '10px', padding: '10px' }}>
              <img src="/gamba.svg" height="20px" />
              <div>play on {PLATFORM_SHARABLE_URL}</div>
            </div>
          </div>
        </div>
        <Flex>
          <GambaUi.Button size="small" onClick={gotoGame}>
            Play {game?.meta?.name}
          </GambaUi.Button>
          <GambaUi.Button size="small" disabled={copying} onClick={copyImage}>
            Share
          </GambaUi.Button>
          <GambaUi.Button size="small" onClick={() => window.open(`https://v2.gamba.so/tx/${event.signature}`, '_blank')}>
            Verify
          </GambaUi.Button>
        </Flex>
      </div>
    </Modal>
  )
}

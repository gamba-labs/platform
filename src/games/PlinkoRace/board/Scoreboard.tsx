// src/components/Scoreboard.tsx
import React from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
} from 'framer-motion';
import { PlayerInfo } from '../engine/types';

interface Props {
  roster       : PlayerInfo[];
  scores       : number[];
  mults        : number[];
  targetPoints : number;
  final?       : boolean;         // game finished?
  payouts?     : number[];        // lamports won
  metadata?    : Record<string,string>; // optional on-chain names
}

const LAMPORTS_PER_SOL = 1e9;

export default function Scoreboard({
  roster,
  scores,
  mults,
  targetPoints,
  final   = false,
  payouts = [],
  metadata = {},
}: Props) {
  // build & sort rows by score desc
  const rows = roster
    .map((p, i) => ({
      p,
      s: scores[i]  ?? 0,
      m: mults[i]   ?? 1,
      w: payouts[i] ?? 0,
      name: metadata[p.id] ?? '',    // look up metadata
    }))
    .sort((a, b) => b.s - a.s);

  return (
    <LayoutGroup>
      <motion.div
        layoutId="scoreboard-container"
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={{
          position   : 'absolute',
          top        : final ? undefined : 10,
          left       : final ? undefined : 10,
          inset      : final ? 0 : undefined,
          margin     : final ? 'auto' : undefined,
          width      : final ? 360 : 'auto',
          maxWidth   : final ? '90%' : undefined,
          maxHeight  : final ? '80%' : undefined,
          overflowY  : final ? 'auto' : undefined,
          background : 'rgba(0,0,0,0.75)',
          padding    : final ? '16px 24px' : '8px 12px',
          borderRadius: 12,
          color      : '#fff',
          fontSize   : final ? 18 : 14,
          boxShadow  : '0 4px 10px rgba(0,0,0,0.5)',
          zIndex     : 400,
        }}
      >
        {/* Target/Goal indicator – minimal text */}
        <div style={{ marginBottom: final ? 12 : 8, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, letterSpacing: 0.3 }}>
            Race to {targetPoints}
          </div>

          {/* Leader progress bar */}
          {(() => {
            const leader = rows[0]?.s ?? 0
            const pct    = Math.max(0, Math.min(1, leader / targetPoints)) * 100
            return (
              <div style={{
                marginTop: 6,
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: final ? 280 : 220,
                height: final ? 8 : 6,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height:'100%',
                  background: '#22c55e',
                  boxShadow: '0 0 8px rgba(34,197,94,0.35)'
                }}/>
              </div>
            )
          })()}
        </div>

        {final && (
          <motion.div
            layout="position"
            style={{
              display            : 'grid',
              gridTemplateColumns: '40px 1fr 60px 100px',
              gap                : 12,
              fontSize           : 16,
              fontWeight         : 600,
              marginBottom       : 12,
              textTransform      : 'uppercase',
              opacity            : 0.8,
            }}
          >
            <div>#</div>
            <div>Player</div>
            <div style={{ textAlign: 'right' }}>Score</div>
            <div style={{ textAlign: 'right' }}>Payout</div>
          </motion.div>
        )}

        <AnimatePresence>
          {rows.map(({ p, name, s, m, w }, idx) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit   ={{ opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{
                display      : 'flex',
                alignItems   : 'center',
                marginBottom : final ? 8 : 6,
                fontSize     : final ? 18 : 14,
              }}
            >
              {/* colour chip */}
              <div style={{
                width       : final ? 14 : 12,
                height      : final ? 14 : 12,
                background  : p.color,
                borderRadius: 4,
              }}/>

              {/* index (only in final) */}
              {final && (
                <div style={{
                  width      : 26,
                  textAlign  : 'center',
                  marginLeft : 8,
                }}>
                  {idx + 1}
                </div>
              )}

              {/* name or truncated address */}
              <div style={{
                marginLeft    : 8,
                marginRight   : 8,
                flex          : 1,
                overflow      : 'hidden',
                textOverflow  : 'ellipsis',
                whiteSpace    : 'nowrap',
              }}>
                {name || `${p.id.slice(0,4)}…`}
              </div>

              {/* multiplier only in compact mode */}
              {!final && m > 1 && (
                <motion.div
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit   ={{ scale: 0.8, opacity: 0 }}
                  style={{
                    marginRight : 8,
                    marginLeft : 10,
                    padding     : '2px 6px',
                    background  : '#222',
                    borderRadius: 4,
                    fontFamily  : 'monospace',
                    color       : p.color,
                    fontSize    : 12,
                  }}
                >
                  ×{m}
                </motion.div>
              )}

              {/* score */}
              <div style={{
                width       : final ? 60 : 15,
                textAlign   : 'right',
                fontFamily  : 'monospace',
              }}>
                {Number.isInteger(s)
                  ? s.toString().padStart(targetPoints.toString().length,' ')
                  : s.toFixed(1)}
              </div>

              {/* payout (only final) */}
              {final && (
                <motion.div
                  layout
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 100, opacity: 1 }}
                  exit   ={{ width: 0, opacity: 0 }}
                  style={{
                    marginLeft : 24,    // extra room
                    textAlign  : 'right',
                    fontFamily : 'monospace',
                    color      : w ? '#ffd700' : '#888',
                    overflow   : 'hidden',
                  }}
                >
                  {(w / LAMPORTS_PER_SOL).toFixed(2)} SOL
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

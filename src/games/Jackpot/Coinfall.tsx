import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import * as Matter from 'matter-js';
import { IdlAccounts, web3 } from '@coral-xyz/anchor';
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk';
import { useSound } from 'gamba-react-ui-v2';
import joinSnd from './sounds/join.mp3';

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
`;

type Player = IdlAccounts<Multiplayer>['game']['players'][number];

interface CoinfallsProps {
  players: Player[];
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const getRadiusForWager = (wagerLamports: number) => {
  const minWager = 0.01 * web3.LAMPORTS_PER_SOL;
  const maxWager = 5    * web3.LAMPORTS_PER_SOL;
  const minRadius = 10;
  const maxRadius = 100; 

  if (wagerLamports <= minWager) return minRadius;
  if (wagerLamports >= maxWager) return maxRadius;

  const pct = (wagerLamports - minWager) / (maxWager - minWager);
  return minRadius + pct * (maxRadius - minRadius);
};

export function Coinfalls({ players }: CoinfallsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef    = useRef<Matter.Engine>();
  const prevPlayers  = usePrevious(players) ?? [];
  const { play: playJoin, sounds } = useSound({ join: joinSnd });

  // SETUP: engine, renderer, ground, background-spawner
  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { y: 0.6 },
      enableSleeping: true,
    });
    engineRef.current = engine;

    const container = containerRef.current;
    if (!container) return;

    // renderer
    const render = Matter.Render.create({
      element: container,
      engine,
      options: {
        width:  container.clientWidth,
        height: container.clientHeight,
        wireframes: false,
        background: 'transparent',
      },
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    // ground (invisible)
    const width     = container.clientWidth;
    const height    = container.clientHeight;
    const thickness = 100;
    const ground = Matter.Bodies.rectangle(
      width/2, height + thickness/2,
      width*2, thickness,
      { isStatic: true, render: { visible: false } }
    );
    Matter.World.add(engine.world, ground);

    // tint everything gold + semi-transparent
    Matter.Events.on(engine, 'afterUpdate', () => {
      engine.world.bodies.forEach(body => {
        if (!body.isStatic) {
          body.render.fillStyle = '#FFD700';
          body.render.opacity   = 0.4;
        }
      });
    });

    // handle window resize
    const handleResize = () => {
      if (!container || !render.canvas) return;
      render.canvas.width  = container.clientWidth;
      render.canvas.height = container.clientHeight;
      Matter.Body.setPosition(ground, {
        x: container.clientWidth/2,
        y: container.clientHeight + thickness/2,
      });
    };
    window.addEventListener('resize', handleResize);

    // BACKGROUND SPAWNER: tiny non‑colliding coins
    const bgInterval = setInterval(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const x = Math.random() * w;
      const r = 6 + Math.random() * 4; // 6–10 px

      const smallCoin = Matter.Bodies.circle(x, -40, r, {
        isSensor: true,            // no collision physics
        collisionFilter: { mask: 0 },
        render: { fillStyle: '#FFD700', opacity: 0.15 },
        restitution: 0.2,
        friction:    0.02,
      });

      Matter.World.add(engine.world, smallCoin);

      // cleanup after it falls past view
      setTimeout(() => {
        Matter.World.remove(engine.world, smallCoin);
      }, 5000);
    }, 4000);

    // teardown
    return () => {
      clearInterval(bgInterval);
      window.removeEventListener('resize', handleResize);
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }
    };
  }, []); // run once

  // PLAYER SPAWNER: when new players appear
  useEffect(() => {
    const engine = engineRef.current;
    const container = containerRef.current;
    if (!engine || !container) return;

    if (players.length > prevPlayers.length) {
      const prevKeys = new Set(prevPlayers.map(p => p.user.toBase58()));
      const newPlayers = players.filter(p => !prevKeys.has(p.user.toBase58()));

      newPlayers.forEach(player => {
        const w = container.clientWidth;
        const r = getRadiusForWager(player.wager.toNumber());
        const x = w * 0.2 + Math.random() * (w * 0.6);

        const coin = Matter.Bodies.circle(x, -30, r, {
          restitution: 0.5,
          friction:    0.1,
          render:      { fillStyle: '#FFD700' },
        });
        Matter.World.add(engine.world, coin);

        // play join sound per new player (gated by readiness)
        if (sounds.join?.ready) playJoin('join');
      });
    }
  }, [players, prevPlayers]);

  return <Container ref={containerRef} />;
}

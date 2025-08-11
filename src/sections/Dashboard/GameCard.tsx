// src/components/GameCard.tsx
import React from 'react';
import { GameBundle } from 'gamba-react-ui-v2';
import { NavLink, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const tileAnimation = keyframes`
  0%   { background-position: -100px 100px; }
  100% { background-position: 100px -100px; }
`;

const StyledGameCard = styled(NavLink)<{ $small: boolean; $background: string }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  pointer-events: auto; /* if you need clicks */

  width: 100%;
  aspect-ratio: ${({ $small }) => ($small ? '1/.5' : '1/.6')};
  background: ${({ $background }) => $background};
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 24px;
  transition: transform 0.2s ease;

  & > .background,
  & > .image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.2s ease, opacity 0.3s ease;
  }

  & > .background {
    background-image: url(/stuff.png);
    background-size: 100%;
    background-repeat: repeat;
    animation: ${tileAnimation} 5s linear infinite;
    opacity: 0;
  }

  & > .image {
    background-size: 90% auto;
    background-position: center;
    background-repeat: no-repeat;
    transform: scale(0.9);
  }

  & > .play {
    position: absolute;
    bottom: 5px;
    right: 5px;
    padding: 5px 10px;
    font-size: 14px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    text-transform: uppercase;
    opacity: 0;
    backdrop-filter: blur(20px);
    transition: opacity 0.2s ease;
  }

  &:hover {
    transform: scale(1.01);
    outline: 5px solid rgba(149, 100, 255, 0.2);
    outline-offset: 0;

    & > .background {
      opacity: 0.35;
    }
    & > .image {
      transform: scale(1);
    }
    & > .play {
      opacity: 1;
    }
  }
`;

// New badge for the “VS” tag (or any other tag you choose)
const Tag = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  text-transform: uppercase;
  z-index: 2;
`;

export function GameCard({
  game,
}: {
  game: GameBundle & { meta: { tag?: string; [key: string]: any } };
}) {
  const small = useLocation().pathname !== '/';

  return (
    <StyledGameCard
      to={`/${game.id}`}
      $small={small}
      $background={game.meta.background}
    >
      {/* render the VS badge if present */}
      {game.meta.tag && <Tag>{game.meta.tag}</Tag>}

      <div className="background" />
      <div
        className="image"
        style={{ backgroundImage: `url(${game.meta.image})` }}
      />
      <div className="play">Play {game.meta.name}</div>
    </StyledGameCard>
  );
}

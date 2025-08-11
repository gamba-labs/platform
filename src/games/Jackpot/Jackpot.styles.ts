import styled from 'styled-components'
import { motion } from 'framer-motion'

export const ScreenLayout = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

export const PageLayout = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto;
  grid-template-areas: "topplayers game recentgames";
  gap: 15px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-areas: "game";
  }
`

export const GameContainer = styled.div`
  grid-area: game;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;      /* header sticks to top */
  padding: 20px;
  background: #1a1a2e;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  z-index: 1;
  width: 100%;
  height: 420px;
`

export const TopPlayersSidebar = styled.div`
  grid-area: topplayers;
`

export const RecentGamesSidebar = styled.div`
  grid-area: recentgames;
`

export const RecentPlayersContainer = styled.div`
  width: 100%;
`

export const TopPlayersOverlay = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  max-width: 180px;
`

export const MainContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;                           /* this plus CenterBlock layout will animate */
`

/* now uses motion.div so layout shifts get smoothed */
export const CenterBlock = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const Loading = styled.div`
  font-size: 1.2rem;
  color: #e0e0e0;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`

export const Title = styled.h2`
  font-size: 1.5rem;
  color: #fff;
  margin: 0;
`

export const Badge = styled.span<{
  status: 'waiting' | 'live' | 'settled';
}>`
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  background: ${({ status }) =>
    status === 'waiting'
      ? '#f39c12'
      : status === 'live'
      ? '#2ecc71'
      : '#3498db'};
  color: #fff;
  font-weight: bold;
`

export const TestButton = styled.button`
  background: #f39c12;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 10px;
  align-self: center;

  &:hover {
    background: #e67e22;
  }
`

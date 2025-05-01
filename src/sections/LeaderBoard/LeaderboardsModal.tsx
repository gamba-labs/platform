import React, { useState } from 'react'
import { Modal } from '../../components/Modal'
import {
  useLeaderboardData,
  Period,
  Player,           
} from '../../hooks/useLeaderboardData' 

import {
  ModalContent,
  HeaderSection,
  Title,
  Subtitle,
  TabRow,
  TabButton,
  LeaderboardList,
  ListHeader,
  HeaderRank,
  HeaderPlayer,
  HeaderVolume,
  RankItem,
  RankNumber,
  PlayerInfo,
  VolumeAmount,
  formatVolume,
  LoadingText,
  ErrorText,
  EmptyStateText,
} from './LeaderboardsModal.styles'

interface LeaderboardsModalProps {
  onClose: () => void
  creator: string
}

const LeaderboardsModal: React.FC<LeaderboardsModalProps> = ({
  onClose,
  creator,
}) => {
  const [period, setPeriod] = useState<Period>('weekly') // default

  const {
    data: leaderboard,
    loading,
    error,
  } = useLeaderboardData(period, creator)

  return (
    <Modal onClose={onClose}>
      <ModalContent>
        {/* ────── header ────── */}
        <HeaderSection>
          <Title>Leaderboard</Title>
          <Subtitle>
            Top players by volume{' '}
            {period === 'weekly' ? 'this week' : 'this month'} (USD)
          </Subtitle>
        </HeaderSection>

        {/* ────── tabs ────── */}
        <TabRow>
          <TabButton
            $selected={period === 'weekly'}
            onClick={() => setPeriod('weekly')}
            disabled={loading}
          >
            Weekly
          </TabButton>

          <TabButton
            $selected={period === 'monthly'}
            onClick={() => setPeriod('monthly')}
            disabled={loading}
          >
            Monthly
          </TabButton>
        </TabRow>

        {loading ? (
          <LoadingText>Loading...</LoadingText>
        ) : error ? (
          <ErrorText>{error}</ErrorText>
        ) : leaderboard && leaderboard.length > 0 ? (
          <LeaderboardList>
            <ListHeader>
              <HeaderRank>Rank</HeaderRank>
              <HeaderPlayer>Player</HeaderPlayer>
              <HeaderVolume>Volume&nbsp;(USD)</HeaderVolume>
            </ListHeader>

            {leaderboard.map((entry: Player, index) => {
              const rank = index + 1
              return (
                <RankItem key={entry.user} $isTop3={rank <= 3}>
                  <RankNumber rank={rank}>{rank > 3 ? rank : ''}</RankNumber>
                  <PlayerInfo title={entry.user}>{entry.user}</PlayerInfo>
                  <VolumeAmount>{formatVolume(entry.usd_volume)}</VolumeAmount>
                </RankItem>
              )
            })}
          </LeaderboardList>
        ) : (
          <EmptyStateText>No leaderboard data for this period.</EmptyStateText>
        )}
      </ModalContent>
    </Modal>
  )
}

export default LeaderboardsModal

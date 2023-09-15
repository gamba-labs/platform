import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Card } from './components/Card'
import { Header } from './components/Header'
import { SlideSection } from './components/Section'
import { GAMES } from './games'
import { ErrorHandlers } from './ui/ErrorHandlers'
import { Game } from './ui/Game'
import { Home } from './ui/Home'
import { RecentPlays } from './ui/RecentPlays'
import { UserButton } from './ui/UserButton'

export function App() {
  const location = useLocation()

  React.useEffect(() =>
    document.body.scrollTo({
      top: 0,
      left: 0,
    })
  , [location.key])

  return (
    <>
      <ErrorHandlers />

      <Header>
        <UserButton />
      </Header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:shortName" element={<Game />} />
      </Routes>

      <SlideSection title="Demo Games">
        {GAMES.map((game) => (
          <Card key={game.short_name} game={game} />
        ))}
      </SlideSection>

      <RecentPlays />
    </>
  )
}

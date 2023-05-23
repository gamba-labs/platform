import { Button, GameBundle, GameView, RecentPlays, Svg, useGambaUi } from 'gamba/react-ui'
import React, { Fragment, useMemo } from 'react'
import { FaArrowRight, FaDice, FaList } from 'react-icons/fa'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from './components/Card'
import { Slider } from './components/Slider'
import { Banner, Section, StylelessButton } from './styles'

const CoverImage = styled.div`
  transition: background-image .2s ease;
  background-image: url("");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`

function Details({ game }: {game?: GameBundle}) {
  const navigate = useNavigate()
  return (
    <>
      {game ? (
        <CoverImage style={{ backgroundImage: 'url(' + (game.image) + ')', backgroundColor: game.theme_color }} />
      ) : (
        <CoverImage style={{ backgroundImage: 'url(/banner.png)' }} />
      )}
      <div>
        <Section>
          <div style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}>
            <StylelessButton style={{ color: 'white', fontSize: '20px' }} onClick={() => navigate('/')}>
              <Svg.Close />
            </StylelessButton>
          </div>
        </Section>
        {game ? (
          <Section>
            <h1>{game.name}</h1>
            <div style={{ color: '#ffffff99', wordWrap: 'break-word', overflow: 'hidden' }}>By {game.creator}</div>
            <div>{game.description || '-'}</div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'end' }}>
              <Button fill pulse onClick={() => navigate('/game/' + game.short_name + '/play')}>
                Play Game <FaArrowRight />
              </Button>
            </div>
          </Section>
        ) : (
          <Section>
            <h1>Gamba Demo</h1>
            <div>
              A decentralized, provably-fair casino built on <a target="_blank" href="https://github.com/gamba-labs/gamba" rel="noreferrer">gamba</a>.
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Button onClick={() => window.open('https://twitter.com/gambalabs', '_blank')}>
                Read More
              </Button>
            </div>
          </Section>
        )}
      </div>
    </>
  )
}

export default function View({ play = false }: {play?: boolean}) {
  const { shortName } = useParams()
  const navigate = useNavigate()
  const games = useGambaUi((state) => state.games)
  const game = useMemo(() => games.find((x) => x.short_name === shortName), [games, shortName])

  return (
    <>
      <Banner size={play ? 'big' : shortName ? 'medium' : 'default'}>
        <Fragment key={shortName}>
          {(play && game) ? (
            <div>
              <GameView game={game} />
              <div style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}>
                <StylelessButton style={{ color: 'white', fontSize: '20px' }} onClick={() => navigate('/game/' + game.short_name)}>
                  <Svg.Close />
                </StylelessButton>
              </div>
            </div>
          ) : (
            <Details game={game} />
          )}
        </Fragment>
      </Banner>
      {games.length > 1 && (
        <Section>
          <Slider
            title={
              <h2>
                <FaDice /> Featured Games
              </h2>
            }
          >
            {games.map((game) => (
              <NavLink key={game.short_name} to={`/game/${game.short_name}`}>
                <Card
                  width={150}
                  height={play ? 50 : 200}
                  backgroundImage={game.image}
                  backgroundColor={game.theme_color}
                >
                  {game.name}
                </Card>
              </NavLink>
            ))}
          </Slider>
        </Section>
      )}
      <Section>
        <h2>
          <FaList /> Recent Plays
        </h2>
        <RecentPlays />
      </Section>
    </>
  )
}

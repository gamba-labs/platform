import React from 'react'
import { Button } from '../components/Button'
import { Section } from '../components/Section'
import { Icon } from '../components/Icon'
import styles from './Home.module.css'

export function Home() {
  return (
    <div className={styles.banner}>
      <Section>
        <h2>
          What is this?
        </h2>
        <p style={{ wordWrap: 'break-word' }}>
          An open source, decentralized casino built on Gamba. Copy this platform with your own branding and start earning fees on every bet.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            as="a"
            color="white"
            href="https://gamba.so"
            target="_blank"
            icon={<Icon.ExternalLink />}
          >
            Learn more
          </Button>
        </div>
      </Section>
    </div>
  )
}

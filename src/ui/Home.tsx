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
          Welcome to Solbets!
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* <Button
            as="a"
            color="white"
            href="https://gamba.so"
            target="_blank"
            icon={<Icon.ExternalLink />}
          >
            Learn more
          </Button> */}
        </div>
      </Section>
    </div>
  )
}

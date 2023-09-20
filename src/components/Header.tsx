import React from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Header.module.css'

export const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className={styles.wrapper}>
      <div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <NavLink className={styles.logo} to="/">
            <img alt="Gamba logo" src="/logo-2.svg" height="20px" />
          </NavLink>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

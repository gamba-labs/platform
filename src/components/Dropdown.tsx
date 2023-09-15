import React from 'react'
import { cx } from '../utils'
import styles from './Dropdown.module.css'

export function Dropdown({ visible, children, anchor: _anchor }: React.PropsWithChildren<{visible: boolean, anchor?: 'bottom' | 'top'}>) {
  const ref = React.useRef<HTMLDivElement>(null!)

  const anchor = React.useMemo(
    () => {
      if (_anchor) return _anchor
      if (!ref.current) return 'bottom'
      return ref.current.getBoundingClientRect().y > window.innerHeight / 2 ? 'bottom' : 'top'
    }
    , [children, visible, _anchor],
  )

  return (
    <div
      ref={ref}
      className={
        cx(
          styles.container,
          visible && styles['visible'],
          styles[anchor],
        )
      }
    >
      <div>
        {children}
      </div>
    </div>
  )
}

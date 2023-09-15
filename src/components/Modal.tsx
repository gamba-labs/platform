import React from 'react'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { Icon } from './Icon'
import styles from './Modal.module.css'

interface Props extends React.PropsWithChildren {
  onClose?: () => void
}

export function Modal({ children, onClose }: Props) {
  const ref = React.useRef<HTMLDivElement>(null!)

  useOnClickOutside(ref, () => onClose && onClose())

  return (
    <div className={styles.modal}>
      <div className={styles.container}>
        <div className={styles.wrapper} ref={ref}>
          {onClose && (
            <button className={styles.close} onClick={onClose}>
              <Icon.Close2 />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { cx } from '../utils'
import styles from './Button.module.css'
import { useNavigate } from 'react-router-dom'

type ButtonSize = 'small' | 'medium' | 'large'

type ButtonColor = 'default' | 'white'

type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'soft'

interface ElementProps {
  button: React.ButtonHTMLAttributes<HTMLButtonElement>
  a: React.AnchorHTMLAttributes<HTMLAnchorElement>
}

type Element = keyof ElementProps

interface ButtonProps<E extends Element> {
  as?: E
  size?: ButtonSize
  variant?: ButtonVariant
  color?: ButtonColor
  pulse?: boolean
  icon?: JSX.Element
  loading?: boolean
  disabled?: boolean
}

export function Button<E extends Element>(
  props: ButtonProps<E> & ElementProps[E],
) {
  const {
    as: Element = 'button',
    loading = false,
    children,
    size = 'medium',
    variant = 'solid',
    color = 'default',
    pulse,
    icon,
    disabled,
    className,
    ...rest
  } = props

  return (
    <Element
      className={
        cx(
          styles.button,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          styles[`color-${color}`],
          pulse && styles['pulse'],
          className,
        )
      }
      disabled={disabled || loading}
      {...rest}
    >
      {children}
      {loading ? (
        <span className={styles.icon}>
          <div className={styles.loader} />
        </span>
      ) : icon ? (
        <span className={styles.icon}>
          {icon}
        </span>
      ) : null}
    </Element>
  )
}

export function NavButton(props: ButtonProps<'button'> & Omit<ElementProps['button'], 'onClick'> & {to: string}) {
  const navigate = useNavigate()
  return (
    <Button {...props} onClick={() => navigate(props.to)} />
  )
}

export function CopyButton(props: ButtonProps<'button'> & ElementProps['button'] & {content: string | number}) {
  const { content, children, onClick, ...rest } = props
  const [copied, setCopied] = React.useState(false)

  const click = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onClick && onClick(e)
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 500)
  }

  return (
    <Button {...rest} onClick={click}>
      {copied ? 'Copied' : children}
    </Button>
  )
}

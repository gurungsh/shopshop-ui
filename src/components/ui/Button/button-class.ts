import { clsx } from 'clsx'

import styles from './Button.module.css'

export interface ButtonStyleProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'dangerOutline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonStyleProps = {}): string {
  return clsx(styles.button, styles[variant], styles[size], className)
}

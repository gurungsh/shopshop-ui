import type { ComponentProps } from 'react'

import { buttonClass, type ButtonStyleProps } from './button-class'

export type ButtonProps = ComponentProps<'button'> & ButtonStyleProps

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  )
}

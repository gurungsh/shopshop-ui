import { clsx } from 'clsx'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import styles from './Tabs.module.css'

export const Tabs = TabsPrimitive.Root

export function TabList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List className={clsx(styles.list, className)} {...props} />
  )
}

export function Tab({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger className={clsx(styles.tab, className)} {...props} />
  )
}

export function TabPanel({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={clsx(styles.panel, className)}
      {...props}
    />
  )
}

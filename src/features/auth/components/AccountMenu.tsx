import { ChevronDown, UserRound } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { Link, useLocation } from 'react-router'

import { loginPath } from '../lib/login-path'
import { useSession, useSignOut } from '../lib/use-session'
import styles from './AccountMenu.module.css'

export function AccountMenu({ className }: { className?: string }) {
  const session = useSession()
  const signOut = useSignOut()
  const { pathname, search } = useLocation()

  if (!session) {
    return (
      <Link
        to={loginPath({ returnTo: pathname + search })}
        className={className}
      >
        <UserRound size={20} aria-hidden="true" />
        Sign in
      </Link>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={className}>
        <UserRound size={20} aria-hidden="true" />
        Account
        <ChevronDown size={16} aria-hidden="true" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className={styles.content}
        >
          <DropdownMenu.Label className={styles.label}>
            Signed in as
            <span className={styles.email}>{session.user.email}</span>
          </DropdownMenu.Label>
          <DropdownMenu.Separator className={styles.separator} />

          <DropdownMenu.Item asChild className={styles.item}>
            <Link to="/account/orders">Orders</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={styles.item}>
            <Link to="/account/profile">Profile</Link>
          </DropdownMenu.Item>
          {session.user.role === 'Admin' && (
            <DropdownMenu.Item asChild className={styles.item}>
              <Link to="/admin">Admin console</Link>
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item
            className={styles.item}
            onSelect={() => {
              void signOut()
            }}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

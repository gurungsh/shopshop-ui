import { Link, useLocation } from 'react-router'

import { Button, buttonClass } from '@/components/ui/Button'
import { loginPath, useSession, useSignOut } from '@/features/auth'

import { ErrorPage } from './ErrorPage'
import styles from './ErrorPage.module.css'

export function ForbiddenPage() {
  const session = useSession()
  const signOut = useSignOut()
  const { pathname, search } = useLocation()

  return (
    <ErrorPage
      code="403"
      title="You don’t have access to this page"
      body="This area is for ShopShop admins. If you think you should have access, sign in with an admin account."
      actions={
        <>
          <Link to="/" className={buttonClass({ size: 'lg' })}>
            Back to the shop
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              void signOut(loginPath({ returnTo: pathname + search }))
            }}
          >
            Sign in with another account
          </Button>
        </>
      }
    >
      {session && (
        <p className={styles.note}>Signed in as {session.user.email}</p>
      )}
    </ErrorPage>
  )
}

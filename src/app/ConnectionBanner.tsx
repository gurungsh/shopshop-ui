import { useQueryClient } from '@tanstack/react-query'

import { useOnline, useServiceUnavailable } from '@/api/service-status'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'

import styles from './ConnectionBanner.module.css'

export function ConnectionBanner() {
  const online = useOnline()
  const unavailable = useServiceUnavailable()
  const queryClient = useQueryClient()

  if (!online) {
    return (
      <div className={styles.wrap}>
        <Banner tone="info" title="You’re offline">
          Reconnect to keep shopping. Your cart is saved in this browser.
        </Banner>
      </div>
    )
  }

  if (unavailable) {
    return (
      <div className={styles.wrap}>
        <Banner
          title="ShopShop is temporarily unavailable"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void queryClient.invalidateQueries()}
            >
              Try again
            </Button>
          }
        >
          We’re having trouble reaching our servers. Pages may not load until
          this clears.
        </Banner>
      </div>
    )
  }

  return null
}

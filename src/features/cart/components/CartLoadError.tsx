import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'

export function CartLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Banner
      title="We couldn’t load your cart."
      action={
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      Your items are saved. Check your connection, then try again.
    </Banner>
  )
}

import { ErrorPage } from './ErrorPage'

export function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="We can’t find that page"
      body="The page may have moved, or the product or order no longer exists. Check the address, or head back to the shop."
    />
  )
}

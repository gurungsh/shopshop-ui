import { isRouteErrorResponse, useRouteError } from 'react-router'

import { ErrorPage } from './ErrorPage'
import { ForbiddenPage } from './ForbiddenPage'
import { NotFoundPage } from './NotFoundPage'

export function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  if (isRouteErrorResponse(error) && error.status === 403) {
    return <ForbiddenPage />
  }

  console.error(error)

  return (
    <ErrorPage
      code="Error"
      title="Something went wrong"
      body="An unexpected error stopped this page from loading. Try again, or head back to the shop."
      retry
    />
  )
}

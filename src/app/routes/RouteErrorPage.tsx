import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import { reportError } from '@/api/report-error'

import { ErrorPage } from './ErrorPage'
import { ForbiddenPage } from './ForbiddenPage'
import { NotFoundPage } from './NotFoundPage'

export function RouteErrorPage() {
  const error = useRouteError()
  const expected =
    isRouteErrorResponse(error) &&
    (error.status === 404 || error.status === 403)

  useEffect(() => {
    if (!expected) reportError(error, 'route')
  }, [error, expected])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  if (isRouteErrorResponse(error) && error.status === 403) {
    return <ForbiddenPage />
  }

  return (
    <ErrorPage
      code="Error"
      title="Something went wrong"
      body="An unexpected error stopped this page from loading. Try again, or head back to the shop."
      retry
    />
  )
}

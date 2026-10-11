import { catalogHandlers } from './catalog'
import { identityHandlers } from './identity'
import { orderingHandlers } from './ordering'

export const handlers = [
  ...catalogHandlers,
  ...identityHandlers,
  ...orderingHandlers,
]

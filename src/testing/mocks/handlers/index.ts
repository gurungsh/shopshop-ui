import { catalogHandlers } from './catalog'
import { identityHandlers } from './identity'

export const handlers = [...catalogHandlers, ...identityHandlers]

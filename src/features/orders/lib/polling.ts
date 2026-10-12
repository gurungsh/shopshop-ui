// Payment answers through a queue, so the page polls (no push channel)
export const POLL_INTERVAL_MS = 2000
export const POLL_TIMEOUT_MS = 30_000
export const DETAIL_POLL_INTERVAL_MS = 5000
// The admin list refreshes itself; React Query pauses this in background tabs
export const ADMIN_REFRESH_MS = 30_000

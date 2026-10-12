// The user's locale (G20)
const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  return date.format(new Date(iso))
}

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso))
}

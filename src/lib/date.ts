// The user's locale (G20)
const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  return date.format(new Date(iso))
}

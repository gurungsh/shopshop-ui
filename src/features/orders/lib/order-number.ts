/** For display only (G17); calls always use the full id */
export function orderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`
}

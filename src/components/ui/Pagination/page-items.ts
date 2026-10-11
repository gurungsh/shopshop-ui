export function pageItems(
  page: number,
  totalPages: number,
): (number | 'gap')[] {
  const pages = new Set([1, page - 1, page, page + 1, totalPages])
  const visible = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items: (number | 'gap')[] = []
  for (const p of visible) {
    const last = items.at(-1)
    if (typeof last === 'number' && p - last === 2) items.push(last + 1)
    else if (typeof last === 'number' && p - last > 2) items.push('gap')
    items.push(p)
  }
  return items
}

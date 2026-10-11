const TINT_COUNT = 6

export function categoryTint(categoryId: string): number {
  let hash = 0
  for (const char of categoryId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return (hash % TINT_COUNT) + 1
}

/** Stands in for a page a later chunk builds, so the guards can be tried now */
export function PlaceholderPage({
  title,
  chunk,
}: {
  title: string
  chunk: string
}) {
  return (
    <>
      <title>{`${title} · ShopShop`}</title>
      <h1>{title}</h1>
      <p>Coming in {chunk}.</p>
    </>
  )
}

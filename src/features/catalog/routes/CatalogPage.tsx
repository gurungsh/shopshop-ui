import { useSearchParams } from 'react-router'

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')

  return (
    <>
      <title>All products · ShopShop</title>
      <h1>All products</h1>
      <p>
        {query
          ? `Searching for “${query}”.`
          : 'Products arrive with the next commit.'}
      </p>
    </>
  )
}

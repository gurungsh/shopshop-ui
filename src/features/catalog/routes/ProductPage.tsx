import { useParams } from 'react-router'

export function ProductPage() {
  const { id } = useParams()

  return (
    <>
      <title>Product · ShopShop</title>
      <h1>Product</h1>
      <p>Product {id} arrives with a later commit.</p>
    </>
  )
}

import { useQueries, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'

import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/Tabs'

import { orderCountQuery, orderListQuery } from '../api/queries'
import { OrderTable } from '../components/OrderTable'
import {
  isOrderTab,
  type OrderTab,
  orderTabs,
  parseOrderTab,
  tabLabels,
  toCountQuery,
  toOrderQuery,
  toOrderSearchParams,
} from '../lib/order-tabs'
import styles from './OrdersPage.module.css'

const emptyCopy: Record<OrderTab, string> = {
  all: 'You haven’t placed any orders yet.',
  ongoing: 'You have no orders in progress.',
  past: 'You have no past orders yet.',
}

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { tab, page } = parseOrderTab(searchParams)
  const orders = useQuery(orderListQuery(toOrderQuery(tab, page)))
  const counts = useQueries({
    queries: orderTabs.map((t) => orderCountQuery(toCountQuery(t))),
  })

  function show(nextTab: OrderTab, nextPage = 1) {
    setSearchParams(toOrderSearchParams(nextTab, nextPage), {
      preventScrollReset: nextTab !== tab,
    })
  }

  return (
    <div className={styles.page}>
      <title>Your orders · ShopShop</title>
      <h1 className={styles.title}>Your orders</h1>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isOrderTab(value)) show(value)
        }}
        className={styles.tabs}
      >
        <TabList aria-label="Filter orders">
          {orderTabs.map((t, index) => {
            const count = counts[index]?.data
            return (
              <Tab key={t} value={t}>
                {tabLabels[t]}
                {count !== undefined && ` (${String(count)})`}
              </Tab>
            )
          })}
        </TabList>

        <TabPanel value={tab} className={styles.panel}>
          {orders.isError && !orders.data && (
            <Banner
              title="We couldn’t load your orders."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void orders.refetch()}
                >
                  Try again
                </Button>
              }
            >
              Check your connection, then try again.
            </Banner>
          )}

          {orders.isPending && (
            <div aria-hidden="true" className={styles.skeleton}>
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className={styles.skeletonRow} />
              ))}
            </div>
          )}

          {orders.data?.items.length === 0 &&
            (page > 1 ? (
              <div className={styles.empty}>
                <p>There are no orders on page {page}.</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    show(tab)
                  }}
                >
                  Go to page 1
                </Button>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>{emptyCopy[tab]}</p>
                {tab === 'all' && <Link to="/">Browse products</Link>}
              </div>
            ))}

          {orders.data && orders.data.items.length > 0 && (
            <OrderTable
              orders={orders.data.items}
              isStale={orders.isPlaceholderData}
            />
          )}

          {orders.data && orders.data.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={orders.data.totalPages}
              onPageChange={(nextPage) => {
                show(tab, nextPage)
              }}
            />
          )}
        </TabPanel>
      </Tabs>
    </div>
  )
}

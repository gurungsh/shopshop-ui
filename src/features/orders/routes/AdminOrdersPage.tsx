import {
  useIsFetching,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { SelectField } from '@/components/ui/SelectField'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/Tabs'

import {
  adminOrderCountQuery,
  adminOrderKeys,
  adminOrderListQuery,
} from '../api/admin-queries'
import { AdminOrderFilters } from '../components/AdminOrderFilters'
import { AdminOrderTable } from '../components/AdminOrderTable'
import {
  type AdminFilters,
  PAGE_SIZES,
  parseAdminFilters,
  toAdminCountQuery,
  toAdminOrderQuery,
  toAdminSearchParams,
} from '../lib/admin-filters'
import { isOrderTab, orderTabs, tabLabels } from '../lib/order-tabs'
import styles from './AdminOrdersPage.module.css'

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAdminFilters(searchParams)
  const { tab, page } = filters
  const queryClient = useQueryClient()
  const refreshing = useIsFetching({ queryKey: adminOrderKeys.lists() }) > 0
  const orders = useQuery(adminOrderListQuery(toAdminOrderQuery(filters)))
  const counts = useQueries({
    queries: orderTabs.map((t) =>
      adminOrderCountQuery(toAdminCountQuery(filters, t)),
    ),
  })

  function show(next: AdminFilters) {
    setSearchParams(toAdminSearchParams(next), {
      preventScrollReset: next.tab !== tab,
    })
  }

  return (
    <div className={styles.page}>
      <title>Orders · ShopShop Admin</title>
      <h1 className={styles.title}>Orders</h1>

      <AdminOrderFilters filters={filters} onChange={show} />

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isOrderTab(value)) {
            show({ ...filters, tab: value, page: 1, statuses: [] })
          }
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
          <div className={styles.toolbar}>
            <SelectField
              label="Rows per page"
              value={filters.size}
              onChange={(event) => {
                show({ ...filters, size: Number(event.target.value), page: 1 })
              }}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </SelectField>
            <p className={styles.refreshNote}>Refreshes every 30 seconds</p>
            <Button
              variant="secondary"
              disabled={refreshing}
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: adminOrderKeys.lists(),
                })
              }}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>

          {orders.isError && !orders.data && (
            <Banner
              title="We couldn’t load the orders."
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
                    show({ ...filters, page: 1 })
                  }}
                >
                  Go to page 1
                </Button>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No orders match these filters.</p>
              </div>
            ))}

          {orders.data && orders.data.items.length > 0 && (
            <AdminOrderTable
              orders={orders.data.items}
              isStale={orders.isPlaceholderData}
            />
          )}

          {orders.data && orders.data.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={orders.data.totalPages}
              onPageChange={(nextPage) => {
                show({ ...filters, page: nextPage })
              }}
            />
          )}
        </TabPanel>
      </Tabs>
    </div>
  )
}

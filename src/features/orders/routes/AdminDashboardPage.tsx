import {
  useIsFetching,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'

import type { OrderStatus } from '@/api/types/ordering'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatMoney } from '@/lib/money'

import {
  adminOrderCountQuery,
  adminOrderKeys,
  adminOrderListQuery,
} from '../api/admin-queries'
import { adminRevenueQuery } from '../api/dashboard-queries'
import { AdminOrderTable } from '../components/AdminOrderTable'
import cardStyles from '../components/Dashboard.module.css'
import { DashboardKpis } from '../components/DashboardKpis'
import { NeedsAttention } from '../components/NeedsAttention'
import { StatusBreakdown } from '../components/StatusBreakdown'
import {
  dashboardRanges,
  needsAttention,
  parseRange,
  rangeStart,
  toDay,
} from '../lib/dashboard'
import { allStatuses, ongoingStatuses } from '../lib/status'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardPage() {
  const [params, setParams] = useSearchParams()
  const days = parseRange(params)
  const start = rangeStart(days)
  const since = start.toISOString()
  const from = toDay(start)
  const label = `Last ${String(days)} days`

  const queryClient = useQueryClient()
  const refreshing = useIsFetching({ queryKey: adminOrderKeys.lists() }) > 0
  const results = useQueries({
    queries: allStatuses.map((status) =>
      adminOrderCountQuery({ statuses: [status], createdAfterUtc: since }),
    ),
  })
  const revenue = useQuery(adminRevenueQuery(since))
  const open = useQuery(
    adminOrderListQuery({
      statuses: ['PaymentFailed', 'Pending'],
      page: 1,
      pageSize: 20,
    }),
  )
  const recent = useQuery(adminOrderListQuery({ page: 1, pageSize: 5 }))

  const counts = Object.fromEntries(
    allStatuses.map((status, index) => [status, results[index]?.data]),
  ) as Record<OrderStatus, number | undefined>
  const ongoing = ongoingStatuses.map((s) => counts[s])
  const failed =
    (results.some((q) => q.isError) ||
      revenue.isError ||
      open.isError ||
      recent.isError) &&
    !refreshing
  const link = (status: OrderStatus) =>
    `/admin/orders?from=${from}&status=${status}`

  return (
    <div className={styles.page}>
      <title>Dashboard · ShopShop Admin</title>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.controls}>
          <p className={styles.refreshNote}>Refreshes every 30 seconds</p>
          <div role="group" aria-label="Date range" className={styles.controls}>
            {dashboardRanges.map((range) => (
              <Button
                key={range}
                size="sm"
                variant={range === days ? 'primary' : 'secondary'}
                aria-pressed={range === days}
                onClick={() => {
                  setParams(range === 30 ? {} : { range: String(range) })
                }}
              >
                {range} days
              </Button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
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
      </div>

      {failed && (
        <Banner
          title="We couldn’t load all of the dashboard."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void queryClient.invalidateQueries({
                  queryKey: adminOrderKeys.lists(),
                })
              }}
            >
              Try again
            </Button>
          }
        >
          Some numbers may be missing. Check your connection, then try again.
        </Banner>
      )}

      <DashboardKpis
        kpis={[
          {
            label: 'Ongoing orders',
            value: ongoing.some((n) => n === undefined)
              ? '–'
              : String(ongoing.reduce<number>((sum, n) => sum + (n ?? 0), 0)),
            note: `${label}: pending, confirmed, processing, shipped or payment failed`,
            to: `/admin/orders?from=${from}&tab=ongoing`,
          },
          {
            label: 'Payment failed',
            value: String(counts.PaymentFailed ?? '–'),
            note: 'Customers can still retry these',
            to: link('PaymentFailed'),
          },
          {
            label: 'Revenue',
            value: revenue.data ? formatMoney(revenue.data.total) : '–',
            note: revenue.data?.partial
              ? `${label}, from the latest 1,000 paid orders only`
              : `${label}, paid orders only`,
          },
          {
            label: 'Delivered',
            value: String(counts.Delivered ?? '–'),
            note: label,
            to: link('Delivered'),
          },
        ]}
      />

      <div className={styles.row}>
        <section aria-labelledby="by-status" className={cardStyles.card}>
          <div className={cardStyles.cardHeading}>
            <h2 id="by-status">Orders by status</h2>
            <span className={cardStyles.note}>{label}</span>
          </div>
          <StatusBreakdown counts={counts} from={from} />
        </section>
        <NeedsAttention
          orders={needsAttention(open.data?.items ?? []).slice(0, 5)}
        />
      </div>

      <section aria-labelledby="recent" className={cardStyles.card}>
        <div className={cardStyles.cardHeading}>
          <h2 id="recent">Recent orders</h2>
          <Link to="/admin/orders">All orders</Link>
        </div>
        {recent.data ? (
          <AdminOrderTable orders={recent.data.items} />
        ) : (
          !recent.isError && <Skeleton className={styles.recentSkeleton} />
        )}
      </section>
    </div>
  )
}

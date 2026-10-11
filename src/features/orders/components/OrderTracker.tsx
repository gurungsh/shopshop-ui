import type { OrderStatus } from '@/api/types/ordering'

import { statusLabels, trackerSteps as steps } from '../lib/status'
import styles from './OrderTracker.module.css'

export function OrderTracker({ status }: { status: OrderStatus }) {
  const paymentFailed = status === 'PaymentFailed'
  const current = paymentFailed ? 0 : steps.indexOf(status)

  return (
    <section aria-label="Order progress" className={styles.tracker}>
      <ol className={styles.steps}>
        {steps.map((step, index) => {
          const state = stepState(index, current, paymentFailed)
          return (
            <li
              key={step}
              data-state={state}
              aria-current={index === current ? 'step' : undefined}
              className={styles.step}
            >
              <span className={styles.bar} aria-hidden="true" />
              <span className={styles.label}>
                {index === current && paymentFailed
                  ? statusLabels.PaymentFailed
                  : statusLabels[step]}
                {state === 'done' && (
                  <span className="sr-only"> (completed)</span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function stepState(index: number, current: number, paymentFailed: boolean) {
  if (index < current) return 'done'
  if (index > current) return 'todo'
  return paymentFailed ? 'failed' : 'current'
}

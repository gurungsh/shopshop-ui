import { Link } from 'react-router'

import styles from './Dashboard.module.css'

interface Kpi {
  label: string
  value: string
  note: string
  to?: string
}

export function DashboardKpis({ kpis }: { kpis: Kpi[] }) {
  return (
    <ul className={styles.kpis}>
      {kpis.map(({ label, value, note, to }) => {
        const body = (
          <>
            <span className={styles.kpiLabel}>{label}</span>
            <span className={styles.kpiValue}>{value}</span>
            <span className={styles.kpiNote}>{note}</span>
          </>
        )
        return (
          <li key={label}>
            {to ? (
              <Link to={to} className={styles.kpi}>
                {body}
              </Link>
            ) : (
              <div className={styles.kpi}>{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

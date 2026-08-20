export function StatusPill({ status }: { status: string }) {
  const active = status === 'On route'
  const warning = status === 'Maintenance'
  return <span className={`status-pill ${active ? 'status-active' : warning ? 'status-warning' : 'status-muted'}`}><span className="status-dot" />{status}</span>
}

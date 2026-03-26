export function Badge({ children, status = 'default', className = '' }) {
  const styles = {
    todo: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    default: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
        styles[status] || styles.default
      } ${className}`}
    >
      {children}
    </span>
  )
}

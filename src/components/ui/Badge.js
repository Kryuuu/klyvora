export function Badge({ children, status = 'default', className = '' }) {
  const styles = {
    todo: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    progress: 'bg-warning/10 text-warning border-warning/20',
    done: 'bg-success/10 text-success border-success/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    default: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
        styles[status] || styles.default
      } ${className}`}
    >
      {children}
    </span>
  )
}

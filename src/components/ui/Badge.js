export function Badge({ 
  children, 
  status = 'todo', 
  className = '' 
}) {
  const statusStyles = {
    todo: 'bg-white/5 text-slate-300 border border-white/10',
    neutral: 'bg-white/5 text-slate-300 border border-white/10',
    doing: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20',
    progress: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20',
    active: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20',
    operational: 'bg-violet-500/10 text-violet-300 border border-violet-400/20',
    done: 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
    danger: 'bg-red-500/10 text-red-300 border border-red-400/20',
    free: 'bg-white/5 text-slate-300 border border-white/10',
    pro: 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/20',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${statusStyles[status] || statusStyles.todo} ${className}`}>
      {children}
    </span>
  )
}

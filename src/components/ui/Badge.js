export function Badge({ 
  children, 
  status = 'todo', 
  className = '' 
}) {
  const statusStyles = {
    todo: 'bg-slate-800 text-slate-300 border border-slate-700',
    doing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    progress: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', // Alias
    done: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  }

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.todo} ${className}`}>
      {children}
    </span>
  )
}

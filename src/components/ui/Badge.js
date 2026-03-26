export function Badge({ 
  children, 
  status = 'todo', 
  className = '' 
}) {
  const statusStyles = {
    todo: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    doing: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20', // Alias for 'doing'
  }

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all duration-200 ${statusStyles[status] || statusStyles.todo} ${className}`}>
      {children}
    </span>
  )
}

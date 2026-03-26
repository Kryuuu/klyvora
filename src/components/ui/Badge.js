export function Badge({ 
  children, 
  status = 'todo', 
  className = '' 
}) {
  const statusStyles = {
    todo: 'bg-[#27272a] text-[#a1a1aa]',
    doing: 'bg-[#7c3aed]/20 text-[#7c3aed]',
    progress: 'bg-[#7c3aed]/20 text-[#7c3aed]', // Alias
    done: 'bg-emerald-500/10 text-emerald-500',
  }

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs tracking-wide font-medium ${statusStyles[status] || statusStyles.todo} ${className}`}>
      {children}
    </span>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl border text-sm font-medium tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-0 active:scale-[0.98] px-4 py-2.5'
  
  const variants = {
    primary: 'border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_40px_rgba(34,211,238,0.18)] hover:translate-y-[-1px] hover:shadow-[0_18px_50px_rgba(59,130,246,0.24)]',
    default: 'border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_40px_rgba(34,211,238,0.18)] hover:translate-y-[-1px] hover:shadow-[0_18px_50px_rgba(59,130,246,0.24)]',
    secondary: 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:border-white/15',
    outline: 'border-white/10 bg-transparent text-slate-100 hover:bg-white/5 hover:border-white/20',
    ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-white',
    danger: 'border-red-500/20 bg-red-500/10 text-red-200 hover:bg-red-500/15 hover:border-red-500/30',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  )
}

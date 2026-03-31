export function Button({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2'
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm',
    outline: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200',
    ghost: 'hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-md',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 shadow-sm',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
      ) : null}
      {children}
    </button>
  )
}

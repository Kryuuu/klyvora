export function Button({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 transform active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 shadow-lg shadow-purple-600/20',
    secondary: 'bg-[#18181b] hover:border-purple-500/50 text-white px-6 py-3 border border-white/10 shadow-sm shadow-black/20',
    outline: 'bg-transparent border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 text-gray-300 px-6 py-3',
    ghost: 'hover:bg-white/5 text-zinc-500 hover:text-white px-4 py-2 rounded-lg',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 px-6 py-3',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        isLoading || props.disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  )
}

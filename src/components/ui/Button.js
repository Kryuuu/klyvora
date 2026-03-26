export function Button({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5',
    secondary: 'bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 py-2.5 border border-[#3f3f46]',
    outline: 'bg-transparent border border-[#3f3f46] hover:bg-[#27272a] text-[#fafafa] px-5 py-2.5',
    ghost: 'hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] px-4 py-2 rounded-lg',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300'
  const variants = {
    primary: 'btn-glow text-white px-6 py-3',
    secondary: 'bg-[#1e1e2a] hover:bg-[#272737] text-white px-6 py-3 border border-white/5',
    ghost: 'hover:bg-white/5 text-gray-300 hover:text-white px-4 py-2',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        isLoading || props.disabled ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="spinner mr-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  )
}

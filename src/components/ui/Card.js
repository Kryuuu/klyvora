export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-zinc-900/10 border border-white/5 rounded-2xl p-6 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

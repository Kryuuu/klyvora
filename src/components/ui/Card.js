export function Card({ children, className = '', hover = true }) {
  return (
    <div
      className={`glass-surface rounded-3xl p-6 transition-all duration-300 ${
        hover ? 'hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

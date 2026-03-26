export function Card({ children, className = '', glow = false }) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 ${
        glow ? 'hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

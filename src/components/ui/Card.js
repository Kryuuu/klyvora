export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`glass-card rounded-[28px] transition-all duration-300 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

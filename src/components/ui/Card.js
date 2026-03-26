export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-[#18181b] border border-[#3f3f46] rounded-2xl p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

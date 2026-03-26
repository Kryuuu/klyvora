export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-[#121217] border border-white/10 rounded-[32px] shadow-2xl transition-all duration-500 hover:shadow-[0_0_80px_rgba(124,58,237,0.08)] hover:border-white/20 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

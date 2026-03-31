export function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-slate-800 border border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

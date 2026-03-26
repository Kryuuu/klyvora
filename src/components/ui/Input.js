export function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-sm font-medium text-[#a1a1aa]">{label}</label>}
      <input 
        className={`w-full bg-[#0f0f14] border border-[#3f3f46] text-[#fafafa] rounded-xl px-4 py-3 outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors ${className}`}
        {...props}
      />
    </div>
  )
}

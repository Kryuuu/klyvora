export function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 italic">{label}</label>}
      <input 
        className={`w-full bg-black/40 border-2 border-white/5 text-white rounded-2xl px-6 py-4 outline-none focus:border-[#7c3aed]/50 focus:bg-black/60 transition-all duration-300 placeholder:text-zinc-800 placeholder:italic ${className}`}
        {...props}
      />
    </div>
  )
}

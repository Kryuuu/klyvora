export function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>}
      <input 
        className={`w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_16px_40px_rgba(0,0,0,0.25)] ${className}`}
        {...props}
      />
    </div>
  )
}

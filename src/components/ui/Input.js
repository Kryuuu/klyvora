export function Input({ label, error, className = '', labelClassName = '', ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && <label className={`text-sm font-semibold text-gray-400 ${labelClassName}`}>{label}</label>}
      <input
        className={`bg-[#0f0f14] border border-[#272737] rounded-xl px-4 h-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all duration-200 ${
          error ? 'border-red-500 focus:border-red-500' : ''
        }`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

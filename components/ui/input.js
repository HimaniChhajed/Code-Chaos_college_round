export function Input({ className = '', error, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <input 
        className={`w-full bg-surface border-[3px] border-border rounded-[4px] px-4 py-3 font-body text-text placeholder:text-muted focus:outline-none focus:shadow-[4px_4px_0_0_#0A0A0A] disabled:bg-[#FFFEF0] disabled:cursor-not-allowed ${error ? 'border-error shadow-[4px_4px_0_0_#FF3EA5]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-error font-heading text-sm uppercase tracking-wide font-bold">{error}</span>}
    </div>
  );
}

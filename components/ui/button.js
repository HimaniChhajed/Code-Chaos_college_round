export function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = "px-6 py-3 font-heading font-bold uppercase border-[3px] border-border rounded-[4px] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_0_#0A0A0A] active:translate-x-[5px] active:translate-y-[5px] active:shadow-none tracking-[0.02em]";
  
  const variants = {
    primary: "bg-primary text-border shadow-[5px_5px_0_0_#0A0A0A]",
    dark: "bg-border text-surface shadow-[5px_5px_0_0_#0A0A0A]",
    white: "bg-surface text-border shadow-[5px_5px_0_0_#0A0A0A]",
    danger: "bg-error text-surface shadow-[5px_5px_0_0_#0A0A0A]",
  };

  return (
    <button className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

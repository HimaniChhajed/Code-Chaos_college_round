export function Card({ children, headerColor, className = '', hover = true }) {
  const hoverStyles = hover ? "transition-all hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#0A0A0A]" : "";
  return (
    <div className={`bg-surface border-[3px] border-border rounded-[4px] shadow-[5px_5px_0_0_#0A0A0A] ${hoverStyles} ${className}`}>
      {headerColor && (
        <div className={`h-4 border-b-[3px] border-border rounded-t-[1px]`} style={{ backgroundColor: headerColor }} />
      )}
      <div className="p-7">
        {children}
      </div>
    </div>
  );
}

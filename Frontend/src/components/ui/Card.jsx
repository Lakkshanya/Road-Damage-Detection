export function Card({ children, className = "" }) {
  return (
    <div className={`bg-card rounded-2xl shadow-soft border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function Card({ children, className = "", style = {} }) {
  return (
    <div 
      className={`bg-card rounded-2xl shadow-soft border border-slate-100 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

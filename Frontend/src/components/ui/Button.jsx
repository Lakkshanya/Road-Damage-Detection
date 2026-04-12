export function Button({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 ease-in-out cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 px-4 py-2.5";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-[#2a4d9c] text-white hover:from-[#152e70] hover:to-primary",
    secondary: "bg-secondary text-white hover:bg-[#0596ae]",
    accent: "bg-accent text-white hover:bg-[#ea580c]",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-slate-600 hover:text-primary hover:bg-slate-100",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

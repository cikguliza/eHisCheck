import React from 'react';

// Added size prop to Button to support scaling (sm, md, lg) and fix type errors in StudentList
export const Button: React.FC<{
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}> = ({ onClick, type = 'button', variant = 'primary', className = '', disabled, size = 'md', children }) => {
  const baseStyles = "rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<{
  label?: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  className?: string;
}> = ({ label, type = 'text', placeholder, value, onChange, multiline, rows = 3, required, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
    {multiline ? (
      <textarea
        rows={rows}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    ) : (
      <input
        type={type}
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

// Added className prop to Badge to fix type errors in PerformanceReport and allow styling from parent components
export const Badge: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'success' | 'warning' | 'info' | 'default' | 'danger';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-slate-100 text-slate-600",
    danger: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Toast: React.FC<{ message: string; type: 'success' | 'error' | 'info'; onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div className={`fixed bottom-6 right-6 ${styles[type]} text-white px-6 py-3 rounded-xl shadow-lg animate-bounce-in z-50 flex items-center gap-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-70">✕</button>
    </div>
  );
};
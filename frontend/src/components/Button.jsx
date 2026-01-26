import React from 'react';

const Button = ({ children, onClick, type = "button", className = "" }) => {
  const styles = {
    primary: "bg-mu-green text-mu-yellow hover:bg-green-800",
    secondary: "bg-mu-yellow text-mu-green hover:bg-yellow-400",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border-2 border-mu-green text-mu-green hover:bg-green-50"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 ${styles[type] || ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

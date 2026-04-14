import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // 'primary', 'blue', 'red', 'outline'
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="btn-content">{children}</span>
      <span className="btn-glitch" />
    </button>
  );
};

export default Button;

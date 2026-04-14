import React from 'react';
import './Input.css';

const Input = ({ label, icon, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input className="input-field" {...props} />
        <div className="input-focus-border"></div>
      </div>
    </div>
  );
};

export default Input;

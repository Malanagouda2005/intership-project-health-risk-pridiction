import React from 'react';
import './Card.css';

const Card = ({ title, subtitle, children, className }) => {
  return (
    <div className={`card-shell ${className || ''}`}>
      {(title || subtitle) && (
        <div className="card-heading">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;

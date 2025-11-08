import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border ${className}`}>
      {title && (
        <div className="p-4 border-b border-light-border dark:border-dark-border">
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
import React from 'react';

const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  when?: boolean;
  appear?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
}> = ({
  children,
  className = '',
  delay = 0,
  when = true,
  appear = false,
  mountOnEnter = false,
  unmountOnExit = false,
}) => {
  return (
    <div
      className={`reveal ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      data-testid="reveal"
      data-visible={when}
    >
      {children}
    </div>
  );
};

export default Reveal;

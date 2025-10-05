import React from 'react';

const UseCaseLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  description?: string;
}> = ({ children, title = 'Use Case', description = '' }) => {
  return (
    <div className="use-case-layout" data-testid="use-case-layout">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <div className="use-case-content">{children}</div>
    </div>
  );
};

export default UseCaseLayout;

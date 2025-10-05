import React from 'react';

const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  text?: string;
  show?: boolean;
}> = ({ size = 'md', className = '', fullScreen = false, text = 'Loading...', show = true }) => {
  if (!show) return null;

  return (
    <div
      className={`loading-spinner ${size} ${fullScreen ? 'full-screen' : ''} ${className}`}
      data-testid="loading-spinner"
      data-size={size}
      data-fullscreen={fullScreen}
    >
      <div className="spinner" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;

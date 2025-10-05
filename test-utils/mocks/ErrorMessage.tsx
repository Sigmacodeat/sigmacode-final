import React from 'react';

interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  showIcon?: boolean;
  onRetry?: () => void;
  dismissable?: boolean;
  onDismiss?: () => void;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  className = '',
  title = 'Error',
  icon,
  variant = 'danger',
  showIcon = true,
  onRetry,
  dismissable = false,
  onDismiss,
  fullWidth = false,
  style,
  ...rest
}) => {
  const defaultIcons = {
    danger: '❗',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
    default: '❌',
  };

  const displayIcon = icon || (showIcon ? defaultIcons[variant] : null);

  return (
    <div
      className={`error-message ${variant} ${fullWidth ? 'full-width' : ''} ${className}`}
      role="alert"
      data-testid="error-message"
      data-variant={variant}
      style={style}
      {...rest}
    >
      <div className="error-message-content">
        {displayIcon && <span className="error-icon">{displayIcon}</span>}

        <div className="error-details">
          {title && <h3 className="error-title">{typeof title === 'string' ? title : title}</h3>}

          {children && <div className="error-description">{children}</div>}

          {onRetry && (
            <button onClick={onRetry} className="retry-button" data-testid="error-retry-button">
              Retry
            </button>
          )}
        </div>

        {dismissable && (
          <button
            onClick={onDismiss}
            className="dismiss-button"
            aria-label="Dismiss error"
            data-testid="error-dismiss-button"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;

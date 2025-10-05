import * as React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  const [selectedValue, setSelectedValue] = React.useState(value || '');

  React.useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div ref={ref} className={cn('relative', className)} data-value={selectedValue} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onSelect: handleValueChange,
            selectedValue,
          });
        }
        return child;
      })}
    </div>
  );
});
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string;
  }
>(({ className, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn('text-sm', className)} {...props}>
    {props.children || <span className="text-muted-foreground">{placeholder}</span>}
  </span>
));
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80',
        className,
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  ),
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onSelect?: (value: string) => void;
    selectedValue?: string;
    children: React.ReactNode;
  }
>(({ className, children, value, onSelect, selectedValue, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      selectedValue === value && 'bg-accent text-accent-foreground',
      className,
    )}
    data-value={value}
    onClick={() => onSelect?.(value || '')}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

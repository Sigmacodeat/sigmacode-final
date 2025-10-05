// Mock für next/link
import React, { AnchorHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react';

interface LinkProps
  extends Omit<
    DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>,
    'ref'
  > {
  href: string;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean;
  locale?: string | false;
  legacyBehavior?: boolean;
  children: React.ReactNode;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      href,
      as,
      replace,
      scroll,
      shallow,
      passHref,
      prefetch,
      locale,
      legacyBehavior,
      ...props
    },
    ref,
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        {...props}
        data-testid="mock-link"
        data-href={href}
        data-as={as}
        data-replace={replace}
        data-scroll={scroll}
        data-shallow={shallow}
        data-prefetch={prefetch}
        data-locale={locale}
      >
        {children}
      </a>
    );
  },
);

Link.displayName = 'Link';

export default Link;

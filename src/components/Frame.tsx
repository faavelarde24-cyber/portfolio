import type { ReactNode } from 'react';

/** The Industry blueprint frame: hairline border + four registration marks. */
export function Frame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`blueprint ${className}`}>
      <i className="tl" aria-hidden="true" />
      <i className="tr" aria-hidden="true" />
      <i className="bl" aria-hidden="true" />
      <i className="br" aria-hidden="true" />
      {children}
    </div>
  );
}

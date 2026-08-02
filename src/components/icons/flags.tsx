// Simplified national flags for the country switcher. Flags are public-domain
// national symbols — these are hand-drawn approximations (not copied assets),
// simplified for legibility at small icon sizes rather than heraldic accuracy
// (e.g. Egypt's eagle emblem is omitted).

interface FlagProps {
  className?: string;
}

function FlagFrame({ className, children }: FlagProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function EgyptFlag({ className }: FlagProps) {
  return (
    <FlagFrame className={className}>
      <rect width="3" height="2" fill="#fff" />
      <rect width="3" height="0.667" fill="#ce1126" />
      <rect width="3" height="0.667" y="1.333" fill="#000" />
      <circle cx="1.5" cy="1" r="0.2" fill="#c09a3e" />
    </FlagFrame>
  );
}

export function UAEFlag({ className }: FlagProps) {
  return (
    <FlagFrame className={className}>
      <rect width="3" height="0.667" fill="#00732f" />
      <rect width="3" height="0.667" y="0.667" fill="#fff" />
      <rect width="3" height="0.667" y="1.333" fill="#000" />
      <rect width="0.75" height="2" fill="#ff0000" />
    </FlagFrame>
  );
}


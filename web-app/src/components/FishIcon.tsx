export function FishIcon({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 12c0-3.5 2.5-6 6-6 4 0 7 3 7 6s-3 6-7 6c-3.5 0-6-2.5-6-6Z" />
      <path d="M6.5 12H2l2-3-2-3h4.5" />
      <circle cx="17" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

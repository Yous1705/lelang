"use client";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lelang Internal logo"
    >
      <rect width="64" height="64" rx="12" fill="#0057d9" />
      <path
        d="M18 38 L28 24 L36 34 L46 18"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="44" cy="46" r="6" fill="#fff" opacity="0.12" />
    </svg>
  );
}

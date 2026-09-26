type IconProps = { className?: string };

function Base({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function TargetIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M3 13a9 9 0 0 1 18 0" />
      <path d="M12 13a2 2 0 1 0 2 2" />
      <path d="M12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4" />
    </Base>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 15 15 9" />
      <path d="M10 6.5 12 4.5a3.5 3.5 0 0 1 5 5l-2 2" />
      <path d="M14 17.5 12 19.5a3.5 3.5 0 0 1-5-5l2-2" />
    </Base>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Base>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" />
    </Base>
  );
}

export function DatabaseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" />
      <path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13" />
      <path d="M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />
    </Base>
  );
}

export function ChipIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </Base>
  );
}

export function StackIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </Base>
  );
}

export function FlaskIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M9 3h6" />
      <path d="M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" />
      <path d="M7.5 15h9" />
    </Base>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M7 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.2 8.3 4 4 0 0 1 17 18H7Z" />
    </Base>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M3 20h18" />
    </Base>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3l8 3.5v5c0 5-3.4 8-8 9.5-4.6-1.5-8-4.5-8-9.5v-5L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </Base>
  );
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      <path d="M10 21v-4h4v4" />
    </Base>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.9 7.9 0 0 0 0-3l1.9-1.4-2-3.4-2.2.7a8 8 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.4a8 8 0 0 0-2.6 1.5l-2.2-.7-2 3.4L4.6 10.5a7.9 7.9 0 0 0 0 3L2.7 14.9l2 3.4 2.2-.7a8 8 0 0 0 2.6 1.5l.5 2.4h4l.5-2.4a8 8 0 0 0 2.6-1.5l2.2.7 2-3.4-1.9-1.4Z" />
    </Base>
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
    </Base>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1V10" />
    </Base>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.2" />
    </Base>
  );
}

export function BookmarkIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <Base className={className}>
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.6L6 21V4.5Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Base>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </Base>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.9 7.9 0 0 0 0-3l1.9-1.4-2-3.4-2.2.7a8 8 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.4a8 8 0 0 0-2.6 1.5l-2.2-.7-2 3.4L4.6 10.5a7.9 7.9 0 0 0 0 3L2.7 14.9l2 3.4 2.2-.7a8 8 0 0 0 2.6 1.5l.5 2.4h4l.5-2.4a8 8 0 0 0 2.6-1.5l2.2.7 2-3.4-1.9-1.4Z" />
    </Base>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Base>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Base>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 15V3m0 0 4 4m-4-4-4 4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Base>
  );
}

export function CopyIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </Base>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m5 12 5 5 9-10" />
    </Base>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Base>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Base>
  );
}

export function WrenchIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2Z" />
    </Base>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </Base>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </Base>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      <path d="M15 3h6v6M10 14 21 3" />
    </Base>
  );
}

export function RouteIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.2 16.5 15 9M6 15.5V13a4 4 0 0 1 4-4h2" />
    </Base>
  );
}

export function GraduationCapIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="m12 4 10 5-10 5L2 9l10-5Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v6" />
    </Base>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M12 3s-1 3-3.5 5.5C6.5 10.5 6 12.5 6 14a6 6 0 0 0 12 0c0-2-1-3.5-2-4.5.3 1.3-.2 2-1 2.3.2-2.3-1-4-2-4.8C13.5 8.5 12.8 5.5 12 3Z" />
    </Base>
  );
}

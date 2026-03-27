interface SidebarCollapseIconProps {
  collapsed?: boolean;
  size?: number;
  color?: string;
}

export function SidebarCollapseIcon({ collapsed = false, size = 20, color = 'currentColor' }: SidebarCollapseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{
        transition: 'transform 0.2s',
        color,
        transform: collapsed ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* Two panels with divider and left-pointing chevron */}
      <rect x="2" y="3" width="20" height="18" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Divider between left and right panels */}
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" />
      {/* Left-pointing chevron in left panel */}
      <path d="M 8 10 L 6 12 L 8 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

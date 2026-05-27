import React from 'react';

interface AppLogoProps {
  className?: string;
  mode?: 'full' | 'icon' | 'badge';
  size?: number;
}

export function AppLogo({ className = '', mode = 'icon', size }: AppLogoProps) {
  if (mode === 'icon') {
    const iconSize = size || 40;
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Outer Circular Glow */}
        <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
        
        {/* Antennas */}
        <path d="M 40 28 L 38 12" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="38" cy="11" r="2" fill="#22c55e" />
        <path d="M 60 28 L 62 12" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="62" cy="11" r="2" fill="#22c55e" />

        {/* Router Waves */}
        <path d="M 36 38 A 18 18 0 0 1 64 38" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse" />
        <path d="M 41 43 A 11 11 0 0 1 59 43" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="50" cy="48" r="1.5" fill="#22c55e" />

        {/* Router Base */}
        <rect x="30" y="48" width="40" height="12" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        {/* Router LEDs */}
        <circle cx="36" cy="54" r="1" fill="#ef4444" />
        <circle cx="50" cy="54" r="1.5" fill="#22c55e" className="animate-ping" />
        <circle cx="60" cy="54" r="1" fill="#22c55e" />
        <circle cx="64" cy="54" r="1" fill="#22c55e" />

        {/* Small Floating Device Dots */}
        <circle cx="20" cy="70" r="1.5" fill="#22c55e" opacity="0.6" />
        <path d="M 30 54 L 20 70 M 50 60 L 50 72 M 70 54 L 80 70" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="72" r="1.5" fill="#38bdf8" opacity="0.6" />
        <circle cx="80" cy="70" r="1.5" fill="#eab308" opacity="0.6" />
      </svg>
    );
  }

  if (mode === 'badge') {
    const badgeSize = size || 48;
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 p-1.5 shadow-xl ${className}`} style={{ width: badgeSize, height: badgeSize }}>
        <AppLogo mode="icon" size={badgeSize - 12} />
        <span className="absolute -top-1 -right-1 px-1.5 h-3.5 bg-green-500 rounded-full border border-slate-950 flex items-center justify-center tracking-tight font-black text-[6.5px] text-white">
          LIVE
        </span>
      </div>
    );
  }

  // Full detailed network diagram mode (100% vector-exact representations of the logo provided!)
  const fullSize = size || 180;
  return (
    <div className={`flex flex-col items-center select-none ${className}`} style={{ width: fullSize }}>
      <svg
        viewBox="30 10 160 151"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Antennas */}
        <path d="M 103 40 L 97 15" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="97" cy="15" r="2.5" fill="#ef4444" />
        
        <path d="M 117 40 L 123 15" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="123" cy="15" r="2.5" fill="#ef4444" />

        {/* Concentric Green Wifi Waves */}
        <path d="M 94 30 A 18 18 0 0 1 126 30" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none" className="animate-pulse" />
        <path d="M 99 35 A 11 11 0 0 1 121 35" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="110" cy="40" r="1.5" fill="#22c55e" />

        {/* Router Base Box */}
        <rect x="90" y="40" width="40" height="10" rx="2" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
        {/* Router design detail LEDs */}
        <circle cx="95" cy="45" r="1" fill="#ef4444" />
        <rect x="105" y="44" width="10" height="1" fill="#111827" />
        <circle cx="118" cy="45" r="1" fill="#22c55e" />
        <circle cx="121" cy="45" r="1" fill="#22c55e" />
        <circle cx="124" cy="45" r="1" fill="#22c55e" />

        {/* Central Devices Column */}
        {/* Smartphone */}
        <g transform="translate(104, 58)">
          <rect x="0" y="0" width="12" height="20" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <rect x="1.5" y="1.5" width="9" height="15" rx="1" fill="#22c55e" />
          {/* Inner small UI boxes inside smartphone icon */}
          <rect x="3" y="3" width="2" height="2" fill="#ffffff" opacity="0.8" />
          <rect x="7" y="3" width="2" height="2" fill="#ef4444" opacity="0.8" />
          <rect x="3" y="7" width="2" height="2" fill="#eab308" opacity="0.8" />
          <rect x="7" y="7" width="2" height="2" fill="#3b82f6" opacity="0.8" />
          <circle cx="6" cy="18" r="0.8" fill="#cccccc" />
        </g>

        {/* Tablet Box with Text */}
        <g transform="translate(94, 82)">
          <rect x="0" y="0" width="32" height="21" rx="2" fill="#2dd4bf" stroke="#0f172a" strokeWidth="1.5" />
          <text x="16" y="13" fill="#0f172a" fontSize="5" fontWeight="bold" textAnchor="middle" letterSpacing="0.2">TABLET</text>
          <circle cx="16" cy="18" r="0.5" fill="#0f172a" />
        </g>

        {/* Laptop/Computador Box with Text */}
        <g transform="translate(90, 112)">
          <rect x="2" y="0" width="36" height="21" rx="2.5" fill="#475569" stroke="#0f172a" strokeWidth="1.5" />
          <rect x="4" y="2" width="32" height="15" fill="#1e293b" />
          <text x="20" y="11" fill="#ffffff" fontSize="4.5" fontWeight="bold" textAnchor="middle" letterSpacing="0.1">COMPUTADOR</text>
          {/* Keyboard base */}
          <path d="M 0 21 L 40 21 L 43 25 L -3 25 Z" fill="#334155" stroke="#0f172a" strokeWidth="1.2" strokeLinejoin="round" />
          <line x1="16" y1="23" x2="24" y2="23" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Connecting Lines (Dotted) */}
        {/* Router to figures */}
        <path d="M 88 56 L 70 87" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        <path d="M 132 56 L 150 87" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

        {/* Green Character (Left) */}
        <g transform="translate(35, 74)">
          {/* Head */}
          <circle cx="20" cy="20" r="11" fill="#39cb62" stroke="#2a9147" strokeWidth="0.5" />
          {/* Neck */}
          <rect x="18" y="29" width="4" height="4" fill="#39cb62" />
          {/* Torso & arms */}
          <path d="M 8 41 C 8 33, 32 33, 32 41 L 31 66 C 31 68, 9 68, 9 66 Z" fill="#39cb62" stroke="#2a9147" strokeWidth="0.5" />
          {/* Left leg */}
          <rect x="13" y="66" width="5" height="18" fill="#39cb62" />
          <ellipse cx="12" cy="84" rx="6" ry="2.5" fill="#39cb62" />
          {/* Right leg */}
          <rect x="22" y="66" width="5" height="18" fill="#39cb62" />
          <ellipse cx="23" cy="84" rx="6" ry="2.5" fill="#39cb62" />
          {/* Left arm holding phone */}
          <path d="M 10 40 Q -2 48 10 54 Q 20 48 24 50" fill="none" stroke="#39cb62" strokeWidth="4.5" strokeLinecap="round" />
          {/* Right arm */}
          <path d="M 30 40 Q 42 45 40 54 Q 30 52 28 50" fill="none" stroke="#39cb62" strokeWidth="4.5" strokeLinecap="round" />
          {/* White smartphone details */}
          <rect x="24" y="42" width="5" height="10" rx="1" fill="#ffffff" stroke="#475569" strokeWidth="0.5" transform="rotate(10 24 42)" />
        </g>

        {/* Orange/Yellow Character (Right) */}
        <g transform="translate(145, 74)">
          {/* Head */}
          <circle cx="20" cy="20" r="11" fill="#facd2d" stroke="#d5a522" strokeWidth="0.5" />
          {/* Neck */}
          <rect x="18" y="29" width="4" height="4" fill="#facd2d" />
          {/* Torso & arms */}
          <path d="M 8 41 C 8 33, 32 33, 32 41 L 31 66 C 31 68, 9 68, 9 66 Z" fill="#facd2d" stroke="#d5a522" strokeWidth="0.5" />
          {/* Left leg */}
          <rect x="13" y="66" width="5" height="18" fill="#facd2d" />
          <ellipse cx="12" cy="84" rx="6" ry="2.5" fill="#facd2d" />
          {/* Right leg */}
          <rect x="22" y="66" width="5" height="18" fill="#facd2d" />
          <ellipse cx="23" cy="84" rx="6" ry="2.5" fill="#facd2d" />
          {/* Left arm */}
          <path d="M 10 40 Q -2 45 0 54 Q 10 52 12 50" fill="none" stroke="#facd2d" strokeWidth="4.5" strokeLinecap="round" />
          {/* Right arm holding phone */}
          <path d="M 30 40 Q 42 48 30 54 Q 20 48 16 50" fill="none" stroke="#facd2d" strokeWidth="4.5" strokeLinecap="round" />
          {/* White smartphone details */}
          <rect x="12" y="43" width="5" height="10" rx="1" fill="#ffffff" stroke="#475569" strokeWidth="0.5" transform="rotate(-10 12 43)" />
        </g>
      </svg>
    </div>
  );
}

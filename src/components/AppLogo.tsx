import React from 'react';

interface AppLogoProps {
  className?: string;
  mode?: 'full' | 'icon' | 'badge';
  size?: number;
}

export function AppLogo({ className = '', mode = 'icon', size }: AppLogoProps) {
  // Sizing defaults based on mode
  const currentSize = size || (mode === 'icon' ? 44 : mode === 'badge' ? 48 : 140);

  if (mode === 'badge') {
    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-[#090D1A] border border-slate-800/80 p-1 shadow-xl ${className}`} style={{ width: currentSize, height: currentSize }}>
        <AppLogo mode="icon" size={currentSize - 10} />
        <span className="absolute -top-1 -right-1 px-1.5 h-3.5 bg-blue-500 rounded-full border border-[#090D1A] flex items-center justify-center tracking-tight font-black text-[6.5px] text-white">
          LIVE
        </span>
      </div>
    );
  }

  // Standard icon or full modes render the beautifully crafted router vector icon.
  const aspectHeight = currentSize * (154 / 168);
  return (
    <div className={`flex items-center justify-center select-none ${className}`} style={{ width: currentSize, height: aspectHeight }}>
      <svg
        viewBox="16 20 168 154"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Antennas Feet/Supports - Deep Charcoal */}
        <rect x="36" y="90" width="20" height="28" rx="5" fill="#4d4d4d" stroke="#2a2a2a" strokeWidth="1.5" />
        <rect x="144" y="90" width="20" height="28" rx="5" fill="#4d4d4d" stroke="#2a2a2a" strokeWidth="1.5" />

        {/* Antennas Masts - High contrast light-gray/silver */}
        <rect x="38.5" y="22" width="15" height="68" rx="7.5" fill="#e5e7eb" stroke="#b5b7bb" strokeWidth="1" />
        <rect x="146.5" y="22" width="15" height="68" rx="7.5" fill="#e5e7eb" stroke="#b5b7bb" strokeWidth="1" />

        {/* Bottom Feet under the chassis */}
        <rect x="28" y="160" width="22" height="12" rx="6" fill="#444444" />
        <rect x="150" y="160" width="22" height="12" rx="6" fill="#444444" />

        {/* Main Chassis Body - Sleek dark gray anthracite */}
        <rect x="18" y="118" width="164" height="42" rx="10" fill="#323337" stroke="#202123" strokeWidth="1.5" />

        {/* Glowing Vibrant Blue Wifi Signal Waves */}
        <g id="wifi-waves">
          {/* Signal source dot */}
          <circle cx="100" cy="106" r="8.5" fill="#1d8bf1" />

          {/* Concentric Arc 1 (Small) */}
          <path
            d="M 85.3 91.3 A 20.8 20.8 0 0 1 114.7 91.3"
            stroke="#1d8bf1"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Concentric Arc 2 (Medium) */}
          <path
            d="M 74.5 80.5 A 36 36 0 0 1 125.5 80.5"
            stroke="#1d8bf1"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Concentric Arc 3 (Large) */}
          <path
            d="M 63.7 69.7 A 51.3 51.3 0 0 1 136.3 69.7"
            stroke="#1d8bf1"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Vibrant Blue Faceplate nested inside upper part of chassis */}
        <path
          d="M 36 118 h 128 v 8 a 8 8 0 0 1 -8 8 H 44 a 8 8 0 0 1 -8 -8 Z"
          fill="#1d8bf1"
        />

        {/* White Monospaced 'isu' text centered inside Blue Faceplate */}
        <text
          x="100"
          y="131"
          fill="#ffffff"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
          fontSize="17"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="2"
        >
          isu
        </text>

        {/* Custom Indicators Section under the Faceplate */}
        {/* Status Line Bar */}
        <rect x="46" y="143" width="79" height="4" rx="2" fill="#e5e7eb" opacity="0.9" />

        {/* LED 1 Left: Power (Golden Amber/Orange) */}
        <circle cx="36" cy="145" r="5" fill="#f59e0b" />

        {/* LED 2 Right: LAN Activity (Bright Green) */}
        <circle cx="139" cy="145" r="5" fill="#22c55e" />

        {/* LED 3 Right: Warning/External Connection (Vibrant Coral/Red) */}
        <circle cx="152" cy="145" r="5" fill="#ef4444" />
      </svg>
    </div>
  );
}

export function ShotZoneMapIcon() {
  return (
    <svg width="220" height="200" viewBox="0 0 220 200" fill="none" aria-label="Shot zone map">
      <path d="M 20,180 L 20,80 A 90,90 0 0,1 200,80 L 200,180 Z" stroke="#0F172A" strokeWidth="2.5" fill="#FFFFFF" />
      <path d="M 20,80 A 90,90 0 0,1 200,80 L 160,110 L 60,110 Z" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
      <path d="M 60,110 L 160,110 L 140,150 L 80,150 Z" fill="#0091FF" stroke="#0F172A" strokeWidth="1.5" />
      <path d="M 20,180 L 200,180 L 140,150 L 80,150 Z" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />
      <text x="110" y="170" fill="#FFFFFF" fontSize="14" fontWeight="800" textAnchor="middle">6</text>
      {[[35,45], [168,45], [48,70], [155,70], [35,98], [168,98], [75,102], [130,102], [102,125]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="16" height="12" stroke="#0091FF" strokeWidth="1.5" fill="none" />
      ))}
    </svg>
  );
}

export function RinkZoneOverlayIcon() {
  return (
    <svg className="mhn-rink-svg-overlay" viewBox="0 0 600 200" fill="none" aria-label="Rink zone overlay">
      <rect x="10" y="10" width="580" height="180" rx="30" stroke="#FCA5A5" strokeWidth="1.5" />
      <line x1="200" y1="10" x2="200" y2="190" stroke="#0091FF" strokeWidth="2" />
      <line x1="400" y1="10" x2="400" y2="190" stroke="#0091FF" strokeWidth="2" />
      <line x1="300" y1="10" x2="300" y2="190" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 4" />
      <circle cx="150" cy="100" r="30" stroke="#FCA5A5" strokeWidth="1" />
      <circle cx="450" cy="100" r="30" stroke="#FCA5A5" strokeWidth="1" />
    </svg>
  );
}

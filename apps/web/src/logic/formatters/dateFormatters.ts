export function formatDateDisplay(rawDate?: string | Date | null, fallback = ''): string {
  if (!rawDate) return fallback;
  try {
    const str = String(rawDate).trim();
    if (str.includes('T')) {
      return str.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch {
    // Return raw fallback if parsing fails
  }
  return fallback;
}

export function formatTimeAgo(rawDate?: string | Date | null): string {
  if (!rawDate) return 'Just now';
  try {
    const d = new Date(rawDate);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export function formatCareerPeriod(
  startMonth?: string,
  startYear?: string,
  endMonth?: string,
  endYear?: string,
  isCurrentPlaying?: boolean
): string {
  const startStr = `${startMonth || ''} ${startYear || ''}`.trim() || 'Start';
  if (isCurrentPlaying) {
    return `${startStr} - Present`;
  }
  const endStr = `${endMonth || ''} ${endYear || ''}`.trim() || 'Present';
  return `${startStr} - ${endStr}`;
}

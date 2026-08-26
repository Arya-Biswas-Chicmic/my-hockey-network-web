export interface NetworkUserItem {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  roleTag?: string;
  primaryRole?: string;
  position?: string;
  [key: string]: any;
}

export function selectFilteredConnections(connections: NetworkUserItem[], searchQuery?: string): NetworkUserItem[] {
  if (!connections || !Array.isArray(connections)) return [];
  if (!searchQuery || !searchQuery.trim()) return connections;

  const q = searchQuery.trim().toLowerCase();
  return connections.filter((conn) => {
    const name = `${conn.displayName || ''} ${conn.firstName || ''} ${conn.lastName || ''}`.toLowerCase();
    const city = (conn.city || '').toLowerCase();
    const role = (conn.roleTag || conn.primaryRole || conn.position || '').toLowerCase();
    return name.includes(q) || city.includes(q) || role.includes(q);
  });
}

import connectionsData from '@/demo-data/connections/connections.json';
import type { ConnectionMember } from '@/components/features/network/ConnectionsView';

export type ConnectionTab = ConnectionMember['type'];

const connectionDemoData = connectionsData as Readonly<Record<ConnectionTab, readonly ConnectionMember[]>>;

export function getConnectionDemoMembers(tab: ConnectionTab): readonly ConnectionMember[] {
  return connectionDemoData[tab];
}

export { connectionDemoData };

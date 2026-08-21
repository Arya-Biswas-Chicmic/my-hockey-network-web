export interface ManagedChild {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  dateOfBirth?: string;
  linkedAt?: string;
  avatarUrl?: string | null;
  accessLevel?: string;
}

export interface SupervisionControl {
  control: string;
  value: boolean | string;
  description?: string;
  configurable?: boolean;
}

export interface SupervisionLog {
  id: string;
  minorId: string;
  eventType: string;
  summary: string;
  createdAt: string;
}

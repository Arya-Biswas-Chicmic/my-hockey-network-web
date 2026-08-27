export interface UserProfileSummary {
  id: string;
  userId?: string;
  displayName: string;
  avatarUrl?: string;
  role?: string;
  bio?: string;
}

export interface UserAccount {
  id: string;
  email?: string;
  profile?: UserProfileSummary;
}

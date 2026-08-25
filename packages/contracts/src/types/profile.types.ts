export interface CareerEntry {
  id: string;
  groupId: string | null;
  teamName: string | null;
  teamLogoUrl: string | null;
  position: string | null;
  location: string | null;
  note: string | null;
  startDate: string | null;
  endDate: string | null;
  verified: boolean;
}

export interface CreateCareerEntryDto {
  groupId?: string | null;
  teamName?: string | null;
  position?: string | null;
  location?: string | null;
  note?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateCareerEntryDto {
  groupId?: string | null;
  teamName?: string | null;
  position?: string | null;
  location?: string | null;
  note?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ProfileReadResponse {
  profile: {
    profileId: string;
    displayName: string;
    avatarUrl: string | null;
    position?: string | null;
    jerseyNumber?: number | string | null;
    roleTag?: string | null;
    teamName?: string | null;
    teamLogo?: string | null;
    location?: string | null;
    bio?: string | null;
    age?: number | null;
    careerEntries?: CareerEntry[] | null;
    isSelf?: boolean;
    viewerTier?: string;
    [key: string]: any;
  };
}

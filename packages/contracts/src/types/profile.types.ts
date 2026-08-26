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
    name?: string;
    avatarUrl: string | null;
    coverImageUrl?: string | null;
    coverUrl?: string | null;
    coverImageKey?: string | null;
    type?: string | null;
    profileType?: string | null;
    primaryRole?: string | null;
    city?: string | null;
    position?: string | null;
    jerseyNumber?: number | string | null;
    roleTag?: string | null;
    teamName?: string | null;
    teamLogo?: string | null;
    location?: string | null;
    bio?: string | null;
    dateOfBirth?: string | null;
    dob?: string | null;
    genderCategory?: string | null;
    age?: number | null;
    careerEntries?: CareerEntry[] | null;
    career?: CareerEntry[] | null;
    team?: string | null;
    academyName?: string | null;
    currentTeam?: string | null;
    isSelf?: boolean;
    viewerTier?: string;
  };
}

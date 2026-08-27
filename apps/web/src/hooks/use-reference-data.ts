import { QueryKeys } from '@my-hockey-network/contracts';
import { useQuery } from '@/query';
import { webApiClient } from '@/platform/api-client';

export interface ReferenceDataResponse {
  positions: Array<{ value: string; label: string }>;
  academies: Array<{ id: string; name: string; logoUrl?: string; city?: string }>;
  teams: Array<{ id: string; name: string; logoUrl?: string }>;
}

const DEFAULT_REFERENCE_DATA: ReferenceDataResponse = {
  positions: [
    { value: 'Center', label: 'Center' },
    { value: 'Left Wing', label: 'Left Wing' },
    { value: 'Right Wing', label: 'Right Wing' },
    { value: 'Defense', label: 'Defense' },
    { value: 'Goaltender', label: 'Goaltender' },
  ],
  academies: [],
  teams: [],
};

async function fetchReferenceData(): Promise<ReferenceDataResponse> {
  try {
    const data = await webApiClient.request<Partial<ReferenceDataResponse>>('/reference/data');
    return {
      positions: data.positions?.length ? data.positions : DEFAULT_REFERENCE_DATA.positions,
      academies: data.academies?.length ? data.academies : DEFAULT_REFERENCE_DATA.academies,
      teams: data.teams?.length ? data.teams : DEFAULT_REFERENCE_DATA.teams,
    };
  } catch {
    return DEFAULT_REFERENCE_DATA;
  }
}

export function useReferenceData() {
  const { data, isLoading, error } = useQuery<ReferenceDataResponse>(
    QueryKeys.REFERENCE_DATA,
    fetchReferenceData,
    { staleTime: 10 * 60 * 1000 } // 10 minutes cache
  );

  return {
    positions: data?.positions ?? DEFAULT_REFERENCE_DATA.positions,
    academies: data?.academies ?? DEFAULT_REFERENCE_DATA.academies,
    teams: data?.teams ?? DEFAULT_REFERENCE_DATA.teams,
    isLoading,
    error,
  };
}

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
  academies: [
    { id: '1', name: 'HC Bloemendaal', logoUrl: '/HC.png', city: 'Bloemendaal, Netherlands' },
    { id: '2', name: 'Toronto Hockey Academy', logoUrl: '/userPlaceholder.png', city: 'Toronto, Canada' },
    { id: '3', name: 'Boston Elite Hockey', logoUrl: '/userPlaceholder.png', city: 'Boston, MA' },
  ],
  teams: [
    { id: '101', name: 'HC Bloemendaal', logoUrl: '/HC.png' },
    { id: '102', name: 'Toronto Red Wings', logoUrl: '/userPlaceholder.png' },
    { id: '103', name: 'Boston Bruins Academy', logoUrl: '/userPlaceholder.png' },
  ],
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

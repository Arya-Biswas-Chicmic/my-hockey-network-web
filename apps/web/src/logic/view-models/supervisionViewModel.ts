import { formatDisplayName, formatUserAvatar } from '../formatters/userFormatters';
import { selectFormattedSupervisionCards, FormattedSupervisionCard, SupervisionRequestItem } from '../selectors/supervisionSelectors';

export interface FormattedWardItem {
  id: string;
  name: string;
  avatar: string;
  age: string;
}

export interface SupervisionViewModel {
  wards: FormattedWardItem[];
  formattedRequests: FormattedSupervisionCard[];
  hasPendingRequests: boolean;
}

export function createSupervisionViewModel(wardsList: any[], requestsList: SupervisionRequestItem[]): SupervisionViewModel {
  const wards: FormattedWardItem[] = Array.isArray(wardsList)
    ? wardsList.map((ward) => ({
        id: ward.id,
        name: formatDisplayName(ward.name || ward.displayName),
        avatar: formatUserAvatar(ward.avatar || ward.avatarUrl),
        age: ward.age ? String(ward.age) : 'Youth',
      }))
    : [];

  const formattedRequests = selectFormattedSupervisionCards(requestsList);

  return {
    wards,
    formattedRequests,
    hasPendingRequests: formattedRequests.length > 0,
  };
}

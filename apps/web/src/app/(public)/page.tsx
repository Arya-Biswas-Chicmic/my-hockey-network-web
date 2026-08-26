import { redirect } from 'next/navigation';

import { paths } from '@/constants/paths';

export default function RootPage() {
  redirect(paths.auth.onboarding);
}

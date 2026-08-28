import { BrandLoader } from '@/components/common/BrandLoader';

/**
 * Root transition placeholder. Deliberately the brand loader and NOT a
 * route-shaped skeleton: anything at this level also covers `(auth)` and
 * `(public)`, so a sidebar+feed skeleton here would show signed-out visitors an
 * app they are not in. Each route group's own `loading.tsx` shimmers its real
 * layout once the group is known.
 */
export default function Loading() {
  return <BrandLoader fullScreen />;
}

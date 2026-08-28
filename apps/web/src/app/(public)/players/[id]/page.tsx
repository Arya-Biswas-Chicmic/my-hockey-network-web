import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

import { getPublicProfile } from '@/infrastructure/server/public-profile';
import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';
import { FallbackImage } from '@/components/ui/fallback-image';
import { Button } from '@/components/ui/button';
import { paths } from '@/constants/paths';

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

// Public profiles change occasionally (new career entries, avatar updates)
// but don't need per-request freshness — bounded staleness via time-based
// ISR. See docs/WEB_SEO_AND_RENDERING_STRATEGY.md "Public, changing content".
export const revalidate = 300;

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicProfile(id);

  if (!profile) {
    return { robots: { index: false, follow: false } };
  }

  const name = profile.displayName || profile.name || 'Hockey Network Member';
  const description = profile.bio?.trim() || `${name}'s profile on My Hockey Network.`;

  return {
    title: name,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title: name,
      description,
      type: 'profile',
      images: profile.avatarUrl ? [resolveMediaUrl(profile.avatarUrl)] : undefined,
    },
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { id } = await params;
  const profile = await getPublicProfile(id);

  if (!profile) notFound();

  const name = profile.displayName || profile.name || 'Hockey Network Member';
  const avatarUrl = resolveMediaUrl(profile.avatarUrl);
  const coverUrl = resolveCoverUrl(profile.coverImageUrl ?? profile.coverUrl);
  const teamName = profile.teamName || profile.currentTeam || profile.team;
  const location = profile.city || profile.location;

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="relative h-48 w-full overflow-hidden bg-muted sm:h-64">
        <FallbackImage src={coverUrl} alt="" fill className="object-cover" fallbackSrc="/cover.webp" />
      </div>

      <div className="mx-auto max-w-2xl px-6">
        <div className="relative -mt-16 size-32 overflow-hidden rounded-full border-4 border-background bg-muted">
          <FallbackImage src={avatarUrl} alt={name} fill className="object-cover" />
        </div>

        <h1 className="mt-4 text-2xl font-bold text-foreground">{name}</h1>

        {(teamName || location) && (
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {teamName ? <span>{teamName}</span> : null}
            {location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} aria-hidden="true" />
                {location}
              </span>
            ) : null}
          </p>
        )}

        {profile.position ? (
          <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            {profile.position}
          </span>
        ) : null}

        {profile.bio ? <p className="mt-4 text-sm text-foreground">{profile.bio}</p> : null}

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to see {name.split(' ')[0]}&apos;s full profile, career history, and connect.
          </p>
          <Link href={paths.auth.onboarding}>
            <Button variant="solid" size="lg" className="mt-4">Sign In</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

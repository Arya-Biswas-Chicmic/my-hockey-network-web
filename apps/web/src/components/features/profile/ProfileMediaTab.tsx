'use client';

import Image from 'next/image';

// Media gallery has no backend list endpoint yet (only signed-upload URLs exist, see
// packages/core/src/api/mediaApi.ts) — hardcoded pending that API, per project policy: use
// hardcoded data where no API exists yet, replace gradually as APIs land.
const MEDIA_PHOTOS = [
  '/playHockey.png',
  '/event1.png',
  '/event2.png',
  '/mhnStars.png',
  '/event3.png',
  '/event4.png',
];

/** Profile > Media tab. Extracted from `screens/profile-page.tsx`. */
export function ProfileMediaTab() {
  return (
    <div className="mhn-profile-tab-content-card-full mhn-media-card-override">
      <div className="mhn-media-grid">
        {MEDIA_PHOTOS.map((photo, idx) => (
          <div key={idx} className="mhn-media-item-card">
            <Image src={photo} alt={`Media ${idx + 1}`} fill className="mhn-media-img" />
          </div>
        ))}
      </div>
    </div>
  );
}

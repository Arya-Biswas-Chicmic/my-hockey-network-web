'use client';

import { useState } from 'react';
import { Expand, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { FallbackImage } from '@/components/ui/fallback-image';
import { profileDemoData } from '@/demo-data/profile';

export function ProfileMediaTab() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section aria-label="Profile media" className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg border border-auth-stroke bg-auth-field p-1">
      {profileDemoData.media.map((item) => (
        <Button key={item.id} onClick={() => setSelectedImage(item.src)} className="group relative aspect-square min-h-0 overflow-hidden bg-secondary" aria-label={`Open ${item.alt}`}>
          <FallbackImage src={item.src} alt={item.alt} fill sizes="(max-width: 520px) 50vw, 156px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-background/75 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"><Expand size={14} aria-hidden="true" /></span>
        </Button>
      ))}
      {selectedImage ? (
        <div className="mhn-modal-overlay" role="dialog" aria-modal="true" aria-label="Media preview" onClick={() => setSelectedImage(null)}>
          <div className="relative h-[min(82vh,760px)] w-[min(92vw,900px)] overflow-hidden rounded-xl bg-black" onClick={(event) => event.stopPropagation()}>
            <FallbackImage src={selectedImage} alt="Selected profile media" fill sizes="(max-width: 768px) 92vw, 720px" className="object-contain" />
            <Button onClick={() => setSelectedImage(null)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/80 text-foreground" aria-label="Close media preview"><X size={18} /></Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

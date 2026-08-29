import { FallbackImage } from '@/components/ui/fallback-image';
import type { DemoGroupDetail } from '@/demo-data/groups';

interface GroupDetailSidebarProps {
  group: DemoGroupDetail;
}

export function GroupDetailSidebar({ group }: Readonly<GroupDetailSidebarProps>) {
  return (
    <aside className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-base font-bold text-foreground">Admin</h2>
        <div className="flex items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
            <FallbackImage src={group.admin.avatar} alt={group.admin.name} fill sizes="44px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{group.admin.name}</p>
            <p className="text-xs text-muted-foreground">{group.admin.role}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-base font-bold text-foreground">Groups You Might Be Interested In</h2>
        <div className="space-y-4">
          {group.suggestedGroups.map((suggested) => (
            <div key={suggested.id} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <FallbackImage src={suggested.image} alt={suggested.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{suggested.name}</p>
                <p className="text-xs text-muted-foreground">{suggested.members}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

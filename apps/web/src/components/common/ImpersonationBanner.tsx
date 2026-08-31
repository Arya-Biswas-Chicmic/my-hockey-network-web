"use client";

import { useImpersonationStore } from "@/stores/impersonation-store";
import { Button } from "@/components/common/Button";

export function ImpersonationBanner() {
  const { impersonatingProfileId, impersonatingName, stopImpersonation } =
    useImpersonationStore();

  if (!impersonatingProfileId || !impersonatingName) return null;

  return (
    <div className="w-full fixed bg-[#e8b652a8]/75 text-black px-6 py-2.5 flex items-center justify-center gap-10 font-medium text-sm shadow-md shrink-0 select-none z-[9999]">
      <div className="flex items-center gap-2">
        <span className="text-base" role="img" aria-label="eye">
          👁️
        </span>
        <span>
          You are currently operating on behalf of{" "}
          <strong>{impersonatingName}</strong>
        </span>
      </div>
      <Button
        type="button"
        onClick={stopImpersonation}
        className="bg-black text-white hover:bg-black/80 transition-colors h-7 px-3 py-0 text-xs rounded font-bold border-none"
      >
        End Session
      </Button>
    </div>
  );
}

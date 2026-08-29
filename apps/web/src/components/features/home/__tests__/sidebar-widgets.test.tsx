// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { InviteGrowWidget } from "@/components/features/home/InviteGrowWidget";
import { UpcomingEventCard } from "@/components/features/home/UpcomingEventCard";

afterEach(cleanup);

describe("Home sidebar Figma widgets", () => {
  it("renders the exact Invite & Grow asset and accessible CTA", () => {
    const onInviteClick = vi.fn();
    const { container } = render(
      <InviteGrowWidget onInviteClick={onInviteClick} />,
    );

    const illustration = container.querySelector("img");
    expect(illustration?.getAttribute("src")).toContain(
      "invite-grow-illustration.png",
    );

    fireEvent.click(screen.getByRole("button", { name: "Invite Now" }));
    expect(onInviteClick).toHaveBeenCalledTimes(1);
  });

  it("supports mouse and keyboard activation for the upcoming event", () => {
    const onClick = vi.fn();
    render(
      <UpcomingEventCard
        event={{
          id: "event-1",
          month: "MAY",
          day: "27",
          title: "Team Practice",
          time: "5:00 PM - 7:00 PM",
          location: "Toronto",
        }}
        onClick={onClick}
      />,
    );

    const card = screen.getByRole("button");
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: "Enter" });
    expect(onClick).toHaveBeenNthCalledWith(1, "event-1");
    expect(onClick).toHaveBeenNthCalledWith(2, "event-1");
  });

  it("keeps inverse text semantic and matches the Figma widget geometry", () => {
    const stylesheet = readFileSync(resolve("apps/web/src/index.css"), "utf8");
    const directBackgroundAsText = /(^|[\s{;])color:\s*var\(--color-background\);/m;
    const dateRule = stylesheet.match(/\.mhn-event-date-box\s*\{([^}]*)\}/)?.[1];
    const illustrationRule = stylesheet.match(
      /\.mhn-invite-grow-illustration\s*\{([^}]*)\}/,
    )?.[1];

    expect(stylesheet).not.toMatch(directBackgroundAsText);
    expect(dateRule).toMatch(/width:\s*74px/);
    expect(dateRule).toMatch(/height:\s*84px/);
    expect(dateRule).toMatch(
      /linear-gradient\(90deg,\s*#053769 0%,\s*#2e75bb 100%\)/,
    );
    expect(dateRule).toMatch(/color:\s*var\(--color-primary-foreground\)/);
    expect(illustrationRule).toMatch(/width:\s*136px/);
    expect(illustrationRule).toMatch(/height:\s*126px/);
    expect(illustrationRule).toMatch(/top:\s*16px/);
    expect(illustrationRule).toMatch(/right:\s*13px/);
  });
});

// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { Switch } from "@/components/ui/switch";

afterEach(cleanup);

describe("Switch", () => {
  it("exposes the inactive state and activates through its click handler", () => {
    const onClick = vi.fn();
    render(
      <Switch
        checked={false}
        aria-label="Message notifications"
        onClick={onClick}
      />,
    );

    const control = screen.getByRole("switch", {
      name: "Message notifications",
    });
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(control.className).not.toContain("mhn-switch--checked");

    control.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the shared active state and respects disabled behavior", () => {
    const onClick = vi.fn();
    render(
      <Switch checked aria-label="Dark theme" disabled onClick={onClick} />,
    );

    const control = screen.getByRole("switch", { name: "Dark theme" });
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.className).toContain("mhn-switch--checked");
    expect((control as HTMLButtonElement).disabled).toBe(true);

    control.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("updates its accessible state through a controlled interaction", () => {
    function SwitchHarness() {
      const [checked, setChecked] = useState(false);

      return (
        <Switch
          checked={checked}
          aria-label="Activity notifications"
          onClick={() => setChecked((current) => !current)}
        />
      );
    }

    render(<SwitchHarness />);

    const control = screen.getByRole("switch", {
      name: "Activity notifications",
    });
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("keeps the thumb within the 40x22 track in both visual states", () => {
    const stylesheet = readFileSync(resolve("apps/web/src/index.css"), "utf8");

    const trackRule = stylesheet.match(/\.mhn-switch\s*\{([^}]*)\}/)?.[1];
    const thumbRule = stylesheet.match(/\.mhn-switch-thumb\s*\{([^}]*)\}/)?.[1];
    const checkedThumbRule = stylesheet.match(
      /\.mhn-switch--checked \.mhn-switch-thumb\s*\{([^}]*)\}/,
    )?.[1];

    expect(trackRule).toMatch(/width:\s*40px/);
    expect(trackRule).toMatch(/height:\s*22px/);
    expect(trackRule).toMatch(/overflow:\s*hidden/);
    expect(thumbRule).toMatch(/position:\s*absolute/);
    expect(thumbRule).toMatch(/top:\s*2px/);
    expect(thumbRule).toMatch(/left:\s*2px/);
    expect(thumbRule).toMatch(/width:\s*18px/);
    expect(thumbRule).toMatch(/height:\s*18px/);
    expect(checkedThumbRule).toMatch(/translateX\(18px\)/);
  });
});

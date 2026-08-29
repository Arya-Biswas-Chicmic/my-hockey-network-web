// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { HelpPage } from "@/screens/help-page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

afterEach(cleanup);

describe("HelpPage", () => {
  it("keeps the search in the top bar and switches the right panel by section", () => {
    render(<HelpPage />);

    expect(
      screen.getByRole("textbox", { name: "Search help topics and FAQs" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "FAQ", pressed: true }),
    ).toBeTruthy();
    expect(screen.getByText(/Frequently Asked Questions/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Support" }));
    expect(screen.getByText(/Report a Problem \/ Submit Ticket/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Info" }));
    expect(screen.getByText("Direct Email Support")).toBeTruthy();
    expect(screen.getByText("Support Operating Hours")).toBeTruthy();
    expect(screen.getByText("Legal & Guidelines")).toBeTruthy();
  });

  it("returns to the FAQ panel when the top-bar search is used", () => {
    render(<HelpPage />);

    fireEvent.click(screen.getByRole("button", { name: "Support" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search help topics and FAQs" }),
      {
        target: { value: "profile" },
      },
    );

    expect(
      screen.getByRole("button", { name: "FAQ", pressed: true }),
    ).toBeTruthy();
    expect(screen.getByText(/Frequently Asked Questions/)).toBeTruthy();
  });
});

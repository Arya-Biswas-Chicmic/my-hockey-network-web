# Settings and Help & Support design QA

Last reviewed: 2026-08-29

References: the supplied Settings/Help screenshots plus the two switch-boundary defect captures.
Implementation: authenticated local `/settings`, `/help`, and profile-menu states in dark theme,
verified in Chrome at a 1352×727 CSS-pixel viewport with device scale 1.

## Result

No actionable P0, P1, or P2 visual defects remain.

## Verified

- Settings opens on Notification and follows the compact two-panel Figma composition with flat,
  divider-separated rows rather than individual filled cards.
- Active switches use a blue track and white thumb; inactive switches use a light-gray track and
  white thumb. Computed dimensions are consistently 40×22 across Settings, Supervision,
  parent/player protection, and the profile-menu theme control.
- Every rendered Settings thumb measures 18×18, remains 2px from the track edge in its resting state,
  and stays fully inside the 40×22 track in both checked and unchecked states. The profile-menu
  theme switch passed the same bounding-rectangle assertion.
- Help & Support keeps search in the top bar and uses the same two-panel shell as Settings.
- FAQ shows category filters and a scrolling accordion list; Support shows the existing validated
  ticket form; Info shows direct email, operating hours, and legal/guideline links.
- FAQ, Support, and Info states were exercised in the authenticated browser session. Search returns
  the view to FAQ, and FAQ accordion controls expose their expanded state.
- The desktop viewport has no horizontal document overflow. Responsive rules stack the panels and
  turn the left navigation into a horizontal tab row at the mobile breakpoint.
- Focused component/screen tests, typecheck, lint, documentation checks, the component gate, and the
  full `pnpm verify` pipeline pass. The full suite contains 301 tests across 45 files.

## Evidence

- Reference images: `/Users/vinodgoswami/Desktop/image-1787987132392.webp`,
  `/Users/vinodgoswami/Desktop/image-1787987140360.png`, and
  `/Users/vinodgoswami/Desktop/image-1787987146774.png`, plus the uploaded defect captures
  `Screenshot 2026-08-29 at 12.46.45 PM.png` (674×1362) and
  `Screenshot 2026-08-29 at 12.47.08 PM.png` (2342×1394).
- Implementation previews: `http://localhost:3000/settings` and `http://localhost:3000/help` in the
  active authenticated Chrome session.
- Implementation captures: `/private/tmp/mhn-settings-switch-boundaries.png` and
  `/private/tmp/mhn-profile-switch-boundaries.png`, both 1352×727 pixels at 1352×727 CSS pixels.
- Full-view comparison checked the Settings panel and profile dropdown composition. Focused-region
  comparison checked track/thumb boundaries because the reported mismatch was control-level.
- Primary interaction smoke test toggled Activity notifications off→on, asserted the active thumb
  remained inside the track, then restored the original off state.

## Comparison history

- Earlier P2: inherited `justify-content: center` from the shared Button primitive centered the thumb
  before the checked-state 18px translation, making the active thumb visibly overhang the track.
- Fix: position the thumb absolutely at `top: 2px; left: 2px`, retain the exact 18px checked travel,
  and add `overflow: hidden` to the track as a defensive invariant.
- Post-fix evidence: Settings checked bounds are 1053–1093 for the track and 1073–1091 for the thumb;
  unchecked bounds are 1053–1093 and 1055–1073. The profile-menu checked bounds are 239–279 and
  259–277. All top/bottom bounds also remain within the track.

The development overlay still reports pre-existing image/extension warnings (including injected
browser-extension attributes). They are unrelated to this scoped implementation and did not produce
an application runtime failure.

final result: passed
